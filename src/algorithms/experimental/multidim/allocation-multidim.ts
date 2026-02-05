/**
 * Multi-Dimensional Allocation Algorithm - Complete Implementation
 * 
 * Implements the three-stage pipeline:
 * 1. Distribution (Recognition -> Shares) - Bidirectional logic
 * 2. Targets (Shares -> Capacity-Constrained Targets) - Iterative/No-Damping
 * 3. Allocation (Targets -> Final Per-Slot Allocations) - MR-Weighted Supply Adjustment
 */

import type {
    AvailabilitySlot,
    NeedSlot,
    Commitment,
    SlotAllocationRecord,
    AdjustmentSuggestion,
    SystemStateSnapshot
} from './schemas-multidim.js';

import { slotsCompatible } from './utils/match.js';
import { computeMutualRecognition, type DistributionResult } from './distribution.js';

// ═══════════════════════════════════════════════════════════════════
// STAGE 1: DISTRIBUTION (Recognition -> Shares)
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate Bidirectional Mutual Recognition Distribution
 * 
 * Implements the "Bidirectional Slot-Level" logic:
 * 1. Recipient R splits MR equality among compatible provider slots P_i
 * 2. Provider slot P_i receives MR "chunks" and splits equally among compatible recipient slots R_j
 * 3. Normalize per provider slot to get final shares
 * 
 * @param providerSlots - All slots from the provider
 * @param allCommitments - All network commitments (to find recipients)
 * @param providerPubKey - The provider's public key
 * @param myRecognition - My global recognition weights of others
 */
export function calculateBidirectionalMRDistribution(
    providerSlots: AvailabilitySlot[],
    allCommitments: Record<string, Commitment>,
    providerPubKey: string,
    myRecognition: Record<string, number>
): DistributionResult {
    const result: DistributionResult = {
        method: "mutual_recognition_bidirectional",
        shares: {}
    };

    // Optimization: Index provider slots by type for O(1) lookup
    const providerSlotsByType = new Map<string, AvailabilitySlot[]>();
    for (const slot of providerSlots) {
        if (!providerSlotsByType.has(slot.type_id)) {
            providerSlotsByType.set(slot.type_id, []);
        }
        providerSlotsByType.get(slot.type_id)!.push(slot);
    }

    // Data structures for the algorithm
    const providerSlotMRWeights = new Map<string, number>(); // P_i -> Total MR received from recipients
    const recipientSlotWeights = new Map<string, Map<string, number>>(); // P_i -> (R_j -> weight)

    // Step 1: Recipient distributes MR to compatible provider slots
    for (const [recipientPubKey, commitment] of Object.entries(allCommitments)) {
        if (recipientPubKey === providerPubKey) continue; // Skip self

        // Calculate MR(R, P)
        const recognitionOfMe = commitment.global_recognition_weights?.[providerPubKey] || 0;
        const recognitionOfThem = myRecognition[recipientPubKey] || 0;
        const mr = Math.min(recognitionOfMe, recognitionOfThem);

        if (mr <= 0) continue;

        const recipientNeedSlots = commitment.need_slots || [];
        if (recipientNeedSlots.length === 0) continue;

        const compatibleProviderSlots = new Set<string>();

        // Optimization: Pre-calculate compatibility map for this recipient
        // Map<ProviderSlotId, Set<RecipientSlotId>>
        const compatibilityMap = new Map<string, Set<string>>();

        for (const rSlot of recipientNeedSlots) {
            // OPTIMIZATION: Only check provider slots of same type
            const potentialMatches = providerSlotsByType.get(rSlot.type_id) || [];

            for (const pSlot of potentialMatches) {
                if (slotsCompatible(pSlot, rSlot)) {
                    compatibleProviderSlots.add(pSlot.id);

                    if (!compatibilityMap.has(pSlot.id)) {
                        compatibilityMap.set(pSlot.id, new Set());
                    }
                    compatibilityMap.get(pSlot.id)!.add(rSlot.id);
                }
            }
        }

        if (compatibleProviderSlots.size === 0) continue;

        // MR_to_provider_slot(P_i) = MR(R, Provider) / |compatible_provider_slots|
        const mrPerProviderSlot = mr / compatibleProviderSlots.size;

        // Step 2: Provider slot distributes received MR to compatible recipient slots
        for (const pSlotId of compatibleProviderSlots) {
            const compatibleRSlots = compatibilityMap.get(pSlotId)!;
            const numCompatibleRSlots = compatibleRSlots.size;

            if (numCompatibleRSlots === 0) continue;

            // MR_weight(R_j, P_i) = MR_to_provider_slot(P_i) / N_PR(i)
            const weightPerRecipientSlot = mrPerProviderSlot / numCompatibleRSlots;

            // Store the weight
            if (!recipientSlotWeights.has(pSlotId)) {
                recipientSlotWeights.set(pSlotId, new Map());
            }
            const pSlotWeights = recipientSlotWeights.get(pSlotId)!;

            for (const rSlotId of compatibleRSlots) {
                const compositeKey = `${recipientPubKey}:${rSlotId}`;
                const current = pSlotWeights.get(compositeKey) || 0;
                pSlotWeights.set(compositeKey, current + weightPerRecipientSlot);
            }
        }
    }

    // Step 3: Normalize per provider slot
    const finalShares: Record<string, number> = {};

    for (const pSlot of providerSlots) {
        const pSlotWeights = recipientSlotWeights.get(pSlot.id);
        if (!pSlotWeights) continue;

        let totalWeightForSlot = 0;
        for (const w of pSlotWeights.values()) {
            totalWeightForSlot += w;
        }

        if (totalWeightForSlot <= 0) continue;

        for (const [compositeKey, weight] of pSlotWeights.entries()) {
            const key = `${pSlot.id}:${compositeKey}`;
            finalShares[key] = weight / totalWeightForSlot;
        }
    }

    result.shares = finalShares;
    return result;
}

