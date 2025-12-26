/**
 * Free Association Protocol v6 - Schemas
 * 
 * v6-specific schemas for satisfaction-based learning.
 * Re-exports base schemas from v5 for compatibility.
 */

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════
// RE-EXPORT V5 BASE SCHEMAS
// ═══════════════════════════════════════════════════════════════════

// Note: We import directly from src/schemas.ts to get all types
// The src/index.ts only exports a subset
export type {
    // ITC and Identity
    ITCStamp,

    // Tree Structure
    Node,
    RootNode,
    NonRootNode,
    Contributor,

    // Resources
    ResourceMetadata,
    NeedType,
    AvailabilityWindow,

    // Slots
    AvailabilitySlot,
    NeedSlot,
    SlotAllocationRecord,

    // Network
    Commitment,
    GlobalRecognitionWeights,

    ShareMap,
} from '../../../schemas.js';

// ═══════════════════════════════════════════════════════════════════
// V6-SPECIFIC SCHEMAS
// ═══════════════════════════════════════════════════════════════════

/**
 * Offering Policy - How providers convert allocations to offers
 * 
 * commitment_rate: What fraction of allocation to commit as offer (0.0-1.0)
 * auto_publish: Whether to automatically publish offers
 */
export const OfferingPolicySchema = z.object({
    commitment_rate: z.number().min(0).max(1).default(1.0),
    auto_publish: z.boolean().default(false)
});
export type OfferingPolicy = z.infer<typeof OfferingPolicySchema>;

/**
 * Acceptance Policy - How recipients accept offers
 * 
 * strategy: Which acceptance strategy to use
 * - manual: User reviews each offer (default)
 * - 1/N: Antifragile diversification (target_each = need / N_providers)
 * - weighted: Accept proportionally by reputation
 * - greedy: Accept best offers first
 * 
 * auto_accept: Whether to automatically execute the strategy
 */
export const AcceptancePolicySchema = z.object({
    strategy: z.enum(['manual', '1/N', 'weighted', 'greedy']).default('manual'),
    auto_accept: z.boolean().default(false)
});
export type AcceptancePolicy = z.infer<typeof AcceptancePolicySchema>;

/**
 * Individual Offer within an OfferRecord
 */
export const OfferItemSchema = z.object({
    to: z.string(), // Recipient public key
    quantity: z.number().min(0),
    tier: z.union([z.number(), z.string()]).optional(), // Tier priority or label
    need_slot_id: z.string().optional() // Which need slot this addresses
});
export type OfferItem = z.infer<typeof OfferItemSchema>;

/**
 * Offer Record - Provider's commitment to allocate resources
 * 
 * Published by providers after computing allocations and applying offering policy.
 * Immutable once published (use ITC for versioning).
 */
export const OfferRecordSchema = z.object({
    offer_id: z.string(),
    itc_stamp: z.any(), // ITCStamp from v5
    provider_id: z.string(), // Provider's public key
    capacity_slot_id: z.string(), // Which capacity slot
    offers: z.array(OfferItemSchema),
    created_at: z.string(), // ISO timestamp
    offering_policy: OfferingPolicySchema.optional()
});
export type OfferRecord = z.infer<typeof OfferRecordSchema>;

/**
 * Individual Acceptance/Decline within an AcceptanceRecord
 */
export const AcceptanceItemSchema = z.object({
    offer_id: z.string(),
    provider_id: z.string(),
    offered_quantity: z.number().min(0),
    accepted_quantity: z.number().min(0),
    declined_quantity: z.number().min(0)
});
export type AcceptanceItem = z.infer<typeof AcceptanceItemSchema>;

/**
 * Acceptance Record - Recipient's decision on offers
 * 
 * Published by recipients after reviewing offers (manual or policy-based).
 * Can accept full, partial, or decline.
 */
export const AcceptanceRecordSchema = z.object({
    acceptance_id: z.string(),
    itc_stamp: z.any(), // ITCStamp from v5
    recipient_id: z.string(), // Recipient's public key
    need_slot_id: z.string(), // Which need slot
    acceptances: z.array(AcceptanceItemSchema),
    created_at: z.string(), // ISO timestamp
    acceptance_policy: AcceptancePolicySchema.optional()
});
export type AcceptanceRecord = z.infer<typeof AcceptanceRecordSchema>;

/**
 * Individual Satisfaction Rating within a SatisfactionRecord
 */
export const SatisfactionRatingSchema = z.object({
    offer_id: z.string(),
    provider_id: z.string(),
    accepted_quantity: z.number().min(0),
    satisfaction: z.number().min(0).max(1), // 0.0 = terrible, 1.0 = perfect
    notes: z.string().optional() // Optional feedback
});
export type SatisfactionRating = z.infer<typeof SatisfactionRatingSchema>;

