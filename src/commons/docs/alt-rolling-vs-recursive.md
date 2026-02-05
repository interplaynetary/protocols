# ALT Calculation: Recursive vs Rolling Average

## The Ambiguity in stockbook.md

The document can be interpreted two ways:

### Interpretation 1: Rolling Average (What stockbook.md Literally Says)

**During Operation Recording:**
```
1. INPUTS: Use CURRENT ALT values from table
   LT_transferred = q × ALT(P)  [line 38]

2. OUTPUTS: Update ALT as rolling average
   New_ALT(P) = [Q_old × ALT_old + LT_allocated] / (Q_old + q_new)  [line 312]
```

**Example:**
```
Initial state:
- ALT(wheat) = 0.08h/kg (from previous operations)
- ALT(bread) = 0 (never produced before)

Operation: Bake bread
- Input: 20kg wheat × 0.08h/kg = 1.6h (use current ALT)
- Input: 6h labor
- Total LT = 1.6h + 6h = 7.6h
- Output: 40 loaves
- New ALT(bread) = 7.6h / 40 = 0.19h/loaf

Next operation: Bake more bread
- Input: 20kg wheat × 0.08h/kg = 1.6h (still use current ALT)
- Input: 5h labor (more efficient!)
- Total LT = 1.6h + 5h = 6.6h
- Output: 40 loaves
- New ALT(bread) = [(40 × 0.19) + 6.6] / (40 + 40)
                 = [7.6 + 6.6] / 80
                 = 0.1775h/loaf (rolling average)
```

### Interpretation 2: Recursive (What We Implemented)

**During ALT Computation:**
```
Build dependency graph from ALL operations
Recursively compute from raw materials up

ALT(product) = Direct_labor + Σ(Input_qty × ALT(input))
```

**Example:**
```
From ALL operations:
- Wheat operations: 8h → 100kg
- Bread operations: 6h + 20kg wheat → 40 loaves

Recursive computation:
ALT(wheat) = 8h / 100kg = 0.08h/kg
ALT(bread) = (6h + 20kg × 0.08h/kg) / 40
           = 7.6h / 40 = 0.19h/loaf
```

## Key Insight: They're Mathematically Equivalent!

**The rolling average CONVERGES to the recursive value** when:
1. Input ALTs are stable (not changing much)
2. You have enough operations
3. The production network is consistent

### Proof Sketch

For a simple chain (wheat → bread):

**Rolling average after N operations:**
```
ALT(bread)_N = Σ(LT_i) / Σ(qty_i)
             = Σ(direct_labor_i + wheat_i × ALT(wheat)) / Σ(qty_i)
             = [Σ(direct_labor_i) / Σ(qty_i)] + [Σ(wheat_i) / Σ(qty_i)] × ALT(wheat)
             = Avg_direct_labor + Avg_wheat_per_loaf × ALT(wheat)
```

**Recursive calculation:**
```
ALT(bread) = Direct_labor_per_loaf + Wheat_per_loaf × ALT(wheat)
```

**They're the same!** (assuming consistent recipes)

## Which Approach to Use?

### Rolling Average (stockbook.md approach)

**Pros:**
- ✅ Simple to implement during recording
- ✅ No need to rebuild entire graph
- ✅ Works incrementally
- ✅ Handles changing recipes naturally

**Cons:**
- ❌ ALTs lag behind reality (uses old values)
- ❌ Slow convergence if inputs change
- ❌ Doesn't detect circular dependencies

**Best for:** Real-time recording systems

### Recursive (our implementation)

**Pros:**
- ✅ Always correct given current operations
- ✅ Detects circular dependencies
- ✅ Clear mathematical foundation
- ✅ Good for analysis/reporting

**Cons:**
- ❌ Requires rebuilding entire graph
- ❌ More computationally expensive
- ❌ Overkill for simple recording

**Best for:** Periodic analysis, reporting, planning

## Recommendation: Use BOTH!

### During Recording (Real-time)
```typescript
// Use current ALT values (rolling average)
function recordOperation(op: Operation) {
  let totalLT = 0;
  
  // Use CURRENT ALT values from table
  for (const input of op.inputsProducts) {
    const currentALT = getALT(input.productId); // From table
    totalLT += input.quantity * currentALT;
  }
  
  // Add direct labor
  totalLT += op.inputsLabor.reduce((sum, l) => sum + l.hours, 0);
  
  // Update output ALTs as rolling average
  for (const output of op.outputsProducts) {
    updateALTRollingAverage(output.productId, totalLT, output.quantity);
  }
}
```

### During Analysis (Periodic)
```typescript
// Recompute all ALTs recursively for accuracy
function analyzeProduction() {
  const graph = buildALTDependencyGraph(allOperations);
  const accurateALTs = computeALTRecursive(graph);
  
  // Compare with rolling averages
  for (const [productId, recursiveALT] of accurateALTs) {
    const rollingALT = getCurrentALT(productId);
    const error = Math.abs(recursiveALT - rollingALT);
    
    if (error > threshold) {
      console.warn(`ALT drift for ${productId}: ${error}h`);
    }
  }
  
  // Update table with accurate values
  updateALTTable(accurateALTs);
}
```

## Conclusion

**stockbook.md implies rolling average** (non-recursive during recording)

**But the result converges to recursive values** over time

**Our recursive implementation is:**
- ✅ Mathematically rigorous
- ✅ Good for analysis
- ✅ Useful for planning
- ✅ Validates the rolling average approach

**For production systems:**
- Use rolling average during recording (fast, simple)
- Use recursive computation periodically (accurate, validates)
- Alert if they diverge significantly (indicates problems)

Both approaches are valid! The choice depends on whether you're **recording** (rolling) or **analyzing** (recursive).
