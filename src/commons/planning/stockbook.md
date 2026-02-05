# Stock-Book: Transparent Labor-Time Accounting

Real-time system tracking labor-time embodied in all products (including labor power) and its transfer through operations.

## 1. Core Tables

### Products Registry
```
| Product_ID | Unit | ALT   | Lifespan | Stock | Remaining_Life |
|------------|------|-------|----------|-------|----------------|
| P001       | kg   | 0.5h  | -        | 1000  | -              |
| P002       | unit | 1000h | 10,000h  | 5     | 48,500h        |
| LP_base      | hour | 1.39h | 63,000h  | ∞     | Individual     |
| LP_engineer  | hour | 43h   | 23,625h  | ∞     | Individual     |
| LP_carpenter | hour | 25h   | 31,500h  | ∞     | Individual     |
```

### Individuals
```
| ID   | Base_Capacity | Skills_Inventory (Hours Remaining)             |
|------|---------------|------------------------------------------------|
| I001 | 8h/day        | {LP_carpenter: 15,000h, LP_engineer: 10,000h}  |
| I002 | 8h/day        | {LP_teacher: 5,000h}                           |
```

### Operations Log
```
| Op_ID | Date | Total Social Time | Inputs_Products           | Inputs_Labor      | Effects (Output VCs)  |
|-------|------|----------|---------------------------|-------------------|-----------------------|
| OP056 | 3/15 | 8h       | Wood:10kg, Saw:1(8h)      | I001(6h), I002(2h) | Chairs:+2, Sawdust:+3kg |
| OP057 | 3/15 | 4h       | Class:1(4h), Mat:5kg      | I003(4h), I001(4h) | LP_engineer: +20h     |
| OP058 | 3/16 | 4h       | Design_Soft:4h            | I001(4h base)      | Bridge_Plan:1         |
|       |      |          | LP_engineer: 4h (depr)    |                    |                       |
```

**Note**: Categories emerge from data patterns, not pre-defined types. Operations producing material outputs are "production", those restoring LP are "consumption", those increasing skills are "training", etc.

## 2. Using-Up Formulas

### Complete Consumption
```
LT_transferred = q × ALT(P)
```

### Partial Consumption (Depreciation)
```
LT_transferred = (t / Lifespan(P)) × ALT(P)
```

### Unified Using-Up Formula (Universal)
$$LT_{transferred} = \frac{\text{Usage}}{\text{Lifespan}(P)} \times ALT(P)$$

For Labor Power, this applies to **Skills**:
*   Usage = $t$ hours
*   Lifespan = Skill Depreciation Period
*   $LT_{skill} = (t / 23625) \times 43$

For Base Capacity (Energy), we treat it as simple consumption:
*   $LT_{base} = t \times \text{Daily\_Reproduction\_Rate}$

### Labor Intensity: The Statistical Solution

**Fundamental Principle**: We cannot (and do not need to) measure intensity in real-time. We measure its **consequences** over time using statistics derived directly from the Stock-Book.

#### Data Source: The Stock-Book
The statistical method relies purely on data we **already record**:
1.  **Work Operations**: Record `clock_hours` and `work_type` (e.g., "Mining: 4h").
2.  **Consumption Operations**: Record `reproduction_costs` (e.g., "Food: 0.5h ALT").

Everything else is retrospective analysis of this existing data.

#### The Statistical Approach
1.  **Aggregate**: Sum total work performed and total reproduction consumed from the Stock-Book logs.
2.  **Correlate**: Use statistical regression to link recorded work types to recorded reproduction needs.
3.  **Deduce**: Calculate community-wide "historical intensity factors".

#### Method: Statistical Regression
For mixed work patterns, we use simple linear regression across the population:
$$Reproduction_{total} = \beta_0 + \beta_1(Hours_{garden}) + \beta_2(Hours_{mining}) + \dots + \epsilon$$

*   $\beta_1$: Intensity factor for Gardening (e.g., 0.9)
*   $\beta_2$: Intensity factor for Mining (e.g., 1.5)
*   $\epsilon$: Individual variation (averages out at scale)

#### Example
*   **Week 1 (Gardening)**: 40h work $\rightarrow$ 55h reproduction. Ratio: 1.375.
*   **Week 2 (Construction)**: 40h work $\rightarrow$ 80h reproduction. Ratio: 2.0.
*   **Result**: Construction is $2.0 / 1.375 \approx 1.45 \times$ more intense.

**Key Benefit**: No invasive monitoring. "Socially necessary intensity" emerges from the aggregate data of what workers actually need to reproduce their capacity.

## 3. The Dual System of Labor Power

Labor power is managed through two **orthogonal** systems that operate on different time scales. There is no conflict between them; they answer different questions.

