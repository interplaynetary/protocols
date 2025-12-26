import { z } from 'zod';
export declare const IdSchema: z.ZodString;
export declare const TypeSchema: z.ZodString;
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
export declare const SlotSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    quantity: z.ZodNumber;
    resource_type: z.ZodOptional<z.ZodString>;
    unit: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    emoji: z.ZodOptional<z.ZodString>;
    min_allocation: z.ZodOptional<z.ZodNumber>;
    max_divisions: z.ZodOptional<z.ZodNumber>;
    priority: z.ZodOptional<z.ZodNumber>;
    allocationMethod: z.ZodOptional<z.ZodType<(context: any) => any, z.ZodTypeDef, (context: any) => any>>;
    distributionMethod: z.ZodOptional<z.ZodType<(value: any, targets: any[]) => Map<string, any>, z.ZodTypeDef, (value: any, targets: any[]) => Map<string, any>>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    name?: string;
    emoji?: string;
    unit?: string;
    description?: string;
    resource_type?: string;
    quantity?: number;
    priority?: number;
    min_allocation?: number;
    max_divisions?: number;
    allocationMethod?: (context: any) => any;
    distributionMethod?: (value: any, targets: any[]) => Map<string, any>;
    metadata?: Record<string, any>;
}, {
    id?: string;
    name?: string;
    emoji?: string;
    unit?: string;
    description?: string;
    resource_type?: string;
    quantity?: number;
    priority?: number;
    min_allocation?: number;
    max_divisions?: number;
    allocationMethod?: (context: any) => any;
    distributionMethod?: (value: any, targets: any[]) => Map<string, any>;
    metadata?: Record<string, any>;
}>;
export type Slot = z.infer<typeof SlotSchema>;
/**
 * Attribute constraint for filtering entities during distribution
 */
export declare const AttributeConstraintSchema: z.ZodObject<{
    min: z.ZodOptional<z.ZodNumber>;
    max: z.ZodOptional<z.ZodNumber>;
    values: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    predicate: z.ZodOptional<z.ZodType<(value: any) => boolean, z.ZodTypeDef, (value: any) => boolean>>;
}, "strip", z.ZodTypeAny, {
    values?: any[];
    min?: number;
    max?: number;
    predicate?: (value: any) => boolean;
}, {
    values?: any[];
    min?: number;
    max?: number;
    predicate?: (value: any) => boolean;
}>;
export type AttributeConstraint = z.infer<typeof AttributeConstraintSchema>;
/**
 * Distribution filter configuration
 *
 * Enables filtering entities by:
 * - Attribute values (e.g., location, skill level)
 * - Slot constraints (e.g., time availability)
 * - Custom predicates
 */
export declare const DistributionFilterSchema: z.ZodObject<{
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        min: z.ZodOptional<z.ZodNumber>;
        max: z.ZodOptional<z.ZodNumber>;
        values: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        predicate: z.ZodOptional<z.ZodType<(value: any) => boolean, z.ZodTypeDef, (value: any) => boolean>>;
    }, "strip", z.ZodTypeAny, {
        values?: any[];
        min?: number;
        max?: number;
        predicate?: (value: any) => boolean;
    }, {
        values?: any[];
        min?: number;
        max?: number;
        predicate?: (value: any) => boolean;
    }>>>;
    slotConstraints: z.ZodOptional<z.ZodType<(slot: Slot) => boolean, z.ZodTypeDef, (slot: Slot) => boolean>>;
    entityPredicate: z.ZodOptional<z.ZodType<(entity: EntityInstance) => boolean, z.ZodTypeDef, (entity: EntityInstance) => boolean>>;
}, "strip", z.ZodTypeAny, {
    attributes?: Record<string, {
        values?: any[];
        min?: number;
        max?: number;
        predicate?: (value: any) => boolean;
    }>;
    slotConstraints?: (slot: Slot) => boolean;
    entityPredicate?: (entity: EntityInstance) => boolean;
}, {
    attributes?: Record<string, {
        values?: any[];
        min?: number;
        max?: number;
        predicate?: (value: any) => boolean;
    }>;
    slotConstraints?: (slot: Slot) => boolean;
    entityPredicate?: (entity: EntityInstance) => boolean;
}>;
export type DistributionFilter = z.infer<typeof DistributionFilterSchema>;
/**
 * Distribution configuration for a slot
 *
 * Defines HOW to distribute capacity/need across entities
 */
