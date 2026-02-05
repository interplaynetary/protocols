/**
 * Bi-Level ADMM Allocator
 * 
 * Implements the three-stage allocation algorithm:
 * 1. Slot-Specific Priority Renormalization
 * 2. Bi-Level ADMM Consensus
 * 3. Surplus Redistribution
 */

import type {
    Participant,
    Slot,
    SlotAllocation,
    AllocationResult,
    ADMMConfig,
    ADMMState,
    SlotPriorities
} from './schemas.js';

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
        // Simple check: if both have lat/lon, check distance
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

            // Use recipient's radius if specified, otherwise default to 50km
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
 * Returns: Map<provider_slot_id, Set<recipient_slot_id>>
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
// STAGE 1: SLOT-SPECIFIC PRIORITY CALCULATION
// ═══════════════════════════════════════════════════════════════════

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
// STAGE 2: BI-LEVEL ADMM CONSENSUS
// ═══════════════════════════════════════════════════════════════════

/**
 * Build allowed mask (zero-priority enforcement)
 */
function buildAllowedMask(
    providerSlots: Slot[],
    recipientSlots: Slot[],
    priorities: SlotPriorities,
    compatibility: Map<string, Set<string>>
): Map<string, Map<string, boolean>> {
    const mask = new Map<string, Map<string, boolean>>();

    for (const pSlot of providerSlots) {
        const compatSlots = compatibility.get(pSlot.id) ?? new Set();
        const slotMask = new Map<string, boolean>();

        for (const rSlotId of compatSlots) {
            const providerPriority = priorities.provider.get(pSlot.id)?.get(rSlotId) ?? 0;
            const recipientPriority = priorities.recipient.get(rSlotId)?.get(pSlot.id) ?? 0;

            // Only allow if BOTH have non-zero priority
            slotMask.set(rSlotId, providerPriority > 0 && recipientPriority > 0);
        }

        mask.set(pSlot.id, slotMask);
    }

    return mask;
}

/**
 * Initialize ADMM state
 */
function initializeADMMState(
    providerSlots: Slot[],
    recipientSlots: Slot[],
    compatibility: Map<string, Set<string>>
): ADMMState {
    const x = new Map<string, Map<string, number>>();
    const z_p = new Map<string, Map<string, number>>();
    const z_r = new Map<string, Map<string, number>>();
    const u = new Map<string, Map<string, number>>();

    for (const pSlot of providerSlots) {
        const compatSlots = compatibility.get(pSlot.id) ?? new Set();

        x.set(pSlot.id, new Map());
        z_p.set(pSlot.id, new Map());
        z_r.set(pSlot.id, new Map());
        u.set(pSlot.id, new Map());

        for (const rSlotId of compatSlots) {
            x.get(pSlot.id)!.set(rSlotId, 0);
            z_p.get(pSlot.id)!.set(rSlotId, 0);
            z_r.get(pSlot.id)!.set(rSlotId, 0);
            u.get(pSlot.id)!.set(rSlotId, 0);
        }
    }

    return { x, z_p, z_r, u };
}

/**
 * Provider projection step (revised ADMM formulation)
 */
function providerProjection(
    state: ADMMState,
    providerSlots: Slot[],
    priorities: SlotPriorities,
    compatibility: Map<string, Set<string>>,
    allowedMask: Map<string, Map<string, boolean>>,
    rho: number
): void {
    for (const pSlot of providerSlots) {
        const compatSlots = compatibility.get(pSlot.id) ?? new Set();
        if (compatSlots.size === 0) continue;

        const capacity = pSlot.capacity_or_need;
        const slotPriority = priorities.provider.get(pSlot.id) ?? new Map();

        const slotMask = allowedMask.get(pSlot.id) ?? new Map();

        // Step 1: Compute z_p using proper ADMM closed-form solution
        for (const rSlotId of compatSlots) {
            // Zero-priority enforcement
            if (!slotMask.get(rSlotId)) {
                state.z_p.get(pSlot.id)!.set(rSlotId, 0);
                continue;
            }

            const xVal = state.x.get(pSlot.id)?.get(rSlotId) ?? 0;
            const uVal = state.u.get(pSlot.id)?.get(rSlotId) ?? 0;
            const v = xVal + uVal;

            const idealProportion = slotPriority.get(rSlotId) ?? 0;
            const ideal = idealProportion * capacity;

            // Proper ADMM: minimize |z_p - ideal|² + (ρ/2)|z_p - v|²
            // Closed-form solution: z_p = (2×ideal + ρ×v) / (2+ρ)
            const zp = (2 * ideal + rho * v) / (2 + rho);
            state.z_p.get(pSlot.id)!.set(rSlotId, Math.max(0, zp));
        }

        // Step 2: Re-scale to ensure capacity constraint
        let totalZp = 0;
        for (const rSlotId of compatSlots) {
            totalZp += state.z_p.get(pSlot.id)!.get(rSlotId) ?? 0;
        }

        if (totalZp > capacity && totalZp > 1e-9) {
            for (const rSlotId of compatSlots) {
                const zpVal = state.z_p.get(pSlot.id)!.get(rSlotId) ?? 0;
                state.z_p.get(pSlot.id)!.set(rSlotId, zpVal * capacity / totalZp);
            }
        }
    }
}

