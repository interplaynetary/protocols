import { z } from 'zod';
import { EntityIdSchema, WeightSchema, TimestampSchema, ShareMapSchema, type ShareMap } from './primitives';
import { TreeStoreSchema } from './tree';
import { SymLinkCacheSchema } from './symlinks';
import { AllocationRecordSchema } from './allocations';



// ═══════════════════════════════════════════════════════════════════════
// ENTITY STATE
// ═══════════════════════════════════════════════════════════════════════

/**
 * EntityState represents the complete state of an entity in the network.
 */
export const EntityStateSchema = z.object({
    entity_id: EntityIdSchema,
    tree_store: TreeStoreSchema,
    symlink_cache: SymLinkCacheSchema,
    share_map: ShareMapSchema,
    allocations: z.array(AllocationRecordSchema),
    last_updated: TimestampSchema,
});
export type EntityState = z.infer<typeof EntityStateSchema>;
