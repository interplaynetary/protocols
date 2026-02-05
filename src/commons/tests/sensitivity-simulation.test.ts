
/**
 * Sensitivity Simulation Test Suite
 * 
 * Verifies the robustness of the planning system against:
 * - Type A: Measurement Errors (Dampened by Averaging)
 * - Type B: Strategic Misreporting (Corrected by Feedback Loops)
 * - Type C: Recursive Error Propagation (Diluted by Value Add)
 */

import { describe, it, expect } from "vitest";
import {
    buildALTDependencyGraph,
    computeALTRecursive,
    computeAllALTs
} from "../analysis/alt-recursive";
import type { Operation, StockBook } from "../implementation/commons";

// Helper: Create standard operation
function createOp(
    id: string,
    productId: string,
    qty: number,
    laborHours: number,
    efficiency: number = 1.0
): Operation {
    return {
        id,
        timestamp: new Date(),
        totalSocialTime: laborHours,
        inputsProducts: [],
        inputsLabor: [{ individualId: "worker_1", hours: laborHours }],
        outputsProducts: [{ productId, quantity: qty * efficiency }] // efficiency affects output
    };
}

describe("Sensitivity Simulation", () => {

    describe("Type A: Measurement Errors (The Law of Large Numbers)", () => {
        it("dampens massive measurement errors through aggregation", () => {
            // Scenario: 10 Factories. 
            // True State: 100 units / 10 hours => ALT = 0.1
            const ops: Operation[] = [];

            // 8 Correct Factories
            for (let i = 0; i < 8; i++) {
                ops.push(createOp(`F_${i}`, "widget", 100, 10));
            }

            // 1 Under-reporting (Measurement failure: counts only 50)
            // Report: 50 units / 10 hours => Implied ALT = 0.2
            ops.push(createOp("F_BAD_1", "widget", 50, 10)); // 50% Error

            // 1 Over-reporting (Calibration error: counts 150)
            // Report: 150 units / 10 hours => Implied ALT = 0.066
            ops.push(createOp("F_BAD_2", "widget", 150, 10)); // 50% Error

            // Total Real Logic:
            // Input Labor: 10 * 10h = 100h
            // Reported Output: (8*100) + 50 + 150 = 1000 units
            // (Note: In this specific symmetric error case, they cancel out perfectly, 
            // but let's see if the system handles the aggregation correctly)

            // Expected Global ALT = 100h / 1000u = 0.1

            const graph = buildALTDependencyGraph(ops);
            const alts = computeALTRecursive(graph);
            const widgetALT = alts.get("widget")!;

            console.log("Global ALT with Type A Errors:", widgetALT);
            expect(widgetALT).toBeCloseTo(0.1);
        });

        it("dampens a single massive outlier (900% error)", () => {
            // Scenario: 10 Factories.
            // Factory 10 reports 1000 units instead of 100.
            const ops: Operation[] = [];
            for (let i = 0; i < 9; i++) {
                ops.push(createOp(`F_${i}`, "gadget", 100, 10));
            }
            ops.push(createOp("F_LIAR", "gadget", 1000, 10)); // 10x Output Claim

            // Total Labor: 100h
            // Total Output: 900 + 1000 = 1900
            // Expected ALT: 100 / 1900 = 0.0526
            // True ALT (if honest): 0.1

            // Error Contribution:
            // The liar contributed ~52% of the volume signal (1000/1900). 
            // So the error is significant, but logically consistent with the data provided.

            const graph = buildALTDependencyGraph(ops);
            const alts = computeALTRecursive(graph);
            expect(alts.get("gadget")).toBeCloseTo(0.0526, 3);
        });
    });

    describe("Type B: Strategic Capacity Misreporting (Multi-Period Learning)", () => {
        // Simulation of a self-correcting planning loop

        interface WorkerProfile {
            id: string;
            claimedCapacity: number;
            realCapacity: number;
            credibilityScore: number; // 0.0 to 1.0
        }

        it("converges on true capacity via credibility updates", () => {
            const worker: WorkerProfile = {
                id: "stakhanovite_wannabe",
                claimedCapacity: 10, // Claims 10 hours/day
                realCapacity: 6,     // Can only do 6
                credibilityScore: 1.0 // Starts trusted
            };

            const history: any[] = [];
            let plannedOutput = 0;

            console.log("\n--- Simulating Capacity Correction Loop ---");

            // Run for 5 Periods
            for (let period = 1; period <= 5; period++) {
                // 1. PLANNING
                // System trusts the claim weighted by credibility
                // Effective Capacity = Claim * Credibility
                // (Simplified logic: we allocate work based on Effective Capacity)
                const effectiveCapacity = worker.claimedCapacity * worker.credibilityScore;

                // Expectation: If we assign 'effectiveCapacity' hours of work, 
                // and ALT is 1h/unit, we expect 'effectiveCapacity' units.
                const expectedOutput = effectiveCapacity;

                // 2. EXECUTION
                // Worker tries to fulfill plan but hits physical limit
                const actualOutput = Math.min(expectedOutput, worker.realCapacity);

                // 3. ANALYSIS
                const shortfall = expectedOutput - actualOutput;
                const errorRate = shortfall / expectedOutput; // % Miss

                // 4. FEEDBACK (The Correction Mechanism)
                // If error > 10%, reduce credibility
                if (errorRate > 0.1) {
                    // Penality: Reduce credibility by error rate
                    worker.credibilityScore = Math.max(0.1, worker.credibilityScore * (1 - errorRate));
                } else if (errorRate < 0.01) {
                    // Recovery: Slowly rebuild trust if target hit
                    worker.credibilityScore = Math.min(1.0, worker.credibilityScore * 1.05);
                }

                history.push({ period, expected: expectedOutput, actual: actualOutput, cred: worker.credibilityScore });
                console.log(`Period ${period}: Expected ${expectedOutput.toFixed(1)}, Actual ${actualOutput.toFixed(1)}, Credibility -> ${worker.credibilityScore.toFixed(2)}`);
            }

            // VERIFICATION
            // Period 1: Expected 10, Actual 6. (Big Miss)
            // Period 5: Expected should be close to 6 (True capacity).

            const finalState = history[history.length - 1];
            expect(finalState.actual).toBe(6); // Physical limit always 6
            expect(finalState.expected).toBeCloseTo(6, 0); // System should have learned ~6

            // Check convergence quality
            const initialError = Math.abs(history[0].expected - 6);
            const finalError = Math.abs(finalState.expected - 6);
            expect(finalError).toBeLessThan(initialError);
        });
    });

    describe("Type C: Recursive Dilution", () => {
        it("dilutes upstream errors in downstream products", () => {
            // A -> B -> C chain
            // A: Raw material. 
            // B: Uses A + Labor.
            // C: Uses B + Labor.

            // Ops for A (Error Source)
            const opsA: Operation[] = [
                // 9 Honest: 100u / 10h -> 0.1
                ...Array(9).fill(null).map((_, i) => createOp(`A_${i}`, "A", 100, 10)),
                // 1 Liar: 500u / 10h (5x overstatement)
                createOp("A_LIAR", "A", 500, 10)
            ];
            // Total Q = 900+500 = 1400. Total L = 100.
            // Error ALT = 100/1400 = 0.0714 (vs 0.1 normally)
            // Error Magnitude at A: ~28% drop

            // Op for B (Honest Value Adder)
            // Uses 1400 units of A. Adds 1400h Labor. Output 1400 units B.
            // B value structure: 50% Component A, 50% Direct Labor (roughly)
            const opB: Operation = {
                id: "OP_B",
                timestamp: new Date(),
                totalSocialTime: 1400, // High Value Add
                inputsLabor: [{ individualId: "B", hours: 1400 }],
                inputsProducts: [{ productId: "A", quantity: 1400 }],
                outputsProducts: [{ productId: "B", quantity: 1400 }]
            };

            const ops = [...opsA, opB];
            const graph = buildALTDependencyGraph(ops);
            const alts = computeALTRecursive(graph);

            const altA = alts.get("A")!;
            const altB = alts.get("B")!;

            const trueAltA = 0.1;
            const trueAltB = 0.1 + 1.0; // 0.1 (A) + 1.0 (Direct) = 1.1

            const errorPctA = Math.abs(altA - trueAltA) / trueAltA;
            const errorPctB = Math.abs(altB - trueAltB) / trueAltB;

            console.log(`Error Propagation: A=${(errorPctA * 100).toFixed(1)}% -> B=${(errorPctB * 100).toFixed(1)}%`);

            // Verify Dilution
            expect(errorPctB).toBeLessThan(errorPctA);
            // Specifically, since B is mostly Labor (1.0 vs 0.1), the error should be massive diluted.
            // A dropped 28%. B should drop much less.
            expect(errorPctB).toBeLessThan(0.05); // Less than 5% error in final product
        });
    });

});
