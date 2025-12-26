import { z } from 'zod';
/*
Commons Framework - Unified Slot Model

Entities have slots with signed quantities:
- Positive quantity = capacity (what they can provide)
- Negative quantity = need (what they require)

This eliminates the artificial capacity/need distinction while maintaining
the same semantic meaning through the sign of the quantity.

Example:
  slot: { name: 'Programming', quantity: +20 }  // Can provide 20 hours
  slot: { name: 'Housing', quantity: -1 }       // Needs 1 room
*/
// ============================================================================
// Base Schemas
// ============================================================================
export const IdSchema = z.string().uuid().describe('UUID identifier');
export const TypeSchema = IdSchema.describe('Type identifier (UUID)');
// ============================================================================
// Unified Slot Schema
// ============================================================================
/**
 * Slot - Unified resource representation
 *
 * Quantity sign indicates direction:
 * - Positive (+): Capacity - what this entity can provide
 * - Negative (-): Need - what this entity requires
 * - Zero (0): Neutral - tracking only
 *
 * Examples:
 * - { name: 'Programming', quantity: +20, unit: 'hours/week' } // Can provide
 * - { name: 'Housing', quantity: -1, unit: 'room' }            // Needs
 * - { name: 'Oxygen', quantity: +100, unit: 'kg/day' }         // Produces
 * - { name: 'Water', quantity: -50, unit: 'liters/day' }       // Consumes
 */
export const SlotSchema = z.object({
    id: IdSchema,
    name: z.string().min(1),
    quantity: z.number().describe('Signed: + = capacity, - = need'),
    // Type/category of resource
    resource_type: z.string().optional(),
    // Metadata
    unit: z.string().optional().describe('e.g., hours, kg, units'),
    description: z.string().optional(),
    emoji: z.string().optional(),
    // Allocation constraints
    min_allocation: z.number().nonnegative().optional().describe('Minimum allocation/fulfillment size'),
    max_divisions: z.number().int().positive().optional().describe('Max times this can be split'),
    priority: z.number().optional().describe('Relative priority (for needs)'),
    // Allocation/distribution methods
    allocationMethod: z.custom((val) => typeof val === 'function', { message: 'Must be a function' }).optional(),
    distributionMethod: z.custom((val) => typeof val === 'function', { message: 'Must be a function' }).optional(),
    // Additional metadata
    metadata: z.record(z.string(), z.any()).optional(),
});
// ============================================================================
// Distribution Configuration
// ============================================================================
/**
 * Attribute constraint for filtering entities during distribution
 */
export const AttributeConstraintSchema = z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    values: z.array(z.any()).optional(),
    predicate: z.custom((val) => typeof val === 'function', { message: 'Must be a function' }).optional(),
});
/**
 * Distribution filter configuration
 *
 * Enables filtering entities by:
 * - Attribute values (e.g., location, skill level)
 * - Slot constraints (e.g., time availability)
 * - Custom predicates
 */
export const DistributionFilterSchema = z.object({
    // Filter by attribute-value constraints
    attributes: z.record(z.string(), AttributeConstraintSchema).optional(),
    // Filter by slot properties
    slotConstraints: z.custom((val) => typeof val === 'function', { message: 'Must be a function' }).optional(),
    // Custom entity predicate
    entityPredicate: z.custom((val) => typeof val === 'function', { message: 'Must be a function' }).optional(),
});
/**
 * Distribution configuration for a slot
 *
 * Defines HOW to distribute capacity/need across entities
 */
export const DistributionConfigSchema = z.object({
    method: z.enum(['proportional', 'satisfaction-weighted', 'equal', 'custom']).default('proportional'),
    filter: DistributionFilterSchema.optional(),
    weightingFunction: z.custom((val) => typeof val === 'function', { message: 'Must be a function' }).optional(),
    tier: z.number().int().nonnegative().optional(),
});
/**
 * Tier configuration for multi-tier allocation
 */
