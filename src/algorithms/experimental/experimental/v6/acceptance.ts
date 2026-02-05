/**
 * Free Association Protocol v6 - Acceptance Mechanisms
 * 
 * Implements flexible acceptance strategies:
 * - Manual: User reviews each offer (default)
 * - 1/N: Antifragile diversification
 * - Weighted: Accept proportionally by reputation
 * - Greedy: Accept best offers first
 */

import type {
    OfferRecord,
    OfferItem,
    AcceptanceRecord,
    AcceptanceItem,
    AcceptancePolicy
} from './schemas.js';
import { V6_CONFIG } from './config.js';
import { event as itcEvent } from '../src/itc.js';
import type { Stamp as ITCStamp } from '../src/itc.js';

// ═══════════════════════════════════════════════════════════════════
// ACCEPTANCE RECORD CREATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Create Acceptance Record
 * 
 * @param recipientId - Recipient's public key
 * @param needSlotId - Which need slot
 * @param acceptances - Array of acceptance/decline decisions
 * @param itcStamp - Current ITC stamp
 * @param policy - Optional acceptance policy used
 * @returns AcceptanceRecord
 */
export function createAcceptanceRecord(
    recipientId: string,
    needSlotId: string,
    acceptances: AcceptanceItem[],
    itcStamp: ITCStamp,
    policy?: AcceptancePolicy
): AcceptanceRecord {
    const acceptanceId = `acc_${recipientId}_${needSlotId}_${Date.now()}`;

    return {
        acceptance_id: acceptanceId,
        itc_stamp: itcEvent(itcStamp),
        recipient_id: recipientId,
        need_slot_id: needSlotId,
        acceptances,
        created_at: new Date().toISOString(),
        acceptance_policy: policy
    };
}

/**
 * Create Acceptance Item
 * 
 * @param offerId - Offer ID
 * @param providerId - Provider's public key
 * @param offeredQuantity - Amount offered
 * @param acceptedQuantity - Amount accepted
 * @returns AcceptanceItem
 */
export function createAcceptanceItem(
    offerId: string,
    providerId: string,
    offeredQuantity: number,
    acceptedQuantity: number
): AcceptanceItem {
    const declinedQuantity = offeredQuantity - acceptedQuantity;

    return {
        offer_id: offerId,
        provider_id: providerId,
        offered_quantity: offeredQuantity,
        accepted_quantity: Math.max(0, acceptedQuantity),
        declined_quantity: Math.max(0, declinedQuantity)
    };
}

// ═══════════════════════════════════════════════════════════════════
// ACCEPTANCE STRATEGIES
// ═══════════════════════════════════════════════════════════════════

/**
 * 1/N Acceptance Strategy (Antifragile)
 * 
 * Diversifies across all providers equally:
 * - target_each = need / N_providers
 * - accept = min(offer, target_each) from each
 * 
 * Benefits:
 * - Bounded downside (no single point of failure)
 * - Unbounded upside (can accept from all)
 * - Reduces risk through diversification
 * 
 * @param offers - Array of offers
 * @param remainingNeed - How much need is left
 * @returns Array of acceptance items
 */
export function acceptanceStrategy1N(
    offers: Array<{ offerId: string; providerId: string; quantity: number }>,
    remainingNeed: number
): AcceptanceItem[] {
    const acceptances: AcceptanceItem[] = [];

    if (offers.length === 0 || remainingNeed <= 0) {
        return acceptances;
    }

    // Target amount from each provider
    const targetEach = remainingNeed / offers.length;

    let totalAccepted = 0;

    for (const offer of offers) {
        // Accept min(offer, target_each)
        const toAccept = Math.min(offer.quantity, targetEach);

        // Don't over-accept
        const actualAccept = Math.min(toAccept, remainingNeed - totalAccepted);

        acceptances.push(createAcceptanceItem(
            offer.offerId,
            offer.providerId,
            offer.quantity,
            actualAccept
        ));

        totalAccepted += actualAccept;

        if (totalAccepted >= remainingNeed) {
            break;
        }
    }

    return acceptances;
}

/**
 * Weighted Acceptance Strategy
 * 
 * Accepts proportionally by provider reputation/satisfaction:
 * - weight_i = reputation_i / Σ reputation
 * - accept_i = min(offer_i, need × weight_i)
 * 
 * @param offers - Array of offers with reputation scores
 * @param remainingNeed - How much need is left
 * @param reputationScores - Reputation score per provider (0.0-1.0)
 * @returns Array of acceptance items
 */
