# Deriving Operation Priorities from Stock-Book Structure

## The Key Insight

**Priority isn't assigned—it's computed from the dependency graph.**

Operations that satisfy more critical needs or enable more downstream operations naturally have higher priority. This emerges from the Stock-Book's recorded reality, not from bureaucratic categorization.

---

## Method 1: Dependency Graph Analysis

### Building the Graph

Every operation creates a dependency chain:

```
Operation: Farming
  Inputs: Seeds, Water, Land, Labor
  Effects: +Wheat
  
Operation: Milling  
  Inputs: Wheat, Mill, Labor
  Effects: +Flour
  
Operation: Baking
  Inputs: Flour, Oven, Labor
  Effects: +Bread
  
Operation: Eating
  Inputs: Bread, Time
  Effects: +LP_restored
```

**Dependency graph:**
```
Farming → Wheat → Milling → Flour → Baking → Bread → Eating → LP_restored
```

### Computing Priority: Distance from Final Needs

**Algorithm:**
```
1. Identify terminal nodes (operations with effects that aren't inputs to other operations)
2. These are "final needs" - eating, healthcare, education
3. Calculate distance from each operation to nearest final need
4. Priority = inverse of distance

Priority(op) = 1 / (distance_to_final_need(op) + 1)
```

**Example:**
- Eating: distance=0 → priority=1.0 (highest)
- Baking: distance=1 → priority=0.5
- Milling: distance=2 → priority=0.33
- Farming: distance=3 → priority=0.25

**Refinement:** Weight by how many final needs depend on this operation
```
Priority(op) = count(final_needs_depending_on_op) / (distance + 1)
```

---

## Method 2: Consumption Frequency Analysis

### What People Actually Consume

The Stock-Book records consumption operations. Analyze patterns:

```sql
-- Operations consuming products frequently
SELECT effect_product, COUNT(*) as consumption_count
FROM operations
WHERE effects LIKE '%LP_restored%'  -- Consumption operations
GROUP BY effect_product
ORDER BY consumption_count DESC
```

**Result:**
```
Bread: 1000 operations/month
Medicine: 50 operations/month
Entertainment: 200 operations/month
```

### Priority from Frequency

```
Priority_base(product) = log(consumption_frequency)
```

Operations producing high-frequency products get higher priority.

---

## Method 3: Bottleneck Detection

### Identifying Critical Paths

**Bottleneck = operation with no substitutes**

```
For product P:
  alternative_operations = operations that produce P
  
  If len(alternative_operations) == 1:
    → This operation is a bottleneck
    → Priority += bottleneck_bonus
```

**Example:**
- Wheat can only be grown (no imports) → Farming is bottleneck → priority ↑
- Bread can be bought OR made → Baking not bottleneck → priority normal

### Computing Bottleneck Impact

```python
def bottleneck_priority(operation):
  products_produced = operation.effects
  total_dependency_count = 0
  
  for product in products_produced:
    # How many operations depend on this product?
    downstream = count_operations_using(product)
    
    # How many other ways to get this product?
    alternatives = count_operations_producing(product)
    
    if alternatives == 1:
      # Bottleneck! Many depend on this, no alternatives
      total_dependency_count += downstream
  
  return total_dependency_count
```

---

## Method 4: Labor Power Restoration Chain

### The Most Critical Chain

Everything ultimately serves labor power restoration:

```
All operations → Products → Consumption → LP_restored → Labor → Production
```

**Trace backwards from LP restoration:**

```python
def trace_lp_chain(operation):
  """How directly does this operation contribute to LP restoration?"""
  
  # Direct LP restoration (eating, sleeping, healthcare)
  if 'LP_restored' in operation.effects:
    return 10  # Highest priority
  
  # Produces inputs for LP restoration (baking bread)
  effects = operation.effects
  if any(is_consumed_for_lp(product) for product in effects):
    return 8
  
  # Produces inputs for producers (making ovens for bakers)
  if any(is_means_of_production(product) for product in effects):
    return 6
  
  # Produces inputs for means of production (mining iron for ovens)
  if any(enables_means_of_production(product) for product in effects):
    return 4
  
  # Long chain or administrative
  return 2
```

---

## Method 5: Skill/Capability Enhancement

### Operations that Increase Productive Capacity

Training and education are special - they expand future capabilities:

```python
def skill_priority(operation):
  """Does this operation increase labor power?"""
  
  effects = operation.effects
  
  # Increases skill inventory (training)
  if any('LP_' in effect and 'skill' in effect for effect in effects):
    # Future-oriented: high but not immediate survival
    return 7
  
  # Immediate energy restoration
  if 'LP_base' in effects:
    return 10
  
  return 0
```

---

## Method 6: Historical Necessity

### What Happens When This Operation Doesn't Run?

Simulate absence and measure impact:

```python
def necessity_score(operation, historical_data):
  """What happens if we skip this operation?"""
  
  # Remove operation from historical schedule
  simulated_stockbook = historical_data.without(operation)
  
  # Count downstream operations that fail
  failed_operations = []
  for other_op in historical_data.operations:
    if cannot_execute(other_op, simulated_stockbook):
      failed_operations.append(other_op)
  
  # Priority = how many operations depend on this
  return len(failed_operations)
```

