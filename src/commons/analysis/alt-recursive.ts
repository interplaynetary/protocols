/**
 * Recursive ALT Calculation
 * 
 * Demonstrates the recursive nature of Average Labor Time computation
 * and provides algorithms for computing ALTs across a production network.
 */

import type { Operation, StockBook, ALTComputation } from "../implementation/commons";

// ============================================================================
// RECURSIVE ALT COMPUTATION
// ============================================================================

/**
 * Dependency graph for ALT computation
 */
export interface ALTDependencyGraph {
    /** Product ID */
    productId: string;

    /** Direct labor time per unit */
    directLabor: number;

    /** Input dependencies */
    inputs: Array<{
        productId: string;
        quantityPerUnit: number;
    }>;

    /** Whether ALT has been computed */
    computed: boolean;

    /** Computed ALT value */
    alt?: number;
}

/**
 * Build dependency graph from operations
 * 
 * Correctly aggregates multiple operations producing the same product
 * by calculating the WEIGHTED AVERAGE of their inputs and labor.
 * 
 * Algorithm:
 * 1. Pass 1: Aggregate totals (Labor, Output Qty, Input Qty) per product.
 *    - Handles Joint Production by splitting operation inputs among outputs.
 * 2. Pass 2: Calculate averages (Total Input / Total Output) for graph nodes.
 */
export function buildALTDependencyGraph(
    operations: Operation[]
): Map<string, ALTDependencyGraph> {

    // Intermediate aggregation structure
    interface ProductAggregator {
        directLaborSum: number;
        outputQuantitySum: number;
        inputSums: Map<string, number>; // inputId -> totalQuantityUsed
    }

    const aggregators = new Map<string, ProductAggregator>();

    // Pass 1: Aggregate Totals
    for (const op of operations) {
        const effects = op.effects;
        if (effects.length === 0) continue;

        // Splitting Logic (1/N split among distinct product types)
        const splitFactor = 1.0 / effects.length;

        // LABOR TRANSFER LOGIC (Unified Formula)
        // Value = Hours * (1 + ALT_skill / Lifespan_skill)
        const SKILL_DEPRECIATION_FACTOR = 0.05; // Placeholder
        const totalOpLabor = op.inputsLabor.reduce((sum, l) => sum + l.hours * (1 + SKILL_DEPRECIATION_FACTOR), 0);

        for (const effect of effects) {
            if (!aggregators.has(effect.productId)) {
                aggregators.set(effect.productId, {
                    directLaborSum: 0,
                    outputQuantitySum: 0,
                    inputSums: new Map()
                });
            }
            const agg = aggregators.get(effect.productId)!;

            // Accumulate Output Quantity
            agg.outputQuantitySum += effect.quantity;

            // Accumulate Allocated Labor
            agg.directLaborSum += totalOpLabor * splitFactor;

            // Accumulate Allocated Inputs
            for (const input of op.inputsProducts) {
                const allocatedQty = input.quantity * splitFactor;
                const currentInputSum = agg.inputSums.get(input.productId) || 0;
                agg.inputSums.set(input.productId, currentInputSum + allocatedQty);
            }
        }
    }

    // Pass 2: Calculate Averages (Graph Construction)
    const graph = new Map<string, ALTDependencyGraph>();

    for (const [productId, agg] of aggregators.entries()) {
        const inputs: Array<{ productId: string; quantityPerUnit: number }> = [];

        for (const [inputId, totalInputQty] of agg.inputSums.entries()) {
            inputs.push({
                productId: inputId,
                quantityPerUnit: totalInputQty / agg.outputQuantitySum
            });
        }

        graph.set(productId, {
            productId,
            directLabor: agg.directLaborSum / agg.outputQuantitySum,
            inputs,
            computed: false
        });
    }

    return graph;
}

/**
 * Compute ALT recursively using topological sort
 * 
 * This ensures dependencies are computed before dependents
 */
export function computeALTRecursive(
    graph: Map<string, ALTDependencyGraph>
): Map<string, number> {
    const alts = new Map<string, number>();
    const visited = new Set<string>();
    const visiting = new Set<string>();

    function visit(productId: string): number {
        // Already computed
        if (alts.has(productId)) {
            return alts.get(productId)!;
        }

        // Circular dependency detection
        if (visiting.has(productId)) {
            throw new Error(`Circular dependency detected for product: ${productId}`);
        }

        const node = graph.get(productId);
        if (!node) {
            // Product not in graph (e.g., raw material)
            // Assume ALT = 0 for raw materials
            alts.set(productId, 0);
            return 0;
        }

        visiting.add(productId);

        // Recursively compute ALTs for all inputs
        let embodiedLabor = 0;
        for (const input of node.inputs) {
            const inputALT = visit(input.productId);
            embodiedLabor += input.quantityPerUnit * inputALT;
        }

        // Total ALT = direct labor + embodied labor from inputs
        const totalALT = node.directLabor + embodiedLabor;

        alts.set(productId, totalALT);
        visiting.delete(productId);
        visited.add(productId);

        return totalALT;
    }

    // Compute ALT for all products
    for (const productId of graph.keys()) {
        if (!visited.has(productId)) {
            visit(productId);
        }
    }

    return alts;
}

