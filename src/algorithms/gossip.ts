/**
 * Gossip-Based Resource Allocation
 * 
 * This module implements distributed resource allocation using gossip protocols.
 * Nodes iteratively exchange and average their resource levels to achieve
 * global balance without central coordination.
 * 
 * Key features:
 * - Decentralized averaging protocol
 * - Epidemic-style convergence
 * - Network topology awareness
 * - No market dynamics or pricing
 */

import type { ShareMap } from '../schemas.js';

// ═══════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Network topology - adjacency list representation
 */
export type NetworkTopology = Record<string, string[]>;

/**
 * Resource state for each node
 */
export type ResourceState = Record<string, number>;

/**
 * Gossip round result
 */
export interface GossipRoundResult {
    /** Updated resource state */
    state: ResourceState;

    /** Pairs that exchanged in this round */
    exchanges: Array<[string, string]>;

    /** Variance in resource levels */
    variance: number;

    /** Round number */
    round: number;
}

/**
 * Gossip simulation result
 */
export interface GossipSimulationResult {
    /** Final resource state */
    finalState: ResourceState;

    /** Number of rounds to convergence */
    rounds: number;

    /** Whether converged */
    converged: boolean;

    /** Convergence history (variance per round) */
    convergenceHistory: number[];

    /** Total exchanges performed */
    totalExchanges: number;

    /** Metadata */
    metadata: {
        algorithm: string;
        nodeCount: number;
        initialVariance: number;
        finalVariance: number;
        timestamp: number;
    };
}

/**
 * Gossip options
 */
export interface GossipOptions {
    /** Maximum rounds to simulate */
    maxRounds?: number;

    /** Convergence threshold (variance) */
    convergenceThreshold?: number;

    /** Number of exchanges per round (default: n/2 for n nodes) */
    exchangesPerRound?: number;

    /** Random seed for reproducibility */
    randomSeed?: number;
}

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate variance of resource distribution
 */
function calculateVariance(state: ResourceState): number {
    const values = Object.values(state);
    const n = values.length;

    if (n === 0) return 0;

    const mean = values.reduce((sum, v) => sum + v, 0) / n;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;

    return variance;
}

/**
 * Simple pseudo-random number generator (for reproducibility)
 */
class SeededRandom {
    private seed: number;

    constructor(seed: number = Date.now()) {
        this.seed = seed;
    }

    next(): number {
        // Linear congruential generator
        this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
        return this.seed / 0x7fffffff;
    }

    nextInt(max: number): number {
        return Math.floor(this.next() * max);
    }
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[], rng: SeededRandom): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = rng.nextInt(i + 1);
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// ═══════════════════════════════════════════════════════════════════
// GOSSIP PROTOCOL
// ═══════════════════════════════════════════════════════════════════

/**
 * Perform one round of gossip averaging
 * 
 * Algorithm:
 * 1. Randomly pair nodes
 * 2. Each pair averages their resource levels
 * 3. Update state
 * 
 * @param state - Current resource state
 * @param topology - Network topology (optional, defaults to complete graph)
 * @param options - Gossip options
 * @returns Round result
 */
export function gossipRound(
    state: ResourceState,
    topology?: NetworkTopology,
    options: GossipOptions = {}
): GossipRoundResult {
    const nodes = Object.keys(state);
    const n = nodes.length;
    const rng = new SeededRandom(options.randomSeed);

    // Default: n/2 exchanges per round (each node participates once on average)
    const exchangesPerRound = options.exchangesPerRound ?? Math.floor(n / 2);

    // Create new state (copy)
    const newState: ResourceState = { ...state };
    const exchanges: Array<[string, string]> = [];

    if (n < 2) {
        return {
            state: newState,
            exchanges: [],
            variance: calculateVariance(newState),
            round: 0
        };
    }

    // If topology is provided, use it; otherwise assume complete graph
    if (topology) {
        // Topology-aware gossip
        for (let i = 0; i < exchangesPerRound; i++) {
            // Pick random node
            const nodeA = nodes[rng.nextInt(n)];
            const neighbors = topology[nodeA] || [];

            if (neighbors.length === 0) continue;

            // Pick random neighbor
            const nodeB = neighbors[rng.nextInt(neighbors.length)];

            // Average resources
            const avg = (newState[nodeA] + newState[nodeB]) / 2;
            newState[nodeA] = avg;
            newState[nodeB] = avg;

            exchanges.push([nodeA, nodeB]);
        }
    } else {
        // Complete graph: random pairings
        const shuffled = shuffle(nodes, rng);

        for (let i = 0; i < exchangesPerRound * 2 && i + 1 < shuffled.length; i += 2) {
            const nodeA = shuffled[i];
            const nodeB = shuffled[i + 1];

            // Average resources
            const avg = (newState[nodeA] + newState[nodeB]) / 2;
            newState[nodeA] = avg;
            newState[nodeB] = avg;

            exchanges.push([nodeA, nodeB]);
        }
    }

    return {
        state: newState,
        exchanges,
        variance: calculateVariance(newState),
        round: 0
    };
}

/**
 * Simulate gossip-based resource allocation until convergence
 * 
 * @param initialState - Initial resource distribution
 * @param topology - Network topology (optional)
 * @param options - Simulation options
 * @returns Simulation result
 * 
 * @example
 * ```typescript
 * const initialState = { alice: 100, bob: 50, carol: 30 };
 * const result = simulateGossipAllocation(initialState);
 * // After convergence: all nodes have ~60 resources
 * ```
 */
