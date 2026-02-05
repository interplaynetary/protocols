/**
 * Optimization Solver for Communal Production Planning
 * 
 * Implements the complete optimization problem from allocation-planning.md:
 * 
 * Maximize: T_free = T_total - T_necessary
 * Where: T_necessary = T_direct + T_inefficiency
 * 
 * Subject to:
 * 1. Production constraints (material balance)
 * 2. Labor constraints (capacity limits)
 * 3. Deduction constraints (D1, D3, D6 must be satisfied)
 * 4. Risk constraints (reserves)
 * 
 * With objectives:
 * - Maximize D5 (common needs)
 * - Minimize D4 (admin costs)
 * - Target D2 (expansion)
 */

import type {
    StockBook,
    AllocationPlan,
    Deduction,
    PlanningConstraints,
    PlanningObjective,
} from "./commons";

// ============================================================================
// OPTIMIZATION PROBLEM DEFINITION
// ============================================================================

/**
 * Decision variables for the optimization problem
 */
export interface DecisionVariables {
    /** x_{i,t}: Quantity of product i to produce */
    production: Record<string, number>;

    /** a_{i,j,t}: Quantity of product i allocated to operation j */
    allocations: Record<string, Record<string, number>>;

    /** s_{i,t}: Stock of product i at end of period */
    stocks: Record<string, number>;

    /** r_{i,t}: Reserves of product i */
    reserves: Record<string, number>;

    /** l_{τ,t}: Labor of type τ used */
    labor: Record<string, number>;

    /** Deduction allocations */
    deductions: {
        D1_replacement: Record<string, number>;
        D2_expansion: Record<string, number>;
        D3_reserves: Record<string, number>;
        D4_administration: Record<string, number>;
        D5_common_needs: Record<string, number>;
        D6_support: Record<string, number>;
    };
}

/**
 * Optimization result
 */
export interface OptimizationResult {
    /** Optimal decision variables */
    solution: DecisionVariables;

    /** Objective value achieved */
    objectiveValue: number;

    /** Free time achieved */
    freeTime: number;

    /** Direct necessary time */
    directTime: number;

    /** Inefficiency time */
    inefficiencyTime: number;

    /** Whether all constraints were satisfied */
    feasible: boolean;

    /** Constraint violations (if any) */
    violations: string[];

    /** Solver status */
    status: "optimal" | "feasible" | "infeasible" | "unbounded";
}

/**
 * Planning parameters
 */
export interface PlanningParameters {
    /** Total time available (hours) */
    totalTime: number;

    /** Planning period (e.g., "2024-W10") */
    period: string;

    /** Variance penalty weight (α) */
    variancePenalty: number;

    /** Shortage penalty weight (β) */
    shortagePenalty: number;

    /** Historical variances for risk adjustment */
    historicalVariances: Record<string, number[]>;

    /** Product criticality scores (0-1) */
    criticality: Record<string, number>;

    /** Deduction targets */
    deductionTargets: {
        D1_replacement: Record<string, number>;
        D2_expansion_target: number;
        D3_reserve_factor: number;
        D4_admin_max: number;
        D5_common_min: number;
        D6_support_target: number; // Changed to objective target
    };
}

// ============================================================================
// CONSTRAINT EVALUATION
// ============================================================================

/**
 * Evaluate production constraints
 * 
 * For each product i: Produced_i + Stock_i ≥ 
 *   Consumption_i + D1_i + D2_i + D3_i + D4_i + D5_i + D6_i
 */
export function evaluateProductionConstraints(
    vars: DecisionVariables,
    stockBook: StockBook,
    params: PlanningParameters
): { satisfied: boolean; violations: string[] } {
    const violations: string[] = [];

    for (const [productId, product] of Object.entries(stockBook.products)) {
        const produced = vars.production[productId] || 0;
        const currentStock = stockBook.stocks[productId]?.quantity || 0;
        const available = produced + currentStock;

        // Sum all deductions for this product
        const d1 = vars.deductions.D1_replacement[productId] || 0;
        const d2 = vars.deductions.D2_expansion[productId] || 0;
        const d3 = vars.deductions.D3_reserves[productId] || 0;
        const d4 = vars.deductions.D4_administration[productId] || 0;
        const d5 = vars.deductions.D5_common_needs[productId] || 0;
        const d6 = vars.deductions.D6_support[productId] || 0;

        const totalNeeded = d1 + d2 + d3 + d4 + d5 + d6;

        if (available < totalNeeded) {
            violations.push(
                `Product ${productId}: Available ${available} < Needed ${totalNeeded}`
            );
        }
    }

    return {
        satisfied: violations.length === 0,
        violations,
    };
}

