import type { DistributionResult } from './distribution.js';
import type { ComplianceFilter } from './filters/types.js';
import { evaluateComplianceFilter } from './filters/compliance.js';

// ═══════════════════════════════════════════════════════════════════
// DISTRIBUTION-AGNOSTIC TARGET CALCULATION (REFINED)
// ═══════════════════════════════════════════════════════════════════

/**
 * Constants for target calculation
 */
const EPSILON = 0.001;
const MAX_ITERATIONS = 100;
const MIN_RELATIVE_DENOMINATOR = 0.001; // Safety check for tiny denominators

/**
 * Spatial/Temporal Index for O(k) recipient lookups
 */
export interface SpaceTimeIndex {
    byType: Map<string, Set<string>>;
    byLocation: Map<string, Set<string>>;
    byTime: Map<string, Set<string>>;
    byTypeAndLocation: Map<string, Set<string>>;
    byTypeAndTime: Map<string, Set<string>>;
    byAll: Map<string, Set<string>>;
}

/**
 * Divisibility constraints for capacity slots
 */
export interface DivisibilityConstraints {
    max_natural_div?: number;
    min_allocation_percentage?: number;
}

/**
 * Options for target calculation
 */
export interface TargetCalculationOptions {
    /** Compliance filters per recipient (blocked, capped, unlimited) */
    recipientFilters?: Map<string, ComplianceFilter>;

    /** Active (damped) needs: activeNeed = declaredNeed × dampingFactor */
    activeNeedsByRecipient?: Record<string, Record<string, number>>;

    /** Spatial/temporal index for O(k) recipient lookup */
    needsIndex?: SpaceTimeIndex;

    /** Divisibility constraints (max_natural_div, min_allocation_percentage) */
    divisibilityConstraints?: DivisibilityConstraints;

    /** Current allocations per recipient (for compliance filter evaluation) */
    currentAllocations?: Record<string, number>;

    /** Need type ID (for damped needs lookup) */
    needTypeId?: string;

    /** Enable detailed logging */
    debug?: boolean;
}

/**
 * Calculate capacity-constrained targets from ANY distribution method
 * 
 * This is the main entry point for target calculation. It accepts a DistributionResult
 * (from mutual recognition, DAO vote, custom formula, etc.) and applies capacity
 * constraints with iterative allocation to achieve full utilization.
 * 
 * @param myCapacity - Provider's available capacity for this type
 * @param distribution - Distribution result from ANY method
 * @param recipientNeeds - Declared needs by recipient { recipientPub: need }
 * @param recipientExpectations - Expected allocations from this provider { recipientPub: expectation }
 * @param options - Optional refinements (filters, damping, indexing, etc.)
 * @returns Map of recipient -> target allocation
 */
export function calculateTargets(
    myCapacity: number,
    distribution: DistributionResult,
    recipientNeeds: Record<string, number>,
    recipientExpectations: Record<string, number>,
    options?: TargetCalculationOptions
): Map<string, number> {

    const debug = options?.debug || false;

    if (debug) {
        console.log(`[TARGET-CALC] Starting with ${distribution.method} distribution`);
        console.log(`[TARGET-CALC] Capacity: ${myCapacity}, Recipients: ${Object.keys(distribution.shares).length}`);
    }

    // Use active (damped) needs if provided
    const effectiveNeeds = getEffectiveNeeds(recipientNeeds, options);

    // Handle multi-tier or single-tier
    if (distribution.tiers && distribution.tiers.length > 0) {
        return calculateMultiTierTargets(
            myCapacity,
            distribution.tiers,
            effectiveNeeds,
            recipientExpectations,
            options
        );
    } else {
        return calculateSingleTierTargets(
            myCapacity,
            distribution.shares,
            effectiveNeeds,
            recipientExpectations,
            options
        );
    }
}

/**
 * Get effective needs (damped if provided, otherwise declared)
 */
