/**
 * Test Fixtures and Data Generators for Allocation Tests
 * 
 * Provides utilities to create realistic test data for allocation.ts testing.
 */

import type {
    Commitment,
    NeedSlot,
    AvailabilitySlot,
    GlobalRecognitionWeights,
    MultiDimensionalDamping
} from '../../schemas.js';
import { seed as itcSeed } from '../../itc.js';

/**
 * Generate a unique ID for testing
 */
export function generateId(prefix: string = 'test'): string {
    return `${prefix}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Create a mock need slot with sensible defaults
 */
export function createMockNeedSlot(overrides: Partial<NeedSlot> = {}): NeedSlot {
    return {
        id: generateId('need'),
        type_id: 'food',
        quantity: 10,
        unit: 'meals',
        time_range: {
            start: Date.now(),
            end: Date.now() + 7 * 24 * 60 * 60 * 1000 // 1 week
        },
        location: {
            type: 'city',
            value: 'Berlin'
        },
        ...overrides
    };
}

/**
 * Create a mock capacity/availability slot with sensible defaults
 */
export function createMockCapacitySlot(overrides: Partial<AvailabilitySlot> = {}): AvailabilitySlot {
    return {
        id: generateId('capacity'),
        type_id: 'food',
        quantity: 100,
        unit: 'meals',
        max_natural_div: 1,
        min_allocation_percentage: 0,
        time_range: {
            start: Date.now(),
            end: Date.now() + 7 * 24 * 60 * 60 * 1000
        },
        location: {
            type: 'city',
            value: 'Berlin'
        },
        ...overrides
    };
}

/**
 * Create a mock commitment with needs and/or capacity
 */
export function createMockCommitment(overrides: Partial<Commitment> = {}): Commitment {
    return {
        pubkey: generateId('pubkey'),
        need_slots: [],
        capacity_slots: [],
        timestamp: Date.now(),
        itcStamp: itcSeed(),
        ...overrides
    };
}

/**
 * Create mock recognition weights
 */
export function createMockRecognition(
    entries: Array<[string, number]> = []
): GlobalRecognitionWeights {
    const recognition: GlobalRecognitionWeights = {};
    for (const [pubkey, weight] of entries) {
        recognition[pubkey] = weight;
    }
    return recognition;
}

/**
 * Create mock damping configuration
 */
export function createMockDamping(overrides: Partial<MultiDimensionalDamping> = {}): MultiDimensionalDamping {
    return {
        global_damping_factor: 1.0,
        damping_factors: {},
        over_allocation_history: {},
        ...overrides
    };
}

// ═══════════════════════════════════════════════════════════════════
// PRESET SCENARIOS
// ═══════════════════════════════════════════════════════════════════

/**
 * Simple 1-to-1 scenario: One provider, one recipient
 */
export function createSimpleScenario() {
    const providerPubkey = 'provider_alice';
    const recipientPubkey = 'recipient_bob';

    const providerCommitment = createMockCommitment({
        pubkey: providerPubkey,
        capacity_slots: [
            createMockCapacitySlot({
                type_id: 'food',
                quantity: 100
            })
        ]
    });

    const recipientCommitment = createMockCommitment({
        pubkey: recipientPubkey,
        need_slots: [
            createMockNeedSlot({
                type_id: 'food',
                quantity: 50
            })
        ]
    });

    const commitments = {
        [providerPubkey]: providerCommitment,
        [recipientPubkey]: recipientCommitment
    };

    const mutualRecognition = {
        [recipientPubkey]: 1.0
    };

    const myRecognition = createMockRecognition([
        [recipientPubkey, 1.0]
    ]);

    return {
        providerPubkey,
        recipientPubkey,
        commitments,
        mutualRecognition,
        myRecognition,
        providerCommitment,
        recipientCommitment
    };
}

/**
 * Multi-recipient scenario: One provider, multiple recipients with varying needs
 */
export function createMultiRecipientScenario() {
    const providerPubkey = 'provider_alice';
    const recipients = [
        { pubkey: 'recipient_bob', need: 30, recognition: 0.5 },
        { pubkey: 'recipient_carol', need: 20, recognition: 0.3 },
        { pubkey: 'recipient_dave', need: 50, recognition: 0.2 }
    ];

    const providerCommitment = createMockCommitment({
        pubkey: providerPubkey,
        capacity_slots: [
            createMockCapacitySlot({
                type_id: 'food',
                quantity: 100
            })
        ]
    });

    const commitments: Record<string, Commitment> = {
        [providerPubkey]: providerCommitment
    };

    const mutualRecognition: Record<string, number> = {};
    const myRecognition: GlobalRecognitionWeights = {};

    for (const recipient of recipients) {
        commitments[recipient.pubkey] = createMockCommitment({
            pubkey: recipient.pubkey,
            need_slots: [
                createMockNeedSlot({
                    type_id: 'food',
                    quantity: recipient.need
                })
            ]
        });
        mutualRecognition[recipient.pubkey] = recipient.recognition;
        myRecognition[recipient.pubkey] = recipient.recognition;
    }

    return {
        providerPubkey,
        recipients,
        commitments,
        mutualRecognition,
        myRecognition,
        providerCommitment
    };
}

/**
 * Two-tier scenario: Mutual and non-mutual recognition
 */
export function createTwoTierScenario() {
    const providerPubkey = 'provider_alice';

    // Tier 1: Mutual recognition
    const mutualRecipients = [
        { pubkey: 'mutual_bob', need: 30, myRec: 0.6, theirRec: 0.5 },
        { pubkey: 'mutual_carol', need: 20, myRec: 0.4, theirRec: 0.3 }
    ];

    // Tier 2: Non-mutual (I recognize them, they don't recognize me)
    const nonMutualRecipients = [
        { pubkey: 'nonmutual_dave', need: 40, myRec: 0.7, theirRec: 0 },
        { pubkey: 'nonmutual_eve', need: 25, myRec: 0.3, theirRec: 0 }
    ];

    const providerCommitment = createMockCommitment({
        pubkey: providerPubkey,
        capacity_slots: [
            createMockCapacitySlot({
                type_id: 'food',
                quantity: 100
            })
        ]
    });

    const commitments: Record<string, Commitment> = {
        [providerPubkey]: providerCommitment
    };

    const mutualRecognition: Record<string, number> = {};
    const myRecognition: GlobalRecognitionWeights = {};

    // Add mutual recipients
    for (const recipient of mutualRecipients) {
        commitments[recipient.pubkey] = createMockCommitment({
            pubkey: recipient.pubkey,
            need_slots: [
                createMockNeedSlot({
                    type_id: 'food',
                    quantity: recipient.need
                })
            ]
        });
        // Mutual recognition = min(myRec, theirRec)
        mutualRecognition[recipient.pubkey] = Math.min(recipient.myRec, recipient.theirRec);
        myRecognition[recipient.pubkey] = recipient.myRec;
    }

    // Add non-mutual recipients
    for (const recipient of nonMutualRecipients) {
        commitments[recipient.pubkey] = createMockCommitment({
            pubkey: recipient.pubkey,
            need_slots: [
                createMockNeedSlot({
                    type_id: 'food',
                    quantity: recipient.need
                })
            ]
        });
        mutualRecognition[recipient.pubkey] = 0; // No mutual recognition
        myRecognition[recipient.pubkey] = recipient.myRec;
    }

    return {
        providerPubkey,
        mutualRecipients,
        nonMutualRecipients,
        commitments,
        mutualRecognition,
        myRecognition,
        providerCommitment
    };
}

/**
 * Divisibility scenario: Indivisible resources (e.g., rooms)
 */
export function createDivisibilityScenario() {
    const providerPubkey = 'provider_alice';
    const recipients = [
        { pubkey: 'recipient_bob', need: 2.7 },
        { pubkey: 'recipient_carol', need: 1.8 },
        { pubkey: 'recipient_dave', need: 1.5 }
    ];

    const providerCommitment = createMockCommitment({
        pubkey: providerPubkey,
        capacity_slots: [
            createMockCapacitySlot({
                type_id: 'housing',
                quantity: 5, // 5 rooms
                unit: 'rooms',
                max_natural_div: 1, // Can't split rooms
                min_allocation_percentage: 0.15 // At least 15% (0.75 rooms → rounds to 1)
            })
        ]
    });

    const commitments: Record<string, Commitment> = {
        [providerPubkey]: providerCommitment
    };

    const mutualRecognition: Record<string, number> = {};
    const myRecognition: GlobalRecognitionWeights = {};

    for (const recipient of recipients) {
        commitments[recipient.pubkey] = createMockCommitment({
            pubkey: recipient.pubkey,
            need_slots: [
                createMockNeedSlot({
                    type_id: 'housing',
                    quantity: recipient.need,
                    unit: 'rooms'
                })
            ]
        });
        mutualRecognition[recipient.pubkey] = 1.0 / recipients.length; // Equal recognition
        myRecognition[recipient.pubkey] = 1.0 / recipients.length;
    }

    return {
        providerPubkey,
        recipients,
        commitments,
        mutualRecognition,
        myRecognition,
        providerCommitment
    };
}

/**
 * Damping scenario: Recipients with oscillation history
 */
export function createDampingScenario() {
    const providerPubkey = 'provider_alice';
    const recipientPubkey = 'recipient_bob';

    const providerCommitment = createMockCommitment({
        pubkey: providerPubkey,
        capacity_slots: [
            createMockCapacitySlot({
                type_id: 'food',
                quantity: 100
            })
        ]
    });

    // Recipient with oscillating over-allocation history
    const recipientCommitment = createMockCommitment({
        pubkey: recipientPubkey,
        need_slots: [
            createMockNeedSlot({
                type_id: 'food',
                quantity: 50
            })
        ],
        multi_dimensional_damping: createMockDamping({
            global_damping_factor: 0.8,
            damping_factors: {
                food: 0.6 // Damped due to oscillation
            },
            over_allocation_history: {
                food: [
                    { type_id: 'food', overAllocation: 5, timestamp: Date.now() - 3000 },
                    { type_id: 'food', overAllocation: 15, timestamp: Date.now() - 2000 },
                    { type_id: 'food', overAllocation: 8, timestamp: Date.now() - 1000 }
                ]
            }
        })
    });

    const commitments = {
        [providerPubkey]: providerCommitment,
        [recipientPubkey]: recipientCommitment
    };

    const mutualRecognition = {
        [recipientPubkey]: 1.0
    };

    const myRecognition = createMockRecognition([
        [recipientPubkey, 1.0]
    ]);

    return {
        providerPubkey,
        recipientPubkey,
        commitments,
        mutualRecognition,
        myRecognition,
        providerCommitment,
        recipientCommitment
    };
}

/**
 * Zero capacity scenario: Provider has no capacity
 */
export function createZeroCapacityScenario() {
    const providerPubkey = 'provider_alice';
    const recipientPubkey = 'recipient_bob';

    const providerCommitment = createMockCommitment({
        pubkey: providerPubkey,
        capacity_slots: [
            createMockCapacitySlot({
                type_id: 'food',
                quantity: 0 // No capacity!
            })
        ]
    });

    const recipientCommitment = createMockCommitment({
        pubkey: recipientPubkey,
        need_slots: [
            createMockNeedSlot({
                type_id: 'food',
                quantity: 50
            })
        ]
    });

    const commitments = {
        [providerPubkey]: providerCommitment,
        [recipientPubkey]: recipientCommitment
    };

    const mutualRecognition = {
        [recipientPubkey]: 1.0
    };

    const myRecognition = createMockRecognition([
        [recipientPubkey, 1.0]
    ]);

    return {
        providerPubkey,
        recipientPubkey,
        commitments,
        mutualRecognition,
        myRecognition,
        providerCommitment,
        recipientCommitment
    };
}

/**
 * Type mismatch scenario: Provider and recipient have different types
 */
export function createTypeMismatchScenario() {
    const providerPubkey = 'provider_alice';
    const recipientPubkey = 'recipient_bob';

    const providerCommitment = createMockCommitment({
        pubkey: providerPubkey,
        capacity_slots: [
            createMockCapacitySlot({
                type_id: 'food',
                quantity: 100
            })
        ]
    });

    const recipientCommitment = createMockCommitment({
        pubkey: recipientPubkey,
        need_slots: [
            createMockNeedSlot({
                type_id: 'housing', // Different type!
                quantity: 2
            })
        ]
    });

    const commitments = {
        [providerPubkey]: providerCommitment,
        [recipientPubkey]: recipientCommitment
    };

    const mutualRecognition = {
        [recipientPubkey]: 1.0
    };

    const myRecognition = createMockRecognition([
        [recipientPubkey, 1.0]
    ]);

    return {
        providerPubkey,
        recipientPubkey,
        commitments,
        mutualRecognition,
        myRecognition,
        providerCommitment,
        recipientCommitment
    };
}
