/**
 * Free Association Protocol v5 - Pure Algorithm Core
 * 
 * This is the pure, environment-agnostic implementation of the allocation algorithm.
 * No Svelte stores, no browser APIs, no side effects - just pure functions.
 * 
 * Can be used by:
 * - Svelte frontend (via free-algorithm.svelte.ts wrapper)
 * - Terminal/CLI applications
 * - Server-side processing
 * - Tests
 * 
 * Architecture:
 * - Pure functions only (no global state)
 * - Explicit dependencies (passed as parameters)
 * - Immutable data (returns new objects, never mutates input)
 * - Type-safe (full TypeScript types from schemas.ts)
 * - Uses Zod schemas for validation
 */

import type {
	Commitment,
	NeedSlot,
	AvailabilitySlot,
	GlobalRecognitionWeights,
	SlotAllocationRecord,
	ITCStamp,
	SystemState,
	ConvergenceMetrics,
	ConvergenceSummary as ZodConvergenceSummary,
	AllocationResult,
	MultiDimensionalDamping
} from '../../schemas.js';

import { slotsCompatible, getTimeBucketKey, getLocationBucketKey } from '../../utils/match.js';
import { createMemoCache, createMemoCacheWithKey, hashObject } from '../../utils/memoize.js';

// Import distribution calculation functions
import {
	type DistributionResult,
	calculateTwoTierMutualRecognitionDistribution,
	calculateMutualRecognitionDistribution,
	calculateCollectiveRecognitionDistribution,
	calculateEqualSharesDistribution,
	createCustomDistribution,
	computeMutualRecognition
} from '../../distribution.js';

// Import unified filter system for compliance filters
import type {
	ComplianceFilter
} from '../../filters/types.js';

import {
	evaluateComplianceFilter,
	getRemainingRoom
} from '../../filters/compliance.js';

// Re-export for backward compatibility
export type { DistributionResult };
export {
	calculateTwoTierMutualRecognitionDistribution,
	calculateMutualRecognitionDistribution,
	calculateCollectiveRecognitionDistribution,
	calculateEqualSharesDistribution,
	createCustomDistribution,
	computeMutualRecognition
};

// Import ITC for causality tracking
import {
	type Stamp as ITCStampType,
	seed as itcSeed,
	event as itcEvent,
	join as itcJoin,
	leq as itcLeq,
	equals as itcEquals
} from '../../itc.js';

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

/** Epsilon for capacity comparisons (prevents floating-point precision issues) */
const CAPACITY_EPSILON = 0.0001;

// ═══════════════════════════════════════════════════════════════════
// SIMPLIFIED TYPES (Bridge between full schemas and algorithm needs)
// ═══════════════════════════════════════════════════════════════════

/**
 * Spatial/Temporal Index for O(k) recipient lookups
 * 
 * Instead of scanning all N participants, use indexes to find only
 * the k participants who might match (by type, location, time).
 */
export interface SpaceTimeIndex {
	/** Type-based index: type_id -> Set<pubKey> */
	byType: Map<string, Set<string>>;

	/** Location-based index: location_bucket -> Set<pubKey> */
	byLocation: Map<string, Set<string>>;

	/** Time-based index: time_bucket -> Set<pubKey> */
	byTime: Map<string, Set<string>>;

	/** Composite index: "type|location" -> Set<pubKey> */
	byTypeAndLocation: Map<string, Set<string>>;

	/** Composite index: "type|time" -> Set<pubKey> */
	byTypeAndTime: Map<string, Set<string>>;

	/** Full composite: "type|location|time" -> Set<pubKey> */
	byAll: Map<string, Set<string>>;
}

/**
 * Simplified System State for Algorithm
 * 
 * Note: The full SystemState from schemas.ts is complex with per-type vectors.
 * For the pure algorithm, we use this simplified view focused on aggregates.
 * Can be converted to/from full SystemState as needed.
 */
export interface SystemStateSnapshot {
	/** Everyone's needs by type: { alice: { food: 40 }, bob: { tutoring: 10 } } */
	needsByPersonAndType: Record<string, Record<string, number>>;

	/** Everyone's capacity by type: { kitchen: { food: 100 }, teacher: { tutoring: 20 } } */
	capacityByPersonAndType: Record<string, Record<string, number>>;

	/** When this snapshot was taken */
	timestamp: number;

	/** Which iteration (how many times have we allocated?) */
	iteration: number;

	/** ITC stamp for causal consistency */
	itcStamp: ITCStampType;
}

/**
 * Simplified Convergence Summary for Algorithm Output
 * 
 * Note: This is now defined in schemas.ts as ConvergenceSummarySchema.
 * Re-exported here for convenience.
 */
export type ConvergenceSummary = ZodConvergenceSummary;

/**
 * Damping History per type
 * 
 * Note: Simpler than full MultiDimensionalDamping from schemas.ts
 * Focused on just what the pure algorithm needs.
 */
export interface DampingState {
	/** Over-allocation history per type: { food: [0.2, 0.15, 0.1] } */
	overAllocationHistory: Record<string, number[]>;

	/** Current damping factors per type: { food: 0.8, tutoring: 1.0 } */
	dampingFactors: Record<string, number>;
}

// Re-export AllocationResult from schemas for consistency
export type { AllocationResult };

// ═══════════════════════════════════════════════════════════════════
// SYSTEM STATE OPERATIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Create initial system state
 */
export function createInitialState(): SystemStateSnapshot {
	return {
		needsByPersonAndType: {},
		capacityByPersonAndType: {},
		timestamp: Date.now(),
		iteration: 0,
		itcStamp: itcSeed()
	};
}

/**
 * Build system state from network commitments
 * 
 * @param commitments - All commitments from the network
 * @param previousState - Previous state (for iteration tracking)
 * @returns New system state snapshot
 */
function _buildSystemState(
	commitments: Record<string, Commitment>,
	previousState?: SystemStateSnapshot
): SystemStateSnapshot {
	const needsByPersonAndType: Record<string, Record<string, number>> = {};
	const capacityByPersonAndType: Record<string, Record<string, number>> = {};

	// Aggregate needs by person and type
	for (const [pubKey, commitment] of Object.entries(commitments)) {
		if (commitment.need_slots && commitment.need_slots.length > 0) {
			const needsByType: Record<string, number> = {};
			for (const slot of commitment.need_slots) {
				const typeId = slot.type_id;
				needsByType[typeId] = (needsByType[typeId] || 0) + slot.quantity;
			}
			needsByPersonAndType[pubKey] = needsByType;
		}

		// Aggregate capacity by person and type
		if (commitment.capacity_slots && commitment.capacity_slots.length > 0) {
			const capacityByType: Record<string, number> = {};
			for (const slot of commitment.capacity_slots) {
				const typeId = slot.type_id;
				capacityByType[typeId] = (capacityByType[typeId] || 0) + slot.quantity;
			}
			capacityByPersonAndType[pubKey] = capacityByType;
		}
	}

	return {
		needsByPersonAndType,
		capacityByPersonAndType,
		timestamp: Date.now(),
		iteration: previousState ? previousState.iteration + 1 : 0,
		itcStamp: previousState?.itcStamp || itcSeed()
	};
}

