import { describe, it, expect, beforeEach } from 'vitest';
import type { TreeStore } from '../../schemas/tree';
import {
    validateTreeStructure,
    validateReference,
    hasCircularReferences,
    validateWeights,
    validateTree,
} from '../../tree/validation';
import { generateTreeVersion } from '../../tree/utils';

describe('Tree Validation', () => {
    let validTree: TreeStore;

    beforeEach(() => {
        const timestamp = Date.now();
        validTree = {
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
                    name: 'Goal',
                    points: 100,
                    default_child_ids: [],
                    created_at: timestamp,
                    updated_at: timestamp,
                },
            },
            tree_references: {
                ref_root: {
                    ref_id: 'ref_root',
                    node_id: 'root_1',
                    child_ref_ids: ['ref_goal'],
                    created_at: timestamp,
                },
                ref_goal: {
                    ref_id: 'ref_goal',
                    node_id: 'goal_1',
                    parent_ref_id: 'ref_root',
                    created_at: timestamp,
                },
            },
            derived_state: {},
            last_updated: timestamp,
        };
    });

    describe('validateTreeStructure', () => {
        it('should validate a valid tree', () => {
            const result = validateTreeStructure(validTree);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect missing root', () => {
            const invalidTree = { ...validTree, root_ref_id: 'ref_nonexistent' };
            const result = validateTreeStructure(invalidTree);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('should detect orphaned nodes', () => {
            const treeWithOrphan = {
                ...validTree,
                nodes: {
                    ...validTree.nodes,
                    orphan_1: {
                        id: 'orphan_1',
                        type: 'Goal' as const,
                        name: 'Orphan',
                        points: 50,
                        default_child_ids: [],
                        created_at: Date.now(),
                        updated_at: Date.now(),
                    },
                },
            };

            const result = validateTreeStructure(treeWithOrphan);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('Orphaned'))).toBe(true);
        });
    });

    describe('validateReference', () => {
        it('should validate valid reference', () => {
            const result = validateReference(validTree, 'ref_goal');
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect non-existent node', () => {
            const invalidTree = {
                ...validTree,
                tree_references: {
                    ...validTree.tree_references,
                    ref_goal: {
                        ...validTree.tree_references.ref_goal,
                        node_id: 'nonexistent',
                    },
                },
            };

            const result = validateReference(invalidTree, 'ref_goal');
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('non-existent node'))).toBe(true);
        });

        it('should detect non-existent parent', () => {
            const invalidTree = {
                ...validTree,
                tree_references: {
                    ...validTree.tree_references,
                    ref_goal: {
                        ...validTree.tree_references.ref_goal,
                        parent_ref_id: 'nonexistent_parent',
                    },
                },
            };

            const result = validateReference(invalidTree, 'ref_goal');
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('non-existent parent'))).toBe(true);
        });
    });

    describe('hasCircularReferences', () => {
        it('should detect no circular references in valid tree', () => {
            const hasCircular = hasCircularReferences(validTree);
            expect(hasCircular).toBe(false);
        });

        it('should detect circular reference', () => {
            // Create a cycle: root -> goal -> root (via child_ref_ids)
            const circularTree = {
                ...validTree,
                tree_references: {
                    ...validTree.tree_references,
                    ref_root: {
                        ...validTree.tree_references.ref_root,
                        child_ref_ids: ['ref_goal'],
                    },
                    ref_goal: {
                        ...validTree.tree_references.ref_goal,
                        child_ref_ids: ['ref_root'], // Creates cycle back to root
                        parent_ref_id: 'ref_root',
                    },
                },
            };

            const hasCircular = hasCircularReferences(circularTree);
            expect(hasCircular).toBe(true);
        });
    });

    describe('validateWeights', () => {
        it('should validate proper point distribution', () => {
            const timestamp = Date.now();
            const treeWithChildren = {
                ...validTree,
                nodes: {
                    ...validTree.nodes,
                    goal_2: {
                        id: 'goal_2',
                        type: 'Goal' as const,
                        name: 'Goal 2',
                        points: 100,
                        default_child_ids: [],
                        created_at: timestamp,
                        updated_at: timestamp,
                    },
                },
                tree_references: {
                    ...validTree.tree_references,
                    ref_root: {
                        ...validTree.tree_references.ref_root,
                        child_ref_ids: ['ref_goal', 'ref_goal_2'],
                    },
                    ref_goal_2: {
                        ref_id: 'ref_goal_2',
                        node_id: 'goal_2',
                        parent_ref_id: 'ref_root',
                        created_at: timestamp,
                    },
                },
            };

            const result = validateWeights(treeWithChildren);
            expect(result.valid).toBe(true);
        });

        it('should detect zero total points', () => {
            const treeWithZero = {
                ...validTree,
                nodes: {
                    ...validTree.nodes,
                    goal_1: {
                        ...validTree.nodes.goal_1,
                        points: 0,
                    },
                },
            };

            const result = validateWeights(treeWithZero);
            expect(result.valid).toBe(false);
        });
    });

    describe('validateTree', () => {
        it('should validate entire tree', () => {
            const result = validateTree(validTree);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should catch validation errors', () => {
            const invalidTree = {
                ...validTree,
                nodes: {
                    ...validTree.nodes,
                    orphan: {
                        id: 'orphan',
                        type: 'Goal' as const,
                        name: 'Orphan',
                        points: 50,
                        default_child_ids: [],
                        created_at: Date.now(),
                        updated_at: Date.now(),
                    },
                },
            };

            const result = validateTreeStructure(invalidTree);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('Orphaned'))).toBe(true);
        });
    });
});
