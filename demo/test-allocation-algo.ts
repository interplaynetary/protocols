import { calculateAllocations } from '../src/tree-v2/allocations/calculation';
import type { EntityState } from '../src/tree-v2/schemas/entity';
import type { CapacitySlot, NeedSlot, TreeStore } from '../src/tree-v2/schemas/tree'; // Adjusted imports based on file structure scan
// Note: imports might need adjustment based on where types are actually exported.
// Based on previous file reads:
// EntityState from schemas/entity
// TreeStore from schemas/tree (likely where Node types are too, or they are in schemas/nodes)

// We need to mock the data structures. 
// Since TSX runs TS files, we can just define minimal matching objects (duck typing) 
// or import the real types if we can resolve paths. 
// Given the environment, I'll use 'any' casting for the mocked parts to avoid deep type instantiation 
// unless necessary for the logic.

const generateId = () => Math.random().toString(36).substr(2, 9);

function createMockEntity(id: string, shareMap: Record<string, number>): any {
    return {
        entity_id: id,
        tree_store: {
            nodes: {}
        },
        share_map: shareMap,
        allocations: []
    };
}

function addCapacity(entity: any, id: string, amount: number, resourceType: string) {
    entity.tree_store.nodes[id] = {
        type: 'CapacitySlot',
        id: id,
        name: 'Cap',
        resource_type: resourceType,
        available_quantity: amount,
        default_child_ids: []
    };
}

function addNeed(entity: any, id: string, amount: number, resourceType: string) {
    entity.tree_store.nodes[id] = {
        type: 'NeedSlot',
        id: id,
        name: 'Need',
        resource_type: resourceType,
        declared_quantity: amount,
        default_child_ids: []
    };
}

console.log("=== TEST SUITE: Allocation Algorithm ===");

// TEST 1: Unconstrained / Balanced
// Provider has 100.
// R1 needs 100, Mutual Affinity High
// R2 needs 100, Mutual Affinity High
// Should be roughly 50/50
console.log("\n--- Test 1: Balanced Competition (Unconstrained by Need) ---");
{
    const provider = createMockEntity('P1', { 'R1': 0.5, 'R2': 0.5 });
    addCapacity(provider, 'c1', 100, 'energy');

    const r1 = createMockEntity('R1', { 'P1': 0.8 }); // Like P1 a lot
    addNeed(r1, 'n1', 200, 'energy'); // Wants more than avail

    const r2 = createMockEntity('R2', { 'P1': 0.8 }); // Like P1 a lot
    addNeed(r2, 'n2', 200, 'energy'); // Wants more than avail

    const records = calculateAllocations(provider, [r1, r2], 'c1');
    console.log("R1 offered:", records.find(r => r.recipient_id === 'R1')?.offered_quantity.toFixed(2));
    console.log("R2 offered:", records.find(r => r.recipient_id === 'R2')?.offered_quantity.toFixed(2));

    // Expect ~50 each
}

// TEST 2: Constrained (Water Filling)
// Provider has 100.
// R1 needs 10 (Small need), High Affinity
// R2 needs 200 (Big need), High Affinity
// R1 should get 10 capping, R2 should get 90
console.log("\n--- Test 2: Water Filling (One Recipient Capped) ---");
{
    const provider = createMockEntity('P1', { 'R1': 0.5, 'R2': 0.5 });
    addCapacity(provider, 'c1', 100, 'energy');

    const r1 = createMockEntity('R1', { 'P1': 0.8 });
    addNeed(r1, 'n1', 10, 'energy'); // Only needs 10

    const r2 = createMockEntity('R2', { 'P1': 0.8 });
    addNeed(r2, 'n2', 200, 'energy');

    const records = calculateAllocations(provider, [r1, r2], 'c1');
    console.log("R1 (Need 10) offered:", records.find(r => r.recipient_id === 'R1')?.offered_quantity.toFixed(2));
    console.log("R2 (Need 200) offered:", records.find(r => r.recipient_id === 'R2')?.offered_quantity.toFixed(2));

    // Expect R1=10, R2=90
}

// TEST 3: One-Sided Preference Failure
// Provider likes R1, but R1 hates Provider (0 share)
// Should result in 0 allocation
console.log("\n--- Test 3: One-Sided Preference Failure ---");
{
    const provider = createMockEntity('P1', { 'R1': 0.9, 'R2': 0.1 }); // Loves R1
    addCapacity(provider, 'c1', 100, 'energy');

    const r1 = createMockEntity('R1', { 'P1': 0 }); // Dislikes / Doesn't know P1
    addNeed(r1, 'n1', 100, 'energy');

    const r2 = createMockEntity('R2', { 'P1': 0.5 }); // Likes P1
    addNeed(r2, 'n2', 100, 'energy');

    const records = calculateAllocations(provider, [r1, r2], 'c1');
    console.log("R1 (Hates P1) offered:", records.find(r => r.recipient_id === 'R1')?.offered_quantity || 0);
    console.log("R2 (Likes P1) offered:", records.find(r => r.recipient_id === 'R2')?.offered_quantity || 0);

    // Expect R1=0, R2=100 (gets it all)
}

// TEST 4: Asymmetric Preferences
// P1 likes R1 (0.8) and R2 (0.2)
// R1 likes P1 (0.2) and R2 likes P1 (0.8)
// Joint weights: 
// R1: sqrt(0.8 * 0.2) = sqrt(0.16) = 0.4
// R2: sqrt(0.2 * 0.8) = sqrt(0.16) = 0.4
// Should be EQUAL despite asymmetry!
console.log("\n--- Test 4: Asymmetric Equalizer ---");
{
    const provider = createMockEntity('P1', { 'R1': 0.8, 'R2': 0.2 });
    addCapacity(provider, 'c1', 100, 'energy');

    const r1 = createMockEntity('R1', { 'P1': 0.2 });
    addNeed(r1, 'n1', 100, 'energy');

    const r2 = createMockEntity('R2', { 'P1': 0.8 });
    addNeed(r2, 'n2', 100, 'energy');

    const records = calculateAllocations(provider, [r1, r2], 'c1');
    console.log("R1 (P_ij=0.8, R_ji=0.2) offered:", records.find(r => r.recipient_id === 'R1')?.offered_quantity.toFixed(2));
    console.log("R2 (P_ij=0.2, R_ji=0.8) offered:", records.find(r => r.recipient_id === 'R2')?.offered_quantity.toFixed(2));

    // Expect 50 / 50
}
