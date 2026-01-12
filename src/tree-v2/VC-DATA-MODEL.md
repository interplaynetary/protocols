# Verifiable Credentials as the Data Model: Tree-v2 + Architecture Integration

## The VC Design Philosophy

> **Core Principle:** Use **Verifiable Credentials (VCs)** for all **assertions, claims, and commitments** in the recognition economy. Use **Fireproof CRDTs** for **operational state** that needs real-time sync.

This document explores which abstractions should be VCs and which should remain as operational data.

---

## Abstraction Level Analysis

### Level 0: Identity (✅ ALWAYS VCs)

**What:** Entity identity and authorization
**Why VCs:** Already part of architecture.md
**Examples:**
- `MembershipCredential` - "Alice is a member of the Dev Community"
- `RoleCredential` - "Bob is a maintainer of the Education project"
- `DeviceAuthorizationCredential` - "This device can act on behalf of Alice"

```typescript
// Identity VC (from architecture.md)
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "MembershipCredential"],
  "issuer": "did:key:z6MkRoot...",
  "credentialSubject": {
    "id": "did:key:z6MkAlice...",
    "membership": "recognition-tree-network",
    "role": "contributor"
  },
  "proof": { /* signature */ }
}
```

---

### Level 1: Tree Structure (❌ NOT VCs - Use Fireproof)

**What:** Nodes, references, parent-child relationships
**Why NOT VCs:** 
- Highly mutable (tree gets edited constantly)
- Operational data, not claims
- Needs CRDT conflict resolution
- Too granular for VC verification overhead

**Storage:** Fireproof CRDTs (as currently designed)

```typescript
// TreeStore stays in Fireproof (not a VC)
const treeDB = fireproof('tree-alice')
await treeDB.put({
  _id: 'entity_alice',
  tree_store: {
    nodes: { /* frequently changing */ },
    tree_references: { /* frequently changing */ },
    derived_state: { /* computed */ }
  }
})
```

**Rationale:** VCs are for **attestations**, not **live data structures**. The tree is the "working memory" of the recognition system.

---

### Level 2: Contribution Claims (✅ DEFINITELY VCs)

**What:** Assertions that someone contributed to a goal/task
**Why VCs:** 
- ✅ **Portable** - Can prove contribution across apps
- ✅ **Verifiable** - Third parties can verify the claim
- ✅ **Immutable** - Contribution is a historical fact
- ✅ **Revocable** - If fraud detected, can revoke

**Example:**

```typescript
// ContributionCredential VC
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "ContributionCredential"],
  "issuer": "did:key:z6MkProjectRoot...", // Project DID
  "issuedAt": "2024-01-15T10:00:00Z",
  "credentialSubject": {
    "id": "did:key:z6MkAlice...",      // Contributor DID
    "contribution": {
      "projectId": "project_education",
      "goalNodeId": "goal_math_tutoring",
      "points": 100,                    // Recognition points
      "description": "Tutored 5 students in calculus",
      "timestamp": "2024-01-15T09:00:00Z"
    }
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2024-01-15T10:00:00Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:key:z6MkProjectRoot...#key-1",
    "jws": "eyJhbG..."
  }
}
```

**Integration with tree-v2:**

```typescript
// When adding contributor to a node:
const { tree: newTree } = createNode(tree, {
  type: 'ContributionNode',
  name: 'Build MVP',
  share_map: {
    'did:key:alice': 60,
    'did:key:bob': 40
  },
  default_child_ids: []
})

// ALSO issue a ContributionCredential VC:
const contributionVC = await issueVC({
  type: 'ContributionCredential',
  issuer: projectDID,
  subject: 'did:key:z6MkAlice...',
  claims: {
    goalNodeId: node.id,
    points: 100,
    description: 'Math tutoring work'
  }
})

// Store VC in separate registry
await vcRegistry.put({
  _id: `contribution-${Date.now()}`,
  ...contributionVC
})
```

**Why Both?**
- **Tree** = Live operational state (for calculation)
- **VC** = Portable proof (for external verification, resume, reputation)

---

### Level 3: Allocation Offers (✅ DEFINITELY VCs)

