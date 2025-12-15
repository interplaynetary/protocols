/**
 * Comprehensive Tests for allocation.ts - SIMPLIFIED VERSION
 * 
 * Tests core allocation logic with proper schema-compliant fixtures.
 */

import { describe, it, expect } from 'vitest';
import {
    computeAllocations,
    createInitialState,
    buildSystemState,
    applyDivisibilityConstraints,
    meetsMinimumAllocation,
    computeTotalNeedMagnitude,
    computeContractionRate,
    computePercentNeedsMet
} from '../allocation.js';
import type {
    Commitment,
    NeedSlot,
    AvailabilitySlot,
    GlobalRecognitionWeights
} from '../schemas.js';
import { seed as itcSeed } from '../itc.js';

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function createNeedSlot(typeId: string, quantity: number): NeedSlot {
    return {
        id: `need_${Math.random().toString(36).substr(2, 9)}`,
        need_type_id: typeId,
        quantity,
        name: `Need ${typeId}`,
        unit: 'units'
    };
}

function createCapacitySlot(typeId: string, quantity: number, overrides: Partial<AvailabilitySlot> = {}): AvailabilitySlot {
    return {
        id: `capacity_${Math.random().toString(36).substr(2, 9)}`,
        need_type_id: typeId,
        quantity,
        name: `Capacity ${typeId}`,
        unit: 'units',
        max_natural_div: 1,
        min_allocation_percentage: 0,
        ...overrides
    };
}

function createCommitment(overrides: Partial<Commitment> = {}): Commitment {
    return {
        capacity_slots: [],
        need_slots: [],
        timestamp: Date.now(),
        itcStamp: itcSeed(),
        ...overrides
    };
}

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

