// capacities can have needs? - expressing it like this leads to nice formulation of need priority!

// Recognition Aggregation Summation

// Observer Entity Attribute Value

// Aggregatrion of needs/capaciities fetermination of share of total capacity/need of type! 

// Kinds of attribution-values

// Entity - Attribute - Value
// attribute: uses
// attribute: capacities
// attribute: needs

// Where a quantum of a kind of a use is an entity
// Use-Assertion
// - // Quantity of uses of this kind
// Use-Condition-Assertion
// - // These can be used for needs, to understand whether conditions are met and if they are satisfied
// Use-Effect-Assertion
// - // These are generally useful for understanding state of the environment

// can lead to interesting derivations
// total uses of all kinds
// total uses of this kind
// applicable use-conditions
// triggered use-effects
// share of total uses of this kind

/**
 * Aggregation Along Edges
 * 
 * Extracted from docs/commons.tex Section 6: "Aggregation Along Edges"
 * 
 * This module defines upward and downward aggregation operations for potentials
 * along the membership graph structure. These aggregations enable computing
 * total capacity/need at different levels of the type hierarchy.
 */

/**
 * Entity identifier type
 */
export type EntityId = string;

/**
 * Type identifier (can be an entity or abstract type)
 */
export type TypeId = string;

/**
 * Potential - a signed magnitude representing capacity (positive) or need (negative)
 * 
 * From Definition 8 in commons.tex:
 * A potential is a 4-tuple p = (τ, q, C, M) where:
 * - τ ∈ 𝕋 is the type
 * - q ∈ ℝ± is the signed magnitude
 * - C is a constraint predicate
 * - M is metadata
 */
export interface Potential {
    /** Type identifier */
    type: TypeId;

    /** Signed magnitude: positive = source/capacity, negative = sink/need */
    magnitude: number;

    /** Constraint predicate (optional) */
    constraint?: (entity: EntityId) => number;

    /** Metadata for space-time matching and other properties */
    metadata?: Record<string, unknown>;
}

/**
 * Entity with attributes following the Entity-Attribute-Value (EAV) model
 */
export interface Entity {
    /** Unique entity identifier */
    id: EntityId;

    /** 
     * memberOf attribute - creates relational structure
     * Set of categories this entity belongs to
     */
    memberOf?: Set<EntityId>;

    /**
     * potentials attribute - stores flow gradients
     * List of potentials representing capacities (sources) and needs (sinks)
     */
    potentials?: Potential[];

    /** Other arbitrary attributes */
    [attribute: string]: unknown;
}

/**
 * Upward Aggregation
 * 
 * From Definition 11 in commons.tex:
 * For entity e and type τ:
 * 
 *   Agg↑(e, τ) = Σ_{c ∈ Categories(e)} Σ_{p ∈ P(c), τ(p) = τ} q(p)
 * 
 * Aggregates potentials of a given type from all categories (parents) of an entity.
 * This computes the total capacity/need inherited from parent categories.
 * 
 * @param entity - The entity to aggregate upward from
 * @param type - The type to filter potentials by
 * @param getEntity - Function to retrieve entity by ID
 * @returns Sum of magnitudes for matching potentials in parent categories
 */
export function upwardAggregation(
    entity: Entity,
    type: TypeId,
    getEntity: (id: EntityId) => Entity | undefined
): number {
    if (!entity.memberOf || entity.memberOf.size === 0) {
        return 0;
    }

    let sum = 0;

    // For each category (parent) this entity belongs to
    for (const categoryId of entity.memberOf) {
        const category = getEntity(categoryId);
        if (!category?.potentials) continue;

        // Sum magnitudes of potentials matching the type
        for (const potential of category.potentials) {
            if (potential.type === type) {
                sum += potential.magnitude;
            }
        }
    }

    return sum;
}

