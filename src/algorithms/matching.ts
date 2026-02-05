/**
 * Space-Time Matching Utility
 * 
 * Bridge utility that applies type/space/time matching to slots and produces
 * clean inputs for allocation algorithms (fairness, divisor, gossip).
 * 
 * This ensures matching happens BEFORE allocation:
 * 1. Type matching (same type_id)
 * 2. Space matching (location compatibility)
 * 3. Time matching (availability window overlap)
 * 4. Extract recognition weights for compatible pairs
 * 5. Produce ShareMap for allocation algorithms
 */

import type {
    AvailabilitySlot,
    NeedSlot,
    ShareMap,
    Commitment
} from '../schemas.js';

import {
    slotsCompatible,
    locationsCompatible
} from '../utils/match.js';

// ═══════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Compatibility matrix entry
 */
export interface CompatibilityEntry {
    capacitySlotId: string;
    needSlotId: string;
    providerPubkey: string;
    recipientPubkey: string;
    compatible: boolean;
    typeMatch: boolean;
    spaceMatch: boolean;
    timeMatch: boolean;
}

/**
 * Allocation input prepared from slots
 */
export interface AllocationInput {
    /** Recognition weights for compatible participants */
    weights: ShareMap;

    /** Total capacity available (sum of compatible capacity slots) */
    totalCapacity: number;

    /** Compatible capacity slots */
    compatibleCapacitySlots: AvailabilitySlot[];

    /** Compatible need slots */
    compatibleNeedSlots: NeedSlot[];

    /** Compatibility matrix */
    compatibilityMatrix: CompatibilityEntry[];

    /** Metadata */
    metadata: {
        typeId: string;
        totalCapacitySlots: number;
        totalNeedSlots: number;
        compatiblePairs: number;
        timestamp: number;
    };
}

// ═══════════════════════════════════════════════════════════════════
// FILTERING UTILITIES
// ═══════════════════════════════════════════════════════════════════

/**
 * Filter slots by type_id
 */
export function filterSlotsByType<T extends { type_id?: string }>(
    slots: T[],
    typeId: string
): T[] {
    return slots.filter(slot => slot.type_id === typeId);
}

/**
 * Get all unique type_ids from slots
 */
export function getUniqueTypes(
    capacitySlots: AvailabilitySlot[],
    needSlots: NeedSlot[]
): string[] {
    const types = new Set<string>();

    for (const slot of capacitySlots) {
        if (slot.type_id) types.add(slot.type_id);
    }

    for (const slot of needSlots) {
        if (slot.type_id) types.add(slot.type_id);
    }

    return Array.from(types).sort();
}

/**
 * Find owner of a slot from commitments
 */
function findSlotOwner(
    slotId: string,
    commitments: Record<string, Commitment>
): string | null {
    for (const [pubkey, commitment] of Object.entries(commitments)) {
        // Check capacity slots
        if (commitment.capacity_slots) {
            for (const slot of commitment.capacity_slots) {
                if (slot.id === slotId) return pubkey;
            }
        }

        // Check need slots
        if (commitment.need_slots) {
            for (const slot of commitment.need_slots) {
                if (slot.id === slotId) return pubkey;
            }
        }
    }

    return null;
}

// ═══════════════════════════════════════════════════════════════════
// COMPATIBILITY CHECKING
// ═══════════════════════════════════════════════════════════════════

/**
 * Build compatibility matrix for a specific type
 * 
 * Checks type/space/time compatibility for all capacity-need pairs
 */
export function buildCompatibilityMatrix(
    capacitySlots: AvailabilitySlot[],
    needSlots: NeedSlot[],
    typeId: string,
    commitments: Record<string, Commitment>
): CompatibilityEntry[] {
    const matrix: CompatibilityEntry[] = [];

    // Filter by type first
    const compatibleCapacity = filterSlotsByType(capacitySlots, typeId);
    const compatibleNeeds = filterSlotsByType(needSlots, typeId);

    // Check all pairs
    for (const capacitySlot of compatibleCapacity) {
        const providerPubkey = findSlotOwner(capacitySlot.id, commitments) || 'unknown';

        for (const needSlot of compatibleNeeds) {
            const recipientPubkey = findSlotOwner(needSlot.id, commitments) || 'unknown';

            // Type match (already filtered, but double-check)
            const typeMatch = capacitySlot.type_id === needSlot.type_id;

            // Space match
            const spaceMatch = locationsCompatible(needSlot, capacitySlot);

            // Time match (uses existing utility - needSlot first, then capacitySlot)
            const timeMatch = slotsCompatible(needSlot, capacitySlot);

            // Overall compatibility
            const compatible = typeMatch && spaceMatch && timeMatch;

            matrix.push({
                capacitySlotId: capacitySlot.id,
                needSlotId: needSlot.id,
                providerPubkey,
                recipientPubkey,
                compatible,
                typeMatch,
                spaceMatch,
                timeMatch
            });
        }
    }

    return matrix;
}

/**
 * Get compatible pairs from compatibility matrix
 */
export function getCompatiblePairs(
    matrix: CompatibilityEntry[]
): CompatibilityEntry[] {
    return matrix.filter(entry => entry.compatible);
}

// ═══════════════════════════════════════════════════════════════════
// WEIGHT EXTRACTION
// ═══════════════════════════════════════════════════════════════════