**What:** Offers to allocate resources based on ShareOfGeneralSatisfaction
**Why VCs:**
- ✅ **Commitment** - Provider commits to allocation
- ✅ **Enforceable** - Recipient can present as proof
- ✅ **Auditable** - Can verify allocation was fair
- ✅ **Actionable** - Contains UCAN for resource access

**Example:**

```typescript
// AllocationCredential VC
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "AllocationCredential"],
  "issuer": "did:key:z6MkProvider...",
  "issuedAt": "2024-01-15T10:00:00Z",
  "expirationDate": "2024-01-22T10:00:00Z", // 7 days to accept
  "credentialSubject": {
    "id": "did:key:z6MkRecipient...",
    "allocation": {
      "allocationId": "alloc_xyz123",
      "providerCapacitySlot": "cap_tutoring_hours",
      "recipientNeedSlot": "need_math_help",
      "resourceType": "time",
      "offeredQuantity": 10,
      "shareOfGeneralSatisfaction": 0.15, // Proof of fair allocation
      "basis": "ShareMap calculation at 2024-01-15T09:00:00Z"
    }
  },
  "proof": { /* Provider's signature */ },
  "evidence": [
    {
      "type": "ShareMapSnapshot",
      "timestamp": "2024-01-15T09:00:00Z",
      "shareMap": {
        "did:key:z6MkRecipient...": 0.15,
        // ... other recipients
      },
      "treeVersionCID": "bafy..." // Content ID of tree state
    }
  ]
}
```

**Integration with tree-v2:**

```typescript
// Calculate allocations (tree-v2)
const allocations = calculateAllocations({
  provider_id: providerDID,
  capacity_slot_id: 'cap_tutoring',
  available_quantity: 100,
  share_map: calculateShareMap(tree, cache),
  recipients: [...]
})

// Issue VC for each allocation
for (const alloc of allocations) {
  const allocationVC = await issueVC({
    type: 'AllocationCredential',
    issuer: providerDID,
    subject: alloc.recipient_id,
    claims: {
      allocationId: alloc.allocation_id,
      offeredQuantity: alloc.offered_quantity,
      shareOfGeneralSatisfaction: shareMap[alloc.recipient_id],
      evidence: {
        shareMap: shareMap,
        treeVersionCID: await computeTreeCID(tree)
      }
    },
    expiration: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  })
  
  // Store VC
  await vcRegistry.put({
    _id: alloc.allocation_id,
    ...allocationVC
  })
}
```

**Recipient Acceptance:**

```typescript
// Recipient accepts allocation by issuing acceptance VC
const acceptanceVC = await issueVC({
  type: 'AllocationAcceptanceCredential',
  issuer: recipientDID,
  subject: providerDID,
  claims: {
    allocationId: 'alloc_xyz123',
    acceptedQuantity: 10,
    acceptedAt: Date.now()
  }
})

// This triggers resource access UCAN issuance (from architecture.md)
```

---

### Level 4: Satisfaction Snapshots (✅ YES - for Audit Trail)

**What:** Periodic snapshots of computed satisfaction/shares
**Why VCs:**
- ✅ **Provable History** - Can prove "at time T, I had 15% share"
- ✅ **Dispute Resolution** - Evidence for allocation fairness
- ✅ **Reputation Building** - Portable proof of recognition over time
- ✅ **Tamper-Proof** - CID-linked to tree state

**Example:**

```typescript
// SatisfactionSnapshotCredential VC
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "SatisfactionSnapshotCredential"],
  "issuer": "did:key:z6MkEntity...",
  "issuedAt": "2024-01-15T00:00:00Z",
  "credentialSubject": {
    "id": "did:key:z6MkEntity...",
    "snapshot": {
      "timestamp": "2024-01-15T00:00:00Z",
      "treeVersionCID": "bafy...", // Content ID of TreeStore
      "rootSatisfaction": 0.85,
      "shareMap": {
        "did:key:z6MkAlice...": 0.15,
        "did:key:z6MkBob...": 0.10,
        // ...
      },
      "topContributors": [
        { id: "did:key:z6MkAlice...", share: 0.15 },
        { id: "did:key:z6MkBob...", share: 0.10 }
      ]
    }
  },
  "proof": { /* Entity's signature */ }
}
```

