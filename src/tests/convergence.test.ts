/**
 * Convergence Tests - Phase 3
 * 
 * Tests convergence metrics and multi-iteration allocation scenarios.
 */

import { describe, it, expect } from 'vitest';
import {
    computeTotalNeedMagnitude,
    computeContractionRate,
    computePercentNeedsMet,
    computePercentNeedReduction,
    estimateIterationsToConvergence,
    computeMaxPersonNeed,
    computeNeedVariance,
    computePeopleStuck,
    checkUniversalSatisfaction,
    buildSystemState,
    computeAllocations,
    applyNeedUpdateLaw
} from '../allocation.js';
import type { Commitment, GlobalRecognitionWeights } from '../schemas.js';
import { seed as itcSeed } from '../itc.js';

// Helper to create simple commitment
function createCommitment(overrides: Partial<Commitment> = {}): Commitment {
    return {
        capacity_slots: [],
        need_slots: [],
        timestamp: Date.now(),
        itcStamp: itcSeed(),
        ...overrides
    };
}

describe('convergence.ts - Convergence Metrics', () => {
    describe('Total Need Magnitude', () => {
        it('should compute Frobenius norm of need vector', () => {
            const state = {
                needsByPersonAndType: {
                    'alice': { 'food': 3, 'housing': 4 },  // magnitude = sqrt(9 + 16) = 5
                    'bob': { 'food': 12 }  // magnitude = 12
                },
                capacityByPersonAndType: {},
                timestamp: Date.now(),
                iteration: 0,
                itcStamp: itcSeed()
            };

            const magnitude = computeTotalNeedMagnitude(state);
            // Total = sqrt(3^2 + 4^2 + 12^2) = sqrt(9 + 16 + 144) = sqrt(169) = 13
            expect(magnitude).toBeCloseTo(13, 2);
        });

        it('should return 0 for zero needs', () => {
            const state = {
                needsByPersonAndType: {
                    'alice': { 'food': 0 },
                    'bob': { 'food': 0 }
                },
                capacityByPersonAndType: {},
                timestamp: Date.now(),
                iteration: 0,
                itcStamp: itcSeed()
            };

            expect(computeTotalNeedMagnitude(state)).toBe(0);
        });

        it('should handle empty needs', () => {
            const state = {
                needsByPersonAndType: {},
                capacityByPersonAndType: {},
                timestamp: Date.now(),
                iteration: 0,
                itcStamp: itcSeed()
            };

            expect(computeTotalNeedMagnitude(state)).toBe(0);
        });
    });

    describe('Contraction Rate', () => {
        it('should compute contraction rate correctly', () => {
            // Normal contraction (needs shrinking)
            expect(computeContractionRate(80, 100)).toBeCloseTo(0.8, 2);

            // No progress
            expect(computeContractionRate(100, 100)).toBe(1.0);

            // Divergence (needs growing)
            expect(computeContractionRate(120, 100)).toBeCloseTo(1.2, 2);
        });

        it('should handle zero previous magnitude', () => {
            // Edge case: previous magnitude near zero
            expect(computeContractionRate(5, 0.0001)).toBe(0);
        });

        it('should handle both zero', () => {
            expect(computeContractionRate(0, 0)).toBe(0);
        });
    });

    describe('Percent Needs Met', () => {
        it('should compute percentage of satisfied people', () => {
            const state1 = {
                needsByPersonAndType: {
                    'alice': { 'food': 0 },  // Satisfied
                    'bob': { 'food': 10 }    // Not satisfied
                },
                capacityByPersonAndType: {},
                timestamp: Date.now(),
                iteration: 0,
                itcStamp: itcSeed()
            };

            // 50% of people satisfied (1 out of 2)
            expect(computePercentNeedsMet(state1)).toBe(50);
        });

        it('should return 100 when all satisfied', () => {
            const state2 = {
                needsByPersonAndType: {
                    'alice': { 'food': 0 },
                    'bob': { 'food': 0 }
                },
                capacityByPersonAndType: {},
                timestamp: Date.now(),
                iteration: 0,
                itcStamp: itcSeed()
            };

            expect(computePercentNeedsMet(state2)).toBe(100);
        });

        it('should return 0 when none satisfied', () => {
            const state3 = {
                needsByPersonAndType: {
                    'alice': { 'food': 10 },
                    'bob': { 'food': 20 }
                },
                capacityByPersonAndType: {},
                timestamp: Date.now(),
                iteration: 0,
                itcStamp: itcSeed()
            };

            expect(computePercentNeedsMet(state3)).toBe(0);
        });
    });

    describe('Percent Need Reduction', () => {
        it('should compute reduction percentage', () => {
            const reduction = computePercentNeedReduction(80, 100);
            expect(reduction).toBeCloseTo(20, 2); // 20% reduction
        });

        it('should handle zero reduction', () => {
            expect(computePercentNeedReduction(100, 100)).toBe(0);
        });

        it('should handle complete reduction', () => {
            expect(computePercentNeedReduction(0, 100)).toBe(100);
        });

        it('should handle negative reduction (divergence)', () => {
            // Function clamps to 0-100, so divergence returns 0
            expect(computePercentNeedReduction(120, 100)).toBe(0);
        });
    });

    describe('Convergence Detection', () => {
        it('should detect universal satisfaction', () => {
            const state = {
                needsByPersonAndType: {
                    'alice': { 'food': 0 },
                    'bob': { 'food': 0 }
                },
                capacityByPersonAndType: {},
                timestamp: Date.now(),
                iteration: 0,
                itcStamp: itcSeed()
            };

            expect(checkUniversalSatisfaction(state)).toBe(true);
        });

        it('should detect incomplete satisfaction', () => {
            const state = {
                needsByPersonAndType: {
                    'alice': { 'food': 0 },
                    'bob': { 'food': 5 }
                },
                capacityByPersonAndType: {},
                timestamp: Date.now(),
                iteration: 0,
                itcStamp: itcSeed()
            };

            expect(checkUniversalSatisfaction(state)).toBe(false);
        });
    });

    describe('Additional Metrics', () => {
        it('should compute max person need', () => {
            const state = {
                needsByPersonAndType: {
                    'alice': { 'food': 10, 'housing': 5 },  // Total: 15
                    'bob': { 'food': 30 }  // Total: 30 (max)
                },
                capacityByPersonAndType: {},
                timestamp: Date.now(),
                iteration: 0,
                itcStamp: itcSeed()
            };

            expect(computeMaxPersonNeed(state)).toBe(30);
        });

        it('should compute need variance', () => {
            const state = {
                needsByPersonAndType: {
                    'alice': { 'food': 10 },
                    'bob': { 'food': 20 },
                    'carol': { 'food': 30 }
                },
                capacityByPersonAndType: {},
                timestamp: Date.now(),
                iteration: 0,
                itcStamp: itcSeed()
            };

            const variance = computeNeedVariance(state);
            // Mean = 20, variance = ((10-20)^2 + (20-20)^2 + (30-20)^2) / 3 = 66.67
            expect(variance).toBeCloseTo(66.67, 1);
        });

        it('should identify stuck people', () => {
            const currentState = {
                needsByPersonAndType: {
                    'alice': { 'food': 10 },
                    'bob': { 'food': 20 }
                },
                capacityByPersonAndType: {},
                timestamp: Date.now(),
                iteration: 1,
                itcStamp: itcSeed()
            };

            const previousState = {
                needsByPersonAndType: {
                    'alice': { 'food': 5 },   // Reduced (not stuck)
                    'bob': { 'food': 20 }     // Same (stuck)
                },
                capacityByPersonAndType: {},
                timestamp: Date.now() - 1000,
                iteration: 0,
                itcStamp: itcSeed()
            };

            const stuck = computePeopleStuck(currentState, previousState);
            expect(stuck).toBe(1); // Only Bob is stuck
        });
    });

    describe('Iteration Estimation', () => {
        it('should estimate iterations to convergence', () => {
            const currentMagnitude = 50;
            const contractionRate = 0.5; // 50% reduction per iteration

            const estimate = estimateIterationsToConvergence(
                currentMagnitude,
                contractionRate
            );

            // log(0.001/50) / log(0.5) ≈ 15.6
            expect(estimate).toBeGreaterThan(15);
            expect(estimate).toBeLessThan(17);
        });

        it('should return 0 for already converged', () => {
            expect(estimateIterationsToConvergence(0.0001, 0.5)).toBe(0);
        });

        it('should return null for divergence', () => {
            expect(estimateIterationsToConvergence(100, 1.2)).toBe(null);
        });

        it('should return null for no progress', () => {
            expect(estimateIterationsToConvergence(100, 1.0)).toBe(null);
        });
    });
});
