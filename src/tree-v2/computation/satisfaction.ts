import type { TreeStore } from '../schemas/tree';
import type { SymLinkCache, RemoteSatisfactionData } from '../schemas/symlinks';
import type { NodeId, RefId, Satisfaction, EntityId } from '../schemas/primitives';
import { getNode, getDerivedState, getChildReferences } from '../tree/navigation';
import { traverseBFS } from '../tree/traversal';
import { now } from '../tree/utils';
import { isFresh } from './cache';

// ═══════════════════════════════════════════════════════════════════════
// SATISFACTION CALCULATION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Calculate satisfaction for a node
 */
export function calculateSatisfaction(
    tree: TreeStore,
    node_id: NodeId,
    cache?: SymLinkCache
): Satisfaction {
    const node = tree.nodes[node_id];
    if (!node) {
        throw new Error(`Node not found: ${node_id}`);
    }

    const derived = tree.derived_state[node_id];

    // Check if this is a terminal node (has ShareMap or allocations)
    const isTerminal =
        (node.share_map && Object.keys(node.share_map).length > 0) ||
        (derived?.allocation_share_maps !== undefined);

    if (isTerminal) {
        return calculateTerminalSatisfaction(node, derived);
    }

    // Structural nodes: aggregate from children
    switch (node.type) {
        case 'Root':
        case 'Goal':
            return calculateStructuralSatisfaction(tree, node_id);

        case 'CapacitySlot':
            return calculateStructuralSatisfaction(tree, node_id);

        case 'NeedSlot':
            return calculateStructuralSatisfaction(tree, node_id);

        case 'SymLink':
            return calculateSymLinkSatisfaction(tree, node_id, cache);

        default:
            return 0;
    }
}

/**
 * Calculate satisfaction for terminal nodes (where value touches identity)
 * Uses ShareMap (direct) or allocation_share_maps (derived)
 */
function calculateTerminalSatisfaction(
    node: any,
    derived: any
): Satisfaction {
    // Get the relevant ShareMap (accepted quantities for allocations)
    const shareMap =
        node.share_map || derived?.allocation_share_maps?.accepted_share_map;

    if (!shareMap || Object.keys(shareMap).length === 0) {
        // Terminal but no contributors/allocations yet
        return node.manual_satisfaction ?? 0;
    }

    // For ContributionNode with manual satisfaction, use that
    if (node.type === 'ContributionNode' && node.manual_satisfaction !== undefined) {
        return node.manual_satisfaction;
    }

    // For allocation-based terminals, satisfaction = utilization
    // (Capacity: how much was used, Need: how much was received)
    // TODO: Incorporate provider/recipient satisfaction ratings
    // For now, assume satisfaction = 1.0 if allocated
    return Object.keys(shareMap).length > 0 ? 1.0 : 0;
}

/**
 * Calculate satisfaction for structural nodes (aggregate from children)
 * Unified function for Goal, Capacity, and Need when used structurally
 */
function calculateStructuralSatisfaction(
    tree: TreeStore,
    node_id: NodeId
): Satisfaction {
    // Check cache first
    if (isFresh(tree, node_id)) {
        return tree.derived_state[node_id].satisfaction; // Cache hit!
    }

    // Find all references to this node
    const refs = Object.values(tree.tree_references).filter(
        (r) => r.node_id === node_id
    );

    if (refs.length === 0) {
        return 0;
    }

    // Use the first reference (or could average across all)
    const ref = refs[0];
    const children = getChildReferences(tree, ref.ref_id);

    if (children.length === 0) {
        return 0; // No children
    }

    // Calculate weighted average of children
    let totalWeightedSatisfaction = 0;
    let totalWeight = 0;

    for (const childRef of children) {
        const childNode = getNode(tree, childRef.ref_id);
        const childState = tree.derived_state[childNode.id];

        if (childState) {
            totalWeightedSatisfaction +=
                childState.weight * childState.satisfaction;
            totalWeight += childState.weight;
        }
    }

    return totalWeight > 0 ? totalWeightedSatisfaction / totalWeight : 0;
}

/**
 * Calculate satisfaction for SymLink (from cache)
 */
function calculateSymLinkSatisfaction(
    tree: TreeStore,
    node_id: NodeId,
    cache?: SymLinkCache
): Satisfaction {
    if (!cache) {
        return 0;
    }

    const remoteSatisfaction = cache.remote_satisfaction[node_id];
    return remoteSatisfaction?.satisfaction ?? 0;
}

/**
 * Recalculate satisfaction for all nodes
 */
export function recalculateAllSatisfaction(
    tree: TreeStore,
    cache: SymLinkCache
): TreeStore {
    const updatedDerivedState = { ...tree.derived_state };
    const timestamp = now();

    // Process nodes in bottom-up order (leaves first)
    const processedNodes = new Set<NodeId>();

    function processNode(node_id: NodeId): void {
        if (processedNodes.has(node_id)) {
            return;
        }

        const satisfaction = calculateSatisfaction(tree, node_id, cache);

        const existingState = updatedDerivedState[node_id];
        updatedDerivedState[node_id] = {
            ...existingState,
            node_id,
            weight: existingState?.weight ?? 0,
            share_of_parent: existingState?.share_of_parent ?? 0,
            satisfaction,
            computed_at: timestamp,
            dependencies: existingState?.dependencies ?? [],
        };

        processedNodes.add(node_id);
    }

    // Traverse tree and process all nodes
    traverseBFS(tree, tree.root_ref_id, (ref, node) => {
        processNode(node.id);
    });

    return {
        ...tree,
        derived_state: updatedDerivedState,
        last_updated: timestamp,
    };
}
