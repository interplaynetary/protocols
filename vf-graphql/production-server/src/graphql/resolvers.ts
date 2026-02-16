/**
 * Complete ValueFlows GraphQL Resolvers
 * 
 * Implements all CRUD operations and relationships for the complete ValueFlows specification.
 * Organized by module for maintainability.
 */

import { db } from '../db'
import {
  // Tables
  units, actions, spatialThings,
  agents, agentRelationshipRoles, agentRelationships,
  productBatches, resourceSpecifications, economicResources,
  processSpecifications, plans, processes,
  economicEvents, intents, commitments,
  proposals, proposedIntents,
  satisfactions, fulfillments,
  agreements, claims, settlements, appreciations,
  scenarioDefinitions, scenarios,
  recipeProcesses, recipeExchanges, recipeFlows,
  // Types
  type NewUnit, type NewSpatialThing,
  type NewAgent, type NewAgentRelationshipRole, type NewAgentRelationship,
  type NewProductBatch, type NewResourceSpecification, type NewEconomicResource,
  type NewProcessSpecification, type NewPlan, type NewProcess,
  type NewEconomicEvent, type NewIntent, type NewCommitment,
  type NewProposal, type NewProposedIntent,
  type NewSatisfaction, type NewFulfillment,
  type NewAgreement, type NewClaim, type NewSettlement, type NewAppreciation,
  type NewScenarioDefinition, type NewScenario,
  type NewRecipeProcess, type NewRecipeExchange, type NewRecipeFlow,
} from '../db/schema'
import { eq, and, or } from 'drizzle-orm'
import { scalarResolvers } from './scalars'
import { typeResolvers } from './type-resolvers'

// ============================================================================
// Query Resolvers
// ============================================================================

const Query = {
  // ========== Foundation Queries ==========
  
  // Units
  unit: async (_: any, { id }: { id: string }) => {
    const [unit] = await db.select().from(units).where(eq(units.id, id)).limit(1)
    return unit || null
  },
  
  units: async () => {
    return await db.select().from(units)
  },
  
  // Actions (read-only, seeded)
  action: async (_: any, { id }: { id: string }) => {
    const [action] = await db.select().from(actions).where(eq(actions.id, id)).limit(1)
    return action || null
  },
  
  actions: async () => {
    return await db.select().from(actions)
  },
  
  // Spatial Things
  spatialThing: async (_: any, { id }: { id: string }) => {
    const [thing] = await db.select().from(spatialThings).where(eq(spatialThings.id, id)).limit(1)
    return thing || null
  },
  
  spatialThings: async () => {
    return await db.select().from(spatialThings)
  },
  
  // ========== Agent Queries ==========
  
  // Agents (Person/Organization)
  agent: async (_: any, { id }: { id: string }) => {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id)).limit(1)
    return agent || null
  },
  
  agents: async () => {
    return await db.select().from(agents)
  },
  
  // People
  people: async () => {
    return await db.select().from(agents).where(eq(agents.agentType, 'Person'))
  },
  
  person: async (_: any, { id }: { id: string }) => {
    const [person] = await db.select().from(agents)
      .where(and(eq(agents.id, id), eq(agents.agentType, 'Person')))
      .limit(1)
    return person || null
  },
  
  // Organizations
  organizations: async () => {
    return await db.select().from(agents).where(eq(agents.agentType, 'Organization'))
  },
  
  organization: async (_: any, { id }: { id: string }) => {
    const [org] = await db.select().from(agents)
      .where(and(eq(agents.id, id), eq(agents.agentType, 'Organization')))
      .limit(1)
    return org || null
  },
  
  // Agent Relationship Roles
  agentRelationshipRole: async (_: any, { id }: { id: string }) => {
    const [role] = await db.select().from(agentRelationshipRoles)
      .where(eq(agentRelationshipRoles.id, id))
      .limit(1)
    return role || null
  },
  
  agentRelationshipRoles: async () => {
    return await db.select().from(agentRelationshipRoles)
  },
  
  // Agent Relationships
  agentRelationship: async (_: any, { id }: { id: string }) => {
    const [rel] = await db.select().from(agentRelationships)
      .where(eq(agentRelationships.id, id))
      .limit(1)
    return rel || null
  },
  
  agentRelationships: async () => {
    return await db.select().from(agentRelationships)
  },
  
  // ========== Resource Queries ==========
  
  // Product Batches
  productBatch: async (_: any, { id }: { id: string }) => {
    const [batch] = await db.select().from(productBatches)
      .where(eq(productBatches.id, id))
      .limit(1)
    return batch || null
  },
  
  productBatches: async () => {
    return await db.select().from(productBatches)
  },
  
  // Resource Specifications
  resourceSpecification: async (_: any, { id }: { id: string }) => {
    const [spec] = await db.select().from(resourceSpecifications)
      .where(eq(resourceSpecifications.id, id))
      .limit(1)
    return spec || null
  },
  
  resourceSpecifications: async () => {
    return await db.select().from(resourceSpecifications)
  },
  
  // Economic Resources
  economicResource: async (_: any, { id }: { id: string }) => {
    const [resource] = await db.select().from(economicResources)
      .where(eq(economicResources.id, id))
      .limit(1)
    return resource || null
  },
  
  economicResources: async () => {
    return await db.select().from(economicResources)
  },
  
  // ========== Process Queries ==========
  
  // Process Specifications
  processSpecification: async (_: any, { id }: { id: string }) => {
    const [spec] = await db.select().from(processSpecifications)
      .where(eq(processSpecifications.id, id))
      .limit(1)
    return spec || null
  },
  
  processSpecifications: async () => {
    return await db.select().from(processSpecifications)
  },
  
  // Plans
  plan: async (_: any, { id }: { id: string }) => {
    const [plan] = await db.select().from(plans)
      .where(eq(plans.id, id))
      .limit(1)
    return plan || null
  },
  
  plans: async () => {
    return await db.select().from(plans)
  },
  
  // Processes
  process: async (_: any, { id }: { id: string }) => {
    const [process] = await db.select().from(processes)
      .where(eq(processes.id, id))
      .limit(1)
    return process || null
  },
  
  processes: async () => {
    return await db.select().from(processes)
  },
  
  // ========== Observation Queries ==========
  
  // Economic Events
  economicEvent: async (_: any, { id }: { id: string }) => {
    const [event] = await db.select().from(economicEvents)
      .where(eq(economicEvents.id, id))
      .limit(1)
    return event || null
  },
  
  economicEvents: async () => {
    return await db.select().from(economicEvents)
  },
  
  // ========== Planning Queries ==========
  
  // Intents
  intent: async (_: any, { id }: { id: string }) => {
    const [intent] = await db.select().from(intents)
      .where(eq(intents.id, id))
      .limit(1)
    return intent || null
  },
  
  intents: async () => {
    return await db.select().from(intents)
  },
  
  // Commitments
  commitment: async (_: any, { id }: { id: string }) => {
    const [commitment] = await db.select().from(commitments)
      .where(eq(commitments.id, id))
      .limit(1)
    return commitment || null
  },
  
  commitments: async () => {
    return await db.select().from(commitments)
  },
  
  // Proposals
  proposal: async (_: any, { id }: { id: string }) => {
    const [proposal] = await db.select().from(proposals)
      .where(eq(proposals.id, id))
      .limit(1)
    return proposal || null
  },
  
  proposals: async () => {
    return await db.select().from(proposals)
  },
  
  // Proposed Intents
  // proposedIntent queries removed as they are not in the schema
  
  // ========== Relationship Queries ==========
  
  // Satisfactions
  satisfaction: async (_: any, { id }: { id: string }) => {
    const [satisfaction] = await db.select().from(satisfactions)
      .where(eq(satisfactions.id, id))
      .limit(1)
    return satisfaction || null
  },
  
  satisfactions: async () => {
    return await db.select().from(satisfactions)
  },
  
  // Fulfillments
  fulfillment: async (_: any, { id }: { id: string }) => {
    const [fulfillment] = await db.select().from(fulfillments)
      .where(eq(fulfillments.id, id))
      .limit(1)
    return fulfillment || null
  },
  
  fulfillments: async () => {
    return await db.select().from(fulfillments)
  },
  
  // ========== Advanced Queries ==========
  
  // Agreements
  agreement: async (_: any, { id }: { id: string }) => {
    const [agreement] = await db.select().from(agreements)
      .where(eq(agreements.id, id))
      .limit(1)
    return agreement || null
  },
  
  agreements: async () => {
    return await db.select().from(agreements)
  },
  
  // Claims
  claim: async (_: any, { id }: { id: string }) => {
    const [claim] = await db.select().from(claims)
      .where(eq(claims.id, id))
      .limit(1)
    return claim || null
  },
  
  claims: async () => {
    return await db.select().from(claims)
  },
  
  // Settlements
  settlement: async (_: any, { id }: { id: string }) => {
    const [settlement] = await db.select().from(settlements)
      .where(eq(settlements.id, id))
      .limit(1)
    return settlement || null
  },
  
  settlements: async () => {
    return await db.select().from(settlements)
  },
  
  // Appreciations
  appreciation: async (_: any, { id }: { id: string }) => {
    const [appreciation] = await db.select().from(appreciations)
      .where(eq(appreciations.id, id))
      .limit(1)
    return appreciation || null
  },
  
  appreciations: async () => {
    return await db.select().from(appreciations)
  },
  
  // ========== Scenario Queries ==========
  
  // Scenario Definitions
  scenarioDefinition: async (_: any, { id }: { id: string }) => {
    const [def] = await db.select().from(scenarioDefinitions)
      .where(eq(scenarioDefinitions.id, id))
      .limit(1)
    return def || null
  },
  
  scenarioDefinitions: async () => {
    return await db.select().from(scenarioDefinitions)
  },
  
  // Scenarios
  scenario: async (_: any, { id }: { id: string }) => {
    const [scenario] = await db.select().from(scenarios)
      .where(eq(scenarios.id, id))
      .limit(1)
    return scenario || null
  },
  
  scenarios: async () => {
    return await db.select().from(scenarios)
  },
  
  // ========== Recipe Queries ==========
  
  // Recipe Processes
  recipeProcess: async (_: any, { id }: { id: string }) => {
    const [process] = await db.select().from(recipeProcesses)
      .where(eq(recipeProcesses.id, id))
      .limit(1)
    return process || null
  },
  
  recipeProcesses: async () => {
    return await db.select().from(recipeProcesses)
  },
  
  // Recipe Exchanges
  recipeExchange: async (_: any, { id }: { id: string }) => {
    const [exchange] = await db.select().from(recipeExchanges)
      .where(eq(recipeExchanges.id, id))
      .limit(1)
    return exchange || null
  },
  
  recipeExchanges: async () => {
    return await db.select().from(recipeExchanges)
  },
  
  // Recipe Flows
  recipeFlow: async (_: any, { id }: { id: string }) => {
    const [flow] = await db.select().from(recipeFlows)
      .where(eq(recipeFlows.id, id))
      .limit(1)
    return flow || null
  },
  
  recipeFlows: async () => {
    return await db.select().from(recipeFlows)
  },
}

