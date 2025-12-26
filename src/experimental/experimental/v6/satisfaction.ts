/**
 * Free Association Protocol v6 - Satisfaction Learning
 * 
 * Implements satisfaction-based learning system:
 * - Recipients rate quality of received resources
 * - Providers aggregate satisfaction ratings
 * - Recipient shares recompute based on satisfaction
 * - Next cycle uses learned shares in MS formula
 */

import type {
    SatisfactionRecord,
    SatisfactionRating,
    ProviderSatisfaction,
    RecipientShare,
    AcceptanceRecord
} from './schemas.js';
import { V6_CONFIG } from './config.js';
import { event as itcEvent } from '../src/itc.js';
import type { Stamp as ITCStamp } from '../src/itc.js';

// ═══════════════════════════════════════════════════════════════════
// SATISFACTION RECORD CREATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Create Satisfaction Record
 * 
 * Recipients publish satisfaction ratings asynchronously (hours/days after acceptance).
 * 
 * @param recipientId - Recipient's public key
 * @param needSlotId - Which need slot
 * @param ratings - Array of satisfaction ratings
 * @param itcStamp - Current ITC stamp
 * @returns SatisfactionRecord
 */
export function createSatisfactionRecord(
    recipientId: string,
    needSlotId: string,
    ratings: SatisfactionRating[],
    itcStamp: ITCStamp
): SatisfactionRecord {
    const satisfactionId = `sat_${recipientId}_${needSlotId}_${Date.now()}`;

    return {
        satisfaction_id: satisfactionId,
        itc_stamp: itcEvent(itcStamp),
        recipient_id: recipientId,
        need_slot_id: needSlotId,
        ratings,
        created_at: new Date().toISOString()
    };
}

/**
 * Create Satisfaction Rating
 * 
 * @param offerId - Offer ID being rated
 * @param providerId - Provider's public key
 * @param acceptedQuantity - Amount accepted
 * @param satisfaction - Quality rating (0.0-1.0)
 * @param notes - Optional feedback
 * @returns SatisfactionRating
 */
export function createSatisfactionRating(
    offerId: string,
    providerId: string,
    acceptedQuantity: number,
    satisfaction: number,
    notes?: string
): SatisfactionRating {
    // Clamp satisfaction to valid range
    const clampedSatisfaction = Math.max(
        V6_CONFIG.satisfaction.min,
        Math.min(V6_CONFIG.satisfaction.max, satisfaction)
    );

    return {
        offer_id: offerId,
        provider_id: providerId,
        accepted_quantity: acceptedQuantity,
        satisfaction: clampedSatisfaction,
        notes
    };
}

// ═══════════════════════════════════════════════════════════════════
// PROVIDER SATISFACTION AGGREGATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Aggregate Provider Satisfaction
 * 
 * Computes weighted average satisfaction for a provider's capacity slot.
 * 
 * Formula:
 * capacity_sat = Σ(accepted_qty × satisfaction) / Σ(accepted_qty)
 * 
 * @param providerId - Provider's public key
 * @param capacitySlotId - Capacity slot ID
 * @param satisfactionRecords - All satisfaction records for this provider
 * @returns ProviderSatisfaction
 */
export function aggregateProviderSatisfaction(
    providerId: string,
    capacitySlotId: string,
    satisfactionRecords: SatisfactionRecord[]
): ProviderSatisfaction {
    let totalWeightedSatisfaction = 0;
    let totalAccepted = 0;
    let ratingCount = 0;

    // Aggregate all ratings for this provider/capacity
    for (const record of satisfactionRecords) {
        for (const rating of record.ratings) {
            if (rating.provider_id === providerId) {
                totalWeightedSatisfaction += rating.accepted_quantity * rating.satisfaction;
                totalAccepted += rating.accepted_quantity;
                ratingCount++;
            }
        }
    }

    // Compute weighted average
    const capacitySatisfaction = totalAccepted > 0
        ? totalWeightedSatisfaction / totalAccepted
        : V6_CONFIG.satisfaction.default; // Default if no ratings

    return {
        provider_id: providerId,
        capacity_slot_id: capacitySlotId,
        capacity_satisfaction: capacitySatisfaction,
        total_accepted: totalAccepted,
        rating_count: ratingCount,
        last_updated: new Date().toISOString()
    };
}

// ═══════════════════════════════════════════════════════════════════
// RECIPIENT SHARE RECOMPUTATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Recompute Recipient Shares
 * 
 * Updates recipient shares based on provider satisfaction data.
 * 
 * Formula:
 * - effective_points = recognition_points × provider_capacity_sat
 * - new_share[p] = effective_points[p] / Σ effective_points
 * 
 * @param recipientId - Recipient's public key
 * @param recognitionPoints - Recognition points per provider
 * @param providerSatisfaction - Satisfaction data per provider
 * @returns RecipientShare
 */
