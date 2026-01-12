import type {
    SymLinkCache,
    RemoteSatisfactionData,
    SymLinkSubscription,
} from '../schemas/symlinks';
import type { EntityId, NodeId } from '../schemas/primitives';
import { now } from '../tree/utils';

// ═══════════════════════════════════════════════════════════════════════
// SUBSCRIPTION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════

/**
 * Subscribe to a remote node's satisfaction data
 */
export function subscribe(
    cache: SymLinkCache,
    symlink_id: NodeId,
    target_entity_id: EntityId,
    target_node_id: NodeId
): SymLinkCache {
    const timestamp = now();

    const subscription: SymLinkSubscription = {
        symlink_id,
        target_entity_id,
        target_node_id,
        subscribed_at: timestamp,
        last_update: timestamp,
    };

    return {
        ...cache,
        subscriptions: {
            ...cache.subscriptions,
            [symlink_id]: subscription,
        },
    };
}

/**
 * Unsubscribe from a remote node
 */
export function unsubscribe(
    cache: SymLinkCache,
    symlink_id: NodeId
): SymLinkCache {
    const { [symlink_id]: _, ...remainingSubscriptions } = cache.subscriptions;
    const { [symlink_id]: __, ...remainingRemoteSatisfaction } = cache.remote_satisfaction;

    return {
        subscriptions: remainingSubscriptions,
        remote_satisfaction: remainingRemoteSatisfaction,
    };
}

/**
 * Update cached satisfaction data
 */
export function updateCachedSatisfaction(
    cache: SymLinkCache,
    symlink_id: NodeId,
    data: RemoteSatisfactionData
): SymLinkCache {
    const subscription = cache.subscriptions[symlink_id];
    if (!subscription) {
        throw new Error(`No subscription found for symlink: ${symlink_id}`);
    }

    return {
        ...cache,
        subscriptions: {
            ...cache.subscriptions,
            [symlink_id]: {
                ...subscription,
                last_update: now(),
            },
        },
        remote_satisfaction: {
            ...cache.remote_satisfaction,
            [symlink_id]: data,
        },
    };
}

/**
 * Get cached satisfaction data for a symlink
 */
export function getCachedSatisfaction(
    cache: SymLinkCache,
    symlink_id: NodeId
): RemoteSatisfactionData | null {
    return cache.remote_satisfaction[symlink_id] || null;
}

/**
 * Check if a symlink has cached data
 */
export function hasCachedData(
    cache: SymLinkCache,
    symlink_id: NodeId
): boolean {
    return !!cache.remote_satisfaction[symlink_id];
}

/**
 * Get all active subscriptions
 */
export function getAllSubscriptions(
    cache: SymLinkCache
): SymLinkSubscription[] {
    return Object.values(cache.subscriptions);
}

/**
 * Remove stale cached data (older than threshold)
 */
export function removeStaleData(
    cache: SymLinkCache,
    maxAgeMs: number = 3600000 // 1 hour default
): SymLinkCache {
    const currentTime = now();
    const updatedRemoteSatisfaction = { ...cache.remote_satisfaction };

    for (const [symlinkId, data] of Object.entries(updatedRemoteSatisfaction)) {
        if (currentTime - data.computed_at > maxAgeMs) {
            delete updatedRemoteSatisfaction[symlinkId];
        }
    }

    return {
        ...cache,
        remote_satisfaction: updatedRemoteSatisfaction,
    };
}
