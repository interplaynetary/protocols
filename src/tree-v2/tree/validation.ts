import type { TreeStore } from '../schemas/tree';
import type { RefId } from '../schemas/primitives';
import { getReference, getChildReferences, getEffectivePoints } from './navigation';
import { traverseBFS } from './traversal';

// ═══════════════════════════════════════════════════════════════════════
// VALIDATION TYPES
// ═══════════════════════════════════════════════════════════════════════

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

// ═══════════════════════════════════════════════════════════════════════
// STRUCTURE VALIDATION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Validate tree structure integrity
 */
export function validateTreeStructure(tree: TreeStore): ValidationResult {
    const errors: string[] = [];

    // Check root exists
    if (!tree.tree_references[tree.root_ref_id]) {
        errors.push(`Root reference not found: ${tree.root_ref_id}`);
        return { valid: false, errors };
    }

    // Validate all references
    for (const [refId, ref] of Object.entries(tree.tree_references)) {
        const refErrors = validateReference(tree, refId);
        errors.push(...refErrors.errors);
    }

    // Check for circular references
    if (hasCircularReferences(tree)) {
        errors.push('Tree contains circular references');
    }

    // Check for orphaned nodes
    const usedNodeIds = new Set(
        Object.values(tree.tree_references).map(ref => ref.node_id)
    );
    for (const nodeId of Object.keys(tree.nodes)) {
        if (!usedNodeIds.has(nodeId)) {
            errors.push(`Orphaned node: ${nodeId}`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate a single reference points to valid node
 */
export function validateReference(tree: TreeStore, ref_id: RefId): ValidationResult {
    const errors: string[] = [];

    const ref = tree.tree_references[ref_id];
    if (!ref) {
        errors.push(`Reference not found: ${ref_id}`);
        return { valid: false, errors };
    }

    // Check node exists
    if (!tree.nodes[ref.node_id]) {
        errors.push(`Reference ${ref_id} points to non-existent node: ${ref.node_id}`);
    }

    // Check parent exists (if not root)
    if (ref.parent_ref_id && !tree.tree_references[ref.parent_ref_id]) {
        errors.push(`Reference ${ref_id} has non-existent parent: ${ref.parent_ref_id}`);
    }

    // Check children exist
    if (ref.child_ref_ids) {
        for (const childId of ref.child_ref_ids) {
            if (!tree.tree_references[childId]) {
                errors.push(`Reference ${ref_id} has non-existent child: ${childId}`);
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Check for circular references
 */
export function hasCircularReferences(tree: TreeStore): boolean {
    const visiting = new Set<RefId>();
    const visited = new Set<RefId>();

    function detectCycle(refId: RefId): boolean {
        if (visiting.has(refId)) {
            return true; // Cycle detected
        }

        if (visited.has(refId)) {
            return false; // Already processed
        }

        visiting.add(refId);

        try {
            const children = getChildReferences(tree, refId);
            for (const child of children) {
                if (detectCycle(child.ref_id)) {
                    return true;
                }
            }
        } catch (e) {
            // Reference doesn't exist, will be caught by other validation
            return false;
        }

        visiting.delete(refId);
        visited.add(refId);

        return false;
    }

    return detectCycle(tree.root_ref_id);
}

/**
 * Validate weights sum to approximately 1.0 at each level
 */
export function validateWeights(tree: TreeStore): ValidationResult {
    const errors: string[] = [];
    const tolerance = 0.001; // Allow small floating point errors

    traverseBFS(tree, tree.root_ref_id, (ref) => {
        const children = getChildReferences(tree, ref.ref_id);

        if (children.length === 0) {
            return; // Leaf node, no children to validate
        }

        // Calculate sum of child points
        const totalPoints = children.reduce((sum, child) => {
            return sum + getEffectivePoints(tree, child.ref_id);
        }, 0);

        // Check if properly weighted (should sum to parent's total)
        if (totalPoints === 0) {
            errors.push(`Reference ${ref.ref_id} has children with zero total points`);
        }

        // Validate each child's share
        for (const child of children) {
            const points = getEffectivePoints(tree, child.ref_id);
            const share = totalPoints > 0 ? points / totalPoints : 0;

            if (share < 0 || share > 1 + tolerance) {
                errors.push(
                    `Reference ${child.ref_id} has invalid share: ${share} (points: ${points}, total: ${totalPoints})`
                );
            }
        }
    });

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate entire tree (structure + weights)
 */
export function validateTree(tree: TreeStore): ValidationResult {
    const structureResult = validateTreeStructure(tree);
    const weightsResult = validateWeights(tree);

    return {
        valid: structureResult.valid && weightsResult.valid,
        errors: [...structureResult.errors, ...weightsResult.errors],
    };
}