/**
 * Evaluate labor constraints
 * 
 * For each labor type τ: Available_τ ≥ Production_τ + Reproduction_τ + Training_τ + Admin_τ
 */
export function evaluateLaborConstraints(
    vars: DecisionVariables,
    stockBook: StockBook,
    params: PlanningParameters
): { satisfied: boolean; violations: string[] } {
    const violations: string[] = [];

    for (const [individualId, individual] of Object.entries(stockBook.individuals)) {
        for (const laborPower of individual.laborPowers) {
            const available = laborPower.hoursPerDay * 7; // Weekly capacity
            const used = vars.labor[laborPower.type] || 0;

            // Apply buffer (10% reserve)
            const effectiveCapacity = available * 0.9;

            if (used > effectiveCapacity) {
                violations.push(
                    `Labor ${laborPower.type}: Used ${used}h > Available ${effectiveCapacity}h`
                );
            }
        }
    }

    return {
        satisfied: violations.length === 0,
        violations,
    };
}

/**
 * Evaluate System 2 (Skill Inventory) constraints
 * 
 * For each skill: Allocated Hours <= Remaining Lifespan
 */
export function evaluateSkillConstraints(
    vars: DecisionVariables,
    stockBook: StockBook,
    params: PlanningParameters
): { satisfied: boolean; violations: string[] } {
    const violations: string[] = [];

    // Aggregate allocated labor by type
    const allocatedByType: Record<string, number> = {};
    for (const [type, hours] of Object.entries(vars.labor)) {
        allocatedByType[type] = (allocatedByType[type] || 0) + hours;
    }

    // Check against individual skill inventories
    // Simplified: Aggregating total skill inventory for the community
    const totalCommunitySkill: Record<string, number> = {};
    for (const ind of Object.values(stockBook.individuals)) {
        if (ind.skillsInventory) {
            for (const [skill, hours] of Object.entries(ind.skillsInventory)) {
                totalCommunitySkill[skill] = (totalCommunitySkill[skill] || 0) + hours;
            }
        }
    }

    for (const [type, allocated] of Object.entries(allocatedByType)) {
        const available = totalCommunitySkill[type] || 0;
        if (allocated > available) {
            violations.push(
                `System 2 Constraint: Skill ${type}: Needs ${allocated}h > Inventory ${available}h`
            );
        }
    }

    return {
        satisfied: violations.length === 0,
        violations
    };
}

/**
 * Evaluate deduction-specific constraints
 * 
 * D1: Replacement_i ≥ Depreciation_i (must satisfy)
 * D3: Reserves_i ≥ Risk_factor_i × Usage_i (must satisfy)
 * D6: Support ≥ Guaranteed_minimum (must satisfy)
 */
export function evaluateDeductionConstraints(
    vars: DecisionVariables,
    params: PlanningParameters
): { satisfied: boolean; violations: string[] } {
    const violations: string[] = [];

    // D1: Replacement must meet depreciation
    for (const [productId, required] of Object.entries(params.deductionTargets.D1_replacement)) {
        const allocated = vars.deductions.D1_replacement[productId] || 0;
        if (allocated < required) {
            violations.push(
                `D1 (replacement) ${productId}: Allocated ${allocated} < Required ${required}`
            );
        }
    }

    // D3: Reserves must meet risk requirements
    const reserveFactor = params.deductionTargets.D3_reserve_factor;
    for (const [productId, usage] of Object.entries(vars.production)) {
        const requiredReserve = usage * reserveFactor;
        const allocated = vars.deductions.D3_reserves[productId] || 0;
        if (allocated < requiredReserve) {
            violations.push(
                `D3 (reserves) ${productId}: Allocated ${allocated} < Required ${requiredReserve}`
            );
        }
    }

    // D6 is now an objective (not a constraint)

    return {
        satisfied: violations.length === 0,
        violations,
    };
}