// Memoized version of buildSystemState
// Note: timestamp and iteration are excluded from cache key since they're time-dependent
export const buildSystemState = createMemoCacheWithKey(
	(commitments: Record<string, Commitment>, previousState?: SystemStateSnapshot) => {
		// Call original function but regenerate timestamp/iteration
		const state = _buildSystemState(commitments, previousState);
		return {
			...state,
			timestamp: Date.now(),
			iteration: previousState ? previousState.iteration + 1 : 0
		};
	},
	(commitments, previousState) =>
		`${hashObject(commitments)}:${previousState ? `${previousState.iteration}:${hashObject(previousState.needsByPersonAndType)}:${hashObject(previousState.capacityByPersonAndType)}` : 'null'}`,
	20 // Cache up to 20 system state builds
);

// ═══════════════════════════════════════════════════════════════════
// CONVERGENCE METRICS (PURE FUNCTIONS)
// ═══════════════════════════════════════════════════════════════════

/**
 * Total Need Magnitude - How much total need is in the system?
 * Formula: sqrt(sum of all needs squared) - Frobenius norm
 */
export function computeTotalNeedMagnitude(state: SystemStateSnapshot): number {
	let sumSquares = 0;

	for (const needsByType of Object.values(state.needsByPersonAndType)) {
		for (const need of Object.values(needsByType)) {
			sumSquares += need ** 2;
		}
	}

	return Math.sqrt(sumSquares);
}

/**
 * Contraction Rate - How fast are needs shrinking?
 * Returns: fraction of needs remaining after one iteration
 * - 0.8 = needs shrunk by 20% (good!)
 * - 1.0 = needs stayed the same (no progress)
 * - >1.0 = needs grew (bad!)
 */
export function computeContractionRate(
	currentMagnitude: number,
	previousMagnitude: number
): number {
	if (previousMagnitude < 0.001) return 0;
	return currentMagnitude / previousMagnitude;
}

/**
 * Percent People Satisfied - What fraction of people are fully satisfied?
 * 
 * IMPORTANT: This is a binary per-person metric. A person is only counted
 * if ALL their needs are met (< 0.001). This will be 0% until convergence.
 * 
 * For allocation progress, use percentNeedReduction instead.
 */
export function computePercentNeedsMet(state: SystemStateSnapshot): number {
	let totalPeople = 0;
	let satisfiedPeople = 0;

	for (const needsByType of Object.values(state.needsByPersonAndType)) {
		totalPeople++;

		// Check if all their needs are near zero
		const allNeedsMet = Object.values(needsByType).every(need => need < 0.001);
		if (allNeedsMet) {
			satisfiedPeople++;
		}
	}

	if (totalPeople === 0) return 100;
	return (satisfiedPeople / totalPeople) * 100;
}

/**
 * Percent Need Reduction - How much has the total need magnitude decreased?
 * 
 * This shows actual allocation progress: (previous - current) / previous * 100
 * Returns 0-100 showing what % of the previous need has been fulfilled.
 */
export function computePercentNeedReduction(
	currentMagnitude: number,
	previousMagnitude: number
): number {
	if (previousMagnitude < 0.001) return 100; // All needs met
	const reduction = previousMagnitude - currentMagnitude;
	return Math.max(0, Math.min(100, (reduction / previousMagnitude) * 100));
}

/**
 * Universal Satisfaction - Are ALL needs zero?
 */
export function checkUniversalSatisfaction(state: SystemStateSnapshot): boolean {
	for (const needsByType of Object.values(state.needsByPersonAndType)) {
		for (const need of Object.values(needsByType)) {
			if (need > 0.001) {
				return false;
			}
		}
	}
	return true;
}

/**
 * Estimate Iterations to Convergence
 * Returns: estimated iterations until needs hit zero, or null if not converging
 */
export function estimateIterationsToConvergence(
	currentMagnitude: number,
	contractionRate: number
): number | null {
	if (contractionRate >= 1) return null; // Not converging
	if (contractionRate <= 0) return 0; // Already there
	if (currentMagnitude < 0.001) return 0; // Already there

	const targetMagnitude = 0.001;
	const iterations = Math.log(targetMagnitude / currentMagnitude) / Math.log(contractionRate);

	return Math.max(0, Math.ceil(iterations));
}

/**
 * Compute maximum need across all participants
 */
export function computeMaxPersonNeed(state: SystemStateSnapshot): number {
	let maxNeed = 0;

	for (const needsByType of Object.values(state.needsByPersonAndType)) {
		let personNeedSquared = 0;
		for (const need of Object.values(needsByType)) {
			personNeedSquared += need ** 2;
		}
		const personNeed = Math.sqrt(personNeedSquared);
		maxNeed = Math.max(maxNeed, personNeed);
	}

	return maxNeed;
}

/**
 * Compute variance of need distribution
 * High variance = some people have much more unmet need than others
 */
export function computeNeedVariance(state: SystemStateSnapshot): number {
	const personNeeds: number[] = [];

	for (const needsByType of Object.values(state.needsByPersonAndType)) {
		let personNeedSquared = 0;
		for (const need of Object.values(needsByType)) {
			personNeedSquared += need ** 2;
		}
		personNeeds.push(Math.sqrt(personNeedSquared));
	}

	if (personNeeds.length === 0) return 0;

	const mean = personNeeds.reduce((sum, need) => sum + need, 0) / personNeeds.length;
	const variance = personNeeds.reduce((sum, need) => sum + (need - mean) ** 2, 0) / personNeeds.length;

	return variance;
}

/**
 * Count how many participants have unchanging needs (stuck)
 */
export function computePeopleStuck(
	currentState: SystemStateSnapshot,
	previousState: SystemStateSnapshot | null
): number {
	if (!previousState) return 0;

	let stuckCount = 0;
	const epsilon = 0.001;

	for (const [person, currentNeeds] of Object.entries(currentState.needsByPersonAndType)) {
		const previousNeeds = previousState.needsByPersonAndType[person];
		if (!previousNeeds) continue;

		let currentTotal = 0;
		let previousTotal = 0;

		for (const [type, need] of Object.entries(currentNeeds)) {
			currentTotal += need ** 2;
			previousTotal += (previousNeeds[type] || 0) ** 2;
		}

		currentTotal = Math.sqrt(currentTotal);
		previousTotal = Math.sqrt(previousTotal);

		if (Math.abs(currentTotal - previousTotal) < epsilon && currentTotal > epsilon) {
			stuckCount++;
		}
	}

	return stuckCount;
}

/**
 * Compute full convergence summary
 */
