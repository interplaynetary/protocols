
/**
 * ALT Sensitivity Analysis
 * 
 * Tests how sensitive the global ALT calculation is to "False Operations"
 * (errors in reporting quantity or labor time).
 * 
 * Verifies that the "Aggregation/Averaging" logic dampens errors,
 * preventing a single mistake from destroying the validity of the entire plan.
 */

import { describe, it, expect } from "vitest";
import {
    buildALTDependencyGraph,
    computeALTRecursive
} from "../analysis/alt-recursive";
import type { Operation } from "../implementation/commons";

// Helper to create valid chain
function createBaselineOps(): Operation[] {
    const ops: Operation[] = [];
    // 10 Farmers producing 1000kg Wheat total
    for (let i = 0; i < 10; i++) {
        ops.push({
            id: `WHEAT_OP_${i}`,
            timestamp: new Date(),
            totalSocialTime: 10, // 10h each
            inputsProducts: [],
            inputsLabor: [{ individualId: `farmer_${i}`, hours: 10 }],
            outputsProducts: [{ productId: "wheat", quantity: 100 }]
        });
    }
    // Total: 100h Labor -> 1000kg Wheat. ALT = 0.1h/kg.

    // 1 Baker using that Wheat
    ops.push({
        id: "BREAD_OP_1",
        timestamp: new Date(),
        totalSocialTime: 100,
        inputsProducts: [{ productId: "wheat", quantity: 1000 }], // Uses all wheat
        inputsLabor: [{ individualId: "baker", hours: 100 }],
        outputsProducts: [{ productId: "bread", quantity: 1000 }]
    });
    // Bread Cost = 1000*0.1 (Wheat) + 100 (Labor) = 200h.
    // Bread ALT = 200 / 1000 = 0.2h/loaf.

    return ops;
}

describe("ALT Sensitivity to Errors", () => {

    it("dampens single operation errors via averaging", () => {
        const ops = createBaselineOps();

        // Baseline Check
        const graph1 = buildALTDependencyGraph(ops);
        const alts1 = computeALTRecursive(graph1);
        expect(alts1.get("wheat")).toBeCloseTo(0.1);
        expect(alts1.get("bread")).toBeCloseTo(0.2);

        // INTRODUCE ERROR: One farmer lies/errs.
        // Instead of 100kg, they report 1000kg (10x error).
        // Real logic: 9 farmers * 100 = 900. 1 farmer * 1000 = 1000. Total Q = 1900.
        // Total Labor = 10 farmers * 10h = 100h.
        // New ALT = 100h / 1900kg = 0.0526 h/kg.

        const errorOp = ops[0];
        errorOp.outputsProducts[0].quantity = 1000;

        const graph2 = buildALTDependencyGraph(ops);
        const alts2 = computeALTRecursive(graph2);

        const newWheatALT = alts2.get("wheat")!;
        const newBreadALT = alts2.get("bread")!;

        console.log(`Baseline Wheat: 0.1 -> Error Wheat: ${newWheatALT.toFixed(4)}`);

        // Error Size: The input error was 900% (100 -> 1000).
        // Impact on ALT: 0.1 -> 0.0526 ( ~47% drop).
        // Result: The system is LESS sensitive than 1:1. The volume of correct data dampens the outlier.

        expect(newWheatALT).not.toBeCloseTo(0.1);
        expect(alts2.get("wheat")).toBeCloseTo(0.0526, 3);
    });

    it("propagates error recursively but diluted by value-add", () => {
        const ops = createBaselineOps();

        // INTRODUCE ERROR IN WHEAT (Input)
        // One farmer reports 1000kg instead of 100kg.
        ops[0].outputsProducts[0].quantity = 1000;

        const graph = buildALTDependencyGraph(ops);
        const alts = computeALTRecursive(graph);

        const wheatALT = alts.get("wheat")!; // ~0.0526
        const breadALT = alts.get("bread")!;

        // Bread Calculation:
        // Direct Labor: 100h / 1000 units = 0.1 h/unit (Unchanged)
        // Embodied Wheat: 1000kg * 0.0526 = 52.6h
        // Total Bread Time = 100 + 52.6 = 152.6h
        // Bread ALT = 0.1526 h/unit.

        console.log(`Baseline Bread: 0.2 -> Error Bread: ${breadALT.toFixed(4)}`);

        // Baseline Bread: 0.2
        // Error Bread: 0.1526
        // Output Change: ~23% drop. 
        // Logic: Dampening continued. The heavy Direct Labor component (50% of value) was unaffected.

        expect(breadALT).toBeCloseTo(0.1526, 3);
    });
});