**Example:**
- Skip "Harvest wheat" → 50 operations fail (milling, baking, eating) → priority=50
- Skip "Paint factory" → 1 operation fails (factory looks ugly) → priority=1

---

## Combining Methods: Composite Priority

### The Complete Algorithm

```python
def compute_operation_priority(operation, stockbook):
  """Derive priority from structure, not tags"""
  
  # Method 1: Distance to final needs
  p1 = 1.0 / (distance_to_final_need(operation, stockbook) + 1)
  
  # Method 2: Consumption frequency of outputs
  p2 = log(consumption_frequency(operation.effects, stockbook))
  
  # Method 3: Bottleneck detection
  p3 = bottleneck_priority(operation, stockbook)
  
  # Method 4: LP restoration chain
  p4 = trace_lp_chain(operation)
  
  # Method 5: Skill enhancement
  p5 = skill_priority(operation)
  
  # Method 6: Historical necessity (expensive, compute periodically)
  p6 = necessity_score(operation, stockbook.historical)
  
  # Weighted combination
  priority = (
    0.3 * p1 +  # Distance to needs
    0.2 * p2 +  # Frequency
    0.2 * p3 +  # Bottleneck
    0.15 * p4 + # LP chain
    0.1 * p5 +  # Skills
    0.05 * p6   # Necessity
  )
  
  return priority
```

---

## Example: Complete Derivation

### Operation: "Bake Bread"

```
Inputs: Flour (20kg), Oven (4h), Labor (6h)
Effects: +40 loaves bread
```

**Analysis:**

**Distance to final need:**
- Bread → Eating (distance=1)
- Priority component: 1/(1+1) = 0.5

**Consumption frequency:**
- Bread consumed: 1000 loaves/month
- Priority component: log(1000) ≈ 3.0

**Bottleneck detection:**
- Alternative bread sources: Buying from neighbor (rare)
- Alternatives count: 2
- Not critical bottleneck
- Priority component: 0.1

**LP restoration chain:**
- Produces input for LP restoration (bread → eating → LP)
- Priority component: 8

**Composite priority:**
```
P = 0.3(0.5) + 0.2(3.0) + 0.2(0.1) + 0.15(8) + ... 
  = 0.15 + 0.6 + 0.02 + 1.2 + ...
  = ~2.0
```

### Operation: "Paint Factory Walls"

```
Inputs: Paint (5kg), Brush (2h), Labor (8h)
Effects: +Aesthetic_value
```

**Analysis:**

**Distance to final need:**
- Aesthetic → ??? (very indirect)
- Priority component: ~0.01

**Consumption frequency:**
- Aesthetic consumed: 0 operations (no one "consumes" aesthetics)
- Priority component: log(1) = 0

**Bottleneck detection:**
- We can skip painting
- Priority component: 0

**LP restoration chain:**
- No direct or indirect contribution
- Priority component: 2 (overhead)

**Composite priority:**
```
P = 0.3(0.01) + 0.2(0) + 0.2(0) + 0.15(2)
  = 0.003 + 0 + 0 + 0.3
  = ~0.3
```

**Result:** Baking (2.0) is ~7× higher priority than painting (0.3)

---

## Benefits of Derived Priorities

### 1. No Manual Tagging
- Stock-Book records operations as-is
- Priorities computed from structure
- Updates automatically as patterns change

### 2. Reflects Reality
- Based on what people actually consume
- Based on actual dependencies
- Based on measured necessity

### 3. Adaptable
- New operation types automatically get computed priorities
- Changing consumption patterns automatically shift priorities
- Seasonal variations reflected in frequency analysis

### 4. Transparent
- Priority calculation is deterministic
- Can explain: "Why is farming priority 8?" → "Because 50 downstream operations depend on wheat"
- No arbitrary bureaucratic decisions

### 5. Emergent Categories
- High-priority operations cluster around survival (food, health)
- Medium-priority around development (education, tools)
- Low-priority around overhead (admin, aesthetics)
- **Categories emerge from priorities, not imposed beforehand**

---

## Implementation

### Phase 1: Build Dependency Graph
```typescript
interface OperationNode {
  operation: Operation;
  inputs: ProductId[];
  outputs: ProductId[];
  dependsOn: OperationNode[];  // Upstream
  enables: OperationNode[];     // Downstream
}

function buildGraph(stockbook: StockBook): Graph {
  // For each operation, trace inputs back to producers
  // For each operation, trace outputs forward to consumers
}
```

### Phase 2: Compute Metrics
```typescript
function computePriority(op: OperationNode, graph: Graph): number {
  const distance = shortestPathToFinalNeed(op, graph);
  const frequency = consumptionFrequency(op.outputs);
  const bottleneck = countDependents(op) / countAlternatives(op);
  // ... combine metrics
}
```

### Phase 3: Update Periodically
```typescript
// Recompute priorities monthly based on new Stock-Book data
function updatePriorities(stockbook: StockBook) {
  const graph = buildGraph(stockbook);
  
  for (const operation of stockbook.operations) {
    operation.priority = computePriority(operation, graph);
  }
}
```

---

## The Philosophical Point

**Marx didn't say "categorize labor into 6 buckets."**

**Marx said: "Society must distribute its time in accordance with needs."**

The Stock-Book tells us what needs exist (consumption patterns).
The dependency graph tells us how operations relate.
The priority algorithm emerges from this structure.

**No tags needed. Reality speaks for itself.**