export function computeConvergenceSummary(
	currentState: SystemStateSnapshot,
	previousState: SystemStateSnapshot | null,
	iterationStartTime: number
): ConvergenceSummary {
	const currentMagnitude = computeTotalNeedMagnitude(currentState);
	const previousMagnitude = previousState
		? computeTotalNeedMagnitude(previousState)
		: currentMagnitude * 2;

	const contractionRate = computeContractionRate(currentMagnitude, previousMagnitude);
	const isConverged = currentMagnitude < 0.001;
	const percentNeedsMet = computePercentNeedsMet(currentState);
	const percentNeedReduction = computePercentNeedReduction(currentMagnitude, previousMagnitude);
	const universalSatisfaction = checkUniversalSatisfaction(currentState);
	const iterationsToConvergence = estimateIterationsToConvergence(currentMagnitude, contractionRate);

	const maxPersonNeed = computeMaxPersonNeed(currentState);
	const needVariance = computeNeedVariance(currentState);
	const peopleStuck = computePeopleStuck(currentState, previousState);

	const now = Date.now();
	const responseLatency = now - iterationStartTime;

	return {
		totalNeedMagnitude: currentMagnitude,
		previousNeedMagnitude: previousMagnitude,
		contractionRate,
		isConverged,
		percentNeedsMet,
		percentNeedReduction,
		universalSatisfaction,
		iterationsToConvergence,
		currentIteration: currentState.iteration,
		responseLatency,
		maxPersonNeed,
		needVariance,
		peopleStuck
	};
}

// ═══════════════════════════════════════════════════════════════════
// DAMPING (SELF-CORRECTION)
// ═══════════════════════════════════════════════════════════════════

/**
 * Compute damping factors from over-allocation history (SCHEMA-ALIGNED)
 * 
 * Works with PerTypeDampingHistoryEntry format from schemas.ts.
 * Analyzes oscillation patterns to determine appropriate dampening.
 * 
 * @param history - Structured history per type (with timestamps)
 * @returns Damping factors per type (0.5 = slow, 0.8 = medium, 1.0 = full speed)
 */
function _computeDampingFactors(
	history: Record<string, Array<{ type_id: string; overAllocation: number; timestamp: number }>>
): Record<string, number> {
	const factors: Record<string, number> = {};

	for (const [typeId, hist] of Object.entries(history)) {
		if (hist.length < 3) {
			factors[typeId] = 0.8; // Medium speed by default
			continue;
		}

		// Check last 3 entries for oscillation (extract overAllocation values)
		const recent = hist.slice(-3).map(entry => entry.overAllocation);
		const upDownUp = recent[0] < recent[1] && recent[1] > recent[2];
		const downUpDown = recent[0] > recent[1] && recent[1] < recent[2];

		if (upDownUp || downUpDown) {
			factors[typeId] = 0.5; // Slow down (oscillation detected)
		} else {
			const isSmooth = recent[0] >= recent[1] && recent[1] >= recent[2];
			factors[typeId] = isSmooth ? 1.0 : 0.8;
		}
	}

	return factors;
}

// Memoized version of computeDampingFactors
export const computeDampingFactors = createMemoCache(
	_computeDampingFactors,
	50 // Cache up to 50 damping factor computations
);

/**
 * Update over-allocation history with new received amounts (SCHEMA-ALIGNED)
 * 
 * Uses PerTypeDampingHistoryEntry format from schemas.ts for full alignment.
 * This enables proper timestamp tracking and structured history.
 * 
 * @param history - Current history (per-type arrays of structured entries)
 * @param received - Amount received this iteration per type
 * @param needs - Current needs per type
 * @returns Updated history with structured entries
 */
export function updateOverAllocationHistory(
	history: Record<string, Array<{ type_id: string; overAllocation: number; timestamp: number }>>,
	received: Record<string, number>,
	needs: Record<string, number>
): Record<string, Array<{ type_id: string; overAllocation: number; timestamp: number }>> {
	const newHistory = { ...history };
	const timestamp = Date.now();

	for (const [typeId, receivedAmount] of Object.entries(received)) {
		const need = needs[typeId] || 0;
		const overAllocation = Math.max(0, receivedAmount - need);

		if (!newHistory[typeId]) {
			newHistory[typeId] = [];
		}

		// ✅ Create structured entry per PerTypeDampingHistoryEntrySchema
		const entry = {
			type_id: typeId,
			overAllocation,
			timestamp
		};

		newHistory[typeId] = [...newHistory[typeId], entry].slice(-10); // Keep last 10
	}

	return newHistory;
}

// ═══════════════════════════════════════════════════════════════════
// ALLOCATION COMPUTATION (TWO-TIER SYSTEM)
// ═══════════════════════════════════════════════════════════════════

/**
 * Apply divisibility constraints to an allocation quantity
 * 
 * @param rawQuantity - The calculated allocation amount
 * @param sharePercentage - What percentage of total capacity this represents
 * @param capacitySlot - The capacity slot with divisibility constraints
 * @returns Constrained quantity respecting both natural and percentage divisibility
 */
export function applyDivisibilityConstraints(
	rawQuantity: number,
	sharePercentage: number,
	capacitySlot: AvailabilitySlot
): number {
	const PERCENTAGE_EPSILON = 0.0001; // Tolerance for floating-point percentage comparisons
	const maxNatural = capacitySlot.max_natural_div || 1;
	const minPercent = capacitySlot.min_allocation_percentage || 0.0;

	// 1. Apply percentage constraint (prevent over-fragmentation)
	// If this recipient's share is below the minimum threshold, reject it
	if (minPercent > PERCENTAGE_EPSILON && sharePercentage < minPercent - PERCENTAGE_EPSILON) {
		return 0;
	}

	// 2. Apply natural divisibility constraint (round to whole units)
	// e.g., if max_natural_div=1 (whole rooms), 2.7 becomes 2
	const naturalConstrained = Math.floor(rawQuantity / maxNatural) * maxNatural;

	return naturalConstrained;
}

/**
 * Check if a recipient's allocation would be too small given divisibility constraints
 * 
 * @param allocation - The proposed allocation quantity
 * @param capacitySlot - The capacity slot with divisibility constraints
 * @returns true if allocation meets minimum thresholds
 */
export function meetsMinimumAllocation(
	allocation: number,
	capacitySlot: AvailabilitySlot
): boolean {
	const PERCENTAGE_EPSILON = 0.0001; // Tolerance for floating-point percentage comparisons
	const maxNatural = capacitySlot.max_natural_div || 1;
	const minPercent = capacitySlot.min_allocation_percentage || 0.0;

	// Must be at least one natural unit
	if (allocation < maxNatural) return false;

	// Must meet minimum percentage threshold
	// This ensures we don't fragment capacity beyond the provider's preference
	const sharePercentage = allocation / capacitySlot.quantity;

	// If min_allocation_percentage is set, enforce it as the threshold
	// Otherwise, accept any allocation ≥ 1 natural unit
	if (minPercent > PERCENTAGE_EPSILON) {
		return sharePercentage >= minPercent - PERCENTAGE_EPSILON;
	}

	return allocation >= maxNatural;
}

