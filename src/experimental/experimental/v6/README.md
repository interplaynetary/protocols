# Free Association Protocol v6 - Overview

## What's New in v6?

v6 introduces **satisfaction-based learning** on top of v5's recognition-based allocation. The key innovation is that allocation shares evolve based on actual satisfaction with past allocations, creating a feedback loop that improves matching over time.

## Core Differences from v5

### 1. **Allocation → Offer Separation** (NEW in v6)

**v5**: Providers compute allocations and publish them directly as commitments.

**v6**: Two-step process:
1. **Allocation**: Provider computes how they *would* allocate their capacity
2. **Offering**: Provider applies an offering policy to decide what to actually offer

```typescript
// v6 offering policy
{
  commitment_rate: 0.8,  // Offer 80% of computed allocation
  auto_publish: false     // Manual review before publishing
}
```

**Why?** Gives providers control over their commitments while maintaining fair allocation logic.

### 2. **Flexible Acceptance Mechanisms** (NEW in v6)

**v5**: Recipients passively receive allocations.

**v6**: Recipients actively accept offers using strategies:

- **Manual**: Review each offer individually
- **1/N (Antifragile)**: Diversify across N providers (`target_each = need / N`)
- **Weighted**: Accept proportionally by provider reputation
- **Greedy**: Accept best offers first (winner-takes-all)

```typescript
// v6 acceptance policy
{
  strategy: '1/N',
  auto_accept: false,
  max_providers: 3  // Diversify across 3 providers
}
```

**Why?** Recipients can manage risk, diversify dependencies, and express preferences.

### 3. **Satisfaction Learning** (NEW in v6)

**v5**: Recognition is static (manually updated in trees).

**v6**: Shares evolve based on satisfaction ratings:

**The Learning Loop**:
```
Cycle 1 (Bootstrap):
  Recognition → Distribution → Allocation → Offers → Acceptance

Satisfaction Rating (async):
  Recipients rate quality (0.0-1.0)

Learning:
  Aggregate satisfaction → Recompute shares

Cycle 2+ (Learned):
  Recognition × Satisfaction → Distribution → Allocation → Offers → Acceptance
```

**Formulas**:
```typescript
// Provider satisfaction (capacity-weighted average)
capacity_sat = Σ(accepted_qty × satisfaction) / Σ(accepted_qty)

// Recipient shares (recognition weighted by satisfaction)
effective_points = recognition_points × provider_satisfaction
new_share[p] = effective_points[p] / Σ effective_points

// MS formula (same as v5 but with evolved shares)
MS(i,j) = MR(i,j) × share_j(i)
```

**Why?** Allocations improve over time based on actual outcomes, not just declared preferences.

### 4. **Oscillation Dampening** (NEW in v6)

**v5**: No oscillation detection.

**v6**: Detects and dampens rapid need oscillations:

```typescript
// Oscillation pattern: N(t-2) > 0, N(t-1) = 0, N(t) ≈ N(t-2)
if (detectOscillationPattern(history)) {
  activeNeed = declaredNeed × 0.7  // Apply damping factor
}
```

**Why?** Prevents gaming and stabilizes the system.

### 5. **Update Law** (NEW in v6)

**v5**: No formal update law for needs.

**v6**: Monotonic decrease guarantee:

```typescript
// Update law
remaining_need = max(0, declared_need - total_accepted)

// Guarantees:
// 1. Monotonic decrease: N(t+1) ≤ N(t)
// 2. Convergence: N(t) → 0 as t → ∞
// 3. No over-acceptance: total_accepted ≤ declared_need
```

**Why?** Ensures convergence and prevents over-allocation.

## Architecture Comparison

### v5 Architecture
```
Recognition Trees → Distribution → Allocation → Commitments
```

### v6 Architecture
```
Recognition Trees → Distribution (with satisfaction) → Allocation → Offers
                                                                      ↓
                                                                  Acceptance
                                                                      ↓
                                                              Satisfaction Rating
                                                                      ↓
                                                              Update Shares (loop back)
```

## Key Insight: v6 Reuses v5's Allocation Engine

**v6 doesn't replace v5's allocation logic** - it extends it!

```typescript
// v6 allocation is a thin wrapper:
function computeAllocationWithSatisfaction(...) {
  // Step 1-3: Compute satisfaction-based distribution
  const distribution = createSatisfactionDistribution(
    recognition,
    satisfaction  // NEW: weight by satisfaction
  );
  
  // Step 4: Call v5's allocation engine (unchanged!)
  const allocations = allocateWithDistribution(
    capacitySlots,
    distribution,  // Just a different distribution
    allCommitments
  );
  
  // Step 5-6: Apply offering policy (NEW)
  return applyOfferingPolicy(allocations, policy);
}
```

**Why this matters**: v6 gets all of v5's features for free:
- N-tier allocation
- Divisibility constraints
- Multi-pass proportional allocation
- Remainder redistribution
- Spatial/temporal indexing

## Data Flow Comparison

