
/**
 * Test to verify Aggregation Logic (Sum vs Average)
 * 
 * Scenario: Two identical operations producing the same product.
 * Expectation: ALT should be the average (same as single op).
 * Bug Suspect: ALT is the sum (double the correct value).
 */

import { describe, it, expect } from "vitest";
import {
    buildALTDependencyGraph,
    computeALTRecursive
} from "../analysis/alt-recursive";
import type { Operation } from "../implementation/commons";

describe("ALT Aggregation Logic", () => {
    it("Averages parallel operations correctly", () => {
        const ops: Operation[] = [
            // Batch 1: 10h labor -> 100 units
            {
                id: "OP_1",
                timestamp: new Date(),
                totalSocialTime: 10,
                inputsProducts: [],
                inputsLabor: [{ individualId: "A", hours: 10 }],
                effects: [{ productId: "widget", quantity: 100 }]
            },
            // Batch 2: 10h labor -> 100 units
            {
                id: "OP_2",
                timestamp: new Date(),
                totalSocialTime: 10,
                inputsProducts: [],
                inputsLabor: [{ individualId: "B", hours: 10 }],
                effects: [{ productId: "widget", quantity: 100 }]
            }
        ];

        const graph = buildALTDependencyGraph(ops);
        const alts = computeALTRecursive(graph);
        const widgetALT = alts.get("widget");

        console.log("Widget ALT:", widgetALT);

        // Expected: (10+10)h / (100+100)u = 20/200 = 0.1
        // Bug Result: (10/100) + (10/100) = 0.2

        expect(widgetALT).toBeCloseTo(0.1);
    });
});
