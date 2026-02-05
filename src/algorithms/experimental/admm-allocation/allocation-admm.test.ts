
import { describe, it, expect } from 'vitest';
import { DistributedADMMAllocator, type ProviderAgent, type RecipientAgent } from './allocation-admm.js';

describe('Distributed ADMM Allocation Algorithm', () => {

    it('should solve a simple symmetrical 1-provider 2-recipient problem', () => {
        // Provider 0: Capacity 100
        // Recipient 1: Need 50 (MR Weight 1.0)
        // Recipient 2: Need 50 (MR Weight 1.0)
        // Expect: 50 each

        const providers: ProviderAgent[] = [{
            id: 0,
            capacity: 100,
            compatible_recipients: [1, 2]
        }];

        const recipients: RecipientAgent[] = [
            {
                id: 1,
                need: 50,
                compatible_providers: [0],
                w_ij: { 0: 1.0 }
            },
            {
                id: 2,
                need: 50,
                compatible_providers: [0],
                w_ij: { 0: 1.0 }
            }
        ];

        const solver = new DistributedADMMAllocator({ rho: 1.0, maxIterations: 100 });
        const solution = solver.solve(providers, recipients);

        expect(solution.converged).toBe(true);
        expect(solution.allocations[0][1]).toBeCloseTo(50, 1);
        expect(solution.allocations[0][2]).toBeCloseTo(50, 1);
    });

    it('should handle MR skew correctly (Log Utility Equality)', () => {
        // Provider 0: Capacity 100
        // Recipient 1: Need 100 (MR Weight 2.0 - High MR)
        // Recipient 2: Need 100 (MR Weight 1.0 - Low MR)
        // Log utility maximizes Σ N_j * log(Σ w_ij * x_ij)
        // For equal needs N_1=N_2=100:
        // Maximize 100*log(2*x1) + 100*log(1*x2) s.t. x1+x2=100
        // log(2*x1) + log(x2) = log(2*x1*x2)
        // Maximize product x1*x2 => Equal split x1=50, x2=50
        // Wait, does w_ij *inside* the log mean standard proportional fairness?
        // Let's see what the solver does. If it maximizes sum log(w*x), it drives towards w*x being equal?
        // If w1*x1 = w2*x2 => 2*x1 = 1*x2 => x2 = 2*x1.
        // x1 + 2*x1 = 100 => 3x1 = 100 => x1 = 33.33, x2 = 66.66
        // So Low MR gets MORE allocation? (To equalize the weighted amount?)
        // Or is it Σ w_ij * log(x_ij)? The formulation is Σ N_j * log(Σ w_ij * x_ij)

        // If the objective is Σ log(w*x), then gradients are 1/x (w cancels out).
        // Gradient of log(w*x) is (w / (w*x)) = 1/x.
        // So gradients are equal when 1/x1 = 1/x2 => x1 = x2.
        // So w_ij acts as a constant shift in utility but doesn't affect the optimal x distribution?
        // log(w*x) = log(w) + log(x). Since log(w) is constant, maximizing is same as maximizing Σ log(x).
        // RESULT: Equal split (50/50).

        const providers: ProviderAgent[] = [{
            id: 0,
            capacity: 100,
            compatible_recipients: [1, 2]
        }];

        const recipients: RecipientAgent[] = [
            {
                id: 1,
                need: 100,
                compatible_providers: [0],
                w_ij: { 0: 2.0 } // High MR
            },
            {
                id: 2,
                need: 100,
                compatible_providers: [0],
                w_ij: { 0: 1.0 } // Low MR
            }
        ];

        const solver = new DistributedADMMAllocator({ rho: 1.0, maxIterations: 200 });
        const solution = solver.solve(providers, recipients);

        expect(solution.converged).toBe(true);
        expect(solution.allocations[0][1]).toBeCloseTo(50, 1);
        expect(solution.allocations[0][2]).toBeCloseTo(50, 1);
    });

    it('should respect different needs (Proportional Allocation)', () => {
        // Provider 0: Capacity 100
        // Recipient 1: Need 20
        // Recipient 2: Need 80
        // Both want full amount. Should fill both.

        const providers: ProviderAgent[] = [{
            id: 0,
            capacity: 100,
            compatible_recipients: [1, 2]
        }];

        const recipients: RecipientAgent[] = [
            { id: 1, need: 20, compatible_providers: [0], w_ij: { 0: 1 } },
            { id: 2, need: 80, compatible_providers: [0], w_ij: { 0: 1 } }
        ];

        const solver = new DistributedADMMAllocator({ rho: 1.0 });
        const solution = solver.solve(providers, recipients);

        expect(solution.allocations[0][1]).toBeCloseTo(20, 1);
        expect(solution.allocations[0][2]).toBeCloseTo(80, 1);
    });

    it('should handle scarcity with proportional fairness', () => {
        // Provider 0: Capacity 60
        // Recipient 1: Need 40
        // Recipient 2: Need 40
        // Expect: 30 each (Equal split of scarcity)

        const providers: ProviderAgent[] = [{
            id: 0,
            capacity: 60,
            compatible_recipients: [1, 2]
        }];

        const recipients: RecipientAgent[] = [
            { id: 1, need: 40, compatible_providers: [0], w_ij: { 0: 1 } },
            { id: 2, need: 40, compatible_providers: [0], w_ij: { 0: 1 } }
        ];

        const solver = new DistributedADMMAllocator({ rho: 1.0 });
        const solution = solver.solve(providers, recipients);

        expect(solution.allocations[0][1]).toBeCloseTo(30, 1);
        expect(solution.allocations[0][2]).toBeCloseTo(30, 1);
    });
});
