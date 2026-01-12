import type { EntityState } from '../schemas/entity';
import type { AllocationRecord } from '../schemas/allocations';
import type { CapacitySlot, NeedSlot } from '../schemas/nodes';
import type { EntityId, NodeId, Quantity } from '../schemas/primitives';
import { generateAllocationId, now } from '../tree/utils';

// ═══════════════════════════════════════════════════════════════════════
// ALLOCATION CALCULATION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Calculate allocations from a provider to recipients
 */
/**
 * Calculate allocations from a provider to recipients using Two-Sided Water-Filling
 */
export function calculateAllocations(
    provider: EntityState,
    recipients: EntityState[],
    capacity_slot_id: NodeId
): AllocationRecord[] {
    const capacityNode = provider.tree_store.nodes[capacity_slot_id];
    if (!capacityNode || capacityNode.type !== 'CapacitySlot') {
        throw new Error(`Invalid capacity slot: ${capacity_slot_id}`);
    }

    const capacity = capacityNode as CapacitySlot;
    const totalCapacity = capacity.available_quantity;

    // 1. Identify Compatible Recipient Needs
    interface Candidate {
        recipient: EntityState;
        needSlot: NeedSlot;
        jointWeight: number; // Combined preference
        P_ij: number; // Provider -> Recipient preference
        R_ji: number; // Recipient -> Provider preference
    }

    const candidates: Candidate[] = [];

    for (const recipient of recipients) {
        // A. Check Recipient -> Provider Preference (R_ji)
        // How much does the Recipient want from this Provider?
        const R_ji = recipient.share_map[provider.entity_id] || 0;
        if (R_ji <= 0) continue;

        // B. Check Provider -> Recipient Preference (P_ij)
        // How much does the Provider want to give to this Recipient?
        const P_ij = provider.share_map[recipient.entity_id] || 0;
        if (P_ij <= 0) continue;

        // C. Calculate Joint Weight (Geometric Mean)
        // Represents the mutual agreement strength
        const jointWeight = Math.sqrt(P_ij * R_ji);

        // D. Find Matching Needs
        const needSlots = Object.values(recipient.tree_store.nodes).filter(
            (node): node is NeedSlot =>
                node.type === 'NeedSlot' && node.resource_type === capacity.resource_type
        );

        for (const needSlot of needSlots) {
            candidates.push({
                recipient,
                needSlot,
                jointWeight,
                P_ij,
                R_ji
            });
        }
    }

    if (candidates.length === 0) {
        return [];
    }

    // 2. Iterative Water-Filling Allocation
    // Distribute capacity proportional to jointWeight, capped by declared_need

    let remainingCapacity = totalCapacity;
    let activeCandidates = [...candidates];
    const allocationsMap = new Map<string, number>(); // Candidate index -> allocated amount

    // Initialize allocations to 0
    activeCandidates.forEach((_, index) => allocationsMap.set(index.toString(), 0));

    while (remainingCapacity > 0.0001 && activeCandidates.length > 0) {
        const totalWeight = activeCandidates.reduce((sum, c) => sum + c.jointWeight, 0);

        if (totalWeight === 0) break; // Should not happen given checks above, but safety first

        let capacityAsserted = 0;
        const nextActiveCandidates: Candidate[] = [];
        const currentIterationAllocations = new Map<string, number>();

        // Distribute remaining capacity proportionally
        for (let i = 0; i < activeCandidates.length; i++) {
            const candidate = activeCandidates[i];
            const originalIndex = candidates.indexOf(candidate).toString();

            const share = candidate.jointWeight / totalWeight;
            const proposedAdd = remainingCapacity * share;

            const currentAllocated = allocationsMap.get(originalIndex) || 0;
            const maxNeeded = candidate.needSlot.declared_quantity;
            const remainingNeed = maxNeeded - currentAllocated;

            // Cap at remaining need
            const actualAdd = Math.min(proposedAdd, remainingNeed);

            // Update temp map
            currentIterationAllocations.set(originalIndex, actualAdd);
            capacityAsserted += actualAdd;
        }

        // Commit allocations and refine active list
        remainingCapacity -= capacityAsserted;

        // If we made no progress on capacity (e.g. everyone full or precision limits), stop
        if (capacityAsserted < 0.0001) break;

        for (let i = 0; i < activeCandidates.length; i++) {
            const candidate = activeCandidates[i];
            const originalIndex = candidates.indexOf(candidate).toString();

            const added = currentIterationAllocations.get(originalIndex) || 0;
            const currentTotal = (allocationsMap.get(originalIndex) || 0) + added;

            allocationsMap.set(originalIndex, currentTotal);

            // If still needs more, keep in active list
            if (currentTotal < candidate.needSlot.declared_quantity - 0.0001) {
                nextActiveCandidates.push(candidate);
            }
        }

        activeCandidates = nextActiveCandidates;
    }

    // 3. Create Allocation Records
    const finalAllocations: AllocationRecord[] = [];

    allocationsMap.forEach((amount, indexStr) => {
        if (amount <= 0) return;

        const index = parseInt(indexStr);
        const candidate = candidates[index];

        const allocation: AllocationRecord = {
            id: generateAllocationId(),
            provider_id: provider.entity_id,
            recipient_id: candidate.recipient.entity_id,
            capacity_slot_id,
            need_slot_id: candidate.needSlot.id,
            offered_quantity: amount,
            accepted_quantity: 0, // Recipient will confirm
            declined_quantity: 0,
            satisfaction: 0, // Recipient will rate
            resource_type: capacity.resource_type,
            created_at: now(),
            updated_at: now(),
        };

        finalAllocations.push(allocation);
    });

    return finalAllocations;
}

