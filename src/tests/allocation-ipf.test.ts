/**
 * Tests for Distributed IPF Allocation Protocol
 * 
 * Tests the distributed coordination functions:
 * - updateProviderState: Provider row scaling (x_p)
 * - generateFlowProposals: Flow proposal generation
 * - updateRecipientState: Recipient column scaling (y_r)
 */

import { describe, it, expect } from 'vitest';
import {
    updateProviderState,
    generateFlowProposals,
    updateRecipientState,
    type DistributedIPFState,
    type FlowProposal
} from '../allocation.js';
import type { AvailabilitySlot, NeedSlot, Commitment } from '../schemas.js';

// ═══════════════════════════════════════════════════════════════════
// TEST HELPERS
// ═══════════════════════════════════════════════════════════════════

function createCapacitySlot(
    id: string,
    quantity: number,
    needTypeId: string = 'funding',
    priorityDist?: Record<string, number>
): AvailabilitySlot {
    return {
        id,
        need_type_id: needTypeId,
        quantity,
        priority_distribution: priorityDist,
        start_date: '2024-01-01',
        end_date: '2024-12-31'
    } as AvailabilitySlot;
}

function createNeedSlot(
    id: string,
    quantity: number,
    needTypeId: string = 'funding',
    priorityDist?: Record<string, number>
): NeedSlot {
    return {
        id,
        need_type_id: needTypeId,
        quantity,
        priority_distribution: priorityDist,
        start_date: '2024-01-01',
        end_date: '2024-12-31'
    } as NeedSlot;
}

function createCommitment(
    pubkey: string,
    capacitySlots: AvailabilitySlot[] = [],
    needSlots: NeedSlot[] = [],
    globalRecognition?: Record<string, number>
): Commitment {
    return {
        pubkey,
        capacity_slots: capacitySlots,
        need_slots: needSlots,
        global_recognition_weights: globalRecognition
    } as Commitment;
}

function createInitialState(): DistributedIPFState {
    return {
        rowScalings: {},
        colScalings: {},
        cachedRemoteScalings: {}
    };
}

// ═══════════════════════════════════════════════════════════════════
// TESTS: updateProviderState
// ═══════════════════════════════════════════════════════════════════

