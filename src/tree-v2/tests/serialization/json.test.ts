import { describe, it, expect, beforeEach } from 'vitest';
import type { TreeStore, EntityState } from '../../schemas';
import {
    serializeTree,
    deserializeTree,
    serializeEntityState,
    deserializeEntityState,
    safeDeserializeTree,
    safeDeserializeEntity,
} from '../../serialization';
import { generateTreeVersion } from '../../tree/utils';

describe('Serialization', () => {
    let tree: TreeStore;
    let entity: EntityState;

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

        entity = {
            entity_id: 'entity_test',
            tree_store: tree,
            symlink_cache: {
                subscriptions: {},
                remote_satisfaction: {},
            },
            share_map: {},
            allocations: [],
            last_updated: timestamp,
        };
    });

    describe('serializeTree / deserializeTree', () => {
        it('should serialize and deserialize tree', () => {
            const json = serializeTree(tree);
            expect(json).toBeTruthy();
            expect(typeof json).toBe('string');

            const deserialized = deserializeTree(json);
            expect(deserialized).toEqual(tree);
        });

        it('should validate during deserialization', () => {
            const invalidJson = '{"entity_id": "test"}'; // Missing required fields
            expect(() => deserializeTree(invalidJson)).toThrow();
        });

        it('should handle complex tree', () => {
            const timestamp = Date.now();
            const complexTree = {
                ...tree,
                nodes: {
                    ...tree.nodes,
                    goal_1: {
                        id: 'goal_1',
                        type: 'Goal' as const,
                        name: 'Complex Goal',
                        points: 100,
                        default_child_ids: [],
                        created_at: timestamp,
                        updated_at: timestamp,
                    },
                },
            };

            const json = serializeTree(complexTree);
            const deserialized = deserializeTree(json);
            expect(deserialized.nodes.goal_1).toBeDefined();
            expect(deserialized.nodes.goal_1.name).toBe('Complex Goal');
        });
    });

    describe('serializeEntityState / deserializeEntityState', () => {
        it('should serialize and deserialize entity', () => {
            const json = serializeEntityState(entity);
            expect(json).toBeTruthy();

            const deserialized = deserializeEntityState(json);
            expect(deserialized).toEqual(entity);
        });

        it('should validate entity structure', () => {
            const invalidJson = '{"entity_id": "test"}';
            expect(() => deserializeEntityState(invalidJson)).toThrow();
        });
    });

    describe('safeDeserializeTree', () => {
        it('should return success for valid JSON', () => {
            const json = serializeTree(tree);
            const result = safeDeserializeTree(json);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(tree);
            expect(result.error).toBeUndefined();
        });

        it('should return error for invalid JSON', () => {
            const invalidJson = '{"invalid": "data"}';
            const result = safeDeserializeTree(invalidJson);

            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
            expect(result.data).toBeUndefined();
        });

        it('should handle malformed JSON', () => {
            const malformed = '{invalid json}';
            const result = safeDeserializeTree(malformed);

            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });
    });

    describe('safeDeserializeEntity', () => {
        it('should return success for valid entity JSON', () => {
            const json = serializeEntityState(entity);
            const result = safeDeserializeEntity(json);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(entity);
        });

        it('should return error for invalid entity JSON', () => {
            const invalidJson = '{"entity_id": "test"}';
            const result = safeDeserializeEntity(invalidJson);

            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });
    });

    describe('Round-trip preservation', () => {
        it('should preserve all data through round-trip', () => {
            const json = serializeEntityState(entity);
            const deserialized = deserializeEntityState(json);
            const reserialize = serializeEntityState(deserialized);

            expect(json).toBe(reserialize);
        });

        it('should preserve timestamps', () => {
            const json = serializeTree(tree);
            const deserialized = deserializeTree(json);

            expect(deserialized.nodes.root_1.created_at).toBe(
                tree.nodes.root_1.created_at
            );
            expect(deserialized.last_updated).toBe(tree.last_updated);
        });
    });
});