**Usage:**
- **Daily/Weekly Snapshots** - Automated VC issuance of tree state
- **Allocation Evidence** - Linked from AllocationCredentials
- **Reputation Proof** - "I consistently had 15%+ share for 6 months"

---

### Level 5: SymLink Assertions (✅ YES - for Cross-Entity Claims)

**What:** Claims about remote entity's satisfaction/contributions
**Why VCs:**
- ✅ **Cross-Entity Proof** - Can verify remote claims offline
- ✅ **Cached Validity** - VC has expiration, safe to cache
- ✅ **Dispute Prevention** - Signed proof of what was claimed

**Example:**

```typescript
// RemoteSatisfactionCredential VC
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "RemoteSatisfactionCredential"],
  "issuer": "did:key:z6MkRemoteEntity...", // Remote entity
  "issuedAt": "2024-01-15T10:00:00Z",
  "expirationDate": "2024-01-15T11:00:00Z", // Short-lived (1 hour)
  "credentialSubject": {
    "id": "did:key:z6MkRemoteEntity...",
    "nodeId": "remote_node_123",
    "satisfaction": 0.90,
    "weight": 0.35,
    "contributorShares": {
      "did:key:z6MkAlice...": 0.12,
      "did:key:z6MkBob...": 0.08
    },
    "treeVersionCID": "bafy..."
  },
  "proof": { /* Remote entity's signature */ }
}
```

**Integration with SymLink Cache:**

```typescript
// Instead of plain RemoteSatisfactionData, store VCs
const remoteSatisfactionVC = await verifyAndStoreVC({
  vc: receivedVC,
  type: 'RemoteSatisfactionCredential',
  expectedIssuer: symlink_target.entity_id
})

// Update SymLink cache with VC
const newCache = updateCachedSatisfaction(
  cache,
  symlinkNodeId,
  {
    entity_id: remoteSatisfactionVC.credentialSubject.id,
    node_id: remoteSatisfactionVC.credentialSubject.nodeId,
    satisfaction: remoteSatisfactionVC.credentialSubject.satisfaction,
    weight: remoteSatisfactionVC.credentialSubject.weight,
    contributor_shares: remoteSatisfactionVC.credentialSubject.contributorShares,
    computed_at: new Date(remoteSatisfactionVC.issuedAt).getTime(),
    tree_version: remoteSatisfactionVC.credentialSubject.treeVersionCID,
    _vcProof: remoteSatisfactionVC.proof // Store VC proof
  }
)
```

---

## The Grand VC Architecture

### Data Storage Matrix

| Data Type | Storage | Format | Mutation Frequency | Portability Need |
|-----------|---------|--------|-------------------|------------------|
| **Identity** | VC Registry | VC | Rare (only on rotation) | ✅ Critical |
| **Tree Structure** | Fireproof CRDT | TreeStore | High (every edit) | ❌ Internal only |
| **Contributions** | VC Registry | VC | Medium (per task) | ✅ High (resume/reputation) |
| **Allocations** | VC Registry | VC | Medium (periodic) | ✅ High (proof of offer) |
| **Snapshots** | VC Registry | VC | Low (daily/weekly) | ✅ High (audit trail) |
| **SymLink Data** | VC Cache + Fireproof | VC | Medium (hourly updates) | ✅ Medium (cross-entity) |
| **Revocations** | Fireproof CRDT | RevocationRecord | Low (on device theft) | ✅ Critical |

### Database Architecture

```typescript
// 1. Tree Database (Operational State - Fireproof CRDT)
const treeDB = fireproof('tree-' + myDID)
// Stores: TreeStore, mutable, high-frequency updates

// 2. Contribution Registry (VCs - Fireproof + VC wrapper)
const contributionRegistry = fireproof('contributions-' + myDID)
// Stores: ContributionCredentials, immutable, medium-frequency

// 3. Allocation Registry (VCs - Fireproof + VC wrapper)
const allocationRegistry = fireproof('allocations-' + myDID)
// Stores: AllocationCredentials, immutable, medium-frequency

// 4. Snapshot Archive (VCs - Fireproof + VC wrapper)
const snapshotArchive = fireproof('snapshots-' + myDID)
// Stores: SatisfactionSnapshotCredentials, immutable, low-frequency

// 5. Revocation List (CRDTs - Fireproof)
const revocationList = fireproof('revocations-' + myDID)
// Stores: Revoked VC CIDs, append-only, low-frequency
```

