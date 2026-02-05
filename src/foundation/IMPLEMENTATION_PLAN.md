# Foundation Layer Implementation Plan

## Overview

This plan implements the **Local-First Architecture** from `architecture.md`, providing the identity, storage, network, and credential infrastructure that `tree-v2` builds upon.

## Module Structure

```
src/foundation/
├── identity/          # DIDs, keypairs, device management
├── storage/           # Fireproof wrapper, database management
├── network/           # libp2p, pubsub, peer discovery
├── credentials/       # VC issuance, verification, UCAN delegation
├── schemas/           # Zod schemas for VCs, UCANs, protocols
└── index.ts          # Public API
```

---

## Phase 1: Identity Layer (Week 1)

### 1.1 Key Management (`identity/keys.ts`)

**Dependencies:**
```json
{
  "@ucanto/principal": "^9.0.0",
  "tweetnacl": "^1.0.3",
  "tweetnacl-util": "^0.15.1"
}
```

**Functions to implement:**
```typescript
// Generate new keypair
export function generateKeypair(): Promise<{
  privateKey: Uint8Array,
  publicKey: Uint8Array,
  did: string
}>

// Derive DID from public key
export function deriveRootDID(publicKey: Uint8Array): string

// Sign message
export function sign(message: Uint8Array, privateKey: Uint8Array): Uint8Array

// Verify signature
export function verify(
  message: Uint8Array, 
  signature: Uint8Array, 
  publicKey: Uint8Array
): boolean

// Secure storage helpers
export function exportKeypair(keypair: Keypair, passphrase: string): Promise<string>
export function importKeypair(encrypted: string, passphrase: string): Promise<Keypair>
```

**Storage:**
- IndexedDB for private keys (encrypted)
- LocalStorage for DID cache
- QR code export for backup

**Tests:**
- ✅ Generate keypair and derive consistent DID
- ✅ Sign and verify round-trip
- ✅ Export/import with passphrase
- ✅ Key rotation flow

---

### 1.2 Device Management (`identity/devices.ts`)

**Functions to implement:**
```typescript
// Register current device
export function registerDevice(
  rootKey: Keypair,
  deviceName: string
): Promise<{
  deviceId: string,
  deviceKey: Keypair,
  deviceDID: string
}>

// List all devices
export function listDevices(rootDID: string): Promise<Device[]>

// Revoke device
export function revokeDevice(
  rootKey: Keypair, 
  deviceId: string
): Promise<void>

// Check if device is authorized
export function isDeviceAuthorized(
  deviceDID: string,
  rootDID: string
): Promise<boolean>
```

**Schema (Zod):**
```typescript
const DeviceSchema = z.object({
  deviceId: z.string(),
  deviceDID: z.string(),
  deviceName: z.string(),
  authorizedAt: z.number(),
  lastSeen: z.number(),
  capabilities: z.array(z.string())
})
```

**Tests:**
- ✅ Register multiple devices
- ✅ Revoke device and verify access denied
- ✅ Device list syncs across devices

---

## Phase 2: Storage Layer (Week 2)

### 2.1 Fireproof Setup (`storage/database.ts`)

**Dependencies:**
```json
{
  "@fireproof/core": "^0.19.0",
  "@fireproof/connect": "^0.19.0"
}
```

**Functions to implement:**
```typescript
// Initialize database
export function createDatabase(name: string): Database

// Connect to network
export function connectDatabase(
  db: Database, 
  topic: string,
  options?: ConnectionOptions
): Promise<Connection>

// Store document
export function put<T>(
  db: Database,
  doc: T & { _id: string }
): Promise<void>

// Retrieve document
export function get<T>(
  db: Database,
  id: string
): Promise<T | null>

// Query documents
export function query<T>(
  db: Database,
  indexName: string,
  key: string
): Promise<T[]>

// Subscribe to changes
export function subscribe<T>(
  db: Database,
  callback: (changes: Change<T>[]) => void
): Unsubscribe
```

**Database Initialization:**
```typescript
// Create standard databases for a DID
export function initializeDatabases(rootDID: string): {
  treeDB: Database,        // tree-{did}
  vcRegistry: Database,    // vcs-{did}
  revocations: Database,   // revocations-{did}
  allocations: Database    // allocations-{did}
}
```

