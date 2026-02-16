/**
 * Complete ValueFlows Database Schema - Using Drizzle Relations API
 * 
 * Implements 100% of ValueFlows specification with proper relation handling.
 * Tables are defined first, then relations are defined separately to avoid circular dependencies.
 */

import { pgTable, text, timestamp, boolean, uuid, jsonb, numeric, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============================================================================
// ENUMS
// ============================================================================

export const timeUnitEnum = pgEnum('time_unit', [
  'year', 'month', 'week', 'day', 'hour', 'minute', 'second'
])

export const agentTypeEnum = pgEnum('agent_type', ['Person', 'Organization'])

// ============================================================================
// BetterAuth Tables
// ============================================================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  name: text('name'),
  password: text('password'),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const verifications = pgTable('verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ============================================================================
// Foundation Tables - NO DEPENDENCIES
// ============================================================================

/**
 * Units of Measure (OM2 vocabulary)
 */
export const units = pgTable('units', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  label: text('label').notNull(),
  symbol: text('symbol').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

/**
 * Actions - ValueFlows action verbs (seeded, read-only)
 */
export const actions = pgTable('actions', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  resourceEffect: text('resource_effect').notNull(),
  onhandEffect: text('onhand_effect').notNull(),
  inputOutput: text('input_output'),
  pairsWith: text('pairs_with'),
})

/**
 * Spatial Things - Physical locations
 */
export const spatialThings = pgTable('spatial_things', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  name: text('name').notNull(),
  mappableAddress: text('mappable_address'),
  lat: numeric('lat', { precision: 10, scale: 7 }),
  long: numeric('long', { precision: 10, scale: 7 }),
  alt: numeric('alt', { precision: 10, scale: 2 }),
  note: text('note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// Agent Module
// ============================================================================

export const agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  agentType: agentTypeEnum('agent_type').notNull(),
  name: text('name').notNull(),
  image: text('image'),
  note: text('note'),
  classifiedAs: jsonb('classified_as').$type<string[]>(),
  primaryLocationId: uuid('primary_location_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const agentRelationshipRoles = pgTable('agent_relationship_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  roleLabel: text('role_label').notNull(),
  inverseRoleLabel: text('inverse_role_label'),
  note: text('note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const agentRelationships = pgTable('agent_relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  subjectId: uuid('subject_id').notNull(),
  objectId: uuid('object_id').notNull(),
  relationshipId: uuid('relationship_id').notNull(),
  inScopeOf: jsonb('in_scope_of').$type<string[]>(),
  note: text('note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// Resource Module
// ============================================================================

export const productBatches = pgTable('product_batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  batchNumber: text('batch_number').notNull(),
  expiryDate: timestamp('expiry_date'),
  productionDate: timestamp('production_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const resourceSpecifications = pgTable('resource_specifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  name: text('name').notNull(),
  image: text('image'),
  imageList: jsonb('image_list').$type<string[]>(),
  resourceClassifiedAs: jsonb('resource_classified_as').$type<string[]>(),
  note: text('note'),
  defaultUnitOfResourceId: uuid('default_unit_of_resource_id'),
  defaultUnitOfEffortId: uuid('default_unit_of_effort_id'),
  substitutable: boolean('substitutable').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const economicResources = pgTable('economic_resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  name: text('name'),
  classifiedAs: jsonb('classified_as').$type<string[]>(),
  trackingIdentifier: text('tracking_identifier'),
  image: text('image'),
  imageList: jsonb('image_list').$type<string[]>(),
  note: text('note'),
  accountingQuantity: jsonb('accounting_quantity'),
  onhandQuantity: jsonb('onhand_quantity'),
  conformsToId: uuid('conforms_to_id'),
  currentLocationId: uuid('current_location_id'),
  lotId: uuid('lot_id'),
  containedInId: uuid('contained_in_id'),
  unitOfEffortId: uuid('unit_of_effort_id'),
  stateId: text('state_id'),
  primaryAccountableId: uuid('primary_accountable_id'),
  custodianId: uuid('custodian_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// Process Module
// ============================================================================

export const processSpecifications = pgTable('process_specifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  name: text('name').notNull(),
  note: text('note'),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  name: text('name').notNull(),
  note: text('note'),
  created: timestamp('created').notNull().defaultNow(),
  due: timestamp('due'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const processes = pgTable('processes', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  name: text('name').notNull(),
  note: text('note'),
  classifiedAs: jsonb('classified_as').$type<string[]>(),
  hasBeginning: timestamp('has_beginning'),
  hasEnd: timestamp('has_end'),
  finished: boolean('finished').notNull().default(false),
  basedOnId: uuid('based_on_id'),
  plannedWithinId: uuid('planned_within_id'),
  nestedInId: uuid('nested_in_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// Observation Module
// ============================================================================

export const economicEvents = pgTable('economic_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  actionId: text('action_id').notNull(),
  note: text('note'),
  resourceQuantity: jsonb('resource_quantity'),
  effortQuantity: jsonb('effort_quantity'),
  hasBeginning: timestamp('has_beginning'),
  hasEnd: timestamp('has_end'),
  hasPointInTime: timestamp('has_point_in_time'),
  providerId: uuid('provider_id').notNull(),
  receiverId: uuid('receiver_id').notNull(),
  resourceInventoriedAsId: uuid('resource_inventoried_as_id'),
  toResourceInventoriedAsId: uuid('to_resource_inventoried_as_id'),
  resourceClassifiedAs: jsonb('resource_classified_as').$type<string[]>(),
  resourceConformsToId: uuid('resource_conforms_to_id'),
  atLocationId: uuid('at_location_id'),
  inputOfId: uuid('input_of_id'),
  outputOfId: uuid('output_of_id'),
  agreedIn: text('agreed_in'),
  realizationOfId: uuid('realization_of_id'),
  triggeredById: uuid('triggered_by_id'),
  inScopeOf: jsonb('in_scope_of').$type<string[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// Planning Module
// ============================================================================

export const intents = pgTable('intents', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  name: text('name'),
  actionId: text('action_id').notNull(),
  note: text('note'),
  image: text('image'),
  imageList: jsonb('image_list').$type<string[]>(),
  resourceQuantity: jsonb('resource_quantity'),
  effortQuantity: jsonb('effort_quantity'),
  availableQuantity: jsonb('available_quantity'),
  hasBeginning: timestamp('has_beginning'),
  hasEnd: timestamp('has_end'),
  hasPointInTime: timestamp('has_point_in_time'),
  due: timestamp('due'),
  finished: boolean('finished').notNull().default(false),
  providerId: uuid('provider_id'),
  receiverId: uuid('receiver_id'),
  resourceInventoriedAsId: uuid('resource_inventoried_as_id'),
  toResourceInventoriedAsId: uuid('to_resource_inventoried_as_id'),
  resourceClassifiedAs: jsonb('resource_classified_as').$type<string[]>(),
  resourceConformsToId: uuid('resource_conforms_to_id'),
  atLocationId: uuid('at_location_id'),
  inputOfId: uuid('input_of_id'),
  outputOfId: uuid('output_of_id'),
  agreedIn: text('agreed_in'),
  inScopeOf: jsonb('in_scope_of').$type<string[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const commitments = pgTable('commitments', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  actionId: text('action_id').notNull(),
  note: text('note'),
  resourceQuantity: jsonb('resource_quantity'),
  effortQuantity: jsonb('effort_quantity'),
  hasBeginning: timestamp('has_beginning'),
  hasEnd: timestamp('has_end'),
  hasPointInTime: timestamp('has_point_in_time'),
  due: timestamp('due'),
  created: timestamp('created').notNull().defaultNow(),
  finished: boolean('finished').notNull().default(false),
  providerId: uuid('provider_id').notNull(),
  receiverId: uuid('receiver_id').notNull(),
  resourceInventoriedAsId: uuid('resource_inventoried_as_id'),
  toResourceInventoriedAsId: uuid('to_resource_inventoried_as_id'),
  resourceClassifiedAs: jsonb('resource_classified_as').$type<string[]>(),
  resourceConformsToId: uuid('resource_conforms_to_id'),
  atLocationId: uuid('at_location_id'),
  inputOfId: uuid('input_of_id'),
  outputOfId: uuid('output_of_id'),
  clauseOfId: uuid('clause_of_id'),
  independentDemandOfId: uuid('independent_demand_of_id'),
  plannedWithinId: uuid('planned_within_id'),
  agreedIn: text('agreed_in'),
  inScopeOf: jsonb('in_scope_of').$type<string[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// Proposal Module
// ============================================================================

export const proposals = pgTable('proposals', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  name: text('name'),
  note: text('note'),
  hasBeginning: timestamp('has_beginning'),
  hasEnd: timestamp('has_end'),
  unitBased: boolean('unit_based').notNull().default(false),
  created: timestamp('created').notNull().defaultNow(),
  eligibleLocationId: uuid('eligible_location_id'),
  inScopeOf: jsonb('in_scope_of').$type<string[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const proposedIntents = pgTable('proposed_intents', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  publishedInId: uuid('published_in_id').notNull(),
  publishesId: uuid('publishes_id').notNull(),
  reciprocal: boolean('reciprocal').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// Relationship Module
// ============================================================================

export const satisfactions = pgTable('satisfactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  satisfiesId: uuid('satisfies_id').notNull(),
  satisfiedById: uuid('satisfied_by_id').notNull(),
  satisfiedByType: text('satisfied_by_type').notNull(),
  resourceQuantity: jsonb('resource_quantity'),
  effortQuantity: jsonb('effort_quantity'),
  note: text('note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const fulfillments = pgTable('fulfillments', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  fulfillsId: uuid('fulfills_id').notNull(),
  fulfilledById: uuid('fulfilled_by_id').notNull(),
  resourceQuantity: jsonb('resource_quantity'),
  effortQuantity: jsonb('effort_quantity'),
  note: text('note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// Advanced Module
// ============================================================================

export const agreements = pgTable('agreements', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  name: text('name'),
  note: text('note'),
  created: timestamp('created').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const claims = pgTable('claims', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  actionId: text('action_id').notNull(),
  note: text('note'),
  resourceQuantity: jsonb('resource_quantity'),
  effortQuantity: jsonb('effort_quantity'),
  due: timestamp('due'),
  created: timestamp('created').notNull().defaultNow(),
  finished: boolean('finished').notNull().default(false),
  providerId: uuid('provider_id').notNull(),
  receiverId: uuid('receiver_id').notNull(),
  resourceClassifiedAs: jsonb('resource_classified_as').$type<string[]>(),
  resourceConformsToId: uuid('resource_conforms_to_id'),
  triggeredById: uuid('triggered_by_id').notNull(),
  agreedIn: text('agreed_in'),
  inScopeOf: jsonb('in_scope_of').$type<string[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const settlements = pgTable('settlements', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  settlesId: uuid('settles_id').notNull(),
  settledById: uuid('settled_by_id').notNull(),
  resourceQuantity: jsonb('resource_quantity'),
  effortQuantity: jsonb('effort_quantity'),
  note: text('note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const appreciations = pgTable('appreciations', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  appreciationOfId: uuid('appreciation_of_id').notNull(),
  appreciationWithId: uuid('appreciation_with_id').notNull(),
  appreciatedById: uuid('appreciated_by_id').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// Scenario Module
// ============================================================================

export const scenarioDefinitions = pgTable('scenario_definitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  name: text('name').notNull(),
  note: text('note'),
  hasDuration: jsonb('has_duration'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const scenarios = pgTable('scenarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  name: text('name').notNull(),
  note: text('note'),
  hasBeginning: timestamp('has_beginning'),
  hasEnd: timestamp('has_end'),
  definedAsId: uuid('defined_as_id'),
  refinementOfId: uuid('refinement_of_id'),
  inScopeOf: jsonb('in_scope_of').$type<string[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// Recipe Module
// ============================================================================

export const recipeProcesses = pgTable('recipe_processes', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  name: text('name').notNull(),
  note: text('note'),
  processClassifiedAs: jsonb('process_classified_as').$type<string[]>(),
  hasDuration: jsonb('has_duration'),
  basedOnId: uuid('based_on_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const recipeExchanges = pgTable('recipe_exchanges', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  name: text('name').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const recipeFlows = pgTable('recipe_flows', {
  id: uuid('id').primaryKey().defaultRandom(),
  revisionId: uuid('revision_id').notNull().defaultRandom(),
  actionId: text('action_id').notNull(),
  note: text('note'),
  resourceQuantity: jsonb('resource_quantity'),
  effortQuantity: jsonb('effort_quantity'),
  resourceClassifiedAs: jsonb('resource_classified_as').$type<string[]>(),
  resourceConformsToId: uuid('resource_conforms_to_id'),
  state: text('state'),
  recipeInputOfId: uuid('recipe_input_of_id'),
  recipeOutputOfId: uuid('recipe_output_of_id'),
  recipeClauseOfId: uuid('recipe_clause_of_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================================================
// RELATIONS - Defined separately to avoid circular dependencies
// ============================================================================

// Agent Relations
export const agentsRelations = relations(agents, ({ one, many }) => ({
  primaryLocation: one(spatialThings, {
    fields: [agents.primaryLocationId],
    references: [spatialThings.id],
  }),
  subjectRelationships: many(agentRelationships, { relationName: 'subject' }),
  objectRelationships: many(agentRelationships, { relationName: 'object' }),
  providedEvents: many(economicEvents, { relationName: 'provider' }),
  receivedEvents: many(economicEvents, { relationName: 'receiver' }),
  providedCommitments: many(commitments, { relationName: 'provider' }),
  receivedCommitments: many(commitments, { relationName: 'receiver' }),
  providedIntents: many(intents, { relationName: 'provider' }),
  receivedIntents: many(intents, { relationName: 'receiver' }),
  accountableResources: many(economicResources, { relationName: 'accountable' }),
  custodiedResources: many(economicResources, { relationName: 'custodian' }),
  providedClaims: many(claims, { relationName: 'claimProvider' }),
  receivedClaims: many(claims, { relationName: 'claimReceiver' }),
  appreciations: many(appreciations),
}))

export const agentRelationshipsRelations = relations(agentRelationships, ({ one }) => ({
  subject: one(agents, {
    fields: [agentRelationships.subjectId],
    references: [agents.id],
    relationName: 'subject',
  }),
  object: one(agents, {
    fields: [agentRelationships.objectId],
    references: [agents.id],
    relationName: 'object',
  }),
  relationship: one(agentRelationshipRoles, {
    fields: [agentRelationships.relationshipId],
    references: [agentRelationshipRoles.id],
  }),
}))

export const agentRelationshipRolesRelations = relations(agentRelationshipRoles, ({ many }) => ({
  relationships: many(agentRelationships),
}))

// Resource Relations
export const resourceSpecificationsRelations = relations(resourceSpecifications, ({ one, many }) => ({
  defaultUnitOfResource: one(units, {
    fields: [resourceSpecifications.defaultUnitOfResourceId],
    references: [units.id],
    relationName: 'resourceUnit',
  }),
  defaultUnitOfEffort: one(units, {
    fields: [resourceSpecifications.defaultUnitOfEffortId],
    references: [units.id],
    relationName: 'effortUnit',
  }),
  resources: many(economicResources),
  events: many(economicEvents),
  intents: many(intents),
  commitments: many(commitments),
  claims: many(claims),
  recipeFlows: many(recipeFlows),
}))

export const economicResourcesRelations = relations(economicResources, ({ one, many }) => ({
  conformsTo: one(resourceSpecifications, {
    fields: [economicResources.conformsToId],
    references: [resourceSpecifications.id],
  }),
  currentLocation: one(spatialThings, {
    fields: [economicResources.currentLocationId],
    references: [spatialThings.id],
  }),
  lot: one(productBatches, {
    fields: [economicResources.lotId],
    references: [productBatches.id],
  }),
  containedIn: one(economicResources, {
    fields: [economicResources.containedInId],
    references: [economicResources.id],
    relationName: 'container',
  }),
  contains: many(economicResources, { relationName: 'container' }),
  unitOfEffort: one(units, {
    fields: [economicResources.unitOfEffortId],
    references: [units.id],
  }),
  state: one(actions, {
    fields: [economicResources.stateId],
    references: [actions.id],
  }),
  primaryAccountable: one(agents, {
    fields: [economicResources.primaryAccountableId],
    references: [agents.id],
    relationName: 'accountable',
  }),
  custodian: one(agents, {
    fields: [economicResources.custodianId],
    references: [agents.id],
    relationName: 'custodian',
  }),
  events: many(economicEvents, { relationName: 'resourceInventoriedAs' }),
  toEvents: many(economicEvents, { relationName: 'toResourceInventoriedAs' }),
  intents: many(intents, { relationName: 'resourceInventoriedAs' }),
  toIntents: many(intents, { relationName: 'toResourceInventoriedAs' }),
  commitments: many(commitments, { relationName: 'resourceInventoriedAs' }),
  toCommitments: many(commitments, { relationName: 'toResourceInventoriedAs' }),
}))

export const productBatchesRelations = relations(productBatches, ({ many }) => ({
  resources: many(economicResources),
}))

// Process Relations
export const processSpecificationsRelations = relations(processSpecifications, ({ many }) => ({
  processes: many(processes),
  recipeProcesses: many(recipeProcesses),
}))

export const plansRelations = relations(plans, ({ many }) => ({
  processes: many(processes),
  commitments: many(commitments, { relationName: 'plannedWithin' }),
  independentDemands: many(commitments, { relationName: 'independentDemand' }),
}))

export const processesRelations = relations(processes, ({ one, many }) => ({
  basedOn: one(processSpecifications, {
    fields: [processes.basedOnId],
    references: [processSpecifications.id],
  }),
  plannedWithin: one(plans, {
    fields: [processes.plannedWithinId],
    references: [plans.id],
  }),
  nestedIn: one(processes, {
    fields: [processes.nestedInId],
    references: [processes.id],
    relationName: 'parent',
  }),
  nestedProcesses: many(processes, { relationName: 'parent' }),
  inputs: many(economicEvents, { relationName: 'inputOf' }),
  outputs: many(economicEvents, { relationName: 'outputOf' }),
  intentInputs: many(intents, { relationName: 'inputOf' }),
  intentOutputs: many(intents, { relationName: 'outputOf' }),
  commitmentInputs: many(commitments, { relationName: 'inputOf' }),
  commitmentOutputs: many(commitments, { relationName: 'outputOf' }),
}))

// Event Relations
export const economicEventsRelations = relations(economicEvents, ({ one, many }) => ({
  action: one(actions, {
    fields: [economicEvents.actionId],
    references: [actions.id],
  }),
  provider: one(agents, {
    fields: [economicEvents.providerId],
    references: [agents.id],
    relationName: 'provider',
  }),
  receiver: one(agents, {
    fields: [economicEvents.receiverId],
    references: [agents.id],
    relationName: 'receiver',
  }),
  resourceInventoriedAs: one(economicResources, {
    fields: [economicEvents.resourceInventoriedAsId],
    references: [economicResources.id],
    relationName: 'resourceInventoriedAs',
  }),
  toResourceInventoriedAs: one(economicResources, {
    fields: [economicEvents.toResourceInventoriedAsId],
    references: [economicResources.id],
    relationName: 'toResourceInventoriedAs',
  }),
  resourceConformsTo: one(resourceSpecifications, {
    fields: [economicEvents.resourceConformsToId],
    references: [resourceSpecifications.id],
  }),
  atLocation: one(spatialThings, {
    fields: [economicEvents.atLocationId],
    references: [spatialThings.id],
  }),
  inputOf: one(processes, {
    fields: [economicEvents.inputOfId],
    references: [processes.id],
    relationName: 'inputOf',
  }),
  outputOf: one(processes, {
    fields: [economicEvents.outputOfId],
    references: [processes.id],
    relationName: 'outputOf',
  }),
  triggeredBy: one(economicEvents, {
    fields: [economicEvents.triggeredById],
    references: [economicEvents.id],
    relationName: 'trigger',
  }),
  triggers: many(economicEvents, { relationName: 'trigger' }),
  fulfillments: many(fulfillments),
  satisfactions: many(satisfactions),
  claims: many(claims),
  settlements: many(settlements),
  appreciationsOf: many(appreciations, { relationName: 'appreciationOf' }),
  appreciationsWith: many(appreciations, { relationName: 'appreciationWith' }),
}))

// Intent/Commitment Relations
export const intentsRelations = relations(intents, ({ one, many }) => ({
  action: one(actions, {
    fields: [intents.actionId],
    references: [actions.id],
  }),
  provider: one(agents, {
    fields: [intents.providerId],
    references: [agents.id],
    relationName: 'provider',
  }),
  receiver: one(agents, {
    fields: [intents.receiverId],
    references: [agents.id],
    relationName: 'receiver',
  }),
  resourceInventoriedAs: one(economicResources, {
    fields: [intents.resourceInventoriedAsId],
    references: [economicResources.id],
    relationName: 'resourceInventoriedAs',
  }),
  toResourceInventoriedAs: one(economicResources, {
    fields: [intents.toResourceInventoriedAsId],
    references: [economicResources.id],
    relationName: 'toResourceInventoriedAs',
  }),
  resourceConformsTo: one(resourceSpecifications, {
    fields: [intents.resourceConformsToId],
    references: [resourceSpecifications.id],
  }),
  atLocation: one(spatialThings, {
    fields: [intents.atLocationId],
    references: [spatialThings.id],
  }),
  inputOf: one(processes, {
    fields: [intents.inputOfId],
    references: [processes.id],
    relationName: 'inputOf',
  }),
  outputOf: one(processes, {
    fields: [intents.outputOfId],
    references: [processes.id],
    relationName: 'outputOf',
  }),
  satisfactions: many(satisfactions),
  publishedIn: many(proposedIntents),
}))

export const commitmentsRelations = relations(commitments, ({ one, many }) => ({
  action: one(actions, {
    fields: [commitments.actionId],
    references: [actions.id],
  }),
  provider: one(agents, {
    fields: [commitments.providerId],
    references: [agents.id],
    relationName: 'provider',
  }),
  receiver: one(agents, {
    fields: [commitments.receiverId],
    references: [agents.id],
    relationName: 'receiver',
  }),
  resourceInventoriedAs: one(economicResources, {
    fields: [commitments.resourceInventoriedAsId],
    references: [economicResources.id],
    relationName: 'resourceInventoriedAs',
  }),
  toResourceInventoriedAs: one(economicResources, {
    fields: [commitments.toResourceInventoriedAsId],
    references: [economicResources.id],
    relationName: 'toResourceInventoriedAs',
  }),
  resourceConformsTo: one(resourceSpecifications, {
    fields: [commitments.resourceConformsToId],
    references: [resourceSpecifications.id],
  }),
  atLocation: one(spatialThings, {
    fields: [commitments.atLocationId],
    references: [spatialThings.id],
  }),
  inputOf: one(processes, {
    fields: [commitments.inputOfId],
    references: [processes.id],
    relationName: 'inputOf',
  }),
  outputOf: one(processes, {
    fields: [commitments.outputOfId],
    references: [processes.id],
    relationName: 'outputOf',
  }),
  independentDemandOf: one(plans, {
    fields: [commitments.independentDemandOfId],
    references: [plans.id],
    relationName: 'independentDemand',
  }),
  plannedWithin: one(plans, {
    fields: [commitments.plannedWithinId],
    references: [plans.id],
    relationName: 'plannedWithin',
  }),
  fulfillments: many(fulfillments),
  satisfactions: many(satisfactions),
}))

// Proposal Relations
export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  eligibleLocation: one(spatialThings, {
    fields: [proposals.eligibleLocationId],
    references: [spatialThings.id],
  }),
  publishedIntents: many(proposedIntents),
}))

export const proposedIntentsRelations = relations(proposedIntents, ({ one }) => ({
  publishedIn: one(proposals, {
    fields: [proposedIntents.publishedInId],
    references: [proposals.id],
  }),
  publishes: one(intents, {
    fields: [proposedIntents.publishesId],
    references: [intents.id],
  }),
}))

// Satisfaction/Fulfillment Relations
export const satisfactionsRelations = relations(satisfactions, ({ one }) => ({
  satisfies: one(intents, {
    fields: [satisfactions.satisfiesId],
    references: [intents.id],
  }),
  // satisfiedBy can be either EconomicEvent or Commitment
  // We'll handle this in the resolver based on satisfiedByType
}))

export const fulfillmentsRelations = relations(fulfillments, ({ one }) => ({
  fulfills: one(commitments, {
    fields: [fulfillments.fulfillsId],
    references: [commitments.id],
  }),
  fulfilledBy: one(economicEvents, {
    fields: [fulfillments.fulfilledById],
    references: [economicEvents.id],
  }),
}))

// Claim Relations
export const claimsRelations = relations(claims, ({ one, many }) => ({
  action: one(actions, {
    fields: [claims.actionId],
    references: [actions.id],
  }),
  provider: one(agents, {
    fields: [claims.providerId],
    references: [agents.id],
    relationName: 'claimProvider',
  }),
  receiver: one(agents, {
    fields: [claims.receiverId],
    references: [agents.id],
    relationName: 'claimReceiver',
  }),
  resourceConformsTo: one(resourceSpecifications, {
    fields: [claims.resourceConformsToId],
    references: [resourceSpecifications.id],
  }),
  triggeredBy: one(economicEvents, {
    fields: [claims.triggeredById],
    references: [economicEvents.id],
  }),
  settlements: many(settlements),
}))

export const settlementsRelations = relations(settlements, ({ one }) => ({
  settles: one(claims, {
    fields: [settlements.settlesId],
    references: [claims.id],
  }),
  settledBy: one(economicEvents, {
    fields: [settlements.settledById],
    references: [economicEvents.id],
  }),
}))

export const appreciationsRelations = relations(appreciations, ({ one }) => ({
  appreciationOf: one(economicEvents, {
    fields: [appreciations.appreciationOfId],
    references: [economicEvents.id],
    relationName: 'appreciationOf',
  }),
  appreciationWith: one(economicEvents, {
    fields: [appreciations.appreciationWithId],
    references: [economicEvents.id],
    relationName: 'appreciationWith',
  }),
  appreciatedBy: one(agents, {
    fields: [appreciations.appreciatedById],
    references: [agents.id],
  }),
}))

// Scenario Relations
export const scenarioDefinitionsRelations = relations(scenarioDefinitions, ({ many }) => ({
  scenarios: many(scenarios),
}))

export const scenariosRelations = relations(scenarios, ({ one, many }) => ({
  definedAs: one(scenarioDefinitions, {
    fields: [scenarios.definedAsId],
    references: [scenarioDefinitions.id],
  }),
  refinementOf: one(scenarios, {
    fields: [scenarios.refinementOfId],
    references: [scenarios.id],
    relationName: 'refinement',
  }),
  refinements: many(scenarios, { relationName: 'refinement' }),
}))

// Recipe Relations
export const recipeProcessesRelations = relations(recipeProcesses, ({ one, many }) => ({
  basedOn: one(processSpecifications, {
    fields: [recipeProcesses.basedOnId],
    references: [processSpecifications.id],
  }),
  inputs: many(recipeFlows, { relationName: 'recipeInputOf' }),
  outputs: many(recipeFlows, { relationName: 'recipeOutputOf' }),
}))

export const recipeExchangesRelations = relations(recipeExchanges, ({ many }) => ({
  clauses: many(recipeFlows),
}))

export const recipeFlowsRelations = relations(recipeFlows, ({ one }) => ({
  action: one(actions, {
    fields: [recipeFlows.actionId],
    references: [actions.id],
  }),
  resourceConformsTo: one(resourceSpecifications, {
    fields: [recipeFlows.resourceConformsToId],
    references: [resourceSpecifications.id],
  }),
  recipeInputOf: one(recipeProcesses, {
    fields: [recipeFlows.recipeInputOfId],
    references: [recipeProcesses.id],
    relationName: 'recipeInputOf',
  }),
  recipeOutputOf: one(recipeProcesses, {
    fields: [recipeFlows.recipeOutputOfId],
    references: [recipeProcesses.id],
    relationName: 'recipeOutputOf',
  }),
  recipeClauseOf: one(recipeExchanges, {
    fields: [recipeFlows.recipeClauseOfId],
    references: [recipeExchanges.id],
  }),
}))

// Spatial Thing Relations
export const spatialThingsRelations = relations(spatialThings, ({ many }) => ({
  agentLocations: many(agents),
  resourceLocations: many(economicResources),
  eventLocations: many(economicEvents),
  intentLocations: many(intents),
  commitmentLocations: many(commitments),
  proposalLocations: many(proposals),
}))

// Unit Relations
export const unitsRelations = relations(units, ({ many }) => ({
  resourceSpecsAsResource: many(resourceSpecifications, { relationName: 'resourceUnit' }),
  resourceSpecsAsEffort: many(resourceSpecifications, { relationName: 'effortUnit' }),
  resources: many(economicResources),
}))

// Action Relations
export const actionsRelations = relations(actions, ({ many }) => ({
  events: many(economicEvents),
  intents: many(intents),
  commitments: many(commitments),
  claims: many(claims),
  recipeFlows: many(recipeFlows),
  resourceStates: many(economicResources),
}))

// ============================================================================
// Type Exports
// ============================================================================

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert

export type Unit = typeof units.$inferSelect
export type NewUnit = typeof units.$inferInsert
export type Action = typeof actions.$inferSelect
export type SpatialThing = typeof spatialThings.$inferSelect
export type NewSpatialThing = typeof spatialThings.$inferInsert

export type Agent = typeof agents.$inferSelect
export type NewAgent = typeof agents.$inferInsert
export type AgentRelationshipRole = typeof agentRelationshipRoles.$inferSelect
export type NewAgentRelationshipRole = typeof agentRelationshipRoles.$inferInsert
export type AgentRelationship = typeof agentRelationships.$inferSelect
export type NewAgentRelationship = typeof agentRelationships.$inferInsert

export type ProductBatch = typeof productBatches.$inferSelect
export type NewProductBatch = typeof productBatches.$inferInsert
export type ResourceSpecification = typeof resourceSpecifications.$inferSelect
export type NewResourceSpecification = typeof resourceSpecifications.$inferInsert
export type EconomicResource = typeof economicResources.$inferSelect
export type NewEconomicResource = typeof economicResources.$inferInsert

export type ProcessSpecification = typeof processSpecifications.$inferSelect
export type NewProcessSpecification = typeof processSpecifications.$inferInsert
export type Plan = typeof plans.$inferSelect
export type NewPlan = typeof plans.$inferInsert
export type Process = typeof processes.$inferSelect
export type NewProcess = typeof processes.$inferInsert

export type EconomicEvent = typeof economicEvents.$inferSelect
export type NewEconomicEvent = typeof economicEvents.$inferInsert
export type Intent = typeof intents.$inferSelect
export type NewIntent = typeof intents.$inferInsert
export type Commitment = typeof commitments.$inferSelect
export type NewCommitment = typeof commitments.$inferInsert

export type Proposal = typeof proposals.$inferSelect
export type NewProposal = typeof proposals.$inferInsert
export type ProposedIntent = typeof proposedIntents.$inferSelect
export type NewProposedIntent = typeof proposedIntents.$inferInsert

export type Satisfaction = typeof satisfactions.$inferSelect
export type NewSatisfaction = typeof satisfactions.$inferInsert
export type Fulfillment = typeof fulfillments.$inferSelect
export type NewFulfillment = typeof fulfillments.$inferInsert

export type Agreement = typeof agreements.$inferSelect
export type NewAgreement = typeof agreements.$inferInsert
export type Claim = typeof claims.$inferSelect
export type NewClaim = typeof claims.$inferInsert
export type Settlement = typeof settlements.$inferSelect
export type NewSettlement = typeof settlements.$inferInsert
export type Appreciation = typeof appreciations.$inferSelect
export type NewAppreciation = typeof appreciations.$inferInsert

export type ScenarioDefinition = typeof scenarioDefinitions.$inferSelect
export type NewScenarioDefinition = typeof scenarioDefinitions.$inferInsert
export type Scenario = typeof scenarios.$inferSelect
export type NewScenario = typeof scenarios.$inferInsert

export type RecipeProcess = typeof recipeProcesses.$inferSelect
export type NewRecipeProcess = typeof recipeProcesses.$inferInsert
export type RecipeExchange = typeof recipeExchanges.$inferSelect
export type NewRecipeExchange = typeof recipeExchanges.$inferInsert
export type RecipeFlow = typeof recipeFlows.$inferSelect
export type NewRecipeFlow = typeof recipeFlows.$inferInsert
