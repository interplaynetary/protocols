/**
 * Divisor Methods for Apportionment
 * 
 * This module implements elegant divisor methods (also called highest averages methods)
 * for allocating indivisible resources proportionally. These are the mathematical
 * primitives used in political apportionment worldwide.
 * 
 * Key methods:
 * - D'Hondt (Jefferson): Favors larger parties
 * - Webster (Sainte-Laguë): More proportional
 * - Adams: Favors smaller parties
 * - Largest Remainder (Hare-Niemeyer): Quota-based
 */

import type { ShareMap } from '../schemas.js';

// ═══════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Apportionment result
 */
export interface ApportionmentResult {
    /** Integer allocations for each participant */
    allocation: Record<string, number>;

    /** Total seats/items allocated */
    totalAllocated: number;

    /** Proportionality metrics */
    metrics: {
        /** Largest deviation from ideal proportion */
        maxDeviation: number;

        /** Average deviation from ideal proportion */
        avgDeviation: number;

        /** Ideal (fractional) allocations */
        idealAllocation: Record<string, number>;
    };

    /** Metadata */
    metadata: {
        method: string;
        totalSeats: number;
        participantCount: number;
        timestamp: number;
    };
}

/**
 * Divisor sequence function type
 */
type DivisorFunction = (seatNumber: number) => number;

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate proportionality metrics
 */
function calculateMetrics(
    allocation: Record<string, number>,
    weights: ShareMap,
    totalSeats: number
): {
    maxDeviation: number;
    avgDeviation: number;
    idealAllocation: Record<string, number>;
} {
    const idealAllocation: Record<string, number> = {};
    let totalDeviation = 0;
    let maxDeviation = 0;

    for (const [id, weight] of Object.entries(weights)) {
        const ideal = weight * totalSeats;
        const actual = allocation[id] || 0;
        const deviation = Math.abs(actual - ideal);

        idealAllocation[id] = ideal;
        totalDeviation += deviation;
        maxDeviation = Math.max(maxDeviation, deviation);
    }

    const avgDeviation = totalDeviation / Object.keys(weights).length;

    return { maxDeviation, avgDeviation, idealAllocation };
}

/**
 * Normalize weights to sum to 1.0
 */
function normalizeWeights(weights: Record<string, number>): ShareMap {
    const sum = Object.values(weights).reduce((acc, w) => acc + w, 0);

    if (sum === 0) {
        const keys = Object.keys(weights);
        const uniform = 1.0 / keys.length;
        return Object.fromEntries(keys.map(k => [k, uniform]));
    }

    return Object.fromEntries(
        Object.entries(weights).map(([k, w]) => [k, w / sum])
    );
}

// ═══════════════════════════════════════════════════════════════════
// DIVISOR METHODS (HIGHEST AVERAGES)
// ═══════════════════════════════════════════════════════════════════

/**
 * Generic divisor method implementation
 * 
 * @param weights - Recognition weights
 * @param totalSeats - Total seats/items to allocate
 * @param divisorFn - Divisor function d(n) where n is the seat number
 * @param methodName - Name of the method for metadata
 */
function applyDivisorMethod(
    weights: ShareMap,
    totalSeats: number,
    divisorFn: DivisorFunction,
    methodName: string
): ApportionmentResult {
    const normalizedWeights = normalizeWeights(weights);
    const participants = Object.keys(normalizedWeights);
    const n = participants.length;

    // Initialize allocations to zero
    const allocation: Record<string, number> = {};
    participants.forEach(id => allocation[id] = 0);

    if (n === 0 || totalSeats === 0) {
        return {
            allocation: {},
            totalAllocated: 0,
            metrics: {
                maxDeviation: 0,
                avgDeviation: 0,
                idealAllocation: {}
            },
            metadata: {
                method: methodName,
                totalSeats,
                participantCount: 0,
                timestamp: Date.now()
            }
        };
    }

    // Allocate seats one by one
    for (let seat = 0; seat < totalSeats; seat++) {
        // Calculate quotient for each participant
        let maxQuotient = -Infinity;
        let winner = participants[0];

        for (const id of participants) {
            const weight = normalizedWeights[id];
            const currentSeats = allocation[id];
            const quotient = weight / divisorFn(currentSeats);

            if (quotient > maxQuotient) {
                maxQuotient = quotient;
                winner = id;
            }
        }

        // Award seat to winner
        allocation[winner]++;
    }

    const metrics = calculateMetrics(allocation, normalizedWeights, totalSeats);

    return {
        allocation,
        totalAllocated: totalSeats,
        metrics,
        metadata: {
            method: methodName,
            totalSeats,
            participantCount: n,
            timestamp: Date.now()
        }
    };
}

