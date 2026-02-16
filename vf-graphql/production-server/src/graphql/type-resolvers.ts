/**
 * GraphQL Type Resolvers
 * 
 * Implements complex type resolvers for:
 * - Measure (quantity + unit)
 * - Duration (numeric duration + time unit)
 * - Union types (EventOrCommitment, AccountingScope, etc.)
 */

import { db } from '../db'
import { units, economicEvents, commitments, agents } from '../db/schema'
import { eq } from 'drizzle-orm'

/**
 * Measure type resolver
 * Resolves the hasUnit field to actual Unit object
 */
export const MeasureResolver = {
  hasUnit: async (parent: any) => {
    if (!parent.hasUnit) return null
    
    const [unit] = await db
      .select()
      .from(units)
      .where(eq(units.id, parent.hasUnit))
      .limit(1)
    
    return unit || null
  },
}

/**
 * Duration type resolver
 * No additional resolution needed - all fields are scalars
 */
export const DurationResolver = {
  // numericDuration and unitType are both scalars, no resolution needed
}

/**
 * EventOrCommitment union type resolver
 * Used in Satisfaction.satisfiedBy
 */
export const EventOrCommitmentResolver = {
  __resolveType(obj: any) {
    // If __typename is already set, use it
    if (obj.__typename) {
      return obj.__typename
    }
    
    // If satisfiedByType is set (from Satisfaction table), use it
    if (obj.satisfiedByType) {
      return obj.satisfiedByType
    }
    
    // Heuristic: Commitments have 'due' and 'created' fields
    // Events have 'triggeredBy' or different time fields
    if ('due' in obj || 'created' in obj) {
      return 'Commitment'
    }
    
    return 'EconomicEvent'
  },
}

/**
 * AccountingScope union type resolver
 * Used in various places for scoping
 */
export const AccountingScopeResolver = {
  __resolveType(obj: any) {
    if (obj.__typename) {
      return obj.__typename
    }
    
    // Check agentType discriminator
    if (obj.agentType) {
      return obj.agentType // 'Person' or 'Organization'
    }
    
    // Heuristic: Organizations have classifiedAs field
    if ('classifiedAs' in obj && obj.classifiedAs) {
      return 'Organization'
    }
    
    return 'Person'
  },
}

/**
 * TrackTraceItem union type resolver
 * Can be Process | EconomicResource | EconomicEvent
 */
export const TrackTraceItemResolver = {
  __resolveType(obj: any) {
    if (obj.__typename) {
      return obj.__typename
    }
    
    // Heuristic: Process has basedOn or finished fields
    if ('basedOnId' in obj || 'finished' in obj) {
      return 'Process'
    }
    
    // Resources have 'conformsTo' or 'accountingQuantity'
    if ('conformsToId' in obj || 'accountingQuantity' in obj || 'lot' in obj) {
      return 'EconomicResource'
    }
    
    return 'EconomicEvent'
  },
}

/**
 * ProductionFlowItem union type resolver
 * Can be Process | EconomicResource
 */
export const ProductionFlowItemResolver = {
  __resolveType(obj: any) {
    if (obj.__typename) {
      return obj.__typename
    }
    
    // Heuristic: Process has basedOn or finished fields
    if ('basedOnId' in obj || 'finished' in obj) {
      return 'Process'
    }
    
    return 'EconomicResource'
  },
}

/**
 * Agent interface resolver
 * Resolves to Person or Organization based on agentType
 */
export const AgentResolver = {
  __resolveType(obj: any) {
    if (obj.__typename) {
      return obj.__typename
    }
    
    if (obj.agentType) {
      return obj.agentType
    }
    
    // Heuristic: Organizations have classifiedAs
    if ('classifiedAs' in obj && obj.classifiedAs) {
      return 'Organization'
    }
    
    return 'Person'
  },
}

/**
 * All type resolvers
 */
export const typeResolvers = {
  Measure: MeasureResolver,
  Duration: DurationResolver,
  EventOrCommitment: EventOrCommitmentResolver,
  AccountingScope: AccountingScopeResolver,
  TrackTraceItem: TrackTraceItemResolver,
  ProductionFlowItem: ProductionFlowItemResolver,
  Agent: AgentResolver,
}
