import type { TreeStore } from '../schemas/tree';
import type { NodeDefinition } from '../schemas/nodes';
import type { TreeReference } from '../schemas/references';
import type { DerivedState } from '../schemas/derived';
import type { NodeId, RefId } from '../schemas/primitives';

// ═══════════════════════════════════════════════════════════════════════
// NODE ACCESS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Get the canonical node definition from a tree reference
 */
export function getNode(tree: TreeStore, ref_id: RefId): NodeDefinition {
    const ref = tree.tree_references[ref_id];
    if (!ref) {
        throw new Error(`Reference not found: ${ref_id}`);
    }

    const node = tree.nodes[ref.node_id];
    if (!node) {
        throw new Error(`Node not found: ${ref.node_id}`);
    }

    return node;
}

/**
 * Get the tree reference by ref_id
 */
export function getReference(tree: TreeStore, ref_id: RefId): TreeReference {
    const ref = tree.tree_references[ref_id];
    if (!ref) {
        throw new Error(`Reference not found: ${ref_id}`);
    }
    return ref;
}

/**
 * Find all references to a specific node
 */
export function findNodeReferences(tree: TreeStore, node_id: NodeId): TreeReference[] {
    return Object.values(tree.tree_references).filter(ref => ref.node_id === node_id);
}

/**
 * Get the root reference
 */
export function getRootReference(tree: TreeStore): TreeReference {
    return getReference(tree, tree.root_ref_id);
}

// ═══════════════════════════════════════════════════════════════════════
// HIERARCHY NAVIGATION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Get child references for a given reference
 * Uses child_ref_ids override if present, otherwise default_child_ids
 */
export function getChildReferences(tree: TreeStore, ref_id: RefId): TreeReference[] {
    const ref = getReference(tree, ref_id);
    const node = getNode(tree, ref_id);

    // Use override if present, otherwise use default
    const childRefIds = ref.child_ref_ids ?? node.default_child_ids;

    return childRefIds
        .map(id => tree.tree_references[id])
        .filter((ref): ref is TreeReference => ref !== undefined);
}

/**
 * Get parent reference
 */
export function getParentReference(tree: TreeStore, ref_id: RefId): TreeReference | null {
    const ref = getReference(tree, ref_id);

    if (!ref.parent_ref_id) {
        return null;
    }

    return getReference(tree, ref.parent_ref_id);
}

/**
 * Get all ancestor references from ref to root
 */
export function getAncestorReferences(tree: TreeStore, ref_id: RefId): TreeReference[] {
    const ancestors: TreeReference[] = [];
    let current = getReference(tree, ref_id);

    while (current.parent_ref_id) {
        current = getReference(tree, current.parent_ref_id);
        ancestors.push(current);
    }

    return ancestors;
}

/**
 * Get descendant references (entire subtree)
 */
export function getDescendantReferences(tree: TreeStore, ref_id: RefId): TreeReference[] {
    const descendants: TreeReference[] = [];
    const queue: RefId[] = [ref_id];

    while (queue.length > 0) {
        const currentRefId = queue.shift()!;
        const children = getChildReferences(tree, currentRefId);

        for (const child of children) {
            descendants.push(child);
            queue.push(child.ref_id);
        }
    }

    return descendants;
}

// ═══════════════════════════════════════════════════════════════════════
// VALUE RESOLUTION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Get effective points (with override if present)
 */
export function getEffectivePoints(tree: TreeStore, ref_id: RefId): number {
    const ref = getReference(tree, ref_id);
    const node = getNode(tree, ref_id);

    // Return override if present
    if (ref.points_override !== undefined) {
        return ref.points_override;
    }

    // Otherwise return node's points
    if ('points' in node && node.points !== undefined) {
        return node.points;
    }

    return 0;
}

/**
 * Get effective children (with override if present)
 */
export function getEffectiveChildIds(tree: TreeStore, ref_id: RefId): RefId[] {
    const ref = getReference(tree, ref_id);
    const node = getNode(tree, ref_id);

    // Use override if present, otherwise use default
    return ref.child_ref_ids ?? node.default_child_ids;
}

/**
 * Get derived state for a node
 */
export function getDerivedState(tree: TreeStore, node_id: NodeId): DerivedState {
    const state = tree.derived_state[node_id];
    if (!state) {
        throw new Error(`Derived state not found for node: ${node_id}`);
    }
    return state;
}

/**
 * Get derived state from a reference
 */
export function getDerivedStateFromRef(tree: TreeStore, ref_id: RefId): DerivedState {
    const node = getNode(tree, ref_id);
    return getDerivedState(tree, node.id);
}