/**
 * Redistribute remainder capacity using Largest Remainder Method
 * 
 * ADAPTER PATTERN: This function adapts SlotAllocationRecord[] to work with
 * the simpler redistributeRemainder() from allocation-targets.ts.
 * 
 * When divisibility constraints cause rounding, we lose fractional capacity.
 * This function redistributes leftover units to recipients with largest remainders,
 * and distributes proportionally across each recipient's slots.
 * 
 * Example: 10 rooms, recipients get 4.7, 3.2, 2.1 → floor to 4, 3, 2 = 9 rooms
 * Remainder: 1 room left. Give to recipient with largest fraction (0.7) → 5, 3, 2 = 10 ✅
 * 
 * If recipient has multiple slots, distribute proportionally:
 * - Slot A: 6 units (60%), Slot B: 4 units (40%)
 * - Gets 5 extra units → Slot A gets 3 (60% of 5), Slot B gets 2 (40% of 5)
 * 
 * @param allocations - Array of allocation records to potentially increase
 * @param remainders - Map of recipient -> remainder (fractional part lost to rounding)
 * @param capacityUsed - How much capacity has been allocated so far
 * @param totalCapacity - Total available capacity
 * @param maxNatural - Natural divisibility unit
 * @param capacitySlot - The capacity slot being allocated
 * @returns Updated capacity used after redistribution
 */
export function redistributeRemainders(
	allocations: SlotAllocationRecord[],
	remainders: Map<string, number>,
	capacityUsed: number,
	totalCapacity: number,
	maxNatural: number,
	capacitySlot: AvailabilitySlot
): number {
	if (allocations.length === 0) {
		return capacityUsed;
	}

	// Step 1: Aggregate slot allocations by recipient
	const recipientTotals = new Map<string, number>();
	for (const alloc of allocations) {
		const current = recipientTotals.get(alloc.recipient_pubkey) || 0;
		recipientTotals.set(alloc.recipient_pubkey, current + alloc.quantity);
	}

	// Step 2: Calculate shares from current allocations
	const totalAllocated = Array.from(recipientTotals.values()).reduce((sum, v) => sum + v, 0);
	const shares = new Map<string, number>();
	for (const [recipient, allocated] of recipientTotals.entries()) {
		shares.set(recipient, totalAllocated > 0 ? allocated / totalAllocated : 0);
	}

	// Step 3: Delegate to redistributeRemainder from allocation-targets.ts
	const redistributed = redistributeRemainderSimple(
		recipientTotals, // targets (modified in place)
		totalCapacity - capacityUsed, // remaining capacity
		totalCapacity,
		shares,
		maxNatural,
		false // debug
	);

	// Step 4: Distribute increases back to slots proportionally
	for (const [recipientPub, newTotal] of recipientTotals.entries()) {
		const recipientAllocs = allocations.filter(a => a.recipient_pubkey === recipientPub);
		if (recipientAllocs.length === 0) continue;

		const oldTotal = recipientAllocs.reduce((sum, a) => sum + a.quantity, 0);
		const increase = newTotal - oldTotal;

		if (increase > CAPACITY_EPSILON) {
			if (recipientAllocs.length === 1) {
				// Simple case: one slot gets all the increase
				recipientAllocs[0].quantity += increase;
			} else {
				// Multiple slots: distribute proportionally using Largest Remainder Method
				const slotRemainders: Array<{ alloc: SlotAllocationRecord; remainder: number }> = [];
				let integerDistributed = 0;

				for (const alloc of recipientAllocs) {
					const proportion = alloc.quantity / oldTotal;
					const idealIncrease = increase * proportion;
					const integerIncrease = Math.floor(idealIncrease / maxNatural) * maxNatural;
					const remainder = idealIncrease - integerIncrease;

					// Give integer part immediately
					alloc.quantity += integerIncrease;
					integerDistributed += integerIncrease;

					if (remainder > CAPACITY_EPSILON) {
						slotRemainders.push({ alloc, remainder });
					}
				}

				// Distribute remaining units by largest remainder
				const leftover = increase - integerDistributed;
				const leftoverUnits = Math.floor(leftover / maxNatural);
				if (leftoverUnits > 0 && slotRemainders.length > 0) {
					slotRemainders.sort((a, b) => b.remainder - a.remainder);

					for (let i = 0; i < leftoverUnits && i < slotRemainders.length; i++) {
						slotRemainders[i].alloc.quantity += maxNatural;
					}
				}
			}
		}
	}

	return capacityUsed + redistributed;
}

/**
 * Get candidate recipients using spatial/temporal index (O(k) instead of O(N))
 * 
 * @param capacitySlot - The capacity slot to find recipients for
 * @param needsIndex - The spatial/temporal index (optional)
 * @returns Set of pubKeys that potentially need this capacity
 */
function getCandidateRecipients(
	capacitySlot: AvailabilitySlot,
	needsIndex?: SpaceTimeIndex
): Set<string> {
	if (!needsIndex) {
		// No index provided - will do full scan
		return new Set();
	}

	const typeId = capacitySlot.type_id;
	const locationKey = getLocationBucketKey(capacitySlot);
	const timeKey = getTimeBucketKey(capacitySlot);

	// Strategy: Use most specific index available

	// 1. Try full composite (most specific)
	const fullKey = `${typeId}|${locationKey}|${timeKey}`;
	if (needsIndex.byAll.has(fullKey)) {
		return needsIndex.byAll.get(fullKey)!;
	}

	// 2. Try type + location
	const typeLocKey = `${typeId}|${locationKey}`;
	if (needsIndex.byTypeAndLocation.has(typeLocKey)) {
		return needsIndex.byTypeAndLocation.get(typeLocKey)!;
	}

	// 3. Try type + time
	const typeTimeKey = `${typeId}|${timeKey}`;
	if (needsIndex.byTypeAndTime.has(typeTimeKey)) {
		return needsIndex.byTypeAndTime.get(typeTimeKey)!;
	}

	// 4. Fall back to type only
	if (needsIndex.byType.has(typeId)) {
		return needsIndex.byType.get(typeId)!;
	}

	// 5. No candidates found
	return new Set();
}

/**
 * Find compatible recipients for a capacity slot
 * Returns map of pubKey -> compatible need slots
 * 
 * @param capacitySlot - The capacity slot
 * @param allCommitments - All network commitments
 * @param myPubKey - My public key (to exclude self)
 * @param needsIndex - Optional spatial/temporal index for O(k) lookups
 */
