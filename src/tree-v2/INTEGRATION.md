# Tree-v2 Integration with Local-First Architecture

## Overview

The **tree-v2** recognition tree implementation builds on top of the Local-First Architecture defined in `architecture.md`. This document explains how the layers integrate.

## Layer Mapping

### 1. **Storage Layer** → Fireproof

**What tree-v2 stores:**
- `TreeStore` (nodes, references, derived state)
- `EntityState` (complete entity data)
- `NetworkState` (multi-entity networks)
- `AllocationRecord[]` (allocation history)
- `SymLinkCache` (remote satisfaction data)

**How Fireproof provides it:**
```typescript
import { fireproof } from '@fireproof/core'
import { connect } from '@fireproof/connect'

// Create entity's tree database (encrypted IndexedDB)
const myTreeDB = fireproof('tree-alice')
connect.libp2p(myTreeDB, 'recognition-trees')

// Store entity state with automatic encryption
await myTreeDB.put({
  _id: 'entity_alice',
  entity_id: 'entity_alice',
  tree_store: treeStore,       // From tree-v2
  symlink_cache: symlinkCache,  // From tree-v2
  share_map: shareMap,          // From tree-v2/computation
  allocations: allocations      // From tree-v2/allocations
})
```

**Key Benefits:**
- ✅ **Automatic Encryption** - AES-256-GCM for all tree data
- ✅ **Content Addressing** - CIDs verify data integrity
- ✅ **CRDT Merges** - Concurrent updates handled automatically
- ✅ **Offline First** - Works without network, syncs when available

---

### 2. **Identity Layer** → DIDs + UCANs

**What tree-v2 needs:**
- Entity IDs (`EntityId` in schemas)
- Authorization for tree mutations
- Proof of ownership for contributor claims

**How architecture.md provides it:**
```typescript
// Root DID = Entity Identity
const rootKey = await Signer.generate()
const rootDID = rootKey.did()  // e.g., "did:key:z6Mk..."

// Entity ID in tree-v2 = Root DID
const myEntity: EntityState = {
  entity_id: rootDID,  // DID is the EntityId
  tree_store: {
    entity_id: rootDID,
    // ...
  },
  // ...
}
```

**Authorization Example:**
```typescript
// Device wants to mutate tree (add node)
// 1. Check UCAN delegation
const canMutate = await verifyUCAN(deviceUCAN, {
  capability: { with: rootDID, can: 'tree/mutate' }
})

// 2. If authorized, proceed with mutation
if (canMutate) {
  const { tree: newTree, node_id } = createNode(tree, {
    type: 'Goal',
    name: 'New Goal',
    points: 100,
    default_child_ids: []
  })
  
  // 3. Store updated tree (Fireproof auto-syncs)
  await myTreeDB.put({
    _id: 'entity_alice',
    entity_id: rootDID,
    tree_store: newTree,
    // ...
  })
}
```

---

### 3. **Network Layer** → libp2p GossipSub

**What tree-v2 needs:**
- Pub-sub for satisfaction updates
- Peer discovery for SymLinks
- Multi-device sync

**How architecture.md provides it:**

#### A. SymLink Pub-Sub Integration

```typescript
import { getTopicName, prepareSatisfactionUpdate } from './tree-v2/symlinks'

// 1. Subscribe to remote entity's satisfaction updates
const remoteTopic = getTopicName(remoteEntityId, remoteNodeId)

// Fireproof automatically handles the subscription
myTreeDB.subscribe((changes) => {
  for (const change of changes) {
    const update = change.doc as RemoteSatisfactionData
    
    // Update local SymLink cache
    const newCache = updateCachedSatisfaction(
      symlinkCache,
      symLinkNodeId,
      update
    )
    
    // Recalculate derived state
    const newTree = recalculateAllSatisfaction(tree, newCache)
  }
})
```

#### B. Multi-Device Tree Sync

```typescript
// Device A
const treeDB = fireproof('tree-alice')
connect.libp2p(treeDB, 'recognition-trees')

// Update tree on Device A
const { tree: newTree, node_id } = createNode(tree, {...})
await treeDB.put({ _id: 'entity_alice', tree_store: newTree })

// Device B (automatically syncs)
const treeDB = fireproof('tree-alice')
connect.libp2p(treeDB, 'recognition-trees')

treeDB.subscribe((changes) => {
  console.log('Tree synced from Device A!')
  // Fireproof's CRDT handled the merge
})
```