/**
 * Apply accept/decline to allocations
 */
export function applyAcceptDecline(
    allocations: AllocationRecord[],
    acceptedQuantities: Record<string, Quantity>
): AllocationRecord[] {
    return allocations.map(allocation => {
        const acceptedQty = acceptedQuantities[allocation.id] || 0;
        const declinedQty = allocation.offered_quantity - acceptedQty;

        return {
            ...allocation,
            accepted_quantity: acceptedQty,
            declined_quantity: declinedQty,
            updated_at: now(),
        };
    });
}

/**
 * Reallocate declined capacity
 */
export function reallocateDeclined(
    acceptedAllocations: AllocationRecord[],
    declinerCapacity: Record<NodeId, Quantity>,
    recipients: EntityState[]
): AllocationRecord[] {
    const newAllocations: AllocationRecord[] = [];

    for (const [capacitySlotId, declinedQuantity] of Object.entries(declinerCapacity)) {
        if (declinedQuantity === 0) continue;

        // Find recipients who didn't decline
        const eligibleRecipients = recipients.filter(recipient => {
            const existingAllocation = acceptedAllocations.find(
                a =>
                    a.capacity_slot_id === capacitySlotId &&
                    a.recipient_id === recipient.entity_id &&
                    a.accepted_quantity > 0
            );
            return !!existingAllocation;
        });

        // Redistribute proportionally
        const totalShare = eligibleRecipients.reduce(
            (sum, r) => sum + (r.share_map[capacitySlotId] || 0),
            0
        );

        if (totalShare === 0) continue;

        for (const recipient of eligibleRecipients) {
            const share = (recipient.share_map[capacitySlotId] || 0) / totalShare;
            const additionalQuantity = declinedQuantity * share;

            if (additionalQuantity > 0) {
                // Find existing allocation and increase it
                const existing = acceptedAllocations.find(
                    a =>
                        a.capacity_slot_id === capacitySlotId &&
                        a.recipient_id === recipient.entity_id
                );

                if (existing) {
                    existing.offered_quantity += additionalQuantity;
                    existing.accepted_quantity += additionalQuantity;
                    existing.updated_at = now();
                }
            }
        }
    }

    return [...acceptedAllocations, ...newAllocations];
}