/**
 * Downward Aggregation
 * 
 * From Definition 12 in commons.tex:
 * For category c and type τ:
 * 
 *   Agg↓(c, τ) = Σ_{e ∈ Participants(c)} Σ_{p ∈ P(e), τ(p) = τ} q(p)
 * 
 * Aggregates potentials of a given type from all participants (children) of a category.
 * This computes the total capacity/need of all entities that are members of this category.
 * 
 * @param category - The category to aggregate downward from
 * @param type - The type to filter potentials by
 * @param getAllEntities - Function to retrieve all entities
 * @returns Sum of magnitudes for matching potentials in child entities
 */
export function downwardAggregation(
    category: Entity,
    type: TypeId,
    getAllEntities: () => Entity[]
): number {
    let sum = 0;

    // Find all entities that have this category in their memberOf
    const participants = getAllEntities().filter(entity =>
        entity.memberOf?.has(category.id)
    );

    // Sum magnitudes of potentials matching the type
    for (const participant of participants) {
        if (!participant.potentials) continue;

        for (const potential of participant.potentials) {
            if (potential.type === type) {
                sum += potential.magnitude;
            }
        }
    }

    return sum;
}

/**
 * Aggregation Duality
 * 
 * From Proposition 6 in commons.tex:
 * Aggregation preserves the sign structure:
 * - Agg↑(n, τ) ∈ ℝ± (can be positive, negative, or zero)
 * - Agg↓(c, τ) ∈ ℝ± (can be positive, negative, or zero)
 * 
 * Both aggregations are sums of signed quantities q(p) ∈ ℝ±.
 * Sums of signed reals remain in ℝ±.
 */

/**
 * Multi-Provider Aggregation
 * 
 * From Definition 13 in commons.tex (Distance from Need and Multi-Provider Aggregation):
 * For recipient r and type τ, let S_r^τ be the set of all sources providing type τ.
 * 
 * Total received allocation:
 *   A_r^τ = Σ_{s ∈ S_r^τ} a_{sr}^τ
 * 
 * This aggregates allocations from all providers.
 * 
 * @param recipientId - The recipient entity ID
 * @param type - The type being allocated
 * @param allocations - Map of (sourceId, recipientId, type) -> allocated amount
 * @param sources - Set of source entity IDs providing this type
 * @returns Total allocation received from all sources
 */
export function totalReceivedAllocation(
    recipientId: EntityId,
    type: TypeId,
    allocations: Map<string, number>, // key: `${sourceId}:${recipientId}:${type}`
    sources: Set<EntityId>
): number {
    let total = 0;

    for (const sourceId of sources) {
        const key = `${sourceId}:${recipientId}:${type}`;
        total += allocations.get(key) ?? 0;
    }

    return total;
}

/**
 * Distance from Need
 * 
 * From Definition 13 in commons.tex:
 * 
 *   Δ_r^τ = N_r^τ - A_r^τ
 * 
 * where:
 * - N_r^τ = |q_r| is the declared need of recipient r for type τ
 * - A_r^τ is the total allocated to r (sum across all providers)
 * - Δ_r^τ > 0 indicates under-allocation (undershoot)
 * - Δ_r^τ < 0 indicates over-allocation (overshoot)
 * - Δ_r^τ = 0 indicates perfect satisfaction (equilibrium)
 * 
 * This distance acts as a potential difference, analogous to voltage in electrical
 * systems or pressure difference in fluid dynamics.
 * 
 * @param declaredNeed - The recipient's declared need (absolute value)
 * @param totalAllocated - Total allocation received from all providers
 * @returns Distance from satisfaction (positive = undersatisfied, negative = oversatisfied)
 */
export function distanceFromNeed(
    declaredNeed: number,
    totalAllocated: number
): number {
    return declaredNeed - totalAllocated;
}

// ============================================================================
// FILTERED AGGREGATIONS - Enable proportion calculations with custom filters
// ============================================================================

/**
 * Filter predicate for entities or potentials
 */
export type EntityFilter = (entity: Entity) => boolean;
export type PotentialFilter = (entity: Entity, potential: Potential) => boolean;

