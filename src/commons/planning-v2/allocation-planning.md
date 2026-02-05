# Allocation \u0026 Planning System (Simplified Model)

Planning layer that sits on top of the stock-book recording system. **All operations are treated uniformly** - priority-based scheduling replaces categorical deductions.

## Core Insight

**Everything is just an operation:**
- Making bread → operation
- Eating bread → operation  
- Building factory → operation
- Running school → operation
- Admin meeting → operation

Operations are NOT pre-categorized. They're scheduled based on **priority** (need satisfaction) and **affordability** (resources + insurance).

---

## 1. Operation Registry

### Operation Table
```
| Op_ID | Priority | Type_Tag       | Inputs_Needed               | Expected_Effects        | Frequency |
|-------|----------|----------------|-----------------------------|-----------------------|-----------|
| OP001 | 10       | food_prod      | Flour:100kg, Oven:4h, Labor:8h | Bread:80 loaves      | Daily     |
| OP002 | 9        | consumption    | Bread:2, Time:0.5h          | LP_restored:+3h      | Daily     |
| OP003 | 8        | education      | Classroom:4h, Teacher:4h    | LP_skill:+20h        | Weekly    |
| OP004 | 6        | expansion      | Steel:50kg, Labor:100h      | New_machine:+1       | Quarterly |
| OP005 | 3        | admin          | Office:2h, Paper:1kg        | Reports:+1           | Weekly    |
```

**Priority Scale:** 10 = survival, 8 = social development, 5 = growth, 3 = overhead

**Type Tags:** For analysis/reporting only, NOT for allocation logic

---

## 2. The Two Real Constraints

### D1: Replacement (Constraint)
**Must replace what was used up in past operations**

```
D1_product = Σ(depreciation from all past operations)
```

Example:
- Last month used 500kg flour → D1_flour = 500kg
- Last month used machines for 100h → D1_machines = 0.01 machines (if 10,000h lifespan)

**Source:** Stock-Book depreciation records

### D3: Reserves (Constraint)  
**Must insure against disasters/variance**

```
D3_product = Risk_Factor × D1_product
```