export declare const DistributionConfigSchema: z.ZodObject<{
    method: z.ZodDefault<z.ZodEnum<["proportional", "satisfaction-weighted", "equal", "custom"]>>;
    filter: z.ZodOptional<z.ZodObject<{
        attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
            values: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
            predicate: z.ZodOptional<z.ZodType<(value: any) => boolean, z.ZodTypeDef, (value: any) => boolean>>;
        }, "strip", z.ZodTypeAny, {
            values?: any[];
            min?: number;
            max?: number;
            predicate?: (value: any) => boolean;
        }, {
            values?: any[];
            min?: number;
            max?: number;
            predicate?: (value: any) => boolean;
        }>>>;
        slotConstraints: z.ZodOptional<z.ZodType<(slot: Slot) => boolean, z.ZodTypeDef, (slot: Slot) => boolean>>;
        entityPredicate: z.ZodOptional<z.ZodType<(entity: EntityInstance) => boolean, z.ZodTypeDef, (entity: EntityInstance) => boolean>>;
    }, "strip", z.ZodTypeAny, {
        attributes?: Record<string, {
            values?: any[];
            min?: number;
            max?: number;
            predicate?: (value: any) => boolean;
        }>;
        slotConstraints?: (slot: Slot) => boolean;
        entityPredicate?: (entity: EntityInstance) => boolean;
    }, {
        attributes?: Record<string, {
            values?: any[];
            min?: number;
            max?: number;
            predicate?: (value: any) => boolean;
        }>;
        slotConstraints?: (slot: Slot) => boolean;
        entityPredicate?: (entity: EntityInstance) => boolean;
    }>>;
    weightingFunction: z.ZodOptional<z.ZodType<(entity: EntityInstance, slot: Slot) => number, z.ZodTypeDef, (entity: EntityInstance, slot: Slot) => number>>;
    tier: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    filter?: {
        attributes?: Record<string, {
            values?: any[];
            min?: number;
            max?: number;
            predicate?: (value: any) => boolean;
        }>;
        slotConstraints?: (slot: Slot) => boolean;
        entityPredicate?: (entity: EntityInstance) => boolean;
    };
    tier?: number;
    method?: "custom" | "equal" | "proportional" | "satisfaction-weighted";
    weightingFunction?: (entity: EntityInstance, slot: Slot) => number;
}, {
    filter?: {
        attributes?: Record<string, {
            values?: any[];
            min?: number;
            max?: number;
            predicate?: (value: any) => boolean;
        }>;
        slotConstraints?: (slot: Slot) => boolean;
        entityPredicate?: (entity: EntityInstance) => boolean;
    };
    tier?: number;
    method?: "custom" | "equal" | "proportional" | "satisfaction-weighted";
    weightingFunction?: (entity: EntityInstance, slot: Slot) => number;
}>;
export type DistributionConfig = z.infer<typeof DistributionConfigSchema>;
/**
 * Tier configuration for multi-tier allocation
 */
