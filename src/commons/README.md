# Communal Production Accounting System

Implementation of Marx's stock-book accounting system for communal production, with allocation planning and optimization.

## Project Structure

```
src/notes/
├── theory/              # Marxist economic theory
│   ├── notes.md        # Core Marx quotes on communal production
│   ├── gotha.md        # Critique of the Gotha Programme
│   ├── equations.md    # Economic equations and relations
│   ├── both.md         # Combined theoretical notes
│   ├── other.md        # Additional theory
│   └── personal.md     # Personal notes
│
├── implementation/      # Core implementation
│   ├── commons.ts      # Main schemas and core functions
│   └── aggregation.ts  # Aggregation and analysis functions
│
├── planning/           # Allocation planning and optimization
│   ├── optimizer.ts    # Optimization solver (greedy + LP)
│   ├── allocation-planning.md  # Planning theory and algorithms
│   └── stockbook.md            # Stock-book specification (Dual System Labor Power)
│
├── analysis/           # Analysis tools
│   ├── alt-comparison.ts      # Compare ALT calculation approaches
│   └── alt-recursive.ts       # Recursive ALT computation
│
├── tests/              # Test suites
│   ├── commons.test.ts              # Core functionality tests (26 tests)
│   ├── commons-allocation.test.ts   # Allocation tests (23 tests)
│   ├── optimizer.test.ts            # Optimizer tests (26 tests)
│   ├── alt-comparison.test.ts       # ALT comparison tests (11 tests)
│   └── alt-recursive.test.ts        # Recursive ALT tests (14 tests)
│
└── docs/               # Documentation
    ├── vc.md                        # Verifiable Credentials
    ├── vc-incentives.md             # VC incentive mechanisms
    ├── schema-summary.md            # Schema documentation
    ├── test-summary.md              # Test coverage summary
    ├── optimizer-summary.md         # Optimizer documentation
    ├── alt-comparison-results.md    # ALT comparison analysis
    ├── alt-recursive-explained.md   # Recursive ALT explanation
    ├── sensitivity-analysis.md      # Sensitivity Analysis
    └── alt-rolling-vs-recursive.md  # Approach comparison
```

## Key Components

### 1. Stock-Book (Recording Layer)

**Purpose:** Record what actually happened
- Operations (who, what, when, inputs, outputs)
- Stocks (current inventory)
- **Labor Power**: Dual System (Daily Energy + Skill Inventory)
- **Intensity**: Statistical derivation (no real-time monitoring)

**Files:**
- `implementation/commons.ts` - Core schemas
- `planning/stockbook.md` - Specification
- `tests/commons.test.ts` - Tests

### 2. Allocation Planning (Planning Layer)

**Purpose:** Decide what should happen
- Deductions (D1-D6): replacement, expansion, reserves, admin, common needs, support
- Optimization: maximize free time
- Constraints: material balance, labor capacity

**Files:**
- `planning/optimizer.ts` - Solver implementation
- `docs/allocation-planning.md` - Theory
- `tests/optimizer.test.ts` - Tests

### 3. ALT Calculation

**Two approaches:**
1. **Averaging** (Marx's approach): Average labor-time across operations
2. **Recursive** (Dependency graph): Recompute from current data

**Files:**
- `analysis/alt-comparison.ts` - Both implementations
- `docs/alt-comparison-results.md` - Analysis

## Test Coverage

**Total: 100 tests passing**
- commons.test.ts: 26 tests ✓
- commons-allocation.test.ts: 23 tests ✓
- optimizer.test.ts: 26 tests ✓
- alt-comparison.test.ts: 11 tests ✓
- alt-recursive.test.ts: 14 tests ✓

Run all tests:
```bash
npx vitest run src/notes/tests/
```

## Key Principles

1. **Just record operations** - Everything else emerges from analysis
2. **Two-layer architecture** - Recording (stock-book) vs Planning (allocation)
3. **Economy of time** - First economic law of communal production
4. **Transparent accounting** - All relations simple and intelligible

## Getting Started

1. **Read the theory:**
   - `theory/notes.md` - Marx's core concepts
   - `docs/stockbook.md` - Stock-book specification

2. **Understand the implementation:**
   - `implementation/commons.ts` - Start here
   - `docs/schema-summary.md` - Schema overview

3. **Run the tests:**
   ```bash
   npx vitest run src/notes/tests/commons.test.ts
   ```

4. **Explore planning:**
   - `planning/optimizer.ts` - Optimization solver
   - `docs/allocation-planning.md` - Planning theory

## Future Work

- [ ] Integrate with proper LP solver (glpk.js, highs)
- [ ] Implement multi-period optimization
- [ ] Add VC (Verifiable Credentials) integration
- [ ] Build UI for planning and execution
- [ ] Database persistence layer
- [ ] Real-time stock-book updates
