/**
 * Comprehensive Tests for allocation-targets.ts
 * 
 * Tests the distribution-agnostic target calculation system that converts
 * distribution shares into concrete capacity-constrained allocations.
 * 
 * Coverage:
 * - calculateTargets (main entry point)
 * - calculateSingleTierTargets
 * - calculateMultiTierTargets
 * - iterativeAllocation
 * - redistributeRemainder
 * - adjustAllocationBasedOnDistance
 * - getEffectiveNeeds
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    calculateTargets,
    calculateSingleTierTargets,
    calculateMultiTierTargets,
    adjustAllocationBasedOnDistance,
    type TargetCalculationOptions,
    type DivisibilityConstraints
} from '../allocation-targets.js';
import type { DistributionResult } from '../distribution.js';
import type { ComplianceFilter } from '../filters/types.js';

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function createDistribution(
    shares: Record<string, number>,
    method: DistributionResult['method'] = 'mutual-recognition'
): DistributionResult {
    return {
        shares,
        method,
        metadata: {
            timestamp: Date.now()
        }
    };
}

function createMultiTierDistribution(
    tiers: Array<{ priority: number; shares: Record<string, number>; label?: string }>
): DistributionResult {
    const allShares: Record<string, number> = {};
    for (const tier of tiers) {
        for (const [recipient, share] of Object.entries(tier.shares)) {
            if (!(recipient in allShares)) {
                allShares[recipient] = share;
            }
        }
    }

    return {
        shares: allShares,
        method: 'multi-tier',
        tiers,
        metadata: {
            timestamp: Date.now()
        }
    };
}

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

describe('allocation-targets.ts', () => {

    describe('calculateSingleTierTargets', () => {

        it('should allocate capacity to single recipient', () => {
            const capacity = 100;
            const shares = { 'alice': 1.0 };
            const needs = { 'alice': 50 };
            const expectations = { 'alice': 50 };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations);

            expect(result.get('alice')).toBe(50);
        });

        it('should handle zero capacity', () => {
            const capacity = 0;
            const shares = { 'alice': 1.0 };
            const needs = { 'alice': 50 };
            const expectations = { 'alice': 50 };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations);

            expect(result.size).toBe(0);
        });

        it('should handle no eligible recipients (all have zero needs)', () => {
            const capacity = 100;
            const shares = { 'alice': 0.5, 'bob': 0.5 };
            const needs = { 'alice': 0, 'bob': 0 };
            const expectations = { 'alice': 0, 'bob': 0 };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations);

            expect(result.size).toBe(0);
        });

        it('should distribute capacity proportionally among multiple recipients', () => {
            const capacity = 100;
            const shares = { 'alice': 0.6, 'bob': 0.4 };
            const needs = { 'alice': 100, 'bob': 100 };
            const expectations = { 'alice': 100, 'bob': 100 };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations);

            // Should allocate all capacity
            const total = (result.get('alice') || 0) + (result.get('bob') || 0);
            expect(total).toBeGreaterThan(0);
            expect(total).toBeLessThanOrEqual(capacity);

            // Alice should get more than Bob
            expect(result.get('alice')).toBeGreaterThan(result.get('bob') || 0);
        });

        it('should respect recipient expectations (never allocate more than expected)', () => {
            const capacity = 100;
            const shares = { 'alice': 0.6, 'bob': 0.4 };
            const needs = { 'alice': 30, 'bob': 20 };  // Lower needs
            const expectations = { 'alice': 30, 'bob': 20 };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations);

            expect(result.get('alice')).toBeLessThanOrEqual(30);
            expect(result.get('bob')).toBeLessThanOrEqual(20);
        });

        it('should use equal distribution when shares sum to zero', () => {
            const capacity = 100;
            const shares = { 'alice': 0, 'bob': 0 };
            const needs = { 'alice': 50, 'bob': 50 };
            const expectations = { 'alice': 50, 'bob': 50 };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations);

            // Should fall back to equal distribution
            const aliceAlloc = result.get('alice') || 0;
            const bobAlloc = result.get('bob') || 0;
            expect(Math.abs(aliceAlloc - bobAlloc)).toBeLessThan(5);
        });

        it('should apply divisibility constraints (max_natural_div)', () => {
            const capacity = 100;
            const shares = { 'alice': 0.6, 'bob': 0.4 };
            const needs = { 'alice': 100, 'bob': 100 };
            const expectations = { 'alice': 100, 'bob': 100 };

            const divisibilityConstraints: DivisibilityConstraints = {
                max_natural_div: 5  // Can only divide into 5 units of 20 each
            };

            const options: TargetCalculationOptions = {
                divisibilityConstraints
            };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations, options);

            // Allocations should be multiples of 20
            const aliceAlloc = result.get('alice') || 0;
            const bobAlloc = result.get('bob') || 0;

            expect(aliceAlloc % 20).toBeCloseTo(0, 0);
            expect(bobAlloc % 20).toBeCloseTo(0, 0);
        });

        it('should apply divisibility constraints (min_allocation_percentage)', () => {
            const capacity = 100;
            const shares = { 'alice': 0.95, 'bob': 0.05 };  // Bob gets only 5%
            const needs = { 'alice': 100, 'bob': 100 };
            const expectations = { 'alice': 100, 'bob': 100 };

            const divisibilityConstraints: DivisibilityConstraints = {
                min_allocation_percentage: 0.10  // Minimum 10% per allocation
            };

            const options: TargetCalculationOptions = {
                divisibilityConstraints
            };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations, options);

            // Bob should get nothing (5% < 10% minimum)
            expect(result.get('bob')).toBeUndefined();
            // Alice should get something
            expect(result.get('alice')).toBeGreaterThan(0);
        });

        it('should handle iterative allocation with multiple rounds', () => {
            const capacity = 100;
            const shares = { 'alice': 0.5, 'bob': 0.5 };
            const needs = { 'alice': 30, 'bob': 100 };  // Alice needs less
            const expectations = { 'alice': 30, 'bob': 100 };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations);

            // Alice should get 30 (satisfied)
            expect(result.get('alice')).toBeCloseTo(30, 0);
            // Bob should get remaining capacity (70)
            expect(result.get('bob')).toBeCloseTo(70, 0);
        });


    });

    describe('calculateMultiTierTargets', () => {

        it('should allocate tier-by-tier in priority order', () => {
            const capacity = 100;
            const tiers = [
                { priority: 0, shares: { 'alice': 1.0 }, label: 'tier1' },
                { priority: 1, shares: { 'bob': 1.0 }, label: 'tier2' }
            ];
            const needs = { 'alice': 40, 'bob': 100 };
            const expectations = { 'alice': 40, 'bob': 100 };

            const result = calculateMultiTierTargets(capacity, tiers, needs, expectations);

            // Alice (tier 0) should get 40
            expect(result.get('alice')).toBe(40);
            // Bob (tier 1) should get remaining 60
            expect(result.get('bob')).toBe(60);
        });

        it('should handle empty tiers gracefully', () => {
            const capacity = 100;
            const tiers = [
                { priority: 0, shares: {}, label: 'empty' },
                { priority: 1, shares: { 'alice': 1.0 }, label: 'tier2' }
            ];
            const needs = { 'alice': 50 };
            const expectations = { 'alice': 50 };

            const result = calculateMultiTierTargets(capacity, tiers, needs, expectations);

            // Alice should get allocation from tier 1
            expect(result.get('alice')).toBe(50);
        });

        it('should cascade remaining capacity to lower priority tiers', () => {
            const capacity = 100;
            const tiers = [
                { priority: 0, shares: { 'alice': 1.0 }, label: 'tier1' },
                { priority: 1, shares: { 'bob': 1.0 }, label: 'tier2' },
                { priority: 2, shares: { 'carol': 1.0 }, label: 'tier3' }
            ];
            const needs = { 'alice': 20, 'bob': 30, 'carol': 100 };
            const expectations = { 'alice': 20, 'bob': 30, 'carol': 100 };

            const result = calculateMultiTierTargets(capacity, tiers, needs, expectations);

            expect(result.get('alice')).toBe(20);  // Tier 0: 20
            expect(result.get('bob')).toBe(30);    // Tier 1: 30
            expect(result.get('carol')).toBe(50);  // Tier 2: remaining 50
        });

        it('should stop allocation when capacity is exhausted', () => {
            const capacity = 50;
            const tiers = [
                { priority: 0, shares: { 'alice': 1.0 }, label: 'tier1' },
                { priority: 1, shares: { 'bob': 1.0 }, label: 'tier2' }
            ];
            const needs = { 'alice': 60, 'bob': 60 };
            const expectations = { 'alice': 60, 'bob': 60 };

            const result = calculateMultiTierTargets(capacity, tiers, needs, expectations);

            // Alice should get all 50
            expect(result.get('alice')).toBe(50);
            // Bob should get nothing (capacity exhausted)
            expect(result.get('bob')).toBeUndefined();
        });

        it('should handle recipients appearing in multiple tiers (highest priority wins)', () => {
            const capacity = 100;
            const tiers = [
                { priority: 0, shares: { 'alice': 1.0 }, label: 'tier1' },
                { priority: 1, shares: { 'alice': 1.0, 'bob': 1.0 }, label: 'tier2' }
            ];
            const needs = { 'alice': 50, 'bob': 50 };
            const expectations = { 'alice': 50, 'bob': 50 };

            const result = calculateMultiTierTargets(capacity, tiers, needs, expectations);

            // Alice should only be allocated in tier 0 (highest priority)
            expect(result.get('alice')).toBe(50);
            // Bob should get remaining capacity in tier 1
            expect(result.get('bob')).toBe(50);
        });

        it('should distribute within tier when multiple recipients', () => {
            const capacity = 100;
            const tiers = [
                { priority: 0, shares: { 'alice': 0.6, 'bob': 0.4 }, label: 'tier1' }
            ];
            const needs = { 'alice': 100, 'bob': 100 };
            const expectations = { 'alice': 100, 'bob': 100 };

            const result = calculateMultiTierTargets(capacity, tiers, needs, expectations);

            // Should distribute proportionally
            const total = (result.get('alice') || 0) + (result.get('bob') || 0);
            expect(total).toBeGreaterThan(0);
            expect(result.get('alice')).toBeGreaterThan(result.get('bob') || 0);
        });
    });

    describe('adjustAllocationBasedOnDistance', () => {

        it('should retract allocation when overshooting (distance < 0)', () => {
            const currentAllocation = 60;
            const target = 50;
            const distance = -10;  // Over-allocated by 10
            const dampingFactor = 0.8;

            const result = adjustAllocationBasedOnDistance(
                currentAllocation,
                target,
                distance,
                dampingFactor
            );

            // Should move toward target: 60 - (10 * 0.8) = 52
            expect(result).toBeCloseTo(52, 1);
        });

        it('should not retract below target when overshooting', () => {
            const currentAllocation = 60;
            const target = 50;
            const distance = -10;
            const dampingFactor = 0.8;

            const result = adjustAllocationBasedOnDistance(
                currentAllocation,
                target,
                distance,
                dampingFactor
            );

            expect(result).toBeGreaterThanOrEqual(target);
        });

        it('should expand allocation when undershooting (distance > 0)', () => {
            const currentAllocation = 40;
            const target = 50;
            const distance = 10;  // Under-allocated by 10
            const dampingFactor = 0.8;

            const result = adjustAllocationBasedOnDistance(
                currentAllocation,
                target,
                distance,
                dampingFactor
            );

            // Should move toward target: 40 + (10 * 0.8) = 48
            expect(result).toBeCloseTo(48, 1);
        });

        it('should not expand above target when undershooting', () => {
            const currentAllocation = 40;
            const target = 50;
            const distance = 10;
            const dampingFactor = 0.8;

            const result = adjustAllocationBasedOnDistance(
                currentAllocation,
                target,
                distance,
                dampingFactor
            );

            expect(result).toBeLessThanOrEqual(target);
        });

        it('should rebalance toward target when perfectly satisfied (distance = 0)', () => {
            const currentAllocation = 60;
            const target = 50;
            const distance = 0;  // Perfect satisfaction
            const dampingFactor = 0.8;

            const result = adjustAllocationBasedOnDistance(
                currentAllocation,
                target,
                distance,
                dampingFactor
            );

            // Should rebalance: 60 - ((60-50) * 0.8) = 52
            expect(result).toBeCloseTo(52, 1);
        });

        it('should handle zero damping factor (no change)', () => {
            const currentAllocation = 60;
            const target = 50;
            const distance = -10;
            const dampingFactor = 0.0;

            const result = adjustAllocationBasedOnDistance(
                currentAllocation,
                target,
                distance,
                dampingFactor
            );

            // No change with zero damping
            expect(result).toBe(currentAllocation);
        });

        it('should handle full damping factor (immediate convergence)', () => {
            const currentAllocation = 60;
            const target = 50;
            const distance = -10;
            const dampingFactor = 1.0;

            const result = adjustAllocationBasedOnDistance(
                currentAllocation,
                target,
                distance,
                dampingFactor
            );

            // Should converge to target immediately
            expect(result).toBeCloseTo(target, 1);
        });

        it('should not change allocation when already at target and undershooting', () => {
            const currentAllocation = 50;
            const target = 50;
            const distance = 10;  // Undershoot but already at target
            const dampingFactor = 0.8;

            const result = adjustAllocationBasedOnDistance(
                currentAllocation,
                target,
                distance,
                dampingFactor
            );

            // No change needed (deviation = 0)
            expect(result).toBe(currentAllocation);
        });

        it('should not change allocation when already at target and overshooting', () => {
            const currentAllocation = 50;
            const target = 50;
            const distance = -10;  // Overshoot but already at target
            const dampingFactor = 0.8;

            const result = adjustAllocationBasedOnDistance(
                currentAllocation,
                target,
                distance,
                dampingFactor
            );

            // No change needed (deviation = 0)
            expect(result).toBe(currentAllocation);
        });
    });

    describe('calculateTargets (main entry point)', () => {

        it('should handle single-tier distribution', () => {
            const myCapacity = 100;
            const distribution = createDistribution({ 'alice': 0.6, 'bob': 0.4 });
            const recipientNeeds = { 'alice': 100, 'bob': 100 };
            const recipientExpectations = { 'alice': 100, 'bob': 100 };

            const result = calculateTargets(
                myCapacity,
                distribution,
                recipientNeeds,
                recipientExpectations
            );

            // Should distribute proportionally
            const total = (result.get('alice') || 0) + (result.get('bob') || 0);
            expect(total).toBeGreaterThan(0);
            expect(result.get('alice')).toBeGreaterThan(result.get('bob') || 0);
        });

        it('should handle multi-tier distribution', () => {
            const myCapacity = 100;
            const distribution = createMultiTierDistribution([
                { priority: 0, shares: { 'alice': 1.0 }, label: 'tier1' },
                { priority: 1, shares: { 'bob': 1.0 }, label: 'tier2' }
            ]);
            const recipientNeeds = { 'alice': 40, 'bob': 100 };
            const recipientExpectations = { 'alice': 40, 'bob': 100 };

            const result = calculateTargets(
                myCapacity,
                distribution,
                recipientNeeds,
                recipientExpectations
            );

            expect(result.get('alice')).toBe(40);
            expect(result.get('bob')).toBe(60);
        });

        it('should handle empty distribution', () => {
            const myCapacity = 100;
            const distribution = createDistribution({});
            const recipientNeeds = {};
            const recipientExpectations = {};

            const result = calculateTargets(
                myCapacity,
                distribution,
                recipientNeeds,
                recipientExpectations
            );

            expect(result.size).toBe(0);
        });

        it('should handle zero capacity', () => {
            const myCapacity = 0;
            const distribution = createDistribution({ 'alice': 1.0 });
            const recipientNeeds = { 'alice': 50 };
            const recipientExpectations = { 'alice': 50 };

            const result = calculateTargets(
                myCapacity,
                distribution,
                recipientNeeds,
                recipientExpectations
            );

            expect(result.size).toBe(0);
        });



        it('should apply divisibility constraints', () => {
            const myCapacity = 100;
            const distribution = createDistribution({ 'alice': 0.6, 'bob': 0.4 });
            const recipientNeeds = { 'alice': 100, 'bob': 100 };
            const recipientExpectations = { 'alice': 100, 'bob': 100 };

            const options: TargetCalculationOptions = {
                divisibilityConstraints: {
                    max_natural_div: 5  // Units of 20
                }
            };

            const result = calculateTargets(
                myCapacity,
                distribution,
                recipientNeeds,
                recipientExpectations,
                options
            );

            const aliceAlloc = result.get('alice') || 0;
            const bobAlloc = result.get('bob') || 0;

            expect(aliceAlloc % 20).toBeCloseTo(0, 0);
            expect(bobAlloc % 20).toBeCloseTo(0, 0);
        });
    });

    describe('Edge Cases and Safety', () => {

        it('should handle very small capacity values', () => {
            const capacity = 1.0;
            const shares = { 'alice': 1.0 };
            const needs = { 'alice': 1.0 };
            const expectations = { 'alice': 1.0 };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations);

            const aliceAlloc = result.get('alice') || 0;
            expect(aliceAlloc).toBeGreaterThan(0);
            expect(aliceAlloc).toBeLessThanOrEqual(1.0);
        });

        it('should handle very large capacity values', () => {
            const capacity = 1000;
            const shares = { 'alice': 1.0 };
            const needs = { 'alice': 1000 };
            const expectations = { 'alice': 1000 };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations);

            expect(result.get('alice')).toBeCloseTo(1000, -1);
        });

        it('should handle many recipients (scalability)', () => {
            const capacity = 1000;
            const shares: Record<string, number> = {};
            const needs: Record<string, number> = {};
            const expectations: Record<string, number> = {};

            // Create 100 recipients
            for (let i = 0; i < 100; i++) {
                const id = `recipient_${i}`;
                shares[id] = 1.0 / 100;
                needs[id] = 20;
                expectations[id] = 20;
            }

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations);

            // Should allocate to all recipients
            expect(result.size).toBe(100);

            // Total should not exceed capacity
            const total = Array.from(result.values()).reduce((sum, v) => sum + v, 0);
            expect(total).toBeLessThanOrEqual(capacity);
        });

        it('should prevent infinite loops with MAX_ITERATIONS', () => {
            // This is a pathological case that could cause infinite loops
            const capacity = 100;
            const shares = { 'alice': 1.0 };
            const needs = { 'alice': 100 };
            const expectations = { 'alice': 100 };

            // Should complete without hanging
            const result = calculateSingleTierTargets(capacity, shares, needs, expectations);

            expect(result.get('alice')).toBeDefined();
        });

        it('should handle recipients with zero shares', () => {
            const capacity = 100;
            const shares = { 'alice': 1.0, 'bob': 0 };
            const needs = { 'alice': 50, 'bob': 50 };
            const expectations = { 'alice': 50, 'bob': 50 };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations);

            // Alice should get allocation, Bob gets 0 or undefined
            expect(result.get('alice')).toBeGreaterThan(0);
            const bobAlloc = result.get('bob') || 0;
            expect(bobAlloc).toBeLessThanOrEqual(0);
        });

        it('should handle negative needs gracefully (treat as zero)', () => {
            const capacity = 100;
            const shares = { 'alice': 1.0 };
            const needs = { 'alice': -50 };  // Invalid negative need
            const expectations = { 'alice': -50 };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations);

            // Should treat as no need
            expect(result.size).toBe(0);
        });

        it('should handle fractional shares that sum to > 1.0', () => {
            const capacity = 100;
            const shares = { 'alice': 0.7, 'bob': 0.6 };  // Sum = 1.3
            const needs = { 'alice': 100, 'bob': 100 };
            const expectations = { 'alice': 100, 'bob': 100 };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations);

            // Should normalize and allocate proportionally
            const total = (result.get('alice') || 0) + (result.get('bob') || 0);
            expect(total).toBeGreaterThan(0);
            expect(result.get('alice')).toBeGreaterThan(result.get('bob') || 0);
        });
    });

    describe('Remainder Redistribution', () => {

        it('should redistribute remainder when divisibility constraints leave capacity unused', () => {
            const capacity = 100;
            const shares = { 'alice': 0.34, 'bob': 0.33, 'carol': 0.33 };
            const needs = { 'alice': 100, 'bob': 100, 'carol': 100 };
            const expectations = { 'alice': 100, 'bob': 100, 'carol': 100 };

            const options: TargetCalculationOptions = {
                divisibilityConstraints: {
                    max_natural_div: 5  // Units of 20
                }
            };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations, options);

            // Total should be close to capacity (remainder redistributed)
            const total = Array.from(result.values()).reduce((sum, v) => sum + v, 0);
            expect(total).toBeGreaterThanOrEqual(80);  // At least 4 units of 20
        });

        it('should use largest remainder method for fair redistribution', () => {
            const capacity = 100;
            const shares = { 'alice': 0.34, 'bob': 0.33, 'carol': 0.33 };
            const needs = { 'alice': 100, 'bob': 100, 'carol': 100 };
            const expectations = { 'alice': 100, 'bob': 100, 'carol': 100 };

            const options: TargetCalculationOptions = {
                divisibilityConstraints: {
                    max_natural_div: 5
                }
            };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations, options);

            // Alice should get slightly more (largest share)
            expect(result.get('alice')).toBeGreaterThanOrEqual(result.get('bob') || 0);
        });
    });

    describe('Integration with Distribution Methods', () => {

        it('should work with mutual-recognition distribution', () => {
            const myCapacity = 100;
            const distribution: DistributionResult = {
                shares: { 'alice': 0.6, 'bob': 0.4 },
                method: 'mutual-recognition',
                metadata: {
                    timestamp: Date.now()
                }
            };
            const recipientNeeds = { 'alice': 100, 'bob': 100 };
            const recipientExpectations = { 'alice': 100, 'bob': 100 };

            const result = calculateTargets(
                myCapacity,
                distribution,
                recipientNeeds,
                recipientExpectations
            );

            const total = (result.get('alice') || 0) + (result.get('bob') || 0);
            expect(total).toBeGreaterThan(0);
            expect(result.get('alice')).toBeGreaterThan(result.get('bob') || 0);
        });

        it('should work with equal-shares distribution', () => {
            const myCapacity = 100;
            const distribution: DistributionResult = {
                shares: { 'alice': 0.5, 'bob': 0.5 },
                method: 'equal-shares',
                metadata: {
                    timestamp: Date.now()
                }
            };
            const recipientNeeds = { 'alice': 100, 'bob': 100 };
            const recipientExpectations = { 'alice': 100, 'bob': 100 };

            const result = calculateTargets(
                myCapacity,
                distribution,
                recipientNeeds,
                recipientExpectations
            );

            const total = (result.get('alice') || 0) + (result.get('bob') || 0);
            expect(total).toBeGreaterThan(0);
            // Both should get something
            expect(result.get('alice')).toBeGreaterThan(0);
            expect(result.get('bob')).toBeGreaterThan(0);
        });

        it('should work with custom distribution', () => {
            const myCapacity = 100;
            const distribution: DistributionResult = {
                shares: { 'alice': 0.8, 'bob': 0.2 },
                method: 'custom',
                metadata: {
                    timestamp: Date.now()
                }
            };
            const recipientNeeds = { 'alice': 100, 'bob': 100 };
            const recipientExpectations = { 'alice': 100, 'bob': 100 };

            const result = calculateTargets(
                myCapacity,
                distribution,
                recipientNeeds,
                recipientExpectations
            );

            const total = (result.get('alice') || 0) + (result.get('bob') || 0);
            expect(total).toBeGreaterThan(0);
            expect(result.get('alice')).toBeGreaterThan(result.get('bob') || 0);
        });
    });

    describe('Compliance Filters', () => {

        it('should block recipients with filter = 0', () => {
            const capacity = 100;
            const shares = { 'alice': 0.5, 'bob': 0.5 };
            const needs = { 'alice': 100, 'bob': 100 };
            const expectations = { 'alice': 100, 'bob': 100 };

            const options: TargetCalculationOptions = {
                recipientFilters: new Map([
                    ['bob', 0]  // Bob is completely blocked
                ]),
                currentAllocations: { 'alice': 0, 'bob': 0 }
            };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations, options);

            // Bob should be filtered out completely
            expect(result.get('bob')).toBeUndefined();
            // Alice should get allocation
            expect(result.get('alice')).toBeGreaterThan(0);
        });

        it('should cap recipients at filter value', () => {
            const capacity = 100;
            const shares = { 'alice': 0.5, 'bob': 0.5 };
            const needs = { 'alice': 100, 'bob': 100 };
            const expectations = { 'alice': 100, 'bob': 100 };

            const options: TargetCalculationOptions = {
                recipientFilters: new Map([
                    ['bob', 30]  // Bob is capped at 30
                ]),
                currentAllocations: { 'alice': 0, 'bob': 0 }
            };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations, options);

            // Bob should not exceed cap
            expect(result.get('bob')).toBeLessThanOrEqual(30);
            // Alice should get some allocation
            expect(result.get('alice')).toBeGreaterThan(0);
        });

        it('should allow unlimited with filter = null', () => {
            const capacity = 100;
            const shares = { 'alice': 0.5, 'bob': 0.5 };
            const needs = { 'alice': 100, 'bob': 100 };
            const expectations = { 'alice': 100, 'bob': 100 };

            const options: TargetCalculationOptions = {
                recipientFilters: new Map([
                    ['bob', null]  // Bob is unlimited
                ]),
                currentAllocations: { 'alice': 0, 'bob': 0 }
            };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations, options);

            // Both should get allocations
            expect(result.get('alice')).toBeGreaterThan(0);
            expect(result.get('bob')).toBeGreaterThan(0);
        });

        it('should apply dynamic caps based on currentTotal', () => {
            const capacity = 100;
            const shares = { 'alice': 0.5, 'bob': 0.5 };
            const needs = { 'alice': 100, 'bob': 100 };
            const expectations = { 'alice': 100, 'bob': 100 };

            const options: TargetCalculationOptions = {
                recipientFilters: new Map([
                    ['bob', 50]  // Bob is capped at 50 total
                ]),
                currentAllocations: { 'alice': 0, 'bob': 30 }  // Bob already has 30
            };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations, options);

            // Bob should get at most 20 more (50 - 30 = 20)
            expect(result.get('bob')).toBeLessThanOrEqual(20);
        });

        it('should respect filters in multi-tier allocation', () => {
            const capacity = 100;
            const tiers = [
                { priority: 0, shares: { 'alice': 1.0 }, label: 'tier1' },
                { priority: 1, shares: { 'bob': 1.0 }, label: 'tier2' }
            ];
            const needs = { 'alice': 100, 'bob': 100 };
            const expectations = { 'alice': 100, 'bob': 100 };

            const options: TargetCalculationOptions = {
                recipientFilters: new Map([
                    ['alice', 40]  // Alice is capped at 40
                ]),
                currentAllocations: { 'alice': 0, 'bob': 0 }
            };

            const result = calculateMultiTierTargets(capacity, tiers, needs, expectations, options);

            // Alice should be capped at 40
            expect(result.get('alice')).toBeLessThanOrEqual(40);
            // Bob should get remaining capacity
            expect(result.get('bob')).toBeGreaterThan(0);
        });

        it('should combine filters with divisibility constraints', () => {
            const capacity = 100;
            const shares = { 'alice': 0.5, 'bob': 0.5 };
            const needs = { 'alice': 100, 'bob': 100 };
            const expectations = { 'alice': 100, 'bob': 100 };

            const options: TargetCalculationOptions = {
                recipientFilters: new Map([
                    ['bob', 45]  // Bob is capped at 45
                ]),
                currentAllocations: { 'alice': 0, 'bob': 0 },
                divisibilityConstraints: {
                    max_natural_div: 10  // Units of 10
                }
            };

            const result = calculateSingleTierTargets(capacity, shares, needs, expectations, options);

            // Bob should be capped at 45, but rounded down to 40 (divisibility)
            const bobAlloc = result.get('bob') || 0;
            expect(bobAlloc).toBeLessThanOrEqual(45);
            expect(bobAlloc % 10).toBeCloseTo(0, 0);
        });
    });
});