/**
 * Satisfaction Record - Recipient's quality rating of received resources
 * 
 * Published asynchronously (hours/days after acceptance) once recipient
 * has experienced the quality of the resource.
 */
export const SatisfactionRecordSchema = z.object({
    satisfaction_id: z.string(),
    itc_stamp: z.any(), // ITCStamp from v5
    recipient_id: z.string(), // Recipient's public key
    need_slot_id: z.string(), // Which need slot
    ratings: z.array(SatisfactionRatingSchema),
    created_at: z.string() // ISO timestamp
});
export type SatisfactionRecord = z.infer<typeof SatisfactionRecordSchema>;

/**
 * Provider Satisfaction - Aggregated satisfaction per capacity slot
 * 
 * Computed from all satisfaction ratings for a provider's capacity.
 * Used to weight recipient shares in MS formula.
 */
export const ProviderSatisfactionSchema = z.object({
    provider_id: z.string(),
    capacity_slot_id: z.string(),
    capacity_satisfaction: z.number().min(0).max(1), // Weighted average
    total_accepted: z.number().min(0), // Total quantity accepted
    rating_count: z.number().int().min(0), // Number of ratings
    last_updated: z.string() // ISO timestamp
});
export type ProviderSatisfaction = z.infer<typeof ProviderSatisfactionSchema>;

/**
 * Recipient Share - Learned shares from satisfaction data
 * 
 * Maps provider -> share for a given recipient.
 * Used in MS formula: MS = MR × recipient_share
 */
export const RecipientShareSchema = z.object({
    recipient_id: z.string(),
    provider_shares: z.record(z.string(), z.number().min(0).max(1)),
    last_updated: z.string() // ISO timestamp
});
export type RecipientShare = z.infer<typeof RecipientShareSchema>;

/**
 * Derived State - Computed values for a single node
 * 
 * Ephemeral, reactive computation. Not stored in tree.
 * Recomputed when dependencies change.
 */
export const DerivedStateSchema = z.object({
    node_id: z.string(),
    weight: z.number().min(0), // Computed from tree structure
    share_of_parent: z.number().min(0).max(1), // Share among siblings
    satisfaction: z.number().min(0).max(1), // Aggregated from children/allocations
    share_of_general_satisfaction: z.record(z.string(), z.number()), // ShareMap
    computed_at: z.number(), // Timestamp
    dependencies: z.array(z.string()).optional() // Node IDs this depends on
});
export type DerivedState = z.infer<typeof DerivedStateSchema>;

/**
 * Derived State Map - Global reactive computation store
 * 
 * Maps node_id -> DerivedState
 * Parallel to tree structure, updated reactively
 */
export const DerivedStateMapSchema = z.record(z.string(), DerivedStateSchema);
export type DerivedStateMap = z.infer<typeof DerivedStateMapSchema>;

/**
 * Oscillation History Entry
 * 
 * Tracks need history for oscillation detection
 */
export const OscillationHistoryEntrySchema = z.object({
    need_type_id: z.string(),
    declared_need: z.number().min(0),
    timestamp: z.number()
});
export type OscillationHistoryEntry = z.infer<typeof OscillationHistoryEntrySchema>;

/**
 * Oscillation State - Per-recipient oscillation tracking
 */
export const OscillationStateSchema = z.object({
    recipient_id: z.string(),
    need_type_id: z.string(),
    history: z.array(OscillationHistoryEntrySchema).max(10), // Keep last 10
    damping_factor: z.number().min(0).max(1).default(1.0),
    oscillation_detected: z.boolean().default(false)
});
export type OscillationState = z.infer<typeof OscillationStateSchema>;

/**
 * v6 Network State - Extended from v5 with satisfaction data
 */
export const V6NetworkStateSchema = z.object({
    // All v5 commitments (needs, capacities, recognition)
    commitments: z.record(z.string(), z.any()), // CommitmentSchema from v5

    // v6 additions
    offers: z.record(z.string(), OfferRecordSchema),
    acceptances: z.record(z.string(), AcceptanceRecordSchema),
    satisfaction_records: z.record(z.string(), SatisfactionRecordSchema),
    provider_satisfaction: z.record(z.string(), ProviderSatisfactionSchema),
    recipient_shares: z.record(z.string(), RecipientShareSchema),
    oscillation_states: z.record(z.string(), OscillationStateSchema),

    // Metadata
    last_updated: z.string(),
    protocol_version: z.literal('v6')
});
export type V6NetworkState = z.infer<typeof V6NetworkStateSchema>;