---

### 4. **Validation Layer** → Zod Schemas

**Perfect Alignment:**
- ✅ tree-v2 uses Zod for all schemas
- ✅ architecture.md specifies Zod for VC/UCAN validation
- ✅ "Filter on Read" pattern applies to both

**Unified Validation:**
```typescript
// Reading from Fireproof (untrusted input)
const results = await treeDB.query('index', 'entity_id')

const validEntities = results.rows
  .map(row => row.doc)
  .filter(doc => {
    const result = EntityStateSchema.safeParse(doc)
    if (!result.success) {
      console.warn('Skipping malformed entity:', doc._id)
    }
    return result.success
  })
  .map(doc => EntityStateSchema.parse(doc))
```

---

### 5. **Allocation Layer** → ShareOfGeneralSatisfaction + UCANs

**Integration Flow:**

```typescript
// 1. Calculate shares (tree-v2/computation)
const shareMap = calculateShareMap(providerTree, symlinkCache)

// 2. Calculate allocations (tree-v2/allocations)
const allocations = calculateAllocations({
  provider_id: providerDID,
  capacity_slot_id: 'cap_tutoring',
  available_quantity: 100,
  share_map: shareMap,
  recipients: [
    { entity_id: recipientDID, need_slot_id: 'need_math' }
  ]
})

// 3. Issue UCAN for the allocation (architecture.md)
const allocationUCAN = await Client.delegate({
  issuer: providerSigner,
  audience: recipientDID,
  capabilities: [{
    can: 'resource/claim',
    with: `cap_tutoring`,
    nb: {
      quantity: allocations[0].offered_quantity,
      allocation_id: allocations[0].allocation_id
    }
  }],
  expiration: Date.now() + (24 * 60 * 60 * 1000) // 24h
})

// 4. Store allocation + UCAN
await allocationDB.put({
  _id: allocations[0].allocation_id,
  ...allocations[0],
  ucan: allocationUCAN.cid
})
```

---

## Complete Integration Example

```typescript
import { fireproof } from '@fireproof/core'
import { connect } from '@fireproof/connect'
import * as Signer from '@ucanto/principal/ed25519'
import {
  createNode,
  createReference,
  recalculateAllWeights,
  recalculateAllSatisfaction,
  calculateShareMap,
  calculateAllocations,
  serializeEntityState
} from './tree-v2'

// 1. Initialize Identity (architecture.md)
const myKey = await Signer.generate()
const myDID = myKey.did()

// 2. Initialize Storage (architecture.md)
const treeDB = fireproof('tree-' + myDID)
const allocationDB = fireproof('allocations-' + myDID)
connect.libp2p(treeDB, 'recognition-trees')
connect.libp2p(allocationDB, 'allocations')

// 3. Create Initial Tree (tree-v2)
let myTree: TreeStore = {
  entity_id: myDID,
  root_ref_id: 'ref_root',
  tree_version: generateTreeVersion(),
  nodes: {
    root_1: {
      id: 'root_1',
      type: 'Root',
      name: 'My Mission',
      entity_id: myDID,
      default_child_ids: [],
      created_at: Date.now(),
      updated_at: Date.now()
    }
  },
  tree_references: {
    ref_root: {
      ref_id: 'ref_root',
      node_id: 'root_1',
      created_at: Date.now()
    }
  },
  derived_state: {},
  last_updated: Date.now()
}

// 4. Add Nodes (tree-v2)
const { tree: tree1, node_id: goalId } = createNode(myTree, {
  type: 'Goal',
  name: 'Education',
  points: 70,
  default_child_ids: []
})

const { tree: tree2, ref_id } = createReference(tree1, {
  node_id: goalId,
  parent_ref_id: 'ref_root'
})

// 5. Calculate Derived State (tree-v2)
const tree3 = recalculateAllWeights(tree2)
const tree4 = recalculateAllSatisfaction(tree3, {
  subscriptions: {},
  remote_satisfaction: {}
})

// 6. Store in Fireproof (architecture.md)
await treeDB.put({
  _id: myDID,
  entity_id: myDID,
  tree_store: tree4,
  symlink_cache: { subscriptions: {}, remote_satisfaction: {} },
  share_map: {},
  allocations: [],
  last_updated: Date.now()
})

console.log('Tree created, computed, and synced to peers!')

// 7. Subscribe to Updates (multi-device sync)
treeDB.subscribe(async (changes) => {
  console.log(`Synced ${changes.length} changes from peers`)
  
  for (const change of changes) {
    const entityState = EntityStateSchema.safeParse(change.doc)
    if (entityState.success) {
      console.log('Valid entity update:', entityState.data.entity_id)
    }
  }
})
```

