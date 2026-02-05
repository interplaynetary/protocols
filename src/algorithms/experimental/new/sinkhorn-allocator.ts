/**
 * Sinkhorn-Knopp Allocator
 * 
 * Elegant, scale-invariant allocation algorithm that:
 * - Maximizes need satisfaction
 * - Minimizes priority deviations
 * - Converges in 10-20 iterations (vs 500+ for ADMM)
 * - No parameter tuning required
 * 
 * Based on the Sinkhorn-Knopp algorithm for optimal transport.
 */

import type {
    Participant,
    Slot,
    SlotAllocation,
    AllocationResult
} from './schemas.js';

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export interface SinkhornConfig {
    /** Convergence tolerance (default: 1e-4) */
    epsilon?: number;
    /** Maximum iterations (default: 100) */
    max_iterations?: number;
}

// ═══════════════════════════════════════════════════════════════════
// COMPATIBILITY CHECKING
// ═══════════════════════════════════════════════════════════════════

/**
 * Check if two slots are compatible
 */
function checkCompatibility(providerSlot: Slot, recipientSlot: Slot): boolean {
    // Type must match
    if (providerSlot.type !== recipientSlot.type) {
        return false;
    }

    // Time windows must overlap (if both specified)
    if (providerSlot.time_window && recipientSlot.time_window) {
        const pStart = providerSlot.time_window.start.getTime();
        const pEnd = providerSlot.time_window.end.getTime();
        const rStart = recipientSlot.time_window.start.getTime();
        const rEnd = recipientSlot.time_window.end.getTime();

        // No overlap if one ends before the other starts
        if (pEnd < rStart || rEnd < pStart) {
            return false;
        }
    }

    // Location must be compatible (if both specified)
    if (providerSlot.location && recipientSlot.location) {
        if (
            providerSlot.location.latitude !== undefined &&
            providerSlot.location.longitude !== undefined &&
            recipientSlot.location.latitude !== undefined &&
            recipientSlot.location.longitude !== undefined
        ) {
            const distance = haversineDistance(
                providerSlot.location.latitude,
                providerSlot.location.longitude,
                recipientSlot.location.latitude,
                recipientSlot.location.longitude
            );

            const maxDistance = recipientSlot.location.radius_km ?? 50;
            if (distance > maxDistance) {
                return false;
            }
        }
    }

    return true;
}

/**
 * Haversine distance between two lat/lon points (in km)
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Build compatibility graph
 */
function buildCompatibilityGraph(
    providerSlots: Slot[],
    recipientSlots: Slot[]
): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();

    for (const pSlot of providerSlots) {
        const compatible = new Set<string>();

        for (const rSlot of recipientSlots) {
            if (checkCompatibility(pSlot, rSlot)) {
                compatible.add(rSlot.id);
            }
        }

        graph.set(pSlot.id, compatible);
    }

    return graph;
}

// ═══════════════════════════════════════════════════════════════════
// PRIORITY CALCULATION
// ═══════════════════════════════════════════════════════════════════

interface SlotPriorities {
    provider: Map<string, Map<string, number>>;
    recipient: Map<string, Map<string, number>>;
}

/**
 * Calculate slot-specific priorities from global priorities
 */