### System 1: Daily Reproduction (Energy/Health)
*   **Question**: "Can worker turn up tomorrow?"
*   **Time Scale**: Daily (24h cycles).
*   **Mechanism**: Tracks physiological restoration via consumption.
*   **Product**: `LP_base` (Energy/Capacity).

### System 2: Skill Depreciation (Training)
*   **Question**: "Do we have enough engineers for the next 5 years?"
*   **Time Scale**: Years/Decades.
*   **Mechanism**: Tracks inventory of specific skills.
*   **Product**: `LP_skill` (Capability).

**Key Insight**: Daily energy usage does *not* affect skill depreciation. They are mathematically independent.

## 4. Multi-Product Allocation

### Total Input
```
Total_Input_LT = Σ(Product_Inputs_LT) + Σ(Labor_Inputs_LT)
```

### Allocation Methods
```
Physical ratio:     a_A = qty_A / Σ(qty_i)
Separable costs:    a_A = Cost_A_alone / Total_Input_LT
Social utility:     a_A = Utility_A / Σ(Utility_i)
```

### Output ALT
```
LT_allocated_to_A = a_A × Total_Input_LT
ALT_A = LT_allocated_to_A / qty_A
```

## 5. Labor Power Production

### Training
### Training (Production of Skill)
Treat training exactly as producing a machine.
```
New_ALT(LP_skill) = Total_Input_LT / Number_of_Students_Graduated
```

### Daily Reproduction (Production of Energy)
```
Reproduction_cost = Σ(ALT(consumption_i)) + Rest_time_ALT
New_ALT(LP_base) = Reproduction_cost / 1_day
```

### Daily Reproduction
```
Reproduction_cost = Σ(ALT(consumption_i)) + Rest_time_ALT
```

## 6. Consumption Operations: Production of Restored Labor-Power

### Core Principle
Every consumption act is a production operation producing restored/enhanced labor-power.

### Basic Maintenance (Type T02)
```
Operation: CONSUME_001
Date: 2024-03-15 08:00
Total Social Time: 0.5h
Inputs_Products:
  - Breakfast: 1 serving (ALT=0.3h)
  - Coffee: 1 cup (ALT=0.1h)
Inputs_Labor:
  - I001: 0.5h (eating time)
  - Cook (if communal): 0.2h
Effects:
  - I001_LP_restored: +3h capacity
  - I001_health: +0.01 points
  - Waste: food_waste
```

### Leisure/Development (Type T05)
```
Operation: LEISURE_001
Date: 2024-03-15 19:00
Total Social Time: 2h
Inputs_Products:
  - Book: (2h/200h lifespan) × ALT=10h = 0.1h
  - Reading_lamp: (2h/10000h) × ALT=50h = 0.01h
Inputs_Labor:
  - I001: 2h (leisure time)
Outputs:
  - I001_skill_knowledge: +0.1 points
  - I001_happiness: +0.5 units
  - I001_LP_restored: +1h (mental recovery)
```

### Healthcare (Type T04)
```
Operation: HEALTH_001
Date: 2024-03-15 10:00
Total Social Time: 1h
Inputs_Products:
  - Medicine: 2 pills (ALT=0.5h each)
  - Doctor's_time: 0.5h (as labor input)
  - Clinic_space: (1h/100000h) × ALT=5000h = 0.05h
Outputs:
  - I001_health_restored: +5 points
  - I001_LP_capacity_increase: extends productive lifespan
```

### Communal Consumption
```
Operation: COMMUNAL_DINNER
Date: 2024-03-15 18:00
Total Social Time: 1.5h
Inputs_Products:
  - Food: 50 servings × 0.3h = 15h
  - Dining_hall: (1.5h/50000h) × ALT=20000h = 0.6h
Inputs_Labor:
  - Cooks: 5h total
  - Cleaners: 2h total
  - Participants: 50 × 1.5h = 75h (social time)
Outputs:
  - LP_restored_total: 50 × 3h = 150h capacity
  - Social_cohesion: +10 units
  - Waste: food_waste, cleaning required

Note: Social eating may have higher restoration value than solitary eating
```

### Public Spaces
```
Operation: PARK_VISIT
Date: 2024-03-15 15:00
Total Social Time: 2h
Inputs_Products:
  - Park_maintenance: (2h/24h daily) × ALT=5h = 0.42h
  - Bench_depreciation: (50×2h/10000h) × ALT=10h = 0.1h
Inputs_Labor:
  - Gardener (earlier): 2h
  - Visitors: 50 × 2h = 100h leisure time
Outputs:
  - Health_benefits: 50 × 0.5 points = 25 points
  - LP_restored: 50 × 1.5h = 75h
  - Community_bonding: +20 units
```

