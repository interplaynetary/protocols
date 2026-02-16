# ValueFlows on AT Protocol: Technical Specification

## 1. Architecture Overview

This specification defines the architecture for "Economic Media" – a distributed, interoperable economic network built on the AT Protocol and ValueFlows.

### 1.1 System Components

| Component     | Technology                 | Responsibility                                |
| ------------- | -------------------------- | --------------------------------------------- |
| **Identity**  | AT Protocol DIDs           | Global, persistent identity for agents        |
| **Storage**   | PDS (Personal Data Server) | User-controlled data sovereignty              |
| **Indexing**  | Quickslice (AppView)       | Aggregation, indexing, and query resolution   |
| **API**       | GraphQL (Auto-generated)   | Client interface with traversing capabilities |
| **Transport** | Jetstream (Firehose)       | Real-time event propagation                   |

### 1.2 Data Flow

1. **Write:** Client signs record → PDS validates & stores → PDS emits event to Relay.
2. **Index:** Relay streams event via Jetstream → Quickslice filters & indexes.
3. **Read:** Client queries Quickslice GraphQL → Quickslice resolves joins → Returns JSON.

---

## 2. Data Model (Lexicons)

We follow hREA's flat-entry pattern, mapping ValueFlows types to AT Protocol Lexicons.

### 2.1 Core Types (`vf.observation.*`)

#### `vf.observation.economicEvent`

Represents a change in the quantity or location of an economic resource.

```json
{
  "lexicon": 1,
  "id": "vf.observation.economicEvent",
  "defs": {
    "main": {
      "type": "record",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["action", "hasPointInTime"],
        "properties": {
          "action": { "type": "string" },
          "provider": { "type": "string", "format": "did" },
          "receiver": { "type": "string", "format": "did" },
          "resourceInventoriedAs": { "type": "string", "format": "at-uri" },
          "inputOf": { "type": "string", "format": "at-uri" },
          "outputOf": { "type": "string", "format": "at-uri" },
          "resourceQuantity": { "type": "ref", "ref": "#quantityValue" },
          "hasPointInTime": { "type": "string", "format": "datetime" }
        }
      }
    },
    "quantityValue": {
      "type": "object",
      "required": ["hasNumericalValue"],
      "properties": {
        "hasNumericalValue": { "type": "float" },
        "hasUnit": { "type": "string" }
      }
    }
  }
}
```

### 2.2 Agent Types (`vf.agent.*`)

#### `vf.agent.person` & `vf.agent.organization`

Maps DIDs to rich profile data.

```json
{
  "lexicon": 1,
  "id": "vf.agent.organization",
  "defs": {
    "main": {
      "type": "record",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "name": { "type": "string" },
          "image": { "type": "string", "format": "uri" },
          "classifiedAs": { "type": "array", "items": { "type": "string" } }
        }
      }
    }
  }
}
```

### 2.3 Planning Types (`vf.plan.*`)

#### `vf.plan.process`

Represents a transformation activity (planned or executed).

```json
{
  "lexicon": 1,
  "id": "vf.plan.process",
  "defs": {
    "main": {
      "type": "record",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "name": { "type": "string" },
          "hasBeginning": { "type": "string", "format": "datetime" },
          "hasEnd": { "type": "string", "format": "datetime" },
          "plannedWithin": { "type": "string", "format": "at-uri" }
        }
      }
    }
  }
}
```

---

## 3. GraphQL API Strategy

Quickslice auto-generates the schema. We rely on built-in patterns for graph traversal.

### 3.1 Field Mapping Convention

| ValueFlows Relation | AT Protocol Type                                                                            | GraphQL Resolution                     |
| ------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| `provider` (Agent)  | [did](file:///home/ruzgar/Programs/rea/atREA/vf-graphql/mock-server/index.js#53-56) (Fixed) | `vfAgentPersonByProvider`              |
| `inputOf` (Process) | `at-uri` (Strong)                                                                           | `vfPlanProcessByInputOf`               |
| `inputs` (Reverse)  | N/A (Index)                                                                                 | `vfObservationEconomicEventsByInputOf` |

### 3.2 Query Patterns

#### The "Supply Chain Trace" Query

Fetch a process, its inputs (and their providers), and its outputs.

```graphql
query SupplyChainTrace($processUri: String!) {
  vfPlanProcess(where: { uri: { eq: $processUri } }) {
    edges {
      node {
        name

        # Inputs (Reverse Join)
        vfObservationEconomicEventsByInputOf {
          edges {
            node {
              action
              resourceQuantity {
                hasNumericalValue
                hasUnit
              }
              # Trace back to provider
              vfAgentOrganizationByProvider {
                name
              }
            }
          }
        }

        # Outputs (Reverse Join)
        vfObservationEconomicEventsByOutputOf {
          edges {
            node {
              action
              resourceQuantity {
                hasNumericalValue
                hasUnit
              }
              # Trace forward to receiver
              vfAgentOrganizationByReceiver {
                name
              }
            }
          }
        }
      }
    }
  }
}
```

---

## 4. Federated Indexing Strategy

### 4.1 Ingestion Configuration

AppViews configure their scope via the `COLLECTIONS` environment variable.

**Global Index:**

```bash
COLLECTIONS="vf.observation.*,vf.plan.*,vf.agent.*"
```

**specialized Index (Agriculture):**

```bash
COLLECTIONS="vf.observation.harvest,vf.resource.crop"
```

### 4.2 Regional Sharding

AppViews configure via `JETSTREAM_REGION` (future protocol feature) or by filtering DIDs based on user-declared region.

---

## 5. Security Model

### 5.1 Authentication

- **OAuth 2.0 / OIDC:** Quickslice acts as an OAuth client.
- **Flow:** App redirects to Quickslice → Quickslice redirects to User PDS → User approves → Token issued.

### 5.2 Authorization

- **Public Data:** All `app.bsky.*` and `vf.*` records are public by default.
- **Private Data:** Handled by PDS access controls (future). Quickslice respects visibility rules.

---

## 6. Deployment Infrastructure

### 6.1 Kubernetes Resources

| Resource       | Spec       | Purpose                           |
| -------------- | ---------- | --------------------------------- |
| **Deployment** | 3 Replicas | Stateless API & Ingestion         |
| **Service**    | ClusterIP  | Internal Load Balancing           |
| **Ingress**    | NGINX      | SSL Termination & Routing         |
| **PVC**        | 100GB+ SSD | Database Storage (if not managed) |

### 6.2 Database

- **Primary:** PostgreSQL 15+
- **Extensions:** `pg_trgm` (Text search), `postgis` (Geospatial - future)
- **Configuration:** `max_connections=500`, `shared_buffers=4GB`

---

## 7. Migration & Compatibility

### 7.2 Versioning

- **Lexicons:** Changes to Lexicons are additive. Breaking changes require new Collection IDs (e.g., `vf.observation.v2.economicEvent`).

---

## 8. Development Workflow

1. **Modify Lexicon JSON**
2. **Run `quickslice lexicon import`** (Updates DB schema & GraphQL)
3. **Commit Lexicon to Repo**
4. **Deploy to K8s** (Helm Upgrade)
