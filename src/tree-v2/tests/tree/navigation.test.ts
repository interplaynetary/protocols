import { describe, it, expect, beforeEach } from 'vitest';
import type { TreeStore } from '../../schemas/tree';
import {
    getNode,
    getReference,
    getChildReferences,
    getParentReference,
    getAncestorReferences,
    getEffectivePoints,
    getEffectiveChildIds,
} from '../../tree/navigation';
import { createNodeAndReference } from '../../tree/mutation';
import { generateTreeVersion } from '../../tree/utils';

describe('Tree Navigation', () => {
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
                    name: 'Goal 1',
                    points: 70,
                    default_child_ids: [],
                    created_at: timestamp,
                    updated_at: timestamp,
                },
                goal_2: {
                    id: 'goal_2',
                    type: 'Goal',
                    name: 'Goal 2',
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
                    points_override: 50, // Override the 30 points from node
                    created_at: timestamp,
                },
            },
            derived_state: {},
            last_updated: timestamp,
        };
    });

    describe('getNode', () => {
        it('should get node from reference', () => {
            const node = getNode(tree, 'ref_goal_1');
            expect(node.id).toBe('goal_1');
            expect(node.name).toBe('Goal 1');
        });

        it('should throw for non-existent reference', () => {
            expect(() => getNode(tree, 'ref_nonexistent')).toThrow();
        });
    });

    describe('getReference', () => {
        it('should get reference by id', () => {
            const ref = getReference(tree, 'ref_goal_1');
            expect(ref.ref_id).toBe('ref_goal_1');
            expect(ref.node_id).toBe('goal_1');
        });

        it('should throw for non-existent reference', () => {
            expect(() => getReference(tree, 'ref_nonexistent')).toThrow();
        });
    });

    describe('getChildReferences', () => {
        it('should get children from override', () => {
            const children = getChildReferences(tree, 'ref_root');
            expect(children).toHaveLength(2);
            expect(children[0].ref_id).toBe('ref_goal_1');
            expect(children[1].ref_id).toBe('ref_goal_2');
        });

        it('should return empty array for leaf nodes', () => {
            const children = getChildReferences(tree, 'ref_goal_1');
            expect(children).toHaveLength(0);
        });
    });

    describe('getParentReference', () => {
        it('should get parent reference', () => {
            const parent = getParentReference(tree, 'ref_goal_1');
            expect(parent).not.toBeNull();
            expect(parent!.ref_id).toBe('ref_root');
        });

        it('should return null for root', () => {
            const parent = getParentReference(tree, 'ref_root');
            expect(parent).toBeNull();
        });
    });

    describe('getAncestorReferences', () => {
        it('should get all ancestors', () => {
            const ancestors = getAncestorReferences(tree, 'ref_goal_1');
            expect(ancestors).toHaveLength(1);
            expect(ancestors[0].ref_id).toBe('ref_root');
        });

        it('should return empty array for root', () => {
            const ancestors = getAncestorReferences(tree, 'ref_root');
            expect(ancestors).toHaveLength(0);
        });
    });

    describe('getEffectivePoints', () => {
        it('should get node points when no override', () => {
            const points = getEffectivePoints(tree, 'ref_goal_1');
            expect(points).toBe(70);
        });

        it('should get override points when present', () => {
            const points = getEffectivePoints(tree, 'ref_goal_2');
            expect(points).toBe(50); // Override, not 30 from node
        });
    });

    describe('getEffectiveChildIds', () => {
        it('should get override child ids when present', () => {
            const childIds = getEffectiveChildIds(tree, 'ref_root');
            expect(childIds).toEqual(['ref_goal_1', 'ref_goal_2']);
        });

        it('should get default child ids when no override', () => {
            const childIds = getEffectiveChildIds(tree, 'ref_goal_1');
            expect(childIds).toEqual([]);
        });
    });
});
