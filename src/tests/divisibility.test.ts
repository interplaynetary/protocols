/**
 * Tests for Divisibility Constraint Functions
 * 
 * Tests the helper functions that apply divisibility constraints to allocations:
 * - applyDivisibilityConstraints
 * - meetsMinimumAllocation
 * - redistributeRemainders (tested indirectly via allocation tests)
 */

import { describe, it, expect } from 'vitest';
import {
    applyDivisibilityConstraints,
    meetsMinimumAllocation
} from '../allocation.js';
import type { AvailabilitySlot } from '../schemas.js';

// Helper to create a mock capacity slot
function createCapacitySlot(
    quantity: number,
    max_natural_div?: number,
    min_allocation_percentage?: number
): AvailabilitySlot {
    return {
        id: 'test-slot',
        need_type_id: 'test-type',
        quantity,
        max_natural_div,
        min_allocation_percentage,
        start_date: '2024-01-01',
        end_date: '2024-12-31'
    } as AvailabilitySlot;
}

describe('Divisibility Constraint Functions', () => {

    describe('applyDivisibilityConstraints', () => {

        it('should round down to natural units', () => {
            const slot = createCapacitySlot(100, 10); // Units of 10
            const rawQuantity = 47;
            const sharePercentage = 0.47;

            const result = applyDivisibilityConstraints(rawQuantity, sharePercentage, slot);

            // Should round down to 40 (4 units of 10)
            expect(result).toBe(40);
        });

        it('should handle exact multiples of natural units', () => {
            const slot = createCapacitySlot(100, 5); // Units of 5
            const rawQuantity = 60;
            const sharePercentage = 0.60;

            const result = applyDivisibilityConstraints(rawQuantity, sharePercentage, slot);

            // Should stay at 60 (12 units of 5)
            expect(result).toBe(60);
        });

        it('should reject allocations below minimum percentage', () => {
            const slot = createCapacitySlot(100, 1, 0.10); // Min 10%
            const rawQuantity = 5;
            const sharePercentage = 0.05; // Only 5%

            const result = applyDivisibilityConstraints(rawQuantity, sharePercentage, slot);

            // Should be rejected (0) because 5% < 10% minimum
            expect(result).toBe(0);
        });

        it('should allow allocations at or above minimum percentage', () => {
            const slot = createCapacitySlot(100, 1, 0.10); // Min 10%
            const rawQuantity = 15;
            const sharePercentage = 0.15; // 15%

            const result = applyDivisibilityConstraints(rawQuantity, sharePercentage, slot);

            // Should be allowed (15 >= 10% minimum)
            expect(result).toBe(15);
        });

        it('should combine natural unit rounding with minimum percentage', () => {
            const slot = createCapacitySlot(100, 5, 0.10); // Units of 5, min 10%
            const rawQuantity = 12;
            const sharePercentage = 0.12; // 12%

            const result = applyDivisibilityConstraints(rawQuantity, sharePercentage, slot);

            // Should round down to 10 (2 units of 5) and still meet 10% minimum
            expect(result).toBe(10);
        });

        it('should handle zero natural divisor (default to 1)', () => {
            const slot = createCapacitySlot(100); // No max_natural_div specified
            const rawQuantity = 47.8;
            const sharePercentage = 0.478;

            const result = applyDivisibilityConstraints(rawQuantity, sharePercentage, slot);

            // Should round down to 47 (default unit size = 1)
            expect(result).toBe(47);
        });

        it('should handle very small values', () => {
            const slot = createCapacitySlot(1, 0.1); // Units of 0.1
            const rawQuantity = 0.37;
            const sharePercentage = 0.37;

            const result = applyDivisibilityConstraints(rawQuantity, sharePercentage, slot);

            // Should round down to 0.3 (3 units of 0.1)
            expect(result).toBeCloseTo(0.3, 1);
        });

        it('should handle edge case: exactly at minimum percentage threshold', () => {
            const slot = createCapacitySlot(100, 1, 0.10); // Min 10%
            const rawQuantity = 10;
            const sharePercentage = 0.10; // Exactly 10%

            const result = applyDivisibilityConstraints(rawQuantity, sharePercentage, slot);

            // Should be allowed (exactly at threshold)
            expect(result).toBe(10);
        });

        it('should handle zero allocation', () => {
            const slot = createCapacitySlot(100, 10);
            const rawQuantity = 0;
            const sharePercentage = 0;

            const result = applyDivisibilityConstraints(rawQuantity, sharePercentage, slot);

            expect(result).toBe(0);
        });
    });

    describe('meetsMinimumAllocation', () => {

        it('should require at least one natural unit', () => {
            const slot = createCapacitySlot(100, 10); // Units of 10

            expect(meetsMinimumAllocation(10, slot)).toBe(true);
            expect(meetsMinimumAllocation(9, slot)).toBe(false);
            expect(meetsMinimumAllocation(0, slot)).toBe(false);
        });

        it('should enforce minimum percentage when specified', () => {
            const slot = createCapacitySlot(100, 1, 0.10); // Min 10%

            expect(meetsMinimumAllocation(10, slot)).toBe(true);  // 10% - meets threshold
            expect(meetsMinimumAllocation(9, slot)).toBe(false);  // 9% - below threshold
            expect(meetsMinimumAllocation(15, slot)).toBe(true);  // 15% - above threshold
        });

        it('should accept any allocation >= 1 natural unit when no min percentage', () => {
            const slot = createCapacitySlot(100, 5); // Units of 5, no min percentage

            expect(meetsMinimumAllocation(5, slot)).toBe(true);   // 5% - OK
            expect(meetsMinimumAllocation(10, slot)).toBe(true);  // 10% - OK
            expect(meetsMinimumAllocation(4, slot)).toBe(false);  // < 1 unit - not OK
        });

        it('should handle edge case: exactly at minimum percentage', () => {
            const slot = createCapacitySlot(100, 1, 0.10); // Min 10%

            expect(meetsMinimumAllocation(10, slot)).toBe(true);
        });

        it('should handle very small allocations with small natural units', () => {
            const slot = createCapacitySlot(1, 0.1, 0.05); // Units of 0.1, min 5%

            expect(meetsMinimumAllocation(0.1, slot)).toBe(true);  // 10% - meets threshold
            expect(meetsMinimumAllocation(0.05, slot)).toBe(false); // 5% - at threshold but < 1 natural unit
            expect(meetsMinimumAllocation(0.04, slot)).toBe(false); // 4% - below threshold
        });

        it('should handle zero allocation', () => {
            const slot = createCapacitySlot(100, 10);

            expect(meetsMinimumAllocation(0, slot)).toBe(false);
        });

        it('should handle allocation equal to total capacity', () => {
            const slot = createCapacitySlot(100, 10);

            expect(meetsMinimumAllocation(100, slot)).toBe(true);
        });

        it('should handle floating point precision issues', () => {
            const slot = createCapacitySlot(100, 1, 0.10); // Min 10%

            // 9.9999 should be treated as ~10 (within epsilon)
            expect(meetsMinimumAllocation(9.9999, slot)).toBe(true);
        });
    });

    describe('Integration: Divisibility Constraints in Allocation', () => {

        it('should apply both constraints together correctly', () => {
            const slot = createCapacitySlot(100, 5, 0.15); // Units of 5, min 15%

            // Test various scenarios
            const scenarios = [
                { raw: 17, share: 0.17, expected: 15 },  // Rounds to 15, meets 15% min
                { raw: 14, share: 0.14, expected: 0 },   // Would round to 10, but < 15% min
                { raw: 20, share: 0.20, expected: 20 },  // Exact multiple, meets min
                { raw: 7, share: 0.07, expected: 0 },    // Too small
            ];

            for (const scenario of scenarios) {
                const result = applyDivisibilityConstraints(
                    scenario.raw,
                    scenario.share,
                    slot
                );
                expect(result).toBe(scenario.expected);
            }
        });
    });
});
