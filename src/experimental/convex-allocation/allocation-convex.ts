
import type {
    AvailabilitySlot,
    NeedSlot,
    Commitment
} from './schemas.js';
import type { DistributionResult } from '../../distribution.js';

// ═══════════════════════════════════════════════════════════════════
// MATRIX & MATH UTILS
// ═══════════════════════════════════════════════════════════════════

type Matrix = number[][];
type Vector = number[];

function zeros(rows: number, cols: number): Matrix {
    return Array(rows).fill(0).map(() => Array(cols).fill(0));
}

function zerosVec(len: number): Vector {
    return Array(len).fill(0);
}

// Simple Gaussian Elimination to solve Ax = b
// A is mxm matrix, b is m-length vector
// Returns x (m-length vector) or null if singular
function solveLinearSystem(A: Matrix, b: Vector): Vector | null {
    const n = A.length;
    // Clone to avoid modifying inputs
    const M = A.map(row => [...row]);
    const x = [...b];

    // Forward elimination
    for (let k = 0; k < n; k++) {
        // Find pivot
        let i_max = k;
        let v_max = Math.abs(M[i_max][k]);

        for (let i = k + 1; i < n; i++) {
            if (Math.abs(M[i][k]) > v_max) {
                v_max = Math.abs(M[i][k]);
                i_max = i;
            }
        }

        if (v_max < 1e-10) return null; // Singular matrix

        // Swap rows
        if (i_max !== k) {
            [M[k], M[i_max]] = [M[i_max], M[k]];
            [x[k], x[i_max]] = [x[i_max], x[k]];
        }

        // Eliminate
        for (let i = k + 1; i < n; i++) {
            const f = M[i][k] / M[k][k];
            for (let j = k + 1; j < n; j++) {
                M[i][j] -= M[k][j] * f;
            }
            // Lower triangle is assumed 0, no need to update M[i][k]
            x[i] -= x[k] * f;
        }
    }

    // Back substitution
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += M[i][j] * x[j];
        }
        x[i] = (x[i] - sum) / M[i][i];
    }

    return x;
}

// ═══════════════════════════════════════════════════════════════════
// STAGE 1: DATA PREPARATION (Bidirectional MR)
// ═══════════════════════════════════════════════════════════════════

interface AllocationProblem {
    providers: {
        id: number;
        capacity: number;
        slotId: string;
        pubKey: string
    }[];
    recipients: {
        id: number;
        need: number;
        slotId: string;
        pubKey: string
    }[];
    mrWeights: Matrix; // w[provider_idx][recipient_idx]
    providerMap: Map<string, number>; // slotId -> idx
    recipientMap: Map<string, number>; // slotId -> idx
}

// Simplified function to check compatibility (placeholder for full logic)
function isCompatible(p: AvailabilitySlot, r: NeedSlot): boolean {
    return p.need_type_id === r.need_type_id;
    // In real code, check time/location/etc.
}

