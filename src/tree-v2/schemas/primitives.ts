import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Entity identifier (public key, contact ID, or organization ID)
 */
export const EntityIdSchema = z.string().min(1);
export type EntityId = z.infer<typeof EntityIdSchema>;

/**
 * Node identifier (unique within an entity's tree)
 */
export const NodeIdSchema = z.string().min(1);
export type NodeId = z.infer<typeof NodeIdSchema>;

/**
 * Reference identifier (unique within an entity's tree)
 */
export const RefIdSchema = z.string().min(1);
export type RefId = z.infer<typeof RefIdSchema>;

/**
 * Resource type identifier
 */
export const ResourceTypeSchema = z.string().min(1);
export type ResourceType = z.infer<typeof ResourceTypeSchema>;

/**
 * Unix timestamp in milliseconds
 */
export const TimestampSchema = z.number().int().positive();
export type Timestamp = z.infer<typeof TimestampSchema>;

/**
 * Satisfaction value [0.0, 1.0]
 */
export const SatisfactionSchema = z.number().min(0).max(1);
export type Satisfaction = z.infer<typeof SatisfactionSchema>;

/**
 * Points (positive integer for relative weighting)
 */
export const PointsSchema = z.number().int().positive();
export type Points = z.infer<typeof PointsSchema>;

/**
 * Quantity (non-negative number for resources)
 */
export const QuantitySchema = z.number().nonnegative();
export type Quantity = z.infer<typeof QuantitySchema>;

/**
 * Weight value [0.0, 1.0]
 */
export const WeightSchema = z.number().min(0).max(1);
export type Weight = z.infer<typeof WeightSchema>;

/**
 * Node type discriminator
 */
export const NodeTypeSchema = z.enum([
    'Root',
    'Goal',
    'CapacitySlot',
    'NeedSlot',
    'ContributionNode',
    'SymLink',
]);
export type NodeType = z.infer<typeof NodeTypeSchema>;

// ═══════════════════════════════════════════════════════════════════════
// SHAREMAP (TERMINAL NODE REPRESENTATION)
// ═══════════════════════════════════════════════════════════════════════

/**
 * ShareMap: Maps entities to their share (points or quantity)
 * Used for terminal nodes where value touches identity
 */
export const ShareMapSchema = z.record(EntityIdSchema, z.number().min(0));
export type ShareMap = z.infer<typeof ShareMapSchema>;

/**
 * Allocation-derived ShareMaps (stored in derived state)
 * Represents the three aspects of allocation from a node's perspective
 */
export const AllocationShareMapsSchema = z.object({
    offered_share_map: ShareMapSchema,
    accepted_share_map: ShareMapSchema,
    declined_share_map: ShareMapSchema,
});
export type AllocationShareMaps = z.infer<typeof AllocationShareMapsSchema>;

/**
 * Contributor with points
 */
export const ContributorSchema = z.object({
    id: EntityIdSchema,
    points: PointsSchema,
});
export type Contributor = z.infer<typeof ContributorSchema>;
