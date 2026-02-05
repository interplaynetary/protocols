/**
 * Free Association Protocol v6 - Distribution Calculation
 * 
 * Satisfaction-based distribution that feeds into v5's N-tier allocation engine.
 * 
 * Key Insight: v6 doesn't need new allocation logic, just new distribution
 * calculation using reputation-weighted recognition.
 */

import type { GlobalRecognitionWeights } from './schemas.js';
import {
    createMultiTierDistribution,
    computeMutualRecognition,
    type DistributionResult
} from '../../../../distribution.js';

// ═══════════════════════════════════════════════════════════════════
// DISTRIBUTION CALCULATION (Continuous - MS Formula Throughout)
// ═══════════════════════════════════════════════════════════════════

/**
 * Create Distribution (Satisfaction-Weighted Recognition)
 * 
 * Uses MS formula throughout - no "bootstrap" vs "learned" distinction.
 * Share starts as recognition (reputation = 1.0), evolves with satisfaction.
 * 
 * Formula:
 * - effective_points = recognition_points × reputation
 * - share = effective_points / Σ effective_points
 * - MS = MR × share
 * 
 * @param myRecognition - My recognition of others
 * @param othersRecognition - Others' recognition of me
 * @param myPubKey - My public key
 * @param providerReputations - Provider reputations (defaults to 1.0 = neutral)
 * @param compatibleRecipients - Optional filter for compatible recipients
 * @returns DistributionResult with satisfaction-weighted shares
 */
export function createDistribution(
    myRecognition: GlobalRecognitionWeights,
    othersRecognition: Record<string, GlobalRecognitionWeights>,
    myPubKey: string,
    providerReputations: Record<string, number> = {},
    compatibleRecipients?: Set<string>
): DistributionResult {
    // Compute mutual recognition for all recipients
    const mutualRecognition = computeMutualRecognition(
        myRecognition,
        othersRecognition,
        myPubKey
    );

    // Compute reputation-weighted shares per tier
    const tier1Shares: Record<string, number> = {}; // Mutual (MR > 0)
    const tier2Shares: Record<string, number> = {}; // Unilateral (MR = 0, but I recognize them)

    for (const [recipientId, mr] of Object.entries(mutualRecognition)) {
        // Skip if not in compatible recipients set (if provided)
        if (compatibleRecipients && !compatibleRecipients.has(recipientId)) {
            continue;
        }

        // Get my recognition of them
        const myRecOfThem = myRecognition[recipientId] || 0;
        if (myRecOfThem === 0) continue; // Skip if I don't recognize them

        // Get reputation (defaults to 1.0 = neutral if no data)
        // Initially: reputation = 1.0 → share = recognition
        // Later: reputation evolves → share = recognition × reputation
        const reputation = providerReputations[recipientId] ?? 1.0;

        // Compute effective points (recognition weighted by reputation)
        // MS formula: always use satisfaction-weighted recognition
        const effectivePoints = myRecOfThem * reputation;

        // Assign to tier based on mutual recognition
        if (mr > 0) {
            tier1Shares[recipientId] = effectivePoints; // Mutual
        } else {
            tier2Shares[recipientId] = effectivePoints; // Unilateral
        }
    }

    // Normalize shares within each tier (using helper function)
    const normalizedTier1 = normalizeTierShares(tier1Shares);
    const normalizedTier2 = normalizeTierShares(tier2Shares);

    // Create multi-tier distribution
    // This feeds into v5's allocateWithDistribution() which handles N tiers
    // NOTE: Using priorities 1,2 instead of 0,1 to avoid JavaScript falsy 0 issue in v5
    return createMultiTierDistribution([
        {
            priority: 1, // Highest priority (allocated first)
            shares: normalizedTier1,
            label: 'mutual-satisfaction'
        },
        {
            priority: 2, // Lower priority (allocated second)
            shares: normalizedTier2,
            label: 'unilateral-satisfaction'
        }
    ]);
}

/**
 * Normalize shares to sum to 1.0
 * 
 * @param shares - Raw shares (unnormalized)
 * @returns Normalized shares (sum = 1.0)
 */
export function normalizeTierShares(shares: Record<string, number>): Record<string, number> {
    const total = Object.values(shares).reduce((sum, val) => sum + val, 0);

    if (total === 0) {
        return {};
    }

    const normalized: Record<string, number> = {};
    for (const [id, share] of Object.entries(shares)) {
        normalized[id] = share / total;
    }

    return normalized;
}

