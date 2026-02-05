/**
 * Centrality Calculation Module
 * 
 * This module computes eigenvector centrality from global recognition weights.
 * Eigenvector centrality measures the influence of a node in a network based on
 * the principle that connections to high-scoring nodes contribute more to the
 * score of the node in question.
 * 
 * Use cases:
 * - Identify influential members in the recognition network
 * - Weight allocations by network centrality
 * - Analyze recognition network structure
 * - Detect central coordinators or hubs
 */

import type { GlobalRecognitionWeights, ShareMap } from '../schemas.js';

// ═══════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Recognition Network - Map of pubkey to their recognition weights
 * This is a "sharemap of sharemaps" - each person's recognition of others
 */
export type RecognitionNetwork = Record<string, GlobalRecognitionWeights>;

/**
 * Centrality Scores - Map of pubkey to their centrality score
 * Scores are normalized to sum to 1.0
 */
export type CentralityScores = ShareMap;

/**
 * Centrality Calculation Options
 */
export interface CentralityOptions {
    /** Maximum iterations for power iteration (default: 100) */
    maxIterations?: number;

    /** Convergence threshold (default: 1e-6) */
    convergenceThreshold?: number;

    /** Damping factor for PageRank-style calculation (default: 1.0 for pure eigenvector) */
    dampingFactor?: number;

    /** Whether to normalize the result (default: true) */
    normalize?: boolean;
}

/**
 * Centrality Calculation Result
 */
export interface CentralityResult {
    /** Centrality scores for each node */
    scores: CentralityScores;

    /** Number of iterations until convergence */
    iterations: number;

    /** Whether the algorithm converged */
    converged: boolean;

    /** Final convergence delta */
    convergenceDelta: number;

    /** Metadata about the calculation */
    metadata: {
        nodeCount: number;
        edgeCount: number;
        timestamp: number;
    };
}

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Normalize a vector to sum to 1.0 (L1 normalization)
 */
function normalizeL1(vector: Record<string, number>): Record<string, number> {
    const sum = Object.values(vector).reduce((acc, val) => acc + val, 0);

    if (sum === 0) {
        // If all zeros, return uniform distribution
        const keys = Object.keys(vector);
        const uniform = 1.0 / keys.length;
        return Object.fromEntries(keys.map(k => [k, uniform]));
    }

    return Object.fromEntries(
        Object.entries(vector).map(([k, v]) => [k, v / sum])
    );
}

/**
 * Normalize a vector to have unit length (L2 normalization)
 */
function normalizeL2(vector: Record<string, number>): Record<string, number> {
    const sumSquares = Object.values(vector).reduce((acc, val) => acc + val * val, 0);
    const magnitude = Math.sqrt(sumSquares);

    if (magnitude === 0) {
        // If all zeros, return uniform distribution
        const keys = Object.keys(vector);
        const uniform = 1.0 / Math.sqrt(keys.length);
        return Object.fromEntries(keys.map(k => [k, uniform]));
    }

    return Object.fromEntries(
        Object.entries(vector).map(([k, v]) => [k, v / magnitude])
    );
}

/**
 * Calculate the L1 distance between two vectors
 */
function l1Distance(
    v1: Record<string, number>,
    v2: Record<string, number>
): number {
    const allKeys = new Set([...Object.keys(v1), ...Object.keys(v2)]);
    let distance = 0;

    for (const key of allKeys) {
        const val1 = v1[key] || 0;
        const val2 = v2[key] || 0;
        distance += Math.abs(val1 - val2);
    }

    return distance;
}

/**
 * Build adjacency matrix representation from recognition network
 * Returns: { nodes: string[], matrix: number[][] }
 */
function buildAdjacencyMatrix(network: RecognitionNetwork): {
    nodes: string[];
    matrix: number[][];
} {
    // Get all unique nodes (both recognizers and recognized)
    const nodeSet = new Set<string>();

    for (const [recognizer, weights] of Object.entries(network)) {
        nodeSet.add(recognizer);
        for (const recognized of Object.keys(weights)) {
            nodeSet.add(recognized);
        }
    }

    const nodes = Array.from(nodeSet).sort();
    const n = nodes.length;
    const nodeIndex = new Map(nodes.map((node, i) => [node, i]));

    // Build adjacency matrix (column-stochastic for eigenvector centrality)
    const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    for (const [recognizer, weights] of Object.entries(network)) {
        const fromIdx = nodeIndex.get(recognizer)!;

        // Normalize weights for this recognizer
        const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);

        if (totalWeight > 0) {
            for (const [recognized, weight] of Object.entries(weights)) {
                const toIdx = nodeIndex.get(recognized)!;
                // Column-stochastic: matrix[to][from] = weight
                matrix[toIdx][fromIdx] = weight / totalWeight;
            }
        }
    }

    return { nodes, matrix };
}

/**
 * Multiply adjacency matrix by vector
 */
function matrixVectorMultiply(
    matrix: number[][],
    vector: number[]
): number[] {
    const n = matrix.length;
    const result = Array(n).fill(0);

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            result[i] += matrix[i][j] * vector[j];
        }
    }

    return result;
}

// ═══════════════════════════════════════════════════════════════════
// POWER ITERATION ALGORITHM
// ═══════════════════════════════════════════════════════════════════

