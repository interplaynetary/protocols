import type { TreeStore } from '../schemas/tree';
import type { NodeId } from '../schemas/primitives';

// ═══════════════════════════════════════════════════════════════════════
// CACHE INVALIDATION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Mark a node's satisfaction as stale (needs recomputation)
 */
export function markStale(tree: TreeStore, node_id: NodeId): void {
    const derived = tree.derived_state[node_id];
    if (derived) {
        tree.derived_state[node_id] = {
            ...derived,
            computed_at: 0, // Mark as stale
        };
    }
}

/**
 * When a node changes, invalidate its parent chain
 * (Parents need to recalculate because their child changed)
 */
export function invalidateParents(tree: TreeStore, changed_node_id: NodeId): void {
    // Find all references to this node
    const refs = Object.values(tree.tree_references).filter(
        (r) => r.node_id === changed_node_id
    );

    for (const ref of refs) {
        if (ref.parent_ref_id) {
            const parent_ref = tree.tree_references[ref.parent_ref_id];
            const parent_node_id = parent_ref.node_id;

            // Mark parent as stale
            markStale(tree, parent_node_id);

            // Recursively invalidate grandparents
            invalidateParents(tree, parent_node_id);
        }
    }
}

/**
 * Check if a node's cached satisfaction is still fresh
 */
export function isFresh(tree: TreeStore, node_id: NodeId): boolean {
    const derived = tree.derived_state[node_id];
    if (!derived || derived.computed_at === 0) {
        return false; // No cache or marked stale
    }

    // Check if any child is newer than this node
    for (const dep_id of derived.dependencies) {
        const dep_state = tree.derived_state[dep_id];
        if (dep_state && dep_state.computed_at > derived.computed_at) {
            return false; // Child changed, cache is stale
        }
    }

    return true; // Cache is fresh
}
