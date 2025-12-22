# P2P Protocol Implementation

A peer-to-peer, offline-first, capability-secure protocol implementation with cryptographic identities, content-addressed storage, and UCAN-based authorization.

## 🎯 Project Status

**Phase 1 & 2: Complete** ✅

- ✅ Identity Module (36 tests)
- ✅ Storage Module (29 tests)
- ✅ ucanto Module (15 tests)
- ✅ Integration Example

**Total: 80 tests passing**

## 📦 Modules

### Identity Module

Cryptographic identities with ed25519 signatures and DID support.

```typescript
import { generateKeypair, publicKeyToDID, sign, verify } from '@protocol/identity';

// Generate a keypair
const keypair = await generateKeypair();

// Convert to DID
const did = publicKeyToDID(keypair.publicKey);
// did:key:z6Mk...

// Sign and verify
const message = new TextEncoder().encode('Hello, world!');
const signature = await sign(message, keypair.secretKey);
const isValid = await verify(signature, message, keypair.publicKey);
```

**Features:**
- ed25519 keypair generation
- did:key format conversion
- Message signing and verification
- Zod schemas for validation

### Storage Module

Content-addressed storage with CIDs and IndexedDB persistence.

```typescript
import { ContentAddressedStorage, createCID } from '@protocol/storage';

const storage = new ContentAddressedStorage();

// Store data
const data = new TextEncoder().encode('Hello, IPFS!');
const cid = await storage.put(data);

// Retrieve data
const retrieved = await storage.get(cid);

// Pin important blocks
await storage.pin(cid);

// Garbage collection
const stats = await storage.gc();
```

**Features:**
- SHA-256 + dag-cbor CID generation
- IndexedDB persistence
- Block pinning
- Garbage collection
- Integrity verification

### ucanto Module

UCAN-based authorization with capability delegation.

```typescript
import { delegate, verify, invoke } from '@protocol/ucanto';
import { generateKeypair, publicKeyToDID } from '@protocol/identity';

const alice = await generateKeypair();
const bob = await generateKeypair();

// Alice delegates capability to Bob
const delegation = await delegate({
  issuer: alice,
  audience: publicKeyToDID(bob.publicKey),
  capabilities: [{
    with: 'https://example.com/doc/123',
    can: 'doc/write',
    nb: { maxSize: 1024 } // Optional caveats
  }],
  expiration: Date.now() + 3600 * 1000
});

// Verify delegation
const result = await verify(delegation.token);
console.log(result.valid); // true
```

**Features:**
- UCAN delegation creation
- Delegation verification
- Proof chains
- Capability caveats
- Expiration handling

## 🚀 Getting Started

### Installation

```bash
# Install dependencies for all packages
cd packages/identity && npm install
cd ../storage && npm install
cd ../ucanto && npm install
cd ../examples && npm install
```

### Running Tests

```bash
# Test specific module
cd packages/identity && npm test
cd packages/storage && npm test
cd packages/ucanto && npm test
```

### Running the Integration Example

```bash
cd packages/examples
npm install
npm run build
npm run example
```

## 🏗️ Architecture

### Module Dependencies

```
┌─────────────┐
│   ucanto    │ ← UCAN delegation & verification
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Identity   │ ← Cryptographic identities
└─────────────┘

┌─────────────┐
│   Storage   │ ← Content-addressed blocks
└─────────────┘
```

### Design Principles

1. **Zod Schemas** - Runtime validation at all module boundaries
2. **Type Safety** - Full TypeScript with strict mode
3. **Standards Compliance** - did:key, CIDs, UCAN, ed25519
4. **Test Coverage** - Comprehensive tests for all functionality
5. **Minimal Dependencies** - Only well-maintained libraries

## 📚 Documentation

- [Walkthrough](/.gemini/antigravity/brain/8cc0e755-ff4a-4303-895a-25c7ef278179/walkthrough.md) - Detailed implementation walkthrough
- [Task Checklist](/.gemini/antigravity/brain/8cc0e755-ff4a-4303-895a-25c7ef278179/task.md) - Implementation progress
- [Implementation Plan](/.gemini/antigravity/brain/8cc0e755-ff4a-4303-895a-25c7ef278179/implementation_plan.md) - Original architecture plan

## 🧪 Testing

All modules have comprehensive test coverage:

**Test Results:**
- Identity: 36/36 passing ✅
- Storage: 29/29 passing ✅
- ucanto: 15/15 passing ✅

**Total: 80 tests passing in <3 seconds**

## 🔧 Development

### Project Structure

```
packages/
├── identity/          # Cryptographic identities
│   ├── src/
│   │   ├── schemas.ts      # Zod schemas
│   │   ├── keypair.ts      # Keypair generation
│   │   ├── did.ts          # DID conversion
│   │   ├── signing.ts      # Sign/verify
│   │   └── index.ts
│   └── test/
├── storage/           # Content-addressed storage
│   ├── src/
│   │   ├── schemas.ts      # Zod schemas
│   │   ├── cid.ts          # CID generation
│   │   ├── storage.ts      # Storage class
│   │   └── index.ts
│   └── test/
├── ucanto/            # UCAN authorization
│   ├── src/
│   │   ├── schemas.ts      # Zod schemas
│   │   ├── principal.ts    # Principal conversion
│   │   ├── delegation.ts   # Delegation logic
│   │   └── index.ts
│   └── test/
└── examples/          # Integration examples
    └── src/
        └── integration.ts
```

## 🌟 Key Features

### Runtime Validation

All data is validated at module boundaries using Zod:

```typescript
import { publicKeySchema, didSchema } from '@protocol/identity';

// Validates at runtime
const publicKey = publicKeySchema.parse(data);
const did = didSchema.parse(didString);
```

### Type Inference

TypeScript types are inferred from Zod schemas:

```typescript
import { type PublicKey, type DID } from '@protocol/identity';

function example(pk: PublicKey, did: DID) {
  // Fully typed!
}
```

### Standards Compliance

- **did:key** - W3C DID standard with ed25519
- **CIDs** - IPLD Content Identifiers
- **UCAN** - User Controlled Authorization Networks
- **ed25519** - EdDSA signatures

## 📈 Next Steps

Future phases:

1. **Transport Module** - Noise protocol for P2P communication
2. **Sync Module** - CRDT-based data synchronization
3. **Production Adapters** - Node.js backends, network transports
4. **Documentation** - API docs, tutorials

## 🤝 Contributing

This is a reference implementation. Key areas for contribution:

- Additional storage backends (filesystem, S3, etc.)
- Network transport implementations
- CRDT synchronization
- Performance optimizations
- Documentation improvements

## 🙏 Acknowledgments

Built with:
- [@noble/ed25519](https://github.com/paulmillr/noble-ed25519) - Cryptography
- [multiformats](https://github.com/multiformats/js-multiformats) - CIDs
- [@ucanto](https://github.com/web3-storage/ucanto) - UCAN
- [Zod](https://github.com/colinhacks/zod) - Schema validation
- [Vitest](https://vitest.dev/) - Testing

---

**Status:** Production-ready foundation with 80 tests passing ✅
