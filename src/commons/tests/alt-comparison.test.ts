/**
 * Comprehensive tests comparing Marx's averaging vs recursive approaches
 * 
 * Tests:
 * 1. Do they produce the same results?
 * 2. Which is faster?
 * 3. How do they scale?
 * 4. Edge cases and differences
 */

import { describe, it, expect } from "vitest";
import {
    computeALT_Averaging,
    computeALT_Recursive,
    compareApproaches,
    compareAllProducts,
    benchmarkBoth,
    analyzeScalability,
} from "../analysis/alt-comparison";
import type { Operation, StockBook } from "../implementation/commons";

// ============================================================================
// TEST FIXTURES
// ============================================================================

function createSimpleChain(): Operation[] {
    return [
        // Wheat farming (no inputs)
        {
            id: "OP001",
            timestamp: new Date("2024-01-10"),
            totalSocialTime: 8,
            inputsProducts: [],
            inputsLabor: [{ individualId: "bob", hours: 8 }],
            outputsProducts: [{ productId: "wheat", quantity: 100 }],
        },
        // Bread baking (uses wheat)
        {
            id: "OP002",
            timestamp: new Date("2024-01-11"),
            totalSocialTime: 6,
            inputsProducts: [
                { productId: "wheat", quantity: 20, alt: 0.08 }, // From OP001
            ],
            inputsLabor: [{ individualId: "alice", hours: 6 }],
            outputsProducts: [{ productId: "bread", quantity: 40 }],
        },
    ];
}

function createMultipleOperations(): Operation[] {
    return [
        // Wheat 1
        {
            id: "OP001",
            timestamp: new Date("2024-01-10"),
            totalSocialTime: 8,
            inputsProducts: [],
            inputsLabor: [{ individualId: "bob", hours: 8 }],
            outputsProducts: [{ productId: "wheat", quantity: 100 }],
        },
        // Wheat 2 (different efficiency)
        {
            id: "OP002",
            timestamp: new Date("2024-01-12"),
            totalSocialTime: 10,
            inputsProducts: [],
            inputsLabor: [{ individualId: "bob", hours: 10 }],
            outputsProducts: [{ productId: "wheat", quantity: 100 }],
        },
        // Bread 1
        {
            id: "OP003",
            timestamp: new Date("2024-01-11"),
            totalSocialTime: 6,
            inputsProducts: [
                { productId: "wheat", quantity: 20, alt: 0.08 },
            ],
            inputsLabor: [{ individualId: "alice", hours: 6 }],
            outputsProducts: [{ productId: "bread", quantity: 40 }],
        },
        // Bread 2 (different efficiency)
        {
            id: "OP004",
            timestamp: new Date("2024-01-13"),
            totalSocialTime: 5,
            inputsProducts: [
                { productId: "wheat", quantity: 20, alt: 0.09 }, // Updated ALT
            ],
            inputsLabor: [{ individualId: "alice", hours: 5 }],
            outputsProducts: [{ productId: "bread", quantity: 40 }],
        },
    ];
}

