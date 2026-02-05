/**
 * Comparison of Two ALT Calculation Approaches
 * 
 * 1. Marx's Averaging Approach (from notes.md)
 * 2. Recursive Dependency Graph Approach (what we implemented)
 * 
 * This file implements both and compares:
 * - Results (are they the same?)
 * - Computational complexity
 * - Scalability
 * - Edge cases
 */

import type { Operation, StockBook } from "./commons";

// ============================================================================
// APPROACH 1: MARX'S AVERAGING (Simple, Direct)
// ============================================================================

/**
 * Marx's approach: Simple average across operations
 * 
 * "average labor time for definite quantities = 
 *  Σ(labor time for definite quantities) / number of labor-times being averaged"
 * 
 * Each operation's labor-time includes:
 * - Direct labor
 * - Input ALTs (added to labor pool during recording)
 */
export function computeALT_Averaging(
    productId: string,
    operations: Operation[]
): { alt: number; totalQuantity: number; totalLaborTime: number } | null {
    const relevantOps = operations.filter(op =>
        op.outputsProducts.some(out => out.productId === productId)
    );

    if (relevantOps.length === 0) return null;

    let totalQuantity = 0;
    let totalLaborTime = 0;

    for (const op of relevantOps) {
        const output = op.outputsProducts.find(out => out.productId === productId);
        if (!output) continue;

        totalQuantity += output.quantity;

        // Direct labor
        const directLabor = op.inputsLabor.reduce((sum, l) => sum + l.hours, 0);
        totalLaborTime += directLabor;

        // Input ALTs (already computed, just use them)
        for (const input of op.inputsProducts) {
            if (input.alt !== undefined) {
                totalLaborTime += input.quantity * input.alt;
            }
        }
    }

    if (totalQuantity === 0) return null;

    return {
        alt: totalLaborTime / totalQuantity,
        totalQuantity,
        totalLaborTime,
    };
}

/**
 * Complexity: O(n × m)
 * where n = number of operations, m = average inputs per operation
 * 
 * No recursion, no dependency graph building
 */

// ============================================================================
// APPROACH 2: RECURSIVE DEPENDENCY GRAPH
// ============================================================================

interface DependencyNode {
    productId: string;
    directLaborPerUnit: number;
    inputs: Array<{
        productId: string;
        quantityPerUnit: number;
    }>;
}

/**
 * Recursive approach: Build dependency graph, compute from leaves up
 */
export function computeALT_Recursive(
    productId: string,
    operations: Operation[]
): { alt: number; totalQuantity: number; totalLaborTime: number } | null {
    // Build dependency graph
    const graph = buildDependencyGraph(operations);

    if (!graph.has(productId)) return null;

    // Compute ALTs recursively
    const alts = new Map<string, number>();
    const visited = new Set<string>();
    const visiting = new Set<string>();

    function visit(pid: string): number {
        if (alts.has(pid)) return alts.get(pid)!;

        if (visiting.has(pid)) {
            throw new Error(`Circular dependency: ${pid}`);
        }

        const node = graph.get(pid);
        if (!node) return 0; // Raw material

        visiting.add(pid);

        let embodiedLabor = 0;
        for (const input of node.inputs) {
            const inputALT = visit(input.productId);
            embodiedLabor += input.quantityPerUnit * inputALT;
        }

        const totalALT = node.directLaborPerUnit + embodiedLabor;
        alts.set(pid, totalALT);
        visiting.delete(pid);
        visited.add(pid);

        return totalALT;
    }

    const alt = visit(productId);

    // Get total quantity for this product
    const relevantOps = operations.filter(op =>
        op.outputsProducts.some(out => out.productId === productId)
    );
    const totalQuantity = relevantOps.reduce((sum, op) => {
        const output = op.outputsProducts.find(out => out.productId === productId);
        return sum + (output?.quantity || 0);
    }, 0);

    return {
        alt,
        totalQuantity,
        totalLaborTime: alt * totalQuantity,
    };
}

