/**
 * Comprehensive tests for communal production accounting system
 * 
 * Tests cover:
 * 1. Stock-book recording operations
 * 2. ALT computation from operations
 * 3. Work-type statistics (emergent intensity)
 * 4. Allocation planning and variance tracking
 * 5. Deduction validation
 * 6. Planning objective optimization
 * 7. Complete production cycles
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
    type StockBook,
    type Operation,
    type AllocationPlan,
    type Deduction,
    recordOperation,
    computeALT,
    computeWorkTypeStats,
    computeVariance,
    computePlanningObjective,
    validateDeductions,
    ProductSchema,
    IndividualSchema,
    OperationSchema,
    AllocationPlanSchema,
} from "../implementation/commons";

// ============================================================================
// TEST FIXTURES
// ============================================================================

function createTestStockBook(): StockBook {
    return {
        products: {
            wheat: {
                id: "wheat",
                name: "Wheat",
                unit: "kg",
            },
            bread: {
                id: "bread",
                name: "Bread",
                unit: "loaf",
            },
            oven: {
                id: "oven",
                name: "Oven",
                unit: "unit",
                lifespan: 10000, // hours
            },
        },
        individuals: {
            alice: {
                id: "alice",
                name: "Alice",
                laborPowers: [
                    { type: "baking", hoursPerDay: 8 },
                ],
            },
            bob: {
                id: "bob",
                name: "Bob",
                laborPowers: [
                    { type: "farming", hoursPerDay: 8 },
                ],
            },
        },
        stocks: {
            wheat: {
                productId: "wheat",
                quantity: 1000,
                lastUpdated: new Date("2024-01-01"),
            },
            bread: {
                productId: "bread",
                quantity: 0,
                lastUpdated: new Date("2024-01-01"),
            },
            oven: {
                productId: "oven",
                quantity: 1,
                remainingLife: 10000,
                lastUpdated: new Date("2024-01-01"),
            },
        },
        operations: [],
    };
}

function createBakingOperation(date: Date = new Date("2024-01-15")): Operation {
    return {
        id: "OP001",
        timestamp: date,
        totalSocialTime: 6, // 6 hours total
        description: "Baking bread",
        inputsProducts: [
            {
                productId: "wheat",
                quantity: 20, // 20kg wheat
                alt: 0.3, // 0.3h per kg (from farming)
            },
            {
                productId: "oven",
                quantity: 6 / 10000, // 6 hours of oven use
                alt: 500, // 500h embodied in oven
            },
        ],
        inputsLabor: [
            {
                individualId: "alice",
                hours: 6,
                workType: "baking",
            },
        ],
        outputsProducts: [
            {
                productId: "bread",
                quantity: 40, // 40 loaves
            },
        ],
    };
}

function createFarmingOperation(date: Date = new Date("2024-01-10")): Operation {
    return {
        id: "OP002",
        timestamp: date,
        totalSocialTime: 8,
        description: "Harvesting wheat",
        inputsProducts: [],
        inputsLabor: [
            {
                individualId: "bob",
                hours: 8,
                workType: "farming",
            },
        ],
        outputsProducts: [
            {
                productId: "wheat",
                quantity: 100, // 100kg wheat
            },
        ],
    };
}

function createConsumptionOperation(date: Date = new Date("2024-01-15T18:00")): Operation {
    return {
        id: "OP003",
        timestamp: date,
        totalSocialTime: 0.5,
        description: "Evening meal",
        inputsProducts: [
            {
                productId: "bread",
                quantity: 2,
                alt: 0.35, // computed from baking
            },
        ],
        inputsLabor: [
            {
                individualId: "alice",
                hours: 0.5,
                workType: "eating",
            },
        ],
        outputsProducts: [], // Consumption produces restored labor-power (not tracked here)
    };
}

// ============================================================================
// SCHEMA VALIDATION TESTS
// ============================================================================

describe("Schema Validation", () => {
    it("validates Product schema", () => {
        const product = {
            id: "test",
            name: "Test Product",
            unit: "kg",
            alt: 1.5,
        };

        expect(() => ProductSchema.parse(product)).not.toThrow();
    });

    it("validates Individual schema", () => {
        const individual = {
            id: "test",
            name: "Test Person",
            laborPowers: [
                { type: "carpentry", hoursPerDay: 6 },
            ],
        };

        expect(() => IndividualSchema.parse(individual)).not.toThrow();
    });

    it("validates Operation schema", () => {
        const operation = createBakingOperation();
        expect(() => OperationSchema.parse(operation)).not.toThrow();
    });

    it("rejects invalid operation (negative hours)", () => {
        const invalidOp = {
            ...createBakingOperation(),
            inputsLabor: [
                {
                    individualId: "alice",
                    hours: -5, // Invalid!
                },
            ],
        };

        expect(() => OperationSchema.parse(invalidOp)).toThrow();
    });
});

// ============================================================================
// STOCK-BOOK RECORDING TESTS
// ============================================================================

describe("Stock-Book Recording", () => {
    let stockBook: StockBook;

    beforeEach(() => {
        stockBook = createTestStockBook();
    });

    it("records a baking operation", () => {
        const operation = createBakingOperation();
        const updated = recordOperation(stockBook, operation);

        // Check operation was added
        expect(updated.operations).toHaveLength(1);
        expect(updated.operations[0].id).toBe("OP001");

        // Check stocks updated
        expect(updated.stocks.wheat.quantity).toBe(980); // 1000 - 20
        expect(updated.stocks.bread.quantity).toBe(40); // 0 + 40
    });

    it("records multiple operations in sequence", () => {
        let updated = stockBook;

        // First: farming
        updated = recordOperation(updated, createFarmingOperation());
        expect(updated.stocks.wheat.quantity).toBe(1100); // 1000 + 100

        // Second: baking
        updated = recordOperation(updated, createBakingOperation());
        expect(updated.stocks.wheat.quantity).toBe(1080); // 1100 - 20
        expect(updated.stocks.bread.quantity).toBe(40);

        // Third: consumption
        updated = recordOperation(updated, createConsumptionOperation());
        expect(updated.stocks.bread.quantity).toBe(38); // 40 - 2

        expect(updated.operations).toHaveLength(3);
    });

    it("handles oven depreciation", () => {
        const operation = createBakingOperation();
        const updated = recordOperation(stockBook, operation);

        // Oven was used for 6 hours
        const ovenUsed = 6 / 10000;
        expect(updated.stocks.oven.quantity).toBeCloseTo(1 - ovenUsed, 5);
    });
});

// ============================================================================
// ALT COMPUTATION TESTS
// ============================================================================

describe("ALT Computation", () => {
    it("computes ALT for bread from single operation", () => {
        const operation = createBakingOperation();
        const alt = computeALT("bread", [operation]);

        expect(alt).not.toBeNull();
        expect(alt!.productId).toBe("bread");
        expect(alt!.totalQuantity).toBe(40);

        // Total labor-time:
        // - Direct labor: 6h
        // - Wheat input: 20kg × 0.3h = 6h
        // - Oven input: (6/10000) × 500h = 0.3h
        // Total: 12.3h
        expect(alt!.totalLaborTime).toBeCloseTo(12.3, 1);
        expect(alt!.alt).toBeCloseTo(12.3 / 40, 2); // ~0.3075h per loaf
    });

    it("computes ALT for wheat from farming", () => {
        const operation = createFarmingOperation();
        const alt = computeALT("wheat", [operation]);

        expect(alt).not.toBeNull();
        expect(alt!.totalQuantity).toBe(100);
        expect(alt!.totalLaborTime).toBe(8); // Just direct labor
        expect(alt!.alt).toBe(0.08); // 8h / 100kg
    });

    it("computes rolling average ALT from multiple operations", () => {
        const op1 = createBakingOperation(new Date("2024-01-15"));
        const op2 = {
            ...createBakingOperation(new Date("2024-01-16")),
            id: "OP004",
            inputsLabor: [
                {
                    individualId: "alice",
                    hours: 5, // More efficient!
                    workType: "baking",
                },
            ],
        };

        const alt = computeALT("bread", [op1, op2]);

        expect(alt).not.toBeNull();
        expect(alt!.totalQuantity).toBe(80); // 40 + 40
        // Total LT: (12.3 from op1) + (11.3 from op2) = 23.6
        expect(alt!.totalLaborTime).toBeCloseTo(23.6, 1);
        expect(alt!.alt).toBeCloseTo(23.6 / 80, 2); // ~0.295h per loaf
    });

    it("returns null for product with no operations", () => {
        const alt = computeALT("nonexistent", []);
        expect(alt).toBeNull();
    });
});

// ============================================================================
// WORK-TYPE STATISTICS TESTS
// ============================================================================

describe("Work-Type Statistics (Emergent Intensity)", () => {
    it("computes basic work-type stats", () => {
        const workOps = [
            createBakingOperation(new Date("2024-01-15")),
            {
                ...createBakingOperation(new Date("2024-01-16")),
                id: "OP004",
            },
        ];

        // Simplified: assume reproduction operations
        const reproductionOps = [
            createConsumptionOperation(new Date("2024-01-15T18:00")),
            createConsumptionOperation(new Date("2024-01-16T18:00")),
        ];

        const stats = computeWorkTypeStats("baking", workOps, reproductionOps);

        expect(stats).not.toBeNull();
        expect(stats!.workType).toBe("baking");
        expect(stats!.sampleSize).toBe(2);

        // Total work hours: 6 + 6 = 12
        // Total reproduction hours: 0.5 + 0.5 = 1
        // Avg reproduction per hour: 1 / 12 = 0.083
        expect(stats!.avgReproductionPerHour).toBeCloseTo(0.083, 2);

        // Total output: 40 + 40 = 80 loaves
        // Avg output per hour: 80 / 12 = 6.67
        expect(stats!.avgOutputPerHour).toBeCloseTo(6.67, 1);
    });

    it("returns null for work type with no operations", () => {
        const stats = computeWorkTypeStats("nonexistent", [], []);
        expect(stats).toBeNull();
    });
});

// ============================================================================
// ALLOCATION PLANNING TESTS
// ============================================================================

describe("Allocation Planning", () => {
    it("validates allocation plan schema", () => {
        const plan: AllocationPlan = {
            id: "PLAN001",
            period: "2024-W03",
            createdAt: new Date("2024-01-15"),
            productAllocations: [
                {
                    productId: "bread",
                    plannedQty: 100,
                    minQty: 90,
                    maxQty: 110,
                    uncertaintyBounds: "±10 loaves",
                },
            ],
            laborAllocations: [
                {
                    individualId: "alice",
                    plannedHours: 15,
                    workType: "baking",
                },
            ],
            deductions: [],
            status: "planned",
        };

        expect(() => AllocationPlanSchema.parse(plan)).not.toThrow();
    });

    it("computes variance between planned and actual", () => {
        const plan: AllocationPlan = {
            id: "PLAN001",
            period: "2024-W03",
            createdAt: new Date("2024-01-15"),
            productAllocations: [
                {
                    productId: "bread",
                    operationId: "OP001",
                    plannedQty: 50,
                    minQty: 45,
                    maxQty: 55,
                },
            ],
            laborAllocations: [],
            deductions: [],
            status: "completed",
        };

        const actualOps = [
            createBakingOperation(), // Produces 40 loaves
        ];

        const variances = computeVariance(plan, actualOps);

        expect(variances).toHaveLength(1);
        expect(variances[0].productId).toBe("bread");
        expect(variances[0].planned).toBe(50);
        expect(variances[0].actual).toBe(40);
        expect(variances[0].variance).toBe(-10); // 10 under plan
        expect(variances[0].variancePct).toBe(-20); // 20% under
    });

    it("computes variance for multiple allocations", () => {
        const plan: AllocationPlan = {
            id: "PLAN001",
            period: "2024-W03",
            createdAt: new Date("2024-01-15"),
            productAllocations: [
                {
                    productId: "bread",
                    plannedQty: 50,
                    minQty: 45,
                    maxQty: 55,
                },
                {
                    productId: "wheat",
                    plannedQty: 100,
                    minQty: 90,
                    maxQty: 110,
                },
            ],
            laborAllocations: [],
            deductions: [],
            status: "completed",
        };

        const actualOps = [
            createBakingOperation(), // 40 bread
            createFarmingOperation(), // 100 wheat
        ];

        const variances = computeVariance(plan, actualOps);

        expect(variances).toHaveLength(2);

        const breadVariance = variances.find(v => v.productId === "bread");
        expect(breadVariance?.variance).toBe(-10);

        const wheatVariance = variances.find(v => v.productId === "wheat");
        expect(wheatVariance?.variance).toBe(0); // Exactly as planned!
    });
});

// ============================================================================
// DEDUCTION VALIDATION TESTS
// ============================================================================

describe("Deduction Validation", () => {
    it("validates satisfied deduction constraints", () => {
        const deductions: Deduction[] = [
            {
                type: "D1_replacement",
                allocations: {
                    wheat: 50,
                    bread: 20,
                },
                isConstraint: true,
                minRequired: 50,
            },
        ];

        const available = {
            wheat: 100,
            bread: 30,
        };

        const result = validateDeductions(deductions, available);

        expect(result.valid).toBe(true);
        expect(result.violations).toHaveLength(0);
    });

    it("detects violated deduction constraints", () => {
        const deductions: Deduction[] = [
            {
                type: "D1_replacement",
                allocations: {
                    wheat: 50,
                },
                isConstraint: true,
                minRequired: 50,
            },
            {
                type: "D6_support",
                allocations: {
                    bread: 100,
                },
                isConstraint: true,
                minRequired: 100,
            },
        ];

        const available = {
            wheat: 100, // OK
            bread: 50,  // NOT OK - need 100, have 50
        };

        const result = validateDeductions(deductions, available);

        expect(result.valid).toBe(false);
        expect(result.violations).toHaveLength(1);
        expect(result.violations[0]).toContain("D6_support");
        expect(result.violations[0]).toContain("bread");
    });

    it("ignores objective deductions (not constraints)", () => {
        const deductions: Deduction[] = [
            {
                type: "D2_expansion",
                allocations: {
                    wheat: 200,
                },
                isConstraint: false, // Objective, not constraint
                target: 200,
            },
        ];

        const available = {
            wheat: 50, // Less than target, but it's an objective
        };

        const result = validateDeductions(deductions, available);

        expect(result.valid).toBe(true); // No violations for objectives
    });
});

// ============================================================================
// PLANNING OBJECTIVE TESTS
// ============================================================================

describe("Planning Objective (Maximize Free Time)", () => {
    it("computes free time with no inefficiency", () => {
        const objective = computePlanningObjective(
            24,  // Total time
            16,  // Direct necessary time
            [], // No variances
            [], // No shortages
            1.0, // alpha
            1.0  // beta
        );

        expect(objective.totalTime).toBe(24);
        expect(objective.directTime).toBe(16);
        expect(objective.inefficiencyTime).toBe(0);
        expect(objective.freeTime).toBe(8); // 24 - 16 - 0
    });

    it("computes free time with variance costs", () => {
        const variances = [
            { variance: 10, period: "W1", productId: "bread", planned: 100, actual: 110, variancePct: 10 },
            { variance: -5, period: "W1", productId: "wheat", planned: 100, actual: 95, variancePct: -5 },
        ];

        const objective = computePlanningObjective(
            24,
            16,
            variances,
            [],
            0.01, // alpha (variance weight)
            1.0
        );

        // Variance cost: (10^2 + (-5)^2) = 125
        // Inefficiency: 0.01 × 125 = 1.25
        expect(objective.varianceCost).toBe(125);
        expect(objective.inefficiencyTime).toBe(1.25);
        expect(objective.freeTime).toBe(6.75); // 24 - 16 - 1.25
    });

    it("computes free time with shortage costs", () => {
        const shortages = [20, -10, 5]; // Only positive count

        const objective = computePlanningObjective(
            24,
            16,
            [],
            shortages,
            1.0,
            0.5 // beta (shortage weight)
        );

        // Shortage cost: max(0,20) + max(0,-10) + max(0,5) = 25
        // Inefficiency: 0.5 × 25 = 12.5
        expect(objective.shortageCost).toBe(25);
        expect(objective.inefficiencyTime).toBe(12.5);
        expect(objective.freeTime).toBe(-4.5); // 24 - 16 - 12.5 (negative = overworked!)
    });

    it("computes free time with both variance and shortage", () => {
        const variances = [
            { variance: 10, period: "W1", productId: "bread", planned: 100, actual: 110, variancePct: 10 },
        ];
        const shortages = [15];

        const objective = computePlanningObjective(
            24,
            16,
            variances,
            shortages,
            0.1,  // alpha
            0.5   // beta
        );

        // Variance: 0.1 × 100 = 10
        // Shortage: 0.5 × 15 = 7.5
        // Inefficiency: 17.5
        expect(objective.inefficiencyTime).toBe(17.5);
        expect(objective.freeTime).toBe(-9.5); // Severely overworked!
    });
});

// ============================================================================
// COMPLETE PRODUCTION CYCLE SIMULATION
// ============================================================================

describe("Complete Production Cycle Simulation", () => {
    it("simulates a week of bread production", () => {
        let stockBook = createTestStockBook();

        // Monday: Farm wheat
        const monday = new Date("2024-01-15");
        stockBook = recordOperation(stockBook, createFarmingOperation(monday));

        // Tuesday: Bake bread
        const tuesday = new Date("2024-01-16");
        stockBook = recordOperation(stockBook, createBakingOperation(tuesday));

        // Wednesday: Consume bread
        const wednesday = new Date("2024-01-17");
        stockBook = recordOperation(stockBook, createConsumptionOperation(wednesday));

        // Check final state
        expect(stockBook.operations).toHaveLength(3);
        expect(stockBook.stocks.wheat.quantity).toBe(1080); // 1000 + 100 - 20
        expect(stockBook.stocks.bread.quantity).toBe(38); // 0 + 40 - 2

        // Compute ALTs
        const breadALT = computeALT("bread", stockBook.operations);
        expect(breadALT).not.toBeNull();
        expect(breadALT!.alt).toBeGreaterThan(0);

        const wheatALT = computeALT("wheat", stockBook.operations);
        expect(wheatALT).not.toBeNull();
        expect(wheatALT!.alt).toBe(0.08); // 8h / 100kg
    });

    it("simulates planning cycle with variance adjustment", () => {
        let stockBook = createTestStockBook();

        // Create initial plan
        const plan: AllocationPlan = {
            id: "PLAN_W03",
            period: "2024-W03",
            createdAt: new Date("2024-01-14"),
            productAllocations: [
                {
                    productId: "bread",
                    plannedQty: 50,
                    minQty: 45,
                    maxQty: 55,
                },
            ],
            laborAllocations: [
                {
                    individualId: "alice",
                    plannedHours: 8,
                    workType: "baking",
                },
            ],
            deductions: [
                {
                    type: "D1_replacement",
                    allocations: { wheat: 10 },
                    isConstraint: true,
                    minRequired: 10,
                },
            ],
            status: "planned",
        };

        // Execute operations
        stockBook = recordOperation(stockBook, createBakingOperation());

        // Compute variance
        const variances = computeVariance(plan, stockBook.operations);
        expect(variances[0].variance).toBe(-10); // Produced 40, planned 50

        // Adjust next week's plan based on variance
        const adjustedPlan: AllocationPlan = {
            ...plan,
            id: "PLAN_W04",
            period: "2024-W04",
            productAllocations: [
                {
                    productId: "bread",
                    plannedQty: 45, // Reduced from 50 based on actual performance
                    minQty: 40,
                    maxQty: 50,
                },
            ],
            status: "planned",
        };

        expect(adjustedPlan.productAllocations[0].plannedQty).toBe(45);
    });

    it("simulates deduction allocation across total product", () => {
        let stockBook = createTestStockBook();

        // Produce lots of bread
        for (let i = 0; i < 5; i++) {
            const date = new Date(`2024-01-${15 + i}`);
            stockBook = recordOperation(stockBook, {
                ...createBakingOperation(date),
                id: `OP_BAKE_${i}`,
            });
        }

        // Total bread produced: 5 × 40 = 200 loaves
        expect(stockBook.stocks.bread.quantity).toBe(200);

        // Allocate deductions
        const deductions: Deduction[] = [
            {
                type: "D1_replacement",
                allocations: { bread: 20 },
                isConstraint: true,
                minRequired: 20,
            },
            {
                type: "D3_reserves",
                allocations: { bread: 30 },
                isConstraint: true,
                minRequired: 30,
            },
            {
                type: "D5_common_needs",
                allocations: { bread: 50 },
                isConstraint: false,
                target: 50,
            },
        ];

        // Validate constraints
        const validation = validateDeductions(deductions, {
            bread: stockBook.stocks.bread.quantity,
        });

        expect(validation.valid).toBe(true);

        // Distribution pool = 200 - (20 + 30 + 50) = 100 loaves
        const totalDeductions = 20 + 30 + 50;
        const distributionPool = 200 - totalDeductions;
        expect(distributionPool).toBe(100);
    });
});
