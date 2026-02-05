# Recursive ALT Calculation Explained

## Yes, ALT Calculation IS Recursive!

Average Labor Time (ALT) must be computed recursively because products depend on other products, which depend on other products, and so on.

## How It Works

### Formula

```
ALT(product) = Direct_Labor + Σ(Input_quantity × ALT(input))
                    ↑                      ↑
                 New labor            Embodied labor
                                     from inputs (RECURSIVE!)
```

### Example: 4-Level Production Chain

```
Iron Ore (Level 1 - Raw Material)
├─ Direct labor: 10h
├─ Quantity: 50kg
└─ ALT = 10h / 50kg = 0.2h/kg
   
Steel (Level 2 - Intermediate)
├─ Direct labor: 8h
├─ Input: 30kg iron ore × 0.2h/kg = 6h (embodied)
├─ Total labor: 8h + 6h = 14h
├─ Quantity: 20kg
└─ ALT = 14h / 20kg = 0.7h/kg
   
Oven (Level 3 - Durable Good)
├─ Direct labor: 50h
├─ Input: 10kg steel × 0.7h/kg = 7h (embodied)
├─ Total labor: 50h + 7h = 57h
├─ Quantity: 1 oven
└─ ALT = 57h / 1 = 57h/oven

Wheat (Level 1 - Raw Material)
├─ Direct labor: 8h
├─ Quantity: 100kg
└─ ALT = 8h / 100kg = 0.08h/kg

Bread (Level 4 - Final Product)
├─ Direct labor: 6h
├─ Inputs:
│   ├─ 20kg wheat × 0.08h/kg = 1.6h (embodied)
│   └─ 0.0006 oven × 57h = 0.0342h (embodied)
├─ Total labor: 6h + 1.6h + 0.0342h = 7.6342h
├─ Quantity: 40 loaves
└─ ALT = 7.6342h / 40 = 0.1908h/loaf
```

### The Recursion Tree

```
computeALT(bread)
├─ directLabor = 6h / 40 = 0.15h/loaf
├─ computeALT(wheat)
│  ├─ directLabor = 8h / 100 = 0.08h/kg
│  └─ embodiedLabor = 0 (no inputs)
│  └─ return 0.08h/kg
├─ computeALT(oven)
│  ├─ directLabor = 50h / 1 = 50h/oven
│  ├─ computeALT(steel)
│  │  ├─ directLabor = 8h / 20 = 0.4h/kg
│  │  ├─ computeALT(iron_ore)
│  │  │  ├─ directLabor = 10h / 50 = 0.2h/kg
│  │  │  └─ embodiedLabor = 0 (no inputs)
│  │  │  └─ return 0.2h/kg
│  │  ├─ embodiedLabor = 30kg × 0.2h/kg = 6h
│  │  └─ return (8h + 6h) / 20kg = 0.7h/kg
│  ├─ embodiedLabor = 10kg × 0.7h/kg = 7h
│  └─ return 50h + 7h = 57h/oven
├─ embodiedLabor = (20kg × 0.08h/kg) + (0.0006 × 57h)
│                = 1.6h + 0.0342h = 1.6342h
└─ return (6h + 1.6342h) / 40 = 0.1908h/loaf
```

## Two Algorithms Implemented

### 1. Recursive (Topological Sort)

**Best for**: Acyclic production networks (normal case)

```typescript
function computeALTRecursive(productId) {
  if (alreadyComputed(productId)) {
    return cachedALT(productId);
  }
  
  // Recursively compute ALTs for all inputs FIRST
  let embodiedLabor = 0;
  for (input of inputs) {
    inputALT = computeALTRecursive(input.productId); // RECURSION!
    embodiedLabor += input.quantity * inputALT;
  }
  
  // Then compute this product's ALT
  totalALT = directLabor + embodiedLabor;
  cache(productId, totalALT);
  return totalALT;
}
```

**Detects circular dependencies** (which shouldn't exist!)

### 2. Iterative (Fixed-Point)

**Best for**: Debugging, or if circular dependencies exist

```typescript
function computeALTIterative() {
  // Initialize all ALTs to direct labor only
  for (product of products) {
    alts[product] = directLabor[product];
  }
  
  // Iterate until convergence
  while (not_converged) {
    for (product of products) {
      embodiedLabor = sum(input.qty * alts[input] for input in inputs);
      newALT = directLabor + embodiedLabor;
      alts[product] = newALT;
    }
  }
}
```

**Converges in 2-3 iterations** for typical production chains.

## Why Recursion Matters

### 1. **Captures All Labor**

Every product's ALT includes:
- Direct labor (new work)
- Embodied labor from ALL upstream inputs (past work)

### 2. **Enables Rational Planning**

```
If ALT(bread) = 0.19h/loaf
Then producing 100 loaves requires: 100 × 0.19h = 19h total

This 19h includes:
- Baking time
- Farming time for wheat
- Manufacturing time for oven
- Smelting time for steel
- Mining time for iron ore
```

### 3. **Reveals True Costs**

```
Bread appears to take 6h to bake (direct labor)
But actually requires 7.6h total (including inputs)

The 1.6h difference is embodied labor from:
- Growing wheat
- Making the oven
```

## Test Results

```bash
✓ ALT Dependency Graph (2 tests)
  ✓ builds graph from simple production chain
  ✓ builds graph from complex production chain

✓ Recursive ALT Computation (4 tests)
  ✓ computes ALT for simple chain (wheat → bread)
  ✓ computes ALT for complex chain (ore → steel → oven → bread)
  ✓ handles products with no inputs (raw materials)
  ✓ detects circular dependencies

✓ Iterative ALT Computation (2 tests)
  ✓ converges to same result as recursive
  ✓ converges for complex production chain

✓ ALT Breakdown (4 tests)
  ✓ shows breakdown for simple product
  ✓ shows breakdown for product with inputs
  ✓ shows breakdown for complex product
  ✓ prints readable breakdown

✓ Complete ALT Computation (2 tests)
  ✓ computes all ALTs for stock-book
  ✓ demonstrates full recursion through 4 levels

Total: 14 tests ✓
```

## Breakdown Example

```
ALT Breakdown for bread:
  Total ALT: 0.1908h
  Direct Labor: 0.1500h
  Embodied Labor: 0.0408h
  Inputs:
    - wheat: 0.50 × 0.0800h = 0.0400h
    - oven: 0.00 × 57.0000h = 0.0009h
```

## Key Insight

**ALT is NOT just "time to make this product"**

**ALT is "total social labor-time embodied in this product"**

This includes all upstream labor, recursively, back to raw materials!

## Files Created

- `alt-recursive.ts` - Recursive ALT computation algorithms
- `alt-recursive.test.ts` - 14 comprehensive tests
- `alt-recursive-explained.md` - This document

The recursion is **fully implemented and tested**! 🎉
