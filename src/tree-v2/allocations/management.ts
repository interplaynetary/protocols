import type { EntityState } from '../schemas/entity';
import type { AllocationRecord } from '../schemas/allocations';
import type { EntityId, NodeId, Quantity, Satisfaction, ResourceType } from '../schemas/primitives';
import { generateAllocationId, now } from '../tree/utils';

// ═══════════════════════════════════════════════════════════════════════
// ALLOCATION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════

/**
 * Create an allocation record
 */
export function createAllocation(
    provider_id: EntityId,
    recipient_id: EntityId,
    capacity_slot_id: NodeId,
    need_slot_id: NodeId,
    offered_quantity: Quantity,
    resource_type: ResourceType
): AllocationRecord {
    const timestamp = now();

    return {
        id: generateAllocationId(),
        provider_id,
        recipient_id,
        capacity_slot_id,
        need_slot_id,
        offered_quantity,
        accepted_quantity: 0,
        declined_quantity: 0,
        satisfaction: 0,
        resource_type,
        created_at: timestamp,
        updated_at: timestamp,
    };
}

/**
 * Update allocation satisfaction
 */
export function updateAllocationSatisfaction(
    allocation: AllocationRecord,
    satisfaction: Satisfaction,
    accepted_quantity: Quantity
): AllocationRecord {
    return {
        ...allocation,
        satisfaction,
        accepted_quantity,
        declined_quantity: allocation.offered_quantity - accepted_quantity,
        updated_at: now(),
    };
}

/**
 * Get allocations for a capacity slot
 */
export function getAllocationsForCapacity(
    entity: EntityState,
    capacity_slot_id: NodeId
): AllocationRecord[] {
    return entity.allocations.filter(
        a => a.capacity_slot_id === capacity_slot_id
    );
}

/**
 * Get allocations for a need slot
 */
export function getAllocationsForNeed(
    entity: EntityState,
    need_slot_id: NodeId
): AllocationRecord[] {
    return entity.allocations.filter(
        a => a.need_slot_id === need_slot_id
    );
}

/**
 * Get all allocations where entity is provider
 */
export function getAllocationsAsProvider(
    entity: EntityState
): AllocationRecord[] {
    return entity.allocations.filter(
        a => a.provider_id === entity.entity_id
    );
}

/**
 * Get all allocations where entity is recipient
 */
export function getAllocationsAsRecipient(
    entity: EntityState
): AllocationRecord[] {
    return entity.allocations.filter(
        a => a.recipient_id === entity.entity_id
    );
}

/**
 * Add allocation to entity state
 */
export function addAllocation(
    entity: EntityState,
    allocation: AllocationRecord
): EntityState {
    return {
        ...entity,
        allocations: [...entity.allocations, allocation],
        last_updated: now(),
    };
}

/**
 * Update allocation in entity state
 */
export function updateAllocation(
    entity: EntityState,
    allocation_id: string,
    updates: Partial<AllocationRecord>
): EntityState {
    return {
        ...entity,
        allocations: entity.allocations.map(a =>
            a.id === allocation_id
                ? { ...a, ...updates, updated_at: now() }
                : a
        ),
        last_updated: now(),
    };
}

/**
 * Remove allocation from entity state
 */
export function removeAllocation(
    entity: EntityState,
    allocation_id: string
): EntityState {
    return {
        ...entity,
        allocations: entity.allocations.filter(a => a.id !== allocation_id),
        last_updated: now(),
    };
}

/**
 * Calculate total received quantity for a need slot
 */
export function getTotalReceivedForNeed(
    entity: EntityState,
    need_slot_id: NodeId
): Quantity {
    return entity.allocations
        .filter(a => a.need_slot_id === need_slot_id)
        .reduce((sum, a) => sum + a.accepted_quantity, 0);
}

/**
 * Calculate total allocated quantity for a capacity slot
 */
export function getTotalAllocatedForCapacity(
    entity: EntityState,
    capacity_slot_id: NodeId
): Quantity {
    return entity.allocations
        .filter(a => a.capacity_slot_id === capacity_slot_id)
        .reduce((sum, a) => sum + a.accepted_quantity, 0);
}
