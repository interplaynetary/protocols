import { z } from 'zod';
import {
    NodeIdSchema,
    WeightSchema,
    SatisfactionSchema,
    TimestampSchema,
    AllocationShareMapsSchema,
    ShareMapSchema,
} from './primitives';

// ═══════════════════════════════════════════════════════════════════════
// DERIVED STATE
// ═══════════════════════════════════════════════════════════════════════

/**
 * DerivedState contains computed values for a node.
 * These are calculated reactively based on the tree structure and user inputs.
 */
export const DerivedStateSchema = z.object({
    node_id: NodeIdSchema,
    weight: WeightSchema,
    share_of_parent: WeightSchema,
    satisfaction: SatisfactionSchema,
    computed_at: TimestampSchema,
    dependencies: z.array(NodeIdSchema),

    // For Capacity/Need nodes: derived from allocations
    allocation_share_maps: AllocationShareMapsSchema.optional(),

    // For all terminal nodes: normalized shares (0-1) for contributors/providers
    contributor_shares: ShareMapSchema.optional(),
});
export type DerivedState = z.infer<typeof DerivedStateSchema>;
