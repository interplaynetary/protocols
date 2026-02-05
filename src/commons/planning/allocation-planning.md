# Allocation Records & Planning System

Planning layer that sits on top of the stock-book recording system, handling resource allocation, uncertainty, and optimization.

## 1. Allocation Record Structure

### Allocation Table (Planned vs Actual)
```
| Allocation_ID | Period   | Product_ID | Operation_ID | Planned_Qty | Actual_Qty | Status    | Uncertainty_Bounds |
|---------------|----------|------------|--------------|-------------|------------|-----------|--------------------|
| ALLOC001      | 2024-W10 | P001       | OP100        | 100kg       | 98kg       | Completed | ±5kg (95% CI)      |
| ALLOC002      | 2024-W10 | LP_base    | OP100        | 40h         | 42h        | Overused  | ±2h                |
```

### Uncertainty Columns
```
| Min_Qty | Max_Qty | Expected_Qty | Std_Dev | Risk_Level | Contingency_Plan_ID |
|---------|---------|--------------|---------|------------|---------------------|
| 95kg    | 105kg   | 100kg        | 2.5kg   | Low        | CONT001             |
| 38h     | 44h     | 40h          | 1h      | Medium     | CONT002             |
```

## 2. Contingency Planning & Reserves

### Reserve Allocation Table
```
| Reserve_ID | Product_ID | Reserve_Type           | Allocation_Rule                  | Current_Stock |
|------------|------------|------------------------|----------------------------------|---------------|
| RES001     | P001       | Production_Contingency | 10% of planned monthly usage     | 50kg          |
| RES002     | P002       | Natural_Disaster       | 5% of annual consumption         | 100 units     |
| RES003     | LP_base    | Epidemic_Reserve       | 2% of workforce capacity         | 200h/week     |
```

### Allocation Rules with Buffers
```
Planned_allocation = Expected_need × (1 + buffer_factor)

Where buffer_factor depends on:
- Historical variance
- Criticality of product
- Lead time for replacement
- Seasonality effects
```

## 3. Total Social Product & Deductions: Planning Integration

### The Planning Hierarchy

#### Level 1: Annual Social Product Planning
```
Total_Product_Plan = {
  D1: Replacement_needs (must-haves)
  D2: Expansion_targets (growth goals)
  D3: Reserve_requirements (risk-based)
  Remainder_after_production: Total - (D1 + D2 + D3)
  
  D4: Administration_budget (efficiency goal: minimize)
  D5: Common_needs_budget (development goal: prioritize)
  D6: Unable-to-work_support (social commitment)
  
  Distribution_Pool: Remainder - (D4 + D5 + D6)
}
```

#### Level 2: Monthly Allocation Planning
```
For each product P in month M:
  Available_for_allocation = 
    Stock_start + Production_plan - 
    (D1 + D2 + D3_reserves + D4_admin + D5_common + D6_support)
  
  Allocate_to_operations: Priority-based scheduling
  Track: Planned vs Actual with buffers
```

#### Level 3: Weekly Operation Scheduling
```
For each operation O in week W:
  Resource_check: Are allocated products available?
  Labor_check: Are workers with needed skills available?
  Contingency_check: What if X% variance occurs?
  
  Execute operations
  Record actual Effects (VCs) in stock-book
  Update allocation records
```

## 4. How Deductions Work WITH Optimization

### The Optimization Problem with Deductions

```
Maximize: T_free (total free time)
Subject to:

1. Production constraints:
   For each product i: Produced_i + Stock_i ≥ 
     Consumption_i + 
     Replacement_i(D1) + 
     Expansion_i(D2) + 
     Reserves_i(D3) + 
     Admin_i(D4) + 
     Common_i(D5) + 
     Support_i(D6)

2. Labor constraints:
   For each labor type τ: Available_τ ≥ 
     Production_labor_τ + 
     Reproduction_labor_τ + 
     Training_labor_τ + 
     Admin_labor_τ(D4)

3. Deduction-specific constraints:
   D1: Replacement_i ≥ Depreciation_i (non-negotiable)
   D2: Expansion_i ≥ Growth_target_i (policy decision)
   D3: Reserves_i ≥ f(risk_i, historical_variance_i) (risk management)
   D4: Admin_cost ≤ Max_admin_budget (efficiency constraint)
   D5: Common_needs ≥ Min_common_budget (social development goal)
   D6: Support ≥ Guaranteed_minimum (social commitment)
```

### Key Insight: Deductions are either CONSTRAINTS or OBJECTIVES

```
D1 (replacement): CONSTRAINT - must be satisfied
D2 (expansion): OBJECTIVE - invest for growth
D3 (reserves): CONSTRAINT - risk management
D4 (admin): OBJECTIVE - minimize (free resources)
D5 (common needs): OBJECTIVE - maximize (social development)
D6 (support): CONSTRAINT - social minimum
```

