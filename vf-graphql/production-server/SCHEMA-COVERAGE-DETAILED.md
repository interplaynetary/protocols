# ValueFlows Schema Coverage Analysis

**Complete field-by-field mapping of GraphQL schemas to Drizzle implementation**

## Legend

- ✅ **Complete**: Field exists in database AND has resolver
- ⚠️ **Partial**: Field exists in database OR has resolver (not both)
- ❌ **Missing**: Field does not exist in database or resolver
- 🔵 **Computed**: Field is computed/derived, not stored in database

---

## 1. measurement.gql

### Type: `TimeUnit` (enum)

**Status**: ✅ Complete (handled by TypeScript enum in type-resolvers.ts)

- Values: year, month, week, day, hour, minute, second

### Type: `Duration`

**Status**: ✅ Complete

- `numericDuration: Decimal!` - 🔵 Computed from JSON
- `unitType: TimeUnit!` - 🔵 Computed from JSON
- **Resolver**: `type-resolvers.ts` - Duration resolver
- **Storage**: Stored as JSON in various duration fields

### Type: `Unit`

**Status**: ✅ Complete

- `id: ID!` - ✅ DB: `units.id`
- `revisionId: ID!` - ✅ DB: `units.revisionId`
- `label: String!` - ✅ DB: `units.label`
- `symbol: String!` - ✅ DB: `units.symbol`
- **Table**: `units` in schema.ts
- **Resolvers**: Query (unit, units), Mutation (create, update, delete)

### Type: `Measure`

**Status**: ✅ Complete

- `hasNumericalValue: Decimal!` - 🔵 Computed from JSON
- `hasUnit: Unit` - ✅ Resolver in `type-resolvers.ts`
- **Resolver**: `type-resolvers.ts` - Measure resolver with hasUnit lookup
- **Storage**: Stored as JSON with `{hasNumericalValue, hasUnitId}`

---

## 2. action.gql

### Type: `Action`

**Status**: ✅ Complete

- `id: ID!` - ✅ DB: `actions.id`
- `label: String!` - ✅ DB: `actions.label`
- `resourceEffect: String!` - ✅ DB: `actions.resourceEffect`
- `onhandEffect: String!` - ✅ DB: `actions.onhandEffect`
- `inputOutput: String` - ✅ DB: `actions.inputOutput`
- `pairsWith: String` - ✅ DB: `actions.pairsWith`
- **Table**: `actions` in schema.ts
- **Resolvers**: Query (action, actions) - read-only
- **Seed Data**: `seed-actions.ts` with 18 standard VF actions

---

## 3. geolocation.gql

### Type: `SpatialThing`

**Status**: ✅ Complete

- `id: ID!` - ✅ DB: `spatialThings.id`
- `revisionId: ID!` - ✅ DB: `spatialThings.revisionId`
- `name: String!` - ✅ DB: `spatialThings.name`
- `mappableAddress: String` - ✅ DB: `spatialThings.mappableAddress`
- `lat: Decimal` - ✅ DB: `spatialThings.lat`
- `long: Decimal` - ✅ DB: `spatialThings.long`
- `alt: Decimal` - ✅ DB: `spatialThings.alt`
- `note: String` - ✅ DB: `spatialThings.note`
- **Table**: `spatialThings` in schema.ts
- **Resolvers**:
    - Query (spatialThing, spatialThings)
    - Mutation (create, update, delete)
    - **Field Resolvers**: economicResources, economicEvents

---

## 4. agent.gql

### Union: `AccountingScope`

**Status**: ✅ Complete

- `Person | Organization` - ✅ Resolver in `type-resolvers.ts`

### Interface: `Agent`

**Status**: ✅ Complete

- `id: ID!` - ✅ DB: `agents.id`
- `revisionId: ID!` - ✅ DB: `agents.revisionId`
- `name: String!` - ✅ DB: `agents.name`
- `image: URI` - ✅ DB: `agents.image`
- `note: String` - ✅ DB: `agents.note`
- **Inverse Relationships**:
    - `relationships` - ✅ Field resolver
    - `relationshipsAsSubject` - ✅ Field resolver
    - `relationshipsAsObject` - ✅ Field resolver
    - `roles` - ✅ Field resolver
