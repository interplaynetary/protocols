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
    allocationMethod: z.custom<(context: any) => any>(
        (val: unknown) => typeof val === 'function',
        { message: 'Must be a function' }
    ).optional(),
    distributionMethod: z.custom<(value: any, targets: any[]) => Map<string, any>>(
        (val: unknown) => typeof val === 'function',
        { message: 'Must be a function' }
    ).optional(),

    // Additional metadata
    metadata: z.record(z.string(), z.any()).optional(),
});

export type Slot = z.infer<typeof SlotSchema>;

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
    predicate: z.custom<(value: any) => boolean>(
        (val: unknown) => typeof val === 'function',
        { message: 'Must be a function' }
    ).optional(),
});

export type AttributeConstraint = z.infer<typeof AttributeConstraintSchema>;

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
    slotConstraints: z.custom<(slot: Slot) => boolean>(
        (val: unknown) => typeof val === 'function',
        { message: 'Must be a function' }
    ).optional(),

    // Custom entity predicate
    entityPredicate: z.custom<(entity: EntityInstance) => boolean>(
        (val: unknown) => typeof val === 'function',
        { message: 'Must be a function' }
    ).optional(),
});

export type DistributionFilter = z.infer<typeof DistributionFilterSchema>;

/**
 * Distribution configuration for a slot
 * 
 * Defines HOW to distribute capacity/need across entities
 */
export const DistributionConfigSchema = z.object({
    method: z.enum(['proportional', 'satisfaction-weighted', 'equal', 'custom']).default('proportional'),
    filter: DistributionFilterSchema.optional(),
    weightingFunction: z.custom<(entity: EntityInstance, slot: Slot) => number>(
        (val: unknown) => typeof val === 'function',
        { message: 'Must be a function' }
    ).optional(),
    tier: z.number().int().nonnegative().optional(),
});

export type DistributionConfig = z.infer<typeof DistributionConfigSchema>;

/**
 * Tier configuration for multi-tier allocation
 */
export const TierConfigSchema = z.object({
    priority: z.number().int().nonnegative(),
    filter: DistributionFilterSchema.optional(),
    weightingFunction: z.custom<(entity: EntityInstance, slot: Slot) => number>(
        (val: unknown) => typeof val === 'function',
        { message: 'Must be a function' }
    ).optional(),
    label: z.string().optional(),
});

export type TierConfig = z.infer<typeof TierConfigSchema>;

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

export type AllocationRecord = z.infer<typeof AllocationRecordSchema>;

/**
 * Allocation result for multi-tier distribution
 */
export interface AllocationResult {
    total: number;
    byTier: Map<number, number>;
}

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

export type EntityData = z.infer<typeof EntityDataSchema>;
export type EntityCreate = z.infer<typeof EntityCreateSchema>;
export type EntityFilter = (entity: EntityInstance) => boolean;

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

