
import type {
    AvailabilitySlot,
    NeedSlot,
    Commitment
} from './schemas.js';

// ═══════════════════════════════════════════════════════════════════
// ADMM ALLOCATION SCHEMAS & TYPES
// ═══════════════════════════════════════════════════════════════════

export interface ProviderAgent {
    id: number;
    capacity: number;
    compatible_recipients: number[]; // Array of recipient IDs
}

export interface RecipientAgent {
    id: number;
    need: number;
    compatible_providers: number[]; // Array of provider IDs
    w_ij: Record<number, number>;   // Map of provider ID -> MR weight
    // Note: In simplified ADMM, we assume we can access these weights locally
}

export interface ADMMConfig {
    rho: number;
    maxIterations: number;
    tolerance: number;
    adaptiveRho: boolean;
}

export interface ADMMSolution {
    allocations: Record<number, Record<number, number>>; // x[i][j]
    recipient_views: Record<number, Record<number, number>>; // z[j][i]
    dual_vars: Record<string, number>; // lambda[i,j] key="i,j"
    iterations: number;
    converged: boolean;
    primal_residual: number;
    dual_residual: number;
}

// ═══════════════════════════════════════════════════════════════════
// DISTRIBUTED ADMM SOLVER
// ═══════════════════════════════════════════════════════════════════

export class DistributedADMMAllocator {
    private config: ADMMConfig;

    constructor(config: Partial<ADMMConfig> = {}) {
        this.config = {
            rho: config.rho || 1.0,
            maxIterations: config.maxIterations || 100,
            tolerance: config.tolerance || 1e-4,
            adaptiveRho: config.adaptiveRho ?? true
        };
    }

    /**
     * Provider Update Step (x-update)
     * Solves: min Σ_j [ (ρ/2)*x_i[j]^2 - (ρ*z_j[i] - λ_ij)*x_i[j] ]
     * s.t. Σ_j x_i[j] ≤ C_i, x_i[j] ≥ 0
     */
    private providerUpdate(
        provider: ProviderAgent,
        z_current: Record<number, Record<number, number>>, // z[j][i]
        lambda_current: Record<string, number> // key "i,j"
    ): Record<number, number> { // returns x_i map {j: value}

        const rho = this.config.rho;
        const coefficients: { a: number, b: number, j: number }[] = [];

        for (const j of provider.compatible_recipients) {
            // Quadratic term coeff: ρ/2
            const a = rho / 2;

            // Linear term coeff: -(ρ * z_j[i] - λ_ij)
            const z_j_i = z_current[j]?.[provider.id] || 0;
            const lam_ij = lambda_current[`${provider.id},${j}`] || 0;
            const b = -(rho * z_j_i - lam_ij);

            coefficients.push({ a, b, j });
        }

        // Unconstrained solutions: x* = -b / (2a)
        const solutions: { val: number, j: number }[] = coefficients.map(c => ({
            val: -c.b / (2 * c.a),
            j: c.j
        }));

        // Water-filling to respect capacity (simple approach)
        // If sum(max(0, x_unconstrained)) <= Capacity, we are done (constraint inactive)
        // Else, we need to find Lagrange multiplier ν >= 0 such that Σ max(0, x*) = C
        // where x* minimizes Lagrangian: ... + ν * (Σ x - C)
        // derivative: 2ax + b + ν = 0 => x = -(b+ν)/2a

        // Let's implement exact water-filling since coefficients are simple
        let x_new: Record<number, number> = {};

        // Sum of positive unconstrained solutions
        let sum_unconstrained = 0;
        for (const s of solutions) {
            if (s.val > 0) sum_unconstrained += s.val;
        }

        if (sum_unconstrained <= provider.capacity) {
            for (const s of solutions) {
                x_new[s.j] = Math.max(0, s.val);
            }
        } else {
            // Capacity constraint is active. We need to find ν such that sum(x) = C
            // x_j(ν) = max(0, (-b_j - ν) / (2a_j))
            // Since all a_j are equal (ρ/2), 2a = ρ
            // x_j(ν) = max(0, -b_j/ρ - ν/ρ)
            // Let offset_j = -b_j/ρ. We need sum_{j \in Active} (offset_j - ν_scaled) = C
            // Sort by offset_j descending.

            const offsets = coefficients.map(c => ({
                offset: -c.b / rho, // This is exactly (ρ*z - λ)/ρ = z - λ/ρ
                j: c.j
            })).sort((a, b) => b.offset - a.offset); // Descending

            let sum_offsets = 0;
            let count_active = 0;
            let nu_scaled = 0;

            // Find number of active components
            for (let k = 0; k < offsets.length; k++) {
                sum_offsets += offsets[k].offset;
                count_active++;

                // Proposed water level (nu_scaled is the amount subtracted from offset)
                // C = Sum(offset) - k * nu_scaled
                // nu_scaled = (Sum(offset) - C) / k
                nu_scaled = (sum_offsets - provider.capacity) / count_active;

                // Check feasibility: 
                // 1. x_k = offset_k - nu_scaled > 0 ? Yes, if offset_k > nu_scaled
                // 2. x_{k+1} <= 0 ? (next one shouldn't be positive)

                const next_offset = (k < offsets.length - 1) ? offsets[k + 1].offset : -Infinity;
                if (offsets[k].offset > nu_scaled && (next_offset <= nu_scaled)) {
                    break; // Found correct set
                }
            }

            // Apply assignments
            for (const off of offsets) {
                const x_val = Math.max(0, off.offset - nu_scaled);
                x_new[off.j] = x_val;
            }
        }

        return x_new;
    }

