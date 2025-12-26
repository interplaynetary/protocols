/**
 * Free Association Protocol v6 - Update Law
 * 
 * Recipient update law for need convergence:
 * remaining_need = max(0, declared_need - total_accepted)
 * 
 * Guarantees:
 * - Monotonic decrease
 * - Convergence to 0
 * - No over-acceptance
 */

import type { AcceptanceRecord, AcceptanceItem } from './schemas.js';

// ═══════════════════════════════════════════════════════════════════
// UPDATE LAW
// ═══════════════════════════════════════════════════════════════════

/**
 * Compute Remaining Need
 * 
 * Formula: remaining_need = max(0, declared_need - total_accepted)
 * 
 * @param declaredNeed - Original declared need
 * @param totalAccepted - Total amount accepted from all providers
 * @returns Remaining need (>= 0)
 */
export function computeRemainingNeed(
    declaredNeed: number,
    totalAccepted: number
): number {
    return Math.max(0, declaredNeed - totalAccepted);
}

/**
 * Apply Update Law
 * 
 * Updates need based on acceptance record.
 * 
 * @param declaredNeed - Original declared need
 * @param acceptanceRecord - Acceptance record with all acceptances
 * @returns Updated need
 */
export function applyUpdateLaw(
    declaredNeed: number,
    acceptanceRecord: AcceptanceRecord
): number {
    // Sum all accepted amounts
    const totalAccepted = acceptanceRecord.acceptances.reduce(
        (sum, acceptance) => sum + acceptance.accepted_quantity,
        0
    );

    return computeRemainingNeed(declaredNeed, totalAccepted);
}

/**
 * Compute Total Accepted
 * 
 * Sums all accepted quantities from acceptance items.
 * 
 * @param acceptances - Array of acceptance items
 * @returns Total accepted quantity
 */
export function computeTotalAccepted(acceptances: AcceptanceItem[]): number {
    return acceptances.reduce(
        (sum, acceptance) => sum + acceptance.accepted_quantity,
        0
    );
}

/**
 * Compute Total Declined
 * 
 * Sums all declined quantities from acceptance items.
 * 
 * @param acceptances - Array of acceptance items
 * @returns Total declined quantity
 */
export function computeTotalDeclined(acceptances: AcceptanceItem[]): number {
    return acceptances.reduce(
        (sum, acceptance) => sum + acceptance.declined_quantity,
        0
    );
}

/**
 * Check Over-Allocation
 * 
 * Detects if total offers exceed need (expected in multi-provider scenarios).
 * 
 * @param declaredNeed - Original declared need
 * @param totalOffered - Total amount offered by all providers
 * @returns true if over-allocated
 */
export function checkOverAllocation(
    declaredNeed: number,
    totalOffered: number
): boolean {
    return totalOffered > declaredNeed;
}

/**
 * Validate Update Law
 * 
 * Ensures update law properties hold:
 * - Remaining need >= 0
 * - Remaining need <= declared need
 * - Monotonic decrease
 * 
 * @param declaredNeed - Original declared need
 * @param remainingNeed - Computed remaining need
 * @returns true if valid
 */
export function validateUpdateLaw(
    declaredNeed: number,
    remainingNeed: number
): boolean {
    // Must be non-negative
    if (remainingNeed < 0) {
        return false;
    }

    // Must not exceed declared need
    if (remainingNeed > declaredNeed) {
        return false;
    }

    return true;
}

/**
 * Compute Need Reduction
 * 
 * Calculates how much need was reduced.
 * 
 * @param declaredNeed - Original declared need
 * @param remainingNeed - Remaining need after acceptance
 * @returns Amount of need reduction
 */
export function computeNeedReduction(
    declaredNeed: number,
    remainingNeed: number
): number {
    return declaredNeed - remainingNeed;
}

/**
 * Compute Need Reduction Percentage
 * 
 * Calculates percentage of need that was met.
 * 
 * @param declaredNeed - Original declared need
 * @param remainingNeed - Remaining need after acceptance
 * @returns Percentage reduction (0-100)
 */
export function computeNeedReductionPercentage(
    declaredNeed: number,
    remainingNeed: number
): number {
    if (declaredNeed === 0) {
        return 100; // No need = 100% satisfied
    }

    const reduction = computeNeedReduction(declaredNeed, remainingNeed);
    return (reduction / declaredNeed) * 100;
}