export type Id = z.infer<typeof IdSchema>;
export type Type = z.infer<typeof TypeSchema>;
export type Quantity = z.infer<typeof QuantitySchema>;
export type Attribute = z.infer<typeof AttributeSchema>;
export type AttributeMethod = z.infer<typeof AttributeMethodSchema>;
export type AttributeValue = z.infer<typeof AttributeValueSchema>;
export type AllocationAttributes = z.infer<typeof AllocationAttributesSchema>;
export type Allocation = z.infer<typeof AllocationSchema>;
export type Entity = z.infer<typeof EntitySchema>;

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
    readonly id: Id;
    private _data: EntityData;
    private static _registry = new Map<Id, EntityInstance>();

    private constructor(data: EntityData) {
        this._data = EntityDataSchema.parse(data);
        this.id = this._data.id;
        EntityInstance._registry.set(this.id, this);
    }

    // ========================================================================
    // Static Factory & Registry Methods
    // ========================================================================

    static create(params: EntityCreate): EntityInstance {
        const validated = EntityCreateSchema.parse(params);
        return new EntityInstance({
            id: validated.id,
            slots: {},
            memberOf: [],
            members: [],
        });
    }

    static fromData(data: EntityData): EntityInstance {
        return new EntityInstance(data);
    }

    static get(id: Id): EntityInstance | undefined {
        return this._registry.get(id);
    }

    static getAll(): EntityInstance[] {
        return Array.from(this._registry.values());
    }

    static query(filter: EntityFilter): EntityInstance[] {
        return this.getAll().filter(filter);
    }

    static clearRegistry(): void {
        this._registry.clear();
    }

    // ========================================================================
    // Type Queries (via memberOf)
    // ========================================================================

    getTypes(): Id[] {
        return this.getMemberOfIds();
    }

    isMemberOf(entityId: Id): boolean {
        return this._data.memberOf.includes(entityId);
    }

    hasType(typeId: Id): boolean {
        return this.isMemberOf(typeId);
    }

    // ========================================================================
    // Unified Slot Management
    // ========================================================================

    addSlot(slot: Omit<Slot, 'id'> & { id?: string }): this {
        const slotId = slot.id || IdSchema.parse(crypto.randomUUID());
        this._data.slots[slotId] = SlotSchema.parse({ ...slot, id: slotId });
        return this;
    }

    getSlot(slotId: string): Slot | undefined {
        return this._data.slots[slotId];
    }

    getSlots(): Record<string, Slot> {
        return { ...this._data.slots };
    }

    getSlotsArray(): Slot[] {
        return Object.values(this._data.slots);
    }

    removeSlot(slotId: string): this {
        delete this._data.slots[slotId];
        return this;
    }

    updateSlot(slotId: string, updates: Partial<Slot>): this {
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
    getCapacities(): Slot[] {
        return this.getSlotsArray().filter((slot: Slot) => slot.quantity > 0);
    }

    /**
     * Get all need slots (negative quantities)
     */
    getNeeds(): Slot[] {
        return this.getSlotsArray().filter((slot: Slot) => slot.quantity < 0);
    }

    /**
     * Get slots by resource type
     */
    getSlotsByType(resourceType: string): Slot[] {
        return this.getSlotsArray().filter((slot: Slot) => slot.resource_type === resourceType);
    }

    /**
     * Get slots by name
     */
    getSlotsByName(name: string): Slot[] {
        return this.getSlotsArray().filter((slot: Slot) => slot.name === name);
    }

    // ========================================================================
    // Membership Management (Bidirectional)
    // ========================================================================

    addMemberOf(entityId: Id): this {
        if (!this._data.memberOf.includes(entityId)) {
            this._data.memberOf.push(entityId);
            const parent = EntityInstance.get(entityId);
            if (parent && !parent._data.members.includes(this.id)) {
                parent._data.members.push(this.id);
            }
        }
        return this;
    }

    removeMemberOf(entityId: Id): this {
        this._data.memberOf = this._data.memberOf.filter((id: Id) => id !== entityId);
        const parent = EntityInstance.get(entityId);
        if (parent) {
            parent._data.members = parent._data.members.filter((id: Id) => id !== this.id);
        }
        return this;
    }

    addMember(entityId: Id): this {
        if (!this._data.members.includes(entityId)) {
            this._data.members.push(entityId);
            const member = EntityInstance.get(entityId);
            if (member && !member._data.memberOf.includes(this.id)) {
                member._data.memberOf.push(this.id);
            }
        }
        return this;
    }

    removeMember(entityId: Id): this {
        this._data.members = this._data.members.filter((id: Id) => id !== entityId);
        const member = EntityInstance.get(entityId);
        if (member) {
            member._data.memberOf = member._data.memberOf.filter((id: Id) => id !== this.id);
        }
        return this;
    }

    getMemberOfIds(): Id[] {
        return [...this._data.memberOf];
    }

    getMemberOf(): EntityInstance[] {
        return this._data.memberOf
            .map((id: Id) => EntityInstance.get(id))
            .filter((e: EntityInstance | undefined): e is EntityInstance => e !== undefined);
    }

    getMemberIds(): Id[] {
        return [...this._data.members];
    }

    getMembers(): EntityInstance[] {
        return this._data.members
            .map((id: Id) => EntityInstance.get(id))
            .filter((e: EntityInstance | undefined): e is EntityInstance => e !== undefined);
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
    aggregateSlotUp(slotNameOrType: string, byType: boolean = false): number {
        return this.getMemberOf().reduce((sum: number, entity: EntityInstance) => {
            const slots = entity.getSlotsArray();
            const matching = slots.filter((slot: Slot) =>
                byType ? slot.resource_type === slotNameOrType : slot.name === slotNameOrType
            );
            return sum + matching.reduce((s: number, slot: Slot) => s + slot.quantity, 0);
        }, 0);
    }

    /**
     * Aggregate slot quantities DOWN through members
     * Returns NET quantity (sum of signed values)
     * 
     * Example: If members have +20, +15, -10 for 'Programming'
     * Result: +25 (net surplus of 25)
     */
    aggregateSlotDown(slotNameOrType: string, byType: boolean = false, filter?: EntityFilter): number {
        return this.getMembers()
            .filter((e: EntityInstance) => !filter || filter(e))
            .reduce((sum: number, entity: EntityInstance) => {
                const slots = entity.getSlotsArray();
                const matching = slots.filter((slot: Slot) =>
                    byType ? slot.resource_type === slotNameOrType : slot.name === slotNameOrType
                );
                return sum + matching.reduce((s: number, slot: Slot) => s + slot.quantity, 0);
            }, 0);
    }

    /**
     * Aggregate only capacities (positive quantities) DOWN through members
     */
    aggregateCapacityDown(slotNameOrType: string, byType: boolean = false, filter?: EntityFilter): number {
        return this.getMembers()
            .filter((e: EntityInstance) => !filter || filter(e))
            .reduce((sum: number, entity: EntityInstance) => {
                const slots = entity.getSlotsArray();
                const matching = slots.filter((slot: Slot) =>
                    (byType ? slot.resource_type === slotNameOrType : slot.name === slotNameOrType) &&
                    slot.quantity > 0
                );
                return sum + matching.reduce((s: number, slot: Slot) => s + slot.quantity, 0);
            }, 0);
    }

    /**
     * Aggregate only needs (negative quantities) DOWN through members
     * Returns absolute value (positive number representing total need)
     */
    aggregateNeedDown(slotNameOrType: string, byType: boolean = false, filter?: EntityFilter): number {
        return Math.abs(
            this.getMembers()
                .filter((e: EntityInstance) => !filter || filter(e))
                .reduce((sum: number, entity: EntityInstance) => {
                    const slots = entity.getSlotsArray();
                    const matching = slots.filter((slot: Slot) =>
                        (byType ? slot.resource_type === slotNameOrType : slot.name === slotNameOrType) &&
                        slot.quantity < 0
                    );
                    return sum + matching.reduce((s: number, slot: Slot) => s + slot.quantity, 0);
                }, 0)
        );
    }

    // ========================================================================
    // Proportion Calculations
    // ========================================================================

    /**
     * Calculate proportion of slot quantity relative to a set of entities
     * Uses NET quantities (signed sum)
     */
    proportionOfSlot(
        slotNameOrType: string,
        entities: EntityInstance[],
        byType: boolean = false,
        filter?: EntityFilter
    ): number {
        const filtered = filter ? entities.filter(filter) : entities;
        const total = filtered.reduce((sum: number, e: EntityInstance) => {
            const slots = e.getSlotsArray();
            const matching = slots.filter((slot: Slot) =>
                byType ? slot.resource_type === slotNameOrType : slot.name === slotNameOrType
            );
            return sum + matching.reduce((s: number, slot: Slot) => s + slot.quantity, 0);
        }, 0);

        if (total === 0) return 0;

        const mySlots = this.getSlotsArray();
        const myMatching = mySlots.filter((slot: Slot) =>
            byType ? slot.resource_type === slotNameOrType : slot.name === slotNameOrType
        );
        const myTotal = myMatching.reduce((s: number, slot: Slot) => s + slot.quantity, 0);

        return myTotal / total;
    }

    /**
     * Calculate proportion relative to a specific type
     */
    proportionOfSlotByType(slotNameOrType: string, typeId: Id, byType: boolean = false): number {
        const ofType = EntityInstance.query((e: EntityInstance) => e.hasType(typeId));
        return this.proportionOfSlot(slotNameOrType, ofType, byType);
    }

    /**
     * Get summary of slot proportions across types
     */
    getSlotProportionSummary(slotNameOrType: string, byType: boolean = false): Map<Type, number> {
        const proportions = new Map<Type, number>();

        for (const typeId of this._data.memberOf) {
            proportions.set(typeId, this.proportionOfSlotByType(slotNameOrType, typeId, byType));
        }

        return proportions;
    }

    // ========================================================================
    // Distribution Methods
    // ========================================================================

    private _allocationHistory: AllocationRecord[] = [];

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
    distributeSlot(
        slotId: string,
        config?: DistributionConfig
    ): Map<Id, number> {
        const slot = this.getSlot(slotId);
        if (!slot || slot.quantity <= 0) return new Map();

        const cfg = config || { method: 'proportional' };

        // 1. Filter eligible recipients
        const eligibleMembers = this.getMembers().filter((member: EntityInstance) => {
            // Apply entity predicate
            if (cfg.filter?.entityPredicate && !cfg.filter.entityPredicate(member)) {
                return false;
            }

            // Apply attribute constraints
            if (cfg.filter?.attributes) {
                for (const [attrName, constraint] of Object.entries(cfg.filter.attributes)) {
                    const memberSlots = member.getSlotsByName(attrName);

                    // Check if member has compatible slot
                    const hasCompatible = memberSlots.some((s: Slot) => {
                        if (constraint.min !== undefined && s.quantity < constraint.min) return false;
                        if (constraint.max !== undefined && s.quantity > constraint.max) return false;
                        if (constraint.values && !constraint.values.includes(s.quantity)) return false;
                        if (constraint.predicate && !constraint.predicate(s.quantity)) return false;
                        return true;
                    });

                    if (!hasCompatible) return false;
                }
            }

            // Apply slot constraints
            if (cfg.filter?.slotConstraints) {
                const memberNeedSlots = member.getNeeds().filter((s: Slot) =>
                    s.name === slot.name || s.resource_type === slot.resource_type
                );
                if (!memberNeedSlots.some(cfg.filter.slotConstraints)) return false;
            }

            return true;
        });

        if (eligibleMembers.length === 0) return new Map();

        // 2. Calculate weights
        const weights = new Map<Id, number>();
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
        const allocations = new Map<Id, number>();

        if (totalWeight > 0) {
            for (const [memberId, weight] of weights) {
                const share = weight / totalWeight;
                const allocation = slot.quantity * share;
                allocations.set(memberId, allocation);
            }
        } else if (cfg.method === 'equal') {
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
    private defaultWeightFunction(member: EntityInstance, slot: Slot): number {
        // Find matching need slots (negative quantities)
        const needSlots = member.getNeeds().filter((s: Slot) =>
            s.name === slot.name || s.resource_type === slot.resource_type
        );

        // Weight by absolute need magnitude
        return needSlots.reduce((sum: number, s: Slot) => sum + Math.abs(s.quantity), 0);
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
    distributeMultiTier(
        slotId: string,
        tiers: TierConfig[]
    ): Map<Id, AllocationResult> {
        const slot = this.getSlot(slotId);
        if (!slot || slot.quantity <= 0) return new Map();

        // Sort tiers by priority (lower = first)
        const sortedTiers = [...tiers].sort((a, b) => a.priority - b.priority);

        const results = new Map<Id, AllocationResult>();
        let remainingCapacity = slot.quantity;

        for (const tier of sortedTiers) {
            if (remainingCapacity <= 0) break;

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
                const memberResult = results.get(memberId)!;
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
    distributeAndRecord(
        slotId: string,
        config?: DistributionConfig & { itcStamp?: any }
    ): AllocationRecord {
        const allocations = this.distributeSlot(slotId, config);

        // Convert Map to plain object for schema
        const allocationsObj: Record<string, number> = {};
        for (const [id, quantity] of allocations) {
            allocationsObj[id] = quantity;
        }

        const record: AllocationRecord = {
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
    getAllocationHistory(filter?: (record: AllocationRecord) => boolean): AllocationRecord[] {
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
    distributeSatisfactionWeighted(
        slotId: string,
        recognitionSlotName: string = 'recognition',
        reputationSlotName: string = 'reputation'
    ): Map<Id, number> {
        return this.distributeSlot(slotId, {
            method: 'satisfaction-weighted',
            weightingFunction: (member: EntityInstance, slot: Slot) => {
                // Get my recognition of them
                const recognitionSlots = member.getSlotsByName(recognitionSlotName);
                const recognition = recognitionSlots.reduce((sum: number, s: Slot) => sum + s.quantity, 0);

                // Get their reputation (defaults to 1.0)
                const reputationSlots = member.getSlotsByName(reputationSlotName);
                const reputation = reputationSlots.length > 0
                    ? reputationSlots.reduce((sum: number, s: Slot) => sum + s.quantity, 0) / reputationSlots.length
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
    updateSlotWithDampening(slotId: string, newQuantity: number): this {
        const slot = this.getSlot(slotId);
        if (!slot) return this;

        // Get or initialize history
        const metadata = slot.metadata || {};
        const history = (metadata.dampingHistory as Array<{
            timestamp: number;
            quantity: number;
            oscillationDetected: boolean;
        }>) || [];

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
    getDampeningFactor(slotId: string): number {
        const slot = this.getSlot(slotId);
        return (slot?.metadata?.dampingFactor as number) || 1.0;
    }

    /**
     * Check if oscillation is detected for a slot
     * 
     * @param slotId - Slot ID
     * @returns true if oscillation detected in recent history
     */
    isOscillating(slotId: string): boolean {
        const slot = this.getSlot(slotId);
        const history = (slot?.metadata?.dampingHistory as Array<{
            oscillationDetected: boolean;
        }>) || [];

        return history.length > 0 && history[history.length - 1].oscillationDetected;
    }

    // ========================================================================
    // Serialization
    // ========================================================================

    toData(): EntityData {
        return EntityDataSchema.parse(this._data);
    }

    toJSON(): EntityData {
        return this.toData();
    }
}