**Tests:**
- ✅ Create database and store/retrieve documents
- ✅ Multi-device sync via libp2p
- ✅ CRDT conflict resolution
- ✅ Offline queue and sync on reconnect

---

### 2.2 Encryption Layer (`storage/encryption.ts`)

**Functions to implement:**
```typescript
// Encrypt data before storing
export function encryptDocument<T>(
  doc: T,
  masterKey: Uint8Array
): EncryptedDocument

// Decrypt data after retrieving
export function decryptDocument<T>(
  encrypted: EncryptedDocument,
  masterKey: Uint8Array
): T

// Generate dataset master key
export function generateMasterKey(): Uint8Array

// Wrap master key for UCAN recipient
export function wrapKey(
  masterKey: Uint8Array,
  recipientPublicKey: Uint8Array
): WrappedKey

// Unwrap master key from UCAN
export function unwrapKey(
  wrappedKey: WrappedKey,
  recipientPrivateKey: Uint8Array
): Uint8Array
```

**Note:** Fireproof has built-in encryption, but this adds app-level encryption for sensitive data.

**Tests:**
- ✅ Encrypt and decrypt round-trip
- ✅ Key wrapping for delegation
- ✅ Master key rotation

---

## Phase 3: Network Layer (Week 3)

### 3.1 libp2p Integration (`network/p2p.ts`)

**Dependencies:**
```json
{
  "libp2p": "^1.0.0",
  "@libp2p/webrtc": "^4.0.0",
  "@libp2p/websockets": "^8.0.0",
  "@libp2p/gossipsub": "^13.0.0"
}
```

**Functions to implement:**
```typescript
// Initialize libp2p node
export function createNode(identity: PeerId): Promise<Libp2p>

// Start discovery
export function startDiscovery(node: Libp2p): Promise<void>

// Connect to peer
export function connectToPeer(
  node: Libp2p, 
  peerInfo: PeerInfo
): Promise<void>

// Get connected peers
export function getPeers(node: Libp2p): PeerId[]

// Subscribe to pubsub topic
export function subscribeTopic(
  node: Libp2p,
  topic: string,
  handler: (message: Message) => void
): Promise<void>

// Publish to topic
export function publishToTopic(
  node: Libp2p,
  topic: string,
  data: Uint8Array
): Promise<void>
```

**Tests:**
- ✅ Two nodes discover each other
- ✅ Pubsub message delivery
- ✅ WebRTC connection establishment
- ✅ Reconnection on disconnect

---

### 3.2 Peer Discovery (`network/discovery.ts`)

**Functions to implement:**
```typescript
// Announce presence to network
export function announce(
  node: Libp2p,
  rootDID: string
): Promise<void>

// Discover peers for a DID
export function discoverPeers(
  node: Libp2p,
  targetDID: string
): Promise<PeerInfo[]>

// Register discovery service
export function registerDiscoveryService(
  node: Libp2p,
  serviceName: string
): Promise<void>

// Find peers offering a service
export function findService(
  node: Libp2p,
  serviceName: string
): Promise<PeerInfo[]>
```

**Discovery Protocol:**
- mDNS for local network
- Bootstrap nodes for internet
- DHT for decentralized discovery

**Tests:**
- ✅ Local peer discovery via mDNS
- ✅ Remote peer discovery via bootstrap
- ✅ Service advertisement and discovery

---

## Phase 4: Credentials Layer (Week 4-5)

### 4.1 VC Schemas (`schemas/credentials.ts`)

**Dependencies:**
```json
{
  "zod": "^3.22.0"
}
```