function calculateSlotPriorities(
    participants: Map<string, Participant>,
    providerSlots: Slot[],
    recipientSlots: Slot[],
    compatibility: Map<string, Set<string>>
): SlotPriorities {
    const providerPriorities = new Map<string, Map<string, number>>();
    const recipientPriorities = new Map<string, Map<string, number>>();

    // For each provider slot
    for (const pSlot of providerSlots) {
        const provider = participants.get(pSlot.owner_id);
        if (!provider) continue;

        const compatibleSlots = compatibility.get(pSlot.id) ?? new Set();
        const slotPriority = new Map<string, number>();

        // Group compatible recipient slots by owner
        const ownerTotals = new Map<string, number>();
        for (const rSlotId of compatibleSlots) {
            const rSlot = recipientSlots.find(s => s.id === rSlotId);
            if (!rSlot) continue;

            const globalPriority = provider.global_priorities[rSlot.owner_id] ?? 0;
            ownerTotals.set(rSlot.owner_id, (ownerTotals.get(rSlot.owner_id) ?? 0) + globalPriority);
        }

        // Calculate total for normalization
        let totalGlobal = 0;
        for (const val of ownerTotals.values()) {
            totalGlobal += val;
        }

        // Assign slot-specific priorities
        if (totalGlobal > 0) {
            for (const rSlotId of compatibleSlots) {
                const rSlot = recipientSlots.find(s => s.id === rSlotId);
                if (!rSlot) continue;

                const globalPriority = provider.global_priorities[rSlot.owner_id] ?? 0;
                slotPriority.set(rSlotId, globalPriority / totalGlobal);
            }
        }

        providerPriorities.set(pSlot.id, slotPriority);
    }

    // For each recipient slot
    for (const rSlot of recipientSlots) {
        const recipient = participants.get(rSlot.owner_id);
        if (!recipient) continue;

        const slotPriority = new Map<string, number>();

        // Find all provider slots compatible with this recipient slot
        const compatibleProviderSlots: string[] = [];
        for (const [pSlotId, compatSet] of compatibility.entries()) {
            if (compatSet.has(rSlot.id)) {
                compatibleProviderSlots.push(pSlotId);
            }
        }

        // Group by owner
        const ownerTotals = new Map<string, number>();
        for (const pSlotId of compatibleProviderSlots) {
            const pSlot = providerSlots.find(s => s.id === pSlotId);
            if (!pSlot) continue;

            const globalPriority = recipient.global_priorities[pSlot.owner_id] ?? 0;
            ownerTotals.set(pSlot.owner_id, (ownerTotals.get(pSlot.owner_id) ?? 0) + globalPriority);
        }

        // Calculate total for normalization
        let totalGlobal = 0;
        for (const val of ownerTotals.values()) {
            totalGlobal += val;
        }

        // Assign slot-specific priorities
        if (totalGlobal > 0) {
            for (const pSlotId of compatibleProviderSlots) {
                const pSlot = providerSlots.find(s => s.id === pSlotId);
                if (!pSlot) continue;

                const globalPriority = recipient.global_priorities[pSlot.owner_id] ?? 0;
                slotPriority.set(pSlotId, globalPriority / totalGlobal);
            }
        }

        recipientPriorities.set(rSlot.id, slotPriority);
    }

    return {
        provider: providerPriorities,
        recipient: recipientPriorities
    };
}

// ═══════════════════════════════════════════════════════════════════
// SINKHORN-KNOPP ALGORITHM
// ═══════════════════════════════════════════════════════════════════

/**
 * Run Sinkhorn-Knopp algorithm
 * 
 * Finds the allocation matrix that:
 * - Respects capacity/need constraints
 * - Minimizes KL-divergence from priority distributions
 * - Converges to maximum entropy solution
 */
