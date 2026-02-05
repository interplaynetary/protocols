# Allocation Algorithms

This directory contains various allocation algorithms for distributing resources proportionally based on recognition weights.

## Algorithm Categories

### 1. Distributed IPF (Iterative Proportional Fitting)
**File:** `ipf-distributed.ts`

**Type:** Distributed, Iterative, Constraint-Based

**Use Case:** Real-time distributed allocation with capacity and need constraints

**Key Features:**
- Asynchronous agent coordination
- Row/column scaling (Sinkhorn-Knopp)
- Capacity constraints (providers)
- Need constraints (recipients)
- Converges to doubly-stochastic solution

**When to Use:**
- Distributed systems (no central coordinator)
- Real-time updates needed
- Both capacity AND need constraints
- Agents communicate asynchronously

**Example:**
```typescript
// Provider updates their scaling
const state = updateProviderState(capacitySlots, knownNeeds, commitments, state);

// Generate proposals
const proposals = generateFlowProposals(capacitySlots, knownNeeds, commitments, state);

// Recipient updates their scaling
const newState = updateRecipientState(needSlots, proposals, state);
```

---

### 2. Alpha-Fairness
**File:** `fairness.ts`

**Type:** Centralized, Optimization-Based, Utility Maximization

**Use Case:** Fair allocation with tunable fairness parameter

**Key Features:**
- Generalized fairness framework
- α = 0: Utilitarian (max-sum)
- α = 1: Proportional fairness (Nash)
- α = 2: Harmonic mean fairness
- α = ∞: Max-min fairness (Rawlsian)

**When to Use:**
- Need to balance efficiency vs equality
- Centralized allocation
- Continuous (divisible) resources
- Want mathematical fairness guarantees

**Example:**
```typescript
// Proportional fairness (α=1)
const result = calculateProportionalFairness(weights, totalCapacity);

// Max-min fairness (maximize minimum allocation)
const result = calculateMaxMinFairness(weights, totalCapacity);

// Custom alpha
const result = calculateAlphaFairAllocation(weights, totalCapacity, 2);
```

---

### 3. Divisor Methods
**File:** `divisor.ts`

**Type:** Centralized, Deterministic, Integer Allocation

**Use Case:** Apportioning indivisible items (seats, discrete resources)

**Key Features:**
- D'Hondt (favors larger parties)
- Webster (more proportional)
- Largest Remainder (quota-based)
- Used globally for political apportionment

