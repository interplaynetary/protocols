/**
 * Fairness Allocation Algorithms
 * 
 * This module implements elegant, non-market proportional allocation algorithms
 * based on the alpha-fairness framework and related scheduling primitives.
 * 
 * Key algorithms:
 * - Alpha-fairness (α-fair): Generalized fairness framework
 * - Proportional fairness: Log-utility optimization (α=1)
 * - Max-min fairness: Water-filling algorithm (α=∞)
 * - Proportional share: Lottery scheduling
 */

import type { ShareMap } from '../schemas.js';

// ═══════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Allocation result with utility information
 */
export interface FairAllocationResult {
    /** Allocated amounts for each participant */
    allocation: Record<string, number>;

    /** Total utility achieved */
    totalUtility: number;

    /** Per-participant utilities */
    utilities: Record<string, number>;

    /** Number of iterations to convergence (if iterative) */
    iterations?: number;

    /** Whether the algorithm converged */
    converged?: boolean;

    /** Metadata about the allocation */
    metadata: {
        algorithm: string;
        alpha?: number;
        totalCapacity: number;
        participantCount: number;
        timestamp: number;
    };
}

/**
 * Lottery ticket allocation result
 */
export interface LotteryAllocationResult {
    /** Ticket assignments */
    tickets: Record<string, number>;

    /** Total tickets */
    totalTickets: number;

    /** Probabilities (normalized tickets) */
    probabilities: ShareMap;

    /** Expected allocation per participant */
    expectedAllocation: Record<string, number>;
}

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate alpha-fair utility for a given allocation
 * 
 * U(x) = Σ w_i * x_i^(1-α) / (1-α)
 * 
 * Special cases:
 * - α = 0: U(x) = Σ w_i * x_i (max-sum, utilitarian)
 * - α = 1: U(x) = Σ w_i * log(x_i) (proportional fairness)
 * - α → ∞: max-min fairness
 */
function calculateAlphaUtility(
    allocation: Record<string, number>,
    weights: ShareMap,
    alpha: number
): number {
    let utility = 0;

    for (const [id, amount] of Object.entries(allocation)) {
        const weight = weights[id] || 0;

        if (amount <= 0) continue;

        if (alpha === 0) {
            // Utilitarian: U(x) = Σ w_i * x_i
            utility += weight * amount;
        } else if (alpha === 1) {
            // Proportional fairness: U(x) = Σ w_i * log(x_i)
            utility += weight * Math.log(amount);
        } else {
            // General alpha-fair: U(x) = Σ w_i * x_i^(1-α) / (1-α)
            utility += weight * Math.pow(amount, 1 - alpha) / (1 - alpha);
        }
    }

    return utility;
}

/**
 * Calculate per-participant utilities
 */