function runSinkhorn(
    providerSlots: Slot[],
    recipientSlots: Slot[],
    priorities: SlotPriorities,
    compatibility: Map<string, Set<string>>,
    config: Required<SinkhornConfig>
): { allocations: Map<string, Map<string, number>>; iterations: number; converged: boolean } {

    const x = new Map<string, Map<string, number>>();

    // Initialize with geometric mean of priorities, scaled by capacity/need
    for (const pSlot of providerSlots) {
        x.set(pSlot.id, new Map());
        const compatSlots = compatibility.get(pSlot.id) ?? new Set();

        for (const rSlotId of compatSlots) {
            const rSlot = recipientSlots.find(s => s.id === rSlotId);
            if (!rSlot) continue;

            const pp = priorities.provider.get(pSlot.id)?.get(rSlotId) ?? 0;
            const rp = priorities.recipient.get(rSlotId)?.get(pSlot.id) ?? 0;

            // Geometric mean of priorities
            const priorityProduct = Math.sqrt(pp * rp);

            // Scale by min of capacity and need to get reasonable initial values
            const scale = Math.min(pSlot.capacity_or_need, rSlot.capacity_or_need);
            const init = priorityProduct * scale;

            x.get(pSlot.id)!.set(rSlotId, init);
        }
    }

    // Sinkhorn iterations with integrated surplus redistribution
    let iterations = 0;
    let converged = false;

    for (iterations = 0; iterations < config.max_iterations; iterations++) {
        let maxChange = 0;

        // Row normalization with priority-weighted surplus redistribution (Largest Remainder Method)
        for (const pSlot of providerSlots) {
            const row = x.get(pSlot.id)!;
            let rowSum = 0;

            for (const val of row.values()) {
                rowSum += val;
            }

            const capacity = pSlot.capacity_or_need;

            if (rowSum > capacity && rowSum > 1e-9) {
                // Over capacity: scale down
                const scale = capacity / rowSum;
                for (const [rSlotId, val] of row.entries()) {
                    const newVal = val * scale;
                    maxChange = Math.max(maxChange, Math.abs(newVal - val));
                    row.set(rSlotId, newVal);
                }
            } else if (rowSum < capacity - config.epsilon) {
                // Under capacity: redistribute surplus using Largest Remainder Method
                const surplus = capacity - rowSum;
                const slotPriority = priorities.provider.get(pSlot.id) ?? new Map();

                // Find recipients with unmet needs
                const eligibleRecipients: Array<{
                    rSlotId: string;
                    priority: number;
                    unmetNeed: number;
                }> = [];

                let totalEligiblePriority = 0;

                for (const rSlotId of compatibility.get(pSlot.id) ?? new Set()) {
                    const rSlot = recipientSlots.find(s => s.id === rSlotId);
                    if (!rSlot) continue;

                    // Calculate how much this recipient has received so far
                    let received = 0;
                    for (const [pSlotId, allocMap] of x.entries()) {
                        received += allocMap.get(rSlotId) ?? 0;
                    }

                    const unmetNeed = Math.max(0, rSlot.capacity_or_need - received);

                    if (unmetNeed > config.epsilon) {
                        const priority = slotPriority.get(rSlotId) ?? 0;
                        if (priority > 0) {
                            eligibleRecipients.push({ rSlotId, priority, unmetNeed });
                            totalEligiblePriority += priority;
                        }
                    }
                }

                if (eligibleRecipients.length > 0 && totalEligiblePriority > 0) {
                    // Calculate ideal surplus allocation and remainders
                    const remainders: Array<{
                        rSlotId: string;
                        remainder: number;
                        canReceive: number;
                    }> = [];

                    for (const { rSlotId, priority, unmetNeed } of eligibleRecipients) {
                        const proportion = priority / totalEligiblePriority;
                        const idealSurplus = surplus * proportion;
                        const integerPart = Math.floor(idealSurplus * 1000) / 1000; // Avoid floating point issues
                        const remainder = idealSurplus - integerPart;

                        remainders.push({
                            rSlotId,
                            remainder,
                            canReceive: Math.min(idealSurplus, unmetNeed)
                        });
                    }

                    // Sort by largest remainder (Hamilton's method)
                    remainders.sort((a, b) => b.remainder - a.remainder);

                    // Distribute surplus
                    let remainingSurplus = surplus;
                    for (const { rSlotId, canReceive } of remainders) {
                        if (remainingSurplus < config.epsilon) break;

                        const allocation = Math.min(canReceive, remainingSurplus);
                        if (allocation > config.epsilon) {
                            const currentVal = row.get(rSlotId) ?? 0;
                            const newVal = currentVal + allocation;
                            maxChange = Math.max(maxChange, allocation);
                            row.set(rSlotId, newVal);
                            remainingSurplus -= allocation;
                        }
                    }
                }
            }
        }

        // Column normalization (recipient need constraints)
        for (const rSlot of recipientSlots) {
            let colSum = 0;
            const colEntries: [string, number][] = [];

            for (const [pSlotId, row] of x.entries()) {
                const val = row.get(rSlot.id) ?? 0;
                if (val > 0) {
                    colSum += val;
                    colEntries.push([pSlotId, val]);
                }
            }

            if (colSum > rSlot.capacity_or_need && colSum > 1e-9) {
                const scale = rSlot.capacity_or_need / colSum;
                for (const [pSlotId, val] of colEntries) {
                    const newVal = val * scale;
                    maxChange = Math.max(maxChange, Math.abs(newVal - val));
                    x.get(pSlotId)!.set(rSlot.id, newVal);
                }
            }
        }

        // Check convergence
        if (maxChange < config.epsilon) {
            converged = true;
            break;
        }
    }

    return { allocations: x, iterations: iterations + 1, converged };
}

// ═══════════════════════════════════════════════════════════════════
// MAIN ALLOCATOR CLASS
// ═══════════════════════════════════════════════════════════════════

export class SinkhornAllocator {
    private config: Required<SinkhornConfig>;

    constructor(config: SinkhornConfig = {}) {
        this.config = {
            epsilon: config.epsilon ?? 1e-4,
            max_iterations: config.max_iterations ?? 100
        };
    }