// ═══════════════════════════════════════════════════════════════════
// STAGE 2: TARGETS (Shares -> Capacity-Constrained Targets)
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate Capacity-Constrained Targets
 * 
 * Uses iterative allocation to convert unconstrained shares into
 * physical allocation targets, respecting:
 * 1. Provider Capacity
 * 2. Recipient Need (capped)
 * 3. Divisibility Constraints
 */
export function calculateTargets(
    providerSlot: AvailabilitySlot,
    shares: Record<string, number>,
    recipientNeeds: Map<string, number> // keyed by "pubkey:slot_id"
): Map<string, number> {
    // 1. Filter shares for this provider slot
    const relevantShares = new Map<string, number>(); // "pubkey:slot_id" -> share
    const prefix = `${providerSlot.id}:`;

    let totalRelevantShare = 0;

    for (const [key, share] of Object.entries(shares)) {
        if (key.startsWith(prefix)) {
            // Extract recipient part: "pubkey:slot_id"
            const recipientPart = key.substring(prefix.length);
            relevantShares.set(recipientPart, share);
            totalRelevantShare += share;
        }
    }

    if (totalRelevantShare === 0) return new Map();

    // 2. Iterative Allocation
    return iterativeAllocation(
        providerSlot.quantity,
        relevantShares,
        recipientNeeds,
        providerSlot
    );
}

/**
 * Iterative Allocation Algorithm (No Damping)
 */
function iterativeAllocation(
    totalCapacity: number,
    shares: Map<string, number>, // "pubkey:slot_id" -> share
    needs: Map<string, number>,  // "pubkey:slot_id" -> remaining need
    providerSlot: AvailabilitySlot
): Map<string, number> {
    const targets = new Map<string, number>();
    let remainingCapacity = totalCapacity;
    let unsatisfiedParticipants = new Set(shares.keys());

    const EPSILON = 0.0001;
    const maxNatural = providerSlot.max_natural_div || 1;

    // Loop until capacity exhausted or everyone satisfied
    let iteration = 0;
    while (remainingCapacity >= maxNatural && unsatisfiedParticipants.size > 0 && iteration < 10) {
        iteration++;

        // 1. Renormalize shares among unsatisfied
        let totalShareUnsatisfied = 0;
        for (const key of unsatisfiedParticipants) {
            totalShareUnsatisfied += shares.get(key) || 0;
        }

        if (totalShareUnsatisfied < EPSILON) break;

        const currentRoundChanges = new Map<string, number>();
        const toRemove = new Set<string>();

        // 2. Calculate allocations for this round
        let roundAllocated = 0;

        for (const key of unsatisfiedParticipants) {
            const share = shares.get(key) || 0;
            const normalizedShare = share / totalShareUnsatisfied;

            // Allocate share of REMAINING capacity
            const rawAllocation = remainingCapacity * normalizedShare;

            const currentTotal = targets.get(key) || 0;
            const remainingNeed = Math.max(0, (needs.get(key) || 0) - currentTotal);

            // Cap at need
            let cappedAllocation = Math.min(rawAllocation, remainingNeed);

            // Floor to divisibility units (to ensure valid allocation steps)
            // But avoid flooring to 0 if we can help it?
            // Spec says: "4. Apply divisibility constraints: final_target = floor(capped_target / min_unit) * min_unit"
            // This works for the *Target*, but we are adding incrementally.
            // Let's calculate the NEW total target and floor THAT.

            const proposedTotal = currentTotal + cappedAllocation;
            const flooredTotal = Math.floor(proposedTotal / maxNatural) * maxNatural;
            const actualIncrement = Math.max(0, flooredTotal - currentTotal);

            if (actualIncrement > EPSILON) {
                currentRoundChanges.set(key, actualIncrement);
                targets.set(key, currentTotal + actualIncrement);
                roundAllocated += actualIncrement;
            } else {
                // If we can't add a whole unit, checking if we are blocked
                if (remainingNeed < maxNatural) {
                    toRemove.add(key); // Need less than a unit, can't satisfy
                }
            }

            // If fully satisfied (remainder need covered)
            if ((needs.get(key) || 0) - (targets.get(key) || 0) < maxNatural) {
                toRemove.add(key);
            }
        }

        remainingCapacity -= roundAllocated;

        // Remove satisfied
        for (const key of toRemove) {
            unsatisfiedParticipants.delete(key);
        }

        // If no progress, break
        if (roundAllocated < EPSILON) break;
    }

    // 5. Remainder Redistribution (Largest Remainder Method)
    if (remainingCapacity >= maxNatural) {
        redistributeRemainders(
            targets,
            remainingCapacity,
            providerSlot,
            shares // Use original shares for priority
        );
    }

    return targets;
}