    /**
     * Recipient Update Step (z-update)
     * Solves: min -N_j * log(Σ_i w_ij * z_j[i] + ε) + Σ_i [ (ρ/2)*z_j[i]^2 - (ρ*x_i[j] + λ_ij)*z_j[i] ]
     * s.t. Σ_i z_j[i] ≤ N_j, z_j[i] ≥ 0
     * 
     * Uses Projected Gradient Descent locally.
     */
    private recipientUpdate(
        recipient: RecipientAgent,
        x_new_global: Record<number, Record<number, number>>, // x[i][j]
        lambda_current: Record<string, number>
    ): Record<number, number> { // returns z_j map {i: value}

        const rho = this.config.rho;
        const epsilon = 1e-9;

        // Initialize z (warm start or equal)
        let z_local: Record<number, number> = {};
        const count = recipient.compatible_providers.length;
        for (const i of recipient.compatible_providers) {
            // Heuristic: start with min(Need/Count, x[i][j])
            z_local[i] = Math.min(recipient.need / count, x_new_global[i]?.[recipient.id] || 0);
            if (z_local[i] <= 0) z_local[i] = recipient.need / count;
        }

        const step_size = 0.1; // Tune this?
        const pgd_iterations = 20;

        for (let iter = 0; iter < pgd_iterations; iter++) {
            // Gradient Calculation
            // U = Σ w * z
            let utility = 0;
            for (const i of recipient.compatible_providers) {
                utility += (recipient.w_ij[i] || 0) * (z_local[i] || 0);
            }
            utility = Math.max(utility, 1e-12); // Avoid div by zero

            const gradient: Record<number, number> = {};

            for (const i of recipient.compatible_providers) {
                // Term 1: -N * w / U (derivative of log objective)
                const grad_log = -recipient.need * (recipient.w_ij[i] || 0) / utility;

                // Term 2: ρ * z - (ρ * x + λ) (derivative of quadratic penalty)
                const x_val = x_new_global[i]?.[recipient.id] || 0;
                const lam_val = lambda_current[`${i},${recipient.id}`] || 0;
                const grad_quad = rho * z_local[i] - (rho * x_val + lam_val);

                gradient[i] = grad_log + grad_quad;
            }

            // Descent Step
            let z_proposal: Record<number, number> = {};
            for (const i of recipient.compatible_providers) {
                z_proposal[i] = z_local[i] - step_size * gradient[i];
            }

            // Projection to Simplex (Σ z <= N, z >= 0)
            z_local = this.projectToSimplex(z_proposal, recipient.need);

            // Check inner convergence (simple change check)
            // ... (optional optimization)
        }

        return z_local;
    }

