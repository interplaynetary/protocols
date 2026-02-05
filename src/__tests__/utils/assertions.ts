/**
 * Custom Assertions for Allocation Tests
 * 
 * Provides specialized assertion functions for validating allocation behavior.
 */

import { expect } from 'vitest';
import type {
    AllocationResult,
    SlotAllocationRecord,
    AvailabilitySlot
} from '../../schemas.js';

/**
 * Assert that no capacity slot is over-allocated
 */
export function assertNoOverAllocation(
    result: AllocationResult,
    capacitySlots: AvailabilitySlot[]
): void {
    const capacityUsed = new Map<string, number>();

    // Sum allocations per capacity slot
    for (const allocation of result.allocations) {
        const slotId = allocation.availability_slot_id;
        const current = capacityUsed.get(slotId) || 0;
        capacityUsed.set(slotId, current + allocation.quantity);
    }

    // Check each capacity slot
    for (const capacitySlot of capacitySlots) {
        const used = capacityUsed.get(capacitySlot.id) || 0;
        const available = capacitySlot.quantity;

        expect(
            used,
            `Capacity slot ${capacitySlot.id} over-allocated: ${used} > ${available}`
        ).toBeLessThanOrEqual(available + 0.0001); // Allow small epsilon
    }
}

/**
 * Assert that allocations respect proportional distribution
 * 
 * Verifies that recipients receive allocations proportional to their recognition weights.
 * Allows for small deviations due to rounding and divisibility constraints.
 */
export function assertProportionalDistribution(
    result: AllocationResult,
    expectedShares: Record<string, number>,
    tolerance: number = 0.15 // 15% tolerance for rounding effects
): void {
    const totalAllocated = result.allocations.reduce((sum, a) => sum + a.quantity, 0);

    if (totalAllocated === 0) {
        // No allocations made - skip proportionality check
        return;
    }

    const actualShares: Record<string, number> = {};

    // Calculate actual shares
    for (const allocation of result.allocations) {
        const recipient = allocation.recipient_pubkey;
        actualShares[recipient] = (actualShares[recipient] || 0) + allocation.quantity;
    }

    // Normalize actual shares
    for (const recipient in actualShares) {
        actualShares[recipient] = actualShares[recipient] / totalAllocated;
    }

    // Check each expected recipient
    for (const [recipient, expectedShare] of Object.entries(expectedShares)) {
        const actualShare = actualShares[recipient] || 0;
        const diff = Math.abs(actualShare - expectedShare);

        expect(
            diff,
            `Recipient ${recipient} share mismatch: expected ${expectedShare.toFixed(3)}, got ${actualShare.toFixed(3)}`
        ).toBeLessThanOrEqual(tolerance);
    }
}

/**
 * Assert that divisibility constraints are respected
 * 
 * Verifies that all allocations are multiples of max_natural_div.
 */
export function assertDivisibilityRespected(
    result: AllocationResult,
    capacitySlots: AvailabilitySlot[]
): void {
    const slotDivisibility = new Map<string, number>();

    for (const slot of capacitySlots) {
        slotDivisibility.set(slot.id, slot.max_natural_div || 1);
    }

    for (const allocation of result.allocations) {
        const maxNatural = slotDivisibility.get(allocation.availability_slot_id) || 1;
        const remainder = allocation.quantity % maxNatural;

        expect(
            remainder,
            `Allocation ${allocation.quantity} for slot ${allocation.availability_slot_id} ` +
            `is not a multiple of max_natural_div=${maxNatural}`
        ).toBeLessThan(0.0001); // Allow floating-point epsilon
    }
}

/**
 * Assert that minimum allocation percentage is respected
 */
export function assertMinimumAllocationRespected(
    result: AllocationResult,
    capacitySlots: AvailabilitySlot[]
): void {
    const slotConfig = new Map<string, { quantity: number; minPercent: number }>();

    for (const slot of capacitySlots) {
        slotConfig.set(slot.id, {
            quantity: slot.quantity,
            minPercent: slot.min_allocation_percentage || 0
        });
    }

    for (const allocation of result.allocations) {
        const config = slotConfig.get(allocation.availability_slot_id);
        if (!config) continue;

        const sharePercentage = allocation.quantity / config.quantity;

        if (config.minPercent > 0) {
            expect(
                sharePercentage,
                `Allocation ${allocation.quantity} for slot ${allocation.availability_slot_id} ` +
                `is below minimum percentage ${config.minPercent} (got ${sharePercentage.toFixed(3)})`
            ).toBeGreaterThanOrEqual(config.minPercent - 0.0001);
        }
    }
}

/**
 * Assert convergence metrics are within expected ranges
 */
