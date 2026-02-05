
import { describe, it, expect } from 'vitest';
import { DistributedADMMAllocator } from './allocation-admm.js';
import { OptimizedADMMAllocator } from './allocation-admm-optimized.js';
import type { ProviderAgent, RecipientAgent } from './allocation-admm.js';

describe('Optimized ADMM Allocator', () => {

    it('should match standard ADMM results for symmetric case', () => {
        const providers: ProviderAgent[] = [{
            id: 0,
            capacity: 100,
            compatible_recipients: [1, 2]
        }];

        const recipients: RecipientAgent[] = [
            { id: 1, need: 50, compatible_providers: [0], w_ij: { 0: 1.0 } },
            { id: 2, need: 50, compatible_providers: [0], w_ij: { 0: 1.0 } }
        ];

        const standard = new DistributedADMMAllocator({ rho: 1.0 });
        const optimized = new OptimizedADMMAllocator({ rho: 1.0 });

        const resStd = standard.solve(providers, recipients);
        const resOpt = optimized.solve(providers, recipients);

        expect(resOpt.converged).toBe(true);
        expect(resOpt.allocations[0][1]).toBeCloseTo(50, 1); // Close to standard results
        expect(resOpt.allocations[0][1]).toBeCloseTo(resStd.allocations[0][1], 2);
    });

    it('should handle large scale (100x100) faster', () => {
        // Generate synthetic data
        const N_PROVIDERS = 50;
        const N_RECIPIENTS = 50;
        const DENSITY = 0.2; // 20% connectivity

        const providers: ProviderAgent[] = [];
        const recipients: RecipientAgent[] = [];

        for (let i = 0; i < N_PROVIDERS; i++) {
            providers.push({
                id: i,
                capacity: 100,
                compatible_recipients: []
            });
        }

        for (let j = 0; j < N_RECIPIENTS; j++) {
            recipients.push({
                id: j + 1000, // Offset IDs
                need: 80,
                compatible_providers: [],
                w_ij: {}
            });
        }

        // Random Connections
        for (let i = 0; i < N_PROVIDERS; i++) {
            for (let j = 0; j < N_RECIPIENTS; j++) {
                if (Math.random() < DENSITY) {
                    providers[i].compatible_recipients.push(j + 1000);
                    recipients[j].compatible_providers.push(i);
                    recipients[j].w_ij[i] = 1.0 + Math.random();
                }
            }
        }

        const standard = new DistributedADMMAllocator({ rho: 1.0, maxIterations: 50 });
        const optimized = new OptimizedADMMAllocator({ rho: 1.0, maxIterations: 50 });

        const startStd = performance.now();
        standard.solve(providers, recipients);
        const endStd = performance.now();

        const startOpt = performance.now();
        optimized.solve(providers, recipients);
        const endOpt = performance.now();

        console.log(`Standard ADMM: ${(endStd - startStd).toFixed(2)}ms`);
        console.log(`Optimized ADMM: ${(endOpt - startOpt).toFixed(2)}ms`);

        expect(endOpt - startOpt).toBeLessThan(endStd - startStd);
    });
});
