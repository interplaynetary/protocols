# How Deductions Connect to Stock-Book and Needs

## The Stock-Book Records Reality

The Stock-Book has **one job**: Record what actually happened.

```
Operation OP123:
- Inputs: 10kg flour, 1 oven (2h use), Worker I001 (4h)
- Effects: +8 loaves bread, +0.5kg crumbs
```

That's it. Just facts. No categories, no planning, no "needs". Just: what went in, what came out.

---

## Three Types of "Needs"

### 1. **Final Needs** (What people consume)
- Food eaten
- Housing used
- Healthcare received
- Education attended
- Entertainment enjoyed

**Where tracked:** Consumption operations in Stock-Book
**Who decides:** Social decision (What quality of life do we want?)

### 2. **Intermediate Needs** (What production requires)
- Flour needed to make bread
- Steel needed to make machines
- Electricity needed to run factory
- Tools used up in operations

**Where tracked:** Production operations in Stock-Book (as inputs)
**Who decides:** Technology (The bread recipe requires X flour)

### 3. **Reproduction Needs** (What workers need to work tomorrow)
- Food to restore energy (LP_base)
- Training to maintain skills (LP_skill)
- Rest, healthcare, etc.

**Where tracked:** Consumption operations that restore Labor Power
**Who decides:** Biology + Social standards (How much rest/food is humane?)

---

## How Each Deduction is Determined

### **D1: Replacement**
```
WHAT: Replace means of production used up
SOURCE: Stock-Book depreciation records (past period)
FORMULA: D1_product = Σ(depreciation from operations that used product)
EXAMPLE: 
  - Used 100kg flour → D1_flour = 100kg
  - Used oven for 50h (of 10,000h life) → D1_oven = 50h worth
```

**Category:** INTERMEDIATE NEEDS
**Stock-Book link:** Sum up all "Inputs (Products)" from last period's operations

---

### **D2: Expansion**
```
WHAT: Build NEW productive capacity
SOURCE: Social decision (planning target)
FORMULA: D2 = Growth_target (e.g., "expand by 5%")
EXAMPLE:
  - Want 2 new tractors → D2_tractor = 2
  - Want 1 new factory → D2_factory = 1
```

**Category:** INTERMEDIATE NEEDS (building means of production)
**Stock-Book link:** NOT derived from Stock-Book, it's a GOAL

---

### **D3: Reserves**
```
WHAT: Safety buffer for everything
SOURCE: Risk calculation (wraps around other deductions)
FORMULA: D3_product = Risk_Factor × Σ(D1 + D2 + D4 + D5 + D6 for product)
EXAMPLE:
  - D1_flour = 100kg, Risk = 20% → D3_flour ≥ 20kg
  - D2_machine = 2, Risk = 20% → D3_machine ≥ 0.4
```

**Category:** INTERMEDIATE NEEDS (buffer stock)
**Stock-Book link:** Calculated FROM other deductions (not directly from Stock-Book)

---

### **D4: Administration**
```
WHAT: Overhead costs (planning, coordination, records)
SOURCE: Social decision (minimize this)
FORMULA: D4 ≤ Admin_max (cap on overhead)
EXAMPLE:
  - Planners need office supplies
  - Accountants need computers
  - Coordinators need communication tools
```

**Category:** INTERMEDIATE NEEDS (for admin operations, not direct production)
**Stock-Book link:** Admin operations in Stock-Book consume these

---

### **D5: Common Needs**
```
WHAT: Public goods (schools, hospitals, parks)
SOURCE: Social decision (social development priority)
FORMULA: D5 ≥ Common_min (minimum acceptable level)
EXAMPLE:
  - School building materials
  - Hospital equipment
  - Park maintenance supplies
```

**Category:** FINAL NEEDS (collective consumption)
**Stock-Book link:** Public consumption operations in Stock-Book

---

### **D6: Support for Unable to Work**
```
WHAT: Support for elderly, sick, disabled
SOURCE: Social decision (solidarity objective)
FORMULA: D6 = maximize(what we can afford)
EXAMPLE:
  - Food for elderly
  - Medicine for sick
  - Assistance for disabled
```

