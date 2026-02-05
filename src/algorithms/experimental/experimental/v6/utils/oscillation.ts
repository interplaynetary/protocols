/**
 * Free Association Protocol v6 - Oscillation Detection
 * 
 * Detects and dampens rapid oscillations in recipient needs.
 * Prevents gaming and ensures stability.
 */

import type { OscillationHistoryEntry, OscillationState } from '../schemas.js';
import { V6_CONFIG } from '../config.js';

// ═══════════════════════════════════════════════════════════════════
// OSCILLATION DETECTION
// ═══════════════════════════════════════════════════════════════════

/**
 * Detect Oscillation Pattern
 * 
 * Checks for rapid on-off-on pattern in need history:
 * - N(t-2) > 0 (had need)
 * - N(t-1) = 0 (no need)
 * - N(t) ≈ N(t-2) (need returns at similar level)
 * 
 * This pattern suggests gaming or unstable behavior.
 * 
 * @param history - Need history (last 3+ entries)
 * @returns true if oscillation detected
 */
export function detectOscillationPattern(
    history: OscillationHistoryEntry[]
): boolean {
    if (history.length < 3) {
        return false; // Not enough data
    }

    // Get last 3 entries (most recent first after sort)
    const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp);
    const [current, previous, beforePrevious] = sorted.slice(0, 3);

    // Pattern: had need → no need → need returns
    const hadNeed = beforePrevious.declared_need > 0;
    const noNeed = previous.declared_need === 0;
    const needReturns = current.declared_need > 0;

    if (!hadNeed || !noNeed || !needReturns) {
        return false;
    }

    // Check if current need is similar to before (within threshold)
    const ratio = current.declared_need / beforePrevious.declared_need;
    const threshold = V6_CONFIG.oscillation.change_threshold;

    // Similar if ratio is close to 1.0 (within ±threshold)
    const isSimilar = Math.abs(ratio - 1.0) < threshold;

    return isSimilar;
}

/**
 * Compute Damping Factor
 * 
 * Returns damping factor based on oscillation state.
 * 
 * @param oscillationDetected - Whether oscillation was detected
 * @returns Damping factor (0.0-1.0)
 */
export function computeDampingFactor(oscillationDetected: boolean): number {
    if (oscillationDetected) {
        return V6_CONFIG.oscillation.damping_factor; // e.g., 0.7
    }

    return 1.0; // No dampening
}

/**
 * Update Oscillation History
 * 
 * Adds new entry to history and maintains max length.
 * 
 * @param history - Current history
 * @param needTypeId - Need type ID
 * @param declaredNeed - Current declared need
 * @returns Updated history
 */
export function updateOscillationHistory(
    history: OscillationHistoryEntry[],
    needTypeId: string,
    declaredNeed: number
): OscillationHistoryEntry[] {
    const newEntry: OscillationHistoryEntry = {
        type_id: needTypeId,
        declared_need: declaredNeed,
        timestamp: Date.now()
    };

    const updated = [...history, newEntry];

    // Keep only last N entries
    const maxLength = V6_CONFIG.oscillation.history_length;
    if (updated.length > maxLength) {
        return updated.slice(-maxLength);
    }

    return updated;
}

/**
 * Update Oscillation State
 * 
 * Updates oscillation state with new need value.
 * Detects oscillation and computes damping factor.
 * 
 * @param state - Current oscillation state
 * @param declaredNeed - New declared need
 * @returns Updated oscillation state
 */
export function updateOscillationState(
    state: OscillationState,
    declaredNeed: number
): OscillationState {
    // Update history
    const updatedHistory = updateOscillationHistory(
        state.history,
        state.type_id,
        declaredNeed
    );

    // Detect oscillation
    const oscillationDetected = detectOscillationPattern(updatedHistory);

    // Compute damping factor
    const dampingFactor = computeDampingFactor(oscillationDetected);

    return {
        ...state,
        history: updatedHistory,
        oscillation_detected: oscillationDetected,
        damping_factor: dampingFactor
    };
}

/**
 * Create Initial Oscillation State
 * 
 * @param recipientId - Recipient public key
 * @param needTypeId - Need type ID
 * @returns Initial oscillation state
 */
export function createInitialOscillationState(
    recipientId: string,
    needTypeId: string
): OscillationState {
    return {
        recipient_id: recipientId,
        type_id: needTypeId,
        history: [],
        damping_factor: 1.0,
        oscillation_detected: false
    };
}

/**
 * Apply Dampening to Need
 * 
 * Applies damping factor to declared need.
 * 
 * @param declaredNeed - Declared need
 * @param dampingFactor - Damping factor (0.0-1.0)
 * @returns Active need (after dampening)
 */
export function applyDampening(
    declaredNeed: number,
    dampingFactor: number
): number {
    return declaredNeed * dampingFactor;
}