function buildDependencyGraph(operations: Operation[]): Map<string, DependencyNode> {
    const graph = new Map<string, DependencyNode>();

    // First pass: collect all data
    const productData = new Map<string, {
        totalDirectLabor: number;
        totalQuantity: number;
        inputs: Map<string, number>; // productId -> total quantity
    }>();

    for (const op of operations) {
        for (const output of op.outputsProducts) {
            if (!productData.has(output.productId)) {
                productData.set(output.productId, {
                    totalDirectLabor: 0,
                    totalQuantity: 0,
                    inputs: new Map(),
                });
            }

            const data = productData.get(output.productId)!;

            // Accumulate direct labor and quantity
            const directLabor = op.inputsLabor.reduce((sum, l) => sum + l.hours, 0);
            data.totalDirectLabor += directLabor;
            data.totalQuantity += output.quantity;

            // Accumulate inputs
            for (const input of op.inputsProducts) {
                const currentQty = data.inputs.get(input.productId) || 0;
                data.inputs.set(input.productId, currentQty + input.quantity);
            }
        }
    }

    // Second pass: compute averages
    for (const [productId, data] of productData.entries()) {
        const node: DependencyNode = {
            productId,
            directLaborPerUnit: data.totalDirectLabor / data.totalQuantity,
            inputs: [],
        };

        // Average inputs per unit
        for (const [inputId, totalQty] of data.inputs.entries()) {
            node.inputs.push({
                productId: inputId,
                quantityPerUnit: totalQty / data.totalQuantity,
            });
        }

        graph.set(productId, node);
    }

    return graph;
}

/**
 * Complexity: O(n × m + d)
 * where n = operations, m = inputs per operation, d = depth of dependency tree
 * 
 * Requires building full dependency graph
 * Requires recursive traversal
 */

// ============================================================================
// COMPARISON UTILITIES
// ============================================================================

export interface ComparisonResult {
    productId: string;
    averaging: {
        alt: number;
        totalQuantity: number;
        totalLaborTime: number;
    } | null;
    recursive: {
        alt: number;
        totalQuantity: number;
        totalLaborTime: number;
    } | null;
    match: boolean;
    difference: number;
    percentDifference: number;
}

export function compareApproaches(
    productId: string,
    operations: Operation[]
): ComparisonResult {
    const averaging = computeALT_Averaging(productId, operations);
    const recursive = computeALT_Recursive(productId, operations);

    let match = false;
    let difference = 0;
    let percentDifference = 0;

    if (averaging && recursive) {
        difference = Math.abs(averaging.alt - recursive.alt);
        percentDifference = (difference / averaging.alt) * 100;
        match = difference < 0.0001; // Floating point tolerance
    } else if (!averaging && !recursive) {
        match = true;
    }

    return {
        productId,
        averaging,
        recursive,
        match,
        difference,
        percentDifference,
    };
}

export function compareAllProducts(
    stockBook: StockBook
): ComparisonResult[] {
    const results: ComparisonResult[] = [];

    for (const productId of Object.keys(stockBook.products)) {
        results.push(compareApproaches(productId, stockBook.operations));
    }

    return results;
}

// ============================================================================
// PERFORMANCE BENCHMARKING
// ============================================================================

export interface PerformanceResult {
    approach: "averaging" | "recursive";
    productId: string;
    operationCount: number;
    timeMs: number;
    memoryMB?: number;
}

export function benchmarkApproach(
    approach: "averaging" | "recursive",
    productId: string,
    operations: Operation[],
    iterations: number = 100
): PerformanceResult {
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
        if (approach === "averaging") {
            computeALT_Averaging(productId, operations);
        } else {
            computeALT_Recursive(productId, operations);
        }
    }

    const endTime = performance.now();
    const avgTime = (endTime - startTime) / iterations;

    return {
        approach,
        productId,
        operationCount: operations.length,
        timeMs: avgTime,
    };
}

export function benchmarkBoth(
    productId: string,
    operations: Operation[],
    iterations: number = 100
): {
    averaging: PerformanceResult;
    recursive: PerformanceResult;
    speedup: number;
} {
    const averaging = benchmarkApproach("averaging", productId, operations, iterations);
    const recursive = benchmarkApproach("recursive", productId, operations, iterations);

    return {
        averaging,
        recursive,
        speedup: recursive.timeMs / averaging.timeMs,
    };
}

// ============================================================================
// SCALABILITY ANALYSIS
// ============================================================================

export interface ScalabilityResult {
    operationCount: number;
    averaging: {
        timeMs: number;
        complexity: string;
    };
    recursive: {
        timeMs: number;
        complexity: string;
    };
    ratio: number;
}

export function analyzeScalability(
    operations: Operation[],
    productId: string,
    sizes: number[] = [10, 50, 100, 500, 1000]
): ScalabilityResult[] {
    const results: ScalabilityResult[] = [];

    for (const size of sizes) {
        const subset = operations.slice(0, Math.min(size, operations.length));

        const avgBench = benchmarkApproach("averaging", productId, subset, 10);
        const recBench = benchmarkApproach("recursive", productId, subset, 10);

        results.push({
            operationCount: subset.length,
            averaging: {
                timeMs: avgBench.timeMs,
                complexity: "O(n × m)",
            },
            recursive: {
                timeMs: recBench.timeMs,
                complexity: "O(n × m + d)",
            },
            ratio: recBench.timeMs / avgBench.timeMs,
        });
    }

    return results;
}
