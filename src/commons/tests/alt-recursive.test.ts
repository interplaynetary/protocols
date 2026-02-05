/**
 * Tests for recursive ALT computation
 * 
 * Demonstrates how ALT calculation works recursively through
 * a production network, including:
 * - Simple products (no inputs)
 * - Products with material inputs
 * - Products with durable good inputs
 * - Multi-level production chains
 */

import { describe, it, expect } from "vitest";
import {
    buildALTDependencyGraph,
    computeALTRecursive,
    computeALTIterative,
    computeAllALTs,
    getALTBreakdown,
    printALTBreakdown,
} from "../analysis/alt-recursive";
import type { Operation, StockBook } from "../implementation/commons";

// ============================================================================
// TEST FIXTURES
// ============================================================================

function createSimpleProductionChain(): Operation[] {
    return [
        // Step 1: Farm wheat (no inputs, just labor)
        {
            id: "OP001",
            timestamp: new Date("2024-01-10"),
            totalSocialTime: 8,
            inputsProducts: [],
            inputsLabor: [
                { individualId: "bob", hours: 8, workType: "farming" },
            ],
            outputsProducts: [
                { productId: "wheat", quantity: 100 }, // 100kg wheat
            ],
        },

        // Step 2: Bake bread (uses wheat)
        {
            id: "OP002",
            timestamp: new Date("2024-01-11"),
            totalSocialTime: 6,
            inputsProducts: [
                { productId: "wheat", quantity: 20, alt: 0.08 }, // 20kg wheat @ 0.08h/kg
            ],
            inputsLabor: [
                { individualId: "alice", hours: 6, workType: "baking" },
            ],
            outputsProducts: [
                { productId: "bread", quantity: 40 }, // 40 loaves
            ],
        },
    ];
}

function createComplexProductionChain(): Operation[] {
    return [
        // Raw materials
        {
            id: "OP001",
            timestamp: new Date("2024-01-01"),
            totalSocialTime: 10,
            inputsProducts: [],
            inputsLabor: [{ individualId: "miner", hours: 10 }],
            outputsProducts: [{ productId: "iron_ore", quantity: 50 }],
        },

        // Intermediate: Steel from iron ore
        {
            id: "OP002",
            timestamp: new Date("2024-01-02"),
            totalSocialTime: 8,
            inputsProducts: [
                { productId: "iron_ore", quantity: 30, alt: 0.2 }, // 10h / 50kg = 0.2h/kg
            ],
            inputsLabor: [{ individualId: "smelter", hours: 8 }],
            outputsProducts: [{ productId: "steel", quantity: 20 }],
        },

        // Durable good: Oven from steel
        {
            id: "OP003",
            timestamp: new Date("2024-01-03"),
            totalSocialTime: 50,
            inputsProducts: [
                { productId: "steel", quantity: 10, alt: 0.7 }, // (6 + 8) / 20 = 0.7h/kg
            ],
            inputsLabor: [{ individualId: "manufacturer", hours: 50 }],
            outputsProducts: [{ productId: "oven", quantity: 1 }],
        },

        // Final: Bread using oven
        {
            id: "OP004",
            timestamp: new Date("2024-01-04"),
            totalSocialTime: 6,
            inputsProducts: [
                { productId: "wheat", quantity: 20, alt: 0.08 },
                { productId: "oven", quantity: 6 / 10000, alt: 57 }, // Oven depreciation
            ],
            inputsLabor: [{ individualId: "baker", hours: 6 }],
            outputsProducts: [{ productId: "bread", quantity: 40 }],
        },

        // Wheat production
        {
            id: "OP005",
            timestamp: new Date("2024-01-01"),
            totalSocialTime: 8,
            inputsProducts: [],
            inputsLabor: [{ individualId: "farmer", hours: 8 }],
            outputsProducts: [{ productId: "wheat", quantity: 100 }],
        },
    ];
}

// ============================================================================
// DEPENDENCY GRAPH TESTS
// ============================================================================

describe("ALT Dependency Graph", () => {
    it("builds graph from simple production chain", () => {
        const ops = createSimpleProductionChain();
        const graph = buildALTDependencyGraph(ops);

        expect(graph.size).toBe(2); // wheat, bread

        const wheat = graph.get("wheat");
        expect(wheat).toBeDefined();
        expect(wheat!.directLabor).toBeCloseTo(0.08, 2); // 8h / 100kg
        expect(wheat!.inputs).toHaveLength(0); // No inputs

        const bread = graph.get("bread");
        expect(bread).toBeDefined();
        expect(bread!.directLabor).toBeCloseTo(0.15, 2); // 6h / 40 loaves
        expect(bread!.inputs).toHaveLength(1); // Wheat input
        expect(bread!.inputs[0].productId).toBe("wheat");
        expect(bread!.inputs[0].quantityPerUnit).toBeCloseTo(0.5, 2); // 20kg / 40 loaves
    });

    it("builds graph from complex production chain", () => {
        const ops = createComplexProductionChain();
        const graph = buildALTDependencyGraph(ops);

        expect(graph.size).toBe(5); // iron_ore, steel, oven, wheat, bread

        const steel = graph.get("steel");
        expect(steel).toBeDefined();
        expect(steel!.inputs).toHaveLength(1);
        expect(steel!.inputs[0].productId).toBe("iron_ore");

        const oven = graph.get("oven");
        expect(oven).toBeDefined();
        expect(oven!.inputs).toHaveLength(1);
        expect(oven!.inputs[0].productId).toBe("steel");

        const bread = graph.get("bread");
        expect(bread).toBeDefined();
        expect(bread!.inputs).toHaveLength(2); // wheat + oven
    });
});

