# Deduction Determination Analysis

## How Each Deduction is Determined

### D1: Replacement of Means of Production Used Up

**What it is:** Replace worn-out/used-up production equipment and materials

**How determined:**
- **INPUT to optimization** (not calculated by optimizer)
- Calculated from Stock-Book depreciation records
- Formula: `D1_i = Depreciation_i = (Usage_i / Lifespan_i) × ALT_i`
- Based on **past period's actual operations**
- Example: Used 10kg flour → need to replace 10kg flour

**Dependencies:** 
- NONE (it's a pure input based on historical data)
- Independent of all other deductions
- Determined by: Stock-Book + past operations

---

### D2: Additional Portion for Expansion

**What it is:** Resources allocated to build NEW productive capacity

**How determined:**
- **OUTPUT of optimization** (optimizer decides this)
- It's a TARGET/OBJECTIVE: "We want to expand by X%"
- Allocated from whatever remains after satisfying constraints
- Example: "Build 2 new machines" vs "Build 5 new machines" (optimizer chooses based on available resources)

**Dependencies:**
- Depends on: D1, D3 being satisfied first
- D2 uses what's LEFT OVER after constraints
- **FUTURE FEEDBACK**: Today's D2 → Tomorrow's D1 ↑ (new machines will need replacement)

---

### D3: Reserve/Insurance Funds

**What it is:** Safety buffer against accidents, natural disasters, variance

**How determined:**
- **HYBRID** (constraint with calculated magnitude)
- Formula: `D3_i = Risk_Factor × Usage_i`
- Question: What is `Usage_i`?

**Current implementation:**
```typescript
Usage_i = D1_i + D6_i  // Only these two
```

**Your proposed:**
```typescript
Usage_i = D1_i + D2_i + D4_i + D5_i + D6_i  // ALL deductions
```

**Dependencies:**
- Depends on: D1 (always)
- Should depend on: D2, D4, D5, D6 (to insure them)
- **CIRCULAR**: D3 needs D2, but D2 comes after D3 allocation

---

### D4: General Administration Costs

**What it is:** Overhead for non-production admin (coordination, planning, record-keeping)

**How determined:**
- **OUTPUT of optimization** (but with a MAX cap)
- OBJECTIVE: Minimize (allocate as little as possible)
- Admin_Max = policy parameter
- Allocated sparingly from remaining capacity

**Dependencies:**
- Depends on: Available capacity after D1, D3
- Independent magnitude (just a max limit)
- Should D3 insure this? **YES** (if admin office burns down, need reserves)

---

### D5: Common Needs (Schools, Health, etc.)

**What it is:** Public goods, social services, collective welfare

**How determined:**
- **OUTPUT of optimization** (with a MIN target)
- OBJECTIVE: Maximize (allocate generously)
- Common_Min = minimum acceptable level (policy)
- Allocated generously from remaining capacity

**Dependencies:**
- Depends on: Available capacity after D1, D3
- Independent magnitude (just a min target)
- Should D3 insure this? **YES** (if school burns down, need reserves)

---

### D6: Funds for Unable to Work

**What it is:** Support for elderly, sick, disabled, etc.

**How determined:**
- **CURRENTLY: INPUT constraint** (must satisfy minimum)
- **YOUR PROPOSAL: OUTPUT objective** (maximize solidarity)

**Dependencies:**
- Currently: Independent (fixed input)
- Proposed: Depends on available capacity after D1, D3
- Should D3 insure this? **MAYBE** (can't "reserve" food for future sick people the same way you reserve machines)

---

## The Circular Dependency Problem

### Current Order of Calculation:

```
1. D1 ← Stock-Book (input)
2. D6 ← Policy parameter (input)
3. D3 ← Risk_Factor × (D1 + D6)
4. Calculate remaining capacity
5. D5 ← Allocate from remaining
6. D4 ← Allocate from remaining  
7. D2 ← Allocate from remaining
```

### The Problem:

D3 is calculated at step 3, but it SHOULD protect D2, D4, D5 (calculated at steps 5-7).

---

## Proposed Solution: Cascading D3

### Your Insight:

> "D3 should try to achieve full risk protection for all Deductions, but **always fully satisfying D1 first**, then D2, then D4, then D5, then D6"

### Implementation:

**Cascading Protection Levels:**

```
D3_minimal = Risk_Factor × D1                    // Must have (protect current capacity)
D3_with_expansion = D3_minimal + Risk_Factor × D2    // If we can afford expansion, insure it
D3_with_admin = D3_with_expansion + Risk_Factor × D4 // If we can afford admin, insure it
D3_with_common = D3_with_admin + Risk_Factor × D5    // If we can afford schools, insure them
D3_full = D3_with_common + Risk_Factor × D6          // If we can afford support, insure it
```

**Algorithm:**

```typescript
// Phase 1: Satisfy D1 (MUST)
D1 = depreciation_from_stockbook

// Phase 2: Protect D1 (MUST)
D3 = Risk_Factor × D1

// Phase 3: Try to expand (OBJECTIVE)
remaining = Total - D1 - D3
if (remaining >= D2_target) {
    D2 = D2_target
    D3 += Risk_Factor × D2  // Insure the expansion too!
} else {
    D2 = remaining × 0.5  // Allocate what we can
    // Don't have enough to fully insure expansion → partial insurance or none
}

// Phase 4: Try to allocate admin (OBJECTIVE - minimize)
remaining = Total - D1 - D3 - D2
if (remaining >= D4_max) {
    D4 = min(remaining × 0.1, D4_max)
    D3 += Risk_Factor × D4  // Insure admin if we allocate it
}

// Phase 5: Try to allocate common needs (OBJECTIVE - maximize)
remaining = Total - D1 - D3 - D2 - D4
if (remaining >= D5_min) {
    D5 = min(remaining × 0.4, D5_min)
    D3 += Risk_Factor × D5  // Insure schools if we build them
}

// Phase 6: Try to support unable (OBJECTIVE - maximize)
remaining = Total - D1 - D3 - D2 - D4 - D5
D6 = remaining
// D3 for D6? Not clear (can't pre-reserve food for future illness)
```

---

## Key Dependencies Summary

| Deduction | Type | Determined By | Depends On |
|-----------|------|---------------|------------|
| **D1** | CONSTRAINT (input) | Stock-Book depreciation | NONE |
| **D2** | OBJECTIVE (output) | Optimizer decides | Remaining after D1, D3 |
| **D3** | CONSTRAINT (hybrid) | Risk_Factor × Σ(insured deductions) | D1 (must), D2/D4/D5/D6 (cascading) |
| **D4** | OBJECTIVE (output) | Minimize, cap at max | Remaining after D1, D3, D2 |
| **D5** | OBJECTIVE (output) | Maximize, target min | Remaining after D1, D3, D2, D4 |
| **D6** | OBJECTIVE (proposed) | Maximize solidarity | Remaining after D1, D3, D2, D4, D5 |

---

## The Core Issue: D3 is Recursive

D3 depends on what you allocate, but you can't allocate until you know D3.

**Solution:** Iterative/Cascading calculation where D3 "wraps around" each deduction as it's allocated, checking at each step: "Can we afford to insure this?"

This makes D3 an INTEGRATED part of the allocation process, not a single upfront calculation.