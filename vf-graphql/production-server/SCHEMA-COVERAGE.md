# ValueFlows GraphQL Schema Coverage Analysis

## Executive Summary

**Current Implementation**: **MINIMAL** - Only 6 out of 25+ core ValueFlows entities are implemented  
**Coverage**: ~20% of full ValueFlows specification  
**Status**: ⚠️ **INCOMPLETE** - This is a foundational/starter implementation

---

## 📊 Schema Coverage Matrix

### ✅ Implemented Entities (6/25+)

| Entity                    | Database Table            | Resolvers  | GraphQL Types | Status                               |
| ------------------------- | ------------------------- | ---------- | ------------- | ------------------------------------ |
| **Agent**                 | `agents`                  | ✅ Partial | ✅            | ⚠️ Missing Person/Organization split |
| **EconomicEvent**         | `economic_events`         | ✅ Partial | ✅            | ⚠️ Missing many fields               |
| **EconomicResource**      | `resources`               | ❌ None    | ❌            | ⚠️ Table exists, no resolvers        |
| **Process**               | `processes`               | ✅ Partial | ✅            | ✅ Basic fields covered              |
| **Commitment**            | `commitments`             | ❌ None    | ❌            | ⚠️ Table exists, no resolvers        |
| **ResourceSpecification** | `resource_specifications` | ❌ None    | ❌            | ⚠️ Table exists, no resolvers        |

### ❌ Missing Core Entities (19+)

#### Planning Module

- ❌ **Intent** - Planned economic flows (offers/requests)
- ❌ **Plan** - Logical collection of processes
- ❌ **Proposal** - Published requests/offers
- ❌ **ProposedIntent** - Many-to-many Proposal↔Intent

#### Agent Module (Extended)

- ❌ **Person** - Natural person (Agent subtype)
- ❌ **Organization** - Group/legal entity (Agent subtype)
- ❌ **AgentRelationship** - Relationships between agents
- ❌ **AgentRelationshipRole** - Types of relationships

#### Relationship Modules

- ❌ **Satisfaction** - Intent↔(Event|Commitment) relationships
- ❌ **Fulfillment** - Commitment↔Event relationships

#### Additional Core Entities

- ❌ **Claim** - Claims on resources
- ❌ **Agreement** - Agreements between agents
- ❌ **Appreciation** - Recognition/thanks
- ❌ **Scenario** - Planning scenarios
- ❌ **ProcessSpecification** - Process templates
- ❌ **ProductBatch** - Batch tracking
- ❌ **SpatialThing** - Locations
- ❌ **Unit** - Units of measure
- ❌ **Action** - Action types (consume, produce, etc.)

#### Supporting Types

- ❌ **Measure** - Quantity + Unit
- ❌ **Duration** - Time duration

---

## 🔍 Detailed Gap Analysis

### 1. Agent Module - INCOMPLETE

**GraphQL Schema**: `lib/schemas/agent.gql` (402 lines)

#### Missing Implementation:

**Person Type** (Lines 47-68)

```graphql
type Person implements Agent {
	id: ID!
	name: String!
	image: URI
	note: String
	relationships: AgentRelationshipConnection
	roles: [AgentRelationshipRole!]
}
```

❌ No database table  
❌ No resolvers  
❌ No type discrimination from Organization

**Organization Type** (Lines 73-100)

```graphql
type Organization implements Agent {
	id: ID!
	name: String!
	image: URI
	classifiedAs: [URI!] # ⚠️ Missing in DB
	note: String
	relationships: AgentRelationshipConnection
	roles: [AgentRelationshipRole!]
}
```

❌ No database table  
❌ No resolvers  
⚠️ Current `agents` table doesn't distinguish Person vs Organization

**AgentRelationship** (Lines 107-125)

```graphql
type AgentRelationship {
	id: ID!
	subject: Agent! # e.g., Mary
	object: Agent! # e.g., Group
	relationship: AgentRelationshipRole! # e.g., "member"
	inScopeOf: [AccountingScope!]
	note: String
}
```