/**
 * D'Hondt method (Jefferson method)
 * 
 * Divisor: d(n) = n + 1
 * Sequence: 1, 2, 3, 4, 5, ...
 * 
 * This method slightly favors larger parties/weights.
 * Used in: European Parliament, many national parliaments
 * 
 * @example
 * ```typescript
 * const weights = { party_a: 0.45, party_b: 0.35, party_c: 0.20 };
 * const result = calculateDHondt(weights, 10);
 * // Allocates 10 seats proportionally
 * ```
 */
export function calculateDHondt(
    weights: ShareMap,
    totalSeats: number
): ApportionmentResult {
    return applyDivisorMethod(
        weights,
        totalSeats,
        (n) => n + 1,
        'dhondt'
    );
}

/**
 * Webster method (Sainte-Laguë method)
 * 
 * Divisor: d(n) = 2n + 1
 * Sequence: 1, 3, 5, 7, 9, ...
 * 
 * This method is more proportional than D'Hondt.
 * Used in: New Zealand, Norway, Sweden, Germany (modified)
 * 
 * @example
 * ```typescript
 * const weights = { alice: 0.5, bob: 0.3, carol: 0.2 };
 * const result = calculateWebster(weights, 100);
 * ```
 */
export function calculateWebster(
    weights: ShareMap,
    totalSeats: number
): ApportionmentResult {
    return applyDivisorMethod(
        weights,
        totalSeats,
        (n) => 2 * n + 1,
        'webster'
    );
}

/**
 * Modified Sainte-Laguë method
 * 
 * Divisor: d(0) = 1.4, d(n) = 2n + 1 for n > 0
 * Sequence: 1.4, 3, 5, 7, 9, ...
 * 
 * This variant makes it slightly harder for very small parties
 * to win their first seat, reducing fragmentation.
 * Used in: Germany, Norway
 */
export function calculateModifiedWebster(
    weights: ShareMap,
    totalSeats: number
): ApportionmentResult {
    return applyDivisorMethod(
        weights,
        totalSeats,
        (n) => n === 0 ? 1.4 : 2 * n + 1,
        'modified-webster'
    );
}

/**
 * Adams method (smallest divisor method)
 * 
 * Divisor: d(n) = n
 * Sequence: 0, 1, 2, 3, 4, ... (treat 0 as small epsilon)
 * 
 * This method favors smaller parties/weights.
 * Rarely used in practice but mathematically elegant.
 */
export function calculateAdams(
    weights: ShareMap,
    totalSeats: number
): ApportionmentResult {
    return applyDivisorMethod(
        weights,
        totalSeats,
        (n) => n === 0 ? 0.0001 : n, // Small epsilon for first seat
        'adams'
    );
}

/**
 * Huntington-Hill method
 * 
 * Divisor: d(n) = √(n * (n + 1))
 * Sequence: 0, √2, √6, √12, √20, ...
 * 
 * This method uses the geometric mean.
 * Used in: US House of Representatives apportionment
 */
export function calculateHuntingtonHill(
    weights: ShareMap,
    totalSeats: number
): ApportionmentResult {
    return applyDivisorMethod(
        weights,
        totalSeats,
        (n) => n === 0 ? 0.0001 : Math.sqrt(n * (n + 1)),
        'huntington-hill'
    );
}

// ═══════════════════════════════════════════════════════════════════
// LARGEST REMAINDER METHOD (QUOTA-BASED)
// ═══════════════════════════════════════════════════════════════════

