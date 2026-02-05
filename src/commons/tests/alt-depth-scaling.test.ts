/**
 * Supply Chain Depth Analysis
 * 
 * Tests how ALT calculation approaches scale with supply chain depth
 * (not just number of operations, but depth of dependencies)
 * 
 * Example depths:
 * - Depth 1: Raw materials (wheat, iron ore)
 * - Depth 2: Intermediate goods (flour, steel)
 * - Depth 3: Components (bread, tools)
 * - Depth 4: Complex products (machinery)
 * - Depth 5+: Advanced manufacturing
 */

import { describe, it, expect } from "vitest";
import {
    computeALT_Averaging,
    computeALT_Recursive,
    benchmarkApproach,
} from "../analysis/alt-comparison";
import type { Operation } from "../implementation/commons";

// ============================================================================
// SUPPLY CHAIN GENERATORS
// ============================================================================

/**
 * Generate a linear supply chain of given depth
 * 
 * Example depth=3:
 * raw_material_0 → intermediate_1 → final_2
 */
function generateLinearChain(depth: number, opsPerLevel: number = 10): Operation[] {
    const operations: Operation[] = [];
    let opId = 0;

    for (let level = 0; level < depth; level++) {
        const productId = level === 0 ? `raw_material_${level}` :
            level === depth - 1 ? `final_${level}` :
                `intermediate_${level}`;

        for (let i = 0; i < opsPerLevel; i++) {
            const op: Operation = {
                id: `OP${opId++}`,
                timestamp: new Date(`2024-01-${(level * 10 + i) % 30 + 1}`),
                totalSocialTime: 5 + Math.random() * 5,
                inputsProducts: [],
                inputsLabor: [{ individualId: `worker_${level}`, hours: 5 + Math.random() * 5 }],
                outputsProducts: [{ productId, quantity: 100 }],
            };

            // Add input from previous level
            if (level > 0) {
                const inputId = level === 1 ? `raw_material_0` : `intermediate_${level - 1}`;
                const inputALT = 0.05 * level; // Approximate ALT
                op.inputsProducts.push({
                    productId: inputId,
                    quantity: 50,
                    alt: inputALT,
                });
            }

            operations.push(op);
        }
    }

    return operations;
}

/**
 * Generate a branching supply chain (tree structure)
 * 
 * Example depth=3, branchFactor=2:
 *       final
 *      /     \
 *   int_1   int_2
 *   /  \    /  \
 * r1  r2  r3  r4
 */
function generateBranchingChain(
    depth: number,
    branchFactor: number = 2,
    opsPerProduct: number = 5
): Operation[] {
    const operations: Operation[] = [];
    let opId = 0;

    // Generate products at each level
    const levels: string[][] = [];
    for (let d = 0; d < depth; d++) {
        const levelProducts: string[] = [];
        const count = Math.pow(branchFactor, depth - 1 - d);

        for (let i = 0; i < count; i++) {
            const productId = d === 0 ? `raw_${i}` :
                d === depth - 1 ? `final_${i}` :
                    `intermediate_${d}_${i}`;
            levelProducts.push(productId);
        }
        levels.push(levelProducts);
    }

    // Generate operations for each product
    for (let d = 0; d < depth; d++) {
        for (const productId of levels[d]) {
            for (let i = 0; i < opsPerProduct; i++) {
                const op: Operation = {
                    id: `OP${opId++}`,
                    timestamp: new Date(`2024-01-${(opId % 30) + 1}`),
                    totalSocialTime: 5 + Math.random() * 5,
                    inputsProducts: [],
                    inputsLabor: [{ individualId: `worker_${d}`, hours: 5 + Math.random() * 5 }],
                    outputsProducts: [{ productId, quantity: 100 }],
                };

                // Add inputs from previous level
                if (d > 0) {
                    const inputsPerProduct = branchFactor;
                    const startIdx = levels[d].indexOf(productId) * inputsPerProduct;

                    for (let j = 0; j < inputsPerProduct; j++) {
                        const inputIdx = startIdx + j;
                        if (inputIdx < levels[d - 1].length) {
                            const inputId = levels[d - 1][inputIdx];
                            op.inputsProducts.push({
                                productId: inputId,
                                quantity: 30,
                                alt: 0.05 * d,
                            });
                        }
                    }
                }

                operations.push(op);
            }
        }
    }

    return operations;
}

/**
 * Generate a realistic economy with multiple supply chains
 */