function _findCompatibleRecipients(
	capacitySlot: AvailabilitySlot,
	allCommitments: Record<string, Commitment>,
	myPubKey: string,
	needsIndex?: SpaceTimeIndex
): Map<string, NeedSlot[]> {
	const compatible = new Map<string, NeedSlot[]>();
	const typeId = capacitySlot.type_id;

	console.log(`[FIND-COMPATIBLE] Searching for recipients for capacity slot ${capacitySlot.id.slice(0, 20)}... (type: ${typeId})`);

	// Get candidate recipients from index (O(k)) or full scan (O(N))
	const candidates = getCandidateRecipients(capacitySlot, needsIndex);

	// If no index provided, fall back to full scan
	const recipientsToCheck = candidates.size > 0
		? Array.from(candidates)
		: Object.keys(allCommitments);

	console.log(`[FIND-COMPATIBLE] Checking ${recipientsToCheck.length} potential recipients`);

	for (const recipientPub of recipientsToCheck) {
		// NOTE: Self-allocation is ALLOWED! Self-care is valid care.
		// Mutual recognition with yourself is valid recognition.

		const commitment = allCommitments[recipientPub];
		if (!commitment?.need_slots) {
			console.log(`[FIND-COMPATIBLE]   ${recipientPub.slice(0, 20)}... - SKIP: no need slots`);
			continue;
		}

		console.log(`[FIND-COMPATIBLE]   ${recipientPub.slice(0, 20)}... - checking ${commitment.need_slots.length} need slots`);

		const compatibleSlots: NeedSlot[] = [];
		for (const needSlot of commitment.need_slots) {
			if (needSlot.type_id !== typeId) {
				console.log(`[FIND-COMPATIBLE]     ${needSlot.id.slice(0, 20)}... - SKIP: type mismatch (${needSlot.type_id} !== ${typeId})`);
				continue;
			}

			// Check slot compatibility (time, location, etc.)
			const isCompatible = slotsCompatible(capacitySlot, needSlot);
			console.log(`[FIND-COMPATIBLE]     ${needSlot.id.slice(0, 20)}... - slotsCompatible: ${isCompatible}`);
			if (isCompatible) {
				compatibleSlots.push(needSlot);
			}
		}

		if (compatibleSlots.length > 0) {
			console.log(`[FIND-COMPATIBLE]   ✅ ${recipientPub.slice(0, 20)}... - FOUND ${compatibleSlots.length} compatible slots`);
			compatible.set(recipientPub, compatibleSlots);
		} else {
			console.log(`[FIND-COMPATIBLE]   ❌ ${recipientPub.slice(0, 20)}... - NO compatible slots`);
		}
	}

	console.log(`[FIND-COMPATIBLE] Result: ${compatible.size} recipients with compatible needs`);

	return compatible;
}

// Memoized version of findCompatibleRecipients
const findCompatibleRecipients = createMemoCacheWithKey(
	_findCompatibleRecipients,
	(capacitySlot, allCommitments, myPubKey, needsIndex) =>
		`${capacitySlot.id}:${hashObject(allCommitments)}:${myPubKey}:${needsIndex ? 'indexed' : 'full'}`,
	50 // Cache up to 50 capacity slot lookups
);

/**
 * Compute allocations for my capacity slots
 * 
 * **Algorithm Overview**:
 * 1. For each capacity slot, find compatible recipients (with optional spatial/temporal index for O(k) lookup)
 * 2. Tier 1: Allocate based on mutual recognition using multi-pass proportional redistribution
 * 3. Tier 2: Allocate remaining capacity based on one-way recognition (also multi-pass)
 * 4. Apply divisibility constraints (natural units + percentage limits)
 * 5. Redistribute remainders using Largest Remainder Method
 * 
 * **Multi-Pass Proportional Algorithm**:
 * - All recipients' allocations calculated simultaneously (same denominator = true proportionality)
 * - Recipients who are satisfied (capped at need) removed from next pass
 * - Excess capacity automatically redistributes to unsatisfied recipients
 * - Guarantees no FIFO bias, maintains proportional allocation per README formula
 * 
 * **Complexity Analysis**:
 * - Time: O(C × P × R × S) where C = capacity slots, P = passes (typically 2-3), R = recipients, S = avg slots per recipient
 *   - Finding compatible recipients: O(C × k) with index or O(C × R) without
 *   - Multi-pass allocation: O(P × R × S) per capacity slot
 *   - Remainder redistribution: O(R log R + R×S) per capacity slot
 *   - Overall: O(C × P × R × S) which is acceptable (P is small constant)
 * - Space: O(C × R × S) for allocation records
 * - **Client-Side Performance**: Acceptable with typical values (C < 20, P < 5, R < 100, S < 10)
 * 
 * **Performance Notes**:
 * - Spatial/temporal indexing reduces effective R for compatibility checks (O(k) instead of O(N))
 * - Multi-pass typically converges in 2-3 passes (most recipients satisfied in pass 1)
 * - Divisibility constraints prevent over-fragmentation
 * - Remainder redistribution ensures near-100% capacity utilization
 * - ✅ Memoization: findCompatibleRecipients is memoized for repeated calls
 * 
 * @param myPubKey - My public key
 * @param myCapacitySlots - My available capacity slots
 * @param myRecognition - My recognition of others
 * @param mutualRecognition - Mutual recognition with others
 * @param allCommitments - All network commitments
 * @param currentState - Current system state
 * @param previousState - Previous system state
 * @param needsIndex - Optional spatial/temporal index for O(k) recipient lookups
 * @returns Allocation result
 */
/**
 * Generic allocation engine that accepts pre-computed distribution
 * 
 * This is the unified allocation engine that works with any distribution strategy.
 * It performs slot-level matching, applies compliance filters, handles divisibility
 * constraints, and uses multi-pass proportional allocation.
 * 
 * ✅ DAMPENING SUPPORT: Accepts activeNeedsByRecipient to use damped needs instead
 * of declared needs. This prevents oscillation per README.md line 283-298.
 * 
 * @param myPubKey - Provider's public key
 * @param myCapacitySlots - Provider's availability slots
 * @param distribution - Pre-computed distribution (who gets what share)
 * @param allCommitments - All participants' commitments
 * @param needsIndex - Optional spatial/temporal index for efficient recipient lookup
 * @param recipientFilters - Optional compliance filters per recipient
 * @param activeNeedsByRecipient - Optional damped needs (activeNeed = declaredNeed × dampingFactor)
 * @returns Allocation result with slot allocations and metadata
 */
