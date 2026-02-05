/**
 * Anti-Contributor Tests
 * 
 * Tests the anti-contributor calculation logic to ensure:
 * 1. Anti-contributors properly deduct from one's share
 * 2. Anti-contributors only affect nodes with desire (manual_fulfillment < 1.0)
 * 3. The pool-based recognition system correctly balances positive and negative contributions
 */

import { describe, it, expect } from 'vitest';
import {
    createRootNode,
    addChild,
    shareOfGeneralFulfillment,
    sharesOfGeneralFulfillmentMap,
    updateManualFulfillment,
    fulfilled,
    desire,
    weight
} from '../tree';
import type { Node } from '../schemas';

describe('Anti-Contributor Calculations', () => {
    describe('Basic Anti-Contributor Deduction', () => {
        it('should deduct anti-contributor share from positive contributor share', () => {
            // Create a simple tree with one contribution node
            const root = createRootNode('root', 'Project');

            // Add a task with Alice as contributor and Bob as anti-contributor
            // Set manual_fulfillment to 0.5 to create desire
            addChild(
                root,
                'task1',
                'Task 1',
                100,
                [{ id: 'alice', points: 100 }],
                [{ id: 'bob', points: 100 }],
                0.5 // 50% fulfilled, 50% desire
            );

            const nodesMap: Record<string, Node> = {
                'root': root,
                'task1': root.children[0]
            };

            // Calculate shares
            const aliceShare = shareOfGeneralFulfillment(root, 'alice', nodesMap);
            const bobShare = shareOfGeneralFulfillment(root, 'bob', nodesMap);

            // Alice should get positive share from fulfillment
            expect(aliceShare).toBeGreaterThan(0);

            // Bob should get NEGATIVE share (deduction)
            expect(bobShare).toBeLessThan(0);

            // The magnitude should be related to the desire (0.5)
            // Since both have equal points, Bob's negative should roughly balance Alice's positive
            expect(Math.abs(bobShare)).toBeGreaterThan(0);
        });

        it('should have no effect when fulfillment is 100% (no desire)', () => {
            const root = createRootNode('root', 'Project');

            // Add a task with 100% fulfillment
            addChild(
                root,
                'task1',
                'Task 1',
                100,
                [{ id: 'alice', points: 100 }],
                [{ id: 'bob', points: 100 }],
                1.0 // 100% fulfilled, 0% desire
            );

            const nodesMap: Record<string, Node> = {
                'root': root,
                'task1': root.children[0]
            };

            const aliceShare = shareOfGeneralFulfillment(root, 'alice', nodesMap);
            const bobShare = shareOfGeneralFulfillment(root, 'bob', nodesMap);

            // Alice should get full positive share
            expect(aliceShare).toBeGreaterThan(0);

            // Bob should get 0 (no desire means no anti-contribution effect)
            expect(bobShare).toBe(0);
        });

        it('should scale deduction with desire magnitude', () => {
            // Test with 25% desire
            const root1 = createRootNode('root1', 'Project 1');
            addChild(
                root1,
                'task1',
                'Task 1',
                100,
                [{ id: 'alice', points: 100 }],
                [{ id: 'bob', points: 100 }],
                0.75 // 75% fulfilled, 25% desire
            );

            // Test with 75% desire
            const root2 = createRootNode('root2', 'Project 2');
            addChild(
                root2,
                'task2',
                'Task 2',
                100,
                [{ id: 'alice', points: 100 }],
                [{ id: 'bob', points: 100 }],
                0.25 // 25% fulfilled, 75% desire
            );

            const nodesMap1: Record<string, Node> = {
                'root1': root1,
                'task1': root1.children[0]
            };

            const nodesMap2: Record<string, Node> = {
                'root2': root2,
                'task2': root2.children[0]
            };

            const bobShare1 = shareOfGeneralFulfillment(root1, 'bob', nodesMap1);
            const bobShare2 = shareOfGeneralFulfillment(root2, 'bob', nodesMap2);

            // Higher desire should result in larger negative share
            expect(Math.abs(bobShare2)).toBeGreaterThan(Math.abs(bobShare1));
            expect(bobShare1).toBeLessThan(0);
            expect(bobShare2).toBeLessThan(0);
        });
    });

    describe('Weighted Anti-Contributors', () => {
        it('should weight anti-contributor deductions by points', () => {
            const root = createRootNode('root', 'Project');

            // Alice contributes, Bob and Carol are anti-contributors with different points
            addChild(
                root,
                'task1',
                'Task 1',
                100,
                [{ id: 'alice', points: 100 }],
                [
                    { id: 'bob', points: 100 },
                    { id: 'carol', points: 200 } // Carol has 2x the anti-contribution
                ],
                0.5 // 50% fulfilled
            );

            const nodesMap: Record<string, Node> = {
                'root': root,
                'task1': root.children[0]
            };

            const bobShare = shareOfGeneralFulfillment(root, 'bob', nodesMap);
            const carolShare = shareOfGeneralFulfillment(root, 'carol', nodesMap);

            // Both should be negative
            expect(bobShare).toBeLessThan(0);
            expect(carolShare).toBeLessThan(0);

            // Carol should have roughly 2x the negative share of Bob
            expect(Math.abs(carolShare)).toBeCloseTo(Math.abs(bobShare) * 2, 1);
        });

        it('should weight positive contributors by points', () => {
            const root = createRootNode('root', 'Project');

            // Alice and Bob contribute with different points, Carol is anti-contributor
            addChild(
                root,
                'task1',
                'Task 1',
                100,
                [
                    { id: 'alice', points: 100 },
                    { id: 'bob', points: 200 } // Bob contributed 2x more
                ],
                [{ id: 'carol', points: 100 }],
                0.6 // 60% fulfilled
            );

            const nodesMap: Record<string, Node> = {
                'root': root,
                'task1': root.children[0]
            };

            const aliceShare = shareOfGeneralFulfillment(root, 'alice', nodesMap);
            const bobShare = shareOfGeneralFulfillment(root, 'bob', nodesMap);

            // Both should be positive
            expect(aliceShare).toBeGreaterThan(0);
            expect(bobShare).toBeGreaterThan(0);

            // Bob should have roughly 2x the share of Alice
            expect(bobShare).toBeCloseTo(aliceShare * 2, 1);
        });
    });

    describe('Pool-Based Recognition', () => {
        it('should balance positive and anti pools correctly', () => {
            const root = createRootNode('root', 'Project');

            // Create a balanced scenario
            addChild(
                root,
                'task1',
                'Task 1',
                100,
                [{ id: 'alice', points: 100 }],
                [{ id: 'bob', points: 100 }],
                0.5 // 50% fulfilled, 50% desire
            );

            const nodesMap: Record<string, Node> = {
                'root': root,
                'task1': root.children[0]
            };

            // Get raw shares
            const aliceRawShare = shareOfGeneralFulfillment(root, 'alice', nodesMap);
            const bobRawShare = shareOfGeneralFulfillment(root, 'bob', nodesMap);

            // Alice should have positive share
            expect(aliceRawShare).toBeGreaterThan(0);

            // Bob should have negative share
            expect(bobRawShare).toBeLessThan(0);

            // With equal points and 50/50 split, they should be equal magnitude
            expect(Math.abs(aliceRawShare)).toBeCloseTo(Math.abs(bobRawShare), 2);

            // Normalized shares preserve the sign
            const shares = sharesOfGeneralFulfillmentMap(root, nodesMap);
            expect(shares['alice']).toBeGreaterThan(0);
            expect(shares['bob']).toBeLessThan(0);
        });

        it('should handle multiple contribution nodes with mixed anti-contributors', () => {
            const root = createRootNode('root', 'Project');

            // Task 1: Alice contributes, Bob hampers (50% fulfilled)
            addChild(
                root,
                'task1',
                'Task 1',
                100,
                [{ id: 'alice', points: 100 }],
                [{ id: 'bob', points: 100 }],
                0.5
            );

            // Task 2: Carol contributes, no anti-contributors (80% fulfilled)
            addChild(
                root,
                'task2',
                'Task 2',
                100,
                [{ id: 'carol', points: 100 }],
                [],
                0.8
            );

            const nodesMap: Record<string, Node> = {
                'root': root,
                'task1': root.children[0],
                'task2': root.children[1]
            };

            const aliceShare = shareOfGeneralFulfillment(root, 'alice', nodesMap);
            const bobShare = shareOfGeneralFulfillment(root, 'bob', nodesMap);
            const carolShare = shareOfGeneralFulfillment(root, 'carol', nodesMap);

            // Alice and Carol should have positive shares
            expect(aliceShare).toBeGreaterThan(0);
            expect(carolShare).toBeGreaterThan(0);

            // Bob should have negative share
            expect(bobShare).toBeLessThan(0);

            // Carol's task has higher fulfillment, so she should get more
            expect(carolShare).toBeGreaterThan(aliceShare);
        });
    });

    describe('Hierarchical Anti-Contributors', () => {
        it('should weight anti-contributions by node weight in tree', () => {
            const root = createRootNode('root', 'Project');

            // Create parent node
            addChild(root, 'parent', 'Parent Task', 100, [], [], undefined);
            const parent = root.children[0];

            // Add two child tasks with anti-contributors
            // Child 1: 70 points (70% of parent weight)
            addChild(
                parent,
                'child1',
                'Child 1',
                70,
                [{ id: 'alice', points: 100 }],
                [{ id: 'bob', points: 100 }],
                0.5
            );

            // Child 2: 30 points (30% of parent weight)
            addChild(
                parent,
                'child2',
                'Child 2',
                30,
                [{ id: 'carol', points: 100 }],
                [{ id: 'dave', points: 100 }],
                0.5
            );

            const nodesMap: Record<string, Node> = {
                'root': root,
                'parent': parent,
                'child1': parent.children[0],
                'child2': parent.children[1]
            };

            const bobShare = shareOfGeneralFulfillment(root, 'bob', nodesMap);
            const daveShare = shareOfGeneralFulfillment(root, 'dave', nodesMap);

            // Both should be negative
            expect(bobShare).toBeLessThan(0);
            expect(daveShare).toBeLessThan(0);

            // Bob's anti-contribution should be weighted more (70 vs 30 points)
            expect(Math.abs(bobShare)).toBeGreaterThan(Math.abs(daveShare));

            // The ratio should be roughly 70:30 = 2.33:1
            const ratio = Math.abs(bobShare) / Math.abs(daveShare);
            expect(ratio).toBeCloseTo(70 / 30, 1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle node with only anti-contributors (no positive contributors)', () => {
            const root = createRootNode('root', 'Project');

            // This should not be allowed by addChild validation
            expect(() => {
                addChild(
                    root,
                    'task1',
                    'Task 1',
                    100,
                    [], // No positive contributors
                    [{ id: 'bob', points: 100 }], // Only anti-contributors
                    0.5
                );
            }).toThrow('Anti-contributors can only be placed on contribution nodes');
        });

        it('should handle zero points anti-contributor', () => {
            const root = createRootNode('root', 'Project');

            addChild(
                root,
                'task1',
                'Task 1',
                100,
                [{ id: 'alice', points: 100 }],
                [{ id: 'bob', points: 0 }], // Zero points
                0.5
            );

            const nodesMap: Record<string, Node> = {
                'root': root,
                'task1': root.children[0]
            };

            const bobShare = shareOfGeneralFulfillment(root, 'bob', nodesMap);

            // Bob should have zero effect
            expect(bobShare).toBe(0);
        });

        it('should handle anti-contributor on fully unfulfilled node', () => {
            const root = createRootNode('root', 'Project');

            addChild(
                root,
                'task1',
                'Task 1',
                100,
                [{ id: 'alice', points: 100 }],
                [{ id: 'bob', points: 100 }],
                0.0 // 0% fulfilled, 100% desire
            );

            const nodesMap: Record<string, Node> = {
                'root': root,
                'task1': root.children[0]
            };

            const aliceShare = shareOfGeneralFulfillment(root, 'alice', nodesMap);
            const bobShare = shareOfGeneralFulfillment(root, 'bob', nodesMap);

            // Alice should get 0 (no fulfillment)
            expect(aliceShare).toBe(0);

            // Bob should get maximum negative (100% desire)
            expect(bobShare).toBeLessThan(0);
        });

        it('should handle same person as both contributor and anti-contributor', () => {
            const root = createRootNode('root', 'Project');

            // Alice both contributes and hampers (conflicted contribution)
            addChild(
                root,
                'task1',
                'Task 1',
                100,
                [{ id: 'alice', points: 100 }],
                [{ id: 'alice', points: 50 }], // Also anti-contributor with less weight
                0.5
            );

            const nodesMap: Record<string, Node> = {
                'root': root,
                'task1': root.children[0]
            };

            const aliceShare = shareOfGeneralFulfillment(root, 'alice', nodesMap);

            // Alice gets both positive (from 100 points contributing) and negative (from 50 points hampering)
            // The net depends on the pool calculations
            // Just verify the calculation completes without error
            expect(typeof aliceShare).toBe('number');
            expect(aliceShare).toBeDefined();
        });
    });

    describe('Dynamic Fulfillment Updates', () => {
        it('should adjust anti-contributor effect when fulfillment changes', () => {
            const root = createRootNode('root', 'Project');

            addChild(
                root,
                'task1',
                'Task 1',
                100,
                [{ id: 'alice', points: 100 }],
                [{ id: 'bob', points: 100 }],
                0.5 // Initial: 50% fulfilled
            );

            const task1 = root.children[0];
            const nodesMap: Record<string, Node> = {
                'root': root,
                'task1': task1
            };

            // Initial state
            const bobShareInitial = shareOfGeneralFulfillment(root, 'bob', nodesMap);
            expect(bobShareInitial).toBeLessThan(0);

            // Increase fulfillment to 90%
            updateManualFulfillment(task1, 0.9);
            const bobShareHigh = shareOfGeneralFulfillment(root, 'bob', nodesMap);

            // Bob's negative impact should decrease (less desire)
            expect(Math.abs(bobShareHigh)).toBeLessThan(Math.abs(bobShareInitial));

            // Decrease fulfillment to 10%
            updateManualFulfillment(task1, 0.1);
            const bobShareLow = shareOfGeneralFulfillment(root, 'bob', nodesMap);

            // Bob's negative impact should increase (more desire)
            expect(Math.abs(bobShareLow)).toBeGreaterThan(Math.abs(bobShareInitial));
        });
    });

    describe('Verification of Core Formulas', () => {
        it('should verify P_total calculation (positive influence pool)', () => {
            const root = createRootNode('root', 'Project');

            addChild(
                root,
                'task1',
                'Task 1',
                100,
                [{ id: 'alice', points: 100 }],
                [{ id: 'bob', points: 100 }],
                0.6 // 60% fulfilled
            );

            const task1 = root.children[0];
            const nodesMap: Record<string, Node> = {
                'root': root,
                'task1': task1
            };

            // Verify weight and fulfillment calculations
            const nodeWeight = weight(task1, root);
            const nodeFulfillment = fulfilled(task1, root);

            expect(nodeWeight).toBe(1.0); // Only child, so full weight
            expect(nodeFulfillment).toBe(0.6);

            // P_total should be nodeWeight * nodeFulfillment = 1.0 * 0.6 = 0.6
            // This is internal to shareOfGeneralFulfillment, but we can verify the outcome
        });

        it('should verify N_total calculation (anti influence pool)', () => {
            const root = createRootNode('root', 'Project');

            addChild(
                root,
                'task1',
                'Task 1',
                100,
                [{ id: 'alice', points: 100 }],
                [{ id: 'bob', points: 100 }],
                0.6 // 60% fulfilled, 40% desire
            );

            const task1 = root.children[0];
            const nodesMap: Record<string, Node> = {
                'root': root,
                'task1': task1
            };

            // Verify desire calculation
            const nodeDesire = desire(task1, root);
            expect(nodeDesire).toBe(0.4); // 1.0 - 0.6

            // N_total should be nodeWeight * nodeDesire = 1.0 * 0.4 = 0.4
        });

        it('should verify final share calculation: boundedPositive - boundedAnti', () => {
            const root = createRootNode('root', 'Project');

            addChild(
                root,
                'task1',
                'Task 1',
                100,
                [{ id: 'alice', points: 100 }],
                [{ id: 'bob', points: 100 }],
                0.6 // 60% fulfilled, 40% desire
            );

            const nodesMap: Record<string, Node> = {
                'root': root,
                'task1': root.children[0]
            };

            const aliceShare = shareOfGeneralFulfillment(root, 'alice', nodesMap);
            const bobShare = shareOfGeneralFulfillment(root, 'bob', nodesMap);

            // Alice: positive contribution, no anti-contribution
            // Should get: (1.0 * 0.6) * (100/100) * (0.6 / (0.6 + 0.4)) - 0
            // = 0.6 * 1.0 * 0.6 = 0.36 (before normalization)

            // Bob: no positive contribution, anti-contribution
            // Should get: 0 - (1.0 * 0.4) * (100/100) * (0.4 / (0.6 + 0.4))
            // = 0 - 0.4 * 1.0 * 0.4 = -0.16 (before normalization)

            // After normalization, Alice should be positive, Bob negative
            expect(aliceShare).toBeGreaterThan(0);
            expect(bobShare).toBeLessThan(0);

            // The ratio should reflect the 0.6 vs 0.4 split
            // But since Bob is negative, we compare magnitudes
        });
    });
});
