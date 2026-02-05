/**
 * Bi-Level ADMM Allocation Schemas
 * 
 * Simplified schemas for slot-based priority allocation with:
 * - Participant-level global priorities
 * - Slot-level compatibility constraints
 * - Multi-dimensional matching (time, location, type)
 */

import * as z from 'zod';

// ═══════════════════════════════════════════════════════════════════
// BASIC TYPES
// ═══════════════════════════════════════════════════════════════════

export const IdSchema = z.string().min(1);
export const PercentageSchema = z.number().gte(0).lte(1);

/**
 * Global Priority Distribution
 * Maps participant IDs to their priority percentages (must sum to 1.0)
 */
export const PriorityMapSchema = z.record(IdSchema, PercentageSchema);
export type PriorityMap = z.infer<typeof PriorityMapSchema>;

// ═══════════════════════════════════════════════════════════════════
// TIME CONSTRAINTS
// ═══════════════════════════════════════════════════════════════════

export const TimeWindowSchema = z.object({
    start: z.date(),
    end: z.date()
});

export type TimeWindow = z.infer<typeof TimeWindowSchema>;

// ═══════════════════════════════════════════════════════════════════
// LOCATION CONSTRAINTS
// ═══════════════════════════════════════════════════════════════════

export const GeoConstraintSchema = z.object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    radius_km: z.number().gte(0).optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    country: z.string().optional()
});

export type GeoConstraint = z.infer<typeof GeoConstraintSchema>;

// ═══════════════════════════════════════════════════════════════════
// PARTICIPANT
// ═══════════════════════════════════════════════════════════════════

/**
 * Participant - Entity that provides capacity or expresses needs
 */
export const ParticipantSchema = z.object({
    id: IdSchema,
    name: z.string(),

    /**
     * Global priority distribution across other participants
     * Must sum to 1.0 (100%)
     * Example: { "alice": 0.6, "bob": 0.4 }
     */
    global_priorities: PriorityMapSchema
});

export type Participant = z.infer<typeof ParticipantSchema>;

// ═══════════════════════════════════════════════════════════════════
// SLOTS
// ═══════════════════════════════════════════════════════════════════

/**
 * Slot - Represents a specific availability or need with constraints
 * 
 * Provider slots have capacity > 0
 * Recipient slots have need > 0
 */
export const SlotSchema = z.object({
    id: IdSchema,
    owner_id: IdSchema,

    // Resource specification
    type: z.string(),
    capacity_or_need: z.number().gt(0),

    // Constraints for matching
    time_window: TimeWindowSchema.optional(),
    location: GeoConstraintSchema.optional(),

    // Metadata
    name: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional()
});

export type Slot = z.infer<typeof SlotSchema>;

// ═══════════════════════════════════════════════════════════════════
// COMPATIBILITY
// ═══════════════════════════════════════════════════════════════════

/**
 * Compatibility check result
 */
export const CompatibilityResultSchema = z.object({
    provider_slot_id: IdSchema,
    recipient_slot_id: IdSchema,
    compatible: z.boolean(),
    reason: z.string().optional() // Why incompatible, if applicable
});

export type CompatibilityResult = z.infer<typeof CompatibilityResultSchema>;

// ═══════════════════════════════════════════════════════════════════
// ALLOCATION RESULTS
// ═══════════════════════════════════════════════════════════════════

/**
 * Slot-level allocation record
 */
export const SlotAllocationSchema = z.object({
    provider_slot_id: IdSchema,
    recipient_slot_id: IdSchema,
    amount: z.number().gte(0),

    // Metadata
    provider_priority: PercentageSchema, // Slot-specific priority from provider's view
    recipient_priority: PercentageSchema, // Slot-specific priority from recipient's view
    from_surplus: z.boolean().default(false) // Whether this came from surplus redistribution
});

export type SlotAllocation = z.infer<typeof SlotAllocationSchema>;

/**
 * Complete allocation result
 */
export const AllocationResultSchema = z.object({
    allocations: z.array(SlotAllocationSchema),

    // Convergence metrics
    iterations: z.number().int().gte(0),
    converged: z.boolean(),
    primal_residual: z.number().gte(0),
    dual_residual: z.number().gte(0),

    // Satisfaction metrics
    provider_satisfaction: z.number().gte(0).lte(1),
    recipient_satisfaction: z.number().gte(0).lte(1),
    system_efficiency: z.number().gte(0).lte(1)
});

export type AllocationResult = z.infer<typeof AllocationResultSchema>;

// ═══════════════════════════════════════════════════════════════════
// ADMM STATE (Internal)
// ═══════════════════════════════════════════════════════════════════

/**
 * Internal ADMM state (not exposed to users)
 */
export interface ADMMState {
    // Consensus allocation: x[provider_slot_id][recipient_slot_id]
    x: Map<string, Map<string, number>>;

    // Provider ideal: z_p[provider_slot_id][recipient_slot_id]
    z_p: Map<string, Map<string, number>>;

    // Recipient ideal: z_r[provider_slot_id][recipient_slot_id]
    z_r: Map<string, Map<string, number>>;

    // Dual variables: u[provider_slot_id][recipient_slot_id]
    u: Map<string, Map<string, number>>;
}

/**
 * Slot-specific priorities (calculated from global priorities)
 */
export interface SlotPriorities {
    // provider_slot_id -> recipient_slot_id -> priority
    provider: Map<string, Map<string, number>>;

    // recipient_slot_id -> provider_slot_id -> priority
    recipient: Map<string, Map<string, number>>;
}

/**
 * ADMM configuration
 */
export const ADMMConfigSchema = z.object({
    rho: z.number().gt(0).default(1.0),
    epsilon: z.number().gt(0).default(0.01),
    max_iterations: z.number().int().gt(0).default(1000),
    blend_factor: z.number().gte(0).lte(1).default(0.5) // For z_p/z_r blending
});

export type ADMMConfig = z.infer<typeof ADMMConfigSchema>;