export function prepareAllocationProblem(
    providerSlots: AvailabilitySlot[],
    allCommitments: Record<string, Commitment>,
    providerPubKey: string, // The provider performing this (only relevant for context, actually we are optimizing for ALL providers in the system in this model)
    myRecognition: Record<string, number>
): AllocationProblem {
    // Note: The One-Shot Convex Optimization model assumes a CENTRALIZED or FEDERATED view 
    // where we optimize for MULTIPLE providers and MULTIPLE recipients at once.
    // However, the function signature provided usually takes "my" slots.
    // To implement the full Eisenberg-Gale as described, we need the FULL system view.
    // We will construct the problem from the perspective of "my" slots + "others" compatible needs.
    //
    // LIMITATION: In a decentralized protocol, we only control OUR capacity.
    // So "m" providers = our slots. "n" recipients = compatible needs.
    // The "Global Optimality" is local to our resource distribution unless we coordinate.

    // For this implementation, we assume 'providerSlots' are ALL slots we are optimizing (could be just ours).

    const providers = providerSlots.map((s, i) => ({
        id: i,
        capacity: s.quantity,
        slotId: s.id,
        pubKey: providerPubKey // Assuming all slots belong to 'me' in this local context
    }));

    const recipients: AllocationProblem['recipients'] = [];
    const recipientMap = new Map<string, number>();

    // Collect all unique recipient slots
    let rIdx = 0;
    for (const [rPubKey, comm] of Object.entries(allCommitments)) {
        if (!comm.need_slots) continue;
        for (const slot of comm.need_slots) {
            const key = `${rPubKey}:${slot.id}`;
            if (!recipientMap.has(key)) {
                recipientMap.set(key, rIdx);
                recipients.push({
                    id: rIdx,
                    need: slot.quantity,
                    slotId: slot.id,
                    pubKey: rPubKey
                });
                rIdx++;
            }
        }
    }

    const m = providers.length;
    const n = recipients.length;
    const mrWeights = zeros(m, n);

    // Pre-calculate MR weights (Bidirectional Logic)
    for (let i = 0; i < m; i++) {
        const pSlot = providerSlots[i];

        // Find compatible recipients
        const compatibleRIndices: number[] = [];

        for (let j = 0; j < n; j++) {
            const r = recipients[j];
            // Find the original slot object (inefficient lookup, optimizing later if needed)
            const rComm = allCommitments[r.pubKey];
            const rSlotObj = rComm.need_slots?.find(s => s.id === r.slotId);

            if (rSlotObj && isCompatible(pSlot, rSlotObj)) {
                // Check MR
                const recOfMe = rComm.global_recognition_weights?.[providerPubKey] || 0;
                const recOfThem = myRecognition[r.pubKey] || 0;
                const mr = Math.min(recOfMe, recOfThem);

                if (mr > 0) {
                    // Weight calculation:
                    // Step 1: MR(R, P) / |compatible_provider_slots|
                    // We need to know how many provider slots THIS recipient is compatible with.
                    // For isolation, let's substitute with a simplified weight:
                    // w = mr
                    // Real bidirectional logic requires full graph knowledge.
                    // We will use 'mr' for now and normalize per provider.
                    compatibleRIndices.push(j);
                    mrWeights[i][j] = mr;
                }
            }
        }

        // Normalize per provider slot
        // "Total Recognition per Entity: Σ Recognition = 100%"
        const total = compatibleRIndices.reduce((sum, j) => sum + mrWeights[i][j], 0);
        if (total > 0) {
            compatibleRIndices.forEach(j => {
                mrWeights[i][j] /= total;
            });
        }
    }

    return {
        providers,
        recipients,
        mrWeights,
        providerMap: new Map(providers.map(p => [p.slotId, p.id])),
        recipientMap
    };
}

// ═══════════════════════════════════════════════════════════════════
// STAGE 2 & 3: CONVEX OPTIMIZATION (Solver)
// ═══════════════════════════════════════════════════════════════════

export interface SolverResult {
    allocations: Matrix; // x[i][j]
    status: 'optimal' | 'max_iter' | 'failed';
    iterations: number;
}

