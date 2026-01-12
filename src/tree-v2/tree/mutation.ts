import type { TreeStore } from '../schemas/tree';
import type { NodeDefinition } from '../schemas/nodes';
import type { TreeReference } from '../schemas/references';
import type { NodeId, RefId, Points } from '../schemas/primitives';
import { generateNodeId, generateRefId, generateTreeVersion, now } from './utils';
import { getReference, getNode } from './navigation';

// ═══════════════════════════════════════════════════════════════════════
// NODE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Create a new node definition
 */
export function createNode(
    tree: TreeStore,
    node: Omit<NodeDefinition, 'id' | 'created_at' | 'updated_at'>
): { tree: TreeStore; node_id: NodeId } {
    const node_id = generateNodeId();
    const timestamp = now();

    const newNode: NodeDefinition = {
        ...node,
        id: node_id,
        created_at: timestamp,
        updated_at: timestamp,
    } as NodeDefinition;

    return {
        tree: {
            ...tree,
            nodes: {
                ...tree.nodes,
                [node_id]: newNode,
            },
            tree_version: generateTreeVersion(),
            last_updated: timestamp,
        },
        node_id,
    };
}

/**
 * Update an existing node definition
 */
export function updateNode(
    tree: TreeStore,
    node_id: NodeId,
    updates: Partial<Omit<NodeDefinition, 'id' | 'type' | 'created_at'>>
): TreeStore {
    const existingNode = tree.nodes[node_id];
    if (!existingNode) {
        throw new Error(`Node not found: ${node_id}`);
    }

    const timestamp = now();

    return {
        ...tree,
        nodes: {
            ...tree.nodes,
            [node_id]: {
                ...existingNode,
                ...updates,
                updated_at: timestamp,
            } as NodeDefinition,
        },
        tree_version: generateTreeVersion(),
        last_updated: timestamp,
    };
}

/**
 * Delete a node definition (only if no references exist)
 */
export function deleteNode(tree: TreeStore, node_id: NodeId): TreeStore {
    // Check if any references use this node
    const hasReferences = Object.values(tree.tree_references).some(
        ref => ref.node_id === node_id
    );

    if (hasReferences) {
        throw new Error(`Cannot delete node ${node_id}: references still exist`);
    }

    const { [node_id]: _, ...remainingNodes } = tree.nodes;
    const { [node_id]: __, ...remainingDerivedState } = tree.derived_state;

    return {
        ...tree,
        nodes: remainingNodes,
        derived_state: remainingDerivedState,
        tree_version: generateTreeVersion(),
        last_updated: now(),
    };
}

// ═══════════════════════════════════════════════════════════════════════
// REFERENCE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Create a new tree reference to a node
 */
export function createReference(
    tree: TreeStore,
    params: {
        node_id: NodeId;
        parent_ref_id?: RefId;
        child_ref_ids?: RefId[];
        points_override?: Points;
    }
): { tree: TreeStore; ref_id: RefId } {
    const ref_id = generateRefId();
    const timestamp = now();

    // Validate node exists
    if (!tree.nodes[params.node_id]) {
        throw new Error(`Node not found: ${params.node_id}`);
    }

    // Validate parent exists (if specified)
    if (params.parent_ref_id && !tree.tree_references[params.parent_ref_id]) {
        throw new Error(`Parent reference not found: ${params.parent_ref_id}`);
    }

    const newRef: TreeReference = {
        ref_id,
        node_id: params.node_id,
        parent_ref_id: params.parent_ref_id,
        child_ref_ids: params.child_ref_ids,
        points_override: params.points_override,
        created_at: timestamp,
    };

    return {
        tree: {
            ...tree,
            tree_references: {
                ...tree.tree_references,
                [ref_id]: newRef,
            },
            tree_version: generateTreeVersion(),
            last_updated: timestamp,
        },
        ref_id,
    };
}

/**
 * Update a tree reference
 */
