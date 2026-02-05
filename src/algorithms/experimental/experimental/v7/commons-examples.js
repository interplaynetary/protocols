/**
 * Commons Distribution Examples
 *
 * Demonstrates the flexible allocation/distribution capabilities
 * integrated from v6 into the commons.ts paradigm.
 */
import { EntityInstance } from './commons.js';
import { randomUUID } from 'crypto';
// ============================================================================
// Example 1: Basic Proportional Distribution
// ============================================================================
function example1_basicProportional() {
    console.log('\n=== Example 1: Basic Proportional Distribution ===\n');
    // Create a provider with capacity
    const kitchen = EntityInstance.create({ id: randomUUID() });
    const capacitySlotId = randomUUID();
    kitchen.addSlot({
        id: capacitySlotId,
        name: 'Meals',
        quantity: 100, // Can provide 100 meals
        unit: 'meals/week',
        resource_type: 'food',
    });
    // Create recipients with needs
    const alice = EntityInstance.create({ id: randomUUID() });
    alice.addSlot({
        name: 'Meals',
        quantity: -20, // Needs 20 meals
        resource_type: 'food',
    });
    const bob = EntityInstance.create({ id: randomUUID() });
    bob.addSlot({
        name: 'Meals',
        quantity: -30, // Needs 30 meals
        resource_type: 'food',
    });
    // Add as members
    kitchen.addMember(alice.id);
    kitchen.addMember(bob.id);
    // Distribute proportionally (default: by need magnitude)
    const allocations = kitchen.distributeSlot(capacitySlotId);
    console.log('Allocations:');
    for (const [recipientId, quantity] of allocations) {
        const recipient = EntityInstance.get(recipientId);
        console.log(`  ${recipientId === alice.id ? 'Alice' : 'Bob'}: ${quantity} meals`);
    }
    // Expected: Alice gets 40 meals (20/50 * 100), Bob gets 60 meals (30/50 * 100)
}
// ============================================================================
// Example 2: Attribute-Based Filtering (Location)
// ============================================================================
function example2_locationFiltering() {
    console.log('\n=== Example 2: Location-Based Filtering ===\n');
    // Create housing provider
    const landlord = EntityInstance.create({ id: randomUUID() });
    const housingSlotId = randomUUID();
    landlord.addSlot({
        id: housingSlotId,
        name: 'Housing',
        quantity: 10, // 10 rooms available
        unit: 'rooms',
        resource_type: 'shelter',
    });
    // Create people in different locations
    const alice = EntityInstance.create({ id: randomUUID() });
    alice.addSlot({ name: 'location', quantity: 1, metadata: { value: 'San Francisco' } });
    alice.addSlot({ name: 'Housing', quantity: -1, resource_type: 'shelter' });
    const bob = EntityInstance.create({ id: randomUUID() });
    bob.addSlot({ name: 'location', quantity: 1, metadata: { value: 'Oakland' } });
    bob.addSlot({ name: 'Housing', quantity: -1, resource_type: 'shelter' });
    const carol = EntityInstance.create({ id: randomUUID() });
    carol.addSlot({ name: 'location', quantity: 1, metadata: { value: 'New York' } });
    carol.addSlot({ name: 'Housing', quantity: -1, resource_type: 'shelter' });
    landlord.addMember(alice.id);
    landlord.addMember(bob.id);
    landlord.addMember(carol.id);
    // Distribute only to Bay Area residents
    const allocations = landlord.distributeSlot(housingSlotId, {
        method: 'proportional',
        filter: {
            entityPredicate: (member) => {
                const locationSlots = member.getSlotsByName('location');
                const location = locationSlots[0]?.metadata?.value;
                return location === 'San Francisco' || location === 'Oakland';
            },
        },
    });
    console.log('Allocations (Bay Area only):');
    for (const [recipientId, quantity] of allocations) {
        const recipient = EntityInstance.get(recipientId);
        const location = recipient?.getSlotsByName('location')[0]?.metadata?.value;
        console.log(`  ${location}: ${quantity} rooms`);
    }
    // Expected: Alice and Bob each get 5 rooms, Carol gets 0 (filtered out)
}
// ============================================================================
// Example 3: Satisfaction-Weighted Distribution (v6 Style)
// ============================================================================
function example3_satisfactionWeighted() {
    console.log('\n=== Example 3: Satisfaction-Weighted Distribution ===\n');
    // Create tutor with capacity
    const tutor = EntityInstance.create({ id: randomUUID() });
    const tutoringSlotId = randomUUID();
    tutor.addSlot({
        id: tutoringSlotId,
        name: 'Tutoring',
        quantity: 20, // 20 hours/week
        unit: 'hours/week',
        resource_type: 'education',
    });
    // Create students with recognition and reputation
    const alice = EntityInstance.create({ id: randomUUID() });
    alice.addSlot({ name: 'recognition', quantity: 0.6 }); // Tutor recognizes Alice at 0.6
    alice.addSlot({ name: 'reputation', quantity: 1.2 }); // Alice has good reputation (1.2)
    alice.addSlot({ name: 'Tutoring', quantity: -10, resource_type: 'education' });
    const bob = EntityInstance.create({ id: randomUUID() });
    bob.addSlot({ name: 'recognition', quantity: 0.4 }); // Tutor recognizes Bob at 0.4
    bob.addSlot({ name: 'reputation', quantity: 0.8 }); // Bob has lower reputation (0.8)
    bob.addSlot({ name: 'Tutoring', quantity: -10, resource_type: 'education' });
    tutor.addMember(alice.id);
    tutor.addMember(bob.id);
    // Distribute using satisfaction weighting (recognition × reputation)
    const allocations = tutor.distributeSatisfactionWeighted(tutoringSlotId);
    console.log('Allocations (satisfaction-weighted):');
    for (const [recipientId, quantity] of allocations) {
        const recipient = EntityInstance.get(recipientId);
        const recognition = recipient?.getSlotsByName('recognition')[0]?.quantity || 0;
        const reputation = recipient?.getSlotsByName('reputation')[0]?.quantity || 1.0;
        const effectivePoints = recognition * reputation;
        console.log(`  ${recipientId === alice.id ? 'Alice' : 'Bob'}: ${quantity.toFixed(2)} hours ` +
            `(recognition: ${recognition}, reputation: ${reputation}, effective: ${effectivePoints.toFixed(2)})`);
    }
    // Expected: Alice gets more (0.6 * 1.2 = 0.72), Bob gets less (0.4 * 0.8 = 0.32)
}
// ============================================================================
// Example 4: Multi-Tier Allocation
// ============================================================================
function example4_multiTier() {
    console.log('\n=== Example 4: Multi-Tier Allocation ===\n');
    // Create provider
    const provider = EntityInstance.create({ id: randomUUID() });
    const capacitySlotId = randomUUID();
    provider.addSlot({
        id: capacitySlotId,
        name: 'Resources',
        quantity: 100,
        unit: 'units',
    });
    // Create recipients with different recognition levels
    const alice = EntityInstance.create({ id: randomUUID() });
    alice.addSlot({ name: 'mutual_recognition', quantity: 0.6 });
    alice.addSlot({ name: 'recognition', quantity: 0.6 });
    alice.addSlot({ name: 'Resources', quantity: -50 });
    const bob = EntityInstance.create({ id: randomUUID() });
    bob.addSlot({ name: 'mutual_recognition', quantity: 0.4 });
    bob.addSlot({ name: 'recognition', quantity: 0.4 });
    bob.addSlot({ name: 'Resources', quantity: -50 });
    const carol = EntityInstance.create({ id: randomUUID() });
    carol.addSlot({ name: 'mutual_recognition', quantity: 0 }); // No mutual recognition
    carol.addSlot({ name: 'recognition', quantity: 0.3 }); // But provider recognizes her
    carol.addSlot({ name: 'Resources', quantity: -50 });
    provider.addMember(alice.id);
    provider.addMember(bob.id);
    provider.addMember(carol.id);
    // Two-tier allocation: mutual recognition first, then unilateral
    const results = provider.distributeMultiTier(capacitySlotId, [
        {
            priority: 0,
            label: 'mutual-recognition',
            weightingFunction: (member, slot) => {
                const mr = member.getSlotsByName('mutual_recognition')[0]?.quantity || 0;
                return mr > 0 ? mr : 0; // Only if mutual recognition exists
            },
        },
        {
            priority: 1,
            label: 'unilateral-recognition',
            weightingFunction: (member, slot) => {
                const mr = member.getSlotsByName('mutual_recognition')[0]?.quantity || 0;
                const rec = member.getSlotsByName('recognition')[0]?.quantity || 0;
                return mr === 0 && rec > 0 ? rec : 0; // Only if no mutual but has recognition
            },
        },
    ]);
    console.log('Multi-tier allocations:');
    for (const [recipientId, result] of results) {
        const recipient = EntityInstance.get(recipientId);
        const name = recipientId === alice.id ? 'Alice' : recipientId === bob.id ? 'Bob' : 'Carol';
        console.log(`  ${name}: ${result.total.toFixed(2)} total`);
        for (const [tier, amount] of result.byTier) {
            const label = tier === 0 ? 'mutual' : 'unilateral';
            console.log(`    Tier ${tier} (${label}): ${amount.toFixed(2)}`);
        }
    }
    // Expected: Alice and Bob get from tier 0 (mutual), Carol gets from tier 1 (unilateral)
}
// ============================================================================
// Example 5: Oscillation Dampening
// ============================================================================
function example5_oscillationDampening() {
    console.log('\n=== Example 5: Oscillation Dampening ===\n');
    const entity = EntityInstance.create({ id: randomUUID() });
    const slotId = randomUUID();
    entity.addSlot({
        id: slotId,
        name: 'Capacity',
        quantity: 100,
    });
    // Simulate oscillating updates
    const updates = [100, 120, 90, 130, 80, 140]; // Oscillating pattern
    console.log('Updating slot with oscillating values:');
    for (const newValue of updates) {
        entity.updateSlotWithDampening(slotId, newValue);
        const slot = entity.getSlot(slotId);
        const dampingFactor = entity.getDampeningFactor(slotId);
        const isOsc = entity.isOscillating(slotId);
        console.log(`  Update to ${newValue} → actual: ${slot?.quantity.toFixed(2)}, ` +
            `damping: ${dampingFactor}, oscillating: ${isOsc}`);
    }
}
// ============================================================================
// Example 6: Allocation Records (Information Preservation)
// ============================================================================
function example6_allocationRecords() {
    console.log('\n=== Example 6: Allocation Records ===\n');
    const provider = EntityInstance.create({ id: randomUUID() });
    const capacitySlotId = randomUUID();
    provider.addSlot({
        id: capacitySlotId,
        name: 'Resources',
        quantity: 100,
    });
    const alice = EntityInstance.create({ id: randomUUID() });
    alice.addSlot({ name: 'Resources', quantity: -40 });
    const bob = EntityInstance.create({ id: randomUUID() });
    bob.addSlot({ name: 'Resources', quantity: -60 });
    provider.addMember(alice.id);
    provider.addMember(bob.id);
    // Distribute and record
    const record = provider.distributeAndRecord(capacitySlotId, {
        method: 'proportional',
    });
    console.log('Allocation Record:');
    console.log(`  ID: ${record.id}`);
    console.log(`  Timestamp: ${new Date(record.timestamp).toISOString()}`);
    console.log(`  Provider: ${record.providerId}`);
    console.log(`  Method: ${record.distributionMethod}`);
    console.log('  Allocations:');
    for (const [recipientId, quantity] of Object.entries(record.allocations)) {
        const name = recipientId === alice.id ? 'Alice' : 'Bob';
        console.log(`    ${name}: ${quantity}`);
    }
    // Query history
    const history = provider.getAllocationHistory();
    console.log(`\nTotal allocation records: ${history.length}`);
}
// ============================================================================
// Run All Examples
// ============================================================================
export function runAllExamples() {
    example1_basicProportional();
    example2_locationFiltering();
    example3_satisfactionWeighted();
    example4_multiTier();
    example5_oscillationDampening();
    example6_allocationRecords();
}
// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllExamples();
}
//# sourceMappingURL=commons-examples.js.map