export function acceptanceStrategyWeighted(
    offers: Array<{ offerId: string; providerId: string; quantity: number }>,
    remainingNeed: number,
    reputationScores: Record<string, number>
): AcceptanceItem[] {
    const acceptances: AcceptanceItem[] = [];

    if (offers.length === 0 || remainingNeed <= 0) {
        return acceptances;
    }

    // Compute total reputation
    let totalReputation = 0;
    for (const offer of offers) {
        const reputation = reputationScores[offer.providerId] ?? 0.5; // Default neutral
        totalReputation += reputation;
    }

    if (totalReputation === 0) {
        // Fall back to 1/N if no reputation data
        return acceptanceStrategy1N(offers, remainingNeed);
    }

    let totalAccepted = 0;

    for (const offer of offers) {
        const reputation = reputationScores[offer.providerId] ?? 0.5;
        const weight = reputation / totalReputation;

        // Target amount from this provider
        const targetAmount = remainingNeed * weight;

        // Accept min(offer, target)
        const toAccept = Math.min(offer.quantity, targetAmount);

        // Don't over-accept
        const actualAccept = Math.min(toAccept, remainingNeed - totalAccepted);

        acceptances.push(createAcceptanceItem(
            offer.offerId,
            offer.providerId,
            offer.quantity,
            actualAccept
        ));

        totalAccepted += actualAccept;

        if (totalAccepted >= remainingNeed) {
            break;
        }
    }

    return acceptances;
}

/**
 * Greedy Acceptance Strategy
 * 
 * Accepts best offers first (winner-takes-all):
 * - Sort by reputation (descending)
 * - Accept from best until satisfied
 * 
 * @param offers - Array of offers with reputation scores
 * @param remainingNeed - How much need is left
 * @param reputationScores - Reputation score per provider (0.0-1.0)
 * @returns Array of acceptance items
 */
export function acceptanceStrategyGreedy(
    offers: Array<{ offerId: string; providerId: string; quantity: number }>,
    remainingNeed: number,
    reputationScores: Record<string, number>
): AcceptanceItem[] {
    const acceptances: AcceptanceItem[] = [];

    if (offers.length === 0 || remainingNeed <= 0) {
        return acceptances;
    }

    // Sort by reputation (descending)
    const sortedOffers = [...offers].sort((a, b) => {
        const repA = reputationScores[a.providerId] ?? 0.5;
        const repB = reputationScores[b.providerId] ?? 0.5;
        return repB - repA; // Descending
    });

    let totalAccepted = 0;

    for (const offer of sortedOffers) {
        // Accept as much as possible from this provider
        const toAccept = Math.min(offer.quantity, remainingNeed - totalAccepted);

        acceptances.push(createAcceptanceItem(
            offer.offerId,
            offer.providerId,
            offer.quantity,
            toAccept
        ));

        totalAccepted += toAccept;

        if (totalAccepted >= remainingNeed) {
            break;
        }
    }

    return acceptances;
}

// ═══════════════════════════════════════════════════════════════════
// POLICY EXECUTION
// ═══════════════════════════════════════════════════════════════════

/**
 * Execute Acceptance Policy
 * 
 * Applies the specified acceptance strategy to offers.
 * 
 * @param policy - Acceptance policy
 * @param offers - Array of offers
 * @param remainingNeed - How much need is left
 * @param reputationScores - Optional reputation scores (for weighted/greedy)
 * @returns Array of acceptance items
 */
export function executeAcceptancePolicy(
    policy: AcceptancePolicy,
    offers: Array<{ offerId: string; providerId: string; quantity: number }>,
    remainingNeed: number,
    reputationScores?: Record<string, number>
): AcceptanceItem[] {
    switch (policy.strategy) {
        case '1/N':
            return acceptanceStrategy1N(offers, remainingNeed);

        case 'weighted':
            return acceptanceStrategyWeighted(
                offers,
                remainingNeed,
                reputationScores ?? {}
            );

        case 'greedy':
            return acceptanceStrategyGreedy(
                offers,
                remainingNeed,
                reputationScores ?? {}
            );

        case 'manual':
        default:
            // Manual strategy returns empty (user must decide)
            return [];
    }
}

/**
 * Validate Acceptance Amounts
 * 
 * Ensures acceptance doesn't exceed need or offer.
 * 
 * @param acceptances - Acceptance items
 * @param remainingNeed - How much need is left
 * @returns true if valid
 */
export function validateAcceptedAmounts(
    acceptances: AcceptanceItem[],
    remainingNeed: number
): boolean {
    let totalAccepted = 0;

    for (const acceptance of acceptances) {
        // Check: accepted + declined = offered
        const total = acceptance.accepted_quantity + acceptance.declined_quantity;
        if (Math.abs(total - acceptance.offered_quantity) > 0.001) {
            return false;
        }

        // Check: accepted >= 0
        if (acceptance.accepted_quantity < 0) {
            return false;
        }

        totalAccepted += acceptance.accepted_quantity;
    }

    // Check: total accepted <= remaining need
    if (totalAccepted > remainingNeed + 0.001) {
        return false;
    }

    return true;
}
