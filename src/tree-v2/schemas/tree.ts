import { z } from 'zod';
import { EntityIdSchema, NodeIdSchema, RefIdSchema, TimestampSchema } from './primitives';
import { NodeDefinitionSchema } from './nodes';
import { TreeReferenceSchema } from './references';
import { DerivedStateSchema } from './derived';

// ═══════════════════════════════════════════════════════════════════════
// TREE STORE
// ═══════════════════════════════════════════════════════════════════════

/**
 * TreeStore is the main data structure for an entity's tree.
 * It contains:
 * - Canonical node definitions (stored once)
 * - Tree references (how nodes are arranged in the tree)
 * - Derived state (computed values)
 */
export const TreeStoreSchema = z.object({
    entity_id: EntityIdSchema,
    root_ref_id: RefIdSchema,
    tree_version: z.string(),

    // Canonical node definitions
    nodes: z.record(NodeIdSchema, NodeDefinitionSchema),

    // Tree structure via references
    tree_references: z.record(RefIdSchema, TreeReferenceSchema),

    // Computed values
    derived_state: z.record(NodeIdSchema, DerivedStateSchema),

    last_updated: TimestampSchema,
});
export type TreeStore = z.infer<typeof TreeStoreSchema>;