**Schemas to implement:**
```typescript
// Base VC Schema (W3C compliant)
export const VerifiableCredentialSchema = z.object({
  '@context': z.array(z.string()),
  type: z.array(z.string()),
  issuer: z.string(),
  issuedAt: z.string().datetime(),
  expirationDate: z.string().datetime().optional(),
  credentialSubject: z.object({
    id: z.string(),
  }).passthrough(),
  proof: z.object({
    type: z.string(),
    created: z.string().datetime(),
    proofPurpose: z.string(),
    verificationMethod: z.string(),
    jws: z.string()
  })
})

// Membership VC
export const MembershipCredentialSchema = VerifiableCredentialSchema.extend({
  type: z.tuple([
    z.literal('VerifiableCredential'),
    z.literal('MembershipCredential')
  ]),
  credentialSubject: z.object({
    id: z.string(),
    membership: z.string(),
    role: z.string().optional()
  })
})

// Contribution VC
export const ContributionCredentialSchema = VerifiableCredentialSchema.extend({
  type: z.tuple([
    z.literal('VerifiableCredential'),
    z.literal('ContributionCredential')
  ]),
  credentialSubject: z.object({
    id: z.string(),
    contribution: z.object({
      projectId: z.string(),
      goalNodeId: z.string(),
      points: z.number().int().positive(),
      description: z.string(),
      timestamp: z.number()
    })
  })
})

// Allocation VC
export const AllocationCredentialSchema = VerifiableCredentialSchema.extend({
  type: z.tuple([
    z.literal('VerifiableCredential'),
    z.literal('AllocationCredential')
  ]),
  credentialSubject: z.object({
    id: z.string(),
    allocation: z.object({
      allocationId: z.string(),
      providerCapacitySlot: z.string(),
      recipientNeedSlot: z.string(),
      resourceType: z.string(),
      offeredQuantity: z.number(),
      shareOfGeneralSatisfaction: z.number().min(0).max(1),
      basis: z.string()
    })
  }),
  evidence: z.array(z.object({
    type: z.string(),
    timestamp: z.string().datetime(),
    shareMap: z.record(z.number()),
    treeVersionCID: z.string()
  })).optional()
})
```

**TypeScript Types:**
```typescript
export type VerifiableCredential = z.infer<typeof VerifiableCredentialSchema>
export type MembershipCredential = z.infer<typeof MembershipCredentialSchema>
export type ContributionCredential = z.infer<typeof ContributionCredentialSchema>
export type AllocationCredential = z.infer<typeof AllocationCredentialSchema>
```

---

### 4.2 VC Issuance (`credentials/issuance.ts`)

**Dependencies:**
```json
{
  "@digitalbazaar/vc": "^6.0.0",
  "@digitalbazaar/ed25519-signature-2020": "^5.0.0"
}
```

**Functions to implement:**
```typescript
// Issue a VC
export async function issueVC<T extends VerifiableCredential>(
  params: {
    type: string[],
    issuer: string,
    subject: string,
    claims: Record<string, any>,
    expiration?: number,
    evidence?: any[]
  },
  issuerKey: Keypair
): Promise<T>

// Verify a VC
export async function verifyVC(
  vc: VerifiableCredential,
  options: {
    trustedIssuers?: string[],
    checkRevocation?: boolean,
    checkExpiration?: boolean
  }
): Promise<VerificationResult>

// Revoke a VC
export async function revokeVC(
  vcId: string,
  reason: string,
  issuerKey: Keypair
): Promise<void>

// Check if VC is revoked
export async function isRevoked(
  vcId: string,
  revocationDB: Database
): Promise<boolean>
```

**Tests:**
- ✅ Issue and verify VC
- ✅ Expired VC fails verification
- ✅ Revoked VC fails verification
- ✅ Untrusted issuer fails verification

---

### 4.3 UCAN Delegation (`credentials/ucan.ts`)

**Dependencies:**
```json
{
  "@ucanto/client": "^9.0.0",
  "@ucanto/server": "^10.0.0",
  "@ucanto/principal": "^9.0.0"
}
```

**Functions to implement:**
```typescript
// Delegate capability
export async function delegate(params: {
  issuer: Signer,
  audience: string,
  capabilities: Capability[],
  expiration: number,
  proofs?: UCAN[]
}): Promise<UCAN>

// Verify UCAN
export async function verifyUCAN(
  ucan: UCAN,
  capability: Capability,
  root: string
): Promise<VerificationResult>

// Invoke capability
export async function invoke(params: {
  capability: Capability,
  proofs: UCAN[],
  invoker: Signer
}): Promise<InvocationResult>
```

**Capability Types:**
```typescript
// Tree mutation capability
const TreeMutateCapability = {
  can: 'tree/mutate',
  with: 'did:key:...' // Entity DID
}

// VC issuance capability
const VCIssueCapability = {
  can: 'vc/issue',
  with: 'did:key:...',
  nb: { type: 'ContributionCredential' }
}

// Resource access capability
const ResourceAccessCapability = {
  can: 'resource/claim',
  with: 'cap_tutoring',
  nb: { quantity: 10, allocation_id: 'alloc_xyz' }
}
```