- **Resolver**: `__resolveType` in resolvers.ts

### Type: `Person` (implements Agent)

**Status**: ✅ Complete

- All Agent fields - ✅ Inherited
- **DB**: `agents` table with `agentType = 'Person'`
- **Resolvers**:
    - Query (person, people)
    - Mutation (create, update, delete)
    - **Field Resolvers**: All Agent fields + economicEvents, intents, commitments

### Type: `Organization` (implements Agent)

**Status**: ✅ Complete

- All Agent fields - ✅ Inherited
- `classifiedAs: [URI!]` - ✅ DB: `agents.classifiedAs` (JSON array)
- **DB**: `agents` table with `agentType = 'Organization'`
- **Resolvers**:
    - Query (organization, organizations)
    - Mutation (create, update, delete)
    - **Field Resolvers**: Same as Person

### Type: `AgentRelationship`

**Status**: ✅ Complete

- `id: ID!` - ✅ DB: `agentRelationships.id`
- `revisionId: ID!` - ✅ DB: `agentRelationships.revisionId`
- `subject: Agent!` - ✅ DB: `agentRelationships.subjectId` + Field resolver
- `object: Agent!` - ✅ DB: `agentRelationships.objectId` + Field resolver
- `relationship: AgentRelationshipRole!` - ✅ DB: `agentRelationships.relationshipId` + Field resolver
- `inScopeOf: [AccountingScope!]` - ✅ DB: `agentRelationships.inScopeOf` (JSON) + Field resolver
- `note: String` - ✅ DB: `agentRelationships.note`
- **Table**: `agentRelationships` in schema.ts
- **Resolvers**: Query, Mutation, Field resolvers

### Type: `AgentRelationshipRole`

**Status**: ✅ Complete

- `id: ID!` - ✅ DB: `agentRelationshipRoles.id`
- `revisionId: ID!` - ✅ DB: `agentRelationshipRoles.revisionId`
- `roleLabel: String!` - ✅ DB: `agentRelationshipRoles.roleLabel`
- `inverseRoleLabel: String` - ✅ DB: `agentRelationshipRoles.inverseRoleLabel`
- `note: String` - ✅ DB: `agentRelationshipRoles.note`
- **Inverse**: `agentRelationships` - ✅ Field resolver
- **Table**: `agentRelationshipRoles` in schema.ts
- **Resolvers**: Query, Mutation, Field resolvers

---

## 5. observation.gql

### Union: `TrackTraceItem`

**Status**: ✅ Complete

- `EconomicResource | EconomicEvent` - ✅ Resolver in `type-resolvers.ts`

### Union: `ProductionFlowItem`

**Status**: ✅ Complete

- `EconomicResource` - ✅ Resolver in `type-resolvers.ts`

### Type: `EconomicEvent`

**Status**: ⚠️ Mostly Complete (missing track/trace)

- `id: ID!` - ✅ DB: `economicEvents.id`
- `revisionId: ID!` - ✅ DB: `economicEvents.revisionId`
- `action: Action!` - ✅ DB: `economicEvents.actionId` + Field resolver
- `resourceInventoriedAs: EconomicResource` - ✅ DB: `economicEvents.resourceInventoriedAsId` + Field resolver
- `toResourceInventoriedAs: EconomicResource` - ✅ DB: `economicEvents.toResourceInventoriedAsId` + Field resolver
- `resourceClassifiedAs: [URI!]` - ✅ DB: `economicEvents.resourceClassifiedAs` (JSON)
- `resourceQuantity: Measure` - ✅ DB: `economicEvents.resourceQuantity` (JSON)
- `effortQuantity: Measure` - ✅ DB: `economicEvents.effortQuantity` (JSON)
- `hasBeginning: DateTime` - ✅ DB: `economicEvents.hasBeginning`
- `hasEnd: DateTime` - ✅ DB: `economicEvents.hasEnd`
- `hasPointInTime: DateTime` - ✅ DB: `economicEvents.hasPointInTime`
- `note: String` - ✅ DB: `economicEvents.note`
- `agreedIn: URI` - ✅ DB: `economicEvents.agreedIn`
- `triggeredBy: EconomicEvent` - ✅ DB: `economicEvents.triggeredById` + Field resolver
- `deletable: Boolean` - 🔵 Computed field
- **Inverse Relationships**:
    - `triggers: [EconomicEvent!]` - ✅ Field resolver
    - `previous: [ProductionFlowItem!]` - ⚠️ **MISSING** field resolver
    - `next: [ProductionFlowItem!]` - ⚠️ **MISSING** field resolver
    - `track: [TrackTraceItem!]` - ⚠️ **MISSING** field resolver
    - `trace: [TrackTraceItem!]` - ⚠️ **MISSING** field resolver

