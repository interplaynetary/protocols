import type { TreeStore } from '../schemas/tree';
import type { NodeDefinition } from '../schemas/nodes';
import type { TreeReference } from '../schemas/references';
import type { RefId } from '../schemas/primitives';
import { getReference, getNode, getChildReferences } from './navigation';

// ═══════════════════════════════════════════════════════════════════════
// TREE TRAVERSAL
// ═══════════════════════════════════════════════════════════════════════

/**
 * Breadth-first traversal of references
 */
export function traverseBFS(
    tree: TreeStore,
    start_ref_id: RefId,
    visitor: (ref: TreeReference, node: NodeDefinition) => void | boolean
): void {
    const queue: RefId[] = [start_ref_id];
    const visited = new Set<RefId>();

    while (queue.length > 0) {
        const refId = queue.shift()!;

        if (visited.has(refId)) {
            continue;
        }
        visited.add(refId);

        const ref = getReference(tree, refId);
        const node = getNode(tree, refId);

        // Call visitor, stop if it returns false
        const result = visitor(ref, node);
        if (result === false) {
            return;
        }

        // Add children to queue
        const children = getChildReferences(tree, refId);
        for (const child of children) {
            queue.push(child.ref_id);
        }
    }
}

/**
 * Depth-first traversal of references
 */
export function traverseDFS(
    tree: TreeStore,
    start_ref_id: RefId,
    visitor: (ref: TreeReference, node: NodeDefinition) => void | boolean
): void {
    const visited = new Set<RefId>();

    function visit(refId: RefId): boolean {
        if (visited.has(refId)) {
            return true;
        }
        visited.add(refId);

        const ref = getReference(tree, refId);
        const node = getNode(tree, refId);

        // Call visitor, stop if it returns false
        const result = visitor(ref, node);
        if (result === false) {
            return false;
        }

        // Visit children
        const children = getChildReferences(tree, refId);
        for (const child of children) {
            if (!visit(child.ref_id)) {
                return false;
            }
        }

        return true;
    }

    visit(start_ref_id);
}

/**
 * Find reference(s) by predicate
 */
export function findReferences(
    tree: TreeStore,
    predicate: (ref: TreeReference, node: NodeDefinition) => boolean
): TreeReference[] {
    const found: TreeReference[] = [];

    traverseBFS(tree, tree.root_ref_id, (ref, node) => {
        if (predicate(ref, node)) {
            found.push(ref);
        }
    });

    return found;
}

/**
 * Find a single reference by predicate
 */
export function findReference(
    tree: TreeStore,
    predicate: (ref: TreeReference, node: NodeDefinition) => boolean
): TreeReference | null {
    let result: TreeReference | null = null;

    traverseBFS(tree, tree.root_ref_id, (ref, node) => {
        if (predicate(ref, node)) {
            result = ref;
            return false; // Stop traversal
        }
    });

    return result;
}

/**
 * Get all references in the tree
 */
export function getAllReferences(tree: TreeStore): TreeReference[] {
    const refs: TreeReference[] = [];
    traverseBFS(tree, tree.root_ref_id, (ref) => {
        refs.push(ref);
    });
    return refs;
}

/**
 * Get all nodes in the tree (deduplicated)
 */
export function getAllNodes(tree: TreeStore): NodeDefinition[] {
    return Object.values(tree.nodes);
}
