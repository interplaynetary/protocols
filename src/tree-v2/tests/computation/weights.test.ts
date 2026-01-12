import { describe, it, expect, beforeEach } from 'vitest';
import type { TreeStore } from '../../schemas/tree';
import { calculateWeight, calculateShareOfParent, recalculateAllWeights } from '../../computation/weights';
import { generateTreeVersion } from '../../tree/utils';

describe('Weight Calculation', () => {
    let tree: TreeStore;

    beforeEach(() => {
        const timestamp = Date.now();
        tree = {
            entity_id: 'entity_test',
            root_ref_id: 'ref_root',
            tree_version: generateTreeVersion(),
            nodes: {
                root_1: {
                    id: 'root_1',
                    type: 'Root',
                    name: 'Root',
                    entity_id: 'entity_test',
                    default_child_ids: [],
                    created_at: timestamp,
                    updated_at: timestamp,
                },
                goal_1: {
                    id: 'goal_1',
                    type: 'Goal',
                    name: 'Education',
                    points: 70,
                    default_child_ids: [],
                    created_at: timestamp,
                    updated_at: timestamp,
                },
                goal_2: {
                    id: 'goal_2',
                    type: 'Goal',
                    name: 'Healthcare',
                    points: 30,
                    default_child_ids: [],
                    created_at: timestamp,
                    updated_at: timestamp,
                },
            },
            tree_references: {
                ref_root: {
                    ref_id: 'ref_root',
                    node_id: 'root_1',
                    child_ref_ids: ['ref_goal_1', 'ref_goal_2'],
                    created_at: timestamp,
                },
                ref_goal_1: {
                    ref_id: 'ref_goal_1',
                    node_id: 'goal_1',
                    parent_ref_id: 'ref_root',
                    created_at: timestamp,
                },
                ref_goal_2: {
                    ref_id: 'ref_goal_2',
                    node_id: 'goal_2',
                    parent_ref_id: 'ref_root',
                    created_at: timestamp,
                },
            },
            derived_state: {},
            last_updated: timestamp,
        };
    });

    describe('calculateWeight', () => {
        it('should calculate root weight as 1.0', () => {
            const weight = calculateWeight(tree, 'ref_root');
            expect(weight).toBe(1.0);
        });

        it('should calculate child weight correctly', () => {
            // 70 / (70 + 30) * 1.0 = 0.7
            const weight = calculateWeight(tree, 'ref_goal_1');
            expect(weight).toBeCloseTo(0.7);
        });

        it('should calculate second child weight correctly', () => {
            // 30 / (70 + 30) * 1.0 = 0.3
            const weight = calculateWeight(tree, 'ref_goal_2');
            expect(weight).toBeCloseTo(0.3);
        });

        it('should handle points override', () => {
            // Add override
            tree.tree_references.ref_goal_1.points_override = 50;

            // Now: 50 / (50 + 30) * 1.0 = 0.625
            const weight = calculateWeight(tree, 'ref_goal_1');
            expect(weight).toBeCloseTo(0.625);
        });
    });

    describe('calculateShareOfParent', () => {
        it('should calculate share of parent', () => {
            const share = calculateShareOfParent(tree, 'ref_goal_1');
            expect(share).toBeCloseTo(0.7); // 70 / 100
        });

        it('should return 1.0 for root', () => {
            const share = calculateShareOfParent(tree, 'ref_root');
            expect(share).toBe(1.0);
        });
    });

    describe('recalculateAllWeights', () => {
        it('should calculate weights for all nodes', () => {
            const updatedTree = recalculateAllWeights(tree);

            expect(updatedTree.derived_state.root_1.weight).toBe(1.0);
            expect(updatedTree.derived_state.goal_1.weight).toBeCloseTo(0.7);
            expect(updatedTree.derived_state.goal_2.weight).toBeCloseTo(0.3);
        });

        it('should calculate share_of_parent for all nodes', () => {
            const updatedTree = recalculateAllWeights(tree);

            expect(updatedTree.derived_state.root_1.share_of_parent).toBe(1.0);
            expect(updatedTree.derived_state.goal_1.share_of_parent).toBeCloseTo(0.7);
            expect(updatedTree.derived_state.goal_2.share_of_parent).toBeCloseTo(0.3);
        });
    });
});