/**
 * Filtered Upward Aggregation
 * 
 * Extension of upward aggregation with filtering capability.
 * Aggregates potentials from parent categories that match both type and filter criteria.
 * 
 * Example: Get total capacity from parents that have satisfied needs
 * 
 * @param entity - The entity to aggregate upward from
 * @param type - The type to filter potentials by
 * @param getEntity - Function to retrieve entity by ID
 * @param filter - Optional filter to apply to potentials (entity, potential) => boolean
 * @returns Sum of magnitudes for matching and filtered potentials in parent categories
 */
export function filteredUpwardAggregation(
    entity: Entity,
    type: TypeId,
    getEntity: (id: EntityId) => Entity | undefined,
    filter?: PotentialFilter
): number {
    if (!entity.memberOf || entity.memberOf.size === 0) {
        return 0;
    }

    let sum = 0;

    for (const categoryId of entity.memberOf) {
        const category = getEntity(categoryId);
        if (!category?.potentials) continue;

        for (const potential of category.potentials) {
            if (potential.type === type) {
                // Apply filter if provided
                if (!filter || filter(category, potential)) {
                    sum += potential.magnitude;
                }
            }
        }
    }

    return sum;
}

/**
 * Filtered Downward Aggregation
 * 
 * Extension of downward aggregation with filtering capability.
 * Aggregates potentials from child participants that match both type and filter criteria.
 * 
 * Example: Get total unused capacity from all children
 * 
 * @param category - The category to aggregate downward from
 * @param type - The type to filter potentials by
 * @param getAllEntities - Function to retrieve all entities
 * @param filter - Optional filter to apply to potentials (entity, potential) => boolean
 * @returns Sum of magnitudes for matching and filtered potentials in child entities
 */
export function filteredDownwardAggregation(
    category: Entity,
    type: TypeId,
    getAllEntities: () => Entity[],
    filter?: PotentialFilter
): number {
    let sum = 0;

    const participants = getAllEntities().filter(entity =>
        entity.memberOf?.has(category.id)
    );

    for (const participant of participants) {
        if (!participant.potentials) continue;

        for (const potential of participant.potentials) {
            if (potential.type === type) {
                // Apply filter if provided
                if (!filter || filter(participant, potential)) {
                    sum += potential.magnitude;
                }
            }
        }
    }

    return sum;
}

/**
 * Compute proportion with safe division
 * 
 * @param numerator - The numerator value
 * @param denominator - The denominator value
 * @returns Proportion as a number between 0 and 1 (multiply by 100 for percentage)
 */
export function computeProportion(
    numerator: number,
    denominator: number
): number {
    if (denominator === 0) {
        return 0;
    }
    return numerator / denominator;
}

/**
 * Proportion of Total (Upward)
 * 
 * Computes what proportion a value is of the total in parent categories.
 * Both numerator and denominator can be filtered independently.
 * 
 * Example: "What % am I of the total capacity that has satisfied needs?"
 * 
 * @param entity - The entity to compute proportion for
 * @param type - The type to filter by
 * @param getEntity - Function to retrieve entity by ID
 * @param numeratorFilter - Filter for the numerator (specific subset)
 * @param denominatorFilter - Filter for the denominator (total subset)
 * @returns Proportion between 0 and 1
 */
export function proportionOfTotalUpward(
    entity: Entity,
    type: TypeId,
    getEntity: (id: EntityId) => Entity | undefined,
    numeratorFilter?: PotentialFilter,
    denominatorFilter?: PotentialFilter
): number {
    const numerator = filteredUpwardAggregation(entity, type, getEntity, numeratorFilter);
    const denominator = filteredUpwardAggregation(entity, type, getEntity, denominatorFilter);
    return computeProportion(numerator, denominator);
}