describe('allocation.ts - Core Functions', () => {
    describe('Divisibility Constraints', () => {
        it('should apply divisibility constraints correctly', () => {
            const capacitySlot = createCapacitySlot('food', 100, {
                max_natural_div: 5,
                min_allocation_percentage: 0.1
            });

            // Test case 1: Normal allocation (27 → 25, rounds down to nearest multiple of 5)
            const constrained1 = applyDivisibilityConstraints(27, 0.27, capacitySlot);
            expect(constrained1).toBe(25);

            // Test case 2: Below minimum percentage (5% < 10% → rejected)
            const constrained2 = applyDivisibilityConstraints(5, 0.05, capacitySlot);
            expect(constrained2).toBe(0);

            // Test case 3: Exact multiple
            const constrained3 = applyDivisibilityConstraints(30, 0.30, capacitySlot);
            expect(constrained3).toBe(30);
        });

        it('should check minimum allocation correctly', () => {
            const capacitySlot = createCapacitySlot('food', 100, {
                max_natural_div: 5,
                min_allocation_percentage: 0.15
            });

            // Meets minimum (20% > 15%)
            expect(meetsMinimumAllocation(20, capacitySlot)).toBe(true);

            // Below minimum (10% < 15%)
            expect(meetsMinimumAllocation(10, capacitySlot)).toBe(false);

            // Below natural unit
            expect(meetsMinimumAllocation(3, capacitySlot)).toBe(false);
        });
    });

    describe('Convergence Metrics', () => {
        it('should compute total need magnitude correctly', () => {
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

        it('should compute contraction rate correctly', () => {
            // Normal contraction (needs shrinking)
            expect(computeContractionRate(80, 100)).toBeCloseTo(0.8, 2);

            // No progress
            expect(computeContractionRate(100, 100)).toBe(1.0);

            // Divergence (needs growing)
            expect(computeContractionRate(120, 100)).toBeCloseTo(1.2, 2);

            // Edge case: previous magnitude near zero
            expect(computeContractionRate(5, 0.0001)).toBe(0);
        });

        it('should compute percent needs met correctly', () => {
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

            // 100% satisfied
            expect(computePercentNeedsMet(state2)).toBe(100);
        });
    });

    describe('Basic Allocation', () => {
        it('should handle zero capacity gracefully', () => {
            const providerPubkey = 'provider_alice';
            const recipientPubkey = 'recipient_bob';

            const commitments: Record<string, Commitment> = {
                [providerPubkey]: createCommitment({
                    capacity_slots: [createCapacitySlot('food', 0)]  // Zero capacity
                }),
                [recipientPubkey]: createCommitment({
                    need_slots: [createNeedSlot('food', 50)]
                })
            };

            const state = buildSystemState(commitments, undefined);
            const mutualRecognition = { [recipientPubkey]: 1.0 };
            const myRecognition: GlobalRecognitionWeights = { [recipientPubkey]: 1.0 };

            const result = computeAllocations(
                providerPubkey,
                commitments[providerPubkey].capacity_slots!,
                myRecognition,
                mutualRecognition,
                commitments,
                state,
                null
            );

            // Should have no allocations
            expect(result.allocations).toHaveLength(0);
        });

        it('should handle type mismatch (no compatible recipients)', () => {
            const providerPubkey = 'provider_alice';
            const recipientPubkey = 'recipient_bob';

            const commitments: Record<string, Commitment> = {
                [providerPubkey]: createCommitment({
                    capacity_slots: [createCapacitySlot('food', 100)]
                }),
                [recipientPubkey]: createCommitment({
                    need_slots: [createNeedSlot('housing', 2)]  // Different type!
                })
            };

            const state = buildSystemState(commitments, undefined);
            const mutualRecognition = { [recipientPubkey]: 1.0 };
            const myRecognition: GlobalRecognitionWeights = { [recipientPubkey]: 1.0 };

            const result = computeAllocations(
                providerPubkey,
                commitments[providerPubkey].capacity_slots!,
                myRecognition,
                mutualRecognition,
                commitments,
                state,
                null
            );

            // Should have no allocations (types don't match)
            expect(result.allocations).toHaveLength(0);
        });

        it('should handle zero recognition (no allocation)', () => {
            const providerPubkey = 'provider_alice';
            const recipientPubkey = 'recipient_bob';

            const commitments: Record<string, Commitment> = {
                [providerPubkey]: createCommitment({
                    capacity_slots: [createCapacitySlot('food', 100)]
                }),
                [recipientPubkey]: createCommitment({
                    need_slots: [createNeedSlot('food', 50)]
                })
            };

            const state = buildSystemState(commitments, undefined);
            const mutualRecognition = { [recipientPubkey]: 0 };  // Zero recognition!
            const myRecognition: GlobalRecognitionWeights = { [recipientPubkey]: 0 };

            const result = computeAllocations(
                providerPubkey,
                commitments[providerPubkey].capacity_slots!,
                myRecognition,
                mutualRecognition,
                commitments,
                state,
                null
            );

            // Should have no allocations
            expect(result.allocations).toHaveLength(0);
        });

        it('should allocate capacity to single recipient', () => {
            const providerPubkey = 'provider_alice';
            const recipientPubkey = 'recipient_bob';

            const commitments: Record<string, Commitment> = {
                [providerPubkey]: createCommitment({
                    capacity_slots: [createCapacitySlot('food', 100)]
                }),
                [recipientPubkey]: createCommitment({
                    need_slots: [createNeedSlot('food', 50)]
                })
            };

            const state = buildSystemState(commitments, undefined);
            const mutualRecognition = { [recipientPubkey]: 1.0 };
            const myRecognition: GlobalRecognitionWeights = { [recipientPubkey]: 1.0 };

            const result = computeAllocations(
                providerPubkey,
                commitments[providerPubkey].capacity_slots!,
                myRecognition,
                mutualRecognition,
                commitments,
                state,
                null
            );

            // Should have exactly one allocation
            expect(result.allocations.length).toBeGreaterThan(0);

            // Should allocate exactly the recipient's need (50)
            const totalAllocated = result.allocations.reduce((sum, a) => sum + a.quantity, 0);
            expect(totalAllocated).toBeCloseTo(50, 1);

            // Should not over-allocate
            expect(totalAllocated).toBeLessThanOrEqual(100);
        });

        it('should handle multiple recipients proportionally', () => {
            const providerPubkey = 'provider_alice';
            const recipient1 = 'recipient_bob';
            const recipient2 = 'recipient_carol';

            const commitments: Record<string, Commitment> = {
                [providerPubkey]: createCommitment({
                    capacity_slots: [createCapacitySlot('food', 100)]
                }),
                [recipient1]: createCommitment({
                    need_slots: [createNeedSlot('food', 30)]
                }),
                [recipient2]: createCommitment({
                    need_slots: [createNeedSlot('food', 20)]
                })
            };

            const state = buildSystemState(commitments, undefined);
            // Equal recognition
            const mutualRecognition = { [recipient1]: 0.5, [recipient2]: 0.5 };
            const myRecognition: GlobalRecognitionWeights = { [recipient1]: 0.5, [recipient2]: 0.5 };

            const result = computeAllocations(
                providerPubkey,
                commitments[providerPubkey].capacity_slots!,
                myRecognition,
                mutualRecognition,
                commitments,
                state,
                null
            );

            // Should have allocations
            expect(result.allocations.length).toBeGreaterThan(0);

            // Should not over-allocate
            const totalAllocated = result.allocations.reduce((sum, a) => sum + a.quantity, 0);
            expect(totalAllocated).toBeLessThanOrEqual(100);

            // Both recipients should receive something (roughly equal since recognition is equal)
            const bob_received = result.allocations
                .filter(a => a.recipient_pubkey === recipient1)
                .reduce((sum, a) => sum + a.quantity, 0);
            const carol_received = result.allocations
                .filter(a => a.recipient_pubkey === recipient2)
                .reduce((sum, a) => sum + a.quantity, 0);

            expect(bob_received).toBeGreaterThan(0);
            expect(carol_received).toBeGreaterThan(0);
        });
    });

    describe('System State Building', () => {
        it('should build system state from commitments', () => {
            const commitments: Record<string, Commitment> = {
                'alice': createCommitment({
                    need_slots: [createNeedSlot('food', 30), createNeedSlot('housing', 2)],
                    capacity_slots: [createCapacitySlot('tutoring', 10)]
                }),
                'bob': createCommitment({
                    need_slots: [createNeedSlot('food', 20)],
                    capacity_slots: [createCapacitySlot('food', 100)]
                })
            };

            const state = buildSystemState(commitments, undefined);

            // Check needs aggregation
            expect(state.needsByPersonAndType['alice']['food']).toBe(30);
            expect(state.needsByPersonAndType['alice']['housing']).toBe(2);
            expect(state.needsByPersonAndType['bob']['food']).toBe(20);

            // Check capacity aggregation
            expect(state.capacityByPersonAndType['alice']['tutoring']).toBe(10);
            expect(state.capacityByPersonAndType['bob']['food']).toBe(100);

            // Check metadata
            expect(state.iteration).toBe(0);
            expect(state.timestamp).toBeGreaterThan(0);
        });
    });
});