export function updateReference(
    tree: TreeStore,
    ref_id: RefId,
    updates: Partial<Omit<TreeReference, 'ref_id' | 'node_id' | 'created_at'>>
): TreeStore {
    const existingRef = getReference(tree, ref_id);

    return {
        ...tree,
        tree_references: {
            ...tree.tree_references,
            [ref_id]: {
                ...existingRef,
                ...updates,
            },
        },
        tree_version: generateTreeVersion(),
        last_updated: now(),
    };
}

/**
 * Delete a tree reference
 */
export function deleteReference(tree: TreeStore, ref_id: RefId): TreeStore {
    // Don't allow deleting root
    if (ref_id === tree.root_ref_id) {
        throw new Error('Cannot delete root reference');
    }

    // Remove from parent's children
    const ref = getReference(tree, ref_id);
    let updatedReferences = { ...tree.tree_references };

    if (ref.parent_ref_id) {
        const parent = updatedReferences[ref.parent_ref_id];
        if (parent && parent.child_ref_ids) {
            parent.child_ref_ids = parent.child_ref_ids.filter(id => id !== ref_id);
        }
    }

    // Delete the reference
    const { [ref_id]: _, ...remainingRefs } = updatedReferences;

    return {
        ...tree,
        tree_references: remainingRefs,
        tree_version: generateTreeVersion(),
        last_updated: now(),
    };
}

/**
 * Move a reference to a new parent
 */
export function moveReference(
    tree: TreeStore,
    ref_id: RefId,
    new_parent_ref_id: RefId
): TreeStore {
    if (ref_id === tree.root_ref_id) {
        throw new Error('Cannot move root reference');
    }

    const ref = getReference(tree, ref_id);
    const newParent = getReference(tree, new_parent_ref_id);

    let updatedTree = tree;

    // Remove from old parent's children
    if (ref.parent_ref_id) {
        const oldParent = tree.tree_references[ref.parent_ref_id];
        if (oldParent?.child_ref_ids) {
            updatedTree = updateReference(updatedTree, ref.parent_ref_id, {
                child_ref_ids: oldParent.child_ref_ids.filter(id => id !== ref_id),
            });
        }
    }

    // Add to new parent's children
    const newParentChildIds = newParent.child_ref_ids || [];
    updatedTree = updateReference(updatedTree, new_parent_ref_id, {
        child_ref_ids: [...newParentChildIds, ref_id],
    });

    // Update the reference's parent
    updatedTree = updateReference(updatedTree, ref_id, {
        parent_ref_id: new_parent_ref_id,
    });

    return updatedTree;
}

// ═══════════════════════════════════════════════════════════════════════
// COMPOUND OPERATIONS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Create node and reference it in tree in one operation
 */
export function createNodeAndReference(
    tree: TreeStore,
    node: Omit<NodeDefinition, 'id' | 'created_at' | 'updated_at'>,
    parent_ref_id: RefId,
    overrides?: {
        child_ref_ids?: RefId[];
        points_override?: Points;
    }
): { tree: TreeStore; node_id: NodeId; ref_id: RefId } {
    // Create node
    const { tree: treeWithNode, node_id } = createNode(tree, node);

    // Create reference
    const { tree: finalTree, ref_id } = createReference(treeWithNode, {
        node_id,
        parent_ref_id,
        ...overrides,
    });

    return { tree: finalTree, node_id, ref_id };
}

/**
 * Clone a reference (reuse node at different location)
 */
export function cloneReference(
    tree: TreeStore,
    source_ref_id: RefId,
    new_parent_ref_id: RefId,
    overrides?: {
        child_ref_ids?: RefId[];
        points_override?: Points;
    }
): { tree: TreeStore; ref_id: RefId } {
    const sourceRef = getReference(tree, source_ref_id);

    return createReference(tree, {
        node_id: sourceRef.node_id,
        parent_ref_id: new_parent_ref_id,
        child_ref_ids: overrides?.child_ref_ids ?? sourceRef.child_ref_ids,
        points_override: overrides?.points_override ?? sourceRef.points_override,
    });
}
