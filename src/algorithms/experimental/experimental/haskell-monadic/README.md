# Commons: Haskell Monadic Implementation

> **A pure Haskell implementation of the Commons paradigm for sovereign resource allocation**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Haskell](https://img.shields.io/badge/language-Haskell-5e5086)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## What Is This?

Commons is a mathematical framework for modeling resource allocation, type hierarchies, and social coordination as **flow potentials through relationships** rather than properties of objects.

Instead of thinking "Alice has 10 dollars" or "Bob is a Person," we think:
- Currency potential of ±10 flows through the Alice node (source or sink)
- Alice participates in Person-like flow patterns (membership edge: Alice → Person)

**Everything is a potential gradient. Everything seeks equilibrium.**

---

## Quick Start

```haskell
{-# LANGUAGE OverloadedStrings #-}

import Commons.Types
import Commons.Monad
import Commons.Constraint (noConstraint)
import Commons.Weight (needWeight)

main :: IO ()
main = do
  (allocations, _, _) <- runCommonsM example emptyCommons
  print allocations

example :: CommonsM (Map EntityId SignedQuantity)
example = do
  -- Create entities
  addVertexM "kitchen"
  addVertexM "alice"
  
  -- Set up relationships
  addMembershipM "alice" "kitchen"
  
  -- Add potentials (capacity and need)
  addPotentialM "kitchen" $ Potential "meals" 100 Nothing Nothing mempty
  addPotentialM "alice" $ Potential "meals" (-20) Nothing Nothing mempty
  
  -- Allocate!
  performAllocationM "kitchen" "meals" noConstraint needWeight
    "no constraint" "proportional to need"
```

**Output:**
```
fromList [("alice", 20.0)]
```

---

## The Five Primitives

```
Commons = ⟨G, P, C, w, {Δ_t}⟩
```

1. **G** (Graph) - Entity relationships (membership edges)
2. **P** (Potentials) - Signed magnitudes representing capacity (+) and need (-)
3. **C** (Constraints) - Limits on flow to recipients
4. **w** (Weights) - Preference functions for distribution
5. **{Δ_t}** (Records) - Immutable history of allocations

From these five primitives, everything emerges:
- Type hierarchies (graph edges)
- Resource allocation (proportional distribution)
- Recognition systems (weighted potentials)
- Attributes (potentials with metadata)

---

## Key Concepts

### Potentials: Capacity and Need

Following the terminology from `commons.tex`:

> **Terminology**: We refer to a potential's magnitude as its **capacity** when the potential is a source (q > 0) and as its **need** when the potential is a sink (|q| where q < 0).

```haskell
-- Source: has capacity
kitchen = Potential "meals" 100 Nothing Nothing mempty
capacityOf kitchen  -- Returns: 100.0

-- Sink: has need
alice = Potential "meals" (-20) Nothing Nothing mempty
needOf alice        -- Returns: 20.0
```

### The Unified Flow Equation

Allocation follows a three-term minimum:

```
Flow(s, r, τ) = min(capacity · w(r)/Σw(r'), need, C(r))
```

Where:
- **capacity** - How much the source can provide
- **w(r)/Σw(r')** - Recipient's weighted share
- **need** - How much the recipient needs
- **C(r)** - Policy constraint limit

```haskell
allocate graph potentials provider potentialType constraint weight
```

---

## Installation

```bash
git clone https://github.com/yourorg/haskell-monadic.git
cd haskell-monadic
cabal build
cabal run commons-monadic
```

---

## Documentation

### 📚 **[API Reference](API.md)**
Complete API documentation with examples and mathematical definitions.

### ⚡ **[Quick Reference](QUICK_REFERENCE.md)**
Common patterns and recipes for everyday use.

### 📖 **[Terminology Guide](TERMINOLOGY.md)**
Design rationale for capacity/need terminology.

### 🔄 **[Refactoring Summary](REFACTORING_SUMMARY.md)**
Recent improvements to code clarity.

### 📐 **[Mathematical Formalism](commons.tex)**
Complete mathematical specification (LaTeX).

---

## Examples

### Basic Proportional Distribution

```haskell
import Commons.Constraint (noConstraint)
import Commons.Weight (needWeight)

-- Allocate proportionally to need
-- Alice needs 20, Bob needs 30 → Alice gets 40%, Bob gets 60%
allocations = allocate graph pots "kitchen" "meals" noConstraint needWeight
```

### Weighted by Recognition

```haskell
import Commons.Weight (satisfactionWeighted)

-- Allocate using recognition × reputation (Mutual Satisfaction formula)
allocations = allocate graph pots "tutor" "hours" noConstraint satisfactionWeighted
```

### Constrained Allocation

```haskell
import Commons.Constraint (capAt, hasPotential, (.∧.))

-- Cap at 10 AND must have "meals" potential
let constraint = capAt 10.0 .∧. hasPotential "meals"
allocations = allocate graph pots "kitchen" "meals" constraint needWeight
```

### Multi-Tier Allocation

```haskell
import Commons.Types (Tier(..))

let tiers = 
      [ Tier 1 highPriorityConstraint needWeight "High Priority"
      , Tier 2 mediumPriorityConstraint needWeight "Medium Priority"
      , Tier 3 noConstraint needWeight "Everyone Else"
      ]

allocations = allocateMultiTier graph pots "provider" "resource" tiers
```

---

## Module Structure

```
Commons/
├── Types.hs          -- Core type definitions
├── Graph.hs          -- Graph operations
├── Potential.hs      -- Potential operations and helpers
├── Constraint.hs     -- Constraint algebra
├── Weight.hs         -- Weight functions
├── Allocate.hs       -- Core allocation logic
├── Monad.hs          -- Monadic interface
└── Filter.hs         -- Legacy filter support
```

---

## Design Principles

### 1. **Purity**
All core functions are pure. Side effects are isolated in the `CommonsM` monad.

### 2. **Composability**
Constraints and weights compose naturally:
```haskell
constraint = capAt 10 .∧. hasPotential "meals"
weight = needWeight .*. capacityWeight "reputation"
```

### 3. **Type Safety**
The type system prevents common errors:
- Can't allocate from a sink (checked via `isSource`)
- Constraints and weights are type-safe functions
- History is immutable

### 4. **Domain Alignment**
Code uses intuitive domain terminology:
- `capacityOf` / `needOf` instead of `abs (magnitude p)`
- `isSource` / `isSink` instead of `magnitude p > 0`
- Clear, self-documenting naming throughout

---

## Mathematical Foundations

### Potentials

A potential is a triple `(τ, q, C)`:
- **τ** (type) - What kind of flow
- **q** (magnitude) - Signed quantity (+ = source, - = sink)
- **C** (constraints) - Metadata and properties

### Graph Relationships

Edges represent membership:
- `e₁ → e₂` means "e₁ is a member of e₂"
- `Types(e) = {t ∈ V | (e,t) ∈ E}`
- `Members(t) = {e ∈ V | (e,t) ∈ E}`

### Aggregation

Potentials aggregate through the graph:
- **Up** (through categories): `Agg_↑(v, τ) = Σ_{c ∈ Categories(v)} P(c, τ)`
- **Down** (through participants): `Agg_↓(c, τ) = Σ_{v ∈ Participants(c)} P(v, τ)`

---

## Testing

```bash
# Build the project
cabal build

# Run examples
cabal run commons-monadic

# Run tests (if available)
cabal test
```

---

## Contributing

Contributions are welcome! Please ensure:
1. Code follows the domain terminology (capacity/need)
2. All functions are pure (except in CommonsM)
3. Examples are included for new features
4. Documentation is updated

---

## Comparison with Other Approaches

### vs. Traditional OOP
- **OOP**: "Alice has 10 dollars" (property of object)
- **Commons**: "±10 currency potential flows through Alice node" (gradient)

### vs. Relational Databases
- **RDBMS**: Tables with foreign keys
- **Commons**: Graph with potentials flowing through edges

### vs. Functional Reactive Programming
- **FRP**: Time-varying values
- **Commons**: Equilibrium-seeking potentials with immutable history

---

## Use Cases

- **Resource Allocation**: Budget distribution, meal planning, time allocation
- **Social Coordination**: Recognition systems, reputation tracking
- **Type Systems**: Flexible hierarchies without rigid inheritance
- **Economic Modeling**: Flow-based economies, mutual credit systems

---

## Roadmap

- [ ] Add comprehensive test suite
- [ ] Performance optimizations for large graphs
- [ ] Visualization tools for potentials and flows
- [ ] Integration with external data sources
- [ ] Web API for remote allocation

---

## License

MIT License - see [LICENSE](LICENSE) for details

---

## Citation

If you use this library in academic work, please cite:

```bibtex
@software{commons_haskell,
  title = {Commons: A Haskell Implementation of Flow-Based Resource Allocation},
  author = {Your Name},
  year = {2025},
  url = {https://github.com/yourorg/haskell-monadic}
}
```

---

## Acknowledgments

This implementation is based on the mathematical formalism described in `commons.tex`. Special thanks to the Commons research community for developing the theoretical foundations.

---

## Learn More

- **Mathematical Specification**: See `commons.tex` for complete formal definitions
- **API Documentation**: See `API.md` for detailed function reference
- **Quick Reference**: See `QUICK_REFERENCE.md` for common patterns
- **Examples**: See `app/Main.hs` for working code examples

---

**Built with ❤️ using pure functional programming**