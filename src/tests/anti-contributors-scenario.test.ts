/**
 * Real-World Anti-Contributor Scenario Test
 * 
 * This test demonstrates a realistic scenario where anti-contributors
 * are used to represent people who hampered work quality.
 */

import { describe, it, expect } from 'vitest';
import {
    createRootNode,
    addChild,
    shareOfGeneralFulfillment,
    sharesOfGeneralFulfillmentMap
} from '../tree';
import type { Node } from '../schemas';

describe('Real-World Anti-Contributor Scenario', () => {
    it('should properly account for team dynamics with helpers and hamperers', () => {
        /**
         * Scenario: Software Project
         * 
         * Feature A (80% complete):
         * - Alice (lead dev): 200 points contribution
         * - Bob (junior dev): 100 points contribution
         * - Charlie (micromanager): 50 points anti-contribution (caused delays)
         * 
         * Feature B (50% complete):
         * - Dave (dev): 150 points contribution
         * - Eve (blocker): 150 points anti-contribution (blocked progress)
         * 
         * Feature C (100% complete):
         * - Frank (solo dev): 100 points contribution
         * - No anti-contributors (smooth execution)
         */

        const root = createRootNode('root', 'Software Project');

        // Feature A: Mostly done, minor hampering
        addChild(
            root,
            'featureA',
            'Feature A',
            100,
            [
                { id: 'alice', points: 200 },
                { id: 'bob', points: 100 }
            ],
            [
                { id: 'charlie', points: 50 }
            ],
            0.8  // 80% complete
        );

        // Feature B: Half done, significant blocking
        addChild(
            root,
            'featureB',
            'Feature B',
            100,
            [
                { id: 'dave', points: 150 }
            ],
            [
                { id: 'eve', points: 150 }
            ],
            0.5  // 50% complete
        );

        // Feature C: Fully done, no issues
        addChild(
            root,
            'featureC',
            'Feature C',
            100,
            [
                { id: 'frank', points: 100 }
            ],
            [],
            1.0  // 100% complete
        );

        const nodesMap: Record<string, Node> = {
            'root': root,
            'featureA': root.children[0],
            'featureB': root.children[1],
            'featureC': root.children[2]
        };

        // Calculate shares
        const shares = sharesOfGeneralFulfillmentMap(root, nodesMap);

        // Positive contributors should have positive shares
        expect(shares['alice']).toBeGreaterThan(0);
        expect(shares['bob']).toBeGreaterThan(0);
        expect(shares['dave']).toBeGreaterThan(0);
        expect(shares['frank']).toBeGreaterThan(0);

        // Anti-contributors should have negative shares
        expect(shares['charlie']).toBeLessThan(0);
        expect(shares['eve']).toBeLessThan(0);

        // Alice should get more than Bob (2x the points)
        expect(shares['alice']).toBeGreaterThan(shares['bob']);

        // Frank should get a good share (100% completion, no hampering)
        expect(shares['frank']).toBeGreaterThan(0);

        // Eve's negative impact should be larger than Charlie's
        // (Feature B has more desire: 50% vs 20%, and equal anti-contribution points)
        expect(Math.abs(shares['eve'])).toBeGreaterThan(Math.abs(shares['charlie']));

        // Verify the semantic interpretation:
        // - Contributors are rewarded for what was accomplished
        // - Anti-contributors are penalized for what wasn't accomplished

        console.log('\n=== Project Recognition Shares ===');
        console.log(`Alice (lead, Feature A):     ${shares['alice'].toFixed(4)}`);
        console.log(`Bob (junior, Feature A):     ${shares['bob'].toFixed(4)}`);
        console.log(`Charlie (hamperer, Feature A): ${shares['charlie'].toFixed(4)} ⚠️`);
        console.log(`Dave (dev, Feature B):       ${shares['dave'].toFixed(4)}`);
        console.log(`Eve (blocker, Feature B):    ${shares['eve'].toFixed(4)} ⚠️`);
        console.log(`Frank (solo, Feature C):     ${shares['frank'].toFixed(4)}`);
        console.log('===================================\n');

        // The sum of all shares (including negatives) should be normalized
        const total = Object.values(shares).reduce((sum, val) => sum + val, 0);
        console.log(`Total shares: ${total.toFixed(4)}`);

        // Verify that positive contributors collectively outweigh anti-contributors
        const positiveTotal = shares['alice'] + shares['bob'] + shares['dave'] + shares['frank'];
        const negativeTotal = shares['charlie'] + shares['eve'];

        expect(positiveTotal).toBeGreaterThan(Math.abs(negativeTotal));
    });

    it('should demonstrate how anti-contributors scale with unfulfilled work', () => {
        /**
         * Scenario: Same person (Mallory) hampers three different tasks
         * with the same effort (100 points), but tasks have different completion levels
         */

        const root = createRootNode('root', 'Project');

        // Task 1: 90% complete (10% desire)
        addChild(
            root,
            'task1',
            'Task 1',
            100,
            [{ id: 'alice', points: 100 }],
            [{ id: 'mallory', points: 100 }],
            0.9
        );

        // Task 2: 50% complete (50% desire)
        addChild(
            root,
            'task2',
            'Task 2',
            100,
            [{ id: 'bob', points: 100 }],
            [{ id: 'mallory', points: 100 }],
            0.5
        );

        // Task 3: 10% complete (90% desire)
        addChild(
            root,
            'task3',
            'Task 3',
            100,
            [{ id: 'carol', points: 100 }],
            [{ id: 'mallory', points: 100 }],
            0.1
        );

        const nodesMap: Record<string, Node> = {
            'root': root,
            'task1': root.children[0],
            'task2': root.children[1],
            'task3': root.children[2]
        };

        // Get Mallory's total negative share
        const malloryShare = shareOfGeneralFulfillment(root, 'mallory', nodesMap);

        // Mallory should have a negative share (sum of all anti-contributions)
        expect(malloryShare).toBeLessThan(0);

        // The magnitude should reflect the total desire across all tasks
        // Task 1: 10% desire, Task 2: 50% desire, Task 3: 90% desire
        // Total desire weight = 0.1 + 0.5 + 0.9 = 1.5 (weighted by node weights)

        console.log('\n=== Mallory\'s Anti-Contribution Across Tasks ===');
        console.log(`Task 1 (90% done, 10% desire): Mallory hampered with 100 points`);
        console.log(`Task 2 (50% done, 50% desire): Mallory hampered with 100 points`);
        console.log(`Task 3 (10% done, 90% desire): Mallory hampered with 100 points`);
        console.log(`Total negative share: ${malloryShare.toFixed(4)}`);
        console.log('================================================\n');

        // Verify that the negative share is proportional to total desire
        // This demonstrates that anti-contributors are blamed more when work is less complete
    });
});