/**
 * Largest Remainder method (Hare-Niemeyer, Hamilton method)
 * 
 * Algorithm:
 * 1. Calculate quota: q_i = w_i * totalSeats
 * 2. Give each participant ⌊q_i⌋ seats (floor)
 * 3. Distribute remaining seats by largest remainder
 * 
 * This is a quota-based method rather than a divisor method.
 * Used in: Many countries for proportional representation
 * 
 * @example
 * ```typescript
 * const weights = { alice: 0.52, bob: 0.48 };
 * const result = calculateLargestRemainder(weights, 10);
 * // alice: 5, bob: 5 (remainders: 0.2, 0.8 → bob gets extra seat)
 * ```
 */
export function calculateLargestRemainder(
    weights: ShareMap,
    totalSeats: number
): ApportionmentResult {
    const normalizedWeights = normalizeWeights(weights);
    const participants = Object.keys(normalizedWeights);
    const n = participants.length;

    const allocation: Record<string, number> = {};
    const quotas: Record<string, number> = {};
    const remainders: Array<[string, number]> = [];

    if (n === 0 || totalSeats === 0) {
        return {
            allocation: {},
            totalAllocated: 0,
            metrics: {
                maxDeviation: 0,
                avgDeviation: 0,
                idealAllocation: {}
            },
            metadata: {
                method: 'largest-remainder',
                totalSeats,
                participantCount: 0,
                timestamp: Date.now()
            }
        };
    }

    // Step 1: Calculate quotas and allocate floor
    let allocatedSeats = 0;

    for (const [id, weight] of Object.entries(normalizedWeights)) {
        const quota = weight * totalSeats;
        const floor = Math.floor(quota);
        const remainder = quota - floor;

        quotas[id] = quota;
        allocation[id] = floor;
        allocatedSeats += floor;
        remainders.push([id, remainder]);
    }

    // Step 2: Distribute remaining seats by largest remainder
    remainders.sort((a, b) => b[1] - a[1]);
    let remainingSeats = totalSeats - allocatedSeats;

    for (const [id, _] of remainders) {
        if (remainingSeats <= 0) break;
        allocation[id]++;
        remainingSeats--;
    }

    const metrics = calculateMetrics(allocation, normalizedWeights, totalSeats);

    return {
        allocation,
        totalAllocated: totalSeats,
        metrics,
        metadata: {
            method: 'largest-remainder',
            totalSeats,
            participantCount: n,
            timestamp: Date.now()
        }
    };
}

// ═══════════════════════════════════════════════════════════════════
// COMPARISON UTILITIES
// ═══════════════════════════════════════════════════════════════════

/**
 * Compare multiple apportionment methods
 * 
 * @param weights - Recognition weights
 * @param totalSeats - Total seats to allocate
 * @returns Results from all methods
 */
export function compareApportionmentMethods(
    weights: ShareMap,
    totalSeats: number
): Record<string, ApportionmentResult> {
    return {
        dhondt: calculateDHondt(weights, totalSeats),
        webster: calculateWebster(weights, totalSeats),
        modifiedWebster: calculateModifiedWebster(weights, totalSeats),
        adams: calculateAdams(weights, totalSeats),
        huntingtonHill: calculateHuntingtonHill(weights, totalSeats),
        largestRemainder: calculateLargestRemainder(weights, totalSeats)
    };
}

/**
 * Get the most proportional method for given weights
 * 
 * Returns the method with the lowest average deviation from ideal allocation.
 */
export function getMostProportionalMethod(
    weights: ShareMap,
    totalSeats: number
): { method: string; result: ApportionmentResult } {
    const results = compareApportionmentMethods(weights, totalSeats);

    let bestMethod = 'webster';
    let bestDeviation = Infinity;

    for (const [method, result] of Object.entries(results)) {
        if (result.metrics.avgDeviation < bestDeviation) {
            bestDeviation = result.metrics.avgDeviation;
            bestMethod = method;
        }
    }

    return {
        method: bestMethod,
        result: results[bestMethod]
    };
}
