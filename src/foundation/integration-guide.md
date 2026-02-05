# Integration Guide: Tree V2 -> Foundation Layer

This guide explains how `tree-v2` should integrate with the new `src/foundation` layer.

## 1. Import Foundations

Instead of using bespoke identity or database logic, `tree-v2` should import from the unified API:

```typescript
import { initializeFoundation, FoundationContext } from '../foundation'
import { Credentials } from '../foundation'
```

## 2. Initialization

Initialize the foundation stack before bootstrapping the tree:

```typescript
// src/tree-v2/main.ts
async function startApp() {
  const foundation = await initializeFoundation('playnet-v1')
  
  console.log('Identity:', foundation.identity.did)
  console.log('PeerID:', foundation.network.peerId)
  
  // Initialize Tree Store with database
  // const treeStore = new TreeStore(foundation.db)
}
```

## 3. Signing & Verification

Use the Identity layer for all cryptographic operations:

```typescript
// Signing a transaction
import { Identity } from '../foundation'

const signature = Identity.sign(data, foundation.identity.privateKey)
```

## 4. Credentials

Use the Credentials layer for issuing VCs or UCANs:

```typescript
// Issue a UCAN for read access
import { Credentials } from '../foundation'

const ucan = await Credentials.delegateCapability(
    foundation.identity, 
    'did:key:zTarget...', 
    [{ with: "tree://root", can: "READ" }]
)
```

## 5. Network (Sync)

The `foundation.db` is already configured for sync via Fireproof Connect.
Direct P2P messaging can be done via `foundation.network`:

```typescript
// Subscribe to tree updates
foundation.network.services.pubsub.subscribe('tree-updates')
foundation.network.services.pubsub.addEventListener('message', (msg) => {
    // Handle update
})
```