/**
 * Proportion of Total (Downward)
 * 
 * Computes what proportion a value is of the total in child participants.
 * Both numerator and denominator can be filtered independently.
 * 
 * Example: "What % of total unused capacity does this category represent?"
 * 
 * @param category - The category to compute proportion for
 * @param type - The type to filter by
 * @param getAllEntities - Function to retrieve all entities
 * @param numeratorFilter - Filter for the numerator (specific subset)
 * @param denominatorFilter - Filter for the denominator (total subset)
 * @returns Proportion between 0 and 1
 */
export function proportionOfTotalDownward(
    category: Entity,
    type: TypeId,
    getAllEntities: () => Entity[],
    numeratorFilter?: PotentialFilter,
    denominatorFilter?: PotentialFilter
): number {
    const numerator = filteredDownwardAggregation(category, type, getAllEntities, numeratorFilter);
    const denominator = filteredDownwardAggregation(category, type, getAllEntities, denominatorFilter);
    return computeProportion(numerator, denominator);
}

/**
 * Common filter predicates for use with filtered aggregations
 */
export const Filters = {
    /**
     * Filter for sources (positive magnitude = capacity)
     */
    isSource: (_entity: Entity, potential: Potential) => potential.magnitude > 0,

    /**
     * Filter for sinks (negative magnitude = need)
     */
    isSink: (_entity: Entity, potential: Potential) => potential.magnitude < 0,

    /**
     * Filter for satisfied needs (requires allocation data)
     */
    hasSatisfiedNeeds: (allocations: Map<string, number>, sources: Set<EntityId>) =>
        (entity: Entity, potential: Potential) => {
            if (potential.magnitude >= 0) return false;
            const totalAllocated = totalReceivedAllocation(entity.id, potential.type, allocations, sources);
            const distance = distanceFromNeed(Math.abs(potential.magnitude), totalAllocated);
            return distance <= 0;
        },

    /**
     * Filter for unsatisfied needs (requires allocation data)
     */
    hasUnsatisfiedNeeds: (allocations: Map<string, number>, sources: Set<EntityId>) =>
        (entity: Entity, potential: Potential) => {
            if (potential.magnitude >= 0) return false;
            const totalAllocated = totalReceivedAllocation(entity.id, potential.type, allocations, sources);
            const distance = distanceFromNeed(Math.abs(potential.magnitude), totalAllocated);
            return distance > 0;
        },

    /**
     * Filter for unused capacity (requires allocation data)
     */
    hasUnusedCapacity: (allocations: Map<string, number>, recipients: Set<EntityId>) =>
        (entity: Entity, potential: Potential) => {
            if (potential.magnitude <= 0) return false;
            let totalAllocated = 0;
            for (const recipientId of recipients) {
                const key = `${entity.id}:${recipientId}:${potential.type}`;
                totalAllocated += allocations.get(key) ?? 0;
            }
            return totalAllocated < potential.magnitude;
        },

    /**
     * Filter for fully utilized capacity (requires allocation data)
     */
    hasFullyUtilizedCapacity: (allocations: Map<string, number>, recipients: Set<EntityId>) =>
        (entity: Entity, potential: Potential) => {
            if (potential.magnitude <= 0) return false;
            let totalAllocated = 0;
            for (const recipientId of recipients) {
                const key = `${entity.id}:${recipientId}:${potential.type}`;
                totalAllocated += allocations.get(key) ?? 0;
            }
            return totalAllocated >= potential.magnitude;
        },

    /**
     * Combine multiple filters with AND logic
     */
    and: (...filters: PotentialFilter[]): PotentialFilter =>
        (entity: Entity, potential: Potential) =>
            filters.every(f => f(entity, potential)),

    /**
     * Combine multiple filters with OR logic
     */
    or: (...filters: PotentialFilter[]): PotentialFilter =>
        (entity: Entity, potential: Potential) =>
            filters.some(f => f(entity, potential)),

    /**
     * Negate a filter
     */
    not: (filter: PotentialFilter): PotentialFilter =>
        (entity: Entity, potential: Potential) =>
            !filter(entity, potential),
};