### Complete Daily Cycle Example
```
Worker I001's Day (just recording operations):

TIME    OPERATION              INPUTS (LT)               EFFECTS (VCs)
7:00    Wake/maintain          Sleep:8h, Bed:0.01h       -
7:30    Breakfast              Food:0.3h, Time:0.5h      -
8:00    Commute                Bike:0.02h, Time:0.5h     -
8:30    Work (carpentry)       Materials:5h, Time:4h     Chairs (10h value)
12:30   Lunch                  Food:0.4h, Time:1h        -
13:30   Work (teaching)        Classroom:0.1h, Time:3h   Students trained
16:30   Gym exercise           Equipment:0.05h, Time:1h  -
17:30   Dinner (communal)      Food:0.5h, Time:1.5h      -
19:00   Reading/study          Book:0.1h, Time:2h        -
21:00   Socializing            Time:1h                   -
22:00   Sleep                  Bed:0.01h, Time:9h        -

Stock-book records: 11 operations with inputs/outputs
No intensity, no categorization during recording

Later analysis shows:
- Clock work: 7h (4h carpentry + 3h teaching)
- Reproduction consumed: ~1.5h LT in goods + 15.5h time
- Social value produced: Chairs + student training
- ALT(I001_LP) computed monthly from total reproduction / total work
```

### The Complete Cycle
```
Production Operations:
  Inputs: Materials + Labor
  Effects: Products (Stock Increases)

Consumption Operations:
  Inputs: Products + Time
  Effects: Restored/Enhanced Labor-Power

Complete Cycle:
  Materials + Labor → Products
  Products + Time → Restored Labor-Power
  Restored Labor-Power → Labor for new production
```

### Emergent Categorization

Categories are not pre-defined but emerge from analyzing actual operation patterns:

```
Query for "production" operations:
  → Operations with material product effects

Query for "consumption" operations:
  → Operations with LP_restored effects

Query for "training" operations:
  → Operations with skill_increase effects

Query for "healthcare" operations:
  → Operations with health_improvement effects

Query for "communal" operations:
  → Operations with participant_count > 10
  → Operations with social_cohesion effects

Query for "individual" operations:
  → Operations with participant_count = 1
```

**Philosophical principle**: Don't ask "What type of operation is this?" Instead ask "What went in? What came out? Who was involved?" Categories emerge from the data.

**Benefits**:
- No artificial boundaries (communal garden = both production + leisure)
- Flexible analysis (different categorizations for different purposes)
- True to material flows (record what happens, not what we think should happen)
- Avoids premature categorization overhead

### Planning with Empirical Data

Planning uses historical statistics, not real-time intensity tracking:

```
From historical data (last quarter):
- Mining: 1000h clock time produced 800 "standard output units"
- Mining: Required 1250h total reproduction time
- Teaching: 1000h clock time produced 1000 "standard output units"  
- Teaching: Required 1100h total reproduction time

Planning next quarter:
- Need 800 standard units mining output → schedule ~1000h mining
- Need 1000 standard units teaching → schedule ~1000h teaching
- Provision 1250h reproduction for miners, 1100h for teachers
```

**Example method comparison**:
```
Method A (manual mining):
  Historical: 100h work → 80 units output, 125h reproduction needed

Method B (mechanized mining):
  Historical: 60h work → 80 units output, 70h reproduction needed
  
Planning decision: Method B more efficient (less work + less reproduction)
```

## 7. Update Algorithm

```
For each operation:

1. INPUTS:
   Products:  reduce stock, add q×ALT or (t/L)×ALT to input pool
   Labor:     reduce capacity, add t×[1 + ALT(LP_skill)/Lifespan(LP_skill)] to input pool

2. EFFECTS (State Changes):
   Products:  increase stock, set lifespan = qty × Total_Lifespan
   LP:        increase capacity/skill

3. UPDATE ALTs:
   New_ALT(P) = [Q_old × ALT_old + LT_allocated] / (Q_old + q_new)
```

## 8. Conservation Laws

### Daily Balances
```
Time:       Σ(Work) + Rest + Leisure + Consumption_time = 24h
LP:         Start + Reproduction - Consumption = End
Products:   Start + Production - Consumption = End
LT:         Σ(Input_LT) = Σ(Output_LT) + Waste_LT
```

### Complete Labor-Time Tracking
```
Every hour of social labor traceable:
Wheat farming → Milling → Baking → Eating → LP restoration → Production work

The circle is complete:
  Production for consumption
  Consumption for production
```

### Planning Insights
```
Questions answerable:
- How does reduced work intensity affect reproduction costs?
- Does improved nutrition reduce needed sleep time?
- What's optimal work/leisure balance for maximum sustainable output?
- Is communal or individual consumption more efficient?
```