export const TierConfigSchema = z.object({
    priority: z.number().int().nonnegative(),
    filter: DistributionFilterSchema.optional(),
    weightingFunction: z.custom((val) => typeof val === 'function', { message: 'Must be a function' }).optional(),
    label: z.string().optional(),
});
// ============================================================================
// Allocation Records
// ============================================================================
/**
 * Allocation record - immutable record of a distribution event
 *
 * Preserves complete information about:
 * - What was allocated
 * - To whom
 * - Using what method/filters/weights
 * - When (timestamp + causality)
 */
export const AllocationRecordSchema = z.object({
    id: IdSchema,
    timestamp: z.number(),
    // Source
    providerId: IdSchema,
    capacitySlotId: z.string(),
    // Allocations: recipient ID -> allocated quantity
    allocations: z.record(z.string(), z.number()),
    // Distribution metadata (for transparency)
    distributionMethod: z.string(),
    filters: z.any().optional(),
    weights: z.record(z.string(), z.number()).optional(),
    // Multi-tier metadata
    tiers: z.record(z.string(), z.record(z.string(), z.number())).optional(),
    // Causality tracking
    itcStamp: z.any().optional(),
});
// ============================================================================
// Entity Data Schema
// ============================================================================
/**
 * Entity data structure with unified slot model
 * memberOf serves as the entity's types
 */
export const EntityDataSchema = z.object({
    id: IdSchema,
    // Unified slots (positive = capacity, negative = need)
    slots: z.record(z.string(), SlotSchema).default({}),
    // Membership relationships (these ARE the types)
    memberOf: z.array(IdSchema).default([]),
    members: z.array(IdSchema).default([]),
});
export const EntityCreateSchema = z.object({
    id: IdSchema,
});
// ============================================================================
// Legacy Schemas (for backward compatibility)
// ============================================================================
export const QuantitySchema = z.number().int().nonnegative();
export const PercentageSchema = z.number().gte(0).lte(1);
export const AttributeMethodSchema = z.object({
    kind: z.literal('method'),
    value: z.function().args(z.any()).returns(z.any()),
});
export const AttributeValueSchema = z.object({
    kind: z.literal('value'),
    value: z.any(),
});
export const AttributeSchema = z.discriminatedUnion('kind', [
    AttributeMethodSchema,
    AttributeValueSchema,
]);
export const AllocationAttributesSchema = z.object({
    members: z.array(IdSchema),
    quantity: QuantitySchema,
    location: IdSchema,
    time: IdSchema,
});
export const AllocationSchema = z.object({
    distribution: z.string(),
    attributes: AllocationAttributesSchema,
    entities: z.array(z.any()),
});
export const EntitySchema = z.object({
    id: IdSchema,
    types: z.array(TypeSchema),
    attributes: z.record(z.string(), AttributeSchema).optional(),
});
// ============================================================================
// Entity Class - Unified Slot Implementation
// ============================================================================
/**
 * Entity with unified slot model and membership-based typing.
 *
 * Key features:
 * - Unified Slots: Signed quantities (+ capacity, - need)
 * - Entities as Types: entities this is a member of ARE its types
 * - Bidirectional membership: tracks both "memberOf" and "members"
 * - Aggregation: sum slots up/down the membership hierarchy
 * - Proportions: calculate share of total across filtered sets
 *
 * Example:
 * ```ts
 * const alice = EntityInstance.create({ id: randomUUID() })
 *   .addSlot({
 *     name: 'Programming',
 *     quantity: +20,  // Can provide 20 hours/week
 *     unit: 'hours/week',
 *     resource_type: 'skill'
 *   })
 *   .addSlot({
 *     name: 'Housing',
 *     quantity: -1,   // Needs 1 room
 *     unit: 'room',
 *     resource_type: 'shelter'
 *   });
 *
 * // Get capacities (positive slots)
 * const capacities = alice.getCapacities();
 *
 * // Get needs (negative slots)
 * const needs = alice.getNeeds();
 *
 * // Aggregate net quantity across members
 * const netProgramming = developers.aggregateSlotDown('Programming');
 * // If members have +20, +15, -10 → net = +25 (surplus of 25)
 * ```
 */
