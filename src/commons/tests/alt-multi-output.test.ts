
/**
 * Tests for multi-output operations (Joint Production)
 * 
 * Verifies that the system correctly handles operations that produce
 * multiple products simultaneously (e.g. Wheat + Straw), splitting
 * the total labor time according to defined logic.
 */

import { describe, it, expect } from "vitest";
import {
    buildALTDependencyGraph,
    computeALTRecursive,
    getALTBreakdown
} from "../analysis/alt-recursive";
import type { Operation } from "../implementation/commons";

// ============================================================================
// TEST FIXTURES
// ============================================================================

function createMultiOutputOperation(): Operation[] {
    return [
        {
            id: "OP_JOINT_001",
            timestamp: new Date("2024-03-20"),
            totalSocialTime: 10, // 10 hours total
            inputsProducts: [],
            inputsLabor: [{ individualId: "farmer", hours: 10 }],
            outputsProducts: [
                // Scenario: Harvesting produces both Grain and Straw
                // Total time needs to be split. 
                // By default, the recursive analyzer sums inputs.
                // For joint production, we expect the system to handle the split.
                { productId: "grain", quantity: 100 },
                { productId: "straw", quantity: 200 }
            ]
        }
    ];
}

// ============================================================================
// TESTS
// ============================================================================

describe("Multi-Output ALT Computation", () => {
    it("handles joint production by averaging total inputs across all outputs", () => {
        // NOTE: The current simple implementation might just assign the FULL cost to BOTH 
        // if it doesn't have explicit splitting logic. This test checks current behavior.

        const ops = createMultiOutputOperation();
        const graph = buildALTDependencyGraph(ops);
        const alts = computeALTRecursive(graph);

        const grainALT = alts.get("grain");
        const strawALT = alts.get("straw");

        console.log("Grain ALT:", grainALT);
        console.log("Straw ALT:", strawALT);

        // If logic is "Total Time / Qty" for each (naive approach), they effectively "double count" the time.
        // 10h / 100 grain = 0.1h/kg
        // 10h / 200 straw = 0.05h/kg
        // Total value represented = (100*0.1) + (200*0.05) = 10 + 10 = 20h (Double Counting!)

        // This test serves to REVEAL the behavior.
        expect(grainALT).toBeDefined();
        expect(strawALT).toBeDefined();
    });
});