function calculateParticipantUtilities(
    allocation: Record<string, number>,
    weights: ShareMap,
    alpha: number
): Record<string, number> {
    const utilities: Record<string, number> = {};

    for (const [id, amount] of Object.entries(allocation)) {
        const weight = weights[id] || 0;

        if (amount <= 0) {
            utilities[id] = 0;
            continue;
        }

        if (alpha === 0) {
            utilities[id] = weight * amount;
        } else if (alpha === 1) {
            utilities[id] = weight * Math.log(amount);
        } else {
            utilities[id] = weight * Math.pow(amount, 1 - alpha) / (1 - alpha);
        }
    }

    return utilities;
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
// ALPHA-FAIRNESS ALLOCATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate alpha-fair allocation using gradient ascent
 * 
 * The alpha-fairness framework provides a spectrum of fairness criteria:
 * - α = 0: Maximize total utility (utilitarian)
 * - α = 1: Proportional fairness (Nash bargaining solution)
 * - α = 2: Harmonic mean fairness
 * - α → ∞: Max-min fairness (Rawlsian)
 * 
 * @param weights - Normalized recognition weights (ShareMap)
 * @param totalCapacity - Total resource to allocate
 * @param alpha - Fairness parameter (0 to Infinity)
 * @param options - Algorithm options
 * @returns Fair allocation result
 * 
 * @example
 * ```typescript
 * const weights = { alice: 0.5, bob: 0.3, carol: 0.2 };
 * const result = calculateAlphaFairAllocation(weights, 100, 1);
 * // Proportional fairness: alice=50, bob=30, carol=20
 * ```
 */
export function calculateAlphaFairAllocation(
    weights: ShareMap,
    totalCapacity: number,
    alpha: number = 1,
    options: {
        maxIterations?: number;
        convergenceThreshold?: number;
    } = {}
): FairAllocationResult {
    const maxIterations = options.maxIterations ?? 1000;
    const convergenceThreshold = options.convergenceThreshold ?? 1e-6;

    // Normalize weights
    const normalizedWeights = normalizeWeights(weights);
    const participants = Object.keys(normalizedWeights);
    const n = participants.length;

    if (n === 0) {
        return {
            allocation: {},
            totalUtility: 0,
            utilities: {},
            iterations: 0,
            converged: true,
            metadata: {
                algorithm: 'alpha-fair',
                alpha,
                totalCapacity,
                participantCount: 0,
                timestamp: Date.now()
            }
        };
    }

    // Special case: alpha = 0 (utilitarian)
    if (alpha === 0) {
        // Give all capacity to highest weight participant
        const maxWeightId = participants.reduce((a, b) =>
            normalizedWeights[a] > normalizedWeights[b] ? a : b
        );

        const allocation: Record<string, number> = {};
        participants.forEach(id => allocation[id] = 0);
        allocation[maxWeightId] = totalCapacity;

        return {
            allocation,
            totalUtility: calculateAlphaUtility(allocation, normalizedWeights, alpha),
            utilities: calculateParticipantUtilities(allocation, normalizedWeights, alpha),
            iterations: 0,
            converged: true,
            metadata: {
                algorithm: 'alpha-fair',
                alpha,
                totalCapacity,
                participantCount: n,
                timestamp: Date.now()
            }
        };
    }

    // Special case: alpha = 1 (proportional fairness)
    if (alpha === 1) {
        const allocation: Record<string, number> = {};
        participants.forEach(id => {
            allocation[id] = normalizedWeights[id] * totalCapacity;
        });

        return {
            allocation,
            totalUtility: calculateAlphaUtility(allocation, normalizedWeights, alpha),
            utilities: calculateParticipantUtilities(allocation, normalizedWeights, alpha),
            iterations: 0,
            converged: true,
            metadata: {
                algorithm: 'alpha-fair',
                alpha,
                totalCapacity,
                participantCount: n,
                timestamp: Date.now()
            }
        };
    }

    // Special case: alpha = Infinity (max-min fairness)
    if (!isFinite(alpha) || alpha >= 100) {
        return calculateMaxMinFairness(weights, totalCapacity);
    }

    // General case: use gradient ascent
    // Initialize with proportional allocation
    const allocation: Record<string, number> = {};
    participants.forEach(id => {
        allocation[id] = normalizedWeights[id] * totalCapacity;
    });

    let converged = false;
    let iterations = 0;
    const learningRate = 0.01;

    for (iterations = 0; iterations < maxIterations; iterations++) {
        // Calculate gradients: ∂U/∂x_i = w_i * x_i^(-α)
        const gradients: Record<string, number> = {};
        let maxGradientDiff = 0;

        for (const id of participants) {
            if (allocation[id] > 0) {
                gradients[id] = normalizedWeights[id] * Math.pow(allocation[id], -alpha);
            } else {
                gradients[id] = Infinity;
            }
        }

        // Normalize gradients (project onto capacity constraint)
        const avgGradient = Object.values(gradients).reduce((a, b) => a + b, 0) / n;

        // Update allocations
        let totalAllocation = 0;
        for (const id of participants) {
            const update = learningRate * (gradients[id] - avgGradient);
            allocation[id] = Math.max(0, allocation[id] + update);
            totalAllocation += allocation[id];
            maxGradientDiff = Math.max(maxGradientDiff, Math.abs(update));
        }

        // Renormalize to maintain capacity constraint
        const scale = totalCapacity / totalAllocation;
        for (const id of participants) {
            allocation[id] *= scale;
        }

        // Check convergence
        if (maxGradientDiff < convergenceThreshold) {
            converged = true;
            break;
        }
    }

    return {
        allocation,
        totalUtility: calculateAlphaUtility(allocation, normalizedWeights, alpha),
        utilities: calculateParticipantUtilities(allocation, normalizedWeights, alpha),
        iterations,
        converged,
        metadata: {
            algorithm: 'alpha-fair',
            alpha,
            totalCapacity,
            participantCount: n,
            timestamp: Date.now()
        }
    };
}

/**
 * Calculate proportional fair allocation (α = 1)
 * 
 * This is the most commonly used fairness criterion, maximizing
 * the sum of logarithmic utilities: Σ w_i * log(x_i)
 * 
 * Result: x_i = w_i * C (direct proportional allocation)
 */
export function calculateProportionalFairness(
    weights: ShareMap,
    totalCapacity: number
): FairAllocationResult {
    return calculateAlphaFairAllocation(weights, totalCapacity, 1);
}

// ═══════════════════════════════════════════════════════════════════
// MAX-MIN FAIRNESS (WATER-FILLING)
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate max-min fair allocation using water-filling algorithm
 * 
 * Max-min fairness maximizes the minimum allocation, then the second
 * minimum, and so on. This is the α → ∞ limit of alpha-fairness.
 * 
 * Algorithm:
 * 1. Sort participants by weight (ascending)
 * 2. Fill allocations level by level (water-filling)
 * 3. Stop when capacity is exhausted
 * 
 * @param weights - Recognition weights
 * @param totalCapacity - Total resource to allocate
 * @returns Max-min fair allocation
 */
export function calculateMaxMinFairness(
    weights: ShareMap,
    totalCapacity: number
): FairAllocationResult {
    const normalizedWeights = normalizeWeights(weights);
    const participants = Object.keys(normalizedWeights).sort((a, b) =>
        normalizedWeights[a] - normalizedWeights[b]
    );

    const n = participants.length;
    const allocation: Record<string, number> = {};
    participants.forEach(id => allocation[id] = 0);

    if (n === 0) {
        return {
            allocation: {},
            totalUtility: 0,
            utilities: {},
            iterations: 0,
            converged: true,
            metadata: {
                algorithm: 'max-min-fair',
                alpha: Infinity,
                totalCapacity,
                participantCount: 0,
                timestamp: Date.now()
            }
        };
    }

    let remainingCapacity = totalCapacity;
    let remainingParticipants = n;

    // Water-filling: allocate equally until someone's weight is satisfied
    for (let i = 0; i < n; i++) {
        const id = participants[i];
        const weight = normalizedWeights[id];

        // How much can we give to all remaining participants equally?
        const equalShare = remainingCapacity / remainingParticipants;

        // How much does this participant want (proportional to weight)?
        const desiredShare = weight * totalCapacity;

        if (desiredShare <= equalShare) {
            // This participant is satisfied
            allocation[id] = desiredShare;
            remainingCapacity -= desiredShare;
            remainingParticipants--;
        } else {
            // Give equal share to all remaining participants
            for (let j = i; j < n; j++) {
                allocation[participants[j]] = equalShare;
            }
            break;
        }
    }

    return {
        allocation,
        totalUtility: calculateAlphaUtility(allocation, normalizedWeights, Infinity),
        utilities: calculateParticipantUtilities(allocation, normalizedWeights, Infinity),
        iterations: n,
        converged: true,
        metadata: {
            algorithm: 'max-min-fair',
            alpha: Infinity,
            totalCapacity,
            participantCount: n,
            timestamp: Date.now()
        }
    };
}

// ═══════════════════════════════════════════════════════════════════
// PROPORTIONAL SHARE (LOTTERY SCHEDULING)
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate proportional share allocation (lottery scheduling)
 * 
 * This is a simple, deterministic proportional allocation where each
 * participant receives exactly their weighted share of the resource.
 * 
 * Equivalent to α = 1 (proportional fairness) but presented as a
 * scheduling primitive rather than utility optimization.
 */
export function calculateProportionalShare(
    weights: ShareMap,
    totalCapacity: number
): FairAllocationResult {
    const normalizedWeights = normalizeWeights(weights);
    const allocation: Record<string, number> = {};

    for (const [id, weight] of Object.entries(normalizedWeights)) {
        allocation[id] = weight * totalCapacity;
    }

    return {
        allocation,
        totalUtility: calculateAlphaUtility(allocation, normalizedWeights, 1),
        utilities: calculateParticipantUtilities(allocation, normalizedWeights, 1),
        iterations: 0,
        converged: true,
        metadata: {
            algorithm: 'proportional-share',
            alpha: 1,
            totalCapacity,
            participantCount: Object.keys(normalizedWeights).length,
            timestamp: Date.now()
        }
    };
}

/**
 * Allocate lottery tickets based on weights
 * 
 * Converts continuous weights into discrete ticket counts for
 * probabilistic scheduling (e.g., lottery scheduling in OS).
 * 
 * @param weights - Recognition weights
 * @param totalTickets - Total number of tickets to allocate
 * @returns Lottery ticket allocation
 */
export function allocateLotteryTickets(
    weights: ShareMap,
    totalTickets: number
): LotteryAllocationResult {
    const normalizedWeights = normalizeWeights(weights);
    const tickets: Record<string, number> = {};

    // Allocate tickets proportionally (round down)
    let allocatedTickets = 0;
    const remainders: Array<[string, number]> = [];

    for (const [id, weight] of Object.entries(normalizedWeights)) {
        const exactTickets = weight * totalTickets;
        const baseTickets = Math.floor(exactTickets);
        const remainder = exactTickets - baseTickets;

        tickets[id] = baseTickets;
        allocatedTickets += baseTickets;
        remainders.push([id, remainder]);
    }

    // Distribute remaining tickets by largest remainder
    remainders.sort((a, b) => b[1] - a[1]);
    let remaining = totalTickets - allocatedTickets;

    for (const [id, _] of remainders) {
        if (remaining <= 0) break;
        tickets[id]++;
        remaining--;
    }

    // Calculate probabilities and expected allocation
    const probabilities: ShareMap = {};
    const expectedAllocation: Record<string, number> = {};

    for (const [id, ticketCount] of Object.entries(tickets)) {
        probabilities[id] = ticketCount / totalTickets;
        expectedAllocation[id] = probabilities[id];
    }

    return {
        tickets,
        totalTickets,
        probabilities,
        expectedAllocation
    };
}

/**
 * Simulate lottery scheduling for a given number of rounds
 * 
 * @param weights - Recognition weights
 * @param totalRounds - Number of scheduling rounds
 * @returns Allocation counts per participant
 */
export function simulateLotteryScheduling(
    weights: ShareMap,
    totalRounds: number
): Record<string, number> {
    const lottery = allocateLotteryTickets(weights, 1000); // Use 1000 tickets for granularity
    const allocation: Record<string, number> = {};

    for (const id of Object.keys(weights)) {
        allocation[id] = 0;
    }

    // Simulate random draws
    for (let round = 0; round < totalRounds; round++) {
        const randomTicket = Math.floor(Math.random() * lottery.totalTickets);

        let cumulativeTickets = 0;
        for (const [id, ticketCount] of Object.entries(lottery.tickets)) {
            cumulativeTickets += ticketCount;
            if (randomTicket < cumulativeTickets) {
                allocation[id]++;
                break;
            }
        }
    }

    return allocation;
}