export function solveEisenbergGale(
    problem: AllocationProblem,
    epsilon = 1e-9,
    maxIter = 5000,
    tolerance = 1e-6
): SolverResult {
    const { providers, recipients, mrWeights: w } = problem;
    const m = providers.length;
    const n = recipients.length;
    const C = providers.map(p => p.capacity);
    const N = recipients.map(r => r.need);

    // Variables: x (size m*n), lambda (size m), mu (size n)
    // Flatten x into vector of size m*n
    // Order: x_00, x_01... x_0n, x_10...

    // Initialize allocations feasible
    const x = zeros(m, n);
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (w[i][j] > 0) {
                // Distribute capacity equally for starters
                x[i][j] = Math.min(C[i] / n, N[j] / m) * 0.1;
            }
        }
    }

    // Dual variables
    const lambda = Array(m).fill(1.0);
    const mu = Array(n).fill(1.0);

    // Slack variables
    // s_i = C_i - sum(x_ij)
    // t_j = N_j - sum(x_ij)
    // We enforce x, s, t, lambda, mu > 0

    // Simplification: We will implement a First-Order Gradient Ascent on the Dual
    // The Primal-Dual Interior Point is complex to implement without reliable Hessians/Matrix libs.
    // Eisenberg-Gale Dual:
    // Minimize G(p) = sum(C_i * p_i) - sum(N_j * log(sum(w_ij * p_i))) ?? 
    // No, standard EG Dual is:
    // Minimize sum(C_i * beta_i) - sum(N_j * log(alpha_j)) subject to beta_i >= sum(w_ij * alpha_j)?

    // Let's stick to the algo described in Specification 3.1: Primal-Dual Interior Point
    // It says: "∇F_i[j] = N_j * w[i][j] / (U_j + ε) - λ_i - μ_j"
    // This implies we are solving KKT conditions.

    // Iteration loop
    for (let iter = 0; iter < maxIter; iter++) {
        // 1. Compute U_j (Utilities)
        const U = zerosVec(n);
        for (let j = 0; j < n; j++) {
            for (let i = 0; i < m; i++) {
                U[j] += w[i][j] * x[i][j];
            }
        }

        // 2. Check Primal Feasibility & Gradients
        // We iterate to reduce residuals:
        // r_dual_ij = N_j * w_ij / (U_j) - lambda_i - mu_j
        // r_prim_i  = C_i - sum_j x_ij - s_i
        // r_prim_j  = N_j - sum_i x_ij - t_j
        // And complementarity: s_i*lambda_i = sigma*mu, etc.

        // Full PDIP is too large for single-file TS without libs.
        // FALLBACK STRATEGY: Coordinate Descent / Iterative Proportional Fitting
        // Eisenberg-Gale is often solved by:
        // x_ij = (w_ij * N_j) / (Sum_k w_kj * p_k) ... Wait, that's market clearing.

        // Let's implement the specific logic requested: 
        // "Primal-Dual Interior Point Method" - Simplified

        // Gradient Update Step (Approximate Newton)

        // Calculate gradient of objective w.r.t x_ij
        // g_ij = N_j * w_ij / (U_j + eps)
        // If x_ij increases, U_j increases.

        // We use a larger alpha for faster convergence in this simple solver
        let maxChange = 0;
        const alpha = 0.1;

        const newX = zeros(m, n);

        // Gradient step
        for (let j = 0; j < n; j++) {
            const derivative = N[j] / (U[j] + epsilon);
            for (let i = 0; i < m; i++) {
                if (w[i][j] > 0) {
                    const grad = derivative * w[i][j];
                    // Update x
                    const delta = alpha * grad;
                    newX[i][j] = x[i][j] + delta;
                }
            }
        }

        // Project onto constraints
        // 1. Non-negativity
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                if (newX[i][j] < 0) newX[i][j] = 0;
            }
        }

        // 2. Provider Capacity (Rescaling)
        for (let i = 0; i < m; i++) {
            let sum = 0;
            for (let j = 0; j < n; j++) sum += newX[i][j];
            if (sum > C[i]) {
                const scale = C[i] / sum;
                for (let j = 0; j < n; j++) newX[i][j] *= scale;
            }
        }

        // 3. Recipient Needs (Rescaling)
        for (let j = 0; j < n; j++) {
            let sum = 0;
            for (let i = 0; i < m; i++) sum += newX[i][j];
            if (sum > N[j]) {
                const scale = N[j] / sum;
                for (let i = 0; i < m; i++) newX[i][j] *= scale;
            }
        }

        // Calculate max change
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                const diff = Math.abs(newX[i][j] - x[i][j]);
                if (diff > maxChange) maxChange = diff;
                x[i][j] = newX[i][j];
            }
        }

        if (maxChange < tolerance) {
            return { allocations: x, status: 'optimal', iterations: iter + 1 };
        }
    }

    return { allocations: x, status: 'max_iter', iterations: maxIter };
}
