import type { AllocationRecord } from '../schemas/allocations';
import type { NodeId, ShareMap, AllocationShareMaps } from '../schemas/primitives';

// ═══════════════════════════════════════════════════════════════════════
// SHAREMAP DERIVATION FROM ALLOCATIONS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Derive ShareMaps from allocations for a Capacity or Need node
 * @param nodeId - The node ID to derive ShareMaps for
 * @param allocations - All allocation records
 * @param perspective - Whether viewing from capacity (provider) or need (recipient) perspective
 * @returns AllocationShareMaps with offered, accepted, and declined quantities
 */
export function deriveAllocationShareMaps(
    nodeId: NodeId,
    allocations: AllocationRecord[],
    perspective: 'capacity' | 'need'
): AllocationShareMaps {
    const offered: ShareMap = {};
    const accepted: ShareMap = {};
    const declined: ShareMap = {};

    for (const alloc of allocations) {
        // Check if this allocation is relevant to this node
        const isRelevant =
            perspective === 'capacity'
                ? alloc.capacity_slot_id === nodeId
                : alloc.need_slot_id === nodeId;

        if (!isRelevant) continue;

        // Get the entity ID from the appropriate perspective
        const entityId =
            perspective === 'capacity' ? alloc.recipient_id : alloc.provider_id;

        // Accumulate quantities (in case multiple allocations to same entity)
        offered[entityId] = (offered[entityId] || 0) + alloc.offered_quantity;
        accepted[entityId] = (accepted[entityId] || 0) + alloc.accepted_quantity;
        declined[entityId] = (declined[entityId] || 0) + alloc.declined_quantity;
    }

    return {
        offered_share_map: offered,
        accepted_share_map: accepted,
        declined_share_map: declined,
    };
}

/**
 * Normalize a ShareMap to sum to 1.0 (convert points/quantities to shares)
 * @param shareMap - Raw ShareMap with points or quantities
 * @returns Normalized ShareMap where values sum to 1.0
 */
export function normalizeShareMap(shareMap: ShareMap): ShareMap {
    const total = Object.values(shareMap).reduce((sum, value) => sum + value, 0);

    if (total === 0) {
        return {};
    }

    const normalized: ShareMap = {};
    for (const [entityId, value] of Object.entries(shareMap)) {
        normalized[entityId] = value / total;
    }

    return normalized;
}
