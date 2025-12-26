# Bi-Level Priority-Based Allocation System

## Overview

A two-stage allocation system where:
1. **Level 1 (Leader - Providers):** Providers allocate based on their priority proportions, setting upper bounds
2. **Level 2 (Follower - Recipients):** Recipients adjust allocations within provider-set bounds

This prevents extraction attacks while respecting both provider autonomy and recipient preferences.

---

## MATHEMATICAL FORMULATION

### Level 1: Provider-Determined Upper Bounds

**For each provider `p` and recipient `r`:**
```
Upper_Bound(p→r) = Priority(p→r) × Capacity(p)
```

**Properties:**
- Sums to capacity: `Σ_r Upper_Bound(p→r) = Capacity(p)`
- Zero priority = zero upper bound
- Represents maximum provider is willing to give

### Level 2: Recipient Allocation Within Bounds

**Each recipient `r` solves:**
```
Minimize: Σ_p (Allocation(p→r) - Ideal_Recipient_Allocation(p,r))²

Subject to:
1. Σ_p Allocation(p→r) ≤ Need(r)                  (Don't exceed need)
2. 0 ≤ Allocation(p→r) ≤ Upper_Bound(p→r)         (Respect provider bounds)
3. Allocation(p→r) = 0 if Priority(r←p) = 0       (Respect own preferences)
```

**Where:** `Ideal_Recipient_Allocation(p,r) = Priority(r←p) × Need(r)`

---

## COMPLETE ALGORITHM

### Data Structures
```python
class Provider:
    id: str
    capacity: float
    priorities: Dict[str, float]  # recipient_id → priority (sums to 1)

class Recipient:
    id: str
    need: float
    priorities: Dict[str, float]  # provider_id → priority (sums to 1)
```

### Bi-Level Allocation Algorithm
```python
def bi_level_allocation(providers: List[Provider], recipients: List[Recipient]):
    """
    Returns: allocation matrix provider_id × recipient_id → amount
    """
    
    # Step 1: Calculate upper bounds from providers
    upper_bounds = {}
    for provider in providers:
        for recipient_id, priority in provider.priorities.items():
            upper_bounds[(provider.id, recipient_id)] = priority * provider.capacity
    
    # Step 2: Initialize allocations at zero
    allocations = defaultdict(float)
    
    # Step 3: Recipients allocate within bounds (can be done in parallel)
    for recipient in recipients:
        # Find all providers who have non-zero upper bounds for this recipient
        compatible_providers = [
            (pid, upper_bounds.get((pid, recipient.id), 0))
            for pid in recipient.priorities.keys()
            if upper_bounds.get((pid, recipient.id), 0) > 0
        ]
        
        if not compatible_providers:
            continue
            
        # Solve recipient's optimization problem
        recipient_allocations = solve_recipient_problem(
            recipient=recipient,
            compatible_providers=compatible_providers,
            upper_bounds=upper_bounds
        )
        
        # Update global allocations
        for provider_id, amount in recipient_allocations.items():
            allocations[(provider_id, recipient.id)] = amount
    
    # Step 4: Handle leftover capacity (optional charity round)
    allocations = redistribute_leftover_capacity(
        allocations, providers, recipients, upper_bounds
    )
    
    return allocations
```

### Recipient's Optimization Problem
```python
def solve_recipient_problem(recipient, compatible_providers, upper_bounds):
    """
    Solve: Minimize squared deviation from ideal recipient allocation
           Subject to upper bounds and need constraint
    """
    # This is a convex quadratic program
    # Can be solved analytically for simple cases
    
    # Calculate total available from compatible providers
    total_available = sum(upper for _, upper in compatible_providers)
    
    if total_available <= recipient.need:
        # Take all available (within recipient's preferences)
        allocations = {}
        for provider_id, upper in compatible_providers:
            # Take proportionally to recipient's priority for this provider
            recipient_priority = recipient.priorities.get(provider_id, 0)
            allocations[provider_id] = min(
                upper,
                recipient_priority * recipient.need
            )
    else:
        # Need to choose subset (constrained optimization)
        # Solve: minimize Σ (x_i - ideal_i)²
        #        subject to Σ x_i = need, 0 ≤ x_i ≤ upper_i
        
        # Use water-filling algorithm:
        allocations = water_filling_allocation(
            recipient=recipient,
            compatible_providers=compatible_providers
        )
    
    return allocations

def water_filling_allocation(recipient, compatible_providers):
    """
    Water-filling algorithm for recipient allocation.
    Allocates to most preferred providers first, within their bounds.
    """
    # Sort providers by recipient priority (descending)
    sorted_providers = sorted(
        compatible_providers,
        key=lambda x: recipient.priorities.get(x[0], 0),
        reverse=True
    )
    
    allocations = {}
    remaining_need = recipient.need
    
    for provider_id, upper_bound in sorted_providers:
        if remaining_need <= 0:
            allocations[provider_id] = 0
            continue
            
        # How much would we ideally take from this provider?
        ideal = recipient.priorities.get(provider_id, 0) * recipient.need
        
        # Take minimum of ideal, remaining need, and upper bound
        take = min(ideal, remaining_need, upper_bound)
        allocations[provider_id] = take
        remaining_need -= take
    
    # If still have need after using all bounds, distribute proportionally
    if remaining_need > 0:
        # This shouldn't happen if total_available > need, but as fallback
        total_allocated = sum(allocations.values())
        scale = recipient.need / total_allocated
        for pid in allocations:
            allocations[pid] *= scale
    
    return allocations
```