export class EntityInstance {
    id;
    _data;
    static _registry = new Map();
    constructor(data) {
        this._data = EntityDataSchema.parse(data);
        this.id = this._data.id;
        EntityInstance._registry.set(this.id, this);
    }
    // ========================================================================
    // Static Factory & Registry Methods
    // ========================================================================
    static create(params) {
        const validated = EntityCreateSchema.parse(params);
        return new EntityInstance({
            id: validated.id,
            slots: {},
            memberOf: [],
            members: [],
        });
    }
    static fromData(data) {
        return new EntityInstance(data);
    }
    static get(id) {
        return this._registry.get(id);
    }
    static getAll() {
        return Array.from(this._registry.values());
    }
    static query(filter) {
        return this.getAll().filter(filter);
    }
    static clearRegistry() {
        this._registry.clear();
    }
    // ========================================================================
    // Type Queries (via memberOf)
    // ========================================================================
    getTypes() {
        return this.getMemberOfIds();
    }
    isMemberOf(entityId) {
        return this._data.memberOf.includes(entityId);
    }
    hasType(typeId) {
        return this.isMemberOf(typeId);
    }
    // ========================================================================
    // Unified Slot Management
    // ========================================================================
    addSlot(slot) {
        const slotId = slot.id || IdSchema.parse(crypto.randomUUID());
        this._data.slots[slotId] = SlotSchema.parse({ ...slot, id: slotId });
        return this;
    }
    getSlot(slotId) {
        return this._data.slots[slotId];
    }
    getSlots() {
        return { ...this._data.slots };
    }
    getSlotsArray() {
        return Object.values(this._data.slots);
    }
    removeSlot(slotId) {
        delete this._data.slots[slotId];
        return this;
    }
    updateSlot(slotId, updates) {
        const existing = this._data.slots[slotId];
        if (existing) {
            this._data.slots[slotId] = SlotSchema.parse({
                ...existing,
                ...updates,
                id: slotId, // Preserve ID
            });
        }
        return this;
    }
    // ========================================================================
    // Filtered Slot Queries
    // ========================================================================
    /**
     * Get all capacity slots (positive quantities)
     */
    getCapacities() {
        return this.getSlotsArray().filter((slot) => slot.quantity > 0);
    }
    /**
     * Get all need slots (negative quantities)
     */
    getNeeds() {
        return this.getSlotsArray().filter((slot) => slot.quantity < 0);
    }
    /**
     * Get slots by resource type
     */
    getSlotsByType(resourceType) {
        return this.getSlotsArray().filter((slot) => slot.resource_type === resourceType);
    }
    /**
     * Get slots by name
     */
    getSlotsByName(name) {
        return this.getSlotsArray().filter((slot) => slot.name === name);
    }
    // ========================================================================
    // Membership Management (Bidirectional)
    // ========================================================================
    addMemberOf(entityId) {
        if (!this._data.memberOf.includes(entityId)) {
            this._data.memberOf.push(entityId);
            const parent = EntityInstance.get(entityId);
            if (parent && !parent._data.members.includes(this.id)) {
                parent._data.members.push(this.id);
            }
        }
        return this;
    }
    removeMemberOf(entityId) {
        this._data.memberOf = this._data.memberOf.filter((id) => id !== entityId);
        const parent = EntityInstance.get(entityId);
        if (parent) {
            parent._data.members = parent._data.members.filter((id) => id !== this.id);
        }
        return this;
    }
    addMember(entityId) {
        if (!this._data.members.includes(entityId)) {
            this._data.members.push(entityId);
            const member = EntityInstance.get(entityId);
            if (member && !member._data.memberOf.includes(this.id)) {
                member._data.memberOf.push(this.id);
            }
        }
        return this;
    }
    removeMember(entityId) {
        this._data.members = this._data.members.filter((id) => id !== entityId);
        const member = EntityInstance.get(entityId);
        if (member) {
            member._data.memberOf = member._data.memberOf.filter((id) => id !== this.id);
        }
        return this;
    }
    getMemberOfIds() {
        return [...this._data.memberOf];
    }
    getMemberOf() {
        return this._data.memberOf
            .map((id) => EntityInstance.get(id))
            .filter((e) => e !== undefined);
    }
    getMemberIds() {
        return [...this._data.members];
    }
    getMembers() {
        return this._data.members
            .map((id) => EntityInstance.get(id))
            .filter((e) => e !== undefined);
    }
    // ========================================================================
    // Slot Aggregation Methods
    // ========================================================================
    /**
     * Aggregate slot quantities UP through memberships
     * Returns NET quantity (sum of signed values)
     *
     * Example: If parents have +20, +15, -10 for 'Programming'
     * Result: +25 (net surplus of 25)
     */
    aggregateSlotUp(slotNameOrType, byType = false) {
        return this.getMemberOf().reduce((sum, entity) => {
            const slots = entity.getSlotsArray();
            const matching = slots.filter((slot) => byType ? slot.resource_type === slotNameOrType : slot.name === slotNameOrType);
            return sum + matching.reduce((s, slot) => s + slot.quantity, 0);
        }, 0);
    }
    /**
     * Aggregate slot quantities DOWN through members
     * Returns NET quantity (sum of signed values)
     *
     * Example: If members have +20, +15, -10 for 'Programming'
     * Result: +25 (net surplus of 25)
     */
    aggregateSlotDown(slotNameOrType, byType = false, filter) {
        return this.getMembers()
            .filter((e) => !filter || filter(e))
            .reduce((sum, entity) => {
            const slots = entity.getSlotsArray();
            const matching = slots.filter((slot) => byType ? slot.resource_type === slotNameOrType : slot.name === slotNameOrType);
            return sum + matching.reduce((s, slot) => s + slot.quantity, 0);
        }, 0);
    }
    /**
     * Aggregate only capacities (positive quantities) DOWN through members
     */
    aggregateCapacityDown(slotNameOrType, byType = false, filter) {
        return this.getMembers()
            .filter((e) => !filter || filter(e))
            .reduce((sum, entity) => {
            const slots = entity.getSlotsArray();
            const matching = slots.filter((slot) => (byType ? slot.resource_type === slotNameOrType : slot.name === slotNameOrType) &&
                slot.quantity > 0);
            return sum + matching.reduce((s, slot) => s + slot.quantity, 0);
        }, 0);
    }
    /**
     * Aggregate only needs (negative quantities) DOWN through members
     * Returns absolute value (positive number representing total need)
     */
    aggregateNeedDown(slotNameOrType, byType = false, filter) {
        return Math.abs(this.getMembers()
            .filter((e) => !filter || filter(e))
            .reduce((sum, entity) => {
            const slots = entity.getSlotsArray();
            const matching = slots.filter((slot) => (byType ? slot.resource_type === slotNameOrType : slot.name === slotNameOrType) &&
                slot.quantity < 0);
            return sum + matching.reduce((s, slot) => s + slot.quantity, 0);
        }, 0));
    }
    // ========================================================================
    // Proportion Calculations
    // ========================================================================
    /**
     * Calculate proportion of slot quantity relative to a set of entities
     * Uses NET quantities (signed sum)
     */
    proportionOfSlot(slotNameOrType, entities, byType = false, filter) {
        const filtered = filter ? entities.filter(filter) : entities;
        const total = filtered.reduce((sum, e) => {
            const slots = e.getSlotsArray();
            const matching = slots.filter((slot) => byType ? slot.resource_type === slotNameOrType : slot.name === slotNameOrType);
            return sum + matching.reduce((s, slot) => s + slot.quantity, 0);
        }, 0);
        if (total === 0)
            return 0;
        const mySlots = this.getSlotsArray();
        const myMatching = mySlots.filter((slot) => byType ? slot.resource_type === slotNameOrType : slot.name === slotNameOrType);
        const myTotal = myMatching.reduce((s, slot) => s + slot.quantity, 0);
        return myTotal / total;
    }
    /**
     * Calculate proportion relative to a specific type
     */
    proportionOfSlotByType(slotNameOrType, typeId, byType = false) {
        const ofType = EntityInstance.query((e) => e.hasType(typeId));
        return this.proportionOfSlot(slotNameOrType, ofType, byType);
    }
    /**
     * Get summary of slot proportions across types
     */
    getSlotProportionSummary(slotNameOrType, byType = false) {
        const proportions = new Map();
        for (const typeId of this._data.memberOf) {
            proportions.set(typeId, this.proportionOfSlotByType(slotNameOrType, typeId, byType));
        }
        return proportions;
    }
    // ========================================================================
    // Distribution Methods
    // ========================================================================
    _allocationHistory = [];
    /**
     * Distribute slot capacity to members using attribute-based filtering
     *
     * This is the core distribution primitive that enables:
     * - Attribute-based filtering (location, skill level, etc.)
     * - Custom weighting functions (satisfaction, recognition, etc.)
     * - Proportional allocation based on weights
     *
     * @param slotId - Slot to distribute
     * @param config - Distribution configuration (filter, weighting, method)
     * @returns Map of recipient ID -> allocated quantity
     *
     * @example
     * // Distribute housing to members in specific locations
     * entity.distributeSlot(housingSlotId, {
     *   method: 'proportional',
     *   filter: {
     *     attributes: {
     *       'location': { values: ['San Francisco', 'Oakland'] }
     *     }
     *   }
     * });
     *
     * @example
     * // Distribute with satisfaction weighting
     * entity.distributeSlot(capacitySlotId, {
     *   method: 'satisfaction-weighted',
     *   weightingFunction: (member, slot) => {
     *     const recognition = member.getSlotsByName('recognition')[0]?.quantity || 0;
     *     const reputation = member.getSlotsByName('reputation')[0]?.quantity || 1.0;
     *     return recognition * reputation;
     *   }
     * });
     */
    distributeSlot(slotId, config) {
        const slot = this.getSlot(slotId);
        if (!slot || slot.quantity <= 0)
            return new Map();
        const cfg = config || { method: 'proportional' };
        // 1. Filter eligible recipients
        const eligibleMembers = this.getMembers().filter((member) => {
            // Apply entity predicate
            if (cfg.filter?.entityPredicate && !cfg.filter.entityPredicate(member)) {
                return false;
            }
            // Apply attribute constraints
            if (cfg.filter?.attributes) {
                for (const [attrName, constraint] of Object.entries(cfg.filter.attributes)) {
                    const memberSlots = member.getSlotsByName(attrName);
                    // Check if member has compatible slot
                    const hasCompatible = memberSlots.some((s) => {
                        if (constraint.min !== undefined && s.quantity < constraint.min)
                            return false;
                        if (constraint.max !== undefined && s.quantity > constraint.max)
                            return false;
                        if (constraint.values && !constraint.values.includes(s.quantity))
                            return false;
                        if (constraint.predicate && !constraint.predicate(s.quantity))
                            return false;
                        return true;
                    });
                    if (!hasCompatible)
                        return false;
                }
            }
            // Apply slot constraints
            if (cfg.filter?.slotConstraints) {
                const memberNeedSlots = member.getNeeds().filter((s) => s.name === slot.name || s.resource_type === slot.resource_type);
                if (!memberNeedSlots.some(cfg.filter.slotConstraints))
                    return false;
            }
            return true;
        });
        if (eligibleMembers.length === 0)
            return new Map();
        // 2. Calculate weights
        const weights = new Map();
        let totalWeight = 0;
        for (const member of eligibleMembers) {
            const weight = cfg.weightingFunction
                ? cfg.weightingFunction(member, slot)
                : this.defaultWeightFunction(member, slot);
            if (weight > 0) {
                weights.set(member.id, weight);
                totalWeight += weight;
            }
        }
        // 3. Normalize to shares and allocate
        const allocations = new Map();
        if (totalWeight > 0) {
            for (const [memberId, weight] of weights) {
                const share = weight / totalWeight;
                const allocation = slot.quantity * share;
                allocations.set(memberId, allocation);
            }
        }
        else if (cfg.method === 'equal') {
            // Equal shares fallback
            const equalShare = slot.quantity / eligibleMembers.length;
            for (const member of eligibleMembers) {
                allocations.set(member.id, equalShare);
            }
        }
        return allocations;
    }
    /**
     * Default weighting function: proportional to need magnitude
     *
     * Weights recipients by the absolute magnitude of their matching needs.
     * This ensures those with greater needs receive proportionally more.
     */
    defaultWeightFunction(member, slot) {
        // Find matching need slots (negative quantities)
        const needSlots = member.getNeeds().filter((s) => s.name === slot.name || s.resource_type === slot.resource_type);
        // Weight by absolute need magnitude
        return needSlots.reduce((sum, s) => sum + Math.abs(s.quantity), 0);
    }
    /**
     * Multi-tier allocation with priority-based distribution
     *
     * Allocates capacity across multiple tiers sequentially based on priority.
     * Lower priority numbers are allocated first.
     *
     * @param slotId - Slot to distribute
     * @param tiers - Array of tier configurations with priority, filters, and weights
     * @returns Map of recipient ID -> allocation result (total + by tier)
     *
     * @example
     * // Two-tier allocation: mutual recognition first, then unilateral
     * entity.distributeMultiTier(capacitySlotId, [
     *   {
     *     priority: 0,
     *     label: 'mutual-recognition',
     *     weightingFunction: (member, slot) => {
     *       const mr = computeMutualRecognition(member);
     *       return mr > 0 ? mr : 0;
     *     }
     *   },
     *   {
     *     priority: 1,
     *     label: 'unilateral-recognition',
     *     weightingFunction: (member, slot) => {
     *       return member.getSlotsByName('recognition')[0]?.quantity || 0;
     *     }
     *   }
     * ]);
     */
    distributeMultiTier(slotId, tiers) {
        const slot = this.getSlot(slotId);
        if (!slot || slot.quantity <= 0)
            return new Map();
        // Sort tiers by priority (lower = first)
        const sortedTiers = [...tiers].sort((a, b) => a.priority - b.priority);
        const results = new Map();
        let remainingCapacity = slot.quantity;
        for (const tier of sortedTiers) {
            if (remainingCapacity <= 0)
                break;
            // Create temporary slot with remaining capacity
            const tierSlotId = IdSchema.parse(crypto.randomUUID());
            this.addSlot({
                id: tierSlotId,
                name: slot.name,
                quantity: remainingCapacity,
                resource_type: slot.resource_type,
                unit: slot.unit,
            });
            // Distribute for this tier
            const tierAllocations = this.distributeSlot(tierSlotId, {
                method: 'custom',
                filter: tier.filter,
                weightingFunction: tier.weightingFunction,
            });
            // Aggregate results
            for (const [memberId, allocation] of tierAllocations) {
                if (!results.has(memberId)) {
                    results.set(memberId, { total: 0, byTier: new Map() });
                }
                const memberResult = results.get(memberId);
                memberResult.total += allocation;
                memberResult.byTier.set(tier.priority, allocation);
                remainingCapacity -= allocation;
            }
            // Clean up temporary slot
            this.removeSlot(tierSlotId);
        }
        return results;
    }
    /**
     * Distribute and record allocation (immutable)
     *
     * Performs distribution and creates an immutable allocation record
     * for transparency and causality tracking.
     *
     * @param slotId - Slot to distribute
     * @param config - Distribution configuration
     * @returns Allocation record with full metadata
     */
    distributeAndRecord(slotId, config) {
        const allocations = this.distributeSlot(slotId, config);
        // Convert Map to plain object for schema
        const allocationsObj = {};
        for (const [id, quantity] of allocations) {
            allocationsObj[id] = quantity;
        }
        const record = {
            id: IdSchema.parse(crypto.randomUUID()),
            timestamp: Date.now(),
            providerId: this.id,
            capacitySlotId: slotId,
            allocations: allocationsObj,
            distributionMethod: config?.method || 'proportional',
            filters: config?.filter,
            itcStamp: config?.itcStamp,
        };
        this._allocationHistory.push(record);
        return record;
    }
    /**
     * Query allocation history
     *
     * @param filter - Optional filter predicate
     * @returns Array of allocation records
     */
    getAllocationHistory(filter) {
        return filter
            ? this._allocationHistory.filter(filter)
            : [...this._allocationHistory];
    }
    /**
     * Calculate satisfaction-weighted distribution (v6 style)
     *
     * Implements v6's MS formula: effectivePoints = recognition × reputation
     *
     * @param slotId - Slot to distribute
     * @param recognitionSlotName - Name of recognition slot (default: 'recognition')
     * @param reputationSlotName - Name of reputation slot (default: 'reputation')
     * @returns Map of recipient ID -> allocated quantity
     */
    distributeSatisfactionWeighted(slotId, recognitionSlotName = 'recognition', reputationSlotName = 'reputation') {
        return this.distributeSlot(slotId, {
            method: 'satisfaction-weighted',
            weightingFunction: (member, slot) => {
                // Get my recognition of them
                const recognitionSlots = member.getSlotsByName(recognitionSlotName);
                const recognition = recognitionSlots.reduce((sum, s) => sum + s.quantity, 0);
                // Get their reputation (defaults to 1.0)
                const reputationSlots = member.getSlotsByName(reputationSlotName);
                const reputation = reputationSlots.length > 0
                    ? reputationSlots.reduce((sum, s) => sum + s.quantity, 0) / reputationSlots.length
                    : 1.0;
                // MS formula: effective_points = recognition × reputation
                return recognition * reputation;
            },
        });
    }
    // ========================================================================
    // Oscillation Dampening (v6 Feature)
    // ========================================================================
    /**
     * Update slot with oscillation dampening
     *
     * Tracks quantity history and detects oscillation patterns.
     * Applies dampening factor when oscillation is detected.
     *
     * @param slotId - Slot to update
     * @param newQuantity - New quantity value
     * @returns this (for chaining)
     */
    updateSlotWithDampening(slotId, newQuantity) {
        const slot = this.getSlot(slotId);
        if (!slot)
            return this;
        // Get or initialize history
        const metadata = slot.metadata || {};
        const history = metadata.dampingHistory || [];
        // Detect oscillation (check last 3 values)
        let oscillationDetected = false;
        if (history.length >= 2) {
            const recent = [
                history[history.length - 2].quantity,
                history[history.length - 1].quantity,
                newQuantity,
            ];
            const upDownUp = recent[0] < recent[1] && recent[1] > recent[2];
            const downUpDown = recent[0] > recent[1] && recent[1] < recent[2];
            oscillationDetected = upDownUp || downUpDown;
        }
        // Calculate damping factor
        const dampingFactor = oscillationDetected ? 0.5 : 1.0;
        // Apply dampening to new quantity
        const dampenedQuantity = newQuantity * dampingFactor;
        // Update slot with new history
        return this.updateSlot(slotId, {
            quantity: dampenedQuantity,
            metadata: {
                ...metadata,
                dampingHistory: [
                    ...history,
                    {
                        timestamp: Date.now(),
                        quantity: newQuantity,
                        oscillationDetected,
                    },
                ].slice(-10), // Keep last 10
                dampingFactor,
            },
        });
    }
    /**
     * Get dampening factor for a slot
     *
     * @param slotId - Slot ID
     * @returns Dampening factor (0.0-1.0), or 1.0 if no dampening
     */
    getDampeningFactor(slotId) {
        const slot = this.getSlot(slotId);
        return slot?.metadata?.dampingFactor || 1.0;
    }
    /**
     * Check if oscillation is detected for a slot
     *
     * @param slotId - Slot ID
     * @returns true if oscillation detected in recent history
     */
    isOscillating(slotId) {
        const slot = this.getSlot(slotId);
        const history = slot?.metadata?.dampingHistory || [];
        return history.length > 0 && history[history.length - 1].oscillationDetected;
    }
    // ========================================================================
    // Serialization
    // ========================================================================
    toData() {
        return EntityDataSchema.parse(this._data);
    }
    toJSON() {
        return this.toData();
    }
}
//# sourceMappingURL=commons.js.map