    private projectToSimplex(z: Record<number, number>, capacity: number): Record<number, number> {
        // 1. Clip negative
        const z_nonneg: Record<number, number> = {};
        let sum = 0;
        for (const [key, val] of Object.entries(z)) {
            const v = Math.max(0, val);
            z_nonneg[parseInt(key)] = v;
            sum += v;
        }

        // 2. Scale if sum > capacity
        if (sum > capacity) {
            const scale = capacity / sum;
            for (const key in z_nonneg) {
                z_nonneg[key] *= scale;
            }
        }
        return z_nonneg;
    }

    /**
     * Main distributed solver loop
     */
    public solve(
        providers: ProviderAgent[],
        recipients: RecipientAgent[]
    ): ADMMSolution {
        // Initialization
        const x: Record<number, Record<number, number>> = {};
        const z: Record<number, Record<number, number>> = {};
        const lambda: Record<string, number> = {};

        // Init allocations
        for (const p of providers) {
            x[p.id] = {};
            for (const rId of p.compatible_recipients) {
                x[p.id][rId] = p.capacity / p.compatible_recipients.length; // Equal split
                lambda[`${p.id},${rId}`] = 0;
            }
        }
        for (const r of recipients) {
            z[r.id] = {};
            for (const pId of r.compatible_providers) {
                z[r.id][pId] = r.need / r.compatible_providers.length; // Equal split
            }
        }

        let converged = false;
        let primal_residual = Infinity;
        let dual_residual = Infinity;
        let iter = 0;

        for (iter = 0; iter < this.config.maxIterations; iter++) {
            // STEP 1: Parallel Provider Updates
            const x_new: Record<number, Record<number, number>> = {};
            for (const p of providers) {
                x_new[p.id] = this.providerUpdate(p, z, lambda);
            }

            // STEP 2: Parallel Recipient Updates
            const z_new: Record<number, Record<number, number>> = {};
            for (const r of recipients) {
                z_new[r.id] = this.recipientUpdate(r, x_new, lambda);
            }

            // STEP 3: Dual Updates & Residuals
            primal_residual = 0;
            dual_residual = 0;

            // Re-calculate lambda
            for (const p of providers) {
                for (const rId of p.compatible_recipients) {
                    const x_val = x_new[p.id][rId] || 0;
                    const z_val = z_new[rId][p.id] || 0;
                    const key = `${p.id},${rId}`;

                    // Dual Update
                    lambda[key] = (lambda[key] || 0) + this.config.rho * (x_val - z_val);

                    // Residuals
                    primal_residual += (x_val - z_val) ** 2;

                    const x_old = x[p.id]?.[rId] || 0;
                    const z_old = z[rId]?.[p.id] || 0;

                    // Dual residual approx: rho * (z_new - z_old) and rho * (x_new - x_old)
                    // Simplified: sum of changes
                    dual_residual += (x_val - x_old) ** 2 + (z_val - z_old) ** 2;
                }
            }

            primal_residual = Math.sqrt(primal_residual);
            dual_residual = this.config.rho * Math.sqrt(dual_residual);

            // Update State
            Object.assign(x, x_new);
            Object.assign(z, z_new);

            // Convergence Check
            if (primal_residual < this.config.tolerance && dual_residual < this.config.tolerance) {
                converged = true;
                break;
            }

            // Adaptive rho (simple strategy)
            if (this.config.adaptiveRho) {
                if (primal_residual > 10 * dual_residual) {
                    this.config.rho *= 2;
                } else if (dual_residual > 10 * primal_residual) {
                    this.config.rho /= 2;
                }
            }
        }

        return {
            allocations: x,
            recipient_views: z,
            dual_vars: lambda,
            iterations: iter,
            converged,
            primal_residual,
            dual_residual
        };
    }
}
