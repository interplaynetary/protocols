/**
 * Free Association Protocol v6 - Allocation Algorithm
 * 
 * v6 allocation with satisfaction-based learning.
 * 
 * Architecture: v6 is a thin wrapper that:
 * 1. Computes satisfaction-based distribution (Steps 0-3)
 * 2. Calls v5's allocateWithDistribution() for N-tier allocation (Step 4)
 * 3. Applies offering policy (Steps 5-6)
 * 
 * This reuses v5's battle-tested allocation engine while adding
 * satisfaction learning on top.
 */

import type {
    AvailabilitySlot,
    NeedSlot,
    SlotAllocationRecord,
    GlobalRecognitionWeights,
    OfferingPolicy,
    OfferRecord,
    OfferItem,
    OscillationState
} from './schemas.js';
import type { Stamp as ITCStamp } from '../src/itc.js';
import { event as itcEvent } from '../src/itc.js';
import { allocateWithDistribution } from '../src/allocation.js';
import { createDistribution } from './distribution.js';
import {
    updateOscillationState,
    applyDampening,
    createInitialOscillationState
} from './utils/oscillation.js';
import { V6_CONFIG } from './config.js';

// ═══════════════════════════════════════════════════════════════════
// V6 ALLOCATION ALGORITHM
// ═══════════════════════════════════════════════════════════════════

/**
 * Compute Allocation with Satisfaction
 * 
 * Main v6 allocation algorithm (6-step process):
 * 
 * Step 0: Oscillation Detection
 * Step 1: Apply Dampening
 * Step 2: Filter Compatible Recipients
 * Step 3: Calculate MS (Mutual Satisfaction)
 * Step 4: N-Tier Allocation (via v5 engine)
 * Step 5: Apply Offering Policy
 * Step 6: Publish with ITC Stamp
 * 
 * @param capacitySlot - Provider's capacity slot
 * @param needSlots - All need slots from network
 * @param needSlotOwners - Mapping of need_slot_id -> pubkey (who owns each need)
 * @param myRecognition - Provider's recognition of others
 * @param othersRecognition - Others' recognition of provider
 * @param myPubKey - Provider's public key
 * @param satisfactionData - Optional satisfaction ratings (provider_id -> satisfaction)
 * @param oscillationStates - Optional oscillation tracking per recipient
 * @param offeringPolicy - Optional offering policy
 * @param itcStamp - Current ITC stamp
 * @returns Offer record with allocations
 */
