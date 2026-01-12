import { z } from 'zod';
import {
    EntityIdSchema,
    NodeIdSchema,
    WeightSchema,
    SatisfactionSchema,
    TimestampSchema,
} from './primitives';

// ═══════════════════════════════════════════════════════════════════════
// REMOTE SATISFACTION DATA
// ═══════════════════════════════════════════════════════════════════════

/**
 * RemoteSatisfactionData contains cached satisfaction and share data from
 * another entity's node (via symbolic links).
 */
export const RemoteSatisfactionDataSchema = z.object({
    entity_id: EntityIdSchema,
    node_id: NodeIdSchema,
    satisfaction: SatisfactionSchema,
    weight: WeightSchema,
    contributor_shares: z.record(EntityIdSchema, WeightSchema),
    computed_at: TimestampSchema,
    tree_version: z.string(),
});
export type RemoteSatisfactionData = z.infer<typeof RemoteSatisfactionDataSchema>;

// ═══════════════════════════════════════════════════════════════════════
// SUBSCRIPTION METADATA
// ═══════════════════════════════════════════════════════════════════════

/**
 * SymLinkSubscription tracks subscription metadata for a symbolic link.
 */
export const SymLinkSubscriptionSchema = z.object({
    symlink_id: NodeIdSchema,
    target_entity_id: EntityIdSchema,
    target_node_id: NodeIdSchema,
    subscribed_at: TimestampSchema,
    last_update: TimestampSchema,
});
export type SymLinkSubscription = z.infer<typeof SymLinkSubscriptionSchema>;

// ═══════════════════════════════════════════════════════════════════════
// SUBSCRIPTION CACHE
// ═══════════════════════════════════════════════════════════════════════

/**
 * SymLinkCache maintains all subscriptions and cached remote satisfaction data
 * for an entity.
 */
export const SymLinkCacheSchema = z.object({
    subscriptions: z.record(NodeIdSchema, SymLinkSubscriptionSchema),
    remote_satisfaction: z.record(NodeIdSchema, RemoteSatisfactionDataSchema),
});
export type SymLinkCache = z.infer<typeof SymLinkCacheSchema>;