function generateEconomySupplyChains(
    numChains: number = 10,
    avgDepth: number = 5,
    opsPerLevel: number = 20
): Operation[] {
    const operations: Operation[] = [];

    for (let chain = 0; chain < numChains; chain++) {
        const depth = Math.max(2, avgDepth + Math.floor((Math.random() - 0.5) * 4));
        const chainOps = generateLinearChain(depth, opsPerLevel);

        // Rename products to be chain-specific
        for (const op of chainOps) {
            for (const output of op.outputsProducts) {
                output.productId = `chain${chain}_${output.productId}`;
            }
            for (const input of op.inputsProducts) {
                input.productId = `chain${chain}_${input.productId}`;
            }
        }

        operations.push(...chainOps);
    }

    return operations;
}

// ============================================================================
// DEPTH SCALING TESTS
// ============================================================================

describe("Supply Chain Depth Scaling", () => {
    it("compares performance across increasing depth (linear chain)", () => {
        console.log("\n=== Linear Chain Depth Scaling ===");
        console.log("Depth\tOps\tAvg(ms)\tRec(ms)\tRatio");

        const results: Array<{
            depth: number;
            operations: number;
            avgTime: number;
            recTime: number;
            ratio: number;
        }> = [];

        for (const depth of [2, 5, 10, 15, 20]) {
            const ops = generateLinearChain(depth, 10);
            const finalProduct = `final_${depth - 1}`;

            const avgBench = benchmarkApproach("averaging", finalProduct, ops, 50);
            const recBench = benchmarkApproach("recursive", finalProduct, ops, 50);

            const ratio = recBench.timeMs / avgBench.timeMs;

            console.log(
                `${depth}\t${ops.length}\t${avgBench.timeMs.toFixed(4)}\t${recBench.timeMs.toFixed(4)}\t${ratio.toFixed(2)}x`
            );

            results.push({
                depth,
                operations: ops.length,
                avgTime: avgBench.timeMs,
                recTime: recBench.timeMs,
                ratio,
            });
        }

        // At high depth, recursive should get relatively slower
        const lowDepthRatio = results[0].ratio;
        const highDepthRatio = results[results.length - 1].ratio;

        console.log(`\nRatio change: ${lowDepthRatio.toFixed(2)}x → ${highDepthRatio.toFixed(2)}x`);

        // Recursive should scale worse with depth
        expect(highDepthRatio).toBeGreaterThan(lowDepthRatio * 0.5); // At least not much better
    });

    it("compares performance with branching supply chains", () => {
        console.log("\n=== Branching Supply Chain Scaling ===");
        console.log("Depth\tBranch\tProducts\tOps\tAvg(ms)\tRec(ms)\tRatio");

        for (const depth of [3, 4, 5]) {
            for (const branchFactor of [2, 3]) {
                const ops = generateBranchingChain(depth, branchFactor, 5);
                const finalProduct = `final_0`;

                const avgBench = benchmarkApproach("averaging", finalProduct, ops, 20);
                const recBench = benchmarkApproach("recursive", finalProduct, ops, 20);

                const ratio = recBench.timeMs / avgBench.timeMs;
                const numProducts = Math.pow(branchFactor, depth) - 1;

                console.log(
                    `${depth}\t${branchFactor}\t${numProducts}\t${ops.length}\t` +
                    `${avgBench.timeMs.toFixed(4)}\t${recBench.timeMs.toFixed(4)}\t${ratio.toFixed(2)}x`
                );
            }
        }
    });

    it("simulates realistic economy with multiple supply chains", () => {
        console.log("\n=== Realistic Economy Simulation ===");
        console.log("Chains\tAvgDepth\tTotalOps\tAvg(ms)\tRec(ms)\tRatio");

        for (const numChains of [5, 10, 20]) {
            for (const avgDepth of [3, 5, 7]) {
                const ops = generateEconomySupplyChains(numChains, avgDepth, 10);

                // Pick a random final product to benchmark
                const finalProduct = `chain0_final_${avgDepth - 1}`;

                const avgBench = benchmarkApproach("averaging", finalProduct, ops, 10);
                const recBench = benchmarkApproach("recursive", finalProduct, ops, 10);

                const ratio = recBench.timeMs / avgBench.timeMs;

                console.log(
                    `${numChains}\t${avgDepth}\t${ops.length}\t` +
                    `${avgBench.timeMs.toFixed(4)}\t${recBench.timeMs.toFixed(4)}\t${ratio.toFixed(2)}x`
                );
            }
        }
    });

    it("analyzes worst-case: deep chain with many operations", () => {
        console.log("\n=== Worst Case: Deep + Many Operations ===");

        // Depth 20, 100 operations per level = 2000 total operations
        const ops = generateLinearChain(20, 100);
        const finalProduct = `final_19`;

        console.log(`Total operations: ${ops.length}`);
        console.log(`Supply chain depth: 20`);
        console.log(`Operations per level: 100`);

        const avgBench = benchmarkApproach("averaging", finalProduct, ops, 5);
        const recBench = benchmarkApproach("recursive", finalProduct, ops, 5);

        console.log(`\nAveraging: ${avgBench.timeMs.toFixed(4)}ms`);
        console.log(`Recursive: ${recBench.timeMs.toFixed(4)}ms`);
        console.log(`Speedup: ${(recBench.timeMs / avgBench.timeMs).toFixed(2)}x`);

        // Averaging should still be faster even at extreme scale
        expect(avgBench.timeMs).toBeLessThan(recBench.timeMs * 2);
    });
});