### v5 Data Flow
```
Provider:
  1. Compute recognition weights
  2. Compute allocations
  3. Publish commitments

Recipient:
  1. Observe incoming allocations
  2. Update needs
```

### v6 Data Flow
```
Provider:
  1. Compute recognition weights
  2. Detect oscillations (NEW)
  3. Apply dampening (NEW)
  4. Compute satisfaction-based distribution (NEW)
  5. Compute allocations (v5 engine)
  6. Apply offering policy (NEW)
  7. Publish offers (NEW)

Recipient:
  1. Observe incoming offers (NEW)
  2. Execute acceptance policy (NEW)
  3. Rate satisfaction (NEW, async)
  4. Update needs (v5)

System:
  1. Aggregate satisfaction ratings (NEW)
  2. Recompute shares (NEW)
  3. Next cycle uses new shares (NEW)
```

## Configuration

v6 introduces tunable parameters:

```typescript
export const V6_CONFIG = {
  oscillation: {
    damping_factor: 0.7,           // How much to dampen oscillations
    change_threshold: 0.2,          // Min change to detect oscillation
    history_length: 10              // How many cycles to track
  },
  
  offering: {
    default_commitment_rate: 1.0,   // Offer 100% by default
    default_auto_publish: false     // Manual review by default
  },
  
  acceptance: {
    default_strategy: 'manual',     // Manual acceptance by default
    default_auto_accept: false      // No auto-accept by default
  },
  
  satisfaction: {
    min_value: 0.0,                 // Min satisfaction rating
    max_value: 1.0,                 // Max satisfaction rating
    default: 0.5,                   // Neutral default
    min_ratings_for_learning: 1,    // Min ratings before learning
    learning_rate: 0.3              // How fast shares adapt
  }
};
```

## API Comparison

### v5 API
```typescript
// Compute allocations
const result = allocateWithDistribution(
  myPubKey,
  myCapacitySlots,
  distribution,
  allCommitments
);

// Publish commitments
publishCommitment({
  capacity_slots: myCapacitySlots,
  slot_allocations: result.allocations,
  global_recognition_weights: myRecognition
});
```

### v6 API
```typescript
// Compute allocation with satisfaction
const offerRecord = computeAllocationWithSatisfaction(
  capacitySlot,
  needSlots,
  needSlotOwners,        // NEW: track ownership
  myRecognition,
  othersRecognition,
  myPubKey,
  satisfactionData,      // NEW: satisfaction ratings
  oscillationStates,     // NEW: oscillation tracking
  offeringPolicy         // NEW: offering policy
);

// Recipients accept offers
const acceptanceRecord = executeAcceptancePolicy(
  offers,
  myNeed,
  acceptancePolicy       // NEW: acceptance strategy
);

// Recipients rate satisfaction
const satisfactionRecord = createSatisfactionRecord(
  acceptances,
  ratings                // NEW: quality ratings (0.0-1.0)
);

// System recomputes shares
const newShares = recomputeRecipientShares(
  recognitionTree,
  satisfactionData       // NEW: evolved shares
);
```

## Backward Compatibility

**v6 is backward compatible with v5**:
- If no satisfaction data exists, v6 uses bootstrap (pure recognition)
- Bootstrap distribution = v5's two-tier mutual recognition
- v6 can run alongside v5 (different participants can use different versions)

## Performance

**v6 adds minimal overhead**:
- Satisfaction aggregation: O(R × S) where R = recipients, S = slots
- Oscillation detection: O(H) where H = history length (typically 10)
- Distribution computation: Same as v5 (O(N) where N = participants)
- Allocation: Same as v5 (reuses engine)

**Total**: v6 ≈ v5 + O(R × S + H) which is negligible for typical values.

## Migration Path

**From v5 to v6**:

1. **Phase 1**: Deploy v6 in bootstrap mode (no satisfaction data)
   - Behaves identically to v5
   - No changes to existing allocations

2. **Phase 2**: Enable satisfaction rating
   - Recipients start rating quality
   - Shares begin evolving
   - Allocations improve over time

3. **Phase 3**: Enable offering policies
   - Providers gain commitment control
   - Recipients gain acceptance control
   - Full v6 features active

## Summary

| Feature | v5 | v6 |
|---------|----|----|
| **Recognition** | ✅ Manual tree updates | ✅ Manual tree updates |
| **Satisfaction Learning** | ❌ | ✅ Automatic share evolution |
| **Allocation** | ✅ N-tier recognition-based | ✅ N-tier satisfaction-based |
| **Offering Policy** | ❌ | ✅ Commitment rate control |
| **Acceptance Policy** | ❌ | ✅ Manual/1/N/weighted/greedy |
| **Oscillation Dampening** | ❌ | ✅ Pattern detection + damping |
| **Update Law** | ❌ | ✅ Monotonic convergence |
| **Backward Compatible** | N/A | ✅ Bootstrap mode = v5 |

**Bottom Line**: v6 = v5 + Learning + Control + Stability