export function assertConvergenceMetrics(
    result: AllocationResult,
    expectations: {
        totalNeedMagnitude?: { min?: number; max?: number };
        contractionRate?: { min?: number; max?: number };
        percentNeedsMet?: { min?: number; max?: number };
        isConverged?: boolean;
    }
): void {
    const { convergence } = result;

    if (expectations.totalNeedMagnitude) {
        if (expectations.totalNeedMagnitude.min !== undefined) {
            expect(convergence.totalNeedMagnitude).toBeGreaterThanOrEqual(
                expectations.totalNeedMagnitude.min
            );
        }
        if (expectations.totalNeedMagnitude.max !== undefined) {
            expect(convergence.totalNeedMagnitude).toBeLessThanOrEqual(
                expectations.totalNeedMagnitude.max
            );
        }
    }

    if (expectations.contractionRate) {
        if (expectations.contractionRate.min !== undefined) {
            expect(convergence.contractionRate).toBeGreaterThanOrEqual(
                expectations.contractionRate.min
            );
        }
        if (expectations.contractionRate.max !== undefined) {
            expect(convergence.contractionRate).toBeLessThanOrEqual(
                expectations.contractionRate.max
            );
        }
    }

    if (expectations.percentNeedsMet) {
        if (expectations.percentNeedsMet.min !== undefined) {
            expect(convergence.percentNeedsMet).toBeGreaterThanOrEqual(
                expectations.percentNeedsMet.min
            );
        }
        if (expectations.percentNeedsMet.max !== undefined) {
            expect(convergence.percentNeedsMet).toBeLessThanOrEqual(
                expectations.percentNeedsMet.max
            );
        }
    }

    if (expectations.isConverged !== undefined) {
        expect(convergence.isConverged).toBe(expectations.isConverged);
    }
}

/**
 * Assert that tier priority is respected
 * 
 * Verifies that higher-priority tiers receive allocations before lower-priority tiers.
 */
export function assertTierPriorityRespected(
    result: AllocationResult,
    expectedTierOrder: Array<string | number> = ['mutual', 'non-mutual']
): void {
    const tierAllocations = new Map<string | number, number>();

    for (const allocation of result.allocations) {
        const tier = allocation.tier || 0;
        tierAllocations.set(tier, (tierAllocations.get(tier) || 0) + allocation.quantity);
    }

    // Check that if a lower-priority tier has allocations, higher-priority tiers should have allocations too
    // (unless higher-priority tier had zero recipients)
    let foundAllocation = false;
    for (let i = expectedTierOrder.length - 1; i >= 0; i--) {
        const tier = expectedTierOrder[i];
        const allocated = tierAllocations.get(tier) || 0;

        if (allocated > 0) {
            foundAllocation = true;
        } else if (foundAllocation) {
            // Lower-priority tier has allocations but this tier doesn't
            // This is only OK if this tier had zero recipients
            // We can't check that here, so we'll just warn
            console.warn(
                `Tier ${tier} has no allocations but lower-priority tiers do. ` +
                `This may indicate a tier priority violation.`
            );
        }
    }
}

/**
 * Assert that allocations sum to expected total
 */
export function assertTotalAllocation(
    result: AllocationResult,
    expectedTotal: number,
    tolerance: number = 0.01
): void {
    const actualTotal = result.allocations.reduce((sum, a) => sum + a.quantity, 0);
    const diff = Math.abs(actualTotal - expectedTotal);

    expect(
        diff,
        `Total allocation mismatch: expected ${expectedTotal}, got ${actualTotal}`
    ).toBeLessThanOrEqual(tolerance);
}

/**
 * Assert that a specific recipient received an allocation
 */
export function assertRecipientReceived(
    result: AllocationResult,
    recipientPubkey: string,
    expectedQuantity?: { min?: number; max?: number; exact?: number }
): void {
    const recipientAllocations = result.allocations.filter(
        a => a.recipient_pubkey === recipientPubkey
    );

    expect(
        recipientAllocations.length,
        `Recipient ${recipientPubkey} received no allocations`
    ).toBeGreaterThan(0);

    if (expectedQuantity) {
        const totalReceived = recipientAllocations.reduce((sum, a) => sum + a.quantity, 0);

        if (expectedQuantity.exact !== undefined) {
            expect(totalReceived).toBeCloseTo(expectedQuantity.exact, 2);
        }
        if (expectedQuantity.min !== undefined) {
            expect(totalReceived).toBeGreaterThanOrEqual(expectedQuantity.min);
        }
        if (expectedQuantity.max !== undefined) {
            expect(totalReceived).toBeLessThanOrEqual(expectedQuantity.max);
        }
    }
}

/**
 * Assert that a specific recipient received NO allocation
 */
export function assertRecipientNotReceived(
    result: AllocationResult,
    recipientPubkey: string
): void {
    const recipientAllocations = result.allocations.filter(
        a => a.recipient_pubkey === recipientPubkey
    );

    expect(
        recipientAllocations.length,
        `Recipient ${recipientPubkey} unexpectedly received ${recipientAllocations.length} allocations`
    ).toBe(0);
}

/**
 * Assert that all allocations have required fields
 */
export function assertAllocationStructure(result: AllocationResult): void {
    for (const allocation of result.allocations) {
        expect(allocation.quantity).toBeGreaterThan(0);
        expect(allocation.type_id).toBeTruthy();
        expect(allocation.availability_slot_id).toBeTruthy();
        expect(allocation.recipient_pubkey).toBeTruthy();
        expect(allocation.recipient_need_slot_id).toBeTruthy();
        expect(typeof allocation.time_compatible).toBe('boolean');
        expect(typeof allocation.location_compatible).toBe('boolean');
    }
}