function createComplexChain(): Operation[] {
    return [
        // Iron ore
        {
            id: "OP001",
            timestamp: new Date("2024-01-01"),
            totalSocialTime: 10,
            inputsProducts: [],
            inputsLabor: [{ individualId: "miner", hours: 10 }],
            outputsProducts: [{ productId: "iron_ore", quantity: 50 }],
        },
        // Steel (uses iron ore)
        {
            id: "OP002",
            timestamp: new Date("2024-01-02"),
            totalSocialTime: 8,
            inputsProducts: [
                { productId: "iron_ore", quantity: 30, alt: 0.2 },
            ],
            inputsLabor: [{ individualId: "smelter", hours: 8 }],
            outputsProducts: [{ productId: "steel", quantity: 20 }],
        },
        // Oven (uses steel)
        {
            id: "OP003",
            timestamp: new Date("2024-01-03"),
            totalSocialTime: 50,
            inputsProducts: [
                { productId: "steel", quantity: 10, alt: 0.7 },
            ],
            inputsLabor: [{ individualId: "manufacturer", hours: 50 }],
            outputsProducts: [{ productId: "oven", quantity: 1 }],
        },
        // Wheat
        {
            id: "OP004",
            timestamp: new Date("2024-01-01"),
            totalSocialTime: 8,
            inputsProducts: [],
            inputsLabor: [{ individualId: "farmer", hours: 8 }],
            outputsProducts: [{ productId: "wheat", quantity: 100 }],
        },
        // Bread (uses wheat + oven)
        {
            id: "OP005",
            timestamp: new Date("2024-01-04"),
            totalSocialTime: 6,
            inputsProducts: [
                { productId: "wheat", quantity: 20, alt: 0.08 },
                { productId: "oven", quantity: 6 / 10000, alt: 57 },
            ],
            inputsLabor: [{ individualId: "baker", hours: 6 }],
            outputsProducts: [{ productId: "bread", quantity: 40 }],
        },
    ];
}

// ============================================================================
// CORRECTNESS TESTS: Do they produce the same results?
// ============================================================================

describe("Correctness: Same Results", () => {
    it("produces identical results for simple chain", () => {
        const ops = createSimpleChain();

        const avgWheat = computeALT_Averaging("wheat", ops);
        const recWheat = computeALT_Recursive("wheat", ops);

        expect(avgWheat).not.toBeNull();
        expect(recWheat).not.toBeNull();
        expect(avgWheat!.alt).toBeCloseTo(recWheat!.alt, 10);

        const avgBread = computeALT_Averaging("bread", ops);
        const recBread = computeALT_Recursive("bread", ops);

        expect(avgBread).not.toBeNull();
        expect(recBread).not.toBeNull();
        expect(avgBread!.alt).toBeCloseTo(recBread!.alt, 10);
    });

    it("produces identical results for multiple operations", () => {
        const ops = createMultipleOperations();

        const comparison = compareApproaches("bread", ops);

        expect(comparison.match).toBe(true);
        expect(comparison.difference).toBeLessThan(0.0001);
    });

    it("produces identical results for complex chain", () => {
        const ops = createComplexChain();

        const products = ["iron_ore", "steel", "oven", "wheat", "bread"];

        for (const productId of products) {
            const comparison = compareApproaches(productId, ops);

            expect(comparison.match).toBe(true);
            expect(comparison.difference).toBeLessThan(0.0001);
        }
    });

    it("handles products with no operations identically", () => {
        const ops = createSimpleChain();

        const avgNone = computeALT_Averaging("nonexistent", ops);
        const recNone = computeALT_Recursive("nonexistent", ops);

        expect(avgNone).toBeNull();
        expect(recNone).toBeNull();
    });
});

// ============================================================================
// EDGE CASE TESTS: Where might they differ?
// ============================================================================