**Category:** FINAL NEEDS (individual consumption by non-workers)
**Stock-Book link:** Consumption operations by individuals unable to work

---

## The Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      STOCK-BOOK                              │
│  Records all operations (production + consumption)           │
│  - What products were used?                                  │
│  - What labor was expended?                                  │
│  - What was produced/restored?                               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ├─── Past Operations ───┐
                  │                        │
                  ▼                        ▼
         ┌─────────────────┐      ┌──────────────────┐
         │  DEPRECIATION   │      │  FINAL NEEDS     │
         │  (from inputs)  │      │  (from effects)  │
         └────────┬────────┘      └────────┬─────────┘
                  │                        │
                  ▼                        ▼
            ┌──────────┐            ┌──────────┐
            │    D1    │            │ D5, D6   │
            │(replace) │            │(consume) │
            └────┬─────┘            └────┬─────┘
                 │                       │
                 └───────┬───────────────┘
                         │
         ┌───────────────┴─────────────────────┐
         │         ALLOCATION PLANNING         │
         │  - Calculate D3 (insurance)         │
         │  - Decide D2 (expansion)            │
         │  - Allocate D4 (admin), D5, D6      │
         └──────────────┬──────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────────┐
         │   PRODUCTION PLAN                │
         │   Must produce enough to cover:  │
         │   D1 + D2 + D3 + D4 + D5 + D6   │
         └──────────────────────────────────┘
```

---

## The Key Relationships

### Stock-Book → Optimizer

**D1:** Sum depreciation from all operations
```typescript
D1_flour = Σ(flour used in all operations last period)
```

**D5, D6:** Look at consumption patterns
```typescript
D5_target = Average(school/hospital consumption from last period) × 1.1
D6_target = Average(support consumption) × 1.1
```

### Optimizer → Stock-Book

**Next Period:** Optimizer creates allocation plan → Operations execute → Stock-Book records results → Depreciation feeds back into D1

---

## Example: Complete Cycle

### Month 1 (Stock-Book Records):
```
Operations produced:
- 1000 loaves bread (used 500kg flour, 10h oven, 40h labor)
- Trained 5 engineers (used classroom 80h, teacher 120h)
- Fed community (consumed 800 loaves)
- Ran hospital (consumed 50h doctor time, 5kg medicine)
```

### Month 2 (Optimizer Calculates):
```
D1_flour = 500kg (used last month, must replace)
D1_oven = 10h worth (~0.001 ovens if lifespan=10,000h)
D3_flour = 500kg × 0.2 = 100kg (insurance for D1)
D5_medicine = 5kg × 1.1 = 5.5kg (hospital needs, grow slightly)
D6_food = 50 loaves (elderly who can't work)
D2 = Want to expand bakery by 10%

Total flour needed:
- D1: 500kg (replacement)
- D3: 100kg + 10kg (insure D1 + insure D6)
- D6: 5kg (for bread for elderly)
- D2: 50kg (expand bakery)
= 665kg total

Current stock: 200kg
Must produce: 465kg this month
```

### Month 2 (Operations Execute):
```
Produce 465kg flour → recorded in Stock-Book
Use 500kg for bread → recorded as depreciation
Set aside 110kg as reserves → recorded in Stock-Book stocks
```

### Month 3 (Cycle Repeats):
New D1_flour based on Month 2's actual depreciation...

---

## Summary: Simplest Answer

**D1:** What did we use up? (Stock-Book tells us)
**D2:** What do we want to build? (We decide)
**D3:** How much insurance? (Math based on D1+D2+D4+D5+D6)
**D4:** What do admins need? (We decide, minimize it)
**D5:** What do public services need? (We decide, prioritize it)
**D6:** What do non-workers need? (We decide, maximize solidarity)

**The Stock-Book is the SOURCE OF TRUTH for past reality.**
**The Optimizer is the PLANNING TOOL for future action.**
**Deductions are the BRIDGE between them.**