## 5. Risk-Adjusted Allocation Algorithm

```python
def allocate_with_risk(product_id, expected_need, risk_profile):
  # Calculate buffer based on risk
  if risk_profile.historical_variance_high:
    buffer = 2 * std_dev
  elif product_critical:
    buffer = 1.5 * std_dev
  else:
    buffer = 0.5 * std_dev
  
  # Check reserves
  needed_from_reserves = max(0, expected_need - available_stock)
  
  # Allocate
  return {
    planned_allocation: expected_need + buffer,
    allocated_from_stock: min(available_stock, expected_need),
    allocated_from_reserves: needed_from_reserves,
    contingency_plan: "reduce_usage" if needed_from_reserves > reserve_stock else None
  }
```

## 6. Dynamic Adjustment Mechanism

### Monitoring Table
```
| Product_ID | Period | Planned_Usage | Actual_Usage | Variance | Adjustment_Made | Reason           |
|------------|--------|---------------|--------------|----------|-----------------|------------------|
| P001       | W10    | 100kg         | 110kg        | +10%     | Increase_buffer | Higher demand    |
| P002       | W10    | 50 units      | 45 units     | -10%     | Decrease_buffer | More efficient   |
```

### Adjustment Rules
```
If variance > threshold for N periods:
  Update: Expected_need = Rolling_average(actual_usage)
  Update: Buffer_size = f(new_variance)
  Update: Reserve_level = g(new_variance, criticality)
```

## 7. Allocation vs Stock-Book Integration

### Data Flow
```
1. Planning Phase (monthly):
   Allocation_Table ← Optimization_Model(expected_needs, constraints)

2. Execution Phase (daily):
   Operations ← Check_Allocation(operation, Allocation_Table)
   Stock_Book ← Record_Actual(operation)

3. Reconciliation Phase (weekly):
   Update: Allocation_Table(Actual_Qty)
   Update: Optimization_Model(learning from variances)
   Adjust: Future_allocations(based on trends)
```

### The Relationship
```
Stock-Book: Ground truth (what actually happened)
Allocation: Planning layer (what we expect to happen)

Stock-book provides: Empirical foundation
Allocation provides: Planning intelligence
Together: Enable rational economic planning under uncertainty
```

## 8. Example: Wheat Allocation with Uncertainty

### Initial Plan
```
Product: Wheat (P101)
Annual need: 10,000kg ± 500kg (95% CI)
Reserves: 1,000kg (10% buffer)

Monthly allocation:
- Production: 900kg (seasonal adjustment)
- Consumption: 800kg ± 40kg
- Reserves: 100kg accumulation
```

### During Execution (Month 3)
```
Actual_consumption: 850kg (6% over plan)
Reason: Population growth higher than expected

Adjustments made:
1. Increase monthly production target: 950kg
2. Increase reserve accumulation: 120kg/month
3. Update annual forecast: 10,600kg ± 600kg
```

## 9. The Optimization-Deduction Loop

### Yearly Cycle
```
Phase 1: Set deduction targets
  D1: Based on depreciation forecasts
  D2: Based on growth objectives (5% expansion)
  D3: Based on risk assessment (probability distributions)
  D4: Based on efficiency targets (reduce by 2%)
  D5: Based on development goals (increase by 10%)
  D6: Based on demographic projections

Phase 2: Optimize allocation
  Given deductions as constraints/objectives
  Allocate resources to maximize free time
  Build risk buffers

Phase 3: Execute & monitor
  Record actuals in stock-book
  Track variances

Phase 4: Recalibrate
  Update forecasts based on actuals
  Adjust deduction targets for next cycle
```

## 10. Labor Power Allocation (Dual System Model)

### Orthogonal Planning Systems
We plan for labor power using two complementary, non-conflicting systems:

1.  **System 1: Daily Capacity Planning (Energy)**
    *   **Constraint**: $Available\_Hours_{daily} = 24 - Constraints(Rest, Consumption)$
    *   **Goal**: Ensure workers are not exhausted *today*.
    *   **Action**: Schedule shifts, ensure food/rest provisioning.

2.  **System 2: Long-Term Capability Planning (Skills)**
    *   **Constraint**: $Skill\_Inventory > 0$
    *   **Goal**: Ensure we have enough engineers *next decade*.
    *   **Action**: Calculate depreciation rates, schedule retraining when inventory dips.

### Planning Calculations
When planning for an operation requiring "Engineering":

1.  **Daily Check (System 1)**:
    *   Does `I001` have `8h` energy available today?
    *   *If no*: Schedule a different worker or delay.

2.  **Inventory Check (System 2)**:
    *   Does `I001` have `LP_engineer` inventory > 0?
    *   *If no*: Worker is not qualified.