export function allocateWithDistribution(
	myPubKey: string,
	myCapacitySlots: AvailabilitySlot[],
	distribution: DistributionResult,
	allCommitments: Record<string, Commitment>,
	needsIndex?: SpaceTimeIndex,
	recipientFilters?: Map<string, ComplianceFilter>,
	activeNeedsByRecipient?: Record<string, Record<string, number>>  // ✅ Damped needs (activeNeed = declaredNeed × dampingFactor)
): AllocationResult {
	const iterationStartTime = Date.now();
	const allocations: SlotAllocationRecord[] = [];
	const slotDenominators: Record<string, { mutual: number; nonMutual: number; type_id: string }> = {};
	const totalsByTypeAndRecipient: Record<string, Record<string, number>> = {};

	console.log(`[ALLOCATE-WITH-DISTRIBUTION] Starting allocation with ${distribution.method} distribution`);
	console.log(`[ALLOCATE-WITH-DISTRIBUTION] Recipients:`, Object.keys(distribution.shares).length);

	// Process each capacity slot
	for (const capacitySlot of myCapacitySlots) {
		const typeId = capacitySlot.type_id;
		const providersAvailableCapacity = capacitySlot.quantity;

		if (!totalsByTypeAndRecipient[typeId]) {
			totalsByTypeAndRecipient[typeId] = {};
		}

		// Find compatible recipients (using spatial/temporal index if provided)
		const compatibleRecipients = findCompatibleRecipients(capacitySlot, allCommitments, myPubKey, needsIndex);

		if (compatibleRecipients.size === 0) continue;

		console.log(`[ALLOCATE-WITH-DISTRIBUTION] Slot ${capacitySlot.id.slice(0, 20)}: ${compatibleRecipients.size} compatible recipients`);

		// ────────────────────────────────────────────────────────────
		// SINGLE-PASS PROPORTIONAL ALLOCATION (DISTRIBUTION-BASED)
		// ────────────────────────────────────────────────────────────

		const CAPACITY_EPSILON = 0.0001;
		let capacityUsed = 0;

		// Build list of eligible recipients with distribution shares
		const eligibleRecipients: Array<{
			pubKey: string;
			totalNeed: number;
			remainingNeed: number;
			distributionShare: number;
			needSlots: NeedSlot[];
			tier: number | string; // Numeric priority or string label for backward compat
		}> = [];

		// ────────────────────────────────────────────────────────────
		// N-TIER DISTRIBUTION PROCESSING
		// ────────────────────────────────────────────────────────────

		// Extract tiers from distribution (supports N tiers with priority ordering)
		// Map: recipientId -> { share, tierPriority, tierLabel }
		const recipientTierInfo = new Map<string, { share: number; tierPriority: number; tierLabel?: string }>();

		if (distribution.tiers && distribution.tiers.length > 0) {
			// N-tier distribution - extract from tier array
			for (const tier of distribution.tiers) {
				for (const [recipientId, share] of Object.entries(tier.shares)) {
					if (share > 0) {
						// If recipient appears in multiple tiers, use highest priority (lowest number)
						const existing = recipientTierInfo.get(recipientId);
						if (!existing || tier.priority < existing.tierPriority) {
							recipientTierInfo.set(recipientId, {
								share,
								tierPriority: tier.priority,
								tierLabel: tier.label
							});
						}
					}
				}
			}
		} else {
			// No tier info - use combined shares (single-tier)
			for (const [recipientId, share] of Object.entries(distribution.shares)) {
				if (share > 0) {
					recipientTierInfo.set(recipientId, {
						share,
						tierPriority: 0,
						tierLabel: 'default'
					});
				}
			}
		}

		// Build eligible recipients with tier-aware shares
		for (const [recipientPub, needSlots] of compatibleRecipients.entries()) {
			// ✅ Use active (damped) needs if provided, otherwise use declared needs
			let totalNeed = 0;
			if (activeNeedsByRecipient && activeNeedsByRecipient[recipientPub]) {
				// Sum all active needs for this recipient for this type
				const typeId = capacitySlot.type_id;
				totalNeed = activeNeedsByRecipient[recipientPub][typeId] || 0;
			} else {
				// Fallback: use declared needs from slots
				for (const slot of needSlots) {
					totalNeed += slot.quantity;
				}
			}

			// Check if recipient has a tier assignment
			const tierInfo = recipientTierInfo.get(recipientPub);
			if (tierInfo) {
				eligibleRecipients.push({
					pubKey: recipientPub,
					totalNeed,
					remainingNeed: totalNeed,
					distributionShare: tierInfo.share,
					needSlots,
					tier: tierInfo.tierPriority // Use numeric priority
				});
			} else {
				// Recipient not in any tier - use combined share if available
				const share = distribution.shares[recipientPub] || 0;
				if (share > 0) {
					eligibleRecipients.push({
						pubKey: recipientPub,
						totalNeed,
						remainingNeed: totalNeed,
						distributionShare: share,
						needSlots,
						tier: 0 // Default to highest priority
					});
				}
			}
		}

		// Sort by tier priority (ascending: lower number = higher priority, allocated first)
		eligibleRecipients.sort((a, b) => {
			// Handle both numeric and string tier values for backward compatibility
			const aPriority = typeof a.tier === 'number' ? a.tier : (a.tier === 'mutual' ? 0 : 1);
			const bPriority = typeof b.tier === 'number' ? b.tier : (b.tier === 'mutual' ? 0 : 1);
			return aPriority - bPriority;
		});

		if (eligibleRecipients.length === 0) continue;

		// ═══════════════════════════════════════════════════════════════
		// MULTI-PASS PROPORTIONAL ALLOCATION
		// ═══════════════════════════════════════════════════════════════

		let unsatisfiedRecipients = [...eligibleRecipients];
		let remainingCapacity = providersAvailableCapacity;
		let passCount = 0;
		const maxPasses = 10;

		console.log(`[ALLOCATE-WITH-DISTRIBUTION] Starting multi-pass: capacity=${remainingCapacity}, recipients=${unsatisfiedRecipients.length}`);

		while (remainingCapacity > CAPACITY_EPSILON && unsatisfiedRecipients.length > 0 && passCount < maxPasses) {
			passCount++;
			console.log(`[ALLOCATE-WITH-DISTRIBUTION] Pass ${passCount}: capacity=${remainingCapacity.toFixed(2)}, unsatisfied=${unsatisfiedRecipients.length}`);

			// TWO-TIER LOGIC: Only allocate to current tier until exhausted
			// Use nullish coalescing (??) instead of || to handle tier 0 correctly
			const currentTier = unsatisfiedRecipients[0]?.tier ?? 0;
			const currentTierRecipients = unsatisfiedRecipients.filter(r => r.tier === currentTier);

			console.log(`[ALLOCATE-WITH-DISTRIBUTION]   Current tier: ${currentTier}, recipients: ${currentTierRecipients.length}`);

			// PHASE 1: Calculate denominator with only current tier unsatisfied recipients
			let denominator = currentTierRecipients.reduce(
				(sum, r) => sum + r.distributionShare,
				0
			);

			if (denominator < CAPACITY_EPSILON) break;

			// Safety check for tiny denominators
			const MIN_RELATIVE_DENOMINATOR = 0.001;
			const minSafeDenominator = remainingCapacity * MIN_RELATIVE_DENOMINATOR;
			if (denominator < minSafeDenominator) {
				denominator = minSafeDenominator;
			}

			// PHASE 2: Calculate ALL proportional allocations BEFORE capping (only current tier)
			const proportionalAllocations = currentTierRecipients.map(recipient => {
				const rawAllocation = remainingCapacity *
					recipient.distributionShare / denominator;

				// Apply compliance filter if present
				let filterLimit = Infinity;
				if (recipientFilters && recipientFilters.has(recipient.pubKey)) {
					const filter = recipientFilters.get(recipient.pubKey)!;
					const currentTotal = totalsByTypeAndRecipient[typeId]?.[recipient.pubKey] || 0;
					const recipientCommitment = allCommitments[recipient.pubKey];

					filterLimit = evaluateComplianceFilter(filter, {
						pubKey: recipient.pubKey,
						currentTotal,
						proposedAmount: rawAllocation,
						commitment: recipientCommitment,
						mutualRecognition: 0, // Not used in distribution-based allocation
						attributes: (recipientCommitment as any)?.attributes || {}
					});

					filterLimit = Math.max(0, filterLimit - currentTotal);
				}

				return {
					recipient,
					rawAllocation,
					cappedAllocation: Math.min(rawAllocation, recipient.remainingNeed, filterLimit)
				};
			});

			// PHASE 3: Apply allocations and track satisfaction
			let capacityUsedThisPass = 0;
			const nowSatisfied: typeof unsatisfiedRecipients = [];

			for (const { recipient, rawAllocation, cappedAllocation } of proportionalAllocations) {
				if (cappedAllocation <= CAPACITY_EPSILON) continue;

				// Calculate share percentage for divisibility checks
				const recipientSharePercentage = cappedAllocation / providersAvailableCapacity;

				// Apply divisibility constraints
				const constrainedAllocation = applyDivisibilityConstraints(
					cappedAllocation,
					recipientSharePercentage,
					capacitySlot
				);

				// Check if allocation meets minimum threshold
				if (!meetsMinimumAllocation(constrainedAllocation, capacitySlot)) {
					continue;
				}

				// Proportional distribution across need slots
				const totalCompatibleNeed = recipient.needSlots.reduce((sum, slot) => sum + slot.quantity, 0);
				let actuallyAllocated = 0;

				for (const needSlot of recipient.needSlots) {
					const proportion = needSlot.quantity / totalCompatibleNeed;
					let slotAllocation = Math.min(
						needSlot.quantity,
						constrainedAllocation * proportion
					);

					// Apply natural unit rounding
					const maxNaturalDiv = capacitySlot.max_natural_div || 1;
					slotAllocation = Math.floor(slotAllocation / maxNaturalDiv) * maxNaturalDiv;

					if (slotAllocation > 0) {
						allocations.push({
							quantity: slotAllocation,
							type_id: typeId,
							availability_slot_id: capacitySlot.id,
							recipient_pubkey: recipient.pubKey,
							time_compatible: true,
							location_compatible: true,
							tier: recipient.tier,
							recipient_need_slot_id: needSlot.id
						});

						actuallyAllocated += slotAllocation;
					}
				}

				// Update tracking
				capacityUsedThisPass += actuallyAllocated;
				capacityUsed += actuallyAllocated;

				if (!totalsByTypeAndRecipient[typeId][recipient.pubKey]) {
					totalsByTypeAndRecipient[typeId][recipient.pubKey] = 0;
				}
				totalsByTypeAndRecipient[typeId][recipient.pubKey] += actuallyAllocated;

				// Update remaining need
				recipient.remainingNeed -= actuallyAllocated;

				// Check if satisfied
				if (recipient.remainingNeed <= CAPACITY_EPSILON) {
					nowSatisfied.push(recipient);
				}
			}

			// Update capacity and recipients for next pass
			remainingCapacity -= capacityUsedThisPass;
			unsatisfiedRecipients = unsatisfiedRecipients.filter(r => !nowSatisfied.includes(r));

			// Exit if no progress made in current tier
			if (nowSatisfied.length === 0 && capacityUsedThisPass < CAPACITY_EPSILON) {
				// If we're stuck in current tier, move to next tier (if any)
				const remainingTiers = unsatisfiedRecipients.filter(r => r.tier !== currentTier);
				if (remainingTiers.length === 0) {
					break; // No more tiers, exit
				}
				// Continue to next tier in next pass
			}
		}

		// Store denominator for tracking (count recipients by tier)
		const tierCounts = new Map<number, number>();
		for (const recipient of eligibleRecipients) {
			const tierPriority = typeof recipient.tier === 'number' ? recipient.tier : (recipient.tier === 'mutual' ? 0 : 1);
			tierCounts.set(tierPriority, (tierCounts.get(tierPriority) || 0) + 1);
		}

		slotDenominators[capacitySlot.id] = {
			mutual: tierCounts.get(0) || 0, // Tier 0 (highest priority)
			nonMutual: tierCounts.get(1) || 0, // Tier 1 (second priority)
			type_id: typeId
		};
	}

	const executionTime = Date.now() - iterationStartTime;

	console.log(`[ALLOCATE-WITH-DISTRIBUTION] Complete: ${allocations.length} allocations in ${executionTime}ms`);

	// Compute empty convergence (allocateWithDistribution doesn't track state)
	const emptyConvergence = {
		totalNeedMagnitude: 0,
		previousNeedMagnitude: 0,
		contractionRate: 0,
		isConverged: false,
		percentNeedsMet: 0,
		universalSatisfaction: false,
		iterationsToConvergence: null,
		maxPersonNeed: 0,
		needVariance: 0,
		peopleStuck: 0,
		executionTimeMs: executionTime,
		currentIteration: 0,
		responseLatency: executionTime
	};

	return {
		allocations,
		slotDenominators,
		totalsByTypeAndRecipient,
		convergence: emptyConvergence
	};
}