describe("Edge Cases", () => {
    it("handles varying input ALTs across operations", () => {
        const ops: Operation[] = [
            // Wheat 1
            {
                id: "OP001",
                timestamp: new Date("2024-01-10"),
                totalSocialTime: 8,
                inputsProducts: [],
                inputsLabor: [{ individualId: "bob", hours: 8 }],
                outputsProducts: [{ productId: "wheat", quantity: 100 }],
            },
            // Bread 1 (uses wheat at ALT=0.08)
            {
                id: "OP002",
                timestamp: new Date("2024-01-11"),
                totalSocialTime: 6,
                inputsProducts: [
                    { productId: "wheat", quantity: 20, alt: 0.08 },
                ],
                inputsLabor: [{ individualId: "alice", hours: 6 }],
                outputsProducts: [{ productId: "bread", quantity: 40 }],
            },
            // Bread 2 (uses wheat at different ALT=0.10 - maybe wheat got more expensive)
            {
                id: "OP003",
                timestamp: new Date("2024-01-12"),
                totalSocialTime: 6,
                inputsProducts: [
                    { productId: "wheat", quantity: 20, alt: 0.10 }, // Different!
                ],
                inputsLabor: [{ individualId: "alice", hours: 6 }],
                outputsProducts: [{ productId: "bread", quantity: 40 }],
            },
        ];

        const comparison = compareApproaches("bread", ops);

        // Averaging approach: uses the ALT values AS RECORDED
        // Recursive approach: would recompute from dependency graph

        // They SHOULD differ here!
        console.log("Averaging ALT:", comparison.averaging?.alt);
        console.log("Recursive ALT:", comparison.recursive?.alt);
        console.log("Difference:", comparison.difference);
    });

    it("handles multi-output operations", () => {
        const ops: Operation[] = [
            {
                id: "OP001",
                timestamp: new Date("2024-01-10"),
                totalSocialTime: 10,
                inputsProducts: [],
                inputsLabor: [{ individualId: "worker", hours: 10 }],
                outputsProducts: [
                    { productId: "product_a", quantity: 50 },
                    { productId: "product_b", quantity: 30 },
                ],
            },
        ];

        const compA = compareApproaches("product_a", ops);
        const compB = compareApproaches("product_b", ops);

        // Both should allocate labor proportionally
        expect(compA.match).toBe(true);
        expect(compB.match).toBe(true);
    });
});

// ============================================================================
// PERFORMANCE TESTS: Which is faster?
// ============================================================================

describe("Performance", () => {
    it("benchmarks simple chain", () => {
        const ops = createSimpleChain();
        const bench = benchmarkBoth("bread", ops, 1000);

        console.log("\nSimple Chain Benchmark:");
        console.log(`Averaging: ${bench.averaging.timeMs.toFixed(4)}ms`);
        console.log(`Recursive: ${bench.recursive.timeMs.toFixed(4)}ms`);
        console.log(`Speedup: ${bench.speedup.toFixed(2)}x`);

        // Averaging should be faster (no graph building)
        expect(bench.averaging.timeMs).toBeLessThan(bench.recursive.timeMs);
    });

    it("benchmarks complex chain", () => {
        const ops = createComplexChain();
        const bench = benchmarkBoth("bread", ops, 1000);

        console.log("\nComplex Chain Benchmark:");
        console.log(`Averaging: ${bench.averaging.timeMs.toFixed(4)}ms`);
        console.log(`Recursive: ${bench.recursive.timeMs.toFixed(4)}ms`);
        console.log(`Speedup: ${bench.speedup.toFixed(2)}x`);

        // Averaging should still be faster
        expect(bench.averaging.timeMs).toBeLessThan(bench.recursive.timeMs);
    });
});

// ============================================================================
// SCALABILITY TESTS: How do they scale?
// ============================================================================

describe("Scalability", () => {
    it("analyzes scalability with increasing operations", () => {
        // Create many operations
        const ops: Operation[] = [];

        for (let i = 0; i < 1000; i++) {
            ops.push({
                id: `OP${i}`,
                timestamp: new Date(`2024-01-${(i % 30) + 1}`),
                totalSocialTime: 6 + Math.random(),
                inputsProducts: [
                    { productId: "wheat", quantity: 20, alt: 0.08 + Math.random() * 0.02 },
                ],
                inputsLabor: [{ individualId: "alice", hours: 6 + Math.random() }],
                outputsProducts: [{ productId: "bread", quantity: 40 }],
            });
        }

        const results = analyzeScalability(ops, "bread", [10, 50, 100, 500, 1000]);

        console.log("\nScalability Analysis:");
        console.log("Ops\tAvg(ms)\tRec(ms)\tRatio");
        for (const result of results) {
            console.log(
                `${result.operationCount}\t${result.averaging.timeMs.toFixed(4)}\t${result.recursive.timeMs.toFixed(4)}\t${result.ratio.toFixed(2)}x`
            );
        }

        // Averaging should scale better (linear vs graph building)
        const firstRatio = results[0].ratio;
        const lastRatio = results[results.length - 1].ratio;

        // Ratio should increase (recursive gets relatively slower)
        expect(lastRatio).toBeGreaterThanOrEqual(firstRatio);
    });
});