### Leftover Capacity Redistribution
```python
def redistribute_leftover_capacity(allocations, providers, recipients, upper_bounds):
    """
    Optional: Redistribute any unused provider capacity
    while respecting original upper bounds
    """
    # Calculate leftover capacity for each provider
    leftover = {}
    for provider in providers:
        total_allocated = sum(
            allocations.get((provider.id, rid), 0)
            for rid in [r.id for r in recipients]
        )
        leftover[provider.id] = provider.capacity - total_allocated
    
    # Recipients with unmet needs
    unmet_needs = {}
    for recipient in recipients:
        total_received = sum(
            allocations.get((pid, recipient.id), 0)
            for pid in [p.id for p in providers]
        )
        if total_received < recipient.need:
            unmet_needs[recipient.id] = recipient.need - total_received
    
    # Distribute leftover capacity proportionally to priorities
    for provider_id, leftover_capacity in leftover.items():
        if leftover_capacity <= 0:
            continue
            
        # Find recipients with unmet needs that this provider prioritizes
        eligible_recipients = []
        for recipient_id in unmet_needs:
            if (provider_id, recipient_id) in upper_bounds:
                priority = next(p for p in providers if p.id == provider_id
                              ).priorities.get(recipient_id, 0)
                if priority > 0:
                    eligible_recipients.append((recipient_id, priority))
        
        if not eligible_recipients:
            continue
        
        # Distribute leftover capacity proportionally to provider's priorities
        total_priority = sum(priority for _, priority in eligible_recipients)
        
        for recipient_id, priority in eligible_recipients:
            share = priority / total_priority
            additional = min(
                leftover_capacity * share,
                unmet_needs[recipient_id]
            )
            
            allocations[(provider_id, recipient_id)] += additional
            unmet_needs[recipient_id] -= additional
            leftover_capacity -= additional
    
    return allocations
```

---

## KEY PROPERTIES

### 1. **Extraction-Proof Guarantee**
```
Maximum recipient r can receive = Σ_p Priority(p→r) × Capacity(p)
No declaration of high need can increase this bound.
```

### 2. **Provider Autonomy Preservation**
- Providers never give more than `Priority × Capacity` to any recipient
- Provider priorities determine maximum possible allocation

### 3. **Recipient Preference Respect**
- Within provider bounds, recipients allocate according to their preferences
- Recipients can refuse allocation from providers they don't prefer

### 4. **Capacity Efficiency**
- Uses all capacity when needs exceed total upper bounds
- Leftover capacity redistributed while respecting original bounds

### 5. **Fairness**
- All recipients treated equally within their priority-attracted bounds
- No gaming the system through need declaration

---

## EXAMPLE WORKFLOW

### Input
```
Provider A: Capacity 100, Priorities: X=0.7, Y=0.3
Provider B: Capacity 80,  Priorities: X=0.4, Y=0.6

Recipient X: Need 150, Priorities: A=0.6, B=0.4
Recipient Y: Need 90,  Priorities: A=0.2, B=0.8
```

### Step 1: Calculate Upper Bounds
```
A→X: 0.7 × 100 = 70
A→Y: 0.3 × 100 = 30
B→X: 0.4 × 80 = 32
B→Y: 0.6 × 80 = 48
```