export function computeAllocationWithSatisfaction(
    capacitySlot: AvailabilitySlot,
    needSlots: NeedSlot[],
    needSlotOwners: Record<string, string>, // need_slot_id -> pubkey
    myRecognition: GlobalRecognitionWeights,
    othersRecognition: Record<string, GlobalRecognitionWeights>,
    myPubKey: string,
    satisfactionData?: Record<string, number>,
    oscillationStates?: Record<string, OscillationState>,
    offeringPolicy?: OfferingPolicy,
    itcStamp?: ITCStamp
): OfferRecord {
    // ─────────────────────────────────────────────────────────────────
    // STEP 0: Oscillation Detection
    // ─────────────────────────────────────────────────────────────────

    const updatedOscillationStates: Record<string, OscillationState> = {};
    const dampingFactors: Record<string, number> = {};

    for (const needSlot of needSlots) {
        const recipientId = needSlotOwners[needSlot.id];
        if (!recipientId) continue; // Skip if owner unknown
        const needTypeId = needSlot.need_type_id;
        const stateKey = `${recipientId}_${needTypeId}`;

        // Get or create oscillation state
        const currentState = oscillationStates?.[stateKey]
            ?? createInitialOscillationState(recipientId, needTypeId);

        // Update with current need
        const updatedState = updateOscillationState(currentState, needSlot.quantity);
        updatedOscillationStates[stateKey] = updatedState;
        dampingFactors[recipientId] = updatedState.damping_factor;
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP 1: Apply Dampening
    // ─────────────────────────────────────────────────────────────────

    const dampenedNeedSlots = needSlots.map(slot => {
        const recipientId = needSlotOwners[slot.id];
        const dampingFactor = recipientId ? (dampingFactors[recipientId] ?? 1.0) : 1.0;
        const activeNeed = applyDampening(slot.quantity, dampingFactor);

        return {
            ...slot,
            quantity: activeNeed
        };
    });

    // ─────────────────────────────────────────────────────────────────
    // STEP 2: Filter Compatible Recipients
    // ─────────────────────────────────────────────────────────────────

    // Filter by resource type
    const compatibleNeedSlots = dampenedNeedSlots.filter(
        slot => slot.need_type_id === capacitySlot.need_type_id
    );

    // Only recipients with active need > 0
    const activeRecipients = compatibleNeedSlots.filter(
        slot => slot.quantity > 0
    );

    const compatibleRecipientIds = new Set(
        activeRecipients.map(slot => needSlotOwners[slot.id]).filter(Boolean)
    );

    // ─────────────────────────────────────────────────────────────────
    // STEP 3: Calculate MS (Mutual Satisfaction)
    // ─────────────────────────────────────────────────────────────────

    // Create distribution (auto-detects bootstrap vs satisfaction-based)
    const distribution = createDistribution(
        myRecognition,
        othersRecognition,
        myPubKey,
        satisfactionData,
        compatibleRecipientIds
    );

    // ─────────────────────────────────────────────────────────────────
    // STEP 4: N-Tier Allocation (via v5 engine)
    // ─────────────────────────────────────────────────────────────────

    // Build allCommitments structure that v5 expects
    // v5 needs: Record<pubkey, Commitment> where Commitment has need_slots array
    const allCommitments: Record<string, any> = {};

    for (const needSlot of activeRecipients) {
        const recipientId = needSlotOwners[needSlot.id];
        if (!recipientId) continue;

        // Create or update commitment for this recipient
        if (!allCommitments[recipientId]) {
            allCommitments[recipientId] = {
                need_slots: [],
                global_recognition_weights: othersRecognition[recipientId] || {},
                itcStamp: null,
                timestamp: Date.now()
            };
        }

        // Add this need slot to their commitment
        allCommitments[recipientId].need_slots.push(needSlot);
    }

    // Use v5's allocation engine with our satisfaction-based distribution
    const allocationResult = allocateWithDistribution(
        myPubKey,
        [capacitySlot], // v5 expects array of capacity slots
        distribution,
        allCommitments
    );

    // ─────────────────────────────────────────────────────────────────
    // STEP 5: Apply Offering Policy
    // ─────────────────────────────────────────────────────────────────

    const policy = offeringPolicy ?? {
        commitment_rate: V6_CONFIG.offering.default_commitment_rate,
        auto_publish: V6_CONFIG.offering.default_auto_publish
    };

    const offers = applyOfferingPolicy(
        allocationResult.allocations,
        policy
    );

    // ─────────────────────────────────────────────────────────────────
    // STEP 6: Publish with ITC Stamp
    // ─────────────────────────────────────────────────────────────────

    const offerId = `offer_${myPubKey}_${capacitySlot.id}_${Date.now()}`;

    return {
        offer_id: offerId,
        itc_stamp: itcStamp ? itcEvent(itcStamp) : undefined as any,
        provider_id: myPubKey,
        capacity_slot_id: capacitySlot.id,
        offers,
        created_at: new Date().toISOString(),
        offering_policy: policy
    };
}

// ═══════════════════════════════════════════════════════════════════
// OFFERING POLICY
// ═══════════════════════════════════════════════════════════════════

/**
 * Apply Offering Policy
 * 
 * Converts allocations to offers based on commitment rate.
 * 
 * Formula: offer = allocation × commitment_rate
 * 
 * @param allocations - Computed allocations
 * @param policy - Offering policy
 * @returns Array of offer items
 */
export function applyOfferingPolicy(
    allocations: SlotAllocationRecord[],
    policy: OfferingPolicy
): OfferItem[] {
    const offers: OfferItem[] = [];

    for (const allocation of allocations) {
        const offerQuantity = allocation.quantity * policy.commitment_rate;

        if (offerQuantity > 0) {
            offers.push({
                to: allocation.recipient_pubkey,
                quantity: offerQuantity,
                tier: allocation.tier,
                need_slot_id: allocation.recipient_need_slot_id
            });
        }
    }

    return offers;
}

/**
 * Compute Damping Factor for Recipient
 * 
 * Helper to get damping factor for a specific recipient.
 * 
 * @param recipientId - Recipient public key
 * @param needTypeId - Need type ID
 * @param oscillationStates - Oscillation states
 * @returns Damping factor (0.0-1.0)
 */
export function computeDampingFactor(
    recipientId: string,
    needTypeId: string,
    oscillationStates?: Record<string, OscillationState>
): number {
    const stateKey = `${recipientId}_${needTypeId}`;
    const state = oscillationStates?.[stateKey];

    return state?.damping_factor ?? 1.0;
}

/**
 * Detect Oscillation for Recipient
 * 
 * Helper to check if oscillation is detected for a specific recipient.
 * 
 * @param recipientId - Recipient public key
 * @param needTypeId - Need type ID
 * @param oscillationStates - Oscillation states
 * @returns true if oscillation detected
 */
export function detectOscillation(
    recipientId: string,
    needTypeId: string,
    oscillationStates?: Record<string, OscillationState>
): boolean {
    const stateKey = `${recipientId}_${needTypeId}`;
    const state = oscillationStates?.[stateKey];

    return state?.oscillation_detected ?? false;
}