3.  **Social Cost Calculation**:
    $$Social\_Cost = (Hours_{direct} \times Intensity_{stat}) + Hours_{direct} \times \frac{ALT_{skill}}{Lifespan_{skill}}$$
    *   $Intensity_{stat}$: Historical intensity factor for this work type (from stockbook statistics).

### Example: Allocation with Dual Constraints
```
Worker I001: 
  - System 1 (Energy): 8h available today
  - System 2 (Skill): LP_engineer (Remaining Life: 15,000h)

Job: Build Bridge (4h)
Allocation:
  - 4h deducted from Daily Energy (Refills tomorrow)
  - 4h depreciated from Skill Inventory (Refills via retraining in 10 years)
  
Impact on Planning:
  - Short-term: Managing fatigue.
  - Long-term: Managing skill obsolescence.
```

## 11. Mathematical Formulation of the Full Problem

### Variables
```
x_{i,t} = Quantity of product i produced in period t
a_{i,j,t} = Quantity of product i allocated to operation j in period t
s_{i,t} = Stock of product i at end of period t
r_{i,t} = Reserves of product i in period t
l_{τ,t} = Labor of type τ used in period t
```

### Constraints
```
1. Stock balance:
   s_{i,t-1} + x_{i,t} = Σ_j a_{i,j,t} + s_{i,t} + r_{i,t}

2. Deduction constraints:
   Σ_j a_{i,j,t} ≥ D1_i + D2_i + D3_i + D4_i + D5_i + D6_i

3. Labor balance:
   l_{τ,t} ≤ Available_τ,t × (1 - buffer_τ)

4. Risk constraints:
   r_{i,t} ≥ Risk_factor_i × Σ_j a_{i,j,t}
   
5. Non-negativity, capacity limits, etc.
### Objective

**Primary Goal: Maximize Free Time**
```
Maximize: Σ_t T_free,t

Where:
  T_free,t = T_total,t - T_necessary,t
  
  T_necessary,t = T_direct,t + T_inefficiency,t
  
  T_direct,t = Σ_τ l_{τ,t}  (actual labor time)
  
  T_inefficiency,t = α × Variance_t + β × Shortage_cost_t
  
  Variance_t = Σ_i (Actual_i,t - Planned_i,t)²  (planning inefficiency)
  
  Shortage_cost_t = Σ_i Max(0, Needed_i,t - Available_i,t) × Penalty_i  (shortage inefficiency)
```

**Interpretation**: 
- Direct necessary time: labor actually performed
- Inefficiency time: waste from poor planning (variance) and shortages
- Free time: what remains after all necessary time (including inefficiencies)
- Goal: Minimize total necessary time = minimize direct labor + minimize inefficiencies

## 12. Practical Implementation

### Weekly Planning Meeting
```
Agenda:
1. Review last week's variances
2. Adjust allocation buffers based on trends
3. Check reserve levels vs risk thresholds
4. Update deduction targets if needed
5. Approve next week's allocation plan

Tools:
- Stock-book actuals
- Variance analysis reports
- Risk assessment dashboard
- Optimization model results
```

### Database Tables
```sql
-- Allocation plans
CREATE TABLE allocation_plans (
  plan_id TEXT,
  period DATE,
  product_id TEXT,
  operation_id TEXT,
  planned_qty REAL,
  min_qty REAL,
  max_qty REAL,
  risk_level TEXT,
  PRIMARY KEY (plan_id, period, product_id, operation_id)
);

-- Reserve management
CREATE TABLE reserves (
  reserve_id TEXT,
  product_id TEXT,
  reserve_type TEXT,
  target_level REAL,
  current_level REAL,
  reorder_point REAL,
  PRIMARY KEY (reserve_id, product_id)
);

-- Variance tracking
CREATE TABLE allocation_variances (
  period DATE,
  product_id TEXT,
  operation_id TEXT,
  planned REAL,
  actual REAL,
  variance REAL,
  variance_pct REAL,
  adjustment_made TEXT
);
```

## 13. Key Insights

**Allocation ≠ Distribution**: Allocation is about planning resource use; distribution is about who gets consumption goods.

**Deductions are Planning Parameters**: They're not afterthoughts—they're built into the optimization as constraints or objectives.

**Uncertainty is Manageable**: Through buffers, reserves, and dynamic adjustment.

**The Stock-Book is Ground Truth**: Allocation plans are hypotheses; stock-book records are experimental results.

**Continuous Improvement**: The system learns from variances and gets better at forecasting and planning.

## 14. The Virtuous Cycle

```
Plan → Allocate → Execute → Record → Analyze → Adjust → Replan
     ↑                                                      ↓
     └──────────────────────────────────────────────────────┘
```

The stock-book provides the empirical foundation; the allocation system provides the planning intelligence; together they enable truly rational economic planning that can handle real-world uncertainty.