---

## Key Design Decisions

### 1. **Entity ID = Root DID**
- tree-v2's `EntityId` is the Root DID from architecture.md
- Globally unique, cryptographically verifiable
- No username/email needed

### 2. **Tree Mutations = UCAN-Authorized**
- All tree operations (createNode, updateNode, etc.) require UCAN delegation
- Devices prove authority via UCAN chains
- Same security model as VC issuance

### 3. **Storage = Fireproof = Automatic Sync**
- tree-v2 functions are pure (return new state)
- Fireproof handles persistence, encryption, replication
- No manual sync code needed

### 4. **Allocations = UCANs with Quantity**
- ShareOfGeneralSatisfaction determines allocation amounts
- UCAN grants access to specific quantity
- Recipient can accept/decline via UCAN invocation

### 5. **SymLinks = Remote DIDs + Fireproof Topics**
- `symlink_target.entity_id` is a remote Root DID
- Subscribe to remote entity's Fireproof database topic
- Satisfaction updates flow via GossipSub

---

## Offline Capabilities

**What Works Offline (tree-v2 + architecture.md):**

1. ✅ **Tree Navigation** - All pure functions work offline
2. ✅ **Weight Calculation** - Pure math, no network needed
3. ✅ **Satisfaction Calculation** - Uses cached SymLink data
4. ✅ **Allocation Calculation** - Based on local ShareMap
5. ✅ **Tree Mutations** - Queue in Fireproof, sync when online
6. ✅ **Validation** - Zod schemas run locally

**What Requires Network (Eventual Consistency):**

1. ❌ **SymLink Satisfaction Updates** - Need remote entity online
2. ❌ **Multi-Device Sync** - Devices must connect to sync
3. ❌ **Revocation Checks** - Need latest revocation list
4. ❌ **Key Rotation Discovery** - Need network to see updates

**Mitigation:**
- Cached SymLink data allows stale-but-valid calculations offline
- Short-lived UCANs minimize revocation window
- Multi-device sync queues updates for when connection restores

---

## Security Model

**Defense in Depth:**

1. **Transport Layer** (Fireproof)
   - Encrypted at rest (AES-256-GCM)
   - Content-addressed (CIDs prevent tampering)
   - Merkle proofs for integrity

2. **Identity Layer** (DIDs + UCANs)
   - Cryptographic proof of authority
   - Delegation chains verifiable offline
   - Revocation via Fireproof CRDT

3. **Application Layer** (tree-v2)
   - Zod validation at all boundaries
   - Immutable data structures
   - Pure functions (no side effects)

4. **Network Layer** (libp2p)
   - Encrypted transport (TLS)
   - Peer authentication via DIDs
   - GossipSub prevents spam

---

## Summary

The integration is **seamless**:

- ✅ **Identity**: tree-v2's `EntityId` = architecture.md's Root DID
- ✅ **Storage**: tree-v2's state = Fireproof documents
- ✅ **Network**: tree-v2's pub-sub = libp2p GossipSub
- ✅ **Auth**: tree-v2's operations = UCAN-authorized
- ✅ **Validation**: Both use Zod schemas
- ✅ **Encryption**: Fireproof handles automatically

**tree-v2 provides the recognition tree logic.**  
**architecture.md provides the identity, storage, and network infrastructure.**

Together, they create a **fully decentralized, local-first recognition economy**! 🎉