export function recomputeRecipientShares(
    recipientId: string,
    recognitionPoints: Record<string, number>,
    providerSatisfaction: Record<string, ProviderSatisfaction>
): RecipientShare {
    const effectivePoints: Record<string, number> = {};
    let totalEffective = 0;

    // Compute effective points (recognition × satisfaction)
    for (const [providerId, points] of Object.entries(recognitionPoints)) {
        const satisfaction = providerSatisfaction[providerId]?.capacity_satisfaction
            ?? V6_CONFIG.satisfaction.default;

        const effective = points * satisfaction;
        effectivePoints[providerId] = effective;
        totalEffective += effective;
    }

    // Normalize to shares
    const providerShares: Record<string, number> = {};

    if (totalEffective > 0) {
        for (const [providerId, effective] of Object.entries(effectivePoints)) {
            providerShares[providerId] = effective / totalEffective;
        }
    }

    return {
        recipient_id: recipientId,
        provider_shares: providerShares,
        last_updated: new Date().toISOString()
    };
}

// ═══════════════════════════════════════════════════════════════════
// LEARNING CYCLE
// ═══════════════════════════════════════════════════════════════════

/**
 * Apply Satisfaction Learning
 * 
 * Full learning cycle:
 * 1. Recipients rate satisfaction
 * 2. Providers observe and aggregate
 * 3. Recipients observe provider satisfaction
 * 4. Shares update reactively
 * 5. Next cycle uses new shares in MS formula
 * 
 * @param satisfactionRecords - All satisfaction records
 * @param recognitionPoints - Recognition points per recipient per provider
 * @returns Updated provider satisfaction and recipient shares
 */
export function applySatisfactionLearning(
    satisfactionRecords: SatisfactionRecord[],
    recognitionPoints: Record<string, Record<string, number>> // recipient -> provider -> points
): {
    providerSatisfaction: Record<string, ProviderSatisfaction>;
    recipientShares: Record<string, RecipientShare>;
} {
    // Step 1: Aggregate provider satisfaction
    const providerSatisfaction: Record<string, ProviderSatisfaction> = {};
    const providerCapacities = new Map<string, Set<string>>(); // provider -> capacity_slot_ids

    // Collect all provider/capacity combinations
    for (const record of satisfactionRecords) {
        for (const rating of record.ratings) {
            if (!providerCapacities.has(rating.provider_id)) {
                providerCapacities.set(rating.provider_id, new Set());
            }
            // Note: We'd need capacity_slot_id in rating for this to work properly
            // For now, use a default capacity slot per provider
            providerCapacities.get(rating.provider_id)!.add('default');
        }
    }

    // Aggregate satisfaction per provider/capacity
    for (const [providerId, capacityIds] of providerCapacities.entries()) {
        for (const capacityId of capacityIds) {
            const satisfaction = aggregateProviderSatisfaction(
                providerId,
                capacityId,
                satisfactionRecords
            );
            providerSatisfaction[`${providerId}_${capacityId}`] = satisfaction;
        }
    }

    // Step 2: Recompute recipient shares
    const recipientShares: Record<string, RecipientShare> = {};

    for (const [recipientId, providers] of Object.entries(recognitionPoints)) {
        // Build provider satisfaction map for this recipient
        const providerSat: Record<string, ProviderSatisfaction> = {};
        for (const providerId of Object.keys(providers)) {
            const key = `${providerId}_default`;
            if (providerSatisfaction[key]) {
                providerSat[providerId] = providerSatisfaction[key];
            }
        }

        const shares = recomputeRecipientShares(
            recipientId,
            providers,
            providerSat
        );

        recipientShares[recipientId] = shares;
    }

    return {
        providerSatisfaction,
        recipientShares
    };
}

/**
 * Extract Satisfaction Data for Distribution
 * 
 * Converts provider satisfaction records into simple satisfaction map
 * for use in distribution calculation.
 * 
 * @param providerSatisfaction - Provider satisfaction records
 * @returns Map of provider_id -> satisfaction (0.0-1.0)
 */
export function extractSatisfactionData(
    providerSatisfaction: Record<string, ProviderSatisfaction>
): Record<string, number> {
    const satisfactionData: Record<string, number> = {};

    for (const [key, satisfaction] of Object.entries(providerSatisfaction)) {
        // Extract provider_id from key (format: "provider_id_capacity_id")
        const providerId = key.split('_')[0];
        satisfactionData[providerId] = satisfaction.capacity_satisfaction;
    }

    return satisfactionData;
}