/**
 * Recipient projection step (revised ADMM formulation)
 */
function recipientProjection(
    state: ADMMState,
    providerSlots: Slot[],
    recipientSlots: Slot[],
    priorities: SlotPriorities,
    compatibility: Map<string, Set<string>>,
    allowedMask: Map<string, Map<string, boolean>>,
    rho: number
): void {
    for (const rSlot of recipientSlots) {
        const need = rSlot.capacity_or_need;
        const slotPriority = priorities.recipient.get(rSlot.id) ?? new Map();

        // Find compatible provider slots
        const compatProviderSlots: string[] = [];
        for (const [pSlotId, compatSet] of compatibility.entries()) {
            if (compatSet.has(rSlot.id)) {
                compatProviderSlots.push(pSlotId);
            }
        }

        if (compatProviderSlots.length === 0) continue;

        // Step 1: Compute z_r using proper ADMM closed-form solution
        for (const pSlotId of compatProviderSlots) {
            // Zero-priority enforcement
            const slotMask = allowedMask.get(pSlotId) ?? new Map();
            if (!slotMask.get(rSlot.id)) {
                if (!state.z_r.has(pSlotId)) {
                    state.z_r.set(pSlotId, new Map());
                }
                state.z_r.get(pSlotId)!.set(rSlot.id, 0);
                continue;
            }

            const xVal = state.x.get(pSlotId)?.get(rSlot.id) ?? 0;
            const uVal = state.u.get(pSlotId)?.get(rSlot.id) ?? 0;
            const w = xVal - uVal;

            const idealProportion = slotPriority.get(pSlotId) ?? 0;
            const ideal = idealProportion * need;

            // Proper ADMM: minimize |z_r - ideal|² + (ρ/2)|z_r - w|²
            // Closed-form solution: z_r = (2×ideal + ρ×w) / (2+ρ)
            const zr = (2 * ideal + rho * w) / (2 + rho);

            // Ensure z_r map exists
            if (!state.z_r.has(pSlotId)) {
                state.z_r.set(pSlotId, new Map());
            }
            state.z_r.get(pSlotId)!.set(rSlot.id, Math.max(0, zr));
        }

        // Step 2: Re-scale to ensure need constraint
        let totalZr = 0;
        for (const pSlotId of compatProviderSlots) {
            totalZr += state.z_r.get(pSlotId)?.get(rSlot.id) ?? 0;
        }

        if (totalZr > need && totalZr > 1e-9) {
            for (const pSlotId of compatProviderSlots) {
                const zrVal = state.z_r.get(pSlotId)?.get(rSlot.id) ?? 0;
                state.z_r.get(pSlotId)!.set(rSlot.id, zrVal * need / totalZr);
            }
        }
    }
}

/**
 * Consensus and dual update
 */
