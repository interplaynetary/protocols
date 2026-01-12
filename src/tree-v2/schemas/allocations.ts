import { z } from 'zod';
import {
    EntityIdSchema,
    NodeIdSchema,
    ResourceTypeSchema,
    QuantitySchema,
    SatisfactionSchema,
    TimestampSchema,
} from './primitives';

// ═══════════════════════════════════════════════════════════════════════
// ALLOCATION RECORD
// ═══════════════════════════════════════════════════════════════════════

/**
 * AllocationRecord represents a resource allocation from a provider to a recipient.
 */
export const AllocationRecordSchema = z.object({
    id: z.string().uuid(),
    provider_id: EntityIdSchema,
    recipient_id: EntityIdSchema,
    capacity_slot_id: NodeIdSchema,
    need_slot_id: NodeIdSchema,

    offered_quantity: QuantitySchema,
    accepted_quantity: QuantitySchema,
    declined_quantity: QuantitySchema,
    satisfaction: SatisfactionSchema,

    resource_type: ResourceTypeSchema,
    created_at: TimestampSchema,
    updated_at: TimestampSchema,
});
export type AllocationRecord = z.infer<typeof AllocationRecordSchema>;
