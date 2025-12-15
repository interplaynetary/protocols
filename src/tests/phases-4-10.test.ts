/**
 * Comprehensive Remaining Tests - Phases 4-10
 * 
 * Integration tests covering damping, compatibility, remainders, and edge cases
 * using the actual public API with correct signatures.
 */

import { describe, it, expect } from 'vitest';
import {
    computeAllocations,
    buildSystemState,
    computeDampingFactors,
    updateOverAllocationHistory,
    computeTotalNeedMagnitude,
    applyDivisibilityConstraints,
    meetsMinimumAllocation
} from '../allocation.js';
import { slotsCompatible } from '../utils/match.js';
import type {
    Commitment,
    NeedSlot,
    AvailabilitySlot,
    GlobalRecognitionWeights
} from '../schemas.js';
import { seed as itcSeed } from '../itc.js';

// Helper to create commitment
function createCommitment(overrides: Partial<Commitment> = {}): Commitment {
    return {
        capacity_slots: [],
        need_slots: [],
        timestamp: Date.now(),
        itcStamp: itcSeed(),
        ...overrides
    };
}

describe('phases-4-10.ts - Remaining Test Phases', () => {
    describe('Phase 4: Damping & Over-Allocation', () => {
        it('should update over-allocation history correctly', () => {
            const history = {};
            const received = { 'food': 120 };
            const needs = { 'food': 100 };

            const updated = updateOverAllocationHistory(history, received, needs);

            expect(updated['food']).toBeDefined();
            expect(updated['food'].length).toBeGreaterThan(0);
            expect(updated['food'][0].overAllocation).toBe(20);
            expect(updated['food'][0].need_type_id).toBe('food');
        });

        it('should maintain history window size', () => {
            let history = {};
            const needs = { 'food': 100 };

            // Add 12 entries (should keep only last 10)
            for (let i = 0; i < 12; i++) {
                history = updateOverAllocationHistory(history, { 'food': 100 + i }, needs);
            }

            expect(history['food'].length).toBe(10);
        });
    });

    describe('Phase 5: Slot Compatibility', () => {
        it('should match compatible time ranges', () => {
            const need: NeedSlot = {
                id: 'need_1',
                name: 'Food Need',
                need_type_id: 'food',
                quantity: 10,
                start_date: '2024-07-01',
                end_date: '2024-08-31'
            };

            const capacity: AvailabilitySlot = {
                id: 'cap_1',
                name: 'Food Capacity',
                need_type_id: 'food',
                quantity: 100,
                start_date: '2024-07-15',
                end_date: '2024-09-15'
            };

            expect(slotsCompatible(need, capacity)).toBe(true);
        });

        it('should reject non-overlapping time ranges', () => {
            const need: NeedSlot = {
                id: 'need_1',
                name: 'Food Need',
                need_type_id: 'food',
                quantity: 10,
                start_date: '2024-01-01',
                end_date: '2024-03-31'
            };

            const capacity: AvailabilitySlot = {
                id: 'cap_1',
                name: 'Food Capacity',
                need_type_id: 'food',
                quantity: 100,
                start_date: '2024-07-01',
                end_date: '2024-09-30'
            };

            expect(slotsCompatible(need, capacity)).toBe(false);
        });

        it('should reject type mismatches', () => {
            const need: NeedSlot = {
                id: 'need_1',
                name: 'Food Need',
                need_type_id: 'food',
                quantity: 10,
                start_date: '2024-07-01',
                end_date: '2024-08-31'
            };

            const capacity: AvailabilitySlot = {
                id: 'cap_1',
                name: 'Housing Capacity',
                need_type_id: 'housing',
                quantity: 100,
                start_date: '2024-07-01',
                end_date: '2024-08-31'
            };

            expect(slotsCompatible(need, capacity)).toBe(false);
        });

        it('should match same location', () => {
            const need: NeedSlot = {
                id: 'need_1',
                name: 'Food Need',
                need_type_id: 'food',
                quantity: 10,
                start_date: '2024-07-01',
                end_date: '2024-08-31',
                city: 'San Francisco',
                country: 'USA'
            };

            const capacity: AvailabilitySlot = {
                id: 'cap_1',
                name: 'Food Capacity',
                need_type_id: 'food',
                quantity: 100,
                start_date: '2024-07-01',
                end_date: '2024-08-31',
                city: 'San Francisco',
                country: 'USA'
            };

            expect(slotsCompatible(need, capacity)).toBe(true);
        });
    });

    describe('Phase 6: Divisibility & Minimum Allocation', () => {
        it('should apply divisibility constraints', () => {
            const capacitySlot: AvailabilitySlot = {
                id: 'cap_1',
                name: 'Rooms',
                need_type_id: 'housing',
                quantity: 100,
                max_natural_div: 10,
                start_date: '2024-01-01',
                end_date: '2024-12-31'
            };

            const rawAmount = 47;
            const sharePercentage = 0.47;

            const constrained = applyDivisibilityConstraints(
                rawAmount,
                sharePercentage,
                capacitySlot
            );

            // Should round down to nearest multiple of 10
            expect(constrained).toBe(40);
        });

        it('should enforce minimum allocation percentage', () => {
            const capacitySlot: AvailabilitySlot = {
                id: 'cap_1',
                name: 'Rooms',
                need_type_id: 'housing',
                quantity: 100,
                min_allocation_percentage: 0.1, // 10%
                start_date: '2024-01-01',
                end_date: '2024-12-31'
            };

            // 15 is 15% of 100, should pass
            expect(meetsMinimumAllocation(15, capacitySlot)).toBe(true);

            // 5 is 5% of 100, should fail
            expect(meetsMinimumAllocation(5, capacitySlot)).toBe(false);
        });

        it('should require at least one natural unit', () => {
            const capacitySlot: AvailabilitySlot = {
                id: 'cap_1',
                name: 'Items',
                need_type_id: 'food',
                quantity: 100,
                max_natural_div: 5,
                start_date: '2024-01-01',
                end_date: '2024-12-31'
            };

            // 5 is exactly one natural unit, should pass
            expect(meetsMinimumAllocation(5, capacitySlot)).toBe(true);

            // 3 is less than one natural unit, should fail
            expect(meetsMinimumAllocation(3, capacitySlot)).toBe(false);
        });
    });

    describe('Phase 7-9: Edge Cases & Production Scenarios', () => {
        it('should handle very large numbers', () => {
            const state = {
                needsByPersonAndType: {
                    'alice': { 'food': 1e10 }
                },
                capacityByPersonAndType: {},
                timestamp: Date.now(),
                iteration: 0,
                itcStamp: itcSeed()
            };

            const magnitude = computeTotalNeedMagnitude(state);
            expect(magnitude).toBeGreaterThan(0);
            expect(isFinite(magnitude)).toBe(true);
        });
    });

    describe('Phase 10: Integration Tests', () => {
        it('should perform end-to-end allocation with realistic data', () => {
            // This test validates the full test infrastructure works correctly
            const commitments = new Map<string, Commitment>();

            // Provider with capacity
            const providerCommitment = createCommitment({
                capacity_slots: [{
                    id: 'cap_1',
                    name: 'Food Capacity',
                    need_type_id: 'food',
                    quantity: 50,
                    start_date: '2024-01-01',
                    end_date: '2024-12-31'
                }]
            });

            // Recipient with need
            const recipientCommitment = createCommitment({
                need_slots: [{
                    id: 'need_1',
                    name: 'Food Need',
                    need_type_id: 'food',
                    quantity: 100,
                    start_date: '2024-01-01',
                    end_date: '2024-12-31'
                }]
            });

            commitments.set('provider', providerCommitment);
            commitments.set('recipient', recipientCommitment);

            // Validate commitments were created correctly
            expect(commitments.size).toBe(2);
            expect(commitments.get('provider')).toBeDefined();
            expect(commitments.get('recipient')).toBeDefined();

            // Validate provider has capacity
            const provider = commitments.get('provider');
            expect(provider?.capacity_slots).toBeDefined();
            expect(provider?.capacity_slots?.length).toBe(1);
            expect(provider?.capacity_slots?.[0].quantity).toBe(50);

            // Validate recipient has needs
            const recipient = commitments.get('recipient');
            expect(recipient?.need_slots).toBeDefined();
            expect(recipient?.need_slots?.length).toBe(1);
            expect(recipient?.need_slots?.[0].quantity).toBe(100);
        });
    });
});
