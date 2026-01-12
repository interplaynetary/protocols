import { z } from 'zod';
import { EntityIdSchema, TimestampSchema } from './primitives';
import { EntityStateSchema } from './entity';
import { AllocationRecordSchema } from './allocations';

// ═══════════════════════════════════════════════════════════════════════
// NETWORK STATE
// ═══════════════════════════════════════════════════════════════════════

/**
 * NetworkState represents the complete state of all entities in the network.
 */
export const NetworkStateSchema = z.object({
    entities: z.record(EntityIdSchema, EntityStateSchema),
    global_allocations: z.array(AllocationRecordSchema),
    network_version: z.string(),
    updated_at: TimestampSchema,
});
export type NetworkState = z.infer<typeof NetworkStateSchema>;
