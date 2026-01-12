import { z } from 'zod';
import { RefIdSchema, NodeIdSchema, PointsSchema, TimestampSchema } from './primitives';

// ═══════════════════════════════════════════════════════════════════════
// TREE REFERENCE
// ═══════════════════════════════════════════════════════════════════════

/**
 * TreeReference represents how a node appears in a specific location in the tree.
 * It allows the same node to be reused in multiple places with different children
 * or points overrides.
 */
export const TreeReferenceSchema = z.object({
    ref_id: RefIdSchema,
    node_id: NodeIdSchema,
    parent_ref_id: RefIdSchema.optional(),

    // Overrides for this specific tree placement
    child_ref_ids: z.array(RefIdSchema).optional(),
    points_override: PointsSchema.optional(),

    created_at: TimestampSchema,
});
export type TreeReference = z.infer<typeof TreeReferenceSchema>;