function consensusUpdate(state: ADMMState): { primalRes: number; dualRes: number } {
    let primalRes = 0;
    let dualRes = 0;
    let count = 0;

    for (const [pSlotId, rMap] of state.x.entries()) {
        for (const [rSlotId, xOld] of rMap.entries()) {
            const zp = state.z_p.get(pSlotId)?.get(rSlotId) ?? 0;
            const zr = state.z_r.get(pSlotId)?.get(rSlotId) ?? 0;

            // Update consensus: x_new = (z_p + z_r) / 2
            const xNew = (zp + zr) / 2;
            state.x.get(pSlotId)!.set(rSlotId, xNew);

            // Update dual: u = u + (z_p - z_r)
            const uOld = state.u.get(pSlotId)?.get(rSlotId) ?? 0;
            const uNew = uOld + (zp - zr);
            state.u.get(pSlotId)!.set(rSlotId, uNew);

            // Track residuals
            primalRes += Math.abs(xNew - xOld);
            dualRes += Math.abs(zp - zr);
            count++;
        }
    }

    return {
        primalRes: count > 0 ? primalRes / count : 0,
        dualRes: count > 0 ? dualRes / count : 0
    };
}

/**
 * Run ADMM consensus algorithm (revised formulation)
 */
function runADMMConsensus(
    providerSlots: Slot[],
    recipientSlots: Slot[],
    priorities: SlotPriorities,
    compatibility: Map<string, Set<string>>,
    config: ADMMConfig
): { state: ADMMState; iterations: number; converged: boolean; primalRes: number; dualRes: number } {
    const state = initializeADMMState(providerSlots, recipientSlots, compatibility);
    const allowedMask = buildAllowedMask(providerSlots, recipientSlots, priorities, compatibility);

    let iterations = 0;
    let converged = false;
    let primalRes = Infinity;
    let dualRes = Infinity;

    for (iterations = 0; iterations < config.max_iterations; iterations++) {
        // Provider projection
        providerProjection(state, providerSlots, priorities, compatibility, allowedMask, config.rho);

        // Recipient projection
        recipientProjection(state, providerSlots, recipientSlots, priorities, compatibility, allowedMask, config.rho);

        // Consensus and dual update
        const residuals = consensusUpdate(state);
        primalRes = residuals.primalRes;
        dualRes = residuals.dualRes;

        // Check convergence
        if (primalRes < config.epsilon && dualRes < config.epsilon) {
            converged = true;
            break;
        }
    }

    return { state, iterations, converged, primalRes, dualRes };
}

// ═══════════════════════════════════════════════════════════════════
// STAGE 3: SURPLUS REDISTRIBUTION
// ═══════════════════════════════════════════════════════════════════

/**
 * Redistribute surplus capacity to unmet needs
 */
