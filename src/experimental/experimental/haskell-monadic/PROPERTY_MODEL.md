# Property-Based Object Graph Model

## Overview

The Commons framework now uses a **property-based object graph model** where everything is expressed as properties on nodes. This makes the system more general, constraints easier to express, and aligns with Entity-Attribute-Value (EAV) and object graph patterns.

## Core Concept

**Everything is a property on a node:**
- **Membership** (edges) → `memberOf` property containing node references
- **Potentials** → `potentials` property containing capacity/need list
- **Graph** → emergent from `memberOf` properties across all nodes
- **Constraints** → uniform predicates over properties

## Mathematical Model

### Before (Graph-Centric)
```
Commons = ⟨G, P, C, w, {Δ_t}⟩
where:
  G = ⟨N, E⟩  -- Graph with nodes and edges
  P: N → {(τ, q, C)}  -- Potentials mapping
  E ⊆ N × N  -- Membership relation
```

### After (Property-Based)
```
Commons = ⟨N, Π, {Δ_t}⟩
where:
  N = set of nodes
  Π: N → PropertyBag  -- Each node has properties
  PropertyBag = {(key, value, metadata)}
  
Special properties:
  - memberOf: Set EntityId  (replaces E)
  - potentials: [Potential]  (replaces P)
  - Graph G emergent from memberOf properties
```

## Core Types

### PropertyValue

Properties can hold various types of values:

```haskell
data PropertyValue
  = PVText Text
  | PVNumber Double
  | PVBool Bool
  | PVNodeRef EntityId
  | PVNodeRefs (Set EntityId)
  | PVPotential Potential
  | PVPotentials [Potential]
  | PVMap (Map Text PropertyValue)
  | PVList [PropertyValue]
```

### Property

A property with metadata:

```haskell
data Property = Property
  { propKey :: Text
  , propValue :: PropertyValue
  , propMetadata :: Map Text Text
  }
```

### Node

A node with a property bag:

```haskell
data Node = Node
  { nodeId :: EntityId
  , nodeProperties :: Map Text Property
  }
```

### Commons

The complete system:

```haskell
data Commons = Commons
  { nodes :: Map EntityId Node
  , history :: History
  }
```

## Working with Properties

### Creating Nodes

```haskell
-- Create a node with properties
kitchen = emptyNode "Kitchen"
  & setMembership (Set.fromList ["MealProvider"])
  & setPotentials [Potential "Meals" 100 Nothing Nothing Map.empty]
  & setProperty "reputation" (PVNumber 0.9)
  & setProperty "location" (PVText "Building A")
```

### Accessing Properties

```haskell
-- Get membership
types :: Commons -> EntityId -> Set EntityId
types commons nid = getMembership node

-- Get potentials
getPotentials :: Node -> [Potential]

-- Get any property
getProperty :: Text -> Node -> Maybe PropertyValue
getNumericProperty :: Text -> Node -> Maybe Double
getTextProperty :: Text -> Node -> Maybe Text
```

### Graph Operations (Emergent)

The graph emerges from `memberOf` properties:

```haskell
-- Get members (participants) of a type
members :: Commons -> EntityId -> Set EntityId

-- Get types (categories) of a node
types :: Commons -> EntityId -> Set EntityId

-- Add/remove edges
addEdge :: EntityId -> EntityId -> Commons -> Commons
removeEdge :: EntityId -> EntityId -> Commons -> Commons

-- Transitive closure
ancestors :: Commons -> EntityId -> Set EntityId
descendants :: Commons -> EntityId -> Set EntityId
```

## Property-Based Constraints

Constraints are now uniform predicates over properties:

```haskell
data PropertyConstraint
  = PropExists Text
  | PropEquals Text PropertyValue
  | PropGreaterThan Text Double
  | PropLessThan Text Double
  | PropIn Text (Set PropertyValue)
  | PropMatches Text (PropertyValue -> Bool)
  | NodeMatches (Node -> Bool)
  | PropAnd [PropertyConstraint]
  | PropOr [PropertyConstraint]
  | PropNot PropertyConstraint
```

### Examples

```haskell
-- Simple constraints
minReputation 0.5  -- reputation >= 0.5
isMemberOf "Democracy"  -- has "Democracy" in memberOf
hasNeedOfType "Meals"  -- has negative potential of type "Meals"

-- Complex constraints
isMemberOf "Person" .&&. PropGreaterThan "reputation" 0.7

-- Custom constraints
PropMatches "memberOf" $ \case
  PVNodeRefs refs -> Set.size refs >= 3
  _ -> False
```

### Constraint Combinators

```haskell
(.&&.) :: PropertyConstraint -> PropertyConstraint -> PropertyConstraint
(.||.) :: PropertyConstraint -> PropertyConstraint -> PropertyConstraint
notC :: PropertyConstraint -> PropertyConstraint
allC :: [PropertyConstraint] -> PropertyConstraint
anyC :: [PropertyConstraint] -> PropertyConstraint
```

## Allocation with Properties

Allocation works the same but uses property-based constraints:

```haskell
-- Simple allocation
allocateUniform 
  "Kitchen"  -- provider
  "Meals"    -- potential type
  (hasNeedOfType "Meals")  -- constraint
  commons

-- With reputation weighting
allocateByReputation
  "Kitchen"
  "Meals"
  (isMemberOf "Person" .&&. minReputation 0.5)
  commons

-- With mutual recognition
allocateByMutualRecognition
  "Kitchen"
  "Meals"
  (isMemberOf "Person")
  commons
```

## Benefits

### 1. Easier Constraints

**Before:**
```haskell
complexFilter :: FilterContext -> Bool
complexFilter ctx = 
  let g = fcGraph ctx
      p = fcPotentials ctx
      e = fcEntity ctx
  in hasType g e "Democracy" && 
     hasMinPotential p e "reputation" 0.5
```

**After:**
```haskell
complexFilter :: PropertyConstraint
complexFilter = 
  isMemberOf "Democracy" .&&. 
  PropGreaterThan "reputation" 0.5
```

### 2. More General

- Add arbitrary properties without changing core types
- Properties can reference other properties
- Metadata on properties enables rich annotations
- Natural JSON/database serialization

### 3. Simpler Mental Model

- Everything is a node
- Nodes have properties
- Some properties reference other nodes (creating graph)
- Constraints are property predicates

## Migration from Old Model

The old `Graph` and `Potentials` types still exist for backward compatibility, but new code should use the property-based model:

```haskell
-- Old way
import Commons.Graph
import Commons.Potential

-- New way
import Commons.Commons
import Commons.Property
import Commons.PropertyConstraint
import Commons.PropertyAllocate
```

## Example

See `app/PropertyModelExample.hs` for a complete working example demonstrating:
- Creating nodes with properties
- Emergent graph structure
- Property-based constraints
- Allocation with constraints
- Complex constraint combinations

Run with:
```bash
cabal run property-model-example
```

## See Also

- `commons.tex` - Mathematical formalism (to be updated)
- `TYPES_AS_NODES.md` - Types as first-class nodes
- `implementation_plan.md` - Full refactoring plan
