# ValueFlows on AT Protocol: Master Implementation Plan

## Executive Summary

**Objective:** Build a scalable, interoperable economic network ("Economic Media") on the AT Protocol using ValueFlows.

**Architecture:**

- **Core:** AT Protocol (PDS for storage, DIDs for identity)
- **Indexing:** Quickslice (Auto-generated GraphQL from Lexicons)
- **Client:** GraphQL-based frontend (React/Svelte)
- **Scaling:** Federated AppViews (Specialized Quickslice instances)

**Timeline:** 4-Phase rollout (Pilot → Alpha → Beta → Global Scale)

## 1. Core Architecture

### The "Federated Index" Model

Instead of a single monolithic database, we build a **fleet of specialized indexes**.

```
┌─────────────────────────────────────────────────────────────┐
│                    Global User Base                         │
│              (Universal Identity via DIDs)                  │
└─────────────────────────────────────────────────────────────┘
          │                       │                       │
          ▼                       ▼                       ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│ Global AppView    │   │ Agriculture View  │   │  Tech View        │
│ (Quickslice)      │   │ (Quickslice)      │   │  (Quickslice)     │
│                   │   │                   │   │                   │
│ • All Events      │   │ • Food/Farming    │   │ • Hardware/Chips  │
│ • Basic Index     │   │ • Deep Indexing   │   │ • Deep Indexing   │
└───────────────────┘   └───────────────────┘   └───────────────────┘
```

**Key Principals:**

1. **Universal Data:** All data lives in user PDSs (interoperable).
2. **Specialized Views:** AppViews index only what they need.
3. **GraphQL Interface:** Clients query the AppView relevant to their context.

## 2. Infrastructure Strategy

**Deployment Target:** Kubernetes (K8s)
**Scaling Pattern:** Horizontal Sharding by Region/Domain

### Global Deployment (Pilot/Alpha)

A single Quickslice cluster handling all traffic.

```yaml
# Simple Quickslice Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quickslice-global
spec:
  replicas: 3 # High availability
  template:
    spec:
      containers:
        - name: quickslice
          env:
            - name: COLLECTIONS
              value: "vf.observation.*,vf.plan.*"
```

### Regional Sharding (Beta/Global)

As traffic grows, split ingestion by region to reduce latency and comply with data sovereignty.

```yaml
# Regional Deployment (EU)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quickslice-eu
spec:
  replicas: 5
  template:
    spec:
      containers:
        - name: quickslice
          env:
            - name: JETSTREAM_REGION
              value: "eu-west"
```

## 3. Lexicon Strategy

**Design Philosophy:** Follow hREA's proven patterns.

| Lexicon ID                        | Role           | hREA Equivalent       |
| --------------------------------- | -------------- | --------------------- |
| `vf.agent.person`                 | Economic Actor | `ReaAgent`            |
| `vf.agent.organization`           | Economic Group | `ReaAgent`            |
| `vf.observation.economicEvent`    | Transaction    | `ReaEconomicEvent`    |
| `vf.observation.economicResource` | Asset          | `ReaEconomicResource` |
| `vf.plan.process`                 | Transformation | `ReaProcess`          |
| `vf.plan.commitment`              | Promise        | `ReaCommitment`       |

**Reference Pattern:**

- **Agents:** Referenced by DID (e.g., `did:plc:123`)
- **Records:** Referenced by AT URI (e.g., `at://did:plc:123/vf.event/sc45...`)
- **Joins:** Auto-resolved by Quickslice

## 4. Implementation Roadmap

### Phase 1: The Foundation (Weeks 1-2)

**Goal:** Functional "Hello World" of economic events.

1. **Deploy Quickslice:**
   - Set up K8s cluster
   - Deploy single Quickslice instance
   - Configure OAuth signing keys

2. **Define Core Lexicons:**
   - `vf.agent.person`
   - `vf.observation.economicEvent`
   - Import into Quickslice (`quickslice lexicon import ...`)

3. **Verify Pipeline:**
   - Create event via mutation
   - Query event via GraphQL
   - Verify DID join works

### Phase 2: The Process (Weeks 3-4)

**Goal:** Enable complex economic flows.

1. **Process Lexicons:**
   - `vf.plan.process`
   - `vf.plan.intent`
   - `vf.plan.commitment`

2. **Graph Queries:**
   - Test "Input → Process → Output" queries
   - Verify reverse joins (Process inputs)

3. **Frontend Scaffold:**
   - Connect scaffolding React app to Quickslice
   - Implement login flow

### Phase 3: The Federation (Weeks 5-6)

**Goal:** Demonstrate horizontal scaling.

1. **Specialized AppView:**
   - Deploy 2nd Quickslice instance ("Supply Chain View")
   - Configure to index _only_ supply chain collections
   - Demonstrate separate scaling of ingestion

2. **Production Hardening:**
   - Redis caching
   - Database read replicas
   - CDN for media

### Phase 4: Global Scale (Future)

**Goal:** Full "Economic Media" network.

1. **Regional Sharding:**
   - Deploy EU/US/APAC clusters
   - Geo-DNS routing
2. **Cold Storage:**
   - Archive old events to S3/Glacier
   - Lightweight "Cold View" for audits

## 5. Success Metrics

| Metric            | Target (Alpha) | Target (Global)  |
| ----------------- | -------------- | ---------------- |
| **Query Latency** | < 200ms        | < 100ms (p95)    |
| **Ingestion Lag** | < 2s           | < 500ms          |
| **Storage Cost**  | $50/mo         | $0.001 per event |
| **Uptime**        | 99.9%          | 99.99%           |

## 6. Risks & Mitigations

| Risk                | Mitigation                              |
| ------------------- | --------------------------------------- |
| **Firehose Volume** | Jetstream filtering + Sharding          |
| **Schema Changes**  | Strict Lexicon versioning               |
| **Data Privacy**    | PDS-level access controls               |
| **Vendor Lock-in**  | Open source stack (Quickslice/Postgres) |