export function simulateGossipAllocation(
    initialState: ResourceState,
    topology?: NetworkTopology,
    options: GossipOptions = {}
): GossipSimulationResult {
    const maxRounds = options.maxRounds ?? 1000;
    const convergenceThreshold = options.convergenceThreshold ?? 1e-6;

    let state = { ...initialState };
    const convergenceHistory: number[] = [];
    let totalExchanges = 0;
    let converged = false;
    let rounds = 0;

    const initialVariance = calculateVariance(state);

    for (rounds = 0; rounds < maxRounds; rounds++) {
        const roundResult = gossipRound(state, topology, {
            ...options,
            randomSeed: options.randomSeed ? options.randomSeed + rounds : undefined
        });

        state = roundResult.state;
        convergenceHistory.push(roundResult.variance);
        totalExchanges += roundResult.exchanges.length;

        // Check convergence
        if (roundResult.variance < convergenceThreshold) {
            converged = true;
            rounds++; // Include this round in count
            break;
        }
    }

    return {
        finalState: state,
        rounds,
        converged,
        convergenceHistory,
        totalExchanges,
        metadata: {
            algorithm: 'gossip-averaging',
            nodeCount: Object.keys(initialState).length,
            initialVariance,
            finalVariance: calculateVariance(state),
            timestamp: Date.now()
        }
    };
}

/**
 * Create initial resource state from recognition weights
 * 
 * Converts normalized weights into initial resource endowments.
 * 
 * @param weights - Recognition weights (ShareMap)
 * @param totalResources - Total resources to distribute initially
 * @returns Initial resource state
 */
export function createInitialState(
    weights: ShareMap,
    totalResources: number
): ResourceState {
    const state: ResourceState = {};

    for (const [id, weight] of Object.entries(weights)) {
        state[id] = weight * totalResources;
    }

    return state;
}

/**
 * Create network topology from recognition network
 * 
 * Converts recognition weights into a network topology where
 * edges exist between nodes that recognize each other.
 * 
 * @param recognitionNetwork - Recognition network (sharemap of sharemaps)
 * @param threshold - Minimum recognition weight to create edge (default: 0)
 * @returns Network topology
 */
export function createTopologyFromRecognition(
    recognitionNetwork: Record<string, ShareMap>,
    threshold: number = 0
): NetworkTopology {
    const topology: NetworkTopology = {};

    for (const [nodeA, weights] of Object.entries(recognitionNetwork)) {
        topology[nodeA] = [];

        for (const [nodeB, weight] of Object.entries(weights)) {
            if (weight > threshold && nodeA !== nodeB) {
                topology[nodeA].push(nodeB);
            }
        }
    }

    return topology;
}

/**
 * Create complete graph topology
 * 
 * @param nodes - List of node IDs
 * @returns Complete graph topology (all nodes connected)
 */
export function createCompleteTopology(nodes: string[]): NetworkTopology {
    const topology: NetworkTopology = {};

    for (const nodeA of nodes) {
        topology[nodeA] = nodes.filter(nodeB => nodeB !== nodeA);
    }

    return topology;
}

/**
 * Create ring topology
 * 
 * @param nodes - List of node IDs
 * @returns Ring topology (each node connected to 2 neighbors)
 */
export function createRingTopology(nodes: string[]): NetworkTopology {
    const topology: NetworkTopology = {};
    const n = nodes.length;

    for (let i = 0; i < n; i++) {
        const prev = nodes[(i - 1 + n) % n];
        const next = nodes[(i + 1) % n];
        topology[nodes[i]] = [prev, next];
    }

    return topology;
}

/**
 * Create random graph topology (Erdős–Rényi)
 * 
 * @param nodes - List of node IDs
 * @param edgeProbability - Probability of edge between any two nodes
 * @param seed - Random seed
 * @returns Random graph topology
 */
export function createRandomTopology(
    nodes: string[],
    edgeProbability: number = 0.3,
    seed?: number
): NetworkTopology {
    const topology: NetworkTopology = {};
    const rng = new SeededRandom(seed);

    for (const nodeA of nodes) {
        topology[nodeA] = [];

        for (const nodeB of nodes) {
            if (nodeA !== nodeB && rng.next() < edgeProbability) {
                topology[nodeA].push(nodeB);
            }
        }
    }

    return topology;
}

// ═══════════════════════════════════════════════════════════════════
// ANALYSIS UTILITIES
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate convergence rate
 * 
 * @param convergenceHistory - Variance history
 * @returns Convergence rate (exponential decay constant)
 */
export function calculateConvergenceRate(convergenceHistory: number[]): number {
    if (convergenceHistory.length < 2) return 0;

    // Fit exponential decay: variance(t) = variance(0) * exp(-rate * t)
    // rate ≈ -log(variance(t) / variance(0)) / t

    const v0 = convergenceHistory[0];
    const vt = convergenceHistory[convergenceHistory.length - 1];
    const t = convergenceHistory.length - 1;

    if (v0 === 0 || vt === 0) return 0;

    return -Math.log(vt / v0) / t;
}

/**
 * Estimate convergence time for a given topology
 * 
 * @param topology - Network topology
 * @returns Estimated rounds to convergence
 */
export function estimateConvergenceTime(topology: NetworkTopology): number {
    const nodes = Object.keys(topology);
    const n = nodes.length;

    if (n === 0) return 0;

    // For complete graph: O(log n)
    // For ring: O(n^2)
    // For random graph: O(log n) with high probability

    // Simple heuristic: average degree
    const avgDegree = Object.values(topology).reduce((sum, neighbors) =>
        sum + neighbors.length, 0
    ) / n;

    // Higher connectivity → faster convergence
    const connectivity = avgDegree / (n - 1); // 0 to 1

    // Estimate: log(n) for complete, n^2 for line
    return Math.ceil(Math.log(n) / connectivity + Math.log(n));
}