function surplusRedistribution(
    state: ADMMState,
    providerSlots: Slot[],
    recipientSlots: Slot[],
    priorities: SlotPriorities,
    compatibility: Map<string, Set<string>>
): void {
    // Calculate surplus and unmet
    const surplus = new Map<string, number>();
    const unmet = new Map<string, number>();

    for (const pSlot of providerSlots) {
        let used = 0;
        const allocMap = state.x.get(pSlot.id);
        if (allocMap) {
            for (const amount of allocMap.values()) {
                used += amount;
            }
        }
        const surplusAmount = pSlot.capacity_or_need - used;
        if (surplusAmount > 1e-6) {
            surplus.set(pSlot.id, surplusAmount);
        }
    }

    for (const rSlot of recipientSlots) {
        let received = 0;
        for (const [pSlotId, allocMap] of state.x.entries()) {
            received += allocMap.get(rSlot.id) ?? 0;
        }
        const unmetAmount = Math.max(0, rSlot.capacity_or_need - received);
        if (unmetAmount > 1e-6) {
            unmet.set(rSlot.id, unmetAmount);
        }
    }

    // Redistribution loop
    let progressMade = true;
    while (surplus.size > 0 && unmet.size > 0 && progressMade) {
        progressMade = false;

        for (const [pSlotId, surplusAmount] of Array.from(surplus.entries())) {
            if (surplusAmount < 1e-6) {
                surplus.delete(pSlotId);
                continue;
            }

            const compatSlots = compatibility.get(pSlotId) ?? new Set();
            const slotPriority = priorities.provider.get(pSlotId) ?? new Map();
            const recipientPriority = priorities.recipient;

            // Find eligible recipients (mutual non-zero priority + unmet need)
            const eligible: string[] = [];
            for (const rSlotId of compatSlots) {
                if (!unmet.has(rSlotId)) continue;

                const providerPrio = slotPriority.get(rSlotId) ?? 0;
                const recipientPrio = recipientPriority.get(rSlotId)?.get(pSlotId) ?? 0;

                if (providerPrio > 0 && recipientPrio > 0) {
                    eligible.push(rSlotId);
                }
            }

            if (eligible.length === 0) continue;

            // Calculate total priority for scaling
            let totalPriority = 0;
            for (const rSlotId of eligible) {
                totalPriority += slotPriority.get(rSlotId) ?? 0;
            }

            if (totalPriority === 0) continue;

            // Allocate proportionally
            let remainingSurplus = surplusAmount;
            for (const rSlotId of eligible) {
                const priorityShare = (slotPriority.get(rSlotId) ?? 0) / totalPriority;
                const desiredAllocation = surplusAmount * priorityShare;
                const unmetAmount = unmet.get(rSlotId) ?? 0;
                const actualAllocation = Math.min(desiredAllocation, unmetAmount, remainingSurplus);

                if (actualAllocation > 1e-6) {
                    // Update allocation
                    const currentAlloc = state.x.get(pSlotId)?.get(rSlotId) ?? 0;
                    state.x.get(pSlotId)!.set(rSlotId, currentAlloc + actualAllocation);

                    // Update surplus and unmet
                    remainingSurplus -= actualAllocation;
                    const newUnmet = unmetAmount - actualAllocation;
                    if (newUnmet < 1e-6) {
                        unmet.delete(rSlotId);
                    } else {
                        unmet.set(rSlotId, newUnmet);
                    }

                    progressMade = true;
                }
            }

            // Update surplus
            if (remainingSurplus < 1e-6) {
                surplus.delete(pSlotId);
            } else {
                surplus.set(pSlotId, remainingSurplus);
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// MAIN ALLOCATOR CLASS
// ═══════════════════════════════════════════════════════════════════

export class BiLevelADMMAllocator {
    private config: ADMMConfig;

    constructor(config: Partial<ADMMConfig> = {}) {
        this.config = {
            rho: config.rho ?? 1.0,
            epsilon: config.epsilon ?? 0.01,
            max_iterations: config.max_iterations ?? 1000,
            blend_factor: config.blend_factor ?? 0.5
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

        // Stage 1: Build compatibility graph and calculate slot priorities
        const compatibility = buildCompatibilityGraph(providerSlots, recipientSlots);
        const priorities = calculateSlotPriorities(
            participantMap,
            providerSlots,
            recipientSlots,
            compatibility
        );

        // Stage 2: Run ADMM consensus
        const { state, iterations, converged, primalRes, dualRes } = runADMMConsensus(
            providerSlots,
            recipientSlots,
            priorities,
            compatibility,
            this.config
        );

        // Stage 3: Surplus redistribution
        surplusRedistribution(state, providerSlots, recipientSlots, priorities, compatibility);

        // Convert to allocation records
        const allocations: SlotAllocation[] = [];
        for (const [pSlotId, rMap] of state.x.entries()) {
            for (const [rSlotId, amount] of rMap.entries()) {
                if (amount > 1e-6) {
                    allocations.push({
                        provider_slot_id: pSlotId,
                        recipient_slot_id: rSlotId,
                        amount,
                        provider_priority: priorities.provider.get(pSlotId)?.get(rSlotId) ?? 0,
                        recipient_priority: priorities.recipient.get(rSlotId)?.get(pSlotId) ?? 0,
                        from_surplus: false // TODO: track this properly
                    });
                }
            }
        }

        // Calculate satisfaction metrics
        const { providerSat, recipientSat, efficiency } = this.calculateMetrics(
            state,
            providerSlots,
            recipientSlots,
            priorities
        );

        return {
            allocations,
            iterations,
            converged,
            primal_residual: primalRes,
            dual_residual: dualRes,
            provider_satisfaction: providerSat,
            recipient_satisfaction: recipientSat,
            system_efficiency: efficiency
        };
    }

    /**
     * Calculate satisfaction metrics
     */
    private calculateMetrics(
        state: ADMMState,
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

            const allocMap = state.x.get(pSlot.id);
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
                providerSat += (1 - deviation);
            }
        }
        providerSat = providerSlots.length > 0 ? providerSat / providerSlots.length : 1;

        // Recipient satisfaction
        for (const rSlot of recipientSlots) {
            totalNeed += rSlot.capacity_or_need;

            let totalReceived = 0;
            const received = new Map<string, number>();
            for (const [pSlotId, allocMap] of state.x.entries()) {
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
                recipientSat += (1 - deviation);
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
