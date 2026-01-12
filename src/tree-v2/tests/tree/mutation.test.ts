import { describe, it, expect, beforeEach } from 'vitest';
import type { TreeStore } from '../../schemas/tree';
import {
    createNode,
    createReference,
    updateNode,
    updateReference,
    deleteNode,
    deleteReference,
    createNodeAndReference,
    cloneReference,
} from '../../tree/mutation';
import { generateTreeVersion } from '../../tree/utils';

describe('Tree Mutation', () => {
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
                    name: 'Test Root',
                    entity_id: 'entity_test',
                    default_child_ids: [],
                    created_at: timestamp,
                    updated_at: timestamp,
                },
            },
            tree_references: {
                ref_root: {
                    ref_id: 'ref_root',
                    node_id: 'root_1',
                    created_at: timestamp,
                },
            },
            derived_state: {},
            last_updated: timestamp,
        };
    });

    describe('createNode', () => {
        it('should create a new node', () => {
            const { tree: newTree, node_id } = createNode(tree, {
                type: 'Goal',
                name: 'New Goal',
                points: 100,
                default_child_ids: [],
            });

            expect(newTree.nodes[node_id]).toBeDefined();
            expect(newTree.nodes[node_id].name).toBe('New Goal');
            expect(newTree.nodes[node_id].type).toBe('Goal');
        });

        it('should generate timestamps', () => {
            const { tree: newTree, node_id } = createNode(tree, {
                type: 'Goal',
                name: 'New Goal',
                points: 100,
                default_child_ids: [],
            });

            expect(newTree.nodes[node_id].created_at).toBeGreaterThan(0);
            expect(newTree.nodes[node_id].updated_at).toBeGreaterThan(0);
        });

        it('should update tree version', () => {
            const oldVersion = tree.tree_version;
            const { tree: newTree } = createNode(tree, {
                type: 'Goal',
                name: 'New Goal',
                points: 100,
                default_child_ids: [],
            });

            expect(newTree.tree_version).not.toBe(oldVersion);
        });
    });

    describe('createReference', () => {
        it('should create a reference to existing node', () => {
            const { tree: treeWithNode, node_id } = createNode(tree, {
                type: 'Goal',
                name: 'Test Goal',
                points: 50,
                default_child_ids: [],
            });

            const { tree: finalTree, ref_id } = createReference(treeWithNode, {
                node_id,
                parent_ref_id: 'ref_root',
            });

            expect(finalTree.tree_references[ref_id]).toBeDefined();
            expect(finalTree.tree_references[ref_id].node_id).toBe(node_id);
            expect(finalTree.tree_references[ref_id].parent_ref_id).toBe('ref_root');
        });

        it('should allow points override', () => {
            const { tree: treeWithNode, node_id } = createNode(tree, {
                type: 'Goal',
                name: 'Test Goal',
                points: 50,
                default_child_ids: [],
            });

            const { tree: finalTree, ref_id } = createReference(treeWithNode, {
                node_id,
                parent_ref_id: 'ref_root',
                points_override: 75,
            });

            expect(finalTree.tree_references[ref_id].points_override).toBe(75);
        });

        it('should throw if node does not exist', () => {
            expect(() =>
                createReference(tree, {
                    node_id: 'nonexistent_node',
                    parent_ref_id: 'ref_root',
                })
            ).toThrow();
        });
    });

    describe('updateNode', () => {
        it('should update node properties', () => {
            const updatedTree = updateNode(tree, 'root_1', {
                name: 'Updated Root',
            });

            expect(updatedTree.nodes.root_1.name).toBe('Updated Root');
        });

        it('should update timestamp', async () => {
            const oldTimestamp = tree.nodes.root_1.updated_at;
            // Small delay to ensure timestamp changes
            await new Promise(resolve => setTimeout(resolve, 5));
            const updatedTree = updateNode(tree, 'root_1', {
                name: 'Updated Root',
            });

            expect(updatedTree.nodes.root_1.updated_at).toBeGreaterThanOrEqual(oldTimestamp);
        });

        it('should throw if node does not exist', () => {
            expect(() =>
                updateNode(tree, 'nonexistent_node', { name: 'Test' })
            ).toThrow();
        });
    });

    describe('deleteNode', () => {
        it('should delete node if no references exist', () => {
            const { tree: treeWithNode, node_id } = createNode(tree, {
                type: 'Goal',
                name: 'To Delete',
                points: 50,
                default_child_ids: [],
            });

            const treeAfterDelete = deleteNode(treeWithNode, node_id);
            expect(treeAfterDelete.nodes[node_id]).toBeUndefined();
        });

        it('should throw if references exist', () => {
            expect(() => deleteNode(tree, 'root_1')).toThrow();
        });
    });

    describe('createNodeAndReference', () => {
        it('should create node and reference in one operation', () => {
            const { tree: finalTree, node_id, ref_id } = createNodeAndReference(
                tree,
                {
                    type: 'Goal',
                    name: 'Combined Op',
                    points: 60,
                    default_child_ids: [],
                },
                'ref_root'
            );

            expect(finalTree.nodes[node_id]).toBeDefined();
            expect(finalTree.tree_references[ref_id]).toBeDefined();
            expect(finalTree.tree_references[ref_id].node_id).toBe(node_id);
        });
    });

    describe('cloneReference', () => {
        it('should create new reference to same node', () => {
            const { tree: treeWithRef, ref_id: originalRef } = createNodeAndReference(
                tree,
                {
                    type: 'Goal',
                    name: 'Cloneable',
                    points: 40,
                    default_child_ids: [],
                },
                'ref_root'
            );

            const { tree: finalTree, ref_id: clonedRef } = cloneReference(
                treeWithRef,
                originalRef,
                'ref_root'
            );

            expect(finalTree.tree_references[clonedRef]).toBeDefined();
            expect(finalTree.tree_references[clonedRef].node_id).toBe(
                finalTree.tree_references[originalRef].node_id
            );
            expect(clonedRef).not.toBe(originalRef);
        });

        it('should allow override in clone', () => {
            const { tree: treeWithRef, ref_id: originalRef } = createNodeAndReference(
                tree,
                {
                    type: 'Goal',
                    name: 'Cloneable',
                    points: 40,
                    default_child_ids: [],
                },
                'ref_root'
            );

            const { tree: finalTree, ref_id: clonedRef } = cloneReference(
                treeWithRef,
                originalRef,
                'ref_root',
                { points_override: 80 }
            );

            expect(finalTree.tree_references[clonedRef].points_override).toBe(80);
        });
    });
});
