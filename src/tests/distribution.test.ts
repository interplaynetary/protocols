/**
 * Distribution Calculation Tests - Phase 2
 * 
 * Tests the distribution.ts module to ensure proper tier assignment and share calculation.
 */

import { describe, it, expect } from 'vitest';
import {
    calculateTwoTierMutualRecognitionDistribution,
    calculateMutualRecognitionDistribution,
    calculateEqualSharesDistribution,
    createCustomDistribution,
    createMultiTierDistribution,
    computeMutualRecognition
} from '../distribution.js';
import type { GlobalRecognitionWeights } from '../schemas.js';

describe('distribution.ts - Distribution Calculations', () => {
    describe('Mutual Recognition Computation', () => {
        it('should compute mutual recognition as min(R_A(B), R_B(A))', () => {
            const myPubkey = 'me';
            const myRecognition: GlobalRecognitionWeights = {
                'alice': 0.6,
                'bob': 0.4
            };

            const othersRecognition: Record<string, GlobalRecognitionWeights> = {
                'alice': { 'me': 0.5, 'bob': 0.5 },
                'bob': { 'me': 0.8, 'alice': 0.2 }
            };

            const result = computeMutualRecognition(myRecognition, othersRecognition, myPubkey);

            // Alice: min(0.6, 0.5) = 0.5
            expect(result['alice']).toBeCloseTo(0.5, 2);

            // Bob: min(0.4, 0.8) = 0.4
            expect(result['bob']).toBeCloseTo(0.4, 2);
        });

        it('should return 0 for one-way recognition', () => {
            const myPubkey = 'me';
            const myRecognition: GlobalRecognitionWeights = {
                'alice': 0.6
            };

            const othersRecognition: Record<string, GlobalRecognitionWeights> = {
                'alice': { 'bob': 1.0 } // Alice doesn't recognize me
            };

            const result = computeMutualRecognition(myRecognition, othersRecognition, myPubkey);

            // No mutual recognition (I recognize Alice 0.6, but she recognizes me 0)
            expect(result['alice']).toBe(0);
        });

        it('should handle self-recognition', () => {
            const myPubkey = 'me';
            const myRecognition: GlobalRecognitionWeights = {
                'me': 1.0,
                'alice': 0.5
            };

            const othersRecognition: Record<string, GlobalRecognitionWeights> = {
                'me': { 'me': 1.0, 'alice': 0.3 },
                'alice': { 'me': 0.4 }
            };

            const result = computeMutualRecognition(myRecognition, othersRecognition, myPubkey);

            // Self-recognition: MR(me, me) = myRec[me] = 1.0
            expect(result['me']).toBe(1.0);

            // Alice: min(0.5, 0.4) = 0.4
            expect(result['alice']).toBeCloseTo(0.4, 2);
        });

        it('should include everyone in network (Loop 1 + Loop 2)', () => {
            const myPubkey = 'me';
            const myRecognition: GlobalRecognitionWeights = {
                'alice': 0.6
            };

            const othersRecognition: Record<string, GlobalRecognitionWeights> = {
                'alice': { 'me': 0.5 },
                'bob': { 'me': 0.3 } // Bob recognizes me, but I don't recognize Bob
            };

            const result = computeMutualRecognition(myRecognition, othersRecognition, myPubkey);

            // Alice: min(0.6, 0.5) = 0.5
            expect(result['alice']).toBeCloseTo(0.5, 2);

            // Bob: min(0, 0.3) = 0 (I don't recognize Bob)
            expect(result['bob']).toBe(0);
        });

        it('should handle missing recognition gracefully', () => {
            const myPubkey = 'me';
            const myRecognition: GlobalRecognitionWeights = {
                'alice': 0.6
            };

            const othersRecognition: Record<string, GlobalRecognitionWeights> = {};

            const result = computeMutualRecognition(myRecognition, othersRecognition, myPubkey);

            // Alice: min(0.6, 0) = 0 (no recognition from Alice)
            expect(result['alice']).toBe(0);
        });
    });

    describe('Two-Tier Distribution', () => {
        it('should populate tiers array correctly', () => {
            const myPubkey = 'me';
            const myRecognition: GlobalRecognitionWeights = {
                'alice': 0.6,
                'bob': 0.3,
                'carol': 0.1
            };

            const othersRecognition: Record<string, GlobalRecognitionWeights> = {
                'alice': { 'me': 0.5 }, // Mutual
                'bob': { 'me': 0.0 },   // Non-mutual (I recognize, they don't)
                'carol': { 'me': 0.0 }  // Non-mutual
            };

            const distribution = calculateTwoTierMutualRecognitionDistribution(
                myRecognition,
                othersRecognition,
                myPubkey
            );

            // Should have tiers array
            expect(distribution.tiers).toBeDefined();
            expect(distribution.tiers!.length).toBe(2);

            // Tier 0 (mutual) should have Alice
            const tier0 = distribution.tiers!.find(t => t.priority === 0);
            expect(tier0).toBeDefined();
            expect(tier0!.shares['alice']).toBeGreaterThan(0);
            expect(tier0!.label).toBe('mutual-recognition');

            // Tier 1 (non-mutual) should have Bob and Carol
            const tier1 = distribution.tiers!.find(t => t.priority === 1);
            expect(tier1).toBeDefined();
            expect(tier1!.shares['bob']).toBeGreaterThan(0);
            expect(tier1!.shares['carol']).toBeGreaterThan(0);
            expect(tier1!.label).toBe('non-mutual-recognition');
        });

        it('should normalize tier shares to sum ≤ 1.0', () => {
            const myPubkey = 'me';
            const myRecognition: GlobalRecognitionWeights = {
                'alice': 0.6,
                'bob': 0.4
            };

            const othersRecognition: Record<string, GlobalRecognitionWeights> = {
                'alice': { 'me': 0.5 },
                'bob': { 'me': 0.3 }
            };

            const distribution = calculateTwoTierMutualRecognitionDistribution(
                myRecognition,
                othersRecognition,
                myPubkey
            );

            // Tier 0 shares should sum to ≤ 1.0
            const tier0 = distribution.tiers!.find(t => t.priority === 0);
            const tier0Sum = Object.values(tier0!.shares).reduce((sum, val) => sum + val, 0);
            expect(tier0Sum).toBeLessThanOrEqual(1.0);
            expect(tier0Sum).toBeCloseTo(1.0, 2); // Should be normalized to 1.0
        });

        it('should handle all-mutual scenario', () => {
            const myPubkey = 'me';
            const myRecognition: GlobalRecognitionWeights = {
                'alice': 0.7,
                'bob': 0.3
            };

            const othersRecognition: Record<string, GlobalRecognitionWeights> = {
                'alice': { 'me': 0.6 },
                'bob': { 'me': 0.2 }
            };

            const distribution = calculateTwoTierMutualRecognitionDistribution(
                myRecognition,
                othersRecognition,
                myPubkey
            );

            // Tier 0 should have both
            const tier0 = distribution.tiers!.find(t => t.priority === 0);
            expect(Object.keys(tier0!.shares).length).toBe(2);

            // Tier 1 should be empty
            const tier1 = distribution.tiers!.find(t => t.priority === 1);
            expect(Object.keys(tier1!.shares).length).toBe(0);
        });

        it('should handle all-non-mutual scenario', () => {
            // Use unique pubkeys to avoid memoization cache collisions
            const myPubkey = 'provider_unique_123';
            const myRecognition: GlobalRecognitionWeights = {
                'alice_unique_123': 0.7,
                'bob_unique_123': 0.3
            };

            const othersRecognition: Record<string, GlobalRecognitionWeights> = {
                'alice_unique_123': { 'carol_unique_123': 1.0 }, // Alice doesn't recognize me
                'bob_unique_123': { 'carol_unique_123': 1.0 }    // Bob doesn't recognize me
            };

            const distribution = calculateTwoTierMutualRecognitionDistribution(
                myRecognition,
                othersRecognition,
                myPubkey
            );

            // Tier 0 should be empty (no mutual recognition)
            const tier0 = distribution.tiers!.find(t => t.priority === 0);
            expect(Object.keys(tier0!.shares).length).toBe(0);

            // Tier 1 should have both (I recognize them, they don't recognize me)
            const tier1 = distribution.tiers!.find(t => t.priority === 1);
            expect(Object.keys(tier1!.shares).length).toBe(2);
            expect(tier1!.shares['alice_unique_123']).toBeGreaterThan(0);
            expect(tier1!.shares['bob_unique_123']).toBeGreaterThan(0);
        });

        it('should include self in tier 0 for self-allocation', () => {
            const myPubkey = 'me';
            const myRecognition: GlobalRecognitionWeights = {
                'me': 1.0,
                'alice': 0.5
            };

            const othersRecognition: Record<string, GlobalRecognitionWeights> = {
                'me': { 'me': 1.0 },
                'alice': { 'me': 0.4 }
            };

            const distribution = calculateTwoTierMutualRecognitionDistribution(
                myRecognition,
                othersRecognition,
                myPubkey
            );

            // Tier 0 should include self
            const tier0 = distribution.tiers!.find(t => t.priority === 0);
            expect(tier0!.shares['me']).toBeGreaterThan(0);
            expect(tier0!.shares['alice']).toBeGreaterThan(0);
        });

        it('should filter by compatibleRecipients set', () => {
            const myPubkey = 'me';
            const myRecognition: GlobalRecognitionWeights = {
                'alice': 0.6,
                'bob': 0.4
            };

            const othersRecognition: Record<string, GlobalRecognitionWeights> = {
                'alice': { 'me': 0.5 },
                'bob': { 'me': 0.3 }
            };

            const compatibleRecipients = new Set(['alice']); // Only Alice is compatible

            const distribution = calculateTwoTierMutualRecognitionDistribution(
                myRecognition,
                othersRecognition,
                myPubkey,
                compatibleRecipients
            );

            // Should only include Alice
            const tier0 = distribution.tiers!.find(t => t.priority === 0);
            expect(tier0!.shares['alice']).toBeGreaterThan(0);
            expect(tier0!.shares['bob']).toBeUndefined();
        });

        it('should create proper metadata', () => {
            const myPubkey = 'me';
            const myRecognition: GlobalRecognitionWeights = {
                'alice': 0.6
            };

            const othersRecognition: Record<string, GlobalRecognitionWeights> = {
                'alice': { 'me': 0.5 }
            };

            const distribution = calculateTwoTierMutualRecognitionDistribution(
                myRecognition,
                othersRecognition,
                myPubkey
            );

            // Should have metadata
            expect(distribution.metadata).toBeDefined();
            expect(distribution.metadata!.mutualRecognitionMatrix).toBeDefined();
            expect(distribution.metadata!.timestamp).toBeGreaterThan(0);
        });
    });

    describe('Other Distribution Methods', () => {
        it('should calculate equal shares', () => {
            const recipients = ['alice', 'bob', 'carol'];
            const distribution = calculateEqualSharesDistribution(recipients);

            // Each should get 1/3
            expect(distribution.shares['alice']).toBeCloseTo(1 / 3, 2);
            expect(distribution.shares['bob']).toBeCloseTo(1 / 3, 2);
            expect(distribution.shares['carol']).toBeCloseTo(1 / 3, 2);
            expect(distribution.method).toBe('equal-shares');
        });

        it('should calculate single-tier mutual recognition', () => {
            const myPubkey = 'me';
            const myRecognition: GlobalRecognitionWeights = {
                'alice': 0.6,
                'bob': 0.4
            };

            const othersRecognition: Record<string, GlobalRecognitionWeights> = {
                'alice': { 'me': 0.5 },
                'bob': { 'me': 0.3 }
            };

            const distribution = calculateMutualRecognitionDistribution(
                myRecognition,
                othersRecognition,
                myPubkey
            );

            // Should have shares for mutual recognition recipients
            expect(distribution.shares['alice']).toBeGreaterThan(0);
            expect(distribution.shares['bob']).toBeGreaterThan(0);
            expect(distribution.method).toBe('mutual-recognition');
        });

        it('should create custom distribution', () => {
            const customShares = {
                'alice': 0.7,
                'bob': 0.3
            };

            const distribution = createCustomDistribution(customShares);

            expect(distribution.shares['alice']).toBe(0.7);
            expect(distribution.shares['bob']).toBe(0.3);
            expect(distribution.method).toBe('custom');
        });

        it('should create multi-tier distribution', () => {
            const tiers: Array<{ priority: number; shares: Record<string, number>; label?: string }> = [
                { priority: 0, shares: { 'alice': 0.6, 'bob': 0.4 } as Record<string, number>, label: 'core-team' },
                { priority: 1, shares: { 'carol': 1.0 } as Record<string, number>, label: 'contributors' }
            ];

            const distribution = createMultiTierDistribution(tiers);

            expect(distribution.method).toBe('multi-tier');
            expect(distribution.tiers).toHaveLength(2);
            expect(distribution.tiers![0].label).toBe('core-team');
            expect(distribution.tiers![1].label).toBe('contributors');
        });

        it('should validate tier priorities (unique, non-negative)', () => {
            // Duplicate priorities should throw
            expect(() => {
                createMultiTierDistribution([
                    { priority: 0, shares: { 'alice': 1.0 } },
                    { priority: 0, shares: { 'bob': 1.0 } } // Duplicate!
                ]);
            }).toThrow('Duplicate tier priority');

            // Negative priorities should throw
            expect(() => {
                createMultiTierDistribution([
                    { priority: -1, shares: { 'alice': 1.0 } }
                ]);
            }).toThrow('Invalid tier priority');
        });
    });
});