/**
 * Compute allocations with optional compliance filters
 * 
 * This function now delegates to allocateWithDistribution() after calculating
 * the two-tier distribution (mutual + non-mutual recognition).
 * 
 * @param myPubKey - Provider's public key
 * @param myCapacitySlots - Provider's availability slots
 * @param myRecognition - Provider's recognition of others
 * @param mutualRecognition - Mutual recognition scores
 * @param allCommitments - All participants' commitments
 * @param currentState - Current system state
 * @param previousState - Previous system state (for convergence tracking)
 * @param needsIndex - Optional spatial/temporal index for efficient recipient lookup
 * @param recipientFilters - Optional compliance filters per recipient (blocked, capped, unlimited)
 * @returns Allocation result with slot allocations and metadata
 */
export function computeAllocations(
	myPubKey: string,
	myCapacitySlots: AvailabilitySlot[],
	myRecognition: GlobalRecognitionWeights,
	mutualRecognition: Record<string, number>,
	allCommitments: Record<string, Commitment>,
	currentState: SystemStateSnapshot,
	previousState: SystemStateSnapshot | null,
	needsIndex?: SpaceTimeIndex,
	recipientFilters?: Map<string, ComplianceFilter>
): AllocationResult {
	const iterationStartTime = Date.now();

	// ✅ PHASE 1: Extract dampening factors and compute active needs (README.md line 291)
	// Formula: activeNeed = remainingNeed × dampingFactor
	// ✅ FIX: Use REMAINING needs (declared - total_allocated) instead of declared needs
	const activeNeedsByRecipient: Record<string, Record<string, number>> = {};

	console.log('[DAMPENING] Extracting dampening factors and computing remaining needs...');

	for (const [recipientPub, commitment] of Object.entries(allCommitments)) {
		if (!commitment.need_slots || commitment.need_slots.length === 0) continue;

		const activeNeeds: Record<string, number> = {};

		// Get global damping factor (fallback)
		const globalDamping = commitment.multi_dimensional_damping?.global_damping_factor || 1.0;

		// Get type-specific damping factors
		const typeDampingFactors = commitment.multi_dimensional_damping?.damping_factors || {};

		// ✅ FIX: Get total already allocated to this recipient (from their commitment)
		// Note: total_allocated is Record<type_id, Record<provider_pubkey, quantity>>
		const totalAllocated = commitment.total_allocated || {};

		// Apply dampening to each need slot
		for (const needSlot of commitment.need_slots) {
			const typeId = needSlot.type_id;
			const declaredNeed = needSlot.quantity;

			// ✅ FIX: Compute REMAINING need (what they still need after receiving allocations)
			// Sum all allocations from all providers for this type
			const allocationsForType = totalAllocated[typeId] || {};
			const alreadyReceived: number = Object.values(allocationsForType).reduce(
				(sum, qty) => sum + qty,
				0
			);
			const remainingNeed = Math.max(0, declaredNeed - alreadyReceived);

			// Type-specific takes precedence, fallback to global
			const dampingFactor = typeDampingFactors[typeId] || globalDamping;

			// Apply dampening formula to REMAINING need
			const activeNeed = remainingNeed * dampingFactor;

			// Aggregate by type (in case of multiple slots of same type)
			activeNeeds[typeId] = (activeNeeds[typeId] || 0) + activeNeed;

			// Log when using remaining needs (helps debug over-allocation)
			if (alreadyReceived > 0) {
				console.log(
					`[REMAINING-NEED] ${recipientPub.slice(0, 20)}...[${typeId}]: ` +
					`declared=${declaredNeed.toFixed(2)}, received=${alreadyReceived.toFixed(2)}, ` +
					`remaining=${remainingNeed.toFixed(2)}, damping=${dampingFactor.toFixed(2)}, ` +
					`active=${activeNeed.toFixed(2)}`
				);
			}

			// Log dampening when it's actually applied (factor < 1.0)
			if (dampingFactor < 1.0 && remainingNeed > 0) {
				console.log(
					`[DAMPENING] ${recipientPub.slice(0, 20)}...[${typeId}]: ` +
					`remaining=${remainingNeed.toFixed(2)}, damping=${dampingFactor.toFixed(2)}, ` +
					`active=${activeNeed.toFixed(2)}`
				);
			}
		}

		activeNeedsByRecipient[recipientPub] = activeNeeds;
	}

	const recipientsWithDampening = Object.values(activeNeedsByRecipient)
		.filter((_, idx) => {
			const commitment = allCommitments[Object.keys(activeNeedsByRecipient)[idx]];
			return (commitment?.multi_dimensional_damping?.global_damping_factor || 1.0) < 1.0;
		}).length;

	const recipientsWithAllocations = Object.keys(allCommitments)
		.filter(pub => {
			const commitment = allCommitments[pub];
			return commitment.total_allocated && Object.keys(commitment.total_allocated).length > 0;
		}).length;

	console.log(
		`[DAMPENING] Processed ${Object.keys(activeNeedsByRecipient).length} recipients, ` +
		`${recipientsWithDampening} with dampening applied, ` +
		`${recipientsWithAllocations} with existing allocations`
	);

	// Calculate two-tier mutual recognition distribution manually
	// We already have mutualRecognition computed, so build distribution directly
	const tier1Shares: Record<string, number> = {};
	const tier2Shares: Record<string, number> = {};
	const allShares: Record<string, number> = {};

	let totalTier1Recognition = 0;
	let totalTier2Recognition = 0;

	// Classify recipients into tiers based on mutual recognition
	// Include self for self-allocation (time-shifting)
	for (const [recipientId, mr] of Object.entries(mutualRecognition)) {
		if (mr > 0) {
			// Tier 1: Mutual recognition (including self)
			tier1Shares[recipientId] = mr;
			totalTier1Recognition += mr;
		} else if (recipientId !== myPubKey) {
			// Tier 2: Check if I recognize them (one-way, excluding self)
			const myRecOfThem = myRecognition[recipientId] || 0;
			if (myRecOfThem > 0) {
				tier2Shares[recipientId] = myRecOfThem;
				totalTier2Recognition += myRecOfThem;
			}
		}
	}

	// Normalize tier 1 shares
	if (totalTier1Recognition > 0) {
		for (const recipientId in tier1Shares) {
			const normalized = tier1Shares[recipientId] / totalTier1Recognition;
			tier1Shares[recipientId] = normalized;
			allShares[recipientId] = normalized;
		}
	}

	// Normalize tier 2 shares
	if (totalTier2Recognition > 0) {
		for (const recipientId in tier2Shares) {
			const normalized = tier2Shares[recipientId] / totalTier2Recognition;
			tier2Shares[recipientId] = normalized;
			// Only add to allShares if not already in tier1
			if (!(recipientId in allShares)) {
				allShares[recipientId] = normalized;
			}
		}
	}

	const distribution: DistributionResult = {
		shares: allShares,
		method: 'two-tier',
		tiers: [
			{
				priority: 0,
				shares: tier1Shares,
				label: 'mutual-recognition'
			},
			{
				priority: 1,
				shares: tier2Shares,
				label: 'non-mutual-recognition'
			}
		],
		metadata: {
			timestamp: Date.now()
		}
	};

	// Delegate to generic allocation engine with active (damped) needs
	const result = allocateWithDistribution(
		myPubKey,
		myCapacitySlots,
		distribution,
		allCommitments,
		needsIndex,
		recipientFilters,
		activeNeedsByRecipient  // ✅ Pass damped needs to allocation engine
	);

	// Compute convergence metrics
	const convergence = computeConvergenceSummary(
		currentState,
		previousState,
		iterationStartTime
	);

	return {
		allocations: result.allocations,
		slotDenominators: result.slotDenominators,
		totalsByTypeAndRecipient: result.totalsByTypeAndRecipient,
		convergence
	};
}