// ============================================================================
// OBJECTIVE FUNCTION
// ============================================================================

/**
 * Compute objective value: Maximize T_free
 * 
 * T_free = T_total - T_necessary
 * T_necessary = T_direct + T_inefficiency
 * T_inefficiency = α × Variance + β × Shortage
 */
export function computeObjectiveValue(
    vars: DecisionVariables,
    params: PlanningParameters,
    historicalPlan?: AllocationPlan
): PlanningObjective {
    // Direct time: sum of all labor used
    const directTime = Object.values(vars.labor).reduce((sum, hours) => sum + hours, 0);

    // Variance cost (if we have historical plan to compare)
    let varianceCost = 0;
    if (historicalPlan) {
        for (const allocation of historicalPlan.productAllocations) {
            const planned = allocation.plannedQty;
            const actual = vars.production[allocation.productId] || 0;
            const variance = actual - planned;
            varianceCost += variance * variance;
        }
    }

    // Shortage cost
    let shortageCost = 0;
    for (const [productId, product] of Object.entries(vars.production)) {
        const currentStock = vars.stocks[productId] || 0;
        const needed = Object.values(vars.allocations[productId] || {}).reduce((a, b) => a + b, 0);
        const shortage = Math.max(0, needed - (product + currentStock));
        shortageCost += shortage;
    }

    // Inefficiency time
    const inefficiencyTime =
        params.variancePenalty * varianceCost +
        params.shortagePenalty * shortageCost;

    // Free time
    const freeTime = params.totalTime - directTime - inefficiencyTime;

    return {
        totalTime: params.totalTime,
        directTime,
        inefficiencyTime,
        freeTime,
        alpha: params.variancePenalty,
        beta: params.shortagePenalty,
        varianceCost,
        shortageCost,
    };
}

// ============================================================================
// SIMPLE GREEDY SOLVER
// ============================================================================

/**
 * Simple greedy solver for the optimization problem
 * 
 * This is a heuristic solver that:
 * 1. Satisfies all constraint deductions first (D1, D3, D6)
 * 2. Allocates to objectives in priority order
 * 3. Minimizes labor time
 * 
 * For production use, replace with proper LP solver (e.g., glpk.js, highs)
 */
