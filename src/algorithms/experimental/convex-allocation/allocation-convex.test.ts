
import { describe, it, expect } from 'vitest';
import {
    prepareAllocationProblem,
    solveEisenbergGale,
    type SolverResult
} from './allocation-convex.js';
import type { Commitment, AvailabilitySlot, NeedSlot } from './schemas.js';

describe('Convex Allocation Algorithm', () => {

    it('should calculate MR weights correctly (Stage 1)', () => {
        // Setup similar to bidirectional test
        const providerPubKey = 'provider';
        const providerSlots: AvailabilitySlot[] = [
            { id: 's1', quantity: 10, type_id: 't1', name: 'S1', members: [] }
        ];

        const myRecognition = { 'r1': 1.0 };

        const allCommitments: Record<string, Commitment> = {
            'r1': {
                need_slots: [
                    { id: 'n1', quantity: 5, type_id: 't1', name: 'Need 1' }
                ],
                global_recognition_weights: { 'provider': 0.8 },
                timestamp: 1,
                itcStamp: {}
            }
        };

        const problem = prepareAllocationProblem(
            providerSlots,
            allCommitments,
            providerPubKey,
            myRecognition
        );

        expect(problem.providers.length).toBe(1);
        expect(problem.recipients.length).toBe(1);
        // MR should be min(1.0, 0.8) = 0.8
        // Normalized for this provider slot -> 1.0 (since only one recipient)
        expect(problem.mrWeights[0][0]).toBeCloseTo(1.0);
    });

    it('should allocate proportionally to need and MR (Fairness)', () => {
        // P1: Cap 100.
        // R1: Need 100, MR=1
        // R2: Need 100, MR=1
        // Expected: 50/50 split (Proportional to need, equal MR)

        const providerSlots: AvailabilitySlot[] = [
            { id: 'p1', quantity: 100, type_id: 't1', name: 'P1', members: [] }
        ];

        const myRecognition = { 'r1': 1.0, 'r2': 1.0 };
        const allCommitments: Record<string, Commitment> = {
            'r1': {
                need_slots: [{ id: 'n1', quantity: 100, type_id: 't1', name: 'N1' }],
                global_recognition_weights: { 'provider': 1.0 },
                timestamp: 1, itcStamp: {}
            },
            'r2': {
                need_slots: [{ id: 'n2', quantity: 100, type_id: 't1', name: 'N2' }],
                global_recognition_weights: { 'provider': 1.0 },
                timestamp: 1, itcStamp: {}
            }
        };

        const problem = prepareAllocationProblem(
            providerSlots,
            allCommitments,
            'provider',
            myRecognition
        );

        // MR Weights should be 0.5, 0.5 normalized
        expect(problem.mrWeights[0][0]).toBeCloseTo(0.5);
        expect(problem.mrWeights[0][1]).toBeCloseTo(0.5);

        const result = solveEisenbergGale(problem, 1e-9, 1000); // 1000 iter for gradient descent

        const r1Alloc = result.allocations[0][0]; // P1->R1
        const r2Alloc = result.allocations[0][1]; // P1->R2

        // Expect close to 50
        expect(r1Alloc).toBeCloseTo(50, 0);
        expect(r2Alloc).toBeCloseTo(50, 0);
        expect(r1Alloc + r2Alloc).toBeLessThanOrEqual(100.01);
    });

    it('should respect compatibility constraints', () => {
        // P1 (Type A)
        // R1 (Type B) -> Incompatible
        // R2 (Type A) -> Compatible

        const providerSlots: AvailabilitySlot[] = [
            { id: 'p1', quantity: 10, type_id: 'TypeA', name: 'P1', members: [] }
        ];

        const myRecognition = { 'r1': 1.0, 'r2': 1.0 };
        const allCommitments: Record<string, Commitment> = {
            'r1': {
                need_slots: [{ id: 'n1', quantity: 10, type_id: 'TypeB', name: 'N1' }],
                global_recognition_weights: { 'provider': 1.0 },
                timestamp: 1, itcStamp: {}
            },
            'r2': {
                need_slots: [{ id: 'n2', quantity: 10, type_id: 'TypeA', name: 'N2' }],
                global_recognition_weights: { 'provider': 1.0 },
                timestamp: 1, itcStamp: {}
            }
        };

        const problem = prepareAllocationProblem(
            providerSlots,
            allCommitments,
            'provider',
            myRecognition
        );

        const r1Idx = problem.recipients.findIndex(r => r.pubKey === 'r1');
        const r2Idx = problem.recipients.findIndex(r => r.pubKey === 'r2');

        // MR weight for R1 should be 0 because incompatible
        expect(problem.mrWeights[0][r1Idx]).toBe(0);
        // MR weight for R2 should be 1.0 (normalized)
        expect(problem.mrWeights[0][r2Idx]).toBe(1.0);

        const result = solveEisenbergGale(problem);

        expect(result.allocations[0][r1Idx]).toBe(0);
        expect(result.allocations[0][r2Idx]).toBeGreaterThan(9);
    });

    it('should handle complex MR skew', () => {
        // P1 Cap 100
        // R1 Need 100, MR=0.8
        // R2 Need 100, MR=0.2
        //
        // Normalized MR: P1->R1 (0.8), P1->R2 (0.2)
        // Eisenberg-Gale with Log Utility ensures proportional fairness
        // Should allocate roughly proportional to MR weights if total capacity < total need?
        // Wait, Objective = Sum N_j * log( Sum w_ij * x_ij )
        //
        // If x_ij is the only variable, and constraints binds (Sum x = 100):
        // Maximize: 100 * log(0.8 * x1) + 100 * log(0.2 * x2)
        // subject to x1 + x2 = 100
        //
        // Simplify: max log(0.8 * x1) + log(0.2 * x2) 
        // = max log(x1) + log(x2) + const
        // Max occurs when x1 = x2 = 50!
        //
        // WAIT. 
        // Eisenberg-Gale outcome depends on whether weights are considered "property rights" or "utility coefficients".
        // In our formulation: U_j = w_ij * x_ij.
        // We maximize sum log(U_j).
        // This pushes U_j to be equal (if possible).
        // So 0.8 * x1 = 0.2 * x2
        // x2 = 4 * x1
        // x1 + 4x1 = 100 => 5x1 = 100 => x1 = 20.
        // So R1 gets 20, R2 gets 80.
        //
        // This implies Low MR -> High Allocation to equalize utility?
        // THAT SEEMS WRONG for "Mutual Recognition".
        // Usually, higher MR should mean MORE allocation.
        //
        // Maybe the formulation should be: U_j = x_ij (Utility is amount received)
        // And weights are in the OBJECTIVE?
        // Maximize Sum w_j * log(x_j)?
        //
        // Let's re-read the spec:
        // "Objective: Maximize: Σ_{j=1}^{n} N_j * log( Σ_{i=1}^{m} w_{ij} * x_{ij} + ε )"
        //
        // If w_{ij} is inside the log, it acts as a scaling factor on the resource.
        // If I have high weight w, my "effective" resource is multiplied.
        // To equalize "effective" resource (log maximization), I need LESS actual resource x.
        //
        // This means the spec provided might be interpreting w_{ij} inversely to typical intuition if optimizing for egalitarian utility.
        // OR, `w_{ij}` represents "efficiency" - i.e., provider i is very efficient for recipient j.
        //
        // BUT, if we want `w_{ij}` to represent "Claim" or "Priority":
        // The weight should be OUTSIDE the log: Max Sum w_j * log(x_j).
        //
        // However, looking at Eisenberg-Gale (1959):
        // "Consensus of subjective probabilities" - parimutuel betting.
        // Max Sum p_i log (sum r_ij x_j).
        //
        // Le's look at the implementation example output in the prompt:
        // w[P1,R1] = 0.6, w[P1,R2] = 0.4
        // Solution: x11 = 48, x12 = 52.
        // R1 (0.6) gets LESS than R2 (0.4)?
        // 48 vs 52.
        // Wait, R2 has access to P2 as well in that example.
        //
        // Let's test what the CURRENT implementation does.
        // If my implementation follows the spec w * x inside log, it will likely equalize w*x.
        // So High W -> Low X.
        //
        // If the user intends High W -> High X, the formula implies w should be outside?
        // "Maximize: Σ_{j=1}^{n} N_j * log( Σ_{i=1}^{m} w_{ij} * x_{ij} + ε )"
        // The N_j is outside. N_j acts as the priority weight.
        // The w_{ij} is inside.
        //
        // This implies: "Recipients with high NEED (N) get priority."
        // "Providers with high MR (w) contribute more utility per unit allocated."
        // So the system prefers allocating from High-MR providers because it's "cheaper" to satisfy the log term?
        // No, maximize log(w*x). To increase this, we want high w*x.
        // Since log is monotonic, maximizing w*x is good.
        // But w is fixed.
        //
        // Actually, if we have choice between P1 (w=0.8) and P2 (w=0.2) for Recipient R:
        // Allocating 1 unit from P1 gives 0.8 utility.
        // Allocating 1 unit from P2 gives 0.2 utility.
        // System will prefer P1 (Efficiency).
        //
        // BUT, if we have P1 splitting between R1 (w=0.8) and R2 (w=0.2):
        // Max log(0.8 * x1) + log(0.2 * x2).
        // = log(x1) + log(0.8) + log(x2) + log(0.2).
        // Const terms drop out.
        // We are just maximizing log(x1) + log(x2).
        // Result: x1 = x2.
        //
        // So MR weights INSIDE the log `w_{ij} * x_{ij}` essentially cancel out for single-provider splits if they are just multiplicative constants!
        // They only matter for *routing* (choosing which provider to use).
        // They DO NOT affect the split ratio between recipients if there's only one provider.
        //
        // This suggests the Spec's formulation might result in Equal Shares (weighted by Needs N_j) rather than MR-weighted shares.
        //
        // The Prompt says: "Properties: Proportionality... If all MR weights equal... proportional to need".
        // It says "Envy-Freeness: No recipient prefers another's allocation weighted by MR".
        //
        // Let's verify this behavior in the test. If it gives equal shares despite MR skew, then the spec implies MR is only for routing efficiency, OR the spec assumes `N_j` should derive from MR?
        // No, N_j is declared need.
        //
        // Hypothesis: The implementation will give Equal Shares (50/50) in the single-provider case, ignoring MR.

        const providerSlots: AvailabilitySlot[] = [
            { id: 'p1', quantity: 100, type_id: 't1', name: 'P1', members: [] }
        ];

        const myRecognition = { 'r1': 0.8, 'r2': 0.2 };
        // Note: myRecognition here affects the MR calculation in Stage 1.
        // r1 -> 0.8, r2 -> 0.2

        const allCommitments: Record<string, Commitment> = {
            'r1': {
                need_slots: [{ id: 'n1', quantity: 100, type_id: 't1', name: 'N1' }],
                global_recognition_weights: { 'provider': 1.0 },
                timestamp: 1, itcStamp: {}
            },
            'r2': {
                need_slots: [{ id: 'n2', quantity: 100, type_id: 't1', name: 'N2' }],
                global_recognition_weights: { 'provider': 1.0 },
                timestamp: 1, itcStamp: {}
            }
        };

        const problem = prepareAllocationProblem(providerSlots, allCommitments, 'provider', myRecognition);

        expect(problem.mrWeights[0][0]).toBeCloseTo(0.8);
        expect(problem.mrWeights[0][1]).toBeCloseTo(0.2);

        const result = solveEisenbergGale(problem, 1e-9, 2000);

        console.log("MR Skew Allocations:", result.allocations[0]);

        // Based on math above (Max log(w1*x1) + log(w2*x2) s.t. x1+x2=C => x1=x2), 
        // we expect equal allocations if N1=N2.
        // This might be "working as specified" but maybe not "intended" if user wants MR to skew allocation.
        // If user wants MR to skew allocation, MR should be in the exponent or outside log.
        // e.g. Max w1*log(x1) + w2*log(x2).

        // But I must implement the SPECIFIED algorithm.
        // I will expect equal allocations here (approx 50/50).

        const x1 = result.allocations[0][0];
        const x2 = result.allocations[0][1];

        // Allow for some gradient descent noise
        expect(Math.abs(x1 - x2)).toBeLessThan(5.0);
    });
});
