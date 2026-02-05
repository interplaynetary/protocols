# Foundation Layer

**Local-First Infrastructure for the Recognition Economy**

This module implements the foundational layer that `tree-v2` builds upon, providing identity, storage, network, and credential management.

## Architecture

Based on `architecture.md`, this foundation provides:

1. **Identity Layer** - DIDs, keypairs, multi-device management
2. **Storage Layer** - Fireproof CRDTs with encryption
3. **Network Layer** - libp2p peer-to-peer networking
4. **Credentials Layer** - Verifiable Credentials and UCANs

## Module Structure

```
foundation/
├── identity/          # Root DIDs, device keys, recovery
├── storage/           # Fireproof wrappers, encryption
├── network/           # libp2p, pubsub, peer discovery
├── credentials/       # VC issuance/verification, UCAN delegation
├── schemas/           # Zod schemas for all protocols
└── IMPLEMENTATION_PLAN.md  # Detailed implementation guide
```

## Quick Start

```typescript
import { initializeFoundation } from './foundation'

// Initialize for a new user
const context = await initializeFoundation()

console.log('Root DID:', context.rootDID)
console.log('Device DID:', context.deviceDID)

// Issue a membership VC
const membershipVC = await context.issueVC({
  type: ['VerifiableCredential', 'MembershipCredential'],
  subject: context.rootDID,
  claims: {
    membership: 'recognition-network',
    role: 'contributor'
  }
})

// Store in VC registry (auto-syncs across devices)
await context.databases.vcs.put({
  _id: `vc-${Date.now()}`,
  ...membershipVC
})
```

## Key Features

### 🔑 Self-Sovereign Identity
- Ed25519 keypairs stored locally
- `did:key` identifiers (globally unique)
- Multi-device support via UCAN delegation
- Social recovery via Shamir's Secret Sharing

### 💾 Local-First Storage
- Fireproof encrypted CRDTs
- Automatic multi-device sync
- Offline-first with conflict resolution
- Content-addressed for integrity

### 🕸️ Peer-to-Peer Network
- libp2p transport (WebRTC + WebSockets)
- GossipSub for pubsub
- mDNS + DHT for discovery
- No central servers required

### 📜 Verifiable Credentials
- W3C VC standard compliance
- Cryptographic proof of claims
- Portable across platforms
- Revocation support

### 🔐 UCAN Authorization
- Capability-based delegation
- Offline verification
- Expiration and revocation
- Proof chains for authority

## Integration with tree-v2

The foundation layer provides the infrastructure that tree-v2 uses:

| tree-v2 Concept | Foundation Implementation |
|-----------------|---------------------------|
| `EntityId` | Root DID |
| Tree storage | Fireproof database `tree-{did}` |
| SymLink pubsub | libp2p GossipSub topics |
| Contribution claims | VCs in `vcs-{did}` registry |
| Allocations | UCANs with quantity capabilities |
| Multi-device sync | Fireproof CRDT replication |

See `INTEGRATION.md` in tree-v2 for detailed integration guide.

## Implementation Status

See `IMPLEMENTATION_PLAN.md` for the detailed 6-week implementation roadmap.

### Current Status: 🚧 **Planning Phase**

- [ ] Phase 1: Identity Layer
- [ ] Phase 2: Storage Layer
- [ ] Phase 3: Network Layer
- [ ] Phase 4: Credentials Layer
- [ ] Phase 5: Integration Layer

## Dependencies

Core dependencies (see `IMPLEMENTATION_PLAN.md` for full list):
- `@ucanto/principal` - UCAN delegation
- `@digitalbazaar/vc` - Verifiable Credentials
- `@fireproof/core` - CRDT database
- `libp2p` - P2P networking
- `zod` - Schema validation

## Security Model

**Defense in Depth:**

1. **Transport Encryption** - TLS for all network traffic
2. **At-Rest Encryption** - AES-256-GCM via Fireproof
3. **Cryptographic Identity** - Ed25519 signatures
4. **Authorization** - UCAN capability chains
5. **Validation** - Zod schemas at all boundaries
6. **Integrity** - Content-addressing (CIDs)

## Testing

```bash
# Run all foundation tests
npm run test src/foundation

# Run specific module tests
npm run test src/foundation/identity
npm run test src/foundation/storage
npm run test src/foundation/network
npm run test src/foundation/credentials

# Integration tests
npm run test:integration
```

## Documentation

- `IMPLEMENTATION_PLAN.md` - Detailed implementation roadmap
- `architecture.md` (in tree-v2) - Overall system architecture
- `VC-DATA-MODEL.md` (in tree-v2) - VC design patterns

## Examples

See `examples/` directory for:
- Basic identity setup
- Multi-device delegation
- VC issuance flow
- UCAN capability chains
- Peer discovery and sync

## Contributing

This is foundational infrastructure. Changes should:
1. Maintain W3C VC/DID compatibility
2. Preserve offline-first capabilities
3. Not break tree-v2 integration
4. Include comprehensive tests
5. Update documentation

## License

Same as parent project.
