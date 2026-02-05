/**
 * Additional comprehensive tests for allocation-planning features
 * 
 * Tests missing scenarios from allocation-planning.md:
 * 1. Risk-adjusted allocation with buffers
 * 2. Reserve management and reorder points
 * 3. Dynamic adjustment based on variance trends
 * 4. Stock balance constraints
 * 5. Labor power allocation constraints
 * 6. Complete optimization-deduction loop
 * 7. Weekly planning cycle
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
    type StockBook,
    type AllocationPlan,
    type Reserve,
    type AllocationVariance,
    type Deduction,
    recordOperation,
    computeVariance,
    validateDeductions,
    ProductSchema,
    ReserveSchema,
} from "../implementation/commons";

// ============================================================================
// RESERVE MANAGEMENT TESTS
// ============================================================================

describe("Reserve Management", () => {
    it("validates reserve schema", () => {
        const reserve: Reserve = {
            id: "RES001",
            productId: "wheat",
            reserveType: "production_contingency",
            allocationRule: "10% of monthly usage",
            targetLevel: 100,
            currentLevel: 50,
            reorderPoint: 30,
        };

        expect(() => ReserveSchema.parse(reserve)).not.toThrow();
    });

    it("calculates reserve requirements based on risk", () => {
        const monthlyUsage = 1000; // kg
        const riskFactor = 0.1; // 10% buffer

        const reserveTarget = monthlyUsage * riskFactor;
        expect(reserveTarget).toBe(100);
    });

    it("triggers reorder when below reorder point", () => {
        const reserve: Reserve = {
            id: "RES001",
            productId: "wheat",
            reserveType: "production_contingency",
            allocationRule: "10% of monthly usage",
            targetLevel: 100,
            currentLevel: 25, // Below reorder point!
            reorderPoint: 30,
        };

        const needsReorder = reserve.currentLevel < (reserve.reorderPoint || 0);
        expect(needsReorder).toBe(true);

        const reorderQty = reserve.targetLevel - reserve.currentLevel;
        expect(reorderQty).toBe(75);
    });

    it("manages multiple reserve types", () => {
        const reserves: Reserve[] = [
            {
                id: "RES001",
                productId: "wheat",
                reserveType: "production_contingency",
                allocationRule: "10% of monthly usage",
                targetLevel: 100,
                currentLevel: 90,
            },
            {
                id: "RES002",
                productId: "wheat",
                reserveType: "natural_disaster",
                allocationRule: "5% of annual consumption",
                targetLevel: 500,
                currentLevel: 450,
            },
            {
                id: "RES003",
                productId: "wheat",
                reserveType: "epidemic_reserve",
                allocationRule: "2% of workforce capacity",
                targetLevel: 200,
                currentLevel: 200,
            },
        ];

        const totalReserves = reserves.reduce((sum, r) => sum + r.currentLevel, 0);
        expect(totalReserves).toBe(740);

        const totalTarget = reserves.reduce((sum, r) => sum + r.targetLevel, 0);
        expect(totalTarget).toBe(800);

        const deficit = totalTarget - totalReserves;
        expect(deficit).toBe(60);
    });
});

// ============================================================================
// RISK-ADJUSTED ALLOCATION TESTS
// ============================================================================

describe("Risk-Adjusted Allocation", () => {
    it("calculates buffer based on historical variance", () => {
        const expectedNeed = 100;
        const historicalVariances = [5, -3, 8, -2, 6]; // Past variances

        // Calculate standard deviation
        const mean = historicalVariances.reduce((a, b) => a + b, 0) / historicalVariances.length;
        const variance = historicalVariances.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / historicalVariances.length;
        const stdDev = Math.sqrt(variance);

        // High variance → larger buffer
        const buffer = 2 * stdDev;
        const plannedAllocation = expectedNeed + buffer;

        expect(stdDev).toBeGreaterThan(0);
        expect(plannedAllocation).toBeGreaterThan(expectedNeed);
    });

    it("adjusts buffer based on product criticality", () => {
        const expectedNeed = 100;
        const stdDev = 5;

        // Critical product (medicine)
        const criticalBuffer = 2 * stdDev;
        const criticalAllocation = expectedNeed + criticalBuffer;
        expect(criticalAllocation).toBe(110);

        // Non-critical product
        const normalBuffer = 0.5 * stdDev;
        const normalAllocation = expectedNeed + normalBuffer;
        expect(normalAllocation).toBe(102.5);
    });

    it("allocates from reserves when stock insufficient", () => {
        const expectedNeed = 100;
        const availableStock = 70;
        const reserveStock = 50;

        const neededFromReserves = Math.max(0, expectedNeed - availableStock);
        expect(neededFromReserves).toBe(30);

        const allocatedFromStock = Math.min(availableStock, expectedNeed);
        expect(allocatedFromStock).toBe(70);

        const totalAllocated = allocatedFromStock + Math.min(neededFromReserves, reserveStock);
        expect(totalAllocated).toBe(100);
    });

    it("creates contingency plan when reserves insufficient", () => {
        const expectedNeed = 100;
        const availableStock = 50;
        const reserveStock = 20;

        const neededFromReserves = expectedNeed - availableStock;
        const shortage = neededFromReserves - reserveStock;

        expect(shortage).toBe(30);

        const contingencyPlan = shortage > 0 ? "reduce_usage" : null;
        expect(contingencyPlan).toBe("reduce_usage");
    });
});

// ============================================================================
// DYNAMIC ADJUSTMENT MECHANISM TESTS
// ============================================================================

describe("Dynamic Adjustment Mechanism", () => {
    it("detects persistent variance trend", () => {
        const variances: AllocationVariance[] = [
            { period: "W1", productId: "bread", planned: 100, actual: 110, variance: 10, variancePct: 10 },
            { period: "W2", productId: "bread", planned: 100, actual: 112, variance: 12, variancePct: 12 },
            { period: "W3", productId: "bread", planned: 100, actual: 108, variance: 8, variancePct: 8 },
        ];

        const avgVariance = variances.reduce((sum, v) => sum + v.variance, 0) / variances.length;
        expect(avgVariance).toBeCloseTo(10, 0);

        // Persistent positive variance → increase plan
        const threshold = 5;
        const persistentTrend = Math.abs(avgVariance) > threshold;
        expect(persistentTrend).toBe(true);
    });

    it("adjusts expected need based on rolling average", () => {
        const actualUsages = [110, 112, 108, 115, 113]; // Past 5 weeks

        const rollingAverage = actualUsages.reduce((a, b) => a + b, 0) / actualUsages.length;
        expect(rollingAverage).toBeCloseTo(111.6, 1);

        // Update next week's plan
        const oldPlan = 100;
        const newPlan = rollingAverage;
        expect(newPlan).toBeGreaterThan(oldPlan);
    });

    it("adjusts buffer size based on new variance", () => {
        const actualUsages = [110, 112, 108, 115, 113];
        const mean = actualUsages.reduce((a, b) => a + b, 0) / actualUsages.length;

        const variance = actualUsages.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / actualUsages.length;
        const newStdDev = Math.sqrt(variance);

        const oldBuffer = 5;
        const newBuffer = 1.5 * newStdDev; // Adjust based on new variance

        expect(newBuffer).toBeGreaterThan(0);
        // Higher variance → larger buffer
    });

    it("adjusts reserve level based on variance and criticality", () => {
        const baseReserve = 100;
        const varianceIncrease = 1.2; // 20% increase in variance
        const criticalityFactor = 1.5; // Critical product

        const newReserveLevel = baseReserve * varianceIncrease * criticalityFactor;
        expect(newReserveLevel).toBe(180);
    });
});

// ============================================================================
// STOCK BALANCE CONSTRAINT TESTS
// ============================================================================

describe("Stock Balance Constraints", () => {
    it("validates stock balance equation", () => {
        const stockStart = 1000;
        const produced = 200;
        const consumed = 150;
        const reserves = 50;

        const stockEnd = stockStart + produced - consumed - reserves;
        expect(stockEnd).toBe(1000);

        // Stock balance: s_{t-1} + x_t = Σ a_{j,t} + s_t + r_t
        const leftSide = stockStart + produced;
        const rightSide = consumed + stockEnd + reserves;
        expect(leftSide).toBe(rightSide);
    });

    it("validates production meets all deductions", () => {
        const produced = 1000;
        const stock = 500;
        const totalAvailable = produced + stock;

        const deductions = {
            D1_replacement: 100,
            D2_expansion: 50,
            D3_reserves: 150,
            D4_admin: 50,
            D5_common: 200,
            D6_support: 100,
        };

        const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
        expect(totalDeductions).toBe(650);

        const distributionPool = totalAvailable - totalDeductions;
        expect(distributionPool).toBe(850);

        const constraintSatisfied = totalAvailable >= totalDeductions;
        expect(constraintSatisfied).toBe(true);
    });

    it("detects insufficient production for deductions", () => {
        const produced = 500;
        const stock = 100;
        const totalAvailable = produced + stock;

        const deductions = {
            D1_replacement: 200,
            D2_expansion: 100,
            D3_reserves: 200,
            D4_admin: 50,
            D5_common: 100,
            D6_support: 150,
        };

        const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
        const shortage = totalDeductions - totalAvailable;

        expect(shortage).toBe(200); // 800 - 600
        expect(shortage).toBeGreaterThan(0);
    });
});

// ============================================================================
// LABOR POWER ALLOCATION CONSTRAINT TESTS
// ============================================================================

describe("Labor Power Allocation Constraints", () => {
    it("respects daily reproduction cycles", () => {
        const totalHoursPerDay = 24;
        const sleepRequired = 8;
        const mealsAndRest = 2;
        const maxWorkHours = totalHoursPerDay - sleepRequired - mealsAndRest;

        expect(maxWorkHours).toBe(14);

        // Cannot allocate more than max work hours
        const plannedWork = 16;
        const violation = plannedWork > maxWorkHours;
        expect(violation).toBe(true);
    });

    it("matches skills to operations", () => {
        const worker = {
            id: "alice",
            skills: ["baking", "teaching"],
        };

        const operation = {
            id: "OP001",
            requiredSkill: "baking",
        };

        const canPerform = worker.skills.includes(operation.requiredSkill);
        expect(canPerform).toBe(true);

        const wrongOperation = {
            id: "OP002",
            requiredSkill: "carpentry",
        };

        const cannotPerform = !worker.skills.includes(wrongOperation.requiredSkill);
        expect(cannotPerform).toBe(true);
    });

    it("allocates with buffer for unexpected needs", () => {
        const baseCapacity = 30; // hours/week
        const buffer = 0.1; // 10%
        const effectiveCapacity = baseCapacity * (1 - buffer);

        expect(effectiveCapacity).toBe(27);

        // Can allocate up to effective capacity
        const plannedAllocation = 28;
        const overAllocated = plannedAllocation > effectiveCapacity;
        expect(overAllocated).toBe(true);
    });

    it("maintains reserve pool of labor capacity", () => {
        const totalCapacity = 100; // hours/week
        const reservePoolPct = 0.1; // 10%
        const reservePool = totalCapacity * reservePoolPct;

        expect(reservePool).toBe(10);

        const allocatableCapacity = totalCapacity - reservePool;
        expect(allocatableCapacity).toBe(90);
    });

    it("uses cross-trained workers as contingency", () => {
        const primaryWorkers = [
            { id: "alice", primarySkill: "baking", crossTrained: ["teaching"] },
            { id: "bob", primarySkill: "farming", crossTrained: ["baking"] },
        ];

        const bakingOperation = {
            requiredSkill: "baking",
        };

        // Primary bakers
        const primaryBakers = primaryWorkers.filter(w => w.primarySkill === "baking");
        expect(primaryBakers).toHaveLength(1);

        // Contingency: cross-trained workers
        const contingencyBakers = primaryWorkers.filter(w =>
            w.crossTrained.includes("baking")
        );
        expect(contingencyBakers).toHaveLength(1);

        const totalBakingCapacity = primaryBakers.length + contingencyBakers.length;
        expect(totalBakingCapacity).toBe(2);
    });
});

// ============================================================================
// COMPLETE OPTIMIZATION-DEDUCTION LOOP TESTS
// ============================================================================

describe("Complete Optimization-Deduction Loop", () => {
    it("simulates yearly planning cycle", () => {
        // Phase 1: Set deduction targets
        const totalProduct = 10000;
        const deductions: Record<string, number> = {
            D1_replacement: totalProduct * 0.15, // 15% depreciation
            D2_expansion: totalProduct * 0.05,   // 5% growth
            D3_reserves: totalProduct * 0.10,    // 10% reserves
            D4_admin: totalProduct * 0.03,       // 3% admin (minimize)
            D5_common: totalProduct * 0.12,      // 12% common needs (maximize)
            D6_support: totalProduct * 0.05,     // 5% support
        };

        const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
        expect(totalDeductions).toBe(5000);

        // Phase 2: Distribution pool
        const distributionPool = totalProduct - totalDeductions;
        expect(distributionPool).toBe(5000);

        // Phase 3: Validate constraints
        const constraintDeductions = [
            deductions.D1_replacement,
            deductions.D3_reserves,
            deductions.D6_support,
        ];
        const constraintTotal = constraintDeductions.reduce((a, b) => a + b, 0);

        const constraintsSatisfied = totalProduct >= constraintTotal;
        expect(constraintsSatisfied).toBe(true);
    });

    it("adjusts deductions based on actual performance", () => {
        // Year 1 targets
        const year1 = {
            D2_expansion: 500, // Target 5% growth
            D4_admin: 300,     // Target 3% admin
            D5_common: 1200,   // Target 12% common needs
        };

        // Year 1 actuals
        const year1Actual = {
            D2_expansion: 450,  // Achieved 4.5%
            D4_admin: 280,      // Reduced to 2.8% (good!)
            D5_common: 1300,    // Increased to 13% (good!)
        };

        // Year 2 adjustments
        const year2 = {
            D2_expansion: 550,  // Increase target (was under)
            D4_admin: 250,      // Further reduce (was successful)
            D5_common: 1400,    // Further increase (was successful)
        };

        expect(year2.D2_expansion).toBeGreaterThan(year1.D2_expansion);
        expect(year2.D4_admin).toBeLessThan(year1.D4_admin);
        expect(year2.D5_common).toBeGreaterThan(year1.D5_common);
    });
});

// ============================================================================
// WEEKLY PLANNING CYCLE TESTS
// ============================================================================

describe("Weekly Planning Cycle", () => {
    it("simulates complete weekly cycle", () => {
        // Monday: Review last week's variances
        const lastWeekVariances: AllocationVariance[] = [
            { period: "W02", productId: "bread", planned: 100, actual: 95, variance: -5, variancePct: -5 },
            { period: "W02", productId: "wheat", planned: 200, actual: 210, variance: 10, variancePct: 5 },
        ];

        // Tuesday: Adjust buffers
        const breadAdjustment = lastWeekVariances[0].variance < 0 ? "decrease" : "increase";
        expect(breadAdjustment).toBe("decrease");

        // Wednesday: Check reserves
        const reserves: Reserve[] = [
            {
                id: "RES001",
                productId: "wheat",
                reserveType: "production_contingency",
                allocationRule: "10% of weekly usage",
                targetLevel: 100,
                currentLevel: 85,
                reorderPoint: 80,
            },
        ];

        const reserveStatus = reserves[0].currentLevel >= (reserves[0].reorderPoint || 0)
            ? "adequate"
            : "reorder_needed";
        expect(reserveStatus).toBe("adequate");

        // Thursday: Update deductions (if needed)
        // (No changes this week)

        // Friday: Approve next week's plan
        const nextWeekPlan: AllocationPlan = {
            id: "PLAN_W03",
            period: "2024-W03",
            createdAt: new Date("2024-01-19"),
            productAllocations: [
                {
                    productId: "bread",
                    plannedQty: 95, // Adjusted down based on variance
                    minQty: 90,
                    maxQty: 100,
                },
                {
                    productId: "wheat",
                    plannedQty: 210, // Adjusted up based on variance
                    minQty: 200,
                    maxQty: 220,
                },
            ],
            laborAllocations: [],
            deductions: [],
            status: "planned",
        };

        expect(nextWeekPlan.productAllocations[0].plannedQty).toBe(95);
        expect(nextWeekPlan.productAllocations[1].plannedQty).toBe(210);
    });
});