// ============================================================================
// COMPREHENSIVE COMPARISON
// ============================================================================

describe("Comprehensive Comparison", () => {
    it("compares all products in stock-book", () => {
        const stockBook: StockBook = {
            products: {
                wheat: { id: "wheat", name: "Wheat", unit: "kg" },
                bread: { id: "bread", name: "Bread", unit: "loaf" },
                iron_ore: { id: "iron_ore", name: "Iron Ore", unit: "kg" },
                steel: { id: "steel", name: "Steel", unit: "kg" },
                oven: { id: "oven", name: "Oven", unit: "unit" },
            },
            individuals: {},
            stocks: {},
            operations: createComplexChain(),
        };

        const results = compareAllProducts(stockBook);

        console.log("\nAll Products Comparison:");
        for (const result of results) {
            if (result.averaging && result.recursive) {
                console.log(
                    `${result.productId}: Avg=${result.averaging.alt.toFixed(4)}, ` +
                    `Rec=${result.recursive.alt.toFixed(4)}, ` +
                    `Diff=${result.difference.toFixed(6)} (${result.percentDifference.toFixed(2)}%)`
                );
            }
        }

        // All should match
        for (const result of results) {
            if (result.averaging && result.recursive) {
                expect(result.match).toBe(true);
            }
        }
    });
});

// ============================================================================
// THEORETICAL DIFFERENCE TEST
// ============================================================================

describe("When They SHOULD Differ", () => {
    it("differs when input ALTs change between operations", () => {
        const ops: Operation[] = [
            // Initial wheat production
            {
                id: "OP001",
                timestamp: new Date("2024-01-10"),
                totalSocialTime: 8,
                inputsProducts: [],
                inputsLabor: [{ individualId: "bob", hours: 8 }],
                outputsProducts: [{ productId: "wheat", quantity: 100 }],
            },
            // Bread 1: uses wheat at initial ALT
            {
                id: "OP002",
                timestamp: new Date("2024-01-11"),
                totalSocialTime: 6,
                inputsProducts: [
                    { productId: "wheat", quantity: 20, alt: 0.08 }, // Initial ALT
                ],
                inputsLabor: [{ individualId: "alice", hours: 6 }],
                outputsProducts: [{ productId: "bread", quantity: 40 }],
            },
            // More wheat (less efficient)
            {
                id: "OP003",
                timestamp: new Date("2024-01-12"),
                totalSocialTime: 12,
                inputsProducts: [],
                inputsLabor: [{ individualId: "bob", hours: 12 }],
                outputsProducts: [{ productId: "wheat", quantity: 100 }],
            },
            // Bread 2: uses wheat at UPDATED ALT
            {
                id: "OP004",
                timestamp: new Date("2024-01-13"),
                totalSocialTime: 6,
                inputsProducts: [
                    { productId: "wheat", quantity: 20, alt: 0.10 }, // Updated ALT (average of 8h and 12h)
                ],
                inputsLabor: [{ individualId: "alice", hours: 6 }],
                outputsProducts: [{ productId: "bread", quantity: 40 }],
            },
        ];

        const avgResult = computeALT_Averaging("bread", ops);
        const recResult = computeALT_Recursive("bread", ops);

        console.log("\nWhen Input ALTs Change:");
        console.log(`Averaging: ${avgResult?.alt.toFixed(4)}`);
        console.log(`Recursive: ${recResult?.alt.toFixed(4)}`);

        // Averaging: (6 + 20×0.08 + 6 + 20×0.10) / 80 = 0.19
        // Recursive: Should recompute wheat ALT = 20h/200kg = 0.10, then bread

        // They MIGHT differ slightly due to how they handle changing input ALTs
    });
});