function getEffectiveNeeds(
    declaredNeeds: Record<string, number>,
    options?: TargetCalculationOptions
): Record<string, number> {

    if (!options?.activeNeedsByRecipient || !options?.needTypeId) {
        return declaredNeeds;
    }

    const effectiveNeeds: Record<string, number> = {};
    for (const [recipient, declaredNeed] of Object.entries(declaredNeeds)) {
        const activeNeed = options.activeNeedsByRecipient[recipient]?.[options.needTypeId];
        effectiveNeeds[recipient] = activeNeed !== undefined ? activeNeed : declaredNeed;
    }

    return effectiveNeeds;
}

/**
 * Calculate targets for a single tier with iterative allocation
 * 
 * Uses iterative allocation to achieve full capacity utilization while
 * respecting recipient expectations (never allocates more than expected).
 * 
 * @param capacity - Available capacity for this tier
 * @param shares - Share distribution (from ANY method)
 * @param needs - Effective needs by recipient (possibly damped)
 * @param expectations - Expected allocations from this provider
 * @param options - Optional refinements
 * @returns Map of recipient -> target allocation
 */
export function calculateSingleTierTargets(
    capacity: number,
    shares: Record<string, number>,
    needs: Record<string, number>,
    expectations: Record<string, number>,
    options?: TargetCalculationOptions
): Map<string, number> {

    const debug = options?.debug || false;

    // Filter to eligible recipients (have needs and not blocked)
    const eligible = Object.keys(shares).filter(r => {
        // Must have need
        if ((needs[r] || 0) <= EPSILON) return false;

        // Check compliance filter
        if (options?.recipientFilters?.has(r)) {
            const filter = options.recipientFilters.get(r)!;
            const currentTotal = options.currentAllocations?.[r] || 0;
            // For initial blocking check, proposedAmount is not yet determined.
            // We assume 0 for this check, as we're only interested if filterLimit is 0.
            const tentative = 0;
            const filterLimit = evaluateComplianceFilter(filter, {
                pubKey: r,
                currentTotal,
                proposedAmount: tentative,
                commitment: {}, // Empty object satisfies FilterContext schema
                mutualRecognition: 0, // Not available here
                attributes: {} // Not available here
            });

            if (filterLimit === 0) {
                if (debug) console.log(`[TARGET-CALC] Blocked: ${r.slice(0, 20)}`);
                return false;
            }
        }

        return true;
    });

    if (eligible.length === 0) {
        if (debug) console.log(`[TARGET-CALC] No eligible recipients`);
        return new Map();
    }

    // Normalize shares across eligible recipients only
    const totalShares = eligible.reduce((sum, r) => sum + (shares[r] || 0), 0);

    if (totalShares < EPSILON) {
        // No shares, use equal distribution
        if (debug) console.log(`[TARGET-CALC] No shares, using equal distribution`);
        const equalShare = 1.0 / eligible.length;
        const normalized = new Map<string, number>();
        for (const recipient of eligible) {
            normalized.set(recipient, equalShare);
        }
        return iterativeAllocation(capacity, normalized, needs, expectations, options);
    }

    const normalized = new Map<string, number>();
    for (const recipient of eligible) {
        normalized.set(recipient, (shares[recipient] || 0) / totalShares);
    }

    return iterativeAllocation(capacity, normalized, needs, expectations, options);
}

/**
 * Iterative allocation algorithm with refinements
 * 
 * Allocates capacity iteratively, removing satisfied recipients and
 * redistributing remaining capacity among unsatisfied recipients.
 * 
 * Includes:
 * - Divisibility constraints
 * - Compliance filters
 * - Safety checks
 * - Remainder redistribution (Largest Remainder Method)
 * 
 * @param capacity - Total capacity to allocate
 * @param normalizedShares - Normalized shares (sum = 1.0)
 * @param needs - Effective needs
 * @param expectations - Expected allocations
 * @param options - Optional refinements
 * @returns Map of recipient -> allocated amount
 */
