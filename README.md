# Free Association Protocol

A pure, framework-agnostic protocol for decentralized resource allocation and mutual recognition.

## 📦 Package: `@playnet/free-association`

**Version:** 1.0.8  
**License:** AGPL-3.0-or-later

## 🎯 Overview

The Free Association Protocol implements **priority aligned capacity distribution**, enabling decentralized communities to coordinate resource allocation without central authority, bureaucratic overhead, or market exclusion.

### Core Features

- **Priority Aligned Capacity Distribution** - Resources flow based on priority alignment and declared needs
- **Distributed IPF Allocation** - Iterative Proportional Fitting for decentralized coordination
- **Recognition Trees** - Hierarchical contribution attribution and priority derivation
- **Interval Tree Clocks (ITC)** - Causality tracking for distributed systems
- **Compliance Filters** - JSON Logic-based slot compatibility rules
- **Zod Schemas** - Runtime validation for all data structures

## 🚀 Installation

```bash
npm install @playnet/free-association
```

## 📚 Module Exports

### Main Entry Point

```typescript
import { 
  calculateSlotBasedPriorityAllocation,
  calculateCollectiveRecognitionDistribution,
  mutualFulfillment
} from '@playnet/free-association';
```

### Subpath Exports

```typescript
// Schemas and types
import { type Commitment, type NeedSlot, type AvailabilitySlot } from '@playnet/free-association/schemas';

// Allocation algorithm
import { calculateSlotBasedPriorityAllocation } from '@playnet/free-association/allocation';

// Recognition distribution
import { calculateCollectiveRecognitionDistribution } from '@playnet/free-association/distribution';

// Recognition trees
import { mutualFulfillment } from '@playnet/free-association/tree';

// Interval Tree Clocks
import { itcSeed, itcEvent, itcFork, itcJoin } from '@playnet/free-association/itc';

// Utilities
import { slotsCompatible, passesSlotFilters } from '@playnet/free-association/utils/match';

// Filters
import { evaluateComplianceFilter } from '@playnet/free-association/filters/compliance';

// Configuration
import { DEFAULT_CONFIG } from '@playnet/free-association/config';
```

## 🔧 Core Modules

### 1. Allocation (`allocation.ts`)

**Distributed IPF Allocation Protocol** - Implements the "Distributed Recipient Broadcast" protocol where agents coordinate asynchronously by exchanging scaling factors.

**Key Functions:**
```typescript
function updateProviderState(
  capacitySlots: AvailabilitySlot[],
  knownNeeds: NeedSlot[],
  allCommitments: Record<string, Commitment>,
  state: DistributedIPFState,
  epsilon?: number,
  gamma?: number
): DistributedIPFState

function generateFlowProposals(
  capacitySlots: AvailabilitySlot[],
  knownNeeds: NeedSlot[],
  allCommitments: Record<string, Commitment>,
  state: DistributedIPFState,
  epsilon?: number,
  gamma?: number
): FlowProposal[]

function updateRecipientState(
  needSlots: NeedSlot[],
  incomingProposals: FlowProposal[],
  state: DistributedIPFState,
  epsilon?: number
): DistributedIPFState
```

**Features:**
- Asynchronous coordination via scaling factor exchange
- Provider row scaling (x_p) to satisfy capacity constraints
- Recipient column scaling (y_r) to satisfy need constraints
- Mathematical basis: A_pr = K_pr * x_p * y_r (Iterative Proportional Fitting)
- Converges to optimal allocation through distributed computation

### 2. Distribution (`distribution.ts`)

Collective recognition distribution using Shapley values.

**Key Function:**
```typescript
function calculateCollectiveRecognitionDistribution(
  nodes: Node[],
  options?: DistributionOptions
): RecognitionDistribution
```

### 3. Recognition Trees (`tree.ts`)

Hierarchical contribution tracking and mutual fulfillment.

**Key Function:**
```typescript
function mutualFulfillment(
  tree: Node,
  recognitionWeights: Record<string, number>
): MutualFulfillmentResult
```

### 4. Schemas (`schemas.ts`)