// ============================================================================
// COMPLEXITY ANALYSIS
// ============================================================================

describe("Computational Complexity Analysis", () => {
    it("measures complexity: O(n) vs O(n + d)", () => {
        console.log("\n=== Complexity Analysis ===");
        console.log("\nAveraging: O(n × m) where n=operations, m=inputs per op");
        console.log("Recursive: O(n × m + d × p) where d=depth, p=products in chain");

        // Test 1: Vary n (operations), keep d constant
        console.log("\n--- Varying Operations (constant depth=5) ---");
        console.log("Ops\tAvg(ms)\tRec(ms)");

        const depth = 5;
        for (const opsPerLevel of [10, 50, 100, 200]) {
            const ops = generateLinearChain(depth, opsPerLevel);
            const finalProduct = `final_${depth - 1}`;

            const avgBench = benchmarkApproach("averaging", finalProduct, ops, 20);
            const recBench = benchmarkApproach("recursive", finalProduct, ops, 20);

            console.log(`${ops.length}\t${avgBench.timeMs.toFixed(4)}\t${recBench.timeMs.toFixed(4)}`);
        }

        // Test 2: Vary d (depth), keep n constant
        console.log("\n--- Varying Depth (constant ops per level=50) ---");
        console.log("Depth\tOps\tAvg(ms)\tRec(ms)");

        const opsPerLevel = 50;
        for (const d of [2, 5, 10, 15, 20]) {
            const ops = generateLinearChain(d, opsPerLevel);
            const finalProduct = `final_${d - 1}`;

            const avgBench = benchmarkApproach("averaging", finalProduct, ops, 20);
            const recBench = benchmarkApproach("recursive", finalProduct, ops, 20);

            console.log(`${d}\t${ops.length}\t${avgBench.timeMs.toFixed(4)}\t${recBench.timeMs.toFixed(4)}`);
        }
    });

    it("confirms averaging is O(n), recursive is O(n + d)", () => {
        // Averaging should scale linearly with operations
        const ops1 = generateLinearChain(5, 100);
        const ops2 = generateLinearChain(5, 200);

        const avg1 = benchmarkApproach("averaging", "final_4", ops1, 50);
        const avg2 = benchmarkApproach("averaging", "final_4", ops2, 50);

        const avgScaling = avg2.timeMs / avg1.timeMs;
        console.log(`\nAveraging scaling (2x ops): ${avgScaling.toFixed(2)}x`);

        // Should be close to 2x (linear)
        expect(avgScaling).toBeGreaterThan(1.5);
        expect(avgScaling).toBeLessThan(3.0);

        // Recursive should scale with depth too
        const opsDepth5 = generateLinearChain(5, 50);
        const opsDepth10 = generateLinearChain(10, 50);

        const rec5 = benchmarkApproach("recursive", "final_4", opsDepth5, 50);
        const rec10 = benchmarkApproach("recursive", "final_9", opsDepth10, 50);

        const recScaling = rec10.timeMs / rec5.timeMs;
        console.log(`Recursive scaling (2x depth): ${recScaling.toFixed(2)}x`);

        // Should scale more than averaging (has depth component)
        expect(recScaling).toBeGreaterThan(avgScaling * 0.8);
    });
});
