# Free Association Protocol

A pure, framework-agnostic protocol for decentralized resource allocation based on mutual recognition of contribution to priority realization.

## 📦 Package: `@playnet/free-association`

**License:** AGPL-3.0-or-later

## 🎯 Foundations

*Proportional Distribution Under Bounded Constraints*

The protocol is built on five fundamental elements that describe the cycle of production and recognition:

### Capacity (Finite Resources)
What you can provide - time, skills, money, attention.

### Goals (Pursued Ends)
What you're trying to achieve - individual and collective priorities.

### Recognition (Subjective Assessment)
Your assessment of who contributes to realizing your goals.

### Allocation (Objective Distribution)
How capacity actually flows based on recognition.

### Outcomes (Realized Results)
What actually happens when capacity is allocated.

**Core Principle:** Entities allocate their capacity in proportion to their recognition of contribution toward their goals.

*Allocation follows Recognition.*

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

## 🔄 The Circuit

*Coordination as Scientific Capacity Allocation*

The protocol creates a continuous cycle that transforms subjective understanding into objective reality and back:

### 1. Subjective Recognition → Objective Allocation
Your current (imperfect) recognition of contributions becomes concrete capacity allocation. What you believe becomes what you do.

### 2. Objective Allocation → Objective Outcomes
Capacity allocation produces real-world results. Resources flow, work happens, goals are pursued.

### 3. Objective Outcomes → Subjective Experience
You experience the results of your allocation decisions. Did your goals get realized? Were your expectations met?

### 4. Subjective Experience → Updated Recognition
Outcomes educate your recognition. You learn who actually contributed, adjust your understanding, and the cycle continues.

**Convergence:** Under the right conditions (voluntary allocation, transparent outcomes, revocable commitments), this cycle drives recognition toward truth and allocation toward optimality.

The gap between subjective recognition and objective truth creates the pressure for learning. The protocol doesn't prescribe what to recognize - it makes accurate recognition advantageous.

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

## 🌟 Core Concepts

### Alignment (α)

**Alignment** measures how closely your capacity allocation matches true recognition of contribution to your goals.

*"What percentage of my capacity flows proportionally to who actually helps me achieve my goals?"*

- **100% aligned** → All capacity goes to the right people in the right proportions
- **50% aligned** → Half well-directed, half misdirected  
- **0% aligned** → Completely opposite to who actually helps

### Alignment Velocity (v)

**Alignment Velocity** measures how fast alignment improves or degrades. Every moment of misallocation is lost goal achievement.

- **Positive velocity** → Getting more aligned (learning, correcting)
- **Negative velocity** → Getting less aligned (degrading)
- **Zero velocity** → Stable (either perfect or stuck)

The protocol creates incentives to: (1) **Discover** misallocations as fast as possible, (2) **Correct** them immediately, and (3) **Uphold** conditions that enable fast discovery and correction.

### True vs False Recognition

**True Recognition:** Recognition of contribution that *enables the continued realization of priorities* (self-sustaining).

**False Recognition:** Recognition of contribution that *impairs the continued realization of priorities* (self-terminating).

**The Anti-Gaming Proof:** False recognition displaces capacity from beneficial allocations → worse outcomes → immediate incentive to correct → free-rider loses allocation.

The system creates natural incentives for true recognition because the cost of misrecognition falls directly on you.

### Abundance

**Proportional relationships have infinite potential.** Each relationship is a proportion, not an absolute quantity.

- 30% of 10 = 3
- 30% of 100 = 30
- 30% of 1,000,000 = 300,000

The proportion remains constant while absolute values scale infinitely. This is abundance: not that resources are unlimited, but that *relationships scale without limit*.

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

Recognition of contribution to priority realization:
- **Contribution to Priority Realization** - Mutual recognition of who contributed, how much, to which priorities, and how those priorities compose
- **Proportional Structure** - Recognition flows through hierarchical priorities, capturing the full picture
- **Four Dimensions** - Contribution accuracy (who), proportional accuracy (how much), priority accuracy (what matters), compositional accuracy (how goals decompose)

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

## 🌍 The Transformation

*From Coercion to Voluntary Coordination*

This protocol enables a fundamental shift in how we coordinate:

### Voluntary Contribution Substitutes Coerced Labor
Organizational priorities realized through voluntary contribution as the primary mechanism.

### Organizations Become Free
Organizations operate through voluntary association rather than coercion. Participants directly shape organizational function.

### Coordination Becomes Scientific
Scientific capacity allocation replaces ideological struggle, enabling continuous discovery of effective coordination patterns.

**The Vision:** A civilization where the fulfillment of needs and the pursuit of goals are coordinated through the free alignment of capacity rather than directed by force. By making the social direction of production legible, voluntary, and scientifically adjustable, we unleash the collective intelligence of the species.

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