function iterativeAllocation(
    capacity: number,
    normalizedShares: Map<string, number>,
    needs: Record<string, number>,
    expectations: Record<string, number>,
    options?: TargetCalculationOptions
): Map<string, number> {

    const debug = options?.debug || false;
    const targets = new Map<string, number>();
    let remaining = capacity;
    const unsatisfied = new Set(normalizedShares.keys());
    let iterations = 0;

    if (debug) {
        console.log(`[TARGET-CALC] Starting iterative allocation: capacity=${capacity}, recipients=${unsatisfied.size}`);
    }

    while (remaining > EPSILON && unsatisfied.size > 0 && iterations < MAX_ITERATIONS) {
        iterations++;

        // Compute total normalized shares for unsatisfied recipients
        let totalNormForUnsatisfied = 0;
        for (const r of unsatisfied) {
            totalNormForUnsatisfied += normalizedShares.get(r)!;
        }

        // Safety check for tiny denominators
        const minSafeDenominator = remaining * MIN_RELATIVE_DENOMINATOR;
        if (totalNormForUnsatisfied < minSafeDenominator) {
            if (debug) {
                console.warn(`[TARGET-CALC] Safety: denominator ${totalNormForUnsatisfied.toFixed(6)} < min ${minSafeDenominator.toFixed(6)}`);
            }
            totalNormForUnsatisfied = minSafeDenominator;
        }

        if (totalNormForUnsatisfied < EPSILON) break;

        const newlySatisfied: string[] = [];

        if (debug) {
            console.log(`[TARGET-CALC] Iteration ${iterations}: remaining=${remaining.toFixed(2)}, unsatisfied=${unsatisfied.size}`);
        }

        for (const recipient of unsatisfied) {
            const expectation = expectations[recipient] || needs[recipient] || 0;
            const current = targets.get(recipient) || 0;
            let remainingExpectation = Math.max(0, expectation - current);

            // Apply compliance filter cap
            if (options?.recipientFilters?.has(recipient)) {
                const filter = options.recipientFilters.get(recipient)!;
                const currentTotal = (options.currentAllocations?.[recipient] || 0) + current;
                const filterLimit = evaluateComplianceFilter(filter, {
                    pubKey: recipient,
                    currentTotal,
                    proposedAmount: 0, // Not yet determined in this check
                    commitment: {}, // Empty object satisfies FilterContext schema
                    mutualRecognition: 0,
                    attributes: {}
                });

                if (filterLimit < Infinity) {
                    const roomUnderCap = Math.max(0, filterLimit - currentTotal);
                    remainingExpectation = Math.min(remainingExpectation, roomUnderCap);

                    if (debug && roomUnderCap < remainingExpectation) {
                        console.log(`[TARGET-CALC]   ${recipient.slice(0, 20)}: capped at ${filterLimit}`);
                    }
                }
            }

            if (remainingExpectation < EPSILON) {
                newlySatisfied.push(recipient);
                continue;
            }

            const share = normalizedShares.get(recipient)! / totalNormForUnsatisfied;
            let proposed = remaining * share;

            // Check divisibility constraints
            if (options?.divisibilityConstraints) {
                const constraints = options.divisibilityConstraints;
                const sharePercentage = proposed / capacity;

                // Check minimum percentage
                if (constraints.min_allocation_percentage &&
                    sharePercentage < constraints.min_allocation_percentage) {
                    if (debug) {
                        console.log(
                            `[TARGET-CALC]   ${recipient.slice(0, 20)}: SKIP - ` +
                            `share ${(sharePercentage * 100).toFixed(2)}% < ` +
                            `min ${(constraints.min_allocation_percentage * 100).toFixed(2)}%`
                        );
                    }
                    newlySatisfied.push(recipient);
                    continue;
                }

                // Check divisibility (minimum unit size)
                if (constraints.max_natural_div && constraints.max_natural_div > 1) {
                    const unitSize = capacity / constraints.max_natural_div;
                    if (proposed < unitSize - EPSILON) {
                        if (debug) {
                            console.log(
                                `[TARGET-CALC]   ${recipient.slice(0, 20)}: SKIP - ` +
                                `proposed ${proposed.toFixed(2)} < ` +
                                `unit ${unitSize.toFixed(2)}`
                            );
                        }
                        newlySatisfied.push(recipient);
                        continue;
                    }

                    // Round down to nearest unit
                    const units = Math.floor(proposed / unitSize);
                    proposed = units * unitSize;
                }
            }

            const actual = Math.min(proposed, remainingExpectation);

            if (debug && actual > EPSILON) {
                console.log(
                    `[TARGET-CALC]   ${recipient.slice(0, 20)}: ` +
                    `proposed=${proposed.toFixed(2)}, ` +
                    `actual=${actual.toFixed(2)}, ` +
                    `expectation=${expectation.toFixed(2)}`
                );
            }

            targets.set(recipient, current + actual);
            remaining -= actual;

            if (actual >= remainingExpectation - EPSILON) {
                newlySatisfied.push(recipient);
            }
        }

        // Remove satisfied recipients
        for (const r of newlySatisfied) {
            unsatisfied.delete(r);
        }

        // Prevent infinite loop
        if (newlySatisfied.length === 0) break;
    }

    // Apply remainder redistribution (Largest Remainder Method)
    if (remaining > EPSILON && options?.divisibilityConstraints?.max_natural_div) {
        const redistributed = redistributeRemainder(
            targets,
            remaining,
            capacity,
            normalizedShares,
            options.divisibilityConstraints.max_natural_div,
            debug
        );
        remaining -= redistributed;
    }

    if (debug) {
        const totalAllocated = Array.from(targets.values()).reduce((sum, v) => sum + v, 0);
        console.log(
            `[TARGET-CALC] Complete: allocated=${totalAllocated.toFixed(2)}, ` +
            `remaining=${remaining.toFixed(2)}, ` +
            `utilization=${((totalAllocated / capacity) * 100).toFixed(1)}%`
        );
    }

    return targets;
}

