import type { EntityState } from '../schemas/entity';
import type { RemoteSatisfactionData } from '../schemas/symlinks';
import type { EntityId, NodeId } from '../schemas/primitives';
import { getAllSymLinks } from './operations';
import { calculateShareMap } from '../computation/shares';

// ═══════════════════════════════════════════════════════════════════════
// PUB-SUB PROPAGATION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Get topic name for a node
 */
export function getTopicName(entity_id: EntityId, node_id: NodeId): string {
    return `${entity_id}/satisfaction/${node_id}`;
}

/**
 * Get all topics an entity should subscribe to
 */
export function getSubscriptionTopics(entity: EntityState): string[] {
    const symlinks = getAllSymLinks(entity.tree_store);

    return symlinks.map(symlink =>
        getTopicName(
            symlink.symlink_target.entity_id,
            symlink.symlink_target.node_id
        )
    );
}

/**
 * Check if satisfaction has changed enough to warrant publishing
 */
export function shouldPublishUpdate(
    previous: RemoteSatisfactionData | null,
    current: RemoteSatisfactionData,
    threshold: number = 0.01 // 1% change threshold
): boolean {
    if (!previous) {
        return true; // Always publish first time
    }

    // Check if satisfaction changed significantly
    if (Math.abs(current.satisfaction - previous.satisfaction) > threshold) {
        return true;
    }

    // Check if any contributor share changed significantly
    const allContributors = new Set([
        ...Object.keys(previous.contributor_shares),
        ...Object.keys(current.contributor_shares),
    ]);

    for (const contributorId of Array.from(allContributors)) {
        const prevShare = previous.contributor_shares[contributorId] || 0;
        const currShare = current.contributor_shares[contributorId] || 0;
        if (Math.abs(currShare - prevShare) > threshold) {
            return true;
        }
    }

    return false;
}

/**
 * Prepare satisfaction data for publishing
 */
export function prepareSatisfactionUpdate(
    entity: EntityState,
    node_id: NodeId
): RemoteSatisfactionData {
    const node = entity.tree_store.nodes[node_id];
    if (!node) {
        throw new Error(`Node not found: ${node_id}`);
    }

    const derivedState = entity.tree_store.derived_state[node_id];
    if (!derivedState) {
        throw new Error(`Derived state not found for node: ${node_id}`);
    }

    // Calculate contributor shares for this node's subtree
    const contributorShares = calculateShareMap(
        entity.tree_store,
        entity.symlink_cache
    );

    return {
        entity_id: entity.entity_id,
        node_id,
        satisfaction: derivedState.satisfaction,
        weight: derivedState.weight,
        contributor_shares: contributorShares,
        computed_at: derivedState.computed_at,
        tree_version: entity.tree_store.tree_version,
    };
}

/**
 * Get all nodes that have subscribers
 * (This would be provided by the pub-sub system)
 */
export interface SubscriberMap {
    [topic: string]: EntityId[];
}

/**
 * Determine which nodes need updates published
 */
export function getNodesNeedingUpdates(
    entity: EntityState,
    subscriberMap: SubscriberMap,
    previousData?: Record<NodeId, RemoteSatisfactionData>
): NodeId[] {
    const nodesToUpdate: NodeId[] = [];

    for (const nodeId in entity.tree_store.nodes) {
        const topic = getTopicName(entity.entity_id, nodeId);
        const subscribers = subscriberMap[topic];

        if (!subscribers || subscribers.length === 0) {
            continue; // No subscribers for this node
        }

        const currentData = prepareSatisfactionUpdate(entity, nodeId);
        const prevData = previousData?.[nodeId];

        if (shouldPublishUpdate(prevData ?? null, currentData)) {
            nodesToUpdate.push(nodeId);
        }
    }

    return nodesToUpdate;
}