// ============================================================================
// RECURSIVE ALT COMPUTATION TESTS
// ============================================================================

describe("Recursive ALT Computation", () => {
    it("computes ALT for simple chain (wheat → bread)", () => {
        const ops = createSimpleProductionChain();
        const graph = buildALTDependencyGraph(ops);
        const alts = computeALTRecursive(graph);

        // Wheat: 8h / 100kg = 0.08h/kg
        expect(alts.get("wheat")).toBeCloseTo(0.08, 2);

        // Bread: 6h direct + (20kg × 0.08h/kg) = 6 + 1.6 = 7.6h for 40 loaves
        // Per loaf: 7.6h / 40 = 0.19h/loaf
        expect(alts.get("bread")).toBeCloseTo(0.19, 2);
    });

    it("computes ALT for complex chain (ore → steel → oven → bread)", () => {
        const ops = createComplexProductionChain();
        const graph = buildALTDependencyGraph(ops);
        const alts = computeALTRecursive(graph);

        // Iron ore: 10h / 50kg = 0.2h/kg
        expect(alts.get("iron_ore")).toBeCloseTo(0.2, 2);

        // Steel: 8h direct + (30kg × 0.2h/kg) = 8 + 6 = 14h for 20kg
        // Per kg: 14h / 20kg = 0.7h/kg
        expect(alts.get("steel")).toBeCloseTo(0.7, 2);

        // Oven: 50h direct + (10kg × 0.7h/kg) = 50 + 7 = 57h for 1 oven
        expect(alts.get("oven")).toBeCloseTo(57, 1);

        // Wheat: 8h / 100kg = 0.08h/kg
        expect(alts.get("wheat")).toBeCloseTo(0.08, 2);

        // Bread: 6h direct + (20kg × 0.08h/kg) + (6/10000 × 57h)
        //      = 6 + 1.6 + 0.0342 = 7.6342h for 40 loaves
        // Per loaf: 7.6342 / 40 = 0.1908h/loaf
        expect(alts.get("bread")).toBeCloseTo(0.191, 2);
    });

    it("handles products with no inputs (raw materials)", () => {
        const ops = createSimpleProductionChain();
        const graph = buildALTDependencyGraph(ops);
        const alts = computeALTRecursive(graph);

        // Wheat has no inputs, only direct labor
        const wheat = graph.get("wheat");
        expect(wheat!.inputs).toHaveLength(0);
        expect(alts.get("wheat")).toBe(wheat!.directLabor);
    });

    it("detects circular dependencies", () => {
        // Create circular dependency: A → B → A
        const graph = new Map();
        graph.set("A", {
            productId: "A",
            directLabor: 1,
            inputs: [{ productId: "B", quantityPerUnit: 1 }],
            computed: false,
        });
        graph.set("B", {
            productId: "B",
            directLabor: 1,
            inputs: [{ productId: "A", quantityPerUnit: 1 }],
            computed: false,
        });

        expect(() => computeALTRecursive(graph)).toThrow("Circular dependency");
    });
});

// ============================================================================
// ITERATIVE ALT COMPUTATION TESTS
// ============================================================================

describe("Iterative ALT Computation", () => {
    it("converges to same result as recursive", () => {
        const ops = createSimpleProductionChain();
        const graph = buildALTDependencyGraph(ops);

        const recursiveALTs = computeALTRecursive(graph);
        const iterativeALTs = computeALTIterative(graph);

        for (const [productId, recursiveALT] of recursiveALTs.entries()) {
            const iterativeALT = iterativeALTs.get(productId)!;
            expect(iterativeALT).toBeCloseTo(recursiveALT, 3);
        }
    });

    it("converges for complex production chain", () => {
        const ops = createComplexProductionChain();
        const graph = buildALTDependencyGraph(ops);

        const recursiveALTs = computeALTRecursive(graph);
        const iterativeALTs = computeALTIterative(graph);

        for (const [productId, recursiveALT] of recursiveALTs.entries()) {
            const iterativeALT = iterativeALTs.get(productId)!;
            expect(iterativeALT).toBeCloseTo(recursiveALT, 3);
        }
    });
});

// ============================================================================
// ALT BREAKDOWN TESTS
// ============================================================================