export declare const TierConfigSchema: z.ZodObject<{
    priority: z.ZodNumber;
    filter: z.ZodOptional<z.ZodObject<{
        attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
            values: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
            predicate: z.ZodOptional<z.ZodType<(value: any) => boolean, z.ZodTypeDef, (value: any) => boolean>>;
        }, "strip", z.ZodTypeAny, {
            values?: any[];
            min?: number;
            max?: number;
            predicate?: (value: any) => boolean;
        }, {
            values?: any[];
            min?: number;
            max?: number;
            predicate?: (value: any) => boolean;
        }>>>;
        slotConstraints: z.ZodOptional<z.ZodType<(slot: Slot) => boolean, z.ZodTypeDef, (slot: Slot) => boolean>>;
        entityPredicate: z.ZodOptional<z.ZodType<(entity: EntityInstance) => boolean, z.ZodTypeDef, (entity: EntityInstance) => boolean>>;
    }, "strip", z.ZodTypeAny, {
        attributes?: Record<string, {
            values?: any[];
            min?: number;
            max?: number;
            predicate?: (value: any) => boolean;
        }>;
        slotConstraints?: (slot: Slot) => boolean;
        entityPredicate?: (entity: EntityInstance) => boolean;
    }, {
        attributes?: Record<string, {
            values?: any[];
            min?: number;
            max?: number;
            predicate?: (value: any) => boolean;
        }>;
        slotConstraints?: (slot: Slot) => boolean;
        entityPredicate?: (entity: EntityInstance) => boolean;
    }>>;
    weightingFunction: z.ZodOptional<z.ZodType<(entity: EntityInstance, slot: Slot) => number, z.ZodTypeDef, (entity: EntityInstance, slot: Slot) => number>>;
    label: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    filter?: {
        attributes?: Record<string, {
            values?: any[];
            min?: number;
            max?: number;
            predicate?: (value: any) => boolean;
        }>;
        slotConstraints?: (slot: Slot) => boolean;
        entityPredicate?: (entity: EntityInstance) => boolean;
    };
    priority?: number;
    label?: string;
    weightingFunction?: (entity: EntityInstance, slot: Slot) => number;
}, {
    filter?: {
        attributes?: Record<string, {
            values?: any[];
            min?: number;
            max?: number;
            predicate?: (value: any) => boolean;
        }>;
        slotConstraints?: (slot: Slot) => boolean;
        entityPredicate?: (entity: EntityInstance) => boolean;
    };
    priority?: number;
    label?: string;
    weightingFunction?: (entity: EntityInstance, slot: Slot) => number;
}>;
export type TierConfig = z.infer<typeof TierConfigSchema>;
/**
 * Allocation record - immutable record of a distribution event
 *
 * Preserves complete information about:
 * - What was allocated
 * - To whom
 * - Using what method/filters/weights
 * - When (timestamp + causality)
 */
export declare const AllocationRecordSchema: z.ZodObject<{
    id: z.ZodString;
    timestamp: z.ZodNumber;
    providerId: z.ZodString;
    capacitySlotId: z.ZodString;
    allocations: z.ZodRecord<z.ZodString, z.ZodNumber>;
    distributionMethod: z.ZodString;
    filters: z.ZodOptional<z.ZodAny>;
    weights: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    tiers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodNumber>>>;
    itcStamp: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    timestamp?: number;
    itcStamp?: any;
    allocations?: Record<string, number>;
    filters?: any;
    weights?: Record<string, number>;
    distributionMethod?: string;
    providerId?: string;
    capacitySlotId?: string;
    tiers?: Record<string, Record<string, number>>;
}, {
    id?: string;
    timestamp?: number;
    itcStamp?: any;
    allocations?: Record<string, number>;
    filters?: any;
    weights?: Record<string, number>;
    distributionMethod?: string;
    providerId?: string;
    capacitySlotId?: string;
    tiers?: Record<string, Record<string, number>>;
}>;
export type AllocationRecord = z.infer<typeof AllocationRecordSchema>;
/**
 * Allocation result for multi-tier distribution
 */
export interface AllocationResult {
    total: number;
    byTier: Map<number, number>;
}
/**
 * Entity data structure with unified slot model
 * memberOf serves as the entity's types
 */