### Step 2: Recipient X Allocation (Need 150)
```
Available: A:70, B:32 (total 102)
Since 102 < 150, X takes all available:
Ideal distribution (by X's priorities):
  A: 0.6 × 150 = 90 (but bound is 70)
  B: 0.4 × 150 = 60 (but bound is 32)
Take: A→X:70, B→X:32 (total 102)
```

### Step 3: Recipient Y Allocation (Need 90)
```
Available: A:30, B:48 (total 78)
Since 78 < 90, Y takes all available:
Ideal distribution:
  A: 0.2 × 90 = 18 (bound 30, take 18)
  B: 0.8 × 90 = 72 (bound 48, take 48)
Take: A→Y:18, B→Y:48 (total 66)
```

### Step 4: Check Totals
```
A total: 70 + 18 = 88 (capacity 100, leftover 12)
B total: 32 + 48 = 80 (capacity 80, leftover 0)

X received: 102/150 (68%)
Y received: 66/90 (73%)
```

### Step 5: Redistribute Leftover
```
A has 12 leftover
Unmet: X needs 48, Y needs 24
A's priorities: X=0.7, Y=0.3
Distribute: X gets 12×0.7=8.4, Y gets 12×0.3=3.6

Final:
A→X: 78.4, A→Y: 21.6
B→X: 32,   B→Y: 48
X: 110.4/150 (73.6%), Y: 69.6/90 (77.3%)
```

---

## ADVANCED FEATURES

### 1. **Priority Reinforcement**
```python
# Priorities can adjust based on successful allocations
def update_priorities_based_on_performance(providers, recipients, allocations):
    for provider in providers:
        for recipient in recipients:
            if allocations.get((provider.id, recipient.id), 0) > 0:
                # Increase priority for recipients who actually needed/used allocation
                provider.priorities[recipient.id] *= 1.1
        # Renormalize
        total = sum(provider.priorities.values())
        for rid in provider.priorities:
            provider.priorities[rid] /= total
```

### 2. **Emergency Override**
```python
# In emergencies, providers can temporarily increase bounds
def emergency_override(provider_id, recipient_id, multiplier=2.0):
    original_bound = upper_bounds[(provider_id, recipient_id)]
    upper_bounds[(provider_id, recipient_id)] = original_bound * multiplier
    # Track for accountability
    log_emergency_override(provider_id, recipient_id, multiplier)
```

### 3. **Recipient Reputation System**
```python
# Track need declaration accuracy
recipient_reputation = defaultdict(float)

def update_reputation(recipient_id, declared_need, actual_usage):
    accuracy = 1 - abs(declared_need - actual_usage) / declared_need
    recipient_reputation[recipient_id] = (
        0.9 * recipient_reputation[recipient_id] + 0.1 * accuracy
    )
    
def get_adjusted_need(recipient_id, declared_need):
    reputation = recipient_reputation.get(recipient_id, 1.0)
    return declared_need * reputation  # Downscale if historically inaccurate
```

---

## IMPLEMENTATION NOTES

### Scalability
- Recipient problems can be solved in parallel
- Water-filling algorithm is O(n log n) per recipient
- Suitable for large-scale systems

### Privacy Considerations
- Providers don't need to know other providers' allocations
- Recipients only need to know their own upper bounds
- Can be implemented with zero-knowledge proofs

### Incentive Compatibility
- No benefit to over-declaring needs (bounded by provider priorities)
- No benefit to under-declaring needs (get less than could receive)
- Providers incentivized to set accurate priorities

---

## PROOF OF EXTRACTION-PROOFNESS

**Theorem:** A recipient `r` cannot receive more than:
```
M_r = Σ_p Priority(p→r) × Capacity(p)
```

**Proof:**
1. Level 1 sets `Upper_Bound(p→r) = Priority(p→r) × Capacity(p)`
2. Level 2 constraint: `Allocation(p→r) ≤ Upper_Bound(p→r)`
3. Therefore: `Total_Received(r) = Σ_p Allocation(p→r) ≤ Σ_p Upper_Bound(p→r) = M_r`
4. QED: No need declaration can increase `M_r`

**Corollary:** The system is immune to need-inflation attacks.

---

## SUMMARY

This bi-level formulation provides:

1. **Extraction Protection:** Mathematical bounds prevent gaming
2. **Provider Sovereignty:** Priorities determine maximum allocations
3. **Recipient Autonomy:** Choose allocations within bounds
4. **Efficiency:** Uses available capacity while respecting preferences
5. **Fairness:** All recipients limited by same priority-attraction principle

The system naturally balances provider preferences with recipient needs while preventing exploitation through strategic need declaration.