// ═══════════════════════════════════════════════════════════════════
// NEED UPDATE LAW (CONVERGENCE DYNAMICS)
// ═══════════════════════════════════════════════════════════════════

/**
 * Apply need update law: N_next = N_current - Received
 * 
 * @param currentNeeds - Current needs per type
 * @param received - Amount received per type
 * @returns Updated needs
 */
export function applyNeedUpdateLaw(
	currentNeeds: Record<string, number>,
	received: Record<string, number>
): Record<string, number> {
	const nextNeeds: Record<string, number> = {};

	// Update existing needs
	for (const [typeId, need] of Object.entries(currentNeeds)) {
		const receivedAmount = received[typeId] || 0;
		nextNeeds[typeId] = Math.max(0, need - receivedAmount);
	}

	return nextNeeds;
}

// ═══════════════════════════════════════════════════════════════════
// DISTRIBUTION-AGNOSTIC TARGET CALCULATION (Re-export)
// ═══════════════════════════════════════════════════════════════════

// Import for internal use (adapter pattern)
import {
	redistributeRemainder as redistributeRemainderSimple
} from './allocation-targets-old.js';

// Re-export for external consumers
export {
	calculateTargets,
	calculateSingleTierTargets,
	calculateMultiTierTargets
} from './allocation-targets-old.js';