### Type: `EconomicResource`

**Status**: ⚠️ Mostly Complete (missing track/trace)

- `id: ID!` - ✅ DB: `economicResources.id`
- `revisionId: ID!` - ✅ DB: `economicResources.revisionId`
- `name: String` - ✅ DB: `economicResources.name`
- `classifiedAs: [URI!]` - ✅ DB: `economicResources.classifiedAs` (JSON)
- `trackingIdentifier: String` - ✅ DB: `economicResources.trackingIdentifier`
- `image: URI` - ✅ DB: `economicResources.image`
- `imageList: [URI!]` - ✅ DB: `economicResources.imageList` (JSON)
- `accountingQuantity: Measure` - ✅ DB: `economicResources.accountingQuantity` (JSON)
- `onhandQuantity: Measure` - ✅ DB: `economicResources.onhandQuantity` (JSON)
- `note: String` - ✅ DB: `economicResources.note`
- `unitOfEffort: Unit` - ✅ DB: `economicResources.unitOfEffortId` + Field resolver
- `state: Action` - ✅ DB: `economicResources.stateId` + Field resolver
- `containedIn: EconomicResource` - ✅ DB: `economicResources.containedInId` + Field resolver
- **Inverse Relationships**:
    - `contains: [EconomicResource!]` - ✅ Field resolver
    - `economicEventsInOutFrom` - ✅ Field resolver
    - `economicEventsTo` - ✅ Field resolver
    - `previous: [EconomicEvent!]` - ⚠️ **MISSING** field resolver
    - `next: [EconomicEvent!]` - ⚠️ **MISSING** field resolver
    - `track: [TrackTraceItem!]` - ⚠️ **MISSING** field resolver
    - `trace: [TrackTraceItem!]` - ⚠️ **MISSING** field resolver

---

## Summary of Missing Pieces

### ⚠️ Missing Field Resolvers

1. **EconomicEvent**:
    - `previous: [ProductionFlowItem!]` - Track production flow backwards
    - `next: [ProductionFlowItem!]` - Track production flow forwards
    - `track: [TrackTraceItem!]` - Track items forward in supply chain
    - `trace: [TrackTraceItem!]` - Trace items backward in supply chain

2. **EconomicResource**:
    - `previous: [EconomicEvent!]` - Events that created/modified this resource
    - `next: [EconomicEvent!]` - Events that will use this resource
    - `track: [TrackTraceItem!]` - Track forward
    - `trace: [TrackTraceItem!]` - Trace backward

3. **Process**:
    - `nextProcesses: [Process!]` - Processes that follow this one
    - `previousProcesses: [Process!]` - Processes that precede this one

### 📋 Files Analyzed (12/20 core files)

✅ Complete:

- measurement.gql
- action.gql
- geolocation.gql
- agent.gql
- resource_specification.gql
- plan.gql
- product_batch.gql
- process_specification.gql
- satisfaction.gql
- fulfillment.gql

⚠️ Partial:

- observation.gql (missing track/trace)
- process.gql (missing next/previous)

📋 Still to analyze:

- intent.gql
- commitment.gql
- proposal.gql
- agreement.gql
- claim.gql
- appreciation.gql
- scenario.gql
- recipe.gql
- All 97 bridging files

---

## Next Steps

1. Implement missing track/trace/previous/next resolvers
2. Analyze remaining core schema files
3. Analyze all bridging files for additional fields
4. Verify 100% coverage