export declare const EntityDataSchema: z.ZodObject<{
    id: z.ZodString;
    slots: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        quantity: z.ZodNumber;
        resource_type: z.ZodOptional<z.ZodString>;
        unit: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        emoji: z.ZodOptional<z.ZodString>;
        min_allocation: z.ZodOptional<z.ZodNumber>;
        max_divisions: z.ZodOptional<z.ZodNumber>;
        priority: z.ZodOptional<z.ZodNumber>;
        allocationMethod: z.ZodOptional<z.ZodType<(context: any) => any, z.ZodTypeDef, (context: any) => any>>;
        distributionMethod: z.ZodOptional<z.ZodType<(value: any, targets: any[]) => Map<string, any>, z.ZodTypeDef, (value: any, targets: any[]) => Map<string, any>>>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        name?: string;
        emoji?: string;
        unit?: string;
        description?: string;
        resource_type?: string;
        quantity?: number;
        priority?: number;
        min_allocation?: number;
        max_divisions?: number;
        allocationMethod?: (context: any) => any;
        distributionMethod?: (value: any, targets: any[]) => Map<string, any>;
        metadata?: Record<string, any>;
    }, {
        id?: string;
        name?: string;
        emoji?: string;
        unit?: string;
        description?: string;
        resource_type?: string;
        quantity?: number;
        priority?: number;
        min_allocation?: number;
        max_divisions?: number;
        allocationMethod?: (context: any) => any;
        distributionMethod?: (value: any, targets: any[]) => Map<string, any>;
        metadata?: Record<string, any>;
    }>>>;
    memberOf: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    members: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    members?: string[];
    slots?: Record<string, {
        id?: string;
        name?: string;
        emoji?: string;
        unit?: string;
        description?: string;
        resource_type?: string;
        quantity?: number;
        priority?: number;
        min_allocation?: number;
        max_divisions?: number;
        allocationMethod?: (context: any) => any;
        distributionMethod?: (value: any, targets: any[]) => Map<string, any>;
        metadata?: Record<string, any>;
    }>;
    memberOf?: string[];
}, {
    id?: string;
    members?: string[];
    slots?: Record<string, {
        id?: string;
        name?: string;
        emoji?: string;
        unit?: string;
        description?: string;
        resource_type?: string;
        quantity?: number;
        priority?: number;
        min_allocation?: number;
        max_divisions?: number;
        allocationMethod?: (context: any) => any;
        distributionMethod?: (value: any, targets: any[]) => Map<string, any>;
        metadata?: Record<string, any>;
    }>;
    memberOf?: string[];
}>;
export declare const EntityCreateSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
}, {
    id?: string;
}>;
export type EntityData = z.infer<typeof EntityDataSchema>;
export type EntityCreate = z.infer<typeof EntityCreateSchema>;
export type EntityFilter = (entity: EntityInstance) => boolean;
export declare const QuantitySchema: z.ZodNumber;
export declare const PercentageSchema: z.ZodNumber;
export declare const AttributeMethodSchema: z.ZodObject<{
    kind: z.ZodLiteral<"method">;
    value: z.ZodFunction<z.ZodTuple<[z.ZodAny], z.ZodUnknown>, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    value?: (args_0: any, ...args: unknown[]) => any;
    kind?: "method";
}, {
    value?: (args_0: any, ...args: unknown[]) => any;
    kind?: "method";
}>;
export declare const AttributeValueSchema: z.ZodObject<{
    kind: z.ZodLiteral<"value">;
    value: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    value?: any;
    kind?: "value";
}, {
    value?: any;
    kind?: "value";
}>;
export declare const AttributeSchema: z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
    kind: z.ZodLiteral<"method">;
    value: z.ZodFunction<z.ZodTuple<[z.ZodAny], z.ZodUnknown>, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    value?: (args_0: any, ...args: unknown[]) => any;
    kind?: "method";
}, {
    value?: (args_0: any, ...args: unknown[]) => any;
    kind?: "method";
}>, z.ZodObject<{
    kind: z.ZodLiteral<"value">;
    value: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    value?: any;
    kind?: "value";
}, {
    value?: any;
    kind?: "value";
}>]>;
export declare const AllocationAttributesSchema: z.ZodObject<{
    members: z.ZodArray<z.ZodString, "many">;
    quantity: z.ZodNumber;
    location: z.ZodString;
    time: z.ZodString;
}, "strip", z.ZodTypeAny, {
    quantity?: number;
    members?: string[];
    time?: string;
    location?: string;
}, {
    quantity?: number;
    members?: string[];
    time?: string;
    location?: string;
}>;
export declare const AllocationSchema: z.ZodObject<{
    distribution: z.ZodString;
    attributes: z.ZodObject<{
        members: z.ZodArray<z.ZodString, "many">;
        quantity: z.ZodNumber;
        location: z.ZodString;
        time: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        quantity?: number;
        members?: string[];
        time?: string;
        location?: string;
    }, {
        quantity?: number;
        members?: string[];
        time?: string;
        location?: string;
    }>;
    entities: z.ZodArray<z.ZodAny, "many">;
}, "strip", z.ZodTypeAny, {
    attributes?: {
        quantity?: number;
        members?: string[];
        time?: string;
        location?: string;
    };
    distribution?: string;
    entities?: any[];
}, {
    attributes?: {
        quantity?: number;
        members?: string[];
        time?: string;
        location?: string;
    };
    distribution?: string;
    entities?: any[];
}>;
export declare const EntitySchema: z.ZodObject<{
    id: z.ZodString;
    types: z.ZodArray<z.ZodString, "many">;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodDiscriminatedUnion<"kind", [z.ZodObject<{
        kind: z.ZodLiteral<"method">;
        value: z.ZodFunction<z.ZodTuple<[z.ZodAny], z.ZodUnknown>, z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        value?: (args_0: any, ...args: unknown[]) => any;
        kind?: "method";
    }, {
        value?: (args_0: any, ...args: unknown[]) => any;
        kind?: "method";
    }>, z.ZodObject<{
        kind: z.ZodLiteral<"value">;
        value: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        value?: any;
        kind?: "value";
    }, {
        value?: any;
        kind?: "value";
    }>]>>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    attributes?: Record<string, {
        value?: (args_0: any, ...args: unknown[]) => any;
        kind?: "method";
    } | {
        value?: any;
        kind?: "value";
    }>;
    types?: string[];
}, {
    id?: string;
    attributes?: Record<string, {
        value?: (args_0: any, ...args: unknown[]) => any;
        kind?: "method";
    } | {
        value?: any;
        kind?: "value";
    }>;
    types?: string[];
}>;
export type Id = z.infer<typeof IdSchema>;
export type Type = z.infer<typeof TypeSchema>;
export type Quantity = z.infer<typeof QuantitySchema>;
export type Attribute = z.infer<typeof AttributeSchema>;
export type AttributeMethod = z.infer<typeof AttributeMethodSchema>;
export type AttributeValue = z.infer<typeof AttributeValueSchema>;
export type AllocationAttributes = z.infer<typeof AllocationAttributesSchema>;
export type Allocation = z.infer<typeof AllocationSchema>;
export type Entity = z.infer<typeof EntitySchema>;
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
export declare class EntityInstance {
    readonly id: Id;
    private _data;
    private static _registry;
    private constructor();
    static create(params: EntityCreate): EntityInstance;
    static fromData(data: EntityData): EntityInstance;
    static get(id: Id): EntityInstance | undefined;
    static getAll(): EntityInstance[];
    static query(filter: EntityFilter): EntityInstance[];
    static clearRegistry(): void;
    getTypes(): Id[];
    isMemberOf(entityId: Id): boolean;
    hasType(typeId: Id): boolean;
    addSlot(slot: Omit<Slot, 'id'> & {
        id?: string;
    }): this;
    getSlot(slotId: string): Slot | undefined;
    getSlots(): Record<string, Slot>;
    getSlotsArray(): Slot[];
    removeSlot(slotId: string): this;
    updateSlot(slotId: string, updates: Partial<Slot>): this;
    /**
     * Get all capacity slots (positive quantities)
     */
    getCapacities(): Slot[];
    /**
     * Get all need slots (negative quantities)
     */
    getNeeds(): Slot[];
    /**
     * Get slots by resource type
     */
    getSlotsByType(resourceType: string): Slot[];
    /**
     * Get slots by name
     */
    getSlotsByName(name: string): Slot[];
    addMemberOf(entityId: Id): this;
    removeMemberOf(entityId: Id): this;
    addMember(entityId: Id): this;
    removeMember(entityId: Id): this;
    getMemberOfIds(): Id[];
    getMemberOf(): EntityInstance[];
    getMemberIds(): Id[];
    getMembers(): EntityInstance[];
    /**
     * Aggregate slot quantities UP through memberships
     * Returns NET quantity (sum of signed values)
     *
     * Example: If parents have +20, +15, -10 for 'Programming'
     * Result: +25 (net surplus of 25)
     */
    aggregateSlotUp(slotNameOrType: string, byType?: boolean): number;
    /**
     * Aggregate slot quantities DOWN through members
     * Returns NET quantity (sum of signed values)
     *
     * Example: If members have +20, +15, -10 for 'Programming'
     * Result: +25 (net surplus of 25)
     */
    aggregateSlotDown(slotNameOrType: string, byType?: boolean, filter?: EntityFilter): number;
    /**
     * Aggregate only capacities (positive quantities) DOWN through members
     */
    aggregateCapacityDown(slotNameOrType: string, byType?: boolean, filter?: EntityFilter): number;
    /**
     * Aggregate only needs (negative quantities) DOWN through members
     * Returns absolute value (positive number representing total need)
     */
    aggregateNeedDown(slotNameOrType: string, byType?: boolean, filter?: EntityFilter): number;
    /**
     * Calculate proportion of slot quantity relative to a set of entities
     * Uses NET quantities (signed sum)
     */
    proportionOfSlot(slotNameOrType: string, entities: EntityInstance[], byType?: boolean, filter?: EntityFilter): number;
    /**
     * Calculate proportion relative to a specific type
     */
    proportionOfSlotByType(slotNameOrType: string, typeId: Id, byType?: boolean): number;
    /**
     * Get summary of slot proportions across types
     */
    getSlotProportionSummary(slotNameOrType: string, byType?: boolean): Map<Type, number>;
    private _allocationHistory;
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
    distributeSlot(slotId: string, config?: DistributionConfig): Map<Id, number>;
    /**
     * Default weighting function: proportional to need magnitude
     *
     * Weights recipients by the absolute magnitude of their matching needs.
     * This ensures those with greater needs receive proportionally more.
     */
    private defaultWeightFunction;
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
    distributeMultiTier(slotId: string, tiers: TierConfig[]): Map<Id, AllocationResult>;
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
    distributeAndRecord(slotId: string, config?: DistributionConfig & {
        itcStamp?: any;
    }): AllocationRecord;
    /**
     * Query allocation history
     *
     * @param filter - Optional filter predicate
     * @returns Array of allocation records
     */
    getAllocationHistory(filter?: (record: AllocationRecord) => boolean): AllocationRecord[];
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
    distributeSatisfactionWeighted(slotId: string, recognitionSlotName?: string, reputationSlotName?: string): Map<Id, number>;
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
    updateSlotWithDampening(slotId: string, newQuantity: number): this;
    /**
     * Get dampening factor for a slot
     *
     * @param slotId - Slot ID
     * @returns Dampening factor (0.0-1.0), or 1.0 if no dampening
     */
    getDampeningFactor(slotId: string): number;
    /**
     * Check if oscillation is detected for a slot
     *
     * @param slotId - Slot ID
     * @returns true if oscillation detected in recent history
     */
    isOscillating(slotId: string): boolean;
    toData(): EntityData;
    toJSON(): EntityData;
}
//# sourceMappingURL=commons.d.ts.map