Reserves wrap around D1 only (not future operations, since they haven't happened yet).

**Source:** Risk calculation from D1

---

## 3. Simplified Planning Problem

### Variables
```
x_op = Binary (schedule operation or not)
q_op = Quantity/frequency of operation
```

### Objective
```
Maximize: Σ(Priority_op × Satisfaction_op × x_op) - T_necessary

Where:
  Satisfaction_op = how much need is fulfilled
  T_necessary = Σ(Labor_time_op × q_op)
```

### Constraints
```
1. Material Balance:
   Stock_i + Production_i ≥ D1_i + D3_i + Σ(Inputs_needed_i,op × q_op)

2. Labor Balance:
   Available_labor_τ ≥ Σ(Labor_needed_τ,op × q_op)

3. Replacement (D1):
   Resources allocated to D1 operations

4. Insurance (D3):
   D3_i = Risk_Factor × D1_i
```

---

## 4. Allocation Algorithm

### Phase 1: Satisfy Constraints (D1 + D3)
```
For each product i:
  D1_i = depreciation from Stock-Book
  D3_i = Risk_Factor × D1_i
  
  min_production_i = max(0, (D1_i + D3_i) - current_stock_i)
  
  Reserve: (D1_i + D3_i) from available resources
```

### Phase 2: Schedule Operations by Priority
```
Sort operations by priority (high to low)

For each operation op:
  inputs_needed = Inputs(op) × q_op
  inputs_with_insurance = inputs_needed × (1 + Risk_Factor)
  
  If can_afford(inputs_with_insurance):
    Schedule(op)
    Reserve inputs_with_insurance
    Increase production if needed
  Else:
    Try smaller q_op (scale down)
    If still can't afford: Skip operation
```

### Phase 3: Adjust Production
```
For each product i:
  total_needed_i = D1_i + D3_i + Σ(scheduled_inputs_i)
  production_i = max(0, total_needed_i - current_stock_i)
```

---

## 5. Cascading Insurance

**Key insight:** When we schedule an operation, we immediately insure its inputs.

```python
def schedule_operation_with_insurance(op, q):
  inputs_needed = get_inputs(op) * q
  insurance_needed = inputs_needed * risk_factor
  total_needed = inputs_needed + insurance_needed
  
  if available_resources >= total_needed:
    allocate(inputs_needed)
    reserve(insurance_needed)
    
    # May need to produce more
    if stock + production < total_needed:
      production += (total_needed - stock - production)
    
    return True
  else:
    return False  # Can't afford it safely
```

This ensures **every operation is insured**, not just D1.

---

## 6. Example: Planning Cycle

### Input from Stock-Book (Last Month)
```
Depreciation recorded:
- Flour: 500kg (from bread operations)
- Machines: 0.01 (from production operations)
- Classroom: 80h (from education operations)
```

### Constraints
```
D1_flour = 500kg
D1_machines = 0.01
D1_classroom = 80h

D3_flour = 500 × 0.2 = 100kg
D3_machines = 0.01 × 0.2 = 0.002
D3_classroom = 80 × 0.2 = 16h

Total reserved:
- Flour: 600kg
- Machines: 0.012
- Classroom: 96h
```

### Operations Sorted by Priority
```
Priority 10: OP001 (make bread) - needs 100kg flour
Priority 9:  OP002 (eat bread) - needs 2 loaves
Priority 8:  OP003 (education) - needs classroom 4h
Priority 6:  OP004 (build machine) - needs steel 50kg
Priority 3:  OP005 (admin meeting) - needs office 2h
```

### Allocation Process
```
Current stock: Flour=200kg, Steel=60kg

Phase 1: Reserve D1 + D3
  Reserve 600kg flour (need to produce 400kg)
  
Phase 2: Schedule operations
  
  OP001 (bread, priority=10):
    Needs: 100kg flour + 20kg insurance = 120kg
    Available after D1+D3: 200 - 600 = -400kg
    → INCREASE PRODUCTION: +400kg to cover D1+D3
    → Now available: 200 + 400 - 600 = 0kg
    → Can't afford OP001 yet!
    → INCREASE PRODUCTION: +120kg more
    → Now can schedule OP001 ✓
  
  OP002 (eat, priority=9):
    Needs: 2 loaves (produced by OP001)
    → Schedule OP002 ✓
  
  OP003 (education, priority=8):
    Needs: 4h classroom + 0.8h insurance
    Available: 100h - 96h = 4h
    → Can't quite afford with insurance
    → Skip or reduce frequency
  
  OP004 (expansion, priority=6):
    Needs: 50kg steel + 10kg insurance
    Available: 60kg
    → Schedule OP004 ✓
  
  OP005 (admin, priority=3):
    Low priority, allocate if resources remain
    → Schedule OP005 only if affordable
```

---

## 7. What Happened to D2, D4, D5, D6?

**They became operation tags, not allocation categories:**

- **D2 (Expansion):** Operations tagged "expansion" (building new capacity)
  - Example: OP004 (build machine)
  - Scheduled like any other operation based on priority

- **D4 (Admin):** Operations tagged "admin" (coordination overhead)
  - Example: OP005 (meetings)
  - Gets LOW priority, scheduled last

- **D5 (Common needs):** Operations tagged "public_service"
  - Example: OP003 (education), OP_hospital
  - Gets HIGH priority, scheduled early

- **D6 (Support):** Operations tagged "social_support"
  - Example: OP_feed_elderly
  - Gets HIGH priority

**Reporting can still categorize:**
```sql
SELECT SUM(allocated_resources) 
FROM operations 
WHERE tag = 'expansion'  -- This is your "D2" total
```

But allocation logic is unified!

---

## 8. Uncertainty & Buffers

### Same as Before
```
Planned_qty = Expected_need × (1 + buffer_factor)

Buffer depends on:
- Historical variance
- Criticality (priority)
- Lead time
```

### Variance Tracking
```
| Op_ID | Period | Planned_Inputs | Actual_Inputs | Variance | Adjustment |
|-------|--------|----------------|---------------|----------|------------|
| OP001 | W10    | 100kg flour    | 105kg flour   | +5%      | Increase   |
| OP003 | W10    | 4h classroom   | 3.5h classroom| -12%     | Decrease   |
```

---

## 9. The Complete Loop

```
Stock-Book records operations →
  Calculate D1 (depreciation) →
    Calculate D3 (insurance for D1) →
      Reserve D1 + D3 →
        Schedule operations by priority →
          Allocate inputs + insurance for each →
            Increase production if needed →
              Execute operations →
                Stock-Book records results →
                  Next period's D1 ← (feedback loop)
```

---

## 10. Benefits of Simplified Model

### Conceptual Clarity
- One allocation algorithm (not 6 separate buckets)
- Operations are operations (no artificial categories)
- Priorities emerge from social values, not bureaucratic rules

### Flexibility
- Easy to re-prioritize (just change priority numbers)
- New operation types don't require new deduction categories
- Analysis can use any categorization after the fact

### Minimal Overhead
- Stock-Book records operations (same as before)
- Planner schedules operations (simpler algorithm)
- No need to pre-categorize during execution

### True to Marx
"Society must distribute its time correctly" → This model does exactly that: allocate time/resources to operations based on their contribution to needs satisfaction.

The "deductions" are consequences of scheduling decisions, not separate planning steps.

---

## 11. Implementation Notes

### Priority Assignment
```python
def calculate_priority(operation):
  if operation.tag == 'survival':
    return 10
  elif operation.tag == 'social_development':
    return 8  
  elif operation.tag == 'growth':
    return 5
  elif operation.tag == 'admin':
    return 2
  else:
    return operation.manual_priority or 5
```

### Insurance Integration
```python
def allocate_with_insurance(operation, quantity):
  inputs = operation.inputs * quantity
  insurance = inputs * RISK_FACTOR
  total = inputs + insurance
  
  if can_afford(total):
    reserve(inputs)
    reserve_as_D3(insurance)
    return True
  return False
```

### Dynamic Production Adjustment
```python
def ensure_production_covers_needs():
  for product in products:
    needed = D1[product] + D3[product] + scheduled_needs[product]
    available = stock[product] + production[product]
    
    if needed > available:
      production[product] += (needed - available)
```

---

## Key Insight

**There are only 2 types of resource allocation:**
1. **Replacement + Insurance** (D1 + D3) - CONSTRAINT
2. **Operations** (everything else) - PRIORITY-BASED

Everything else (D2, D4, D5, D6) are just tags on operations for reporting purposes.

The Stock-Book is simple. The allocation should be simple too.
