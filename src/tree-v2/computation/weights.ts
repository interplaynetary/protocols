import type { TreeStore } from '../schemas/tree';
import type { RefId, Weight } from '../schemas/primitives';
import { getReference, getEffectivePoints, getParentReference, getChildReferences } from '../tree/navigation';
import { traverseBFS } from '../tree/traversal';
import { now } from '../tree/utils';

// ═══════════════════════════════════════════════════════════════════════
// WEIGHT CALCULATION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Calculate weight for a node based on its position in tree
 * Weight = (Points / Parent_Total_Points) × Parent_Weight
 */
export function calculateWeight(tree: TreeStore, ref_id: RefId): Weight {
    const ref = getReference(tree, ref_id);

    // Root always has weight 1.0
    if (!ref.parent_ref_id) {
        return 1.0;
    }

    const parent = getParentReference(tree, ref_id);
    if (!parent) {
        return 1.0;
    }

    // Get parent's weight
    const parentWeight = calculateWeight(tree, parent.ref_id);

    // Get all siblings (including self)
    const siblings = getChildReferences(tree, parent.ref_id);

    // Calculate total points among siblings
    const totalPoints = siblings.reduce((sum, sibling) => {
        return sum + getEffectivePoints(tree, sibling.ref_id);
    }, 0);

    if (totalPoints === 0) {
        return 0;
    }

    // Calculate this node's share
    const myPoints = getEffectivePoints(tree, ref_id);
    const shareOfParent = myPoints / totalPoints;

    return shareOfParent * parentWeight;
}

/**
 * Calculate share of parent for a reference
 */
export function calculateShareOfParent(tree: TreeStore, ref_id: RefId): Weight {
    const ref = getReference(tree, ref_id);

    // Root always has share 1.0
    if (!ref.parent_ref_id) {
        return 1.0;
    }

    const parent = getParentReference(tree, ref_id);
    if (!parent) {
        return 1.0;
    }

    // Get all siblings (including self)
    const siblings = getChildReferences(tree, parent.ref_id);

    // Calculate total points among siblings
    const totalPoints = siblings.reduce((sum, sibling) => {
        return sum + getEffectivePoints(tree, sibling.ref_id);
    }, 0);

    if (totalPoints === 0) {
        return 0;
    }

    // Calculate this node's share
    const myPoints = getEffectivePoints(tree, ref_id);
    return myPoints / totalPoints;
}

/**
 * Recalculate weights for all references in the tree
 */
export function recalculateAllWeights(tree: TreeStore): TreeStore {
    const updatedDerivedState = { ...tree.derived_state };
    const timestamp = now();

    // Traverse tree and calculate weights
    traverseBFS(tree, tree.root_ref_id, (ref, node) => {
        const weight = calculateWeight(tree, ref.ref_id);
        const shareOfParent = calculateShareOfParent(tree, ref.ref_id);

        // Update or create derived state
        const existingState = updatedDerivedState[node.id];
        updatedDerivedState[node.id] = {
            ...existingState,
            node_id: node.id,
            weight,
            share_of_parent: shareOfParent,
            satisfaction: existingState?.satisfaction ?? 0,
            computed_at: timestamp,
            dependencies: existingState?.dependencies ?? [],
        };
    });

    return {
        ...tree,
        derived_state: updatedDerivedState,
        last_updated: timestamp,
    };
}