/**
 * Compute ALTs for all products in stock-book
 */
export function computeAllALTs(stockBook: StockBook): Map<string, ALTComputation> {
    const graph = buildALTDependencyGraph(stockBook.operations);
    const alts = computeALTRecursive(graph);

    const results = new Map<string, ALTComputation>();

    for (const [productId, alt] of alts.entries()) {
        // Get total quantity produced
        const relevantOps = stockBook.operations.filter(op =>
            op.effects.some(out => out.productId === productId)
        );

        const totalQuantity = relevantOps.reduce((sum, op) => {
            const effect = op.effects.find(out => out.productId === productId);
            return sum + (effect?.quantity || 0);
        }, 0);

        const totalLaborTime = alt * totalQuantity;

        results.set(productId, {
            productId,
            alt,
            totalQuantity,
            totalLaborTime,
            computedAt: new Date(),
        });
    }

    return results;
}

// ============================================================================
// ITERATIVE ALT COMPUTATION (Alternative approach)
// ============================================================================

/**
 * Compute ALTs iteratively until convergence
 * 
 * This approach is useful when there are circular dependencies
 * (though circular dependencies shouldn't exist in a proper production network)
 */
export function computeALTIterative(
    graph: Map<string, ALTDependencyGraph>,
    maxIterations: number = 100,
    tolerance: number = 0.0001
): Map<string, number> {
    const alts = new Map<string, number>();

    // Initialize all ALTs to direct labor only
    for (const [productId, node] of graph.entries()) {
        alts.set(productId, node.directLabor);
    }

    // Iterate until convergence
    for (let iter = 0; iter < maxIterations; iter++) {
        const newALTs = new Map<string, number>();
        let maxChange = 0;

        for (const [productId, node] of graph.entries()) {
            // Compute embodied labor from inputs
            let embodiedLabor = 0;
            for (const input of node.inputs) {
                const inputALT = alts.get(input.productId) || 0;
                embodiedLabor += input.quantityPerUnit * inputALT;
            }

            const newALT = node.directLabor + embodiedLabor;
            newALTs.set(productId, newALT);

            // Track maximum change
            const oldALT = alts.get(productId) || 0;
            const change = Math.abs(newALT - oldALT);
            maxChange = Math.max(maxChange, change);
        }

        // Update ALTs
        for (const [productId, alt] of newALTs.entries()) {
            alts.set(productId, alt);
        }

        // Check convergence
        if (maxChange < tolerance) {
            console.log(`ALT computation converged in ${iter + 1} iterations`);
            break;
        }
    }

    return alts;
}

// ============================================================================
// VISUALIZATION HELPERS
// ============================================================================

/**
 * Get ALT breakdown for a product (showing recursion)
 */
export interface ALTBreakdown {
    productId: string;
    totalALT: number;
    directLabor: number;
    embodiedLabor: number;
    inputs: Array<{
        productId: string;
        quantity: number;
        alt: number;
        contribution: number;
    }>;
}

export function getALTBreakdown(
    productId: string,
    graph: Map<string, ALTDependencyGraph>,
    alts: Map<string, number>
): ALTBreakdown {
    const node = graph.get(productId);
    if (!node) {
        throw new Error(`Product ${productId} not found in graph`);
    }

    const totalALT = alts.get(productId) || 0;
    const directLabor = node.directLabor;

    const inputs = node.inputs.map(input => ({
        productId: input.productId,
        quantity: input.quantityPerUnit,
        alt: alts.get(input.productId) || 0,
        contribution: input.quantityPerUnit * (alts.get(input.productId) || 0),
    }));

    const embodiedLabor = inputs.reduce((sum, i) => sum + i.contribution, 0);

    return {
        productId,
        totalALT,
        directLabor,
        embodiedLabor,
        inputs,
    };
}

/**
 * Print ALT breakdown (for debugging)
 */
export function printALTBreakdown(breakdown: ALTBreakdown): string {
    const lines = [
        `ALT Breakdown for ${breakdown.productId}:`,
        `  Total ALT: ${breakdown.totalALT.toFixed(4)}h`,
        `  Direct Labor: ${breakdown.directLabor.toFixed(4)}h`,
        `  Embodied Labor: ${breakdown.embodiedLabor.toFixed(4)}h`,
        `  Inputs:`,
    ];

    for (const input of breakdown.inputs) {
        lines.push(
            `    - ${input.productId}: ${input.quantity.toFixed(2)} × ${input.alt.toFixed(4)}h = ${input.contribution.toFixed(4)}h`
        );
    }

    return lines.join('\n');
}
