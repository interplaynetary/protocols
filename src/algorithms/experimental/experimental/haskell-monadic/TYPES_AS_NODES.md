# Types as Nodes: Implementation Guide

## Overview

As of this refactoring, the Haskell implementation now fully supports **types as nodes**, aligning with the mathematical formalism where `τ ∈ N`.

## What Changed

### Before
```haskell
type PotentialType = Text  -- Types were abstract labels
```

### After
```haskell
type PotentialType = EntityId  -- Types are nodes in the graph
```

## What This Enables

### 1. Types Can Have Categories

A type can be a member of other types, creating type hierarchies:

```haskell
-- MealType is a member of FoodType
addEdge "MealType" "FoodType" graph
```

### 2. Types Can Have Potentials

A type can have its own potentials:

```haskell
-- MealType needs Nutrition
addPotential "MealType" (Potential "Nutrition" (-100) Nothing Nothing Map.empty)

-- MealType provides Sustenance  
addPotential "MealType" (Potential "Sustenance" 50 Nothing Nothing Map.empty)
```

### 3. Types Can Have Participants

Nodes can be members of types:

```haskell
-- Kitchen is a member of MealType
addEdge "Kitchen" "MealType" graph
```

### 4. Type-Type Flows

Types can flow to other types:

```haskell
-- TypeA provides TypeB-ness to TypeB
addPotential "TypeA" (Potential "TypeB" 100 Nothing Nothing Map.empty)
addPotential "TypeB" (Potential "TypeB" (-50) Nothing Nothing Map.empty)

-- Flow from TypeA to TypeB
allocate graph potentials "TypeA" "TypeB" constraint weight
```

## Example: Self-Typing

```haskell
-- Democracy type needs Democratic-ness
addPotential "Democracy" (Potential "Democracy" (-1000) Nothing Nothing Map.empty)

-- DemocraticInstitution provides Democratic-ness
addPotential "DemocraticInstitution" (Potential "Democracy" 500 Nothing Nothing Map.empty)

-- Flow: DemocraticInstitution → Democracy
-- This "validates" or "instantiates" the Democracy type
```

## Example: Type Hierarchies with Flows

```haskell
-- Create type hierarchy
addEdge "MealType" "FoodType" graph
addEdge "FoodType" "ConsumableType" graph

-- Each level has potentials
addPotential "ConsumableType" (Potential "Safety" (-100) Nothing Nothing Map.empty)
addPotential "FoodType" (Potential "Nutrition" (-50) Nothing Nothing Map.empty)
addPotential "MealType" (Potential "Taste" (-20) Nothing Nothing Map.empty)

-- Instances inherit the hierarchy
addEdge "Kitchen" "MealType" graph

-- Kitchen inherits all ancestor types via transitive closure
-- ancestors(Kitchen) = {MealType, FoodType, ConsumableType}
```

## Example: Meta-Level Flows

```haskell
-- TypeType: the type of types
addPotential "TypeType" (Potential "TypeType" 1000 Nothing Nothing Map.empty)

-- MealType needs to be validated as a type
addPotential "MealType" (Potential "TypeType" (-1) Nothing Nothing Map.empty)

-- Flow: TypeType → MealType
-- This makes MealType "a valid type"
```

## Aggregation with Types-as-Nodes

### Downward Aggregation

Sum potentials across participants of a type:

```haskell
-- Democracy has participants: CountryA, CountryB
addEdge "CountryA" "Democracy" graph
addEdge "CountryB" "Democracy" graph

addPotential "CountryA" (Potential "EducatedCitizens" (-800000) Nothing Nothing Map.empty)
addPotential "CountryB" (Potential "EducatedCitizens" (-200000) Nothing Nothing Map.empty)

-- Aggregate down
aggregateDown graph potentials "Democracy" "EducatedCitizens"
-- Result: -1000000 (sum of all participants' needs)
```

### Upward Aggregation

Sum potentials across categories of a node:

```haskell
-- Kitchen is a member of: MealType, ServiceType
addEdge "Kitchen" "MealType" graph
addEdge "Kitchen" "ServiceType" graph

addPotential "MealType" (Potential "Quality" 100 Nothing Nothing Map.empty)
addPotential "ServiceType" (Potential "Quality" 50 Nothing Nothing Map.empty)

-- Aggregate up
aggregateUp graph potentials "Kitchen" "Quality"
-- Result: 150 (sum of all categories' capacities)
```

## Migration Guide

### Existing Code

If you have existing code using string literals for types:

```haskell
-- Before
addPotential "Kitchen" (Potential "meals" 100 Nothing Nothing Map.empty)
```

This still works! Just ensure "meals" is a valid EntityId. You may want to:

1. **Create the type node explicitly**:
```haskell
addVertex "meals" graph
```

2. **Give the type node its own properties**:
```haskell
addPotential "meals" (Potential "nutrition" 50 Nothing Nothing Map.empty)
```

### Best Practices

1. **Create type nodes explicitly** before using them as types
2. **Document type hierarchies** using edges
3. **Use meaningful EntityIds** for types (e.g., "MealType" not "m1")
4. **Consider type-level potentials** for meta-properties

## Mathematical Correspondence

| Math | Haskell |
|------|---------|
| `τ ∈ N` | `type PotentialType = EntityId` |
| `(n, τ) ∈ E` | `addEdge n τ graph` |
| `p = (τ, q, C)` | `Potential τ q unit resourceType metadata` |
| `P(τ)` | `getPotentials potentials τ` |
| `Participants(τ)` | `members graph τ` |
| `Categories(n)` | `types graph n` |
| `Agg_↓(τ, τ')` | `aggregateDown graph potentials τ τ'` |

## See Also

- `commons.tex` - Mathematical formalism (Section: Types as Nodes)
- `types.md` - Philosophical discussion of types-as-nodes
- `API.md` - Full API documentation