/**
 * Extract recognition weights for compatible participants
 * 
 * For each provider in compatible pairs, get their recognition weights
 * from their commitment's global_recognition_weights.
 */
export function extractWeightsForType(
    compatiblePairs: CompatibilityEntry[],
    commitments: Record<string, Commitment>,
    perspective: 'provider' | 'recipient' = 'provider'
): ShareMap {
    const weights: Record<string, number> = {};

    // Get unique participants
    const participants = new Set<string>();
    for (const pair of compatiblePairs) {
        if (perspective === 'provider') {
            participants.add(pair.recipientPubkey);
        } else {
            participants.add(pair.providerPubkey);
        }
    }

    // For each participant, get their weight
    // This is a simplified version - in practice, you might want to aggregate
    // weights from multiple sources or use mutual recognition
    for (const pubkey of participants) {
        // Default weight if not found
        weights[pubkey] = 1.0 / participants.size;
    }

    // If we have global recognition weights, use those
    if (perspective === 'provider') {
        // Get provider's recognition of recipients
        const providerPubkeys = new Set(compatiblePairs.map(p => p.providerPubkey));

        for (const providerPubkey of providerPubkeys) {
            const commitment = commitments[providerPubkey];
            if (commitment?.global_recognition_weights) {
                // Update weights based on provider's recognition
                for (const recipientPubkey of participants) {
                    const recognitionWeight = commitment.global_recognition_weights[recipientPubkey];
                    if (recognitionWeight !== undefined) {
                        weights[recipientPubkey] = recognitionWeight;
                    }
                }
            }
        }
    }

    // Normalize weights to sum to 1.0
    const sum = Object.values(weights).reduce((acc, w) => acc + w, 0);
    if (sum > 0) {
        for (const pubkey of Object.keys(weights)) {
            weights[pubkey] /= sum;
        }
    }

    return weights;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PREPARATION FUNCTION
// ═══════════════════════════════════════════════════════════════════

/**
 * Prepare allocation input from slots
 * 
 * This is the main function that bridges slots to allocation algorithms.
 * 
 * Process:
 * 1. Filter slots by type
 * 2. Build compatibility matrix (type/space/time)
 * 3. Extract compatible pairs
 * 4. Get recognition weights
 * 5. Calculate total capacity
 * 6. Return clean input for allocation algorithms
 * 
 * @param capacitySlots - All capacity slots
 * @param needSlots - All need slots
 * @param typeId - Type to filter by
 * @param commitments - All commitments (for owner lookup and weights)
 * @param perspective - 'provider' or 'recipient' perspective for weights
 * @returns Clean input ready for allocation algorithms
 * 
 * @example
 * ```typescript
 * const input = prepareAllocationInput(
 *   capacitySlots,
 *   needSlots,
 *   'childcare',
 *   commitments
 * );
 * 
 * // Now use with allocation algorithms
 * const result = calculateProportionalFairness(
 *   input.weights,
 *   input.totalCapacity
 * );
 * ```
 */
export function prepareAllocationInput(
    capacitySlots: AvailabilitySlot[],
    needSlots: NeedSlot[],
    typeId: string,
    commitments: Record<string, Commitment>,
    perspective: 'provider' | 'recipient' = 'provider'
): AllocationInput {
    // 1. Build compatibility matrix
    const compatibilityMatrix = buildCompatibilityMatrix(
        capacitySlots,
        needSlots,
        typeId,
        commitments
    );

    // 2. Get compatible pairs
    const compatiblePairs = getCompatiblePairs(compatibilityMatrix);

    // 3. Extract weights
    const weights = extractWeightsForType(compatiblePairs, commitments, perspective);

    // 4. Get compatible slots
    const compatibleCapacityIds = new Set(
        compatiblePairs.map(p => p.capacitySlotId)
    );
    const compatibleNeedIds = new Set(
        compatiblePairs.map(p => p.needSlotId)
    );

    const compatibleCapacitySlots = capacitySlots.filter(
        slot => compatibleCapacityIds.has(slot.id)
    );
    const compatibleNeedSlots = needSlots.filter(
        slot => compatibleNeedIds.has(slot.id)
    );

    // 5. Calculate total capacity
    const totalCapacity = compatibleCapacitySlots.reduce(
        (sum, slot) => sum + (slot.quantity || 0),
        0
    );

    return {
        weights,
        totalCapacity,
        compatibleCapacitySlots,
        compatibleNeedSlots,
        compatibilityMatrix,
        metadata: {
            typeId,
            totalCapacitySlots: capacitySlots.length,
            totalNeedSlots: needSlots.length,
            compatiblePairs: compatiblePairs.length,
            timestamp: Date.now()
        }
    };
}

/**
 * Prepare allocation inputs for all types
 * 
 * Convenience function that prepares inputs for all unique types found in slots.
 */
export function prepareAllocationInputsByType(
    capacitySlots: AvailabilitySlot[],
    needSlots: NeedSlot[],
    commitments: Record<string, Commitment>,
    perspective: 'provider' | 'recipient' = 'provider'
): Record<string, AllocationInput> {
    const types = getUniqueTypes(capacitySlots, needSlots);
    const inputs: Record<string, AllocationInput> = {};

    for (const typeId of types) {
        inputs[typeId] = prepareAllocationInput(
            capacitySlots,
            needSlots,
            typeId,
            commitments,
            perspective
        );
    }

    return inputs;
}