Comprehensive Zod schemas for runtime validation:
- `CommitmentSchema` - User commitments with slots and recognition
- `NeedSlotSchema` - Resource needs with priorities
- `AvailabilitySlotSchema` - Resource capacity with priorities
- `SlotAllocationRecordSchema` - Allocation results
- And many more...

### 5. ITC (`itc.ts`)

Interval Tree Clocks for distributed causality tracking.

```typescript
import { itcSeed, itcEvent, itcFork, itcJoin, itcLeq } from '@playnet/free-association/itc';

const stamp1 = itcSeed();
const stamp2 = itcEvent(stamp1);
const isOrdered = itcLeq(stamp1, stamp2); // true
```

## 🧪 Testing

**90 tests passing** across all modules:

```bash
npm test
```

**Test Coverage:**
- Allocation: 6 tests
- Divisibility: 18 tests
- Matching: 39 tests
- Distribution: 17 tests
- ADMM Optimization: 2 tests
- And more...

## 📖 Documentation

Detailed documentation available in `/docs`:
- Algorithm specifications
- Schema definitions
- Integration guides
- Performance benchmarks

## 🏗️ Architecture

### Design Principles

1. **Pure Functions** - No side effects, fully testable
2. **Framework Agnostic** - Works with any JS/TS framework
3. **Runtime Validation** - Zod schemas at all boundaries
4. **Type Safety** - Full TypeScript with strict mode
5. **Standards Compliance** - JSON Logic, Zod, modern ES modules

### Project Structure

```
src/
├── allocation.ts          # Slot-based priority allocation
├── distribution.ts        # Recognition distribution (Shapley)
├── tree.ts               # Recognition trees & mutual fulfillment
├── itc.ts                # Interval Tree Clocks
├── schemas.ts            # Zod schemas & types
├── config.ts             # Default configuration
├── utils/                # Utility functions
│   ├── match.ts         # Slot compatibility matching
│   ├── memoize.ts       # Memoization helpers
│   └── ...
├── filters/              # Compliance filters
│   ├── compliance.ts    # JSON Logic evaluation
│   └── ...
├── attributes/           # Attribute definitions
└── collective/           # Collective coordination
```

## 🌟 Key Concepts

### Priority Aligned Capacity Distribution

Resources flow based on **priority alignment** and **declared needs**:
- **Capacity Slots** - What you can provide (time, money, skills)
- **Need Slots** - What you need
- **Priority Weights** - How you prioritize capacity distribution to different recipients
- **Priority Alignment** - Resources flow to entities contributing to your priorities

### Distributed Coordination

Decentralized allocation through Iterative Proportional Fitting (IPF):
- **Provider Scaling (x_p)** - Providers adjust their offers to stay within capacity
- **Recipient Scaling (y_r)** - Recipients signal saturation to prevent overflow
- **Seed Values (K_pr)** - Base compatibility between capacity and need slots
- **Flow Proposals** - Asynchronous exchange of allocation proposals: A_pr = K_pr * x_p * y_r
- **Convergence** - System converges to optimal allocation through iterative updates

### Recognition Trees

Hierarchical contribution tracking:
- **Recognition Weights** - How much you value others' contributions to your priorities
- **Priority Derivation** - Priorities often derived from recognition of contribution
- **Recognition Trees** - Hierarchical attribution of collective value

### Compliance Filters

JSON Logic rules for slot compatibility:
```typescript
{
  "filter_rule": {
    "and": [
      { ">=": [{ "var": "quantity" }, 10] },
      { "in": [{ "var": "location" }, ["NYC", "SF"]] }
    ]
  }
}
```

## 🔗 Related Projects

- **Free Association App** - SvelteKit application using this protocol
- **Playnet** - Broader ecosystem of decentralized coordination tools

## 📄 License

AGPL-3.0-or-later

## 🤝 Contributing

This is an active research and development project. Contributions welcome!

**Repository:** https://github.com/playnet/free-association

## 🙏 Acknowledgments

Built with:
- [Zod](https://github.com/colinhacks/zod) - Schema validation
- [json-logic-js](https://github.com/jwadhams/json-logic-js) - Filter evaluation
- [Vitest](https://vitest.dev/) - Testing framework

---

**Status:** Production-ready v1.0.8 with 90 tests passing ✅
