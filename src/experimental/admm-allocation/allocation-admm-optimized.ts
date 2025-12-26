
import type { ProviderAgent, RecipientAgent, ADMMConfig, ADMMSolution } from './allocation-admm.js';

// ═══════════════════════════════════════════════════════════════════
// OPTIMIZED DISTRIBUTED ADMM SOLVER (Zero-GC, TypedArrays)
// ═══════════════════════════════════════════════════════════════════

export class OptimizedADMMAllocator {
    private config: ADMMConfig;

    constructor(config: Partial<ADMMConfig> = {}) {
        this.config = {
            rho: config.rho || 1.0,
            maxIterations: config.maxIterations || 100,
            tolerance: config.tolerance || 1e-4,
            adaptiveRho: config.adaptiveRho ?? true
        };
    }

    // STATE PERSISTENCE (WARM STARTS)
    // We cache the last solution state. 
    // Key: "pId,rId" -> { x, z, lambda }
    // When solving, if the topology matches (or subset matches), we init from this map.
    private warmStartCache = new Map<string, { x: number, z: number, lambda: number }>();

    /**
     * Solves the allocation problem using flattened arrays and zero memory allocation during loop.
     * Updated to support Warm Starts (initializing from previous runs) and exporting Duals as Implicit Prices.
     */
    public solve(
        providers: ProviderAgent[],
        recipients: RecipientAgent[]
    ): ADMMSolution {
        // 1. INDEXING & GRAPH CONSTRUCTION
        // Map agents to continuous indices
        const pMap = new Map<number, number>(); // ID -> Index
        providers.forEach((p, i) => pMap.set(p.id, i));

        const rMap = new Map<number, number>(); // ID -> Index
        recipients.forEach((r, i) => rMap.set(r.id, i));

        const numProviders = providers.length;
        const numRecipients = recipients.length;

        // Count edges and build offsets
        // We need efficient lookup: 
        // - For Provider P_i: Iterate all connected R_j (for x-update)
        // - For Recipient R_j: Iterate all connected P_i (for z-update)

        // Edge List Strategy:
        // Each compatible pair (i, j) is an "edge".
        // We assign each edge a unique index 'e' from 0 to numEdges-1.
        // x[e], z[e], lambda[e] are stored in Float64Arrays.

        // 1.1 First Pass: Identify valid edges and assign indices
        let edgeCount = 0;
        const edgeMap = new Map<string, number>(); // "pId,rId" -> edgeIndex

        // We iterate providers to find edges (assuming symmetric compatibility or provider-driven)
        // Ideally we check both directions, but let's assume provider.compatible_recipients is the truth source
        // verified against recipient existence.

        for (const p of providers) {
            for (const rId of p.compatible_recipients) {
                if (rMap.has(rId)) {
                    edgeMap.set(`${p.id},${rId}`, edgeCount++);
                }
            }
        }

        const numEdges = edgeCount;

        // 2. MEMORY ALLOCATION (TypedArrays)
        // State Vectors
        const X = new Float64Array(numEdges);      // Provider allocations x_i[j]
        const Z = new Float64Array(numEdges);      // Recipient views z_j[i]
        const Lambda = new Float64Array(numEdges); // Dual variables λ_ij

        // Constants / Lookups (Flattened Adjacency)
        // CSR-style arrays for Providers
        // pEdgesStart[i] -> index in pEdgeIndices where provider i's edges start
        // pEdgeIndices -> list of edge indices belonging to provider i
        const pEdgesStart = new Int32Array(numProviders + 1);
        const pEdgeIndices = new Int32Array(numEdges);

        // CSR-style arrays for Recipients
        const rEdgesStart = new Int32Array(numRecipients + 1);
        const rEdgeIndices = new Int32Array(numEdges);

        // Weights w_ij (aligned with Z array, meaning indexed by edge)
        const W = new Float64Array(numEdges);

        // Fill CSR Structures
        // ... Provider Check ...
        let currentEdgeIdx = 0;
        for (let i = 0; i < numProviders; i++) {
            pEdgesStart[i] = currentEdgeIdx;
            const p = providers[i];
            for (const rId of p.compatible_recipients) {
                if (rMap.has(rId)) {
                    const e = edgeMap.get(`${p.id},${rId}`)!;
                    pEdgeIndices[currentEdgeIdx++] = e;
                }
            }
        }
        pEdgesStart[numProviders] = currentEdgeIdx;

        // ... Recipient Check & Weights ...
        // We need to group edges by recipient for the recipient update step
        // Temporary bucket sort for recipients
        const rBuckets: number[][] = Array(numRecipients).fill(0).map(() => []);

        for (let i = 0; i < numProviders; i++) {
            const p = providers[i];
            for (const rId of p.compatible_recipients) {
                if (rMap.has(rId)) {
                    const rIdx = rMap.get(rId)!;
                    const r = recipients[rIdx];
                    const e = edgeMap.get(`${p.id},${rId}`)!;

                    rBuckets[rIdx].push(e);

                    // Store weight w_ij
                    // r.w_ij is map {pId: weight}
                    W[e] = r.w_ij[p.id] || 0;
                }
            }
        }

        // Flatten Recipient Buckets to CSR
        currentEdgeIdx = 0;
        for (let i = 0; i < numRecipients; i++) {
            rEdgesStart[i] = currentEdgeIdx;
            for (const e of rBuckets[i]) {
                rEdgeIndices[currentEdgeIdx++] = e;
            }
        }
        rEdgesStart[numRecipients] = currentEdgeIdx;

        // 3. INITIALIZATION
        // Initialize X (equal split)
        // Initialize Z (equal split)
        for (let i = 0; i < numProviders; i++) {
            const start = pEdgesStart[i];
            const end = pEdgesStart[i + 1];
            const count = end - start;
            if (count > 0) {
                const val = providers[i].capacity / count;
                for (let k = start; k < end; k++) {
                    const e = pEdgeIndices[k];

                    // CHECK WARM START
                    // We need pId, rId to lookup. 
                    // This is slow inside the loop if we do map lookups.
                    // But initialization is O(E), solving is O(E * Iter).
                    // So one O(E) pass is acceptable.

                    // Recover IDs
                    // We rely on the fact that compatible_recipients order in 'p' drives edge index order.
                    // But here we are iterating just indices.

                    // To do warm start efficiently, we need pId and rId.
                    // Let's defer warm start values filling to a separate pass or do it during edge creation?
                    // Doing it during edge creation (Stage 2) is cleaner but we separated stages.
                    // Let's rely on standard init for now, then override with warm values if available.

                    X[e] = val; // Default Equal Split
                }
            }
        }

        for (let i = 0; i < numRecipients; i++) {
            const start = rEdgesStart[i];
            const end = rEdgesStart[i + 1];
            const count = end - start;
            if (count > 0) {
                const val = recipients[i].need / count;
                for (let k = start; k < end; k++) {
                    const e = rEdgeIndices[k];
                    Z[e] = val;
                }
            }
        }

        // Apply Warm Start Overrides
        {
            let e = 0;
            for (const p of providers) {
                for (const rId of p.compatible_recipients) {
                    if (rMap.has(rId)) {
                        const key = `${p.id},${rId}`;
                        const cached = this.warmStartCache.get(key);
                        if (cached) {
                            // We need 'e' index. 
                            const edgeIdx = edgeMap.get(key)!;
                            X[edgeIdx] = cached.x;
                            Z[edgeIdx] = cached.z;
                            Lambda[edgeIdx] = cached.lambda;
                        }
                    }
                }
            }
        }

        // 4. MAIN LOOP (Zero Allocation)
        let iter = 0;
        let converged = false;
        let primalRes = 0;
        let dualRes = 0;
        let rho = this.config.rho;

        // Reusable temp arrays for local solver steps 
        // (Max possible edges per agent - could start with fixed size and grow if needed, 
        //  but for simplicity assuming < 1000 connections per agent)
        const TEMP_SIZE = 2000;
        const tempSortBuffer = new Int32Array(TEMP_SIZE); // Storing indices for sorting
        const tempValBuffer = new Float64Array(TEMP_SIZE); // Storing values/offsets

        for (iter = 0; iter < this.config.maxIterations; iter++) {

            // --- STEP 1: PROVIDER UPDATE (Water-filling) ---
            for (let i = 0; i < numProviders; i++) {
                const start = pEdgesStart[i];
                const end = pEdgesStart[i + 1];
                const count = end - start;
                if (count === 0) continue;

                const capacity = providers[i].capacity;

                // 1. Calculate Unconstrained Solutions & Offsets
                // x* = (rho * z - lambda) / rho = z - lambda/rho
                // offset = x*

                let sumUnconstrained = 0;

                for (let k = 0; k < count; k++) {
                    const e = pEdgeIndices[start + k];
                    // offset = z[e] - lambda[e]/rho
                    const val = Z[e] - Lambda[e] / rho;
                    tempValBuffer[k] = val;
                    if (val > 0) sumUnconstrained += val;
                }

                // 2. Water-filling Logic
                if (sumUnconstrained <= capacity) {
                    // Constraint inactive
                    for (let k = 0; k < count; k++) {
                        const e = pEdgeIndices[start + k];
                        X[e] = Math.max(0, tempValBuffer[k]);
                    }
                } else {
                    // Constraint active: Find nu such that sum(max(0, offset - nu)) = C
                    // Sort offsets descending
                    // Since we already have values in tempValBuffer, we sort INDICES
                    for (let k = 0; k < count; k++) tempSortBuffer[k] = k; // 0, 1, 2...

                    // Simple Bubble sort for small N (usually < 20-50). 
                    // For large N, TypedArray sort is harder, but N is small per provider.
                    // QuickSort logic could be added here if needed, but let's do a simple sort for now
                    // actually standard array sort is fast enough for small arrays
                    // but we want zero GC, so implementing simple insertion sort

                    for (let x = 1; x < count; x++) {
                        const keyIdx = tempSortBuffer[x];
                        const keyVal = tempValBuffer[keyIdx];
                        let y = x - 1;
                        while (y >= 0 && tempValBuffer[tempSortBuffer[y]] < keyVal) {
                            tempSortBuffer[y + 1] = tempSortBuffer[y];
                            y--;
                        }
                        tempSortBuffer[y + 1] = keyIdx;
                    }

                    // Find Water Level
                    let sumOffsets = 0;
                    let nu = 0;

                    for (let k = 0; k < count; k++) {
                        const idx = tempSortBuffer[k];
                        sumOffsets += tempValBuffer[idx];
                        const countActive = k + 1;

                        // nu = (Sum(offset) - C) / countActive
                        nu = (sumOffsets - capacity) / countActive;

                        // Check feasibility
                        const nextIdx = (k < count - 1) ? tempSortBuffer[k + 1] : -1;
                        const nextOffset = (nextIdx !== -1) ? tempValBuffer[nextIdx] : -Infinity;

                        const currentOffset = tempValBuffer[idx];

                        // Valid if current > nu and next <= nu
                        if (currentOffset > nu && nextOffset <= nu) {
                            break;
                        }
                    }

                    // Apply assignments
                    for (let k = 0; k < count; k++) {
                        const e = pEdgeIndices[start + k];
                        X[e] = Math.max(0, tempValBuffer[k] - nu);
                    }
                }
            }

            // --- STEP 2: RECIPIENT UPDATE (Gradient Descent) ---
            for (let i = 0; i < numRecipients; i++) {
                const start = rEdgesStart[i];
                const end = rEdgesStart[i + 1];
                const count = end - start;
                if (count === 0) continue;

                const need = recipients[i].need;

                // Init local Z (warm start from previous Z)
                // We use tempValBuffer to store local z for the gradient descent
                for (let k = 0; k < count; k++) {
                    const e = rEdgeIndices[start + k];
                    // IMPORTANT: Use Z[e] (from previous ADMM iter or Warm Start)
                    // Do not reset to heuristic, or we lose warm start benefits.
                    tempValBuffer[k] = Z[e];
                }

                const stepSize = 0.1;
                const innerIterMax = 20;

                for (let inner = 0; inner < innerIterMax; inner++) {
                    // Compute Utility U = Sum(w * z)
                    let utility = 0;
                    for (let k = 0; k < count; k++) {
                        const e = rEdgeIndices[start + k];
                        utility += W[e] * tempValBuffer[k];
                    }
                    utility = Math.max(utility, 1e-12);

                    // Compute Gradient & Update
                    // We store proposed z in tempValBuffer directly? No, need separate buffer for next step
                    // Let's use the second half of temp array (TEMP_SIZE/2) for proposal

                    const OFFSET = TEMP_SIZE / 2;

                    for (let k = 0; k < count; k++) {
                        const e = rEdgeIndices[start + k];

                        // Grad Log: -N * w / U
                        const gradLog = -need * W[e] / utility;

                        // Grad Quad: rho * z - (rho * x + lambda)
                        // = rho * (z - (x + lambda/rho))
                        const gradQuad = rho * tempValBuffer[k] - (rho * X[e] + Lambda[e]);

                        const gradient = gradLog + gradQuad;

                        // Gradient Step
                        tempValBuffer[OFFSET + k] = tempValBuffer[k] - stepSize * gradient;
                    }

                    // Project to Simplex (Buffer OFFSET -> Buffer 0)
                    // Clip negative
                    let sumProj = 0;
                    for (let k = 0; k < count; k++) {
                        const val = Math.max(0, tempValBuffer[OFFSET + k]);
                        tempValBuffer[k] = val;
                        sumProj += val;
                    }

                    // Scale
                    if (sumProj > need) {
                        const scale = need / sumProj;
                        for (let k = 0; k < count; k++) {
                            tempValBuffer[k] *= scale;
                        }
                    }

                    // (Optional) Check inner convergence
                }

                // Write back to Z global
                for (let k = 0; k < count; k++) {
                    const e = rEdgeIndices[start + k];
                    Z[e] = tempValBuffer[k];
                }
            }

            // --- STEP 3: DUAL UPDATE & RESIDUALS ---
            primalRes = 0;
            dualRes = 0;

            // We can iterate edges linearly for this part, which is fastest
            for (let e = 0; e < numEdges; e++) {
                const xVal = X[e];
                const zVal = Z[e];
                const diff = xVal - zVal;

                // Primal residual sq
                primalRes += diff * diff;

                // Dual update
                // lambda_new = lambda + rho * (x - z)
                const lambdaOld = Lambda[e];
                const lambdaNew = lambdaOld + rho * diff;
                Lambda[e] = lambdaNew;

                // Dual residual requires X_new vs X_old and Z_new vs Z_old? 
                // That's more memory. 
                // Simplified check: just check Primal Residual + Dual Feasibility
                // or just Primal Residual for now as primary metric?
                // The ADMM standard dual residual is: s = rho * ||z_new - z_old||
                // So we need z_old?
                // For memory efficiency, let's skip rigorous dual residual calculation in optimized generic loop 
                // and focus on primal residual (consistency) unless strict convergence is needed.
                // Or we can just sum changes in X and Z as proxy.
            }

            primalRes = Math.sqrt(primalRes);

            if (primalRes < this.config.tolerance) {
                converged = true;
                break;
            }

            // Adaptive rho
            if (this.config.adaptiveRho && iter % 10 === 0) {
                // To do correctly we'd need dual residual. 
                // For optimized version, might keep rho static or use simple heuristics.
            }
        }

        // 5. RECONSTRUCT OUTPUT
        // Map flat arrays back to objects for API compatibility
        const finalX: Record<number, Record<number, number>> = {};
        const finalZ: Record<number, Record<number, number>> = {};
        const finalLambda: Record<string, number> = {};

        // Init objects
        providers.forEach(p => finalX[p.id] = {});
        recipients.forEach(r => finalZ[r.id] = {});

        // Iterate edges to fill
        // Using edgeMap to assist is slow, better to use CSR iteration again

        let e = 0;
        for (let i = 0; i < numProviders; i++) {
            const p = providers[i];
            const start = pEdgesStart[i];
            const end = pEdgesStart[i + 1];

            for (let k = start; k < end; k++) {
                // We need to know who the recipient is for this edge.
                // We didn't store edge->(p,r) explicitly in array, but we can recover it?
                // No, CSR stores generic edge indices. 
                // We need to know rMap inverse? Or just iterate p.compatible_recipients again.
                // Assumption: compatible_recipients iteration order matches edge creation order.
                // Yes, lines 87-95 created edges in compatible_recipients order.

                // However, we filtered by rMap.has(rId).
                // Let's re-simulate the exact same logic.
                let recipientFoundCount = 0;
                for (const rId of p.compatible_recipients) {
                    if (rMap.has(rId)) {
                        // This corresponds to pEdgeIndices[start + recipientFoundCount]
                        // But wait, pEdgeIndices stores 'e'.
                        // And X[e] is the value.

                        // Wait, pEdgeIndices is defined by:
                        // pEdgeIndices[currentEdgeIdx++] = e; 
                        // where e was from edgeMap.get(`${p.id},${rId}`).

                        // So iterating compatible_recipients in order is strictly correct.
                        const rIdVal = rId;
                        const edgeIdx = pEdgeIndices[start + recipientFoundCount];

                        finalX[p.id][rIdVal] = X[edgeIdx];
                        finalZ[rIdVal][p.id] = Z[edgeIdx];
                        finalLambda[`${p.id},${rIdVal}`] = Lambda[edgeIdx];

                        recipientFoundCount++;
                    }
                }
            }
        }

        const result = {
            allocations: finalX,
            recipient_views: finalZ,
            dual_vars: finalLambda,
            iterations: iter,
            converged,
            primal_residual: primalRes,
            dual_residual: dualRes
        };

        // SAVE STATE (WARM START)
        // Store current solution to cache for next run
        Object.entries(finalLambda).forEach(([key, lambdaVal]) => {
            const [pIdStr, rIdStr] = key.split(',');
            const pId = parseInt(pIdStr);
            const rId = parseInt(rIdStr);

            // We need X and Z too.
            const xVal = finalX[pId]?.[rId] || 0;
            const zVal = finalZ[rId]?.[pId] || 0;

            this.warmStartCache.set(key, {
                x: xVal,
                z: zVal,
                lambda: lambdaVal
            });
        });

        return result;
    }
}