/**
 * Redistribute Remainders
 */
function redistributeRemainders(
    targets: Map<string, number>,
    remainingCapacity: number,
    slot: AvailabilitySlot,
    shares: Map<string, number>
) {
    const maxNatural = slot.max_natural_div || 1;

    // Sort by share size (proxy for remainder priority in absence of fractional tracking)
    const sortedCandidates = Array.from(targets.keys()).sort((a, b) => {
        const shareA = shares.get(a) || 0;
        const shareB = shares.get(b) || 0;
        return shareB - shareA; // Descending
    });

    let currentRemaining = remainingCapacity;

    for (const key of sortedCandidates) {
        if (currentRemaining < maxNatural) break;

        // Add one unit
        targets.set(key, (targets.get(key) || 0) + maxNatural);
        currentRemaining -= maxNatural;
    }
}

// ═══════════════════════════════════════════════════════════════════
// STAGE 3: ALLOCATION (Targets -> Final Per-Slot Allocations)
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate Final Allocations with MR-Weighted Supply Adjustment
 * 
 * 1. Check for adjustment suggestions (overshoot correction)
 * 2. Apply adjustments if present (reducing targets)
 * 3. Convert final targets to SlotAllocationRecords
 */
export function calculateAllocationsWithAdjustment(
    providerSlot: AvailabilitySlot,
    targets: Map<string, number>, // "pubkey:slot_id" -> target
    allCommitments: Record<string, Commitment>,
    myPubKey: string
): SlotAllocationRecord[] {
    const allocations: SlotAllocationRecord[] = [];

    for (const [key, target] of targets.entries()) {
        if (target <= 0) continue;

        // Parse key "pubkey:slot_id"
        const parts = key.split(':');
        // If key has 2 parts: pubkey:slot_id
        if (parts.length < 2) continue;

        const recipientPubKey = parts[0];
        const recipientSlotId = parts.slice(1).join(':'); // In case slot id has colons

        let finalQuantity = target;
        let adjustmentSource: 'mr_weighted' | 'normal_mr' | 'none' = 'normal_mr';

        // Check for adjustment suggestions
        const recipientCommitment = allCommitments[recipientPubKey];
        if (recipientCommitment?.adjustment_suggestions) {
            const suggestion = recipientCommitment.adjustment_suggestions[recipientSlotId];
            if (suggestion && suggestion.provider_adjustments && suggestion.provider_adjustments[myPubKey]) {
                const providerAdj = suggestion.provider_adjustments[myPubKey];

                // Use suggested allocation as base cap
                // Spec: "base_target = adjustment.suggested_allocation"
                // "adjusted_target = adjustForCapacityConstraints(base_target, ...)"

                // Since `target` is already capacity constrained from Stage 2 (based on shares),
                // we should take the MIN of our calculated target and the suggestion.
                // The suggestion is a "request to reduce" to avoid overshoot.
                // If our capacity allows LESS than suggestion, we give less (already in `target`).
                // If our capacity allows MORE than suggestion, we should maintain suggestion to avoid overshoot.

                if (providerAdj.suggested_allocation < target) {
                    finalQuantity = providerAdj.suggested_allocation;
                    adjustmentSource = 'mr_weighted';
                }
            }
        }

        if (finalQuantity > 0) {
            allocations.push({
                availability_slot_id: providerSlot.id,
                recipient_pubkey: recipientPubKey,
                recipient_need_slot_id: recipientSlotId,
                quantity: finalQuantity,
                type_id: providerSlot.type_id,
                time_compatible: true, // Assumed valid from Stage 1 filtering
                location_compatible: true, // Assumed valid from Stage 1 filtering
                tier: 0, // Default for now
                adjustment_source: adjustmentSource
            });
        }
    }

    return allocations;
}