describe("ALT Breakdown", () => {
    it("shows breakdown for simple product", () => {
        const ops = createSimpleProductionChain();
        const graph = buildALTDependencyGraph(ops);
        const alts = computeALTRecursive(graph);

        const wheatBreakdown = getALTBreakdown("wheat", graph, alts);

        expect(wheatBreakdown.productId).toBe("wheat");
        expect(wheatBreakdown.directLabor).toBeCloseTo(0.08, 2);
        expect(wheatBreakdown.embodiedLabor).toBe(0); // No inputs
        expect(wheatBreakdown.inputs).toHaveLength(0);
    });

    it("shows breakdown for product with inputs", () => {
        const ops = createSimpleProductionChain();
        const graph = buildALTDependencyGraph(ops);
        const alts = computeALTRecursive(graph);

        const breadBreakdown = getALTBreakdown("bread", graph, alts);

        expect(breadBreakdown.productId).toBe("bread");
        expect(breadBreakdown.directLabor).toBeCloseTo(0.15, 2); // 6h / 40
        expect(breadBreakdown.embodiedLabor).toBeCloseTo(0.04, 2); // 0.5kg × 0.08h/kg
        expect(breadBreakdown.inputs).toHaveLength(1);
        expect(breadBreakdown.inputs[0].productId).toBe("wheat");
        expect(breadBreakdown.inputs[0].contribution).toBeCloseTo(0.04, 2);
    });

    it("shows breakdown for complex product", () => {
        const ops = createComplexProductionChain();
        const graph = buildALTDependencyGraph(ops);
        const alts = computeALTRecursive(graph);

        const breadBreakdown = getALTBreakdown("bread", graph, alts);

        expect(breadBreakdown.inputs).toHaveLength(2); // wheat + oven

        const wheatInput = breadBreakdown.inputs.find(i => i.productId === "wheat");
        const ovenInput = breadBreakdown.inputs.find(i => i.productId === "oven");

        expect(wheatInput).toBeDefined();
        expect(ovenInput).toBeDefined();

        // Wheat contribution: 0.5kg/loaf × 0.08h/kg = 0.04h/loaf
        expect(wheatInput!.contribution).toBeCloseTo(0.04, 2);

        // Oven contribution: (6/10000)/40 × 57h = 0.000855h/loaf
        expect(ovenInput!.contribution).toBeCloseTo(0.000855, 5);
    });

    it("prints readable breakdown", () => {
        const ops = createSimpleProductionChain();
        const graph = buildALTDependencyGraph(ops);
        const alts = computeALTRecursive(graph);

        const breadBreakdown = getALTBreakdown("bread", graph, alts);
        const output = printALTBreakdown(breadBreakdown);

        expect(output).toContain("ALT Breakdown for bread");
        expect(output).toContain("Total ALT:");
        expect(output).toContain("Direct Labor:");
        expect(output).toContain("Embodied Labor:");
        expect(output).toContain("wheat:");
    });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe("Complete ALT Computation", () => {
    it("computes all ALTs for stock-book", () => {
        const stockBook: StockBook = {
            products: {
                wheat: { id: "wheat", name: "Wheat", unit: "kg" },
                bread: { id: "bread", name: "Bread", unit: "loaf" },
            },
            individuals: {
                bob: { id: "bob", name: "Bob", laborPowers: [] },
                alice: { id: "alice", name: "Alice", laborPowers: [] },
            },
            stocks: {},
            operations: createSimpleProductionChain(),
        };

        const alts = computeAllALTs(stockBook);

        expect(alts.size).toBe(2);

        const wheatALT = alts.get("wheat");
        expect(wheatALT).toBeDefined();
        expect(wheatALT!.alt).toBeCloseTo(0.08, 2);
        expect(wheatALT!.totalQuantity).toBe(100);
        expect(wheatALT!.totalLaborTime).toBeCloseTo(8, 1);

        const breadALT = alts.get("bread");
        expect(breadALT).toBeDefined();
        expect(breadALT!.alt).toBeCloseTo(0.19, 2);
        expect(breadALT!.totalQuantity).toBe(40);
        expect(breadALT!.totalLaborTime).toBeCloseTo(7.6, 1);
    });

    it("demonstrates full recursion through 4 levels", () => {
        const ops = createComplexProductionChain();
        const graph = buildALTDependencyGraph(ops);
        const alts = computeALTRecursive(graph);

        // Level 1: Raw material (iron ore)
        expect(alts.get("iron_ore")).toBeCloseTo(0.2, 2);

        // Level 2: Intermediate (steel)
        expect(alts.get("steel")).toBeCloseTo(0.7, 2);

        // Level 3: Durable good (oven)
        expect(alts.get("oven")).toBeCloseTo(57, 1);

        // Level 4: Final product (bread)
        expect(alts.get("bread")).toBeCloseTo(0.191, 2);

        // Verify recursion: bread ALT includes all upstream labor
        const breadBreakdown = getALTBreakdown("bread", graph, alts);

        // Direct baking: 6h / 40 = 0.15h/loaf
        expect(breadBreakdown.directLabor).toBeCloseTo(0.15, 2);

        // Embodied: wheat + oven (which includes steel, which includes iron ore)
        expect(breadBreakdown.embodiedLabor).toBeGreaterThan(0);
    });
});