❌ No database table  
❌ No resolvers

**AgentRelationshipRole** (Lines 130-148)

```graphql
type AgentRelationshipRole {
	id: ID!
	roleLabel: String! # e.g., "is member of"
	inverseRoleLabel: String # e.g., "has member"
	note: String
}
```

❌ No database table  
❌ No resolvers

**Missing Queries**:

- `myAgent` - Current authenticated agent
- `organization(id)`, `organizations()`
- `person(id)`, `people()`
- `agentRelationship(id)`, `agentRelationships()`
- `agentRelationshipRole(id)`, `agentRelationshipRoles()`

**Missing Mutations**:

- `createPerson`, `updatePerson`, `deletePerson`
- `createOrganization`, `updateOrganization`, `deleteOrganization`
- `createAgentRelationship`, `updateAgentRelationship`, `deleteAgentRelationship`
- `createAgentRelationshipRole`, `updateAgentRelationshipRole`, `deleteAgentRelationshipRole`

---

### 2. Observation Module - INCOMPLETE

**GraphQL Schema**: `lib/schemas/observation.gql` (278 lines)

#### EconomicEvent - PARTIAL

**Missing Fields in Database**:

```typescript
// Current DB schema (9 fields)
{
  id, action, provider, receiver,
  resourceQuantity, effortQuantity,
  hasPointInTime, note, createdAt, updatedAt
}

// GraphQL Schema requires (20+ fields)
{
  revisionId,  // ❌ Missing
  resourceInventoriedAs: EconomicResource,  // ❌ Missing
  toResourceInventoriedAs: EconomicResource,  // ❌ Missing
  resourceClassifiedAs: [URI!],  // ❌ Missing
  hasBeginning: DateTime,  // ❌ Missing
  hasEnd: DateTime,  // ❌ Missing
  agreedIn: URI,  // ❌ Missing
  triggeredBy: EconomicEvent,  // ❌ Missing
  deletable: Boolean,  // ❌ Missing

  // Inverse relationships
  triggers: [EconomicEvent!],  // ❌ Missing
  previous: [ProductionFlowItem!],  // ❌ Missing
  next: [ProductionFlowItem!],  // ❌ Missing
  track: [TrackTraceItem!],  // ❌ Missing
  trace: [TrackTraceItem!],  // ❌ Missing
}
```

**Missing Resolvers**:

- ❌ Relationship resolvers (resourceInventoriedAs, toResourceInventoriedAs, etc.)
- ❌ Inverse relationship resolvers (triggers, track, trace, etc.)

#### EconomicResource - NO RESOLVERS

**Missing Everything**:

```graphql
type EconomicResource {
  id: ID!
  revisionId: ID!  // ❌
  name: String  // ✅ In DB
  classifiedAs: [URI!]  // ❌
  trackingIdentifier: String  // ✅ In DB
  image: URI  // ❌
  imageList: [URI!]  // ❌
  accountingQuantity: Measure  // ⚠️ JSONB in DB, no resolver
  onhandQuantity: Measure  // ⚠️ JSONB in DB, no resolver
  note: String  // ✅ In DB
  unitOfEffort: Unit  // ❌
  state: Action  // ❌
  containedIn: EconomicResource  // ❌

  // Inverse relationships - ALL MISSING
  contains: [EconomicResource!]
  economicEventsInOutFrom: EconomicEventConnection
  economicEventsTo: EconomicEventConnection
  previous: [EconomicEvent!]
  next: [EconomicEvent!]
  track: [TrackTraceItem!]
  trace: [TrackTraceItem!]
}
```

**Missing Queries**:

- ❌ `economicResource(id)`
- ❌ `economicResources()`

**Missing Mutations**:

- ❌ `updateEconomicResource`

---

### 3. Commitment Module - NO IMPLEMENTATION

**GraphQL Schema**: `lib/schemas/commitment.gql` (161 lines)

**Status**: Table exists, **ZERO resolvers**

**Missing Fields in Database**:

```typescript
// Current DB (10 fields)
{
  id, action, provider, receiver,
  resourceQuantity, effortQuantity,
  due, finished, note, createdAt, updatedAt
}

// GraphQL requires (15+ fields)
{
  revisionId,  // ❌
  resourceClassifiedAs: [URI!],  // ❌
  hasBeginning: DateTime,  // ❌
  hasEnd: DateTime,  // ❌
  hasPointInTime: DateTime,  // ❌
  created: DateTime,  // ⚠️ Have createdAt
  agreedIn: URI,  // ❌
  deletable: Boolean,  // ❌

  // Plus all bridging relationships from other modules
}
```

**Missing Queries**:

- ❌ `commitment(id)`
- ❌ `commitments()`

**Missing Mutations**:

- ❌ `createCommitment`
- ❌ `updateCommitment`
- ❌ `deleteCommitment`

---

### 4. Intent Module - COMPLETELY MISSING

**GraphQL Schema**: `lib/schemas/intent.gql` (196 lines)

**Status**: ❌ **NO TABLE, NO RESOLVERS**

```graphql
type Intent {
	id: ID!
	revisionId: ID!
	name: String
	action: Action!
	resourceClassifiedAs: [URI!]
	resourceQuantity: Measure
	effortQuantity: Measure
	availableQuantity: Measure
	hasBeginning: DateTime
	hasEnd: DateTime
	hasPointInTime: DateTime
	due: DateTime
	finished: Boolean
	image: URI
	imageList: [URI!]
	note: String
	agreedIn: URI
	deletable: Boolean
}
```

**Missing Queries**: `intent(id)`, `intents()`  
**Missing Mutations**: `createIntent`, `updateIntent`, `deleteIntent`

---

### 5. Plan Module - COMPLETELY MISSING

**GraphQL Schema**: `lib/schemas/plan.gql` (95 lines)

**Status**: ❌ **NO TABLE, NO RESOLVERS**

```graphql
type Plan {
	id: ID!
	revisionId: ID!
	name: String!
	created: DateTime
	due: DateTime
	note: String
	deletable: Boolean
}
```

---

### 6. Proposal Module - COMPLETELY MISSING

**GraphQL Schema**: `lib/schemas/proposal.gql` (146 lines)

**Status**: ❌ **NO TABLE, NO RESOLVERS**

```graphql
type Proposal {
	id: ID!
	revisionId: ID!
	name: String
	hasBeginning: DateTime
	hasEnd: DateTime
	unitBased: Boolean
	created: DateTime
	note: String
	publishes: [ProposedIntent!]
}

type ProposedIntent {
	id: ID!
	revisionId: ID!
	reciprocal: Boolean
	publishedIn: Proposal!
	# Plus relationship to Intent
}
```

---

### 7. Satisfaction Module - COMPLETELY MISSING

**GraphQL Schema**: `lib/schemas/satisfaction.gql` (114 lines)

**Status**: ❌ **NO TABLE, NO RESOLVERS**

**Critical**: Defines `EventOrCommitment` union type (used in resolvers!)

```graphql
union EventOrCommitment = EconomicEvent | Commitment

type Satisfaction {
	id: ID!
	revisionId: ID!
	satisfies: Intent!
	satisfiedBy: EventOrCommitment!
	resourceQuantity: Measure
	effortQuantity: Measure
	note: String
}
```

---

### 8. Fulfillment Module - COMPLETELY MISSING

**GraphQL Schema**: `lib/schemas/fulfillment.gql` (93 lines)

**Status**: ❌ **NO TABLE, NO RESOLVERS**

```graphql
type Fulfillment {
	id: ID!
	revisionId: ID!
	fulfilledBy: EconomicEvent!
	fulfills: Commitment!
	resourceQuantity: Measure
	effortQuantity: Measure
	note: String
}
```

---

## 🚨 Critical Missing Infrastructure

### 1. revisionId Field

**EVERY** ValueFlows type requires `revisionId: ID!` for optimistic locking.

❌ **Missing from ALL database tables**

### 2. Measure Type

**Used extensively** for quantities:

```graphql
type Measure {
	hasNumericalValue: Float!
	hasUnit: Unit!
}

input IMeasure {
	hasNumericalValue: Float!
	hasUnit: ID!
}
```

⚠️ Currently stored as JSONB, **no proper type handling**

### 3. Unit Type

**Required for Measure**:

```graphql
type Unit {
	id: ID!
	label: String!
	symbol: String!
}
```

❌ **Completely missing**

### 4. Action Type

**Required for events/commitments/intents**:

```graphql
type Action {
	id: ID!
	label: String!
	resourceEffect: String # increment, decrement, etc.
	inputOutput: String # input, output, etc.
}
```

❌ **Completely missing** (currently just storing action as text)

### 5. SpatialThing (Location)

Referenced in agents and resources:

```graphql
type SpatialThing {
	id: ID!
	name: String!
	mappableAddress: String
	lat: Float
	long: Float
	alt: Float
	note: String
}
```

❌ **Completely missing**

---

## 📈 Implementation Priority Recommendations

### Phase 1: Core Infrastructure (HIGH PRIORITY)

1. ✅ Add `revisionId` to ALL tables
2. ✅ Implement `Measure` type properly
3. ✅ Create `Unit` table and resolvers
4. ✅ Create `Action` table and resolvers
5. ✅ Fix Agent module (Person/Organization split)

### Phase 2: Complete Existing Entities (HIGH PRIORITY)

1. ✅ Complete `EconomicEvent` fields and resolvers
2. ✅ Add `EconomicResource` resolvers
3. ✅ Add `Commitment` resolvers
4. ✅ Add `ResourceSpecification` resolvers

### Phase 3: Planning Module (MEDIUM PRIORITY)

1. ⬜ Implement `Intent`
2. ⬜ Implement `Plan`
3. ⬜ Implement `Proposal` + `ProposedIntent`

### Phase 4: Relationship Modules (MEDIUM PRIORITY)

1. ⬜ Implement `Satisfaction`
2. ⬜ Implement `Fulfillment`
3. ⬜ Implement `AgentRelationship` + `AgentRelationshipRole`

### Phase 5: Extended Modules (LOW PRIORITY)

1. ⬜ `Claim`, `Agreement`, `Appreciation`
2. ⬜ `Scenario`, `ProcessSpecification`, `ProductBatch`
3. ⬜ `SpatialThing` (locations)
4. ⬜ Recipe module

---

## 🎯 Current Status Summary

**What We Have**:

- ✅ Basic server infrastructure (Hono, Apollo, Auth, DB)
- ✅ Production hardening (security, logging, health checks)
- ✅ Scalar resolvers (DateTime, URI)
- ✅ \_\_typename injection
- ✅ Basic CRUD for: Agent, EconomicEvent, Process
- ⚠️ Partial tables for: EconomicResource, Commitment, ResourceSpecification

**What We're Missing**:

- ❌ 80% of ValueFlows entities
- ❌ Person/Organization agent types
- ❌ All planning module (Intent, Plan, Proposal)
- ❌ All relationship modules (Satisfaction, Fulfillment, AgentRelationship)
- ❌ Core infrastructure (Unit, Action, proper Measure handling)
- ❌ Most inverse relationships and queries
- ❌ revisionId for optimistic locking

**Conclusion**: This is a **foundational starter implementation** suitable for:

- ✅ Learning ValueFlows
- ✅ Prototyping basic economic flows
- ✅ Testing infrastructure
- ❌ **NOT** production-ready for full ValueFlows applications

---

## 📝 Recommendations

1. **Document Scope**: Update README to clearly state this implements ~20% of ValueFlows
2. **Roadmap**: Create implementation roadmap for remaining 80%
3. **Modular Approach**: Implement modules incrementally based on use case needs
4. **Testing**: Add comprehensive tests as entities are implemented
5. **Schema Validation**: Use `validate()` from vf-graphql to ensure compliance

---

**Generated**: 2026-02-15  
**Schema Version**: Based on vf-graphql lib/schemas  
**Implementation**: production-server v1.0.0