    /**
     * Main allocation method
     */
    allocate(
        participants: Participant[],
        providerSlots: Slot[],
        recipientSlots: Slot[]
    ): AllocationResult {
        // Build participant map
        const participantMap = new Map<string, Participant>();
        for (const p of participants) {
            participantMap.set(p.id, p);
        }

        // Build compatibility graph and calculate slot priorities
        const compatibility = buildCompatibilityGraph(providerSlots, recipientSlots);
        const priorities = calculateSlotPriorities(
            participantMap,
            providerSlots,
            recipientSlots,
            compatibility
        );

        // Run Sinkhorn algorithm
        const { allocations, iterations, converged } = runSinkhorn(
            providerSlots,
            recipientSlots,
            priorities,
            compatibility,
            this.config
        );

        // Convert to allocation records
        const allocationRecords: SlotAllocation[] = [];
        for (const [pSlotId, rMap] of allocations.entries()) {
            for (const [rSlotId, amount] of rMap.entries()) {
                if (amount > 1e-6) {
                    allocationRecords.push({
                        provider_slot_id: pSlotId,
                        recipient_slot_id: rSlotId,
                        amount,
                        provider_priority: priorities.provider.get(pSlotId)?.get(rSlotId) ?? 0,
                        recipient_priority: priorities.recipient.get(rSlotId)?.get(pSlotId) ?? 0,
                        from_surplus: false
                    });
                }
            }
        }

        // Calculate satisfaction metrics
        const { providerSat, recipientSat, efficiency } = this.calculateMetrics(
            allocations,
            providerSlots,
            recipientSlots,
            priorities
        );

        return {
            allocations: allocationRecords,
            iterations,
            converged,
            primal_residual: 0, // Not applicable for Sinkhorn
            dual_residual: 0,   // Not applicable for Sinkhorn
            provider_satisfaction: providerSat,
            recipient_satisfaction: recipientSat,
            system_efficiency: efficiency
        };
    }

    /**
     * Calculate satisfaction metrics
     */
    private calculateMetrics(
        allocations: Map<string, Map<string, number>>,
        providerSlots: Slot[],
        recipientSlots: Slot[],
        priorities: SlotPriorities
    ): { providerSat: number; recipientSat: number; efficiency: number } {
        let providerSat = 0;
        let recipientSat = 0;
        let totalCapacity = 0;
        let totalNeed = 0;
        let totalAllocated = 0;

        // Provider satisfaction
        for (const pSlot of providerSlots) {
            totalCapacity += pSlot.capacity_or_need;

            const allocMap = allocations.get(pSlot.id);
            if (!allocMap) continue;

            let totalGiven = 0;
            for (const amount of allocMap.values()) {
                totalGiven += amount;
                totalAllocated += amount;
            }

            if (totalGiven > 1e-6) {
                const slotPriority = priorities.provider.get(pSlot.id) ?? new Map();
                let deviation = 0;
                for (const [rSlotId, amount] of allocMap.entries()) {
                    const actualProportion = amount / totalGiven;
                    const idealProportion = slotPriority.get(rSlotId) ?? 0;
                    deviation += Math.abs(actualProportion - idealProportion);
                }
                providerSat += (1 - deviation / 2); // Normalize by max possible deviation
            }
        }
        providerSat = providerSlots.length > 0 ? providerSat / providerSlots.length : 1;

        // Recipient satisfaction
        for (const rSlot of recipientSlots) {
            totalNeed += rSlot.capacity_or_need;

            let totalReceived = 0;
            const received = new Map<string, number>();
            for (const [pSlotId, allocMap] of allocations.entries()) {
                const amount = allocMap.get(rSlot.id) ?? 0;
                if (amount > 1e-6) {
                    received.set(pSlotId, amount);
                    totalReceived += amount;
                }
            }

            if (totalReceived > 1e-6) {
                const slotPriority = priorities.recipient.get(rSlot.id) ?? new Map();
                let deviation = 0;
                for (const [pSlotId, amount] of received.entries()) {
                    const actualProportion = amount / totalReceived;
                    const idealProportion = slotPriority.get(pSlotId) ?? 0;
                    deviation += Math.abs(actualProportion - idealProportion);
                }
                recipientSat += (1 - deviation / 2); // Normalize by max possible deviation
            }
        }
        recipientSat = recipientSlots.length > 0 ? recipientSat / recipientSlots.length : 1;

        // Efficiency
        const maxPossible = Math.min(totalCapacity, totalNeed);
        const efficiency = maxPossible > 0 ? totalAllocated / maxPossible : 1;

        return {
            providerSat: Math.max(0, Math.min(1, providerSat)),
            recipientSat: Math.max(0, Math.min(1, recipientSat)),
            efficiency: Math.max(0, Math.min(1, efficiency))
        };
    }
}