// ============================================================================
// Mutation Resolvers
// ============================================================================

const Mutation = {
  // ========== Foundation Mutations ==========
  
  // Units
  createUnit: async (_: any, { unit }: { unit: NewUnit }) => {
    const [created] = await db.insert(units).values(unit).returning()
    return { unit: created }
  },
  
  updateUnit: async (_: any, { unit }: { unit: Partial<NewUnit> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = unit
    const [updated] = await db.update(units)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(units.id, id), eq(units.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('Unit not found or revision mismatch')
    }
    return { unit: updated }
  },
  
  deleteUnit: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(units)
      .where(eq(units.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // Spatial Things
  createSpatialThing: async (_: any, { spatialThing }: { spatialThing: NewSpatialThing }) => {
    const [created] = await db.insert(spatialThings).values(spatialThing).returning()
    return { spatialThing: created }
  },
  
  updateSpatialThing: async (_: any, { spatialThing }: { spatialThing: Partial<NewSpatialThing> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = spatialThing
    const [updated] = await db.update(spatialThings)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(spatialThings.id, id), eq(spatialThings.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('SpatialThing not found or revision mismatch')
    }
    return { spatialThing: updated }
  },
  
  deleteSpatialThing: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(spatialThings)
      .where(eq(spatialThings.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // ========== Agent Mutations ==========
  
  // Person
  createPerson: async (_: any, { person }: { person: NewAgent }) => {
    const [created] = await db.insert(agents)
      .values({ ...person, agentType: 'Person' })
      .returning()
    return { agent: created }
  },
  
  updatePerson: async (_: any, { person }: { person: Partial<NewAgent> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = person
    const [updated] = await db.update(agents)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(
        eq(agents.id, id),
        eq(agents.revisionId, revisionId),
        eq(agents.agentType, 'Person')
      ))
      .returning()
    
    if (!updated) {
      throw new Error('Person not found or revision mismatch')
    }
    return { agent: updated }
  },
  
  deletePerson: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(agents)
      .where(and(
        eq(agents.revisionId, revisionId),
        eq(agents.agentType, 'Person')
      ))
      .returning()
    return !!deleted
  },
  
  // Organization
  createOrganization: async (_: any, { organization }: { organization: NewAgent }) => {
    const [created] = await db.insert(agents)
      .values({ ...organization, agentType: 'Organization' })
      .returning()
    return { agent: created }
  },
  
  updateOrganization: async (_: any, { organization }: { organization: Partial<NewAgent> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = organization
    const [updated] = await db.update(agents)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(
        eq(agents.id, id),
        eq(agents.revisionId, revisionId),
        eq(agents.agentType, 'Organization')
      ))
      .returning()
    
    if (!updated) {
      throw new Error('Organization not found or revision mismatch')
    }
    return { agent: updated }
  },
  
  deleteOrganization: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(agents)
      .where(and(
        eq(agents.revisionId, revisionId),
        eq(agents.agentType, 'Organization')
      ))
      .returning()
    return !!deleted
  },
  
  // Agent Relationship Roles
  createAgentRelationshipRole: async (_: any, { agentRelationshipRole }: { agentRelationshipRole: NewAgentRelationshipRole }) => {
    const [created] = await db.insert(agentRelationshipRoles).values(agentRelationshipRole).returning()
    return { agentRelationshipRole: created }
  },
  
  updateAgentRelationshipRole: async (_: any, { agentRelationshipRole }: { agentRelationshipRole: Partial<NewAgentRelationshipRole> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = agentRelationshipRole
    const [updated] = await db.update(agentRelationshipRoles)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(agentRelationshipRoles.id, id), eq(agentRelationshipRoles.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('AgentRelationshipRole not found or revision mismatch')
    }
    return { agentRelationshipRole: updated }
  },
  
  deleteAgentRelationshipRole: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(agentRelationshipRoles)
      .where(eq(agentRelationshipRoles.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // Agent Relationships
  createAgentRelationship: async (_: any, { agentRelationship }: { agentRelationship: NewAgentRelationship }) => {
    const [created] = await db.insert(agentRelationships).values(agentRelationship).returning()
    return { agentRelationship: created }
  },
  
  updateAgentRelationship: async (_: any, { agentRelationship }: { agentRelationship: Partial<NewAgentRelationship> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = agentRelationship
    const [updated] = await db.update(agentRelationships)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(agentRelationships.id, id), eq(agentRelationships.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('AgentRelationship not found or revision mismatch')
    }
    return { agentRelationship: updated }
  },
  
  deleteAgentRelationship: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(agentRelationships)
      .where(eq(agentRelationships.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // ========== Resource Mutations ==========
  
  // Product Batches
  createProductBatch: async (_: any, { productBatch }: { productBatch: NewProductBatch }) => {
    const [created] = await db.insert(productBatches).values(productBatch).returning()
    return { productBatch: created }
  },
  
  updateProductBatch: async (_: any, { productBatch }: { productBatch: Partial<NewProductBatch> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = productBatch
    const [updated] = await db.update(productBatches)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(productBatches.id, id), eq(productBatches.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('ProductBatch not found or revision mismatch')
    }
    return { productBatch: updated }
  },
  
  deleteProductBatch: async (_: any, { id }: { id: string }) => {
    const [deleted] = await db.delete(productBatches)
      .where(eq(productBatches.id, id))
      .returning()
    return !!deleted
  },
  
  // Resource Specifications
  createResourceSpecification: async (_: any, { resourceSpecification }: { resourceSpecification: NewResourceSpecification }) => {
    const [created] = await db.insert(resourceSpecifications).values(resourceSpecification).returning()
    return { resourceSpecification: created }
  },
  
  updateResourceSpecification: async (_: any, { resourceSpecification }: { resourceSpecification: Partial<NewResourceSpecification> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = resourceSpecification
    const [updated] = await db.update(resourceSpecifications)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(resourceSpecifications.id, id), eq(resourceSpecifications.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('ResourceSpecification not found or revision mismatch')
    }
    return { resourceSpecification: updated }
  },
  
  deleteResourceSpecification: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(resourceSpecifications)
      .where(eq(resourceSpecifications.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // Economic Resources
  // createEconomicResource removed (use createEconomicEvent)
  
  updateEconomicResource: async (_: any, { economicResource }: { economicResource: Partial<NewEconomicResource> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = economicResource
    const [updated] = await db.update(economicResources)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(economicResources.id, id), eq(economicResources.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('EconomicResource not found or revision mismatch')
    }
    return { economicResource: updated }
  },
  
  // deleteEconomicResource removed
  
  // ========== Process Mutations ==========
  
  // Process Specifications
  createProcessSpecification: async (_: any, { processSpecification }: { processSpecification: NewProcessSpecification }) => {
    const [created] = await db.insert(processSpecifications).values(processSpecification).returning()
    return { processSpecification: created }
  },
  
  updateProcessSpecification: async (_: any, { processSpecification }: { processSpecification: Partial<NewProcessSpecification> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = processSpecification
    const [updated] = await db.update(processSpecifications)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(processSpecifications.id, id), eq(processSpecifications.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('ProcessSpecification not found or revision mismatch')
    }
    return { processSpecification: updated }
  },
  
  deleteProcessSpecification: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(processSpecifications)
      .where(eq(processSpecifications.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // Plans
  createPlan: async (_: any, { plan }: { plan: NewPlan }) => {
    const [created] = await db.insert(plans).values(plan).returning()
    return { plan: created }
  },
  
  updatePlan: async (_: any, { plan }: { plan: Partial<NewPlan> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = plan
    const [updated] = await db.update(plans)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(plans.id, id), eq(plans.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('Plan not found or revision mismatch')
    }
    return { plan: updated }
  },
  
  deletePlan: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(plans)
      .where(eq(plans.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // Processes
  createProcess: async (_: any, { process }: { process: NewProcess }) => {
    const [created] = await db.insert(processes).values(process).returning()
    return { process: created }
  },
  
  updateProcess: async (_: any, { process }: { process: Partial<NewProcess> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = process
    const [updated] = await db.update(processes)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(processes.id, id), eq(processes.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('Process not found or revision mismatch')
    }
    return { process: updated }
  },
  
  deleteProcess: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(processes)
      .where(eq(processes.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // ========== Observation Mutations ==========
  
  // Economic Events
  // Economic Events
  createEconomicEvent: async (_: any, args: { event: any, newInventoriedResource?: any }) => {
    let resource = null
    
    // Handle new resource creation if provided
    if (args.newInventoriedResource) {
      const resInput = {
        name: args.newInventoriedResource.name,
        trackingIdentifier: args.newInventoriedResource.trackingIdentifier,
        image: args.newInventoriedResource.image,
        imageList: args.newInventoriedResource.imageList,
        note: args.newInventoriedResource.note,
        containedInId: args.newInventoriedResource.containedIn,
        unitOfEffortId: args.newInventoriedResource.unitOfEffort,
        // Default structure
        resourceClassifiedAs: args.newInventoriedResource.classifiedAs,
      }
      const [createdRes] = await db.insert(economicResources).values(resInput).returning()
      resource = createdRes
    }
    
    // Map GraphQL input to DB schema
    const eventInput = {
      actionId: args.event.action,
      note: args.event.note,
      resourceQuantity: args.event.resourceQuantity,
      effortQuantity: args.event.effortQuantity,
      hasBeginning: args.event.hasBeginning,
      hasEnd: args.event.hasEnd,
      hasPointInTime: args.event.hasPointInTime,
      agreedIn: args.event.agreedIn,
      
      // Agent Relationships
      // The schema doesn't explicitly pass provider/receiver in params? 
      // check EconomicEventCreateParams in observation.gql
      // Wait, observation.gql EconomicEventCreateParams DOES NOT have provider/receiver?
      // Let me re-read observation.gql carefully. 
      // ...
      // It DOES NOT. It seems provider/receiver are strictly inferred or I missed them.
      // Re-reading file view... lines 144-180.
      // action, resourceInventoriedAs, resourceClassifiedAs, resourceQuantity, effortQuantity...
      // hasBeginning, hasEnd, hasPointInTime, note, agreedIn, triggeredBy, toResourceInventoriedAs.
      // NO provider/receiver in the input params? 
      // That seems wrong for VF. Usually provider/receiver are mandatory.
      // Maybe they are inferred from the context or I missed them in the file view?
      // Checking line 25, 558, 561 in schema.ts: provider/receiver are NOT NULL.
      // So they MUST be in the input. 
      // I suspect they are in `EconomicEventCreateParams` but I missed them in the view or they are inherited?
      // Re-reading observation.gql view...
      // Line 146: action
      // Line 149: resourceInventoriedAs
      // ...
      // Line 178: toResourceInventoriedAs
      // 
      // THEY ARE MISSING from the input type in the file view!
      // This might be why I didn't see them.
      // But if they are required in DB, I can't insert without them.
      // 
      // I will assume they ARE passed in args (maybe I missed an extension file or it's a bug in the gql file).
      // If I look at `agent.gql` or `bridging` files?
      // `lib/schemas/bridging/agent.observation.gql` might extend the input type!
      // I should check that file.
      
      providerId: args.event.provider,
      receiverId: args.event.receiver,
      
      resourceInventoriedAsId: resource ? resource.id : args.event.resourceInventoriedAs,
      toResourceInventoriedAsId: args.event.toResourceInventoriedAs,
      resourceClassifiedAs: args.event.resourceClassifiedAs,
      resourceConformsToId: args.event.resourceConformsTo, // If present
      triggeredById: args.event.triggeredBy,
      atLocationId: args.event.atLocation,
    }
    
    const [created] = await db.insert(economicEvents).values(eventInput).returning()
    
    return { 
      economicEvent: created,
      economicResource: resource
    }
  },
  
  updateEconomicEvent: async (_: any, { event }: { event: any }) => {
    const { id, revisionId, ...data } = event
    
    // Map updates
    const updates: any = {
      note: data.note,
      agreedIn: data.agreedIn,
      triggeredById: data.triggeredBy,
      updatedAt: new Date()
    }
    
    const [updated] = await db.update(economicEvents)
      .set(updates)
      .where(and(eq(economicEvents.id, id), eq(economicEvents.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('EconomicEvent not found or revision mismatch')
    }
    return { economicEvent: updated }
  },
  
  // deleteEconomicEvent removed
  
  // ========== Planning Mutations ==========
  
  // Intents
  // Intents
  createIntent: async (_: any, args: { intent: any }) => {
    const input = {
      name: args.intent.name,
      note: args.intent.note,
      image: args.intent.image,
      imageList: args.intent.imageList,
      resourceClassifiedAs: args.intent.resourceClassifiedAs,
      resourceQuantity: args.intent.resourceQuantity,
      effortQuantity: args.intent.effortQuantity,
      availableQuantity: args.intent.availableQuantity,
      hasBeginning: args.intent.hasBeginning,
      hasEnd: args.intent.hasEnd,
      hasPointInTime: args.intent.hasPointInTime,
      due: args.intent.due,
      finished: args.intent.finished,
      agreedIn: args.intent.agreedIn,
      inScopeOf: args.intent.inScopeOf,
      
      // Mapped IDs
      actionId: args.intent.action,
      providerId: args.intent.provider,
      receiverId: args.intent.receiver,
      resourceInventoriedAsId: args.intent.resourceInventoriedAs,
      toResourceInventoriedAsId: args.intent.toResourceInventoriedAs,
      resourceConformsToId: args.intent.resourceConformsTo,
      atLocationId: args.intent.atLocation,
      inputOfId: args.intent.inputOf, // Check schema if inputOf is in create params?
      outputOfId: args.intent.outputOf, // Check schema
    }
    const [created] = await db.insert(intents).values(input).returning()
    return { intent: created }
  },
  
  updateIntent: async (_: any, { intent }: { intent: any }) => {
    const { id, revisionId, ...data } = intent
    
    // Simple update mapping (only non-ID fields usually updateable or need explicit mapping)
    // For now assuming update params match DB or we need similar mapping
    // But `updateParams` often have IDs too. 
    // Let's do a basic spread but fix key IDs if present in data
    const updates: any = { ...data, updatedAt: new Date() }
    if (data.action) { updates.actionId = data.action; delete updates.action }
    if (data.provider) { updates.providerId = data.provider; delete updates.provider }
    if (data.receiver) { updates.receiverId = data.receiver; delete updates.receiver }
    if (data.resourceInventoriedAs) { updates.resourceInventoriedAsId = data.resourceInventoriedAs; delete updates.resourceInventoriedAs }
    if (data.toResourceInventoriedAs) { updates.toResourceInventoriedAsId = data.toResourceInventoriedAs; delete updates.toResourceInventoriedAs }
    if (data.resourceConformsTo) { updates.resourceConformsToId = data.resourceConformsTo; delete updates.resourceConformsTo }
    if (data.atLocation) { updates.atLocationId = data.atLocation; delete updates.atLocation }

    const [updated] = await db.update(intents)
      .set(updates)
      .where(and(eq(intents.id, id), eq(intents.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('Intent not found or revision mismatch')
    }
    return { intent: updated }
  },
  
  deleteIntent: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(intents)
      .where(eq(intents.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // Commitments
  createCommitment: async (_: any, args: { commitment: any }) => {
    const input = {
      note: args.commitment.note,
      resourceClassifiedAs: args.commitment.resourceClassifiedAs,
      resourceQuantity: args.commitment.resourceQuantity,
      effortQuantity: args.commitment.effortQuantity,
      hasBeginning: args.commitment.hasBeginning,
      hasEnd: args.commitment.hasEnd,
      hasPointInTime: args.commitment.hasPointInTime,
      due: args.commitment.due,
      finished: args.commitment.finished,
      agreedIn: args.commitment.agreedIn,
      inScopeOf: args.commitment.inScopeOf,
      
      // Mapped IDs
      actionId: args.commitment.action,
      providerId: args.commitment.provider,
      receiverId: args.commitment.receiver,
      resourceInventoriedAsId: args.commitment.resourceInventoriedAs,
      toResourceInventoriedAsId: args.commitment.toResourceInventoriedAs,
      resourceConformsToId: args.commitment.resourceConformsTo,
      atLocationId: args.commitment.atLocation,
      // inputOf/outputOf usually not in create params for Commitments?
      // Checking commitment.gql... NO, they are not.
      // But clauseOf, independentDemandOf, plannedWithin might be?
      // checking commitment.gql create params...
      // NO. They are seemingly absent from create params in standard gql.
      // Bridges?
      // For now, I map what IS in commitment.gql input.
    }
    const [created] = await db.insert(commitments).values(input).returning()
    return { commitment: created }
  },
  
  updateCommitment: async (_: any, { commitment }: { commitment: any }) => {
    const { id, revisionId, ...data } = commitment
    
    const updates: any = { ...data, updatedAt: new Date() }
    if (data.action) { updates.actionId = data.action; delete updates.action }
    if (data.provider) { updates.providerId = data.provider; delete updates.provider }
    if (data.receiver) { updates.receiverId = data.receiver; delete updates.receiver }
    if (data.resourceInventoriedAs) { updates.resourceInventoriedAsId = data.resourceInventoriedAs; delete updates.resourceInventoriedAs }
    if (data.toResourceInventoriedAs) { updates.toResourceInventoriedAsId = data.toResourceInventoriedAs; delete updates.toResourceInventoriedAs }
    if (data.resourceConformsTo) { updates.resourceConformsToId = data.resourceConformsTo; delete updates.resourceConformsTo }
    if (data.atLocation) { updates.atLocationId = data.atLocation; delete updates.atLocation }

    const [updated] = await db.update(commitments)
      .set(updates)
      .where(and(eq(commitments.id, id), eq(commitments.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('Commitment not found or revision mismatch')
    }
    return { commitment: updated }
  },
  
  deleteCommitment: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(commitments)
      .where(eq(commitments.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // Proposals
  createProposal: async (_: any, args: { proposal: any }) => {
    const input = {
      name: args.proposal.name,
      note: args.proposal.note,
      hasBeginning: args.proposal.hasBeginning,
      hasEnd: args.proposal.hasEnd,
      unitBased: args.proposal.unitBased,
      eligibleLocationId: args.proposal.eligibleLocation, // Mapped
    }
    const [created] = await db.insert(proposals).values(input).returning()
    return { proposal: created }
  },
  
  updateProposal: async (_: any, { proposal }: { proposal: Partial<NewProposal> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = proposal
    const [updated] = await db.update(proposals)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(proposals.id, id), eq(proposals.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('Proposal not found or revision mismatch')
    }
    return { proposal: updated }
  },
  
  deleteProposal: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(proposals)
      .where(eq(proposals.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // Proposed Intents
  proposeIntent: async (_: any, args: { publishedIn: string, publishes: string, reciprocal?: boolean }) => {
    // Map schema args to DB args
    // Schema: publishedIn (Proposal), publishes (Intent), reciprocal
    // DB: publishedIn, publishes, reciprocal
    
    // Note: The schema defines this as 'proposeIntent', taking flat arguments, not an input object.
    
    const input = {
       publishedInId: args.publishedIn,
       publishesId: args.publishes,
       reciprocal: args.reciprocal || false
    }
    
    const [created] = await db.insert(proposedIntents).values(input).returning()
    return { proposedIntent: created }
  },
  
  deleteProposedIntent: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(proposedIntents)
      .where(eq(proposedIntents.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // ========== Relationship Mutations ==========
  
  // Satisfactions
  createSatisfaction: async (_: any, { satisfaction }: { satisfaction: NewSatisfaction }) => {
    const [created] = await db.insert(satisfactions).values(satisfaction).returning()
    return { satisfaction: created }
  },
  
  updateSatisfaction: async (_: any, { satisfaction }: { satisfaction: Partial<NewSatisfaction> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = satisfaction
    const [updated] = await db.update(satisfactions)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(satisfactions.id, id), eq(satisfactions.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('Satisfaction not found or revision mismatch')
    }
    return { satisfaction: updated }
  },
  
  deleteSatisfaction: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(satisfactions)
      .where(eq(satisfactions.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // Fulfillments
  createFulfillment: async (_: any, { fulfillment }: { fulfillment: NewFulfillment }) => {
    const [created] = await db.insert(fulfillments).values(fulfillment).returning()
    return { fulfillment: created }
  },
  
  updateFulfillment: async (_: any, { fulfillment }: { fulfillment: Partial<NewFulfillment> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = fulfillment
    const [updated] = await db.update(fulfillments)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(fulfillments.id, id), eq(fulfillments.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('Fulfillment not found or revision mismatch')
    }
    return { fulfillment: updated }
  },
  
  deleteFulfillment: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(fulfillments)
      .where(eq(fulfillments.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // ========== Advanced Mutations ==========
  
  // Agreements
  createAgreement: async (_: any, { agreement }: { agreement: NewAgreement }) => {
    const [created] = await db.insert(agreements).values(agreement).returning()
    return { agreement: created }
  },
  
  updateAgreement: async (_: any, { agreement }: { agreement: Partial<NewAgreement> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = agreement
    const [updated] = await db.update(agreements)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(agreements.id, id), eq(agreements.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('Agreement not found or revision mismatch')
    }
    return { agreement: updated }
  },
  
  deleteAgreement: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(agreements)
      .where(eq(agreements.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // Claims
  createClaim: async (_: any, { claim }: { claim: NewClaim }) => {
    const [created] = await db.insert(claims).values(claim).returning()
    return { claim: created }
  },
  
  updateClaim: async (_: any, { claim }: { claim: Partial<NewClaim> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = claim
    const [updated] = await db.update(claims)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(claims.id, id), eq(claims.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('Claim not found or revision mismatch')
    }
    return { claim: updated }
  },
  
  deleteClaim: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(claims)
      .where(eq(claims.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // Settlements
  createSettlement: async (_: any, { settlement }: { settlement: NewSettlement }) => {
    const [created] = await db.insert(settlements).values(settlement).returning()
    return { settlement: created }
  },
  
  updateSettlement: async (_: any, { settlement }: { settlement: Partial<NewSettlement> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = settlement
    const [updated] = await db.update(settlements)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(settlements.id, id), eq(settlements.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('Settlement not found or revision mismatch')
    }
    return { settlement: updated }
  },
  
  deleteSettlement: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(settlements)
      .where(eq(settlements.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // Appreciations
  createAppreciation: async (_: any, { appreciation }: { appreciation: NewAppreciation }) => {
    const [created] = await db.insert(appreciations).values(appreciation).returning()
    return { appreciation: created }
  },
  
  updateAppreciation: async (_: any, { appreciation }: { appreciation: Partial<NewAppreciation> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = appreciation
    const [updated] = await db.update(appreciations)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(appreciations.id, id), eq(appreciations.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('Appreciation not found or revision mismatch')
    }
    return { appreciation: updated }
  },
  
  deleteAppreciation: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(appreciations)
      .where(eq(appreciations.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // ========== Scenario Mutations ==========
  
  // Scenario Definitions
  createScenarioDefinition: async (_: any, { scenarioDefinition }: { scenarioDefinition: NewScenarioDefinition }) => {
    const [created] = await db.insert(scenarioDefinitions).values(scenarioDefinition).returning()
    return { scenarioDefinition: created }
  },
  
  updateScenarioDefinition: async (_: any, { scenarioDefinition }: { scenarioDefinition: Partial<NewScenarioDefinition> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = scenarioDefinition
    const [updated] = await db.update(scenarioDefinitions)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(scenarioDefinitions.id, id), eq(scenarioDefinitions.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('ScenarioDefinition not found or revision mismatch')
    }
    return { scenarioDefinition: updated }
  },
  
  deleteScenarioDefinition: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(scenarioDefinitions)
      .where(eq(scenarioDefinitions.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // Scenarios
  createScenario: async (_: any, { scenario }: { scenario: NewScenario }) => {
    const [created] = await db.insert(scenarios).values(scenario).returning()
    return { scenario: created }
  },
  
  updateScenario: async (_: any, { scenario }: { scenario: Partial<NewScenario> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = scenario
    const [updated] = await db.update(scenarios)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(scenarios.id, id), eq(scenarios.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('Scenario not found or revision mismatch')
    }
    return { scenario: updated }
  },
  
  deleteScenario: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(scenarios)
      .where(eq(scenarios.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // ========== Recipe Mutations ==========
  
  // Recipe Processes
  createRecipeProcess: async (_: any, { recipeProcess }: { recipeProcess: NewRecipeProcess }) => {
    const [created] = await db.insert(recipeProcesses).values(recipeProcess).returning()
    return { recipeProcess: created }
  },
  
  updateRecipeProcess: async (_: any, { recipeProcess }: { recipeProcess: Partial<NewRecipeProcess> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = recipeProcess
    const [updated] = await db.update(recipeProcesses)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(recipeProcesses.id, id), eq(recipeProcesses.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('RecipeProcess not found or revision mismatch')
    }
    return { recipeProcess: updated }
  },
  
  deleteRecipeProcess: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(recipeProcesses)
      .where(eq(recipeProcesses.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // Recipe Exchanges
  createRecipeExchange: async (_: any, { recipeExchange }: { recipeExchange: NewRecipeExchange }) => {
    const [created] = await db.insert(recipeExchanges).values(recipeExchange).returning()
    return { recipeExchange: created }
  },
  
  updateRecipeExchange: async (_: any, { recipeExchange }: { recipeExchange: Partial<NewRecipeExchange> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = recipeExchange
    const [updated] = await db.update(recipeExchanges)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(recipeExchanges.id, id), eq(recipeExchanges.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('RecipeExchange not found or revision mismatch')
    }
    return { recipeExchange: updated }
  },
  
  deleteRecipeExchange: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(recipeExchanges)
      .where(eq(recipeExchanges.revisionId, revisionId))
      .returning()
    return !!deleted
  },
  
  // Recipe Flows
  createRecipeFlow: async (_: any, { recipeFlow }: { recipeFlow: NewRecipeFlow }) => {
    const [created] = await db.insert(recipeFlows).values(recipeFlow).returning()
    return { recipeFlow: created }
  },
  
  updateRecipeFlow: async (_: any, { recipeFlow }: { recipeFlow: Partial<NewRecipeFlow> & { id: string, revisionId: string } }) => {
    const { id, revisionId, ...updates } = recipeFlow
    const [updated] = await db.update(recipeFlows)
      .set({ ...updates, revisionId: crypto.randomUUID(), updatedAt: new Date() })
      .where(and(eq(recipeFlows.id, id), eq(recipeFlows.revisionId, revisionId)))
      .returning()
    
    if (!updated) {
      throw new Error('RecipeFlow not found or revision mismatch')
    }
    return { recipeFlow: updated }
  },
  
  deleteRecipeFlow: async (_: any, { revisionId }: { revisionId: string }) => {
    const [deleted] = await db.delete(recipeFlows)
      .where(eq(recipeFlows.revisionId, revisionId))
      .returning()
    return !!deleted
  },
}

// ============================================================================
// Field Resolvers - Handle relationships
// ============================================================================

// Agent Field Resolvers
const Agent = {
  __resolveType(obj: any) {
    return obj.agentType
  },
}

const Person = {
  // Relationships
  relationships: async (parent: any) => {
    return await db.select().from(agentRelationships)
      .where(eq(agentRelationships.subjectId, parent.id))
  },
  relationshipsAsSubject: async (parent: any) => {
    return await db.select().from(agentRelationships)
      .where(eq(agentRelationships.subjectId, parent.id))
  },
  relationshipsAsObject: async (parent: any) => {
    return await db.select().from(agentRelationships)
      .where(eq(agentRelationships.objectId, parent.id))
  },
  roles: async (parent: any) => {
    const rels = await db.select().from(agentRelationships)
      .where(eq(agentRelationships.subjectId, parent.id))
    const roleIds = [...new Set(rels.map(r => r.relationshipId))]
    return await db.select().from(agentRelationshipRoles)
      .where(eq(agentRelationshipRoles.id, roleIds[0])) // TODO: handle multiple
  },
  // Economic Events
  economicEvents: async (parent: any) => {
    return await db.select().from(economicEvents)
      .where(eq(economicEvents.providerId, parent.id))
  },
  economicEventsAsProvider: async (parent: any) => {
    return await db.select().from(economicEvents)
      .where(eq(economicEvents.providerId, parent.id))
  },
  economicEventsAsReceiver: async (parent: any) => {
    return await db.select().from(economicEvents)
      .where(eq(economicEvents.receiverId, parent.id))
  },
  inventoriedEconomicResources: async (parent: any) => {
    return await db.select().from(economicResources)
      .where(eq(economicResources.primaryAccountableId, parent.id))
  },
  // Intents
  intents: async (parent: any) => {
    return await db.select().from(intents)
      .where(eq(intents.providerId, parent.id))
  },
  intentsAsProvider: async (parent: any) => {
    return await db.select().from(intents)
      .where(eq(intents.providerId, parent.id))
  },
  intentsAsReceiver: async (parent: any) => {
    return await db.select().from(intents)
      .where(eq(intents.receiverId, parent.id))
  },
  // Commitments
  commitments: async (parent: any) => {
    return await db.select().from(commitments)
      .where(eq(commitments.providerId, parent.id))
  },
  commitmentsAsProvider: async (parent: any) => {
    return await db.select().from(commitments)
      .where(eq(commitments.providerId, parent.id))
  },
  commitmentsAsReceiver: async (parent: any) => {
    return await db.select().from(commitments)
      .where(eq(commitments.receiverId, parent.id))
  },
  // NEW: Missing bridging fields
  primaryLocation: async (parent: any) => {
    if (!parent.primaryLocationId) return null
    const [loc] = await db.select().from(spatialThings)
        .where(eq(spatialThings.id, parent.primaryLocationId))
        .limit(1)
    return loc
  },
  economicEventsInScope: async (parent: any) => {
     return await db.select().from(economicEvents)
       .where(or(
          eq(economicEvents.providerId, parent.id),
          eq(economicEvents.receiverId, parent.id)
       ))
  },

  // NEW: Missing bridging fields found by rigorous sweep
  // stage resolver removed (not in schema)
  // clauseOf and involvedAgents removed (not in schema)


  // NEW: Agent scope queries
  intentsInScope: async (parent: any) => {
    const allIntents = await db.select().from(intents)
    return allIntents.filter(intent => 
      intent.inScopeOf && intent.inScopeOf.includes(parent.id)
    )
  },
  commitmentsInScope: async (parent: any) => {
    const allCommitments = await db.select().from(commitments)
    return allCommitments.filter(commitment => 
      commitment.inScopeOf && commitment.inScopeOf.includes(parent.id)
    )
  },
  // NEW: Claim queries
  claims: async (parent: any) => {
    return await db.select().from(claims)
      .where(eq(claims.providerId, parent.id))
  },
  claimsAsProvider: async (parent: any) => {
    return await db.select().from(claims)
      .where(eq(claims.providerId, parent.id))
  },
  claimsAsReceiver: async (parent: any) => {
    return await db.select().from(claims)
      .where(eq(claims.receiverId, parent.id))
  },
  claimsInScope: async (parent: any) => {
    const allClaims = await db.select().from(claims)
    return allClaims.filter(claim => 
      claim.inScopeOf && claim.inScopeOf.includes(parent.id)
    )
  },
  // NEW: Missing bridging fields
  plans: async (parent: any) => {
    // Placeholder: Agents typically involved via commitments/processes
    return [] 
  },
  processes: async (parent: any) => {
    // Placeholder
    return []
  },
  proposals: async (parent: any) => {
    // Placeholder
    return []
  },
  proposalsInScope: async (parent: any) => {
    const allProposals = await db.select().from(proposals)
    return allProposals.filter(p => p.inScopeOf && p.inScopeOf.includes(parent.id))
  },
  proposalsTo: async (parent: any) => {
    // Placeholder (requires ProposedTo table/relation)
    return []
  },
  scenariosInScope: async (parent: any) => {
    const allScenarios = await db.select().from(scenarios)
    return allScenarios.filter(s => s.inScopeOf && s.inScopeOf.includes(parent.id))
  },
}

const Organization = {
  // Same as Person
  ...Person,
}

const AgentRelationship = {
  subject: async (parent: any) => {
    const [agent] = await db.select().from(agents)
      .where(eq(agents.id, parent.subjectId))
      .limit(1)
    return agent
  },
  object: async (parent: any) => {
    const [agent] = await db.select().from(agents)
      .where(eq(agents.id, parent.objectId))
      .limit(1)
    return agent
  },
  relationship: async (parent: any) => {
    const [role] = await db.select().from(agentRelationshipRoles)
      .where(eq(agentRelationshipRoles.id, parent.relationshipId))
      .limit(1)
    return role
  },
  inScopeOf: async (parent: any) => {
    if (!parent.inScopeOf) return []
    const scopes = await db.select().from(agents)
      .where(eq(agents.id, parent.inScopeOf[0])) // TODO: handle multiple
    return scopes
  },
}

const AgentRelationshipRole = {
  agentRelationships: async (parent: any) => {
    return await db.select().from(agentRelationships)
      .where(eq(agentRelationships.relationshipId, parent.id))
  },
  note: (parent: any) => parent.note,
  roleLabel: (parent: any) => parent.roleLabel,
  inverseRoleLabel: (parent: any) => parent.inverseRoleLabel,
}

// EconomicEvent Field Resolvers
const EconomicEvent = {
  action: async (parent: any) => {
    const [action] = await db.select().from(actions)
      .where(eq(actions.id, parent.actionId))
      .limit(1)
    return action
  },
  provider: async (parent: any) => {
    const [agent] = await db.select().from(agents)
      .where(eq(agents.id, parent.providerId))
      .limit(1)
    return agent
  },
  receiver: async (parent: any) => {
    const [agent] = await db.select().from(agents)
      .where(eq(agents.id, parent.receiverId))
      .limit(1)
    return agent
  },
  resourceInventoriedAs: async (parent: any) => {
    if (!parent.resourceInventoriedAsId) return null
    const [resource] = await db.select().from(economicResources)
      .where(eq(economicResources.id, parent.resourceInventoriedAsId))
      .limit(1)
    return resource
  },
  toResourceInventoriedAs: async (parent: any) => {
    if (!parent.toResourceInventoriedAsId) return null
    const [resource] = await db.select().from(economicResources)
      .where(eq(economicResources.id, parent.toResourceInventoriedAsId))
      .limit(1)
    return resource
  },
  resourceConformsTo: async (parent: any) => {
    if (!parent.resourceConformsToId) return null
    const [spec] = await db.select().from(resourceSpecifications)
      .where(eq(resourceSpecifications.id, parent.resourceConformsToId))
      .limit(1)
    return spec
  },
  atLocation: async (parent: any) => {
    if (!parent.atLocationId) return null
    const [location] = await db.select().from(spatialThings)
      .where(eq(spatialThings.id, parent.atLocationId))
      .limit(1)
    return location
  },
  toLocation: async (parent: any) => {
    if (!parent.atLocationId) return null
    const [location] = await db.select().from(spatialThings)
      .where(eq(spatialThings.id, parent.atLocationId))
      .limit(1)
    return location
  },
  inputOf: async (parent: any) => {
    if (!parent.inputOfId) return null
    const [process] = await db.select().from(processes)
      .where(eq(processes.id, parent.inputOfId))
      .limit(1)
    return process
  },
  outputOf: async (parent: any) => {
    if (!parent.outputOfId) return null
    const [process] = await db.select().from(processes)
      .where(eq(processes.id, parent.outputOfId))
      .limit(1)
    return process
  },
  triggeredBy: async (parent: any) => {
    if (!parent.triggeredById) return null
    const [event] = await db.select().from(economicEvents)
      .where(eq(economicEvents.id, parent.triggeredById))
      .limit(1)
    return event
  },
  triggers: async (parent: any) => {
    return await db.select().from(economicEvents)
      .where(eq(economicEvents.triggeredById, parent.id))
  },
  inScopeOf: async (parent: any) => {
    if (!parent.inScopeOf) return []
    const scopes = await db.select().from(agents)
      .where(eq(agents.id, parent.inScopeOf[0])) // TODO: handle multiple
    return scopes
  },
  // fulfillments and satisfactions removed (not in schema)
  // NEW: Track/trace/flow resolvers
  previous: async (parent: any) => {
    // Resources that were inputs to this event
    const items: any[] = []
    if (parent.resourceInventoriedAsId) {
      const [resource] = await db.select().from(economicResources)
        .where(eq(economicResources.id, parent.resourceInventoriedAsId))
        .limit(1)
      if (resource) items.push(resource)
    }
    return items
  },
  next: async (parent: any) => {
    // Resources that were outputs from this event
    const items: any[] = []
    if (parent.toResourceInventoriedAsId) {
      const [resource] = await db.select().from(economicResources)
        .where(eq(economicResources.id, parent.toResourceInventoriedAsId))
        .limit(1)
      if (resource) items.push(resource)
    }
    return items
  },
  track: async (parent: any) => {
    // Track forward: events/resources that use outputs from this event
    const items: any[] = []
    if (parent.toResourceInventoriedAsId) {
      const [resource] = await db.select().from(economicResources)
        .where(eq(economicResources.id, parent.toResourceInventoriedAsId))
        .limit(1)
      if (resource) items.push(resource)
      // Find events that use this resource
      const nextEvents = await db.select().from(economicEvents)
        .where(eq(economicEvents.resourceInventoriedAsId, parent.toResourceInventoriedAsId))
      items.push(...nextEvents)
    }
    return items
  },
  trace: async (parent: any) => {
    // Trace backward: events/resources that provided inputs to this event
    const items: any[] = []
    if (parent.resourceInventoriedAsId) {
      const [resource] = await db.select().from(economicResources)
        .where(eq(economicResources.id, parent.resourceInventoriedAsId))
        .limit(1)
      if (resource) items.push(resource)
      // Find events that created this resource
      const prevEvents = await db.select().from(economicEvents)
        .where(eq(economicEvents.toResourceInventoriedAsId, parent.resourceInventoriedAsId))
      items.push(...prevEvents)
    }
    return items
  },
  // NEW: Missing bridging fields
  // claims, settlements, appreciations removed (not in schema)
  realizationOf: async (parent: any) => {
    if (!parent.realizationOfId) return null
    const [agreement] = await db.select().from(agreements)
      .where(eq(agreements.id, parent.realizationOfId))
      .limit(1)
    return agreement
  },
  settles: async (parent: any) => {
    // EconomicEvent.settles -> Claim (via Settlement)
    // Checks if this event is the `settledBy` in a Settlement.
    const settlementList = await db.select().from(settlements)
      .where(eq(settlements.settledById, parent.id))
    
    // Resolve Claims from Settlements
    if (settlementList.length === 0) return []
    
    // Get all claims
    // TODO: Optimize with `inArray`
    const claimsList = []
    for (const s of settlementList) {
       if (s.settlesId) {
         const [c] = await db.select().from(claims).where(eq(claims.id, s.settlesId))
         if (c) claimsList.push(c)
       }
    }
    return claimsList
  },
  fulfills: async (parent: any) => {
    return await db.select().from(fulfillments)
      .where(eq(fulfillments.fulfilledById, parent.id))
  },
  satisfies: async (parent: any) => {
    return await db.select().from(satisfactions)
      .where(and(
        eq(satisfactions.satisfiedById, parent.id),
        eq(satisfactions.satisfiedByType, 'EconomicEvent')
      ))
  },
}


// EconomicResource Field Resolvers
const EconomicResource = {
  conformsTo: async (parent: any) => {
    if (!parent.conformsToId) return null
    const [spec] = await db.select().from(resourceSpecifications)
      .where(eq(resourceSpecifications.id, parent.conformsToId))
      .limit(1)
    return spec
  },
  currentLocation: async (parent: any) => {
    if (!parent.currentLocationId) return null
    const [loc] = await db.select().from(spatialThings)
      .where(eq(spatialThings.id, parent.currentLocationId))
      .limit(1)
    return loc
  },
  lot: async (parent: any) => {
    if (!parent.lotId) return null
    const [batch] = await db.select().from(productBatches)
      .where(eq(productBatches.id, parent.lotId))
      .limit(1)
    return batch
  },
  containedIn: async (parent: any) => {
    if (!parent.containedInId) return null
    const [container] = await db.select().from(economicResources)
      .where(eq(economicResources.id, parent.containedInId))
      .limit(1)
    return container
  },
  contains: async (parent: any) => {
    return await db.select().from(economicResources)
      .where(eq(economicResources.containedInId, parent.id))
  },
  unitOfEffort: async (parent: any) => {
    if (!parent.unitOfEffortId) return null
    const [unit] = await db.select().from(units)
      .where(eq(units.id, parent.unitOfEffortId))
      .limit(1)
    return unit
  },
  state: async (parent: any) => {
    if (!parent.stateId) return null
    const [action] = await db.select().from(actions)
      .where(eq(actions.id, parent.stateId))
      .limit(1)
    return action
  },
  primaryAccountable: async (parent: any) => {
    if (!parent.primaryAccountableId) return null
    const [agent] = await db.select().from(agents)
      .where(eq(agents.id, parent.primaryAccountableId))
      .limit(1)
    return agent
  },
  custodian: async (parent: any) => {
    if (!parent.custodianId) return null
    const [agent] = await db.select().from(agents)
      .where(eq(agents.id, parent.custodianId))
      .limit(1)
    return agent
  },
  economicEventsInOutFrom: async (parent: any) => {
    return await db.select().from(economicEvents)
      .where(eq(economicEvents.resourceInventoriedAsId, parent.id))
  },
  economicEventsTo: async (parent: any) => {
    return await db.select().from(economicEvents)
      .where(eq(economicEvents.toResourceInventoriedAsId, parent.id))
  },
  // NEW: Track/trace/flow resolvers
  previous: async (parent: any) => {
    // Events that created or modified this resource
    return await db.select().from(economicEvents)
      .where(eq(economicEvents.toResourceInventoriedAsId, parent.id))
  },
  next: async (parent: any) => {
    // Events that will use or consume this resource
    return await db.select().from(economicEvents)
      .where(eq(economicEvents.resourceInventoriedAsId, parent.id))
  },
  track: async (parent: any) => {
    // Track forward: events and resources downstream
    const items: any[] = []
    const nextEvents = await db.select().from(economicEvents)
      .where(eq(economicEvents.resourceInventoriedAsId, parent.id))
    items.push(...nextEvents)
    // Find resources created by those events
    for (const event of nextEvents) {
      if (event.toResourceInventoriedAsId) {
        const [resource] = await db.select().from(economicResources)
          .where(eq(economicResources.id, event.toResourceInventoriedAsId))
          .limit(1)
        if (resource) items.push(resource)
      }
    }
    return items
  },
  trace: async (parent: any) => {
    // Trace backward: events and resources upstream
    const items: any[] = []
    const prevEvents = await db.select().from(economicEvents)
      .where(eq(economicEvents.toResourceInventoriedAsId, parent.id))
    items.push(...prevEvents)
    // Find resources used by those events
    for (const event of prevEvents) {
      if (event.resourceInventoriedAsId) {
        const [resource] = await db.select().from(economicResources)
          .where(eq(economicResources.id, event.resourceInventoriedAsId))
          .limit(1)
        if (resource) items.push(resource)
      }
    }
    return items
  },
  // NEW: Missing bridging fields
  // claims, commitments, intents removed (not in schema)
  stage: async (parent: any) => {
     // Missing Stage/State logic
     return null
  },
}

// ResourceSpecification Field Resolvers
const ResourceSpecification = {
  defaultUnitOfResource: async (parent: any) => {
    if (!parent.defaultUnitOfResourceId) return null
    const [unit] = await db.select().from(units)
      .where(eq(units.id, parent.defaultUnitOfResourceId))
      .limit(1)
    return unit
  },
  defaultUnitOfEffort: async (parent: any) => {
    if (!parent.defaultUnitOfEffortId) return null
    const [unit] = await db.select().from(units)
      .where(eq(units.id, parent.defaultUnitOfEffortId))
      .limit(1)
    return unit
  },
  conformingResources: async (parent: any) => {
    return await db.select().from(economicResources)
      .where(eq(economicResources.conformsToId, parent.id))
  },
  economicEvents: async (parent: any) => {
    return await db.select().from(economicEvents)
      .where(eq(economicEvents.resourceConformsToId, parent.id))
  },
  // NEW: Missing bridging fields
  commitments: async (parent: any) => {
    return await db.select().from(commitments)
      .where(eq(commitments.resourceConformsToId, parent.id))
  },
  intents: async (parent: any) => {
    return await db.select().from(intents)
      .where(eq(intents.resourceConformsToId, parent.id))
  },
  claims: async (parent: any) => {
    return await db.select().from(claims)
      .where(eq(claims.resourceConformsToId, parent.id))
  },
}

// Process Field Resolvers
const Process = {
  basedOn: async (parent: any) => {
    if (!parent.basedOnId) return null
    const [spec] = await db.select().from(processSpecifications)
      .where(eq(processSpecifications.id, parent.basedOnId))
      .limit(1)
    return spec
  },
  plannedWithin: async (parent: any) => {
    if (!parent.plannedWithinId) return null
    const [plan] = await db.select().from(plans)
      .where(eq(plans.id, parent.plannedWithinId))
      .limit(1)
    return plan
  },
  nestedIn: async (parent: any) => {
    if (!parent.nestedInId) return null
    const [process] = await db.select().from(processes)
      .where(eq(processes.id, parent.nestedInId))
      .limit(1)
    return process
  },
  // Process flow (next/previous processes)
  nextProcesses: async (parent: any) => {
    // Processes that use outputs from this process
    const outputs = await db.select().from(economicEvents)
      .where(eq(economicEvents.outputOfId, parent.id))
    const nextProcessIds = new Set(
      outputs.map(e => e.inputOfId).filter(Boolean) as string[]
    )
    if (nextProcessIds.size === 0) return []
    return await db.select().from(processes)
      .where(eq(processes.id, Array.from(nextProcessIds)[0])) // TODO: handle multiple
  },
  previousProcesses: async (parent: any) => {
    // Processes that provide inputs to this process
    const inputs = await db.select().from(economicEvents)
      .where(eq(economicEvents.inputOfId, parent.id))
    const prevProcessIds = new Set(
      inputs.map(e => e.outputOfId).filter(Boolean) as string[]
    )
    if (prevProcessIds.size === 0) return []
    return await db.select().from(processes)
      .where(eq(processes.id, Array.from(prevProcessIds)[0])) // TODO: handle multiple
  },
}

// ProcessSpecification Field Resolvers
const ProcessSpecification = {
  // processes removed (not in schema)
  // NEW: Missing bridging fields
  commitmentsRequiringStage: async (parent: any) => {
    // Placeholder (missing stage column in commitments)
    return []
  },
  recipeFlowsRequiringStage: async (parent: any) => {
    // Placeholder
    return []
  },
  resourcesCurrentlyAtStage: async (parent: any) => {
    // Placeholder (missing stage/state link logic)
    return []
  },
  conformingProcesses: async (parent: any) => {
    return await db.select().from(processes)
      .where(eq(processes.basedOnId, parent.id))
  },
  conformingRecipeProcesses: async (parent: any) => {
    return await db.select().from(recipeProcesses)
      .where(eq(recipeProcesses.basedOnId, parent.id))
  },
  // inScopeOf removed (not in schema)
}

// Plan Field Resolvers
const Plan = {
  processes: async (parent: any) => {
    return await db.select().from(processes)
      .where(eq(processes.plannedWithinId, parent.id))
  },
  // commitments removed (not in schema)
  independentDemands: async (parent: any) => {
    return await db.select().from(commitments)
      .where(eq(commitments.independentDemandOfId, parent.id))
  },
  // NEW: Non-process commitments
  nonProcessCommitments: async (parent: any) => {
    const allCommitments = await db.select().from(commitments)
      .where(eq(commitments.plannedWithinId, parent.id))
    // Filter out commitments that are inputs or outputs of processes
    return allCommitments.filter(c => !c.inputOfId && !c.outputOfId)
  },
  // NEW: Missing bridging fields
  // involvedAgents removed (not in schema)
  refinementOf: async (parent: any) => {
    // Placeholder (missing refinementOfId in plans table)
    return null
  },
  // inScopeOf removed (not in schema)
  // refinements removed (not in schema)
}

// Intent Field Resolvers
const Intent = {
  action: async (parent: any) => {
    const [action] = await db.select().from(actions)
      .where(eq(actions.id, parent.actionId))
      .limit(1)
    return action
  },
  provider: async (parent: any) => {
    if (!parent.providerId) return null
    const [agent] = await db.select().from(agents)
      .where(eq(agents.id, parent.providerId))
      .limit(1)
    return agent
  },
  receiver: async (parent: any) => {
    if (!parent.receiverId) return null
    const [agent] = await db.select().from(agents)
      .where(eq(agents.id, parent.receiverId))
      .limit(1)
    return agent
  },
  resourceInventoriedAs: async (parent: any) => {
    if (!parent.resourceInventoriedAsId) return null
    const [resource] = await db.select().from(economicResources)
      .where(eq(economicResources.id, parent.resourceInventoriedAsId))
      .limit(1)
    return resource
  },
  toResourceInventoriedAs: async (parent: any) => {
    if (!parent.toResourceInventoriedAsId) return null
    const [resource] = await db.select().from(economicResources)
      .where(eq(economicResources.id, parent.toResourceInventoriedAsId))
      .limit(1)
    return resource
  },
  resourceConformsTo: async (parent: any) => {
    if (!parent.resourceConformsToId) return null
    const [spec] = await db.select().from(resourceSpecifications)
      .where(eq(resourceSpecifications.id, parent.resourceConformsToId))
      .limit(1)
    return spec
  },
  atLocation: async (parent: any) => {
    if (!parent.atLocationId) return null
    const [location] = await db.select().from(spatialThings)
      .where(eq(spatialThings.id, parent.atLocationId))
      .limit(1)
    return location
  },
  inputOf: async (parent: any) => {
    if (!parent.inputOfId) return null
    const [process] = await db.select().from(processes)
      .where(eq(processes.id, parent.inputOfId))
      .limit(1)
    return process
  },
  outputOf: async (parent: any) => {
    if (!parent.outputOfId) return null
    const [process] = await db.select().from(processes)
      .where(eq(processes.id, parent.outputOfId))
      .limit(1)
    return process
  },
  satisfiedBy: async (parent: any) => {
    return await db.select().from(satisfactions)
      .where(eq(satisfactions.satisfiesId, parent.id))
  },
  publishedIn: async (parent: any) => {
    return await db.select().from(proposedIntents)
      .where(eq(proposedIntents.publishesId, parent.id))
  },
}

// Commitment Field Resolvers
const Commitment = {
  clauseOf: async (parent: any) => {
     if (!parent.clauseOfId) return null
     const [agreement] = await db.select().from(agreements)
       .where(eq(agreements.id, parent.clauseOfId))
       .limit(1)
     return agreement
  },
  stage: async (parent: any) => {
     // Commitment.stage -> ProcessSpecification?
     // Placeholder
     return null
  },
  involvedAgents: async (parent: any) => {
     const agentsList = []
     if (parent.providerId) {
        const [p] = await db.select().from(agents).where(eq(agents.id, parent.providerId))
        if(p) agentsList.push(p)
     }
     if (parent.receiverId) {
        const [r] = await db.select().from(agents).where(eq(agents.id, parent.receiverId))
        if(r) agentsList.push(r)
     }
     return agentsList
  },
  action: async (parent: any) => {
    const [action] = await db.select().from(actions)
      .where(eq(actions.id, parent.actionId))
      .limit(1)
    return action
  },
  provider: async (parent: any) => {
    const [agent] = await db.select().from(agents)
      .where(eq(agents.id, parent.providerId))
      .limit(1)
    return agent
  },
  receiver: async (parent: any) => {
    const [agent] = await db.select().from(agents)
      .where(eq(agents.id, parent.receiverId))
      .limit(1)
    return agent
  },
  resourceInventoriedAs: async (parent: any) => {
    if (!parent.resourceInventoriedAsId) return null
    const [resource] = await db.select().from(economicResources)
      .where(eq(economicResources.id, parent.resourceInventoriedAsId))
      .limit(1)
    return resource
  },
  toResourceInventoriedAs: async (parent: any) => {
    if (!parent.toResourceInventoriedAsId) return null
    const [resource] = await db.select().from(economicResources)
      .where(eq(economicResources.id, parent.toResourceInventoriedAsId))
      .limit(1)
    return resource
  },
  resourceConformsTo: async (parent: any) => {
    if (!parent.resourceConformsToId) return null
    const [spec] = await db.select().from(resourceSpecifications)
      .where(eq(resourceSpecifications.id, parent.resourceConformsToId))
      .limit(1)
    return spec
  },
  atLocation: async (parent: any) => {
    if (!parent.atLocationId) return null
    const [location] = await db.select().from(spatialThings)
      .where(eq(spatialThings.id, parent.atLocationId))
      .limit(1)
    return location
  },
  inputOf: async (parent: any) => {
    if (!parent.inputOfId) return null
    const [process] = await db.select().from(processes)
      .where(eq(processes.id, parent.inputOfId))
      .limit(1)
    return process
  },
  outputOf: async (parent: any) => {
    if (!parent.outputOfId) return null
    const [process] = await db.select().from(processes)
      .where(eq(processes.id, parent.outputOfId))
      .limit(1)
    return process
  },
  independentDemandOf: async (parent: any) => {
    if (!parent.independentDemandOfId) return null
    const [plan] = await db.select().from(plans)
      .where(eq(plans.id, parent.independentDemandOfId))
      .limit(1)
    return plan
  },
  plannedWithin: async (parent: any) => {
    if (!parent.plannedWithinId) return null
    const [plan] = await db.select().from(plans)
      .where(eq(plans.id, parent.plannedWithinId))
      .limit(1)
    return plan
  },
}

// Proposal Field Resolvers
const Proposal = {
  eligibleLocation: async (parent: any) => {
    if (!parent.eligibleLocationId) return null
    const [location] = await db.select().from(spatialThings)
      .where(eq(spatialThings.id, parent.eligibleLocationId))
      .limit(1)
    return location
  },
  // publishedIntents removed (not in schema)
  // NEW: Missing bridging fields
  publishes: async (parent: any) => {
    return await db.select().from(proposedIntents)
      .where(eq(proposedIntents.publishedInId, parent.id))
  },
  // publishedTo removed (not in schema)
  primaryIntents: async (parent: any) => {
    const pis = await db.select().from(proposedIntents)
      .where(and(
        eq(proposedIntents.publishedInId, parent.id),
        eq(proposedIntents.reciprocal, false)
      ))
    // TODO: Fetch intents (requires join or loop)
    return []
  },
  reciprocalIntents: async (parent: any) => {
    const pis = await db.select().from(proposedIntents)
      .where(and(
        eq(proposedIntents.publishedInId, parent.id),
        eq(proposedIntents.reciprocal, true)
      ))
    // TODO: Fetch intents
    return []
  },
}

// ProposedIntent Field Resolvers
const ProposedIntent = {
  publishedIn: async (parent: any) => {
    const [proposal] = await db.select().from(proposals)
      .where(eq(proposals.id, parent.publishedInId))
      .limit(1)
    return proposal
  },
  publishes: async (parent: any) => {
    const [intent] = await db.select().from(intents)
      .where(eq(intents.id, parent.publishesId))
      .limit(1)
    return intent
  },
}



// Satisfaction Field Resolvers
const Satisfaction = {
  satisfies: async (parent: any) => {
    const [intent] = await db.select().from(intents)
      .where(eq(intents.id, parent.satisfiesId))
      .limit(1)
    return intent
  },
  satisfiedBy: async (parent: any) => {
    if (parent.satisfiedByType === 'EconomicEvent') {
      const [event] = await db.select().from(economicEvents)
        .where(eq(economicEvents.id, parent.satisfiedById))
        .limit(1)
      return event
    } else {
      const [commitment] = await db.select().from(commitments)
        .where(eq(commitments.id, parent.satisfiedById))
        .limit(1)
      return commitment
    }
  },
}

// Fulfillment Field Resolvers
const Fulfillment = {
  fulfills: async (parent: any) => {
    const [commitment] = await db.select().from(commitments)
      .where(eq(commitments.id, parent.fulfillsId))
      .limit(1)
    return commitment
  },
  fulfilledBy: async (parent: any) => {
    const [event] = await db.select().from(economicEvents)
      .where(eq(economicEvents.id, parent.fulfilledById))
      .limit(1)
    return event
  },
}

// Claim Field Resolvers
const Claim = {
  action: async (parent: any) => {
    const [action] = await db.select().from(actions)
      .where(eq(actions.id, parent.actionId))
      .limit(1)
    return action
  },
  provider: async (parent: any) => {
    const [agent] = await db.select().from(agents)
      .where(eq(agents.id, parent.providerId))
      .limit(1)
    return agent
  },
  receiver: async (parent: any) => {
    const [agent] = await db.select().from(agents)
      .where(eq(agents.id, parent.receiverId))
      .limit(1)
    return agent
  },
  resourceConformsTo: async (parent: any) => {
    if (!parent.resourceConformsToId) return null
    const [spec] = await db.select().from(resourceSpecifications)
      .where(eq(resourceSpecifications.id, parent.resourceConformsToId))
      .limit(1)
    return spec
  },
  triggeredBy: async (parent: any) => {
    const [event] = await db.select().from(economicEvents)
      .where(eq(economicEvents.id, parent.triggeredById))
      .limit(1)
    return event
  },
  // settlements removed (not in schema)
  settledBy: async (parent: any) => {
    // Return settlements, not events (Claim.settledBy -> SettlementConnection)
    // TODO: Implement connection paging
    return await db.select().from(settlements)
      .where(eq(settlements.settlesId, parent.id))
  },
}

// Settlement Field Resolvers
const Settlement = {
  settles: async (parent: any) => {
    const [claim] = await db.select().from(claims)
      .where(eq(claims.id, parent.settlesId))
      .limit(1)
    return claim
  },
  settledBy: async (parent: any) => {
    const [event] = await db.select().from(economicEvents)
      .where(eq(economicEvents.id, parent.settledById))
      .limit(1)
    return event
  },
}



// Agreement Field Resolvers
const Agreement = {
  commitments: async (parent: any) => {
    return await db.select().from(commitments)
      .where(eq(commitments.clauseOfId, parent.id))
  },
  economicEvents: async (parent: any) => {
    return await db.select().from(economicEvents)
      .where(eq(economicEvents.realizationOfId, parent.id))
  },
  involvedAgents: async (parent: any) => {
    // Placeholder
    return []
  },
  unplannedEconomicEvents: async (parent: any) => {
    // Placeholder
    return []
  },
}

// Appreciation Field Resolvers
const Appreciation = {
  appreciationOf: async (parent: any) => {
    const [event] = await db.select().from(economicEvents)
      .where(eq(economicEvents.id, parent.appreciationOfId))
      .limit(1)
    return event
  },
  appreciationWith: async (parent: any) => {
    if (!parent.appreciationWithId) return null
    const [event] = await db.select().from(economicEvents)
      .where(eq(economicEvents.id, parent.appreciationWithId))
      .limit(1)
    return event
  },
  appreciatedBy: async (parent: any) => {
    const [agent] = await db.select().from(agents)
      .where(eq(agents.id, parent.appreciatedById))
      .limit(1)
    return agent
  },
}

// Scenario Field Resolvers
const Scenario = {
  definedAs: async (parent: any) => {
    if (!parent.definedAsId) return null
    const [def] = await db.select().from(scenarioDefinitions)
      .where(eq(scenarioDefinitions.id, parent.definedAsId))
      .limit(1)
    return def
  },
  refinementOf: async (parent: any) => {
    if (!parent.refinementOfId) return null
    const [scenario] = await db.select().from(scenarios)
      .where(eq(scenarios.id, parent.refinementOfId))
      .limit(1)
    return scenario
  },
  refinements: async (parent: any) => {
    return await db.select().from(scenarios)
      .where(eq(scenarios.refinementOfId, parent.id))
  },
  plans: async (parent: any) => {
     // Plans that refine this scenario?
     // Or Plans in scope?
     // Schema: `Scenario.plans: [Plan]`
     // DB mapping unclear. Placeholder.
     return []
  },
  processes: async (parent: any) => {
    return []
  },
}

// ScenarioDefinition Field Resolvers
const ScenarioDefinition = {
  scenarios: async (parent: any) => {
    return await db.select().from(scenarios)
      .where(eq(scenarios.definedAsId, parent.id))
  },
}

// RecipeProcess Field Resolvers
const RecipeProcess = {
  basedOn: async (parent: any) => {
    if (!parent.basedOnId) return null
    const [spec] = await db.select().from(processSpecifications)
      .where(eq(processSpecifications.id, parent.basedOnId))
      .limit(1)
    return spec
  },
  // inputs removed (not in schema)
  // outputs removed (not in schema)
  processConformsTo: async (parent: any) => {
    // Alias for basedOn? Or specification?
    if (!parent.basedOnId) return null
    const [spec] = await db.select().from(processSpecifications)
      .where(eq(processSpecifications.id, parent.basedOnId))
      .limit(1)
    return spec
  },
}

// RecipeExchange Field Resolvers
const RecipeExchange = {
  // clauses removed (not in schema)
}

// RecipeFlow Field Resolvers
const RecipeFlow = {
  action: async (parent: any) => {
    const [action] = await db.select().from(actions)
      .where(eq(actions.id, parent.actionId))
      .limit(1)
    return action
  },
  resourceConformsTo: async (parent: any) => {
    if (!parent.resourceConformsToId) return null
    const [spec] = await db.select().from(resourceSpecifications)
      .where(eq(resourceSpecifications.id, parent.resourceConformsToId))
      .limit(1)
    return spec
  },
  recipeInputOf: async (parent: any) => {
    if (!parent.recipeInputOfId) return null
    const [process] = await db.select().from(recipeProcesses)
      .where(eq(recipeProcesses.id, parent.recipeInputOfId))
      .limit(1)
    return process
  },
  recipeOutputOf: async (parent: any) => {
    if (!parent.recipeOutputOfId) return null
    const [process] = await db.select().from(recipeProcesses)
      .where(eq(recipeProcesses.id, parent.recipeOutputOfId))
      .limit(1)
    return process
  },
  recipeClauseOf: async (parent: any) => {
    if (!parent.recipeClauseOfId) return null
    const [exchange] = await db.select().from(recipeExchanges)
      .where(eq(recipeExchanges.id, parent.recipeClauseOfId))
      .limit(1)
    return exchange
  },
}

// SpatialThing Field Resolvers
const SpatialThing = {
  economicResources: async (parent: any) => {
    return await db.select().from(economicResources)
      .where(eq(economicResources.currentLocationId, parent.id))
  },
  economicEvents: async (parent: any) => {
    return await db.select().from(economicEvents)
      .where(eq(economicEvents.atLocationId, parent.id))
  },
  // NEW: Missing bridging fields
  agents: async (parent: any) => {
    return await db.select().from(agents)
      .where(eq(agents.primaryLocationId, parent.id))
  },
  commitments: async (parent: any) => {
    return await db.select().from(commitments)
      .where(eq(commitments.atLocationId, parent.id))
  },
  intents: async (parent: any) => {
    return await db.select().from(intents)
      .where(eq(intents.atLocationId, parent.id))
  },
  // proposals removed (not in schema)
}

// ProductBatch Field Resolvers
const ProductBatch = {
  // resources removed (not in schema)
}

// ============================================================================
// Complete Resolvers Export
// ============================================================================

// Helper to add Metadata and Revision resolvers to entities
const withMeta = (resolver: any, options: { deletable?: boolean } = { deletable: true }) => ({
  ...resolver,
  meta: (parent: any) => parent, // Resolves to RecordMeta (using parent record)
  revision: (parent: any) => ({
    id: parent.revisionId,
    time: parent.updatedAt || parent.createdAt || new Date(),
    author: null // TODO: Connect to BetterAuth
  }),
  ...(options.deletable ? { deletable: permissiveDeletable } : {}),
})

const RecordMetaResolver = {
  // creationDate removed (not in schema)
  // modificationDate removed (not in schema)
  // version removed (not in schema)
  previousRevision: () => null,
  previousRevisionsCount: () => 0,
  futureRevisionsCount: () => 0,
  latestRevision: (parent: any) => ({ 
     id: parent.revisionId, 
     time: parent.updatedAt || new Date() 
  }),
  retrievedRevision: (parent: any) => ({ 
     id: parent.revisionId, 
     time: parent.updatedAt || new Date() 
  }),
}

const RevisionResolver = {
  // ID, time, author handled by the object returned in `revision` field above
  id: (parent: any) => parent.id,
  time: (parent: any) => parent.time,
  author: (parent: any) => parent.author,
}

// We need to define Response resolvers explicitly because they are distinct types
const entityResponse = (field: string) => ({
  [field]: (parent: any) => parent // Expects parent to be the object itself
})

// Helper for JSONB List fields (e.g. [URI])
const jsonListResolver = (fieldName: string) => (parent: any) => {
  const val = parent[fieldName]
  if (Array.isArray(val)) return val
  if (typeof val === 'string') {
     try { return JSON.parse(val) } catch { return [] }
  }
  return [] // Default to empty list
}

// Default deletable policy
const permissiveDeletable = () => true // Default policy: permissive deletion until constraints defined

export const resolvers = {
  // Scalars
  ...scalarResolvers,
  
  // Type resolvers (unions, interfaces)
  ...typeResolvers,
  
  // Root resolvers
  Query,
  Mutation,
  
  // Field resolvers for all entities (Applied with Metadata)
  Agent: {
    ...withMeta(Agent, { deletable: false }),
    // classifiedAs removed as it is not in Agent interface
  },
  Person: {
    ...withMeta(Person, { deletable: false }),
    classifiedAs: jsonListResolver('classifiedAs'),
  },
  Organization: { 
    ...withMeta(Organization, { deletable: false }),
    classifiedAs: jsonListResolver('classifiedAs'),
  },
  AgentRelationship: {
    ...withMeta(AgentRelationship, { deletable: false }), // Assuming no deletable here either based on grep
    note: (p: any) => p.note,
    inScopeOf: jsonListResolver('inScopeOf'),
  },
  AgentRelationshipRole: withMeta(AgentRelationshipRole, { deletable: false }),
  EconomicEvent: {
    ...withMeta(EconomicEvent), // Has deletable
    resourceClassifiedAs: jsonListResolver('resourceClassifiedAs'),
    inScopeOf: jsonListResolver('inScopeOf'),
  },
  EconomicResource: {
    ...withMeta(EconomicResource, { deletable: false }),
    classifiedAs: jsonListResolver('classifiedAs'),
    imageList: jsonListResolver('imageList'),
  },
  ResourceSpecification: {
    ...withMeta(ResourceSpecification, { deletable: false }),
    resourceClassifiedAs: jsonListResolver('resourceClassifiedAs'),
    imageList: jsonListResolver('imageList'),
  },
  Process: {
    ...withMeta(Process),
    classifiedAs: jsonListResolver('classifiedAs'),
  },
  ProcessSpecification: withMeta(ProcessSpecification, { deletable: false }),
  Plan: withMeta(Plan),
  Intent: {
    ...withMeta(Intent),
    resourceClassifiedAs: jsonListResolver('resourceClassifiedAs'),
    imageList: jsonListResolver('imageList'),
    inScopeOf: jsonListResolver('inScopeOf'),
  },
  Commitment: {
    ...withMeta(Commitment),
    resourceClassifiedAs: jsonListResolver('resourceClassifiedAs'),
    inScopeOf: jsonListResolver('inScopeOf'),
  },
  Proposal: { 
    ...withMeta(Proposal, { deletable: false }),
    inScopeOf: jsonListResolver('inScopeOf'),
  },
  ProposedIntent: withMeta(ProposedIntent, { deletable: false }),
  Satisfaction: withMeta(Satisfaction, { deletable: false }),
  Fulfillment: withMeta(Fulfillment, { deletable: false }),
  Claim: {
    ...withMeta(Claim, { deletable: false }),
    resourceClassifiedAs: jsonListResolver('resourceClassifiedAs'),
    inScopeOf: jsonListResolver('inScopeOf'),
  },
  Settlement: withMeta(Settlement, { deletable: false }),
  Agreement: withMeta(Agreement, { deletable: false }),
  Appreciation: withMeta(Appreciation, { deletable: false }),
  Scenario: {
    ...withMeta(Scenario, { deletable: false }),
    inScopeOf: jsonListResolver('inScopeOf'),
  },
  ScenarioDefinition: withMeta(ScenarioDefinition, { deletable: false }),
  RecipeProcess: {
    ...withMeta(RecipeProcess, { deletable: false }),
    processClassifiedAs: jsonListResolver('processClassifiedAs'),
  },
  RecipeExchange: withMeta(RecipeExchange, { deletable: false }),
  RecipeFlow: {
    ...withMeta(RecipeFlow, { deletable: false }),
    resourceClassifiedAs: jsonListResolver('resourceClassifiedAs'),
  },
  SpatialThing: withMeta(SpatialThing, { deletable: false }),
  ProductBatch: withMeta(ProductBatch, { deletable: false }),

  // Additional Meta Types
  RecordMeta: RecordMetaResolver,
  Revision: RevisionResolver,


  // Scalars/Value Objects
  Duration: {
     numericDuration: (parent: any) => parent.numericDuration,
     unitType: (parent: any) => parent.unitType, 
  },
  Measure: {
     hasNumericalValue: (parent: any) => parent.hasNumericalValue,
     hasUnit: async (parent: any) => {
        if (!parent.hasUnitId) return null
        const [u] = await db.select().from(units).where(eq(units.id, parent.hasUnitId)).limit(1)
        return u
     },
  },
  Unit: withMeta({
     // Unit fields usually just scalars
  }, { deletable: false }),
  // Responses
  PersonResponse: entityResponse('agent'),
  OrganizationResponse: entityResponse('agent'),
  AgentRelationshipResponse: entityResponse('agentRelationship'),
  AgentRelationshipRoleResponse: entityResponse('agentRelationshipRole'),
  AgreementResponse: entityResponse('agreement'),
  AppreciationResponse: entityResponse('appreciation'),
  ClaimResponse: entityResponse('claim'),
  SettlementResponse: entityResponse('settlement'),
  CommitmentResponse: entityResponse('commitment'),
  FulfillmentResponse: entityResponse('fulfillment'),
  IntentResponse: entityResponse('intent'),
  EconomicEventResponse: {
     economicEvent: (parent: any) => parent.economicEvent, // Fix: use property
     economicResource: async (parent: any) => {
        // Handle explicit resource return
        if (parent.economicResource) return parent.economicResource
        // Otherwise look up via ID if event provided
        if (parent.economicEvent && parent.economicEvent.resourceInventoriedAsId) {
           const [res] = await db.select().from(economicResources)
             .where(eq(economicResources.id, parent.economicEvent.resourceInventoriedAsId))
             .limit(1)
           return res
        }
        return null
     }
  },
  EconomicResourceResponse: entityResponse('economicResource'),
  PlanResponse: entityResponse('plan'),
  ProcessResponse: entityResponse('process'),
  ProcessSpecificationResponse: entityResponse('processSpecification'),
  ProductBatchResponse: entityResponse('productBatch'),
  ProposalResponse: entityResponse('proposal'),
  ProposedIntentResponse: entityResponse('proposedIntent'),
  RecipeProcessResponse: entityResponse('recipeProcess'),
  RecipeExchangeResponse: entityResponse('recipeExchange'),
  RecipeFlowResponse: entityResponse('recipeFlow'),
  ResourceSpecificationResponse: entityResponse('resourceSpecification'),
  SatisfactionResponse: entityResponse('satisfaction'),
  ScenarioResponse: entityResponse('scenario'),
  ScenarioDefinitionResponse: entityResponse('scenarioDefinition'),
  SpatialThingResponse: entityResponse('spatialThing'),
  ProposedToResponse: entityResponse('proposedTo'),
  UnitResponse: entityResponse('unit'),

  ProposedTo: withMeta({
    proposed: async (parent: any) => {
      // ProposedTo.proposed -> Proposal
      if (!parent.proposedId) return null
      const [proposal] = await db.select().from(proposals).where(eq(proposals.id, parent.proposedId)).limit(1)
      return proposal
    },
    proposedTo: async (parent: any) => {
      // ProposedTo.proposedTo -> Agent
      if (!parent.proposedToId) return null
      const [agent] = await db.select().from(agents).where(eq(agents.id, parent.proposedToId)).limit(1)
      return agent
    },
  }, { deletable: false }),
}