/**
 * Free Association Protocol v6 - Public API
 * 
 * Satisfaction-based learning extension to v5 protocol.
 * 
 * Key Features:
 * - MS Formula Throughout: MS = MR × recipient_share (evolving shares)
 * - Allocation → Offer Separation: Providers compute allocations, apply offering policy
 * - Flexible Acceptance: Manual, 1/N, weighted, greedy strategies
 * - Satisfaction Learning: Recipients rate quality, shares update reactively
 * - Oscillation Dampening: Detect and dampen rapid need oscillations
 * 
 * Architecture:
 * - Tree/DerivedState Separation: User inputs vs computed values
 * - ShareOfGeneralSatisfaction: 4-step calculation with pool-bounded recognition
 * - N-Tier Allocation: Reuses v5's allocation engine with satisfaction-based distribution
 * - Hierarchical Satisfaction Aggregation: Flows up from allocations → slots → goals
 */

// ═══════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════

export {
    // V6-Specific Schemas
    type OfferingPolicy,
    OfferingPolicySchema,
    type AcceptancePolicy,
    AcceptancePolicySchema,
    type OfferItem,
    OfferItemSchema,
    type OfferRecord,
    OfferRecordSchema,
    type AcceptanceItem,
    AcceptanceItemSchema,
    type AcceptanceRecord,
    AcceptanceRecordSchema,
    type SatisfactionRating,
    SatisfactionRatingSchema,
    type SatisfactionRecord,
    SatisfactionRecordSchema,
    type ProviderSatisfaction,
    ProviderSatisfactionSchema,
    type RecipientShare,
    RecipientShareSchema,
    type DerivedState,
    DerivedStateSchema,
    type DerivedStateMap,
    DerivedStateMapSchema,
    type OscillationHistoryEntry,
    OscillationHistoryEntrySchema,
    type OscillationState,
    OscillationStateSchema,
    type V6NetworkState,
    V6NetworkStateSchema,

    // Re-exported V5 Types (not schemas)
    type ITCStamp,
    type Node,
    type RootNode,
    type NonRootNode,
    type Contributor,
    type ResourceMetadata,
    type NeedType,
    type AvailabilityWindow,
    type AvailabilitySlot,
    type NeedSlot,
    type SlotAllocationRecord,
    type Commitment,
    type GlobalRecognitionWeights,
    type ShareMap
} from './schemas.js';

// ═══════════════════════════════════════════════════════════════════
// ALLOCATION
// ═══════════════════════════════════════════════════════════════════

export {
    computeAllocationWithSatisfaction,
    applyOfferingPolicy,
    computeDampingFactor,
    detectOscillation
} from './allocation.js';

// ═══════════════════════════════════════════════════════════════════
// DISTRIBUTION
// ═══════════════════════════════════════════════════════════════════

export {
    createDistribution,
    normalizeTierShares
} from './distribution.js';

// ═══════════════════════════════════════════════════════════════════
// ACCEPTANCE
// ═══════════════════════════════════════════════════════════════════

export {
    createAcceptanceRecord,
    createAcceptanceItem,
    acceptanceStrategy1N,
    acceptanceStrategyWeighted,
    acceptanceStrategyGreedy,
    executeAcceptancePolicy,
    validateAcceptedAmounts
} from './acceptance.js';

// ═══════════════════════════════════════════════════════════════════
// SATISFACTION
// ═══════════════════════════════════════════════════════════════════

export {
    createSatisfactionRecord,
    createSatisfactionRating,
    aggregateProviderSatisfaction,
    recomputeRecipientShares,
    applySatisfactionLearning,
    extractSatisfactionData
} from './satisfaction.js';

// ═══════════════════════════════════════════════════════════════════
// UPDATE LAW
// ═══════════════════════════════════════════════════════════════════

export {
    computeRemainingNeed,
    applyUpdateLaw,
    computeTotalAccepted,
    computeTotalDeclined,
    checkOverAllocation,
    validateUpdateLaw,
    computeNeedReduction,
    computeNeedReductionPercentage
} from './update-law.js';

// ═══════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════

export {
    detectOscillationPattern,
    computeDampingFactor as computeOscillationDampingFactor,
    updateOscillationHistory,
    updateOscillationState,
    createInitialOscillationState,
    applyDampening
} from './utils/oscillation.js';

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export {
    V6_CONFIG,
    type V6Config
} from './config.js';

// ═══════════════════════════════════════════════════════════════════
// RE-EXPORT V5 ITC FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export {
    seed as itcSeed,
    event as itcEvent,
    fork as itcFork,
    join as itcJoin,
    peek as itcPeek,
    leq as itcLeq,
    equals as itcEquals,
    type Stamp as ITCStampType,
    type Id as ITCIdType,
    type Event as ITCEventType
} from '../src/itc.js';