export function solveGreedy(
    stockBook: StockBook,
    params: PlanningParameters
): OptimizationResult {
    const vars: DecisionVariables = {
        production: {},
        allocations: {},
        stocks: {},
        reserves: {},
        labor: {},
        deductions: {
            D1_replacement: {},
            D2_expansion: {},
            D3_reserves: {},
            D4_administration: {},
            D5_common_needs: {},
            D6_support: {},
        },
    };

    // ========================================================================
    // CASCADING D3 ALLOCATION: D3 wraps around each deduction as allocated
    // ========================================================================
    // 
    // Algorithm:
    // 1. Allocate D1 (constraint) → Insure it (add to D3)
    // 2. Try allocate D2 (objective) → If successful, insure it (add to D3)
    // 3. Try allocate D4 (objective) → If successful, insure it (add to D3)
    // 4. Try allocate D5 (objective) → If successful, insure it (add to D3)
    // 5. Try allocate D6 (objective) → If successful, insure it (add to D3)
    //
    // D3 is a HARD CONSTRAINT: If we can't afford to insure, we scale back.
    // Production may need to increase to cover total needs + insurance.
    // ========================================================================

    const reserveFactor = params.deductionTargets.D3_reserve_factor;

    // Phase 1: D1 Replacement (CONSTRAINT - Must Satisfy)
    vars.deductions.D1_replacement = { ...params.deductionTargets.D1_replacement };

    // Immediately insure D1
    for (const [productId, d1] of Object.entries(vars.deductions.D1_replacement)) {
        const insurance = d1 * reserveFactor;
        vars.deductions.D3_reserves[productId] = insurance;
    }

    // Phase 2: Calculate what we can afford after D1 + D3(D1)
    const totalNeeds: Record<string, number> = {};
    for (const productId of Object.keys(stockBook.products)) {
        const currentStock = stockBook.stocks[productId]?.quantity || 0;
        const d1 = vars.deductions.D1_replacement[productId] || 0;
        const d3_for_d1 = vars.deductions.D3_reserves[productId] || 0;

        // Minimum production needed to cover D1 + insurance
        const minProduction = Math.max(0, (d1 + d3_for_d1) - currentStock);
        vars.production[productId] = minProduction;

        // Track total committed
        totalNeeds[productId] = d1 + d3_for_d1;
    }

    // Helper: Calculate remaining capacity for a product
    function getRemainingCapacity(productId: string): number {
        const currentStock = stockBook.stocks[productId]?.quantity || 0;
        const produced = vars.production[productId] || 0;
        const committed = totalNeeds[productId] || 0;
        return produced + currentStock - committed;
    }

    // Helper: Try to allocate and insure a deduction
    function tryAllocateAndInsure(
        productId: string,
        amount: number,
        deductionType: keyof DecisionVariables['deductions']
    ): number {
        const remaining = getRemainingCapacity(productId);
        const totalNeeded = amount * (1 + reserveFactor); // amount + insurance

        if (remaining >= totalNeeded) {
            // Can afford full allocation + insurance
            vars.deductions[deductionType][productId] = amount;
            vars.deductions.D3_reserves[productId] =
                (vars.deductions.D3_reserves[productId] || 0) + (amount * reserveFactor);
            totalNeeds[productId] = (totalNeeds[productId] || 0) + totalNeeded;
            return amount;
        } else {
            // Can only afford part of it
            // Solve: x + x*r = remaining  →  x = remaining / (1+r)
            const affordable = remaining / (1 + reserveFactor);
            if (affordable > 0) {
                vars.deductions[deductionType][productId] = affordable;
                vars.deductions.D3_reserves[productId] =
                    (vars.deductions.D3_reserves[productId] || 0) + (affordable * reserveFactor);
                totalNeeds[productId] = (totalNeeds[productId] || 0) + remaining;
                return affordable;
            }
            return 0;
        }
    }

    // Phase 3: D2 Expansion (OBJECTIVE - Maximize growth)
    const d2Target = params.deductionTargets.D2_expansion_target;
    for (const productId of Object.keys(stockBook.products)) {
        // Try to allocate D2 target
        const allocated = tryAllocateAndInsure(productId, d2Target * 0.2, 'D2_expansion');

        // If we allocated D2, we may need to produce more
        if (allocated > 0) {
            const needed = totalNeeds[productId] || 0;
            const currentStock = stockBook.stocks[productId]?.quantity || 0;
            const productionNeeded = Math.max(0, needed - currentStock);
            vars.production[productId] = Math.max(vars.production[productId] || 0, productionNeeded);
        }
    }

    // Phase 4: D5 Common Needs (OBJECTIVE - Maximize social development)
    const d5Target = params.deductionTargets.D5_common_min;
    for (const productId of Object.keys(stockBook.products)) {
        const remaining = getRemainingCapacity(productId);
        const allocation = Math.min(remaining * 0.5, d5Target); // Try 50% of remaining

        const allocated = tryAllocateAndInsure(productId, allocation, 'D5_common_needs');

        if (allocated > 0) {
            const needed = totalNeeds[productId] || 0;
            const currentStock = stockBook.stocks[productId]?.quantity || 0;
            const productionNeeded = Math.max(0, needed - currentStock);
            vars.production[productId] = Math.max(vars.production[productId] || 0, productionNeeded);
        }
    }

    // Phase 5: D4 Administration (OBJECTIVE - Minimize overhead)
    const d4Max = params.deductionTargets.D4_admin_max;
    for (const productId of Object.keys(stockBook.products)) {
        const remaining = getRemainingCapacity(productId);
        const allocation = Math.min(remaining * 0.1, d4Max); // Only 10% of remaining

        const allocated = tryAllocateAndInsure(productId, allocation, 'D4_administration');

        if (allocated > 0) {
            const needed = totalNeeds[productId] || 0;
            const currentStock = stockBook.stocks[productId]?.quantity || 0;
            const productionNeeded = Math.max(0, needed - currentStock);
            vars.production[productId] = Math.max(vars.production[productId] || 0, productionNeeded);
        }
    }

    // Phase 6: D6 Support (OBJECTIVE - Maximize solidarity)
    const d6Target = params.deductionTargets.D6_support_target;
    for (const productId of Object.keys(stockBook.products)) {
        const remaining = getRemainingCapacity(productId);
        const allocation = Math.min(remaining, d6Target * 0.3); // Try 30% of remaining

        const allocated = tryAllocateAndInsure(productId, allocation, 'D6_support');

        if (allocated > 0) {
            const needed = totalNeeds[productId] || 0;
            const currentStock = stockBook.stocks[productId]?.quantity || 0;
            const productionNeeded = Math.max(0, needed - currentStock);
            vars.production[productId] = Math.max(vars.production[productId] || 0, productionNeeded);
        }
    }

    // Phase 4: Calculate labor requirements (simplified)
    for (const [productId, qty] of Object.entries(vars.production)) {
        // Assume 1 hour per unit (simplified - should use actual ALT)
        const laborNeeded = qty * 1.0;
        vars.labor[productId] = laborNeeded;
    }

    // Phase 5: Validate constraints
    const violations: string[] = [];

    const prodCheck = evaluateProductionConstraints(vars, stockBook, params);
    violations.push(...prodCheck.violations);

    const laborCheck = evaluateLaborConstraints(vars, stockBook, params);
    violations.push(...laborCheck.violations);

    const skillCheck = evaluateSkillConstraints(vars, stockBook, params);
    violations.push(...skillCheck.violations);

    const deductionCheck = evaluateDeductionConstraints(vars, params);
    violations.push(...deductionCheck.violations);

    // Phase 6: Compute objective
    const objective = computeObjectiveValue(vars, params);

    return {
        solution: vars,
        objectiveValue: objective.freeTime,
        freeTime: objective.freeTime,
        directTime: objective.directTime,
        inefficiencyTime: objective.inefficiencyTime,
        feasible: violations.length === 0,
        violations,
        status: violations.length === 0 ? "optimal" : "infeasible",
    };
}