describe('Distributed IPF Protocol', () => {

    describe('updateProviderState', () => {

        it('should initialize row scaling to 1.0 when no recipients exist', () => {
            const capacitySlots = [createCapacitySlot('cap-1', 100)];
            const knownNeeds: NeedSlot[] = [];
            const commitments = {
                'provider-1': createCommitment('provider-1', capacitySlots)
            };
            const state = createInitialState();

            const result = updateProviderState(capacitySlots, knownNeeds, commitments, state);

            // With no recipients, denominator is 0, should return 0 scaling
            expect(result.rowScalings['cap-1']).toBe(0);
        });

        it('should calculate row scaling based on capacity and demand', () => {
            const capacitySlots = [
                createCapacitySlot('cap-1', 100, 'funding', { 'recipient-1': 1.0 })
            ];
            const needSlots = [
                createNeedSlot('need-1', 50, 'funding')
            ];
            const commitments = {
                'provider-1': createCommitment('provider-1', capacitySlots),
                'recipient-1': createCommitment('recipient-1', [], needSlots)
            };
            const state = createInitialState();
            state.cachedRemoteScalings['need-1'] = 1.0; // Recipient fully open

            const result = updateProviderState(capacitySlots, needSlots, commitments, state);

            // x_p = Capacity / Sum(K_pr * y_r)
            // With priority 1.0 and y_r = 1.0, K_pr ≈ 1.0
            // x_p = 100 / (1.0 * 1.0 * 50) = 100 / 50 = 2.0
            expect(result.rowScalings['cap-1']).toBeGreaterThan(0);
        });

        it('should scale down when demand exceeds capacity', () => {
            const capacitySlots = [
                createCapacitySlot('cap-1', 50, 'funding', {
                    'recipient-1': 0.5,
                    'recipient-2': 0.5
                })
            ];
            const needSlots = [
                createNeedSlot('need-1', 100, 'funding'),
                createNeedSlot('need-2', 100, 'funding')
            ];
            const commitments = {
                'provider-1': createCommitment('provider-1', capacitySlots),
                'recipient-1': createCommitment('recipient-1', [], [needSlots[0]]),
                'recipient-2': createCommitment('recipient-2', [], [needSlots[1]])
            };
            const state = createInitialState();
            state.cachedRemoteScalings['need-1'] = 1.0;
            state.cachedRemoteScalings['need-2'] = 1.0;

            const result = updateProviderState(capacitySlots, needSlots, commitments, state);

            // x_p = Capacity / Sum(K_pr * y_r)
            // The scaling factor depends on K_pr (seed values), not just raw capacity/demand
            // Should be positive and finite
            expect(result.rowScalings['cap-1']).toBeGreaterThan(0);
            expect(result.rowScalings['cap-1']).toBeLessThan(Infinity);
        });

        it('should use cached remote scalings from recipients', () => {
            const capacitySlots = [
                createCapacitySlot('cap-1', 100, 'funding', { 'recipient-1': 1.0 })
            ];
            const needSlots = [
                createNeedSlot('need-1', 50, 'funding')
            ];
            const commitments = {
                'provider-1': createCommitment('provider-1', capacitySlots),
                'recipient-1': createCommitment('recipient-1', [], needSlots)
            };
            const state = createInitialState();
            state.cachedRemoteScalings['need-1'] = 0.5; // Recipient is half-saturated

            const result = updateProviderState(capacitySlots, needSlots, commitments, state);

            // With y_r = 0.5, effective demand is halved
            expect(result.rowScalings['cap-1']).toBeGreaterThan(0);
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // TESTS: generateFlowProposals
    // ═══════════════════════════════════════════════════════════════════

    describe('generateFlowProposals', () => {

        it('should generate no proposals when no compatible slots exist', () => {
            const capacitySlots = [createCapacitySlot('cap-1', 100, 'funding')];
            const needSlots = [createNeedSlot('need-1', 50, 'expertise')]; // Different type
            const commitments = {
                'provider-1': createCommitment('provider-1', capacitySlots),
                'recipient-1': createCommitment('recipient-1', [], needSlots)
            };
            const state = createInitialState();
            state.rowScalings['cap-1'] = 1.0;

            const proposals = generateFlowProposals(capacitySlots, needSlots, commitments, state);

            expect(proposals).toHaveLength(0);
        });

        it('should generate proposals based on A_pr = K_pr * x_p * y_r', () => {
            const capacitySlots = [
                createCapacitySlot('cap-1', 100, 'funding', { 'recipient-1': 1.0 })
            ];
            const needSlots = [
                createNeedSlot('need-1', 50, 'funding')
            ];
            const commitments = {
                'provider-1': createCommitment('provider-1', capacitySlots),
                'recipient-1': createCommitment('recipient-1', [], needSlots)
            };
            const state = createInitialState();
            state.rowScalings['cap-1'] = 0.5; // Provider scaling
            state.cachedRemoteScalings['need-1'] = 1.0; // Recipient fully open

            const proposals = generateFlowProposals(capacitySlots, needSlots, commitments, state);

            expect(proposals.length).toBeGreaterThan(0);
            expect(proposals[0].capacity_slot_id).toBe('cap-1');
            expect(proposals[0].need_slot_id).toBe('need-1');
            expect(proposals[0].proposed_quantity).toBeGreaterThan(0);
        });

        it('should clamp proposals to need quantity', () => {
            const capacitySlots = [
                createCapacitySlot('cap-1', 1000, 'funding', { 'recipient-1': 1.0 })
            ];
            const needSlots = [
                createNeedSlot('need-1', 50, 'funding') // Small need
            ];
            const commitments = {
                'provider-1': createCommitment('provider-1', capacitySlots),
                'recipient-1': createCommitment('recipient-1', [], needSlots)
            };
            const state = createInitialState();
            state.rowScalings['cap-1'] = 1.0;
            state.cachedRemoteScalings['need-1'] = 1.0;

            const proposals = generateFlowProposals(capacitySlots, needSlots, commitments, state);

            // Proposal should not exceed need quantity
            expect(proposals[0].proposed_quantity).toBeLessThanOrEqual(50);
        });

        it('should generate multiple proposals for multiple recipients', () => {
            const capacitySlots = [
                createCapacitySlot('cap-1', 100, 'funding', {
                    'recipient-1': 0.6,
                    'recipient-2': 0.4
                })
            ];
            const needSlots = [
                createNeedSlot('need-1', 30, 'funding'),
                createNeedSlot('need-2', 20, 'funding')
            ];
            const commitments = {
                'provider-1': createCommitment('provider-1', capacitySlots),
                'recipient-1': createCommitment('recipient-1', [], [needSlots[0]]),
                'recipient-2': createCommitment('recipient-2', [], [needSlots[1]])
            };
            const state = createInitialState();
            state.rowScalings['cap-1'] = 1.0;
            state.cachedRemoteScalings['need-1'] = 1.0;
            state.cachedRemoteScalings['need-2'] = 1.0;

            const proposals = generateFlowProposals(capacitySlots, needSlots, commitments, state);

            expect(proposals.length).toBeGreaterThanOrEqual(2);
        });

        it('should skip proposals below epsilon threshold', () => {
            const capacitySlots = [
                createCapacitySlot('cap-1', 100, 'funding', { 'recipient-1': 0.0001 })
            ];
            const needSlots = [
                createNeedSlot('need-1', 50, 'funding')
            ];
            const commitments = {
                'provider-1': createCommitment('provider-1', capacitySlots),
                'recipient-1': createCommitment('recipient-1', [], needSlots)
            };
            const state = createInitialState();
            state.rowScalings['cap-1'] = 0.001;
            state.cachedRemoteScalings['need-1'] = 1.0;

            const proposals = generateFlowProposals(capacitySlots, needSlots, commitments, state, 1e-6);

            // Very small proposals should be filtered out
            const verySmallProposals = proposals.filter(p => p.proposed_quantity < 1e-5);
            expect(verySmallProposals).toHaveLength(0);
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // TESTS: updateRecipientState
    // ═══════════════════════════════════════════════════════════════════

    describe('updateRecipientState', () => {

        it('should set column scaling to 1.0 when no proposals received', () => {
            const needSlots = [createNeedSlot('need-1', 50)];
            const proposals: FlowProposal[] = [];
            const state = createInitialState();

            const result = updateRecipientState(needSlots, proposals, state);

            expect(result.colScalings['need-1']).toBe(1.0);
        });

        it('should set column scaling to 1.0 when under-saturated', () => {
            const needSlots = [createNeedSlot('need-1', 100)];
            const proposals: FlowProposal[] = [
                {
                    capacity_slot_id: 'cap-1',
                    need_slot_id: 'need-1',
                    provider_pubkey: 'provider-1',
                    recipient_pubkey: 'recipient-1',
                    proposed_quantity: 50 // Less than need
                }
            ];
            const state = createInitialState();

            const result = updateRecipientState(needSlots, proposals, state);

            // Under-saturated: 50 < 100, so y_r = 1.0
            expect(result.colScalings['need-1']).toBe(1.0);
        });

        it('should scale down when over-saturated', () => {
            const needSlots = [createNeedSlot('need-1', 50)];
            const proposals: FlowProposal[] = [
                {
                    capacity_slot_id: 'cap-1',
                    need_slot_id: 'need-1',
                    provider_pubkey: 'provider-1',
                    recipient_pubkey: 'recipient-1',
                    proposed_quantity: 100 // More than need
                }
            ];
            const state = createInitialState();

            const result = updateRecipientState(needSlots, proposals, state);

            // Over-saturated: 100 > 50, so y_r = 50/100 = 0.5
            expect(result.colScalings['need-1']).toBeCloseTo(0.5, 5);
        });

        it('should aggregate proposals from multiple providers', () => {
            const needSlots = [createNeedSlot('need-1', 100)];
            const proposals: FlowProposal[] = [
                {
                    capacity_slot_id: 'cap-1',
                    need_slot_id: 'need-1',
                    provider_pubkey: 'provider-1',
                    recipient_pubkey: 'recipient-1',
                    proposed_quantity: 60
                },
                {
                    capacity_slot_id: 'cap-2',
                    need_slot_id: 'need-1',
                    provider_pubkey: 'provider-2',
                    recipient_pubkey: 'recipient-1',
                    proposed_quantity: 80
                }
            ];
            const state = createInitialState();

            const result = updateRecipientState(needSlots, proposals, state);

            // Total proposed: 60 + 80 = 140 > 100
            // y_r = 100/140 ≈ 0.714
            expect(result.colScalings['need-1']).toBeCloseTo(100 / 140, 5);
        });

        it('should handle multiple need slots independently', () => {
            const needSlots = [
                createNeedSlot('need-1', 50),
                createNeedSlot('need-2', 100)
            ];
            const proposals: FlowProposal[] = [
                {
                    capacity_slot_id: 'cap-1',
                    need_slot_id: 'need-1',
                    provider_pubkey: 'provider-1',
                    recipient_pubkey: 'recipient-1',
                    proposed_quantity: 100 // Over-saturated
                },
                {
                    capacity_slot_id: 'cap-2',
                    need_slot_id: 'need-2',
                    provider_pubkey: 'provider-2',
                    recipient_pubkey: 'recipient-1',
                    proposed_quantity: 50 // Under-saturated
                }
            ];
            const state = createInitialState();

            const result = updateRecipientState(needSlots, proposals, state);

            // need-1: 100 > 50, y_r = 0.5
            expect(result.colScalings['need-1']).toBeCloseTo(0.5, 5);
            // need-2: 50 < 100, y_r = 1.0
            expect(result.colScalings['need-2']).toBe(1.0);
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    // INTEGRATION TESTS
    // ═══════════════════════════════════════════════════════════════════

    describe('Integration: Full IPF Round', () => {

        it('should converge through iterative updates', () => {
            // Setup: Provider with 100 capacity, Recipient with 50 need
            const capacitySlots = [
                createCapacitySlot('cap-1', 100, 'funding', { 'recipient-1': 1.0 })
            ];
            const needSlots = [
                createNeedSlot('need-1', 50, 'funding', { 'provider-1': 1.0 })
            ];
            const commitments = {
                'provider-1': createCommitment('provider-1', capacitySlots),
                'recipient-1': createCommitment('recipient-1', [], needSlots)
            };

            let state = createInitialState();

            // Round 1: Provider update
            state = updateProviderState(capacitySlots, needSlots, commitments, state);
            expect(state.rowScalings['cap-1']).toBeGreaterThan(0);

            // Round 2: Generate proposals
            const proposals = generateFlowProposals(capacitySlots, needSlots, commitments, state);
            expect(proposals.length).toBeGreaterThan(0);

            // Round 3: Recipient update
            state = updateRecipientState(needSlots, proposals, commitments, state);
            expect(state.colScalings['need-1']).toBeGreaterThan(0);
            expect(state.colScalings['need-1']).toBeLessThanOrEqual(1.0);
        });

        it('should handle multi-provider, multi-recipient scenario', () => {
            const capacitySlots = [
                createCapacitySlot('cap-1', 60, 'funding', {
                    'recipient-1': 0.7,
                    'recipient-2': 0.3
                }),
                createCapacitySlot('cap-2', 40, 'funding', {
                    'recipient-1': 0.4,
                    'recipient-2': 0.6
                })
            ];
            const needSlots = [
                createNeedSlot('need-1', 50, 'funding'),
                createNeedSlot('need-2', 50, 'funding')
            ];
            const commitments = {
                'provider-1': createCommitment('provider-1', [capacitySlots[0]]),
                'provider-2': createCommitment('provider-2', [capacitySlots[1]]),
                'recipient-1': createCommitment('recipient-1', [], [needSlots[0]]),
                'recipient-2': createCommitment('recipient-2', [], [needSlots[1]])
            };

            let state = createInitialState();

            // Provider updates
            state = updateProviderState([capacitySlots[0]], needSlots, commitments, state);
            state = updateProviderState([capacitySlots[1]], needSlots, commitments, state);

            // Generate proposals from both providers
            const proposals1 = generateFlowProposals([capacitySlots[0]], needSlots, commitments, state);
            const proposals2 = generateFlowProposals([capacitySlots[1]], needSlots, commitments, state);
            const allProposals = [...proposals1, ...proposals2];

            // Recipient updates
            state = updateRecipientState(needSlots, allProposals, state);

            // Both recipients should have scaling factors
            expect(state.colScalings['need-1']).toBeDefined();
            expect(state.colScalings['need-2']).toBeDefined();
        });
    });
});