**When to Use:**
- Indivisible resources (can't split)
- Need integer allocations
- Want proven political fairness methods
- Centralized allocation

**Example:**
```typescript
// D'Hondt method
const result = calculateDHondt(weights, 10);

// Webster method (more proportional)
const result = calculateWebster(weights, 10);

// Compare all methods
const comparison = compareApportionmentMethods(weights, 10);
```

---

### 4. Gossip-Based Allocation
**File:** `gossip.ts`

**Type:** Distributed, Epidemic-Style, Averaging

**Use Case:** Decentralized load balancing without central coordination

**Key Features:**
- Pairwise averaging
- No central coordinator
- Converges to equal distribution
- Topology-aware (complete, ring, random)

**When to Use:**
- P2P networks
- Load balancing across servers
- No central authority
- Eventual consistency acceptable

**Example:**
```typescript
// Simulate gossip until convergence
const result = simulateGossipAllocation(initialState, topology);

// Single round of gossip
const round = gossipRound(state, topology);
```

---

### 5. Eigenvector Centrality
**File:** `centrality.ts`

**Type:** Graph-Based, Influence Measurement

**Use Case:** Identify influential nodes in recognition network

**Key Features:**
- Power iteration algorithm
- PageRank variant with damping
- Measures influence/importance
- Handles disconnected components

**When to Use:**
- Want to weight by influence/importance
- Have recognition network structure
- Need to identify key coordinators
- Reputation/trust systems

**Example:**
```typescript
// Calculate centrality
const result = calculateEigenvectorCentrality(recognitionNetwork);

// PageRank with damping
const result = calculatePageRank(recognitionNetwork, 0.85);

// Get top influencers
const top5 = getTopCentralNodes(result.scores, 5);
```

---

### 6. Space-Time Matching
**File:** `matching.ts`

**Type:** Utility, Preprocessing

**Use Case:** Bridge between slots and allocation algorithms

**Key Features:**
- Type filtering (same type_id)
- Space matching (location compatibility)
- Time matching (availability overlap)
- Extracts recognition weights

**When to Use:**
- ALWAYS use before other algorithms
- Have rich slot metadata
- Need type/space/time filtering
- Want clean ShareMap for allocation

**Example:**
```typescript
// Prepare input for allocation algorithms
const input = prepareAllocationInput(
  capacitySlots,
  needSlots,
  'childcare',
  commitments
);

// Now use with any algorithm
const result = calculateProportionalFairness(
  input.weights,
  input.totalCapacity
);
```

---

## Comparison Matrix

| Algorithm | Distributed | Continuous | Integer | Constraints | Fairness Type | Complexity |
|-----------|-------------|------------|---------|-------------|---------------|------------|
| **IPF** | ✓ | ✓ | ✗ | Capacity + Need | Proportional | O(iterations) |
| **Alpha-Fairness** | ✗ | ✓ | ✗ | Capacity only | Tunable (α) | O(iterations) |
| **Divisor** | ✗ | ✗ | ✓ | Capacity only | Proportional | O(n·seats) |
| **Gossip** | ✓ | ✓ | ✗ | None | Equal | O(rounds·n) |
| **Centrality** | ✗ | ✓ | ✗ | None | Influence-based | O(iterations·n²) |

---

## Decision Tree

```
Do you have rich slot metadata (type/space/time)?
├─ YES → Use matching.ts first
└─ NO → Continue

Is your system distributed?
├─ YES
│   ├─ Need capacity AND need constraints? → IPF (ipf-distributed.ts)
│   └─ Just load balancing? → Gossip (gossip.ts)
└─ NO (centralized)
    ├─ Need integer allocations? → Divisor methods (divisor.ts)
    ├─ Want tunable fairness? → Alpha-fairness (fairness.ts)
    └─ Want influence-based? → Centrality (centrality.ts)
```

---

## Typical Workflow

1. **Prepare Input** (if using slots)
   ```typescript
   const input = prepareAllocationInput(
     capacitySlots,
     needSlots,
     typeId,
     commitments
   );
   ```

2. **Choose Algorithm**
   ```typescript
   // Option A: Continuous fair allocation
   const result = calculateProportionalFairness(
     input.weights,
     input.totalCapacity
   );
   
   // Option B: Integer allocation
   const result = calculateDHondt(input.weights, 10);
   
   // Option C: Distributed IPF
   const state = updateProviderState(...);
   const proposals = generateFlowProposals(...);
   ```

3. **Apply Results**
   ```typescript
   for (const [pubkey, allocation] of Object.entries(result.allocation)) {
     // Assign allocation to pubkey
   }
   ```

---

## Testing

All algorithms have comprehensive test suites:
- `fairness.test.ts` - 21 tests
- `divisor.test.ts` - 12 tests
- `gossip.test.ts` - 18 tests
- `centrality.test.ts` - 22 tests

Run tests:
```bash
npm test -- algorithms/
```

---

## Mathematical Foundations

### IPF (Sinkhorn-Knopp)
- **Goal:** Find allocation matrix A where rows sum to capacity, columns sum to need
- **Method:** Alternating row/column normalization
- **Convergence:** Guaranteed for positive matrices

### Alpha-Fairness
- **Utility:** U(x) = Σ w_i · x_i^(1-α) / (1-α)
- **Optimization:** Maximize utility subject to capacity constraint
- **Special Cases:** α=0 (utilitarian), α=1 (proportional), α=∞ (max-min)

### Divisor Methods
- **Quotient:** q_i = votes_i / divisor(seats_i)
- **Rule:** Award next seat to highest quotient
- **Variants:** Different divisor functions (D'Hondt: n+1, Webster: 2n+1)

### Gossip
- **Update:** x_new = (x_i + x_j) / 2 for random pair (i,j)
- **Convergence:** Exponential to average
- **Rate:** O(log n) for complete graph, O(n²) for line

### Centrality
- **Power Iteration:** v_{k+1} = A · v_k / ||A · v_k||
- **PageRank:** v_{k+1} = d·A·v_k + (1-d)/n
- **Convergence:** To principal eigenvector

---

## See Also

- `../distribution.ts` - Higher-level distribution logic
- `../ipf-core.ts` - Core IPF utilities
- `../utils/match.ts` - Space-time matching utilities