/**
 * Redistribute remainder using Largest Remainder Method
 * 
 * When divisibility constraints prevent full capacity utilization,
 * this distributes leftover units to recipients with largest fractional remainders.
 * 
 * @param targets - Current target allocations
 * @param remainingCapacity - Leftover capacity
 * @param totalCapacity - Total capacity
 * @param shares - Normalized shares
 * @param maxNaturalDiv - Maximum natural divisions
 * @param debug - Enable logging
 * @returns Amount redistributed
 */
export function redistributeRemainder(
    targets: Map<string, number>,
    remainingCapacity: number,
    totalCapacity: number,
    shares: Map<string, number>,
    maxNaturalDiv: number,
    debug: boolean
): number {

    const unitSize = totalCapacity / maxNaturalDiv;
    const remainingUnits = Math.floor(remainingCapacity / unitSize);

    if (remainingUnits === 0) return 0;

    if (debug) {
        console.log(`[REMAINDER-REDISTRIBUTION] ${remainingUnits} units of ${unitSize.toFixed(2)} to redistribute`);
    }

    // Calculate ideal allocation and remainders
    const totalAllocated = Array.from(targets.values()).reduce((sum, v) => sum + v, 0);
    const remainders: Array<{ recipient: string; remainder: number; allocated: number }> = [];

    for (const [recipient, allocated] of targets.entries()) {
        if (allocated > EPSILON) {
            const proportion = allocated / totalAllocated;
            const idealUnits = remainingUnits * proportion;
            const integerUnits = Math.floor(idealUnits);
            const remainder = idealUnits - integerUnits;

            if (remainder > EPSILON) {
                remainders.push({ recipient, remainder, allocated });
            }
        }
    }

    // Sort by largest remainder
    remainders.sort((a, b) => b.remainder - a.remainder);

    // Distribute units to recipients with largest remainders
    let unitsDistributed = 0;
    for (let i = 0; i < Math.min(remainingUnits, remainders.length); i++) {
        const { recipient } = remainders[i];
        const current = targets.get(recipient) || 0;
        targets.set(recipient, current + unitSize);
        unitsDistributed++;

        if (debug) {
            console.log(
                `[REMAINDER-REDISTRIBUTION]   ${recipient.slice(0, 20)}: ` +
                `+${unitSize.toFixed(2)} (remainder=${remainders[i].remainder.toFixed(4)})`
            );
        }
    }

    const redistributed = unitsDistributed * unitSize;

    if (debug) {
        console.log(`[REMAINDER-REDISTRIBUTION] Redistributed ${redistributed.toFixed(2)} total`);
    }

    return redistributed;
}

/**
 * Calculate targets for multi-tier distribution
 * 
 * Allocates capacity tier-by-tier in priority order (lower priority number = first).
 * Remaining capacity from each tier cascades to the next tier.
 * 
 * @param capacity - Total capacity available
 * @param tiers - Tier definitions with priority and shares
 * @param needs - Effective needs by recipient
 * @param expectations - Expected allocations from this provider
 * @param options - Optional refinements
 * @returns Map of recipient -> target allocation
 */
export function calculateMultiTierTargets(
    capacity: number,
    tiers: Array<{ priority: number; shares: Record<string, number>; label?: string }>,
    needs: Record<string, number>,
    expectations: Record<string, number>,
    options?: TargetCalculationOptions
): Map<string, number> {

    const debug = options?.debug || false;
    const allTargets = new Map<string, number>();
    let remaining = capacity;

    // Sort by priority (ascending)
    const sorted = [...tiers].sort((a, b) => a.priority - b.priority);

    // Build recipient -> tier mapping (highest priority wins)
    const recipientTierMap = new Map<string, number>();
    for (const tier of sorted) {
        for (const recipientPub of Object.keys(tier.shares)) {
            if (!recipientTierMap.has(recipientPub)) {
                recipientTierMap.set(recipientPub, tier.priority);
            }
        }
    }

    for (const tier of sorted) {
        if (remaining < EPSILON) {
            if (debug) {
                console.log(`[TIER-${tier.priority}] Skipped: no remaining capacity`);
            }
            break;
        }

        // Filter to recipients in THIS tier only
        const tierRecipients = Object.keys(tier.shares).filter(
            recipientPub => recipientTierMap.get(recipientPub) === tier.priority
        );

        if (tierRecipients.length === 0) {
            if (debug) {
                console.log(`[TIER-${tier.priority}] Skipped: no eligible recipients`);
            }
            continue;
        }

        // Build tier-specific shares
        const tierShares: Record<string, number> = {};
        for (const recipientPub of tierRecipients) {
            tierShares[recipientPub] = tier.shares[recipientPub] || 0;
        }

        if (debug) {
            console.log(
                `[TIER-${tier.priority}${tier.label ? ` (${tier.label})` : ''}] ` +
                `Starting: capacity=${remaining.toFixed(2)}, recipients=${tierRecipients.length}`
            );
        }

        // Calculate targets for this tier
        const tierTargets = calculateSingleTierTargets(
            remaining,
            tierShares,
            needs,
            expectations,
            options
        );

        // Update remaining capacity
        let tierAllocated = 0;
        for (const [recipient, target] of tierTargets.entries()) {
            allTargets.set(recipient, target);
            tierAllocated += target;
        }

        remaining -= tierAllocated;

        if (debug) {
            console.log(
                `[TIER-${tier.priority}${tier.label ? ` (${tier.label})` : ''}] ` +
                `Allocated ${tierAllocated.toFixed(2)}, Remaining: ${remaining.toFixed(2)}`
            );
        }
    }

    return allTargets;
}

/**
 * Adjust allocation based on distance from need
 * 
 * Applies damped convergence toward target allocation based on distance:
 * - distance < 0 (overshoot): retract toward target
 * - distance > 0 (undershoot): expand toward target
 * - distance = 0 (perfect): rebalance toward target for alignment
 * 
 * @param currentAllocation - Current commitment to recipient
 * @param target - Target allocation (from calculateTargets)
 * @param distance - Distance from need (declaredNeed - totalAllocated)
 * @param dampingFactor - Damping factor (0-1, default 0.8)
 * @returns New allocation amount
 */
export function adjustAllocationBasedOnDistance(
    currentAllocation: number,
    target: number,
    distance: number,
    dampingFactor: number = 0.8
): number {

    const deviation = currentAllocation - target;

    if (distance < 0) {
        // Overshoot: retract toward target
        if (deviation > 0) {
            const retraction = Math.abs(deviation) * dampingFactor;
            return Math.max(target, currentAllocation - retraction);
        }
        return currentAllocation;

    } else if (distance > 0) {
        // Undershoot: expand toward target
        if (deviation < 0) {
            const expansion = Math.abs(deviation) * dampingFactor;
            return Math.min(target, currentAllocation + expansion);
        }
        return currentAllocation;

    } else {
        // Perfect satisfaction: rebalance toward target for alignment
        const rebalance = deviation * dampingFactor;
        return currentAllocation - rebalance;
    }
}