/**
 * Power iteration algorithm for computing eigenvector centrality
 * 
 * Algorithm:
 * 1. Start with uniform vector
 * 2. Repeatedly multiply by adjacency matrix
 * 3. Normalize after each iteration
 * 4. Stop when convergence threshold is met or max iterations reached
 * 
 * @param matrix - Column-stochastic adjacency matrix
 * @param options - Calculation options
 * @returns Eigenvector (normalized) and convergence info
 */
function powerIteration(
    matrix: number[][],
    options: Required<CentralityOptions>
): {
    vector: number[];
    iterations: number;
    converged: boolean;
    convergenceDelta: number;
} {
    const n = matrix.length;

    if (n === 0) {
        return {
            vector: [],
            iterations: 0,
            converged: true,
            convergenceDelta: 0
        };
    }

    // Initialize with uniform vector
    let vector = Array(n).fill(1.0 / n);
    let prevVector = [...vector];
    let converged = false;
    let convergenceDelta = Infinity;
    let iterations = 0;

    for (iterations = 0; iterations < options.maxIterations; iterations++) {
        // Store previous vector
        prevVector = [...vector];

        // Multiply by adjacency matrix
        vector = matrixVectorMultiply(matrix, vector);

        // Apply damping factor (for PageRank-style calculation)
        if (options.dampingFactor < 1.0) {
            const teleport = (1.0 - options.dampingFactor) / n;
            vector = vector.map(v => options.dampingFactor * v + teleport);
        }

        // Normalize (L2 norm for numerical stability)
        const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
        if (magnitude > 0) {
            vector = vector.map(v => v / magnitude);
        }

        // Check convergence (L1 distance)
        convergenceDelta = 0;
        for (let i = 0; i < n; i++) {
            convergenceDelta += Math.abs(vector[i] - prevVector[i]);
        }

        if (convergenceDelta < options.convergenceThreshold) {
            converged = true;
            break;
        }
    }

    return {
        vector,
        iterations: iterations + 1,
        converged,
        convergenceDelta
    };
}

// ═══════════════════════════════════════════════════════════════════
// MAIN CALCULATION FUNCTION
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate eigenvector centrality from recognition network
 * 
 * Eigenvector centrality measures the influence of a node based on the
 * principle that connections to high-scoring nodes contribute more.
 * 
 * This is the same algorithm used by Google's PageRank (with damping=0.85)
 * and by social network analysis tools.
 * 
 * @param network - Recognition network (sharemap of sharemaps)
 * @param options - Calculation options
 * @returns Centrality result with scores and metadata
 * 
 * @example
 * ```typescript
 * const network = {
 *   alice: { bob: 0.5, carol: 0.5 },
 *   bob: { alice: 0.3, carol: 0.7 },
 *   carol: { alice: 0.6, bob: 0.4 }
 * };
 * 
 * const result = calculateEigenvectorCentrality(network);
 * console.log(result.scores);
 * // { alice: 0.42, bob: 0.31, carol: 0.27 }
 * ```
 */
export function calculateEigenvectorCentrality(
    network: RecognitionNetwork,
    options: CentralityOptions = {}
): CentralityResult {
    // Fill in default options
    const opts: Required<CentralityOptions> = {
        maxIterations: options.maxIterations ?? 100,
        convergenceThreshold: options.convergenceThreshold ?? 1e-6,
        dampingFactor: options.dampingFactor ?? 1.0,
        normalize: options.normalize ?? true
    };

    // Handle empty network
    if (Object.keys(network).length === 0) {
        return {
            scores: {},
            iterations: 0,
            converged: true,
            convergenceDelta: 0,
            metadata: {
                nodeCount: 0,
                edgeCount: 0,
                timestamp: Date.now()
            }
        };
    }

    // Build adjacency matrix
    const { nodes, matrix } = buildAdjacencyMatrix(network);

    // Count edges
    let edgeCount = 0;
    for (const weights of Object.values(network)) {
        edgeCount += Object.keys(weights).length;
    }

    // Run power iteration
    const { vector, iterations, converged, convergenceDelta } = powerIteration(
        matrix,
        opts
    );

    // Convert vector back to scores object
    let scores: Record<string, number> = {};
    for (let i = 0; i < nodes.length; i++) {
        scores[nodes[i]] = vector[i];
    }

    // Normalize to sum to 1.0 if requested
    if (opts.normalize) {
        scores = normalizeL1(scores);
    }

    return {
        scores,
        iterations,
        converged,
        convergenceDelta,
        metadata: {
            nodeCount: nodes.length,
            edgeCount,
            timestamp: Date.now()
        }
    };
}

/**
 * Calculate PageRank centrality (eigenvector centrality with damping)
 * 
 * PageRank is a variant of eigenvector centrality that includes a damping
 * factor to handle dangling nodes and provide more robust results.
 * 
 * @param network - Recognition network
 * @param dampingFactor - Damping factor (default: 0.85, like Google)
 * @param options - Additional calculation options
 * @returns Centrality result
 */
export function calculatePageRank(
    network: RecognitionNetwork,
    dampingFactor: number = 0.85,
    options: Omit<CentralityOptions, 'dampingFactor'> = {}
): CentralityResult {
    return calculateEigenvectorCentrality(network, {
        ...options,
        dampingFactor
    });
}

/**
 * Get top N nodes by centrality score
 * 
 * @param scores - Centrality scores
 * @param n - Number of top nodes to return
 * @returns Array of [pubkey, score] tuples, sorted by score descending
 */
export function getTopCentralNodes(
    scores: CentralityScores,
    n: number = 10
): Array<[string, number]> {
    return Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, n);
}
