import { z } from 'zod';
import {
    NodeIdSchema,
    EntityIdSchema,
    PointsSchema,
    ResourceTypeSchema,
    QuantitySchema,
    SatisfactionSchema,
    ContributorSchema,
    RefIdSchema,
    TimestampSchema,
    ShareMapSchema,
} from './primitives';

// ═══════════════════════════════════════════════════════════════════════
// SYMBOLIC LINK TARGET
// ═══════════════════════════════════════════════════════════════════════

export const SymLinkTargetSchema = z.object({
    entity_id: EntityIdSchema,
    node_id: NodeIdSchema,
    link_type: z.enum(['tree', 'subtree', 'node']),
});
export type SymLinkTarget = z.infer<typeof SymLinkTargetSchema>;

// ═══════════════════════════════════════════════════════════════════════
// BASE NODE DEFINITION
// ═══════════════════════════════════════════════════════════════════════

const BaseNodeDefinitionSchema = z.object({
    id: NodeIdSchema,
    name: z.string().min(1),
    default_child_ids: z.array(RefIdSchema).default([]),
    created_at: TimestampSchema,
    updated_at: TimestampSchema,

    // ShareMap for terminal nodes (direct contribution)
    share_map: ShareMapSchema.optional(),
});

// ═══════════════════════════════════════════════════════════════════════
// SPECIFIC NODE TYPES
// ═══════════════════════════════════════════════════════════════════════

export const RootNodeSchema = BaseNodeDefinitionSchema.extend({
    type: z.literal('Root'),
    entity_id: EntityIdSchema,
});
export type RootNode = z.infer<typeof RootNodeSchema>;

export const GoalNodeSchema = BaseNodeDefinitionSchema.extend({
    type: z.literal('Goal'),
    points: PointsSchema,
});
export type GoalNode = z.infer<typeof GoalNodeSchema>;

export const CapacitySlotSchema = BaseNodeDefinitionSchema.extend({
    type: z.literal('CapacitySlot'),
    points: PointsSchema,
    resource_type: ResourceTypeSchema,
    available_quantity: QuantitySchema,
    // ShareMaps are derived from allocations, not user input
});
export type CapacitySlot = z.infer<typeof CapacitySlotSchema>;

export const NeedSlotSchema = BaseNodeDefinitionSchema.extend({
    type: z.literal('NeedSlot'),
    points: PointsSchema,
    resource_type: ResourceTypeSchema,
    declared_quantity: QuantitySchema,
});
export type NeedSlot = z.infer<typeof NeedSlotSchema>;

export const ContributionNodeBaseSchema = BaseNodeDefinitionSchema.extend({
    type: z.literal('ContributionNode'),
    manual_satisfaction: SatisfactionSchema.optional(),
    anti_contributors: z.array(ContributorSchema).optional(),
});

// Validated ContributionNode (use this for parsing user input)
export const ContributionNodeSchema = ContributionNodeBaseSchema.refine(
    (node) => node.share_map && Object.keys(node.share_map).length > 0,
    { message: 'ContributionNode must have share_map (terminal node)' }
);
export type ContributionNode = z.infer<typeof ContributionNodeBaseSchema>;

export const SymLinkNodeSchema = BaseNodeDefinitionSchema.extend({
    type: z.literal('SymLink'),
    points: PointsSchema,
    symlink_target: SymLinkTargetSchema,
});
export type SymLinkNode = z.infer<typeof SymLinkNodeSchema>;

// ═══════════════════════════════════════════════════════════════════════
// NODE DEFINITION UNION
// ═══════════════════════════════════════════════════════════════════════

export const NodeDefinitionSchema = z.discriminatedUnion('type', [
    RootNodeSchema,
    GoalNodeSchema,
    CapacitySlotSchema,
    NeedSlotSchema,
    ContributionNodeBaseSchema, // Use base schema in union
    SymLinkNodeSchema,
]);
export type NodeDefinition = z.infer<typeof NodeDefinitionSchema>;