## 9. Total Social Product Decomposition

### Structure
```
Total_Social_Product = Σ(all products of labor)
```

### Production-Related Deductions
```
Step 1 (D1): Replacement of means of production used up
Step 2 (D2): Additional portion for expansion of production
Step 3 (D3): Reserve/insurance funds (accidents, calamities)

Magnitude = f(available means, computation of probabilities)
NOT calculable by equity (economic necessity)
```

### Social/Administrative Deductions
```
Step 4 (D4): General administration costs (not production)
    → Diminishes ∝ society development
    → Δ(admin) ∝ -Δ(development)

Step 5 (D5): Common needs (schools, health, etc.)
    → Grows ∝ society development
    → Δ(common) ∝ Δ(development)

Step 6 (D6): Funds for unable to work (poor relief)
```

### Distribution Pool
```
Remainder = Total - (D1 + D2 + D3)
Distribution_Pool = Remainder - (D4 + D5 + D6)
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

## 10. Labor Certificates & Individual Distribution

### Certificate Mechanism
```
Individual gives to society: individual quantum of labor (after common fund deductions)
Individual receives certificate: furnished X hours of labor
With certificate: draws from social stock of consumption
Consumption drawn = amount equal to labor cost

Same labor given in one form = received back in another form
```

### Individual Share Formula
```
Social_working_day = Σ(individual hours of work)
Individual's_share = individual_labor_time / social_working_day
Consumption_access = share × Distribution_Pool
```

## 11. Planning Problem Formulation

### Objective
```
maximize: T_free = T_total - T_necessary
```

### Material Balance Constraints (∀ products i)
```
produced_i ≥ final_need_i + intermediate_need_i + reproduction_need_i
```

### Labor-Time Balance Constraints (∀ labor types τ)
```
available_τ ≥ required_τ
```

### Time Allocation Across Branches
```
Σ(time_i) = Total_social_time
time_i = f(difficulty_i, importance_i, total_available_time)
share_i = time_i / Σ(time_j)
Allocation must satisfy: production ≥ needs
```

### First Economic Law
```
Economy of time + planned distribution of labor time among branches
= conscious distribution of labor-time to satisfy needs while maximizing free time
```

### Optimization with Consumption
```
Maximize: Total_well-being + Free_time
Subject to:
  1. Material needs met (food, shelter, etc.)
  2. Labor-power reproduction maintained
  3. Skills developed adequately
  4. Health maintained
  5. Social needs satisfied
```

## 12. Example: Bread Production

```
Total Social Time: 6h

INPUTS:
Flour:     20kg × 0.3h/kg = 6.0h
Yeast:     1kg × 2h/kg = 2.0h
Oven:      (6h/5000h) × 500h = 0.6h
Baker LP:  6h × [1 + 40h/80000h] = 6.003h
Total: 14.603h

EFFECTS:
Bread: 40 loaves
Crumbs: 2kg

ALLOCATION (physical ratio):
a_bread = 40/42 = 0.9524
a_crumbs = 2/42 = 0.0476

ALT_bread = (0.9524 × 14.603) / 40 = 0.348h/loaf
ALT_crumbs = (0.0476 × 14.603) / 2 = 0.346h/kg

ROLLING UPDATE:
Old: 1000 loaves @ 0.35h = 350h
New: (350 + 13.911) / 1040 = 0.350h/loaf
```

## 13. Extensions

### Waste
```
Effective_input = (1 - waste_rate) × nominal_input
Waste_LT = waste_rate × input_LT
```

### Quality
```
Quality_factor Q ∈ [0.8, 1.2]
ALT_adj = LT_allocated / (qty × Q)
```

### Maintenance
```
Lifespan_increase = Maintenance_LT / Depreciation_rate
```

## 14. Properties

**Simplicity**: Just record operations (who, what, how long, inputs, outputs). Everything else is analysis.

**Transparency**: Every labor-time hour traceable from raw materials through production, consumption, and back to restored labor-power

**Complete Accounting**: All human activity recorded as operations with material inputs/outputs

**No Hidden Costs**: All depreciation, skill maintenance, and reproduction costs explicitly recorded in operations

**Real-time**: ALTs always current based on all operations (production and consumption)

**Emergent Metrics**: Intensity, efficiency, work-type factors all computed retrospectively from actual data, not tracked during operations

**Planning**: Uses historical empirical data (output per hour, reproduction per hour) rather than real-time measurements

**Social Relations**: Complete production and reproduction visible, no commodity fetishism

**Materialist Measurement**: All metrics derived from material consequences (what was consumed, what was produced), not subjective assessments
