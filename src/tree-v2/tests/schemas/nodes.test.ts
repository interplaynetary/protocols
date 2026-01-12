import { describe, it, expect } from 'vitest';
import {
    RootNodeSchema,
    GoalNodeSchema,
    CapacitySlotSchema,
    NeedSlotSchema,
    ContributionNodeBaseSchema,
    SymLinkNodeSchema,
    NodeDefinitionSchema,
} from '../../schemas/nodes';

describe('Node Schemas', () => {
    const timestamp = Date.now();

    describe('ContributionNodeSchema', () => {
        it('should validate a valid ContributionNode with share_map', () => {
            const timestamp = Date.now();

            const contributionNode = {
                id: 'node-contribution-1',
                type: 'ContributionNode' as const,
                name: 'Build Feature X',
                default_child_ids: [],
                created_at: timestamp,
                updated_at: timestamp,
                share_map: {
                    'alice': 50,
                    'bob': 30,
                },
            };

            expect(() => ContributionNodeBaseSchema.parse(contributionNode)).not.toThrow();
        });

        it('should validate ContributionNode with manual_satisfaction', () => {
            const timestamp = Date.now();

            const contributionNode = {
                id: 'node-contribution-2',
                type: 'ContributionNode' as const,
                name: 'Research Task',
                default_child_ids: [],
                created_at: timestamp,
                updated_at: timestamp,
                share_map: {
                    'charlie': 100,
                },
                manual_satisfaction: 0.8,
            };

            expect(() => ContributionNodeBaseSchema.parse(contributionNode)).not.toThrow();
        });
    });

    describe('GoalNodeSchema', () => {
        it('should validate valid goal node', () => {
            const goal = {
                id: 'goal_1',
                type: 'Goal' as const,
                name: 'Education',
                points: 70,
                default_child_ids: [],
                created_at: timestamp,
                updated_at: timestamp,
            };
            expect(() => GoalNodeSchema.parse(goal)).not.toThrow();
        });

        it('should reject goal without points', () => {
            const goal = {
                id: 'goal_1',
                type: 'Goal' as const,
                name: 'Education',
                default_child_ids: [],
                created_at: timestamp,
                updated_at: timestamp,
            };
            expect(() => GoalNodeSchema.parse(goal)).toThrow();
        });
    });

    describe('CapacitySlotSchema', () => {
        it('should validate valid capacity slot', () => {
            const capacity = {
                id: 'cap_1',
                type: 'CapacitySlot' as const,
                name: 'Tutoring Hours',
                points: 80,
                resource_type: 'time',
                available_quantity: 100,
                contributors: [],
                default_child_ids: [],
                created_at: timestamp,
                updated_at: timestamp,
            };
            expect(() => CapacitySlotSchema.parse(capacity)).not.toThrow();
        });

        it('should auto-default contributors to empty array', () => {
            const capacity = {
                id: 'cap_1',
                type: 'CapacitySlot' as const,
                name: 'Tutoring Hours',
                points: 80,
                resource_type: 'time',
                available_quantity: 100,
                default_child_ids: [],
                created_at: timestamp,
                updated_at: timestamp,
            };
            expect(() => CapacitySlotSchema.parse(capacity)).not.toThrow();
        });
    });

    describe('NeedSlotSchema', () => {
        it('should validate valid need slot', () => {
            const need = {
                id: 'need_1',
                type: 'NeedSlot' as const,
                name: 'Math Tutoring',
                points: 60,
                resource_type: 'time',
                declared_quantity: 50,
                default_child_ids: [],
                created_at: timestamp,
                updated_at: timestamp,
            };
            expect(() => NeedSlotSchema.parse(need)).not.toThrow();
        });
    });

    describe('ContributionNodeSchema (legacy tests)', () => {
        it('should validate ContributionNode with share_map', () => {
            const contribution = {
                id: 'contribution_1',
                type: 'ContributionNode' as const,
                name: 'Community Support',
                share_map: { 'entity_1': 100 },
                default_child_ids: [],
                created_at: timestamp,
                updated_at: timestamp,
            };
            expect(() => ContributionNodeBaseSchema.parse(contribution)).not.toThrow();
        });

        it('should validate ContributionNode with manual satisfaction', () => {
            const contribution = {
                id: 'contribution_2',
                type: 'ContributionNode' as const,
                name: 'Research Task',
                manual_satisfaction: 0.8,
                share_map: { 'entity_1': 100 },
                default_child_ids: [],
                created_at: timestamp,
                updated_at: timestamp,
            };
            expect(() => ContributionNodeBaseSchema.parse(contribution)).not.toThrow();
        });
    });

    describe('SymLinkNodeSchema', () => {
        it('should validate valid symlink', () => {
            const symlink = {
                id: 'symlink_1',
                type: 'SymLink' as const,
                name: 'NASA Education',
                points: 80,
                symlink_target: {
                    entity_id: 'nasa',
                    node_id: 'nasa_edu_goal',
                    link_type: 'subtree' as const,
                },
                default_child_ids: [],
                created_at: timestamp,
                updated_at: timestamp,
            };
            expect(() => SymLinkNodeSchema.parse(symlink)).not.toThrow();
        });

        it('should validate all link types', () => {
            const baseSymlink = {
                id: 'symlink_1',
                type: 'SymLink' as const,
                name: 'Test Link',
                points: 50,
                default_child_ids: [],
                created_at: timestamp,
                updated_at: timestamp,
            };

            expect(() =>
                SymLinkNodeSchema.parse({
                    ...baseSymlink,
                    symlink_target: {
                        entity_id: 'e1',
                        node_id: 'n1',
                        link_type: 'tree' as const,
                    },
                })
            ).not.toThrow();

            expect(() =>
                SymLinkNodeSchema.parse({
                    ...baseSymlink,
                    symlink_target: {
                        entity_id: 'e1',
                        node_id: 'n1',
                        link_type: 'subtree' as const,
                    },
                })
            ).not.toThrow();

            expect(() =>
                SymLinkNodeSchema.parse({
                    ...baseSymlink,
                    symlink_target: {
                        entity_id: 'e1',
                        node_id: 'n1',
                        link_type: 'node' as const,
                    },
                })
            ).not.toThrow();
        });
    });

    describe('NodeDefinitionSchema (discriminated union)', () => {
        it('should correctly discriminate by type', () => {
            const goal = {
                id: 'goal_1',
                type: 'Goal' as const,
                name: 'Test',
                points: 50,
                default_child_ids: [],
                created_at: timestamp,
                updated_at: timestamp,
            };

            const parsed = NodeDefinitionSchema.parse(goal);
            expect(parsed.type).toBe('Goal');
            if (parsed.type === 'Goal') {
                expect(parsed.points).toBe(50);
            }
        });
    });
});