---

## Benefits of VC-Based Design

### 1. **Portability**
```typescript
// Export your entire recognition history as VCs
const myContributions = await contributionRegistry.query('all')
const myAllocations = await allocationRegistry.query('all')

// Import into different app/platform
// VCs are W3C standard - any VC-compatible system can verify!
```

### 2. **Offline Verification**
```typescript
// Anyone can verify your contribution claim offline
const isValid = await verifyVC(contributionVC, {
  trustedIssuers: ['did:key:z6MkProjectRoot...'],
  checkRevocation: false // Offline mode
})
```

### 3. **Selective Disclosure**
```typescript
// Share only specific contributions (not entire tree)
const resumeVCs = contributionRegistry
  .query('type', 'ContributionCredential')
  .filter(vc => vc.credentialSubject.contribution.points > 100)

// Send to potential employer
```

### 4. **Dispute Resolution**
```typescript
// Prove allocation was fair using snapshot VC
const evidence = await snapshotArchive.get(allocationVC.evidence.snapshotId)
console.log('My share at allocation time:', evidence.credentialSubject.shareMap[myDID])
```

### 5. **Cross-Platform Reputation**
```typescript
// Your VCs work across any recognition-tree-compatible app
// DID-based identity = no vendor lock-in
```

---

## Implementation Strategy

### Phase 1: Core VCs (Now)
- ✅ Identity VCs (already in architecture.md)
- ✅ Contribution VCs
- ✅ Allocation VCs

### Phase 2: Audit Trail (Next)
- ✅ Satisfaction Snapshots
- ✅ SymLink VCs

### Phase 3: Advanced Features (Future)
- ⏳ Selective Disclosure (ZKPs)
- ⏳ Credential Revocation Registry
- ⏳ Reputation Aggregation VCs

---

## Schema Design Pattern

All VCs follow this pattern:

```typescript
import { z } from 'zod'

// Base VC Schema (W3C compliant)
const VerifiableCredentialSchema = z.object({
  '@context': z.array(z.string()),
  type: z.array(z.string()),
  issuer: z.string(), // DID
  issuedAt: z.string().datetime(),
  expirationDate: z.string().datetime().optional(),
  credentialSubject: z.object({
    id: z.string(), // Subject DID
    // ... specific claims
  }),
  proof: z.object({
    type: z.string(),
    created: z.string().datetime(),
    proofPurpose: z.string(),
    verificationMethod: z.string(),
    jws: z.string() // Signature
  })
})

// Specific VC Type
const ContributionCredentialSchema = VerifiableCredentialSchema.extend({
  type: z.tuple([z.literal('VerifiableCredential'), z.literal('ContributionCredential')]),
  credentialSubject: z.object({
    id: z.string(),
    contribution: z.object({
      projectId: z.string(),
      goalNodeId: NodeIdSchema,
      points: PointsSchema,
      description: z.string(),
      timestamp: TimestampSchema
    })
  })
})
```

---

## Summary

**Use VCs for:**
- ✅ Contributions (portable proof)
- ✅ Allocations (enforceable commitments)
- ✅ Snapshots (audit trail)
- ✅ SymLink assertions (cross-entity claims)
- ✅ Identity & authorization (already using)

**Use Fireproof CRDTs for:**
- ✅ Live tree structure (operational state)
- ✅ Real-time derived state (weight, satisfaction)
- ✅ Revocation lists (append-only log)

**The Pattern:**
- **Operational Data** = Fireproof (fast, mutable, CRDT)
- **Claims & Proofs** = VCs (portable, immutable, verifiable)
- **Best of Both Worlds** = W3C standard + Local-First infrastructure

This gives you a **portable, provable, local-first recognition economy**! 🎉