**Tests:**
- ✅ Delegate capability and verify chain
- ✅ Expired UCAN fails verification
- ✅ Invoke capability with valid proofs
- ✅ Revoked UCAN fails verification

---

## Phase 5: Integration Layer (Week 6)

### 5.1 Public API (`index.ts`)

**High-level functions that combine all layers:**

```typescript
// Initialize the foundation for a user
export async function initializeFoundation(
  passphrase?: string
): Promise<FoundationContext>

// Context object
interface FoundationContext {
  // Identity
  rootDID: string,
  rootKey: Keypair,
  deviceDID: string,
  deviceKey: Keypair,
  
  // Storage
  databases: {
    tree: Database,
    vcs: Database,
    revocations: Database,
    allocations: Database
  },
  
  // Network
  node: Libp2p,
  
  // Methods
  issueVC: <T>(params) => Promise<T>,
  verifyVC: (vc) => Promise<boolean>,
  delegate: (params) => Promise<UCAN>,
  connect: (topic) => Promise<void>,
  subscribe: (topic, handler) => Promise<void>
}
```

**Tests:**
- ✅ Initialize foundation creates all components
- ✅ Multi-device initialization syncs data
- ✅ Issue VC and verify on different device
- ✅ Delegate UCAN and invoke on different device

---

### 5.2 Recovery & Backup (`identity/recovery.ts`)

**Functions to implement:**
```typescript
// Export encrypted backup
export async function exportBackup(
  context: FoundationContext,
  passphrase: string
): Promise<EncryptedBackup>

// Import from backup
export async function importBackup(
  encrypted: EncryptedBackup,
  passphrase: string
): Promise<FoundationContext>

// Shamir secret sharing (social recovery)
export function splitSecret(
  secret: Uint8Array,
  threshold: number,
  shares: number
): Shard[]

export function recoverSecret(shards: Shard[]): Uint8Array

// Key rotation
export async function rotateRootKey(
  oldContext: FoundationContext,
  newKey: Keypair
): Promise<FoundationContext>
```

**Tests:**
- ✅ Backup and restore complete state
- ✅ Social recovery from shards
- ✅ Key rotation updates all devices

---

## Implementation Dependencies

### Package Installation
```bash
npm install \
  @ucanto/principal @ucanto/client @ucanto/server \
  @digitalbazaar/vc @digitalbazaar/ed25519-signature-2020 \
  @fireproof/core @fireproof/connect \
  libp2p @libp2p/webrtc @libp2p/websockets @libp2p/gossipsub \
  tweetnacl tweetnacl-util \
  zod
```

### Dev Dependencies
```bash
npm install -D \
  vitest @vitest/ui \
  @types/libp2p
```

---

## Testing Strategy

### Unit Tests
- Each function has dedicated tests
- Mock Fireproof and libp2p for isolation
- Zod schema validation tests

### Integration Tests
- Multi-device scenarios
- Network partition recovery
- Offline/online transitions

### E2E Tests
- Complete user flows
- Cross-device delegation
- VC issuance and verification chain

---

## Timeline

| Week | Phase | Deliverables |
|------|-------|--------------|
| 1 | Identity | Keys, DIDs, device management |
| 2 | Storage | Fireproof setup, encryption |
| 3 | Network | libp2p, discovery, pubsub |
| 4-5 | Credentials | VC schemas, issuance, UCAN delegation |
| 6 | Integration | Public API, recovery, testing |

**Total Estimated Time: 6 weeks**

---

## Success Criteria

✅ **Foundation Complete When:**
1. User can initialize identity and devices
2. Data syncs across devices via Fireproof
3. VCs can be issued and verified
4. UCANs can be delegated and invoked
5. Network discovery and pubsub working
6. Full test coverage (>80%)
7. tree-v2 can integrate with foundation API

---

## Next Steps After Foundation

Once foundation is complete:
1. Integrate tree-v2 with foundation API
2. Implement VC-based contribution tracking
3. Build allocation system with UCANs
4. Create UI for tree management
5. Deploy to production

---

This foundation provides the **complete infrastructure** for the local-first recognition economy! 🚀