// ============================================================================
// ALLOCATION PLAN GENERATION
// ============================================================================

/**
 * Generate allocation plan from optimization result
 */
export function generateAllocationPlan(
    result: OptimizationResult,
    params: PlanningParameters
): AllocationPlan {
    const productAllocations = [];

    for (const [productId, qty] of Object.entries(result.solution.production)) {
        // Calculate uncertainty bounds based on historical variance
        const variances = params.historicalVariances[productId] || [];
        const stdDev = variances.length > 0
            ? Math.sqrt(variances.reduce((sum, v) => sum + v * v, 0) / variances.length)
            : qty * 0.1; // Default 10% if no history

        const criticality = params.criticality[productId] || 0.5;
        const buffer = criticality > 0.7 ? 2 * stdDev : 0.5 * stdDev;

        productAllocations.push({
            productId,
            plannedQty: qty,
            minQty: Math.max(0, qty - buffer),
            maxQty: qty + buffer,
            uncertaintyBounds: `±${buffer.toFixed(1)} (95% CI)`,
        });
    }

    const laborAllocations = [];
    for (const [laborType, hours] of Object.entries(result.solution.labor)) {
        laborAllocations.push({
            individualId: `worker_${laborType}`, // Simplified
            plannedHours: hours,
            workType: laborType,
        });
    }

    // Convert deductions to Deduction objects
    const deductions: Deduction[] = [
        {
            type: "D1_replacement",
            allocations: result.solution.deductions.D1_replacement,
            isConstraint: true,
        },
        {
            type: "D2_expansion",
            allocations: result.solution.deductions.D2_expansion,
            isConstraint: false,
            target: params.deductionTargets.D2_expansion_target,
        },
        {
            type: "D3_reserves",
            allocations: result.solution.deductions.D3_reserves,
            isConstraint: true,
        },
        {
            type: "D4_administration",
            allocations: result.solution.deductions.D4_administration,
            isConstraint: false,
        },
        {
            type: "D5_common_needs",
            allocations: result.solution.deductions.D5_common_needs,
            isConstraint: false,
            target: params.deductionTargets.D5_common_min,
        },
        {
            type: "D6_support",
            allocations: result.solution.deductions.D6_support,
            isConstraint: false,
            target: params.deductionTargets.D6_support_target,
        },
    ];

    return {
        id: `PLAN_${params.period}`,
        period: params.period,
        createdAt: new Date(),
        productAllocations,
        laborAllocations,
        deductions,
        status: result.feasible ? "planned" : "adjusted",
    };
}