// ═══════════════════════════════════════════════════════════════════
// OVERSHOOT DETECTION & ADJUSTMENT CALCULATION (Recipient Side)
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate Adjustment Suggestions for Overshot Slots
 * 
 * To be run by the RECIPIENT (or by system simulation) when detecting overshoot.
 * 
 * @param recipientSlot - The need slot being analyzed
 * @param totalReceived - Total quantity received for this slot
 * @param receivedFromProviders - Map<provider_pubkey, quantity>
 * @param providerCapacities - Map<provider_pubkey, total_capacity_compatible>
 * @param providerMRs - Map<provider_pubkey, mr_score> (MR(Recipient, Provider))
 */
export function calculateOvershootAdjustments(
    recipientSlot: NeedSlot,
    totalReceived: number,
    receivedFromProviders: Map<string, number>,
    providerCapacities: Map<string, number>,
    providerMRs: Map<string, number>
): AdjustmentSuggestion | null {
    if (totalReceived <= recipientSlot.quantity) return null; // No overshoot

    const overshootAmount = totalReceived - recipientSlot.quantity;
    const providerAdjustments: Record<string, any> = {};

    // Step 1: Calculate total capacity available to this slot
    let totalCapacityToSlot = 0;
    for (const cap of providerCapacities.values()) {
        totalCapacityToSlot += cap;
    }

    if (totalCapacityToSlot === 0) return null; // Should not happen if received > 0

    // Step 2 & 3: Ideal allocations and Excess
    // We need to know the share of each provider.
    // Ideally, share proportional to MR?
    // Spec says: "mr_share_k = Share(Slot_j, Provider_k)"
    // Wait, Share(Slot_j, Provider_k) is the share calculated in Stage 1?
    // Or is it MR / Total_MR?
    // "ideal_allocation_k = mr_share_k * total_capacity_to_slot"

    // If we don't have exact shares from Stage 1 available (as we are recipient),
    // we can approximate using MR weights.
    // sum(MR) -> mr_share = MR / sum(MR)

    let totalMR = 0;
    for (const mr of providerMRs.values()) {
        totalMR += mr;
    }

    const responsibilityScores = new Map<string, number>();
    let totalResponsibility = 0;

    for (const [providerKey, currentAllocation] of receivedFromProviders.entries()) {
        const mr = providerMRs.get(providerKey) || 0;
        const mrShare = totalMR > 0 ? mr / totalMR : 0;

        const idealAllocation = mrShare * totalCapacityToSlot;
        const excess = Math.max(0, currentAllocation - idealAllocation);

        // Responsibility score (weighted by 1 - mr_share to protect high-MR providers)
        // Note: Spec says 1 - mr_share. If mr_share is small, responsibility is high.
        const responsibility = excess * (1 - mrShare);

        responsibilityScores.set(providerKey, responsibility);
        totalResponsibility += responsibility;

        providerAdjustments[providerKey] = {
            mr_share: mrShare,
            ideal_allocation: idealAllocation,
            responsibility_score: responsibility
            // suggested_allocation to be filled next
        };
    }

    // Step 4: Distribute overshoot reduction
    for (const [providerKey, currentAllocation] of receivedFromProviders.entries()) {
        let reduction = 0;
        if (totalResponsibility > 0.0001) {
            const responsibility = responsibilityScores.get(providerKey) || 0;
            const reductionShare = responsibility / totalResponsibility;
            reduction = overshootAmount * reductionShare;
        } else {
            // Fallback: Proportional reduction
            const allocationShare = currentAllocation / totalReceived;
            reduction = overshootAmount * allocationShare;
        }

        const suggestedAllocation = currentAllocation - reduction;

        providerAdjustments[providerKey].suggested_allocation = suggestedAllocation;
    }

    return {
        overshoot_amount: overshootAmount,
        provider_adjustments: providerAdjustments
    };
}
