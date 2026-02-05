# Commons API Reference

> **A pure Haskell implementation of the Commons paradigm for sovereign resource allocation**

---

## Quick Start

```haskell
import Commons.Types
import Commons.Monad
import Commons.Potential
import Commons.Weight

-- Create a simple allocation
main = do
  let commons = emptyCommons
  (_, finalCommons, _) <- runCommonsM example commons
  return ()

example :: CommonsM ()
example = do
  -- Add entities
  addVertexM "kitchen"
  addVertexM "alice"
  
  -- Add membership
  addMembershipM "alice" "kitchen"
  
  -- Add potentials
  addPotentialM "kitchen" $ Potential "meals" 100 Nothing Nothing mempty
  addPotentialM "alice" $ Potential "meals" (-20) Nothing Nothing mempty
  
  -- Allocate!
  allocations <- performAllocationM "kitchen" "meals" noConstraint needWeight
                   "no constraint" "proportional to need"
  
  liftIO $ print allocations
```

---

## Core Concepts

### The Five Primitives

The Commons is built on five mathematical primitives:

```haskell
Commons = ⟨G, P, C, w, {Δ_t}⟩
```

1. **G** (Graph) - Entity relationships
2. **P** (Potentials) - Capacity and need gradients
3. **C** (Constraints) - Limits on flow
4. **w** (Weights) - Preference functions
5. **{Δ_t}** (Records) - Immutable history

---

## Module: Commons.Types

### Core Types

#### `Potential`
Represents a flow gradient with direction and magnitude.

```haskell
data Potential = Potential
  { potentialType :: PotentialType  -- Type of flow (e.g., "meals", "hours")
  , magnitude     :: SignedQuantity -- Signed magnitude (+ = capacity, - = need)
  , unit          :: Maybe Text     -- Optional unit ("meals/week")
  , resourceType  :: Maybe Text     -- Optional category ("food")
  , metadata      :: Map Text Text  -- Additional properties
  }
```

**Example:**
```haskell
-- A kitchen with capacity for 100 meals
sourcePotential = Potential
  { potentialType = "meals"
  , magnitude = 100          -- Positive = capacity
  , unit = Just "meals/week"
  , resourceType = Just "food"
  , metadata = mempty
  }

-- Alice needs 20 meals
sinkPotential = Potential
  { potentialType = "meals"
  , magnitude = -20          -- Negative = need
  , unit = Just "meals/week"
  , resourceType = Just "food"
  , metadata = mempty
  }
```

#### `Graph`
The entity relationship graph.

```haskell
data Graph = Graph
  { vertices :: Set EntityId
  , edges    :: Map EntityId (Set EntityId)
  }
```

**Interpretation:** `e₁ → e₂` means "e₁ is a member of e₂"

#### `Commons`
The complete system state.

```haskell
data Commons = Commons
  { graph      :: Graph
  , potentials :: Potentials
  , history    :: History
  }
```

#### `Constraint`
A function that limits flow to recipients.

```haskell
type Constraint = FilterContext -> Limit

data Limit
  = NoLimit        -- ∞ (no constraint)
  | Exclude        -- 0 (total exclusion)
  | Cap Double     -- k (cap at specific value)
```

#### `Weight`
A function that assigns preference to recipients.

```haskell
type Weight = WeightContext -> Double
```

---

## Module: Commons.Potential

### Intuitive Accessors

These functions map directly to the terminology in `commons.tex`:

#### `capacityOf`
Get the capacity of a source potential.

```haskell
capacityOf :: Potential -> Double
```

**From commons.tex:** "capacity when the potential is a source (q > 0)"

```haskell
-- Example
let kitchen = Potential "meals" 100 Nothing Nothing mempty
capacityOf kitchen  -- Returns: 100.0

let alice = Potential "meals" (-20) Nothing Nothing mempty
capacityOf alice    -- Returns: 0.0 (sinks have no capacity)
```

#### `needOf`
Get the need of a sink potential.

```haskell
needOf :: Potential -> Double
```

**From commons.tex:** "need when the potential is a sink (|q| where q < 0)"

```haskell
-- Example
let alice = Potential "meals" (-20) Nothing Nothing mempty
needOf alice        -- Returns: 20.0

let kitchen = Potential "meals" 100 Nothing Nothing mempty
needOf kitchen      -- Returns: 0.0 (sources have no need)
```

#### `isSource` / `isSink`
Check the direction of a potential.

```haskell
isSource :: Potential -> Bool
isSink   :: Potential -> Bool
```

```haskell
-- Example
isSource kitchen    -- True (has capacity)
isSink alice        -- True (has need)
```

### Potential Operations

#### `getPotential`
Get a specific potential by type.

```haskell
getPotential :: Potentials -> EntityId -> PotentialType -> Maybe Potential
```

#### `addPotential`
Add a potential to an entity.

```haskell
addPotential :: EntityId -> Potential -> Potentials -> Potentials
```

#### `updatePotential`
Update or add a potential.

```haskell
updatePotential :: EntityId -> Potential -> Potentials -> Potentials
```

### Aggregation

#### `aggregateUp`
Aggregate potentials upward through category relationships.

```haskell
aggregateUp :: Graph -> Potentials -> EntityId -> PotentialType -> SignedQuantity
```

**Mathematical definition:** `Agg_↑(v, τ) = Σ_{c ∈ Categories(v)} (Σ_{p ∈ P(c), type(p) = τ} p.q)`

#### `aggregateDown`
Aggregate potentials downward through participant relationships.

```haskell
aggregateDown :: Graph -> Potentials -> EntityId -> PotentialType -> SignedQuantity
```

**Mathematical definition:** `Agg_↓(c, τ) = Σ_{v ∈ Participants(c)} (Σ_{p ∈ P(v), type(p) = τ} p.q)`

---

## Module: Commons.Allocate

### The Unified Flow Equation

#### `allocate`
Perform proportional allocation from a source to eligible recipients.

```haskell
allocate :: Graph
         -> Potentials
         -> EntityId        -- Provider
         -> PotentialType   -- Type to allocate
         -> Constraint      -- Eligibility constraint
         -> Weight          -- Preference function
         -> Map EntityId SignedQuantity
```

**Mathematical definition:**
```
Flow(s, r, τ) = min(capacity · w(r)/Σw(r'), need, C(r))
```

**Example:**
```haskell
import Commons.Constraint (noConstraint)
import Commons.Weight (needWeight)

allocations = allocate
  graph
  potentials
  "kitchen"           -- Provider
  "meals"             -- Type
  noConstraint        -- No constraints
  needWeight          -- Weight by need
```

#### `allocateMultiTier`
Allocate across multiple tiers with priorities.

```haskell
allocateMultiTier :: Graph
                  -> Potentials
                  -> EntityId
                  -> PotentialType
                  -> [Tier]
                  -> Map EntityId (Map Int SignedQuantity)
```

**Example:**
```haskell
let tiers = 
      [ Tier 1 highPriorityConstraint needWeight "High Priority"
      , Tier 2 mediumPriorityConstraint needWeight "Medium Priority"
      , Tier 3 noConstraint needWeight "Everyone Else"
      ]

allocations = allocateMultiTier graph potentials "kitchen" "meals" tiers
```

---

## Module: Commons.Constraint

### Basic Constraints

#### `noConstraint`
Allow all recipients (no limit).

```haskell
noConstraint :: Constraint
```

#### `exclude`
Exclude all recipients.

```haskell
exclude :: Constraint
```

#### `capAt`
Cap allocation at a specific value.

```haskell
capAt :: Double -> Constraint
```

```haskell
-- Example: Cap each recipient at 10 meals
capAt 10.0
```

#### `capAtPercent`
Cap allocation at a percentage of source capacity.

```haskell
capAtPercent :: Double -> Constraint
```

```haskell
-- Example: Cap each recipient at 20% of total capacity
capAtPercent 0.2
```

#### `hasPotential`
Only include recipients with a specific potential type.

```haskell
hasPotential :: PotentialType -> Constraint
```

### Constraint Combinators

#### `(.∧.)`
Combine constraints (take tightest limit).

```haskell
(.∧.) :: Constraint -> Constraint -> Constraint
```

```haskell
-- Example: Cap at 10 AND must have "meals" potential
let constraint = capAt 10.0 .∧. hasPotential "meals"
```

#### `tightest`
Select the tightest of multiple constraints.

```haskell
tightest :: [Constraint] -> Constraint
```

### Filter Compatibility

#### `fromFilter`
Convert a boolean filter to a constraint.

```haskell
fromFilter :: Filter -> Constraint
```

#### `asFilter`
Convert a constraint to a boolean filter (loses graduated information).

```haskell
asFilter :: Constraint -> Filter
```

---

## Module: Commons.Weight

### Basic Weights

#### `unitWeight`
Equal weight for all recipients.

```haskell
unitWeight :: Weight
```

```haskell
-- Example: Everyone gets equal share
allocate graph pots provider ptype noConstraint unitWeight
```

#### `needWeight`
Weight proportional to need (sink magnitude).

```haskell
needWeight :: Weight
```

```haskell
-- Example: Allocate proportionally to need
-- Alice needs 20, Bob needs 30 → Alice gets 40%, Bob gets 60%
allocate graph pots provider ptype noConstraint needWeight
```

#### `capacityWeight`
Weight proportional to capacity of a specific potential type.

```haskell
capacityWeight :: PotentialType -> Weight
```

```haskell
-- Example: Weight by reputation
allocate graph pots provider ptype noConstraint (capacityWeight "reputation")
```

#### `satisfactionWeighted`
Weight by recognition × reputation (Mutual Satisfaction formula).

```haskell
satisfactionWeighted :: Weight
```

```haskell
-- Example: Social allocation
-- Combines recognition and reputation for weighted distribution
allocate graph pots provider ptype noConstraint satisfactionWeighted
```

### Weight Combinators

#### `(.*.)` - Multiply
Multiply two weight functions.

```haskell
(.*.) :: Weight -> Weight -> Weight
```

```haskell
-- Example: Weight by need AND reputation
let weight = needWeight .*. capacityWeight "reputation"
```

#### `(.+.)` - Add
Add two weight functions.

```haskell
(.+.) :: Weight -> Weight -> Weight
```

#### `scaleWeight`
Scale a weight by a constant.

```haskell
scaleWeight :: Double -> Weight -> Weight
```

```haskell
-- Example: Give 2x weight to need
scaleWeight 2.0 needWeight
```

---

## Module: Commons.Monad

### The Commons Monad

A monadic interface with automatic state threading and history accumulation.

```haskell
newtype CommonsM a = CommonsM
  { unCommonsM :: StateT Commons (WriterT [AllocationRecord] IO) a
  }
```

### Running the Monad

#### `runCommonsM`
Run and get result, final state, and history.

```haskell
runCommonsM :: CommonsM a -> Commons -> IO (a, Commons, [AllocationRecord])
```

#### `evalCommonsM`
Run and get result and final state.

```haskell
evalCommonsM :: CommonsM a -> Commons -> IO (a, Commons)
```

#### `execCommonsM`
Run and get only final state.

```haskell
execCommonsM :: CommonsM a -> Commons -> IO Commons
```

### Monadic Operations

#### `addVertexM`
Add a vertex to the graph.

```haskell
addVertexM :: EntityId -> CommonsM ()
```

#### `addMembershipM`
Add a membership edge (member → parent).

```haskell
addMembershipM :: EntityId -> EntityId -> CommonsM ()
```

#### `addPotentialM`
Add a potential to a vertex.

```haskell
addPotentialM :: EntityId -> Potential -> CommonsM ()
```

#### `performAllocationM`
Perform allocation and automatically record it.

```haskell
performAllocationM :: EntityId        -- Provider
                   -> PotentialType   -- Type
                   -> Constraint      -- Constraint
                   -> Weight          -- Weight
                   -> Text            -- Constraint description
                   -> Text            -- Weight description
                   -> CommonsM (Map EntityId SignedQuantity)
```

**Example:**
```haskell
example :: CommonsM ()
example = do
  addVertexM "kitchen"
  addVertexM "alice"
  addMembershipM "alice" "kitchen"
  
  addPotentialM "kitchen" $ Potential "meals" 100 Nothing Nothing mempty
  addPotentialM "alice" $ Potential "meals" (-20) Nothing Nothing mempty
  
  allocations <- performAllocationM
    "kitchen"
    "meals"
    noConstraint
    needWeight
    "no constraint"
    "proportional to need"
  
  liftIO $ print allocations
```

### Query Operations

#### `getGraph` / `getPotentials` / `getHistory` / `getCommons`
Query current state.

```haskell
getGraph      :: CommonsM Graph
getPotentials :: CommonsM Potentials
getHistory    :: CommonsM History
getCommons    :: CommonsM Commons
```

---

## Module: Commons.Graph

### Graph Operations

#### `addVertex`
Add a vertex to the graph.

```haskell
addVertex :: EntityId -> Graph -> Graph
```

#### `addEdge`
Add a membership edge: `member → parent`.

```haskell
addEdge :: EntityId -> EntityId -> Graph -> Graph
```

### Graph Queries

#### `types`
Get all types an entity is a member of.

```haskell
types :: Graph -> EntityId -> Set EntityId
```

**Mathematical definition:** `Types(e) = {t ∈ V | (e,t) ∈ E}`

#### `members`
Get all members of a type.

```haskell
members :: Graph -> EntityId -> Set EntityId
```

**Mathematical definition:** `Members(t) = {e ∈ V | (e,t) ∈ E}`

#### `ancestors`
Get transitive closure of types (all ancestors).

```haskell
ancestors :: Graph -> EntityId -> Set EntityId
```

#### `descendants`
Get transitive closure of members (all descendants).

```haskell
descendants :: Graph -> EntityId -> Set EntityId
```

---

## Complete Example

```haskell
{-# LANGUAGE OverloadedStrings #-}

import Commons.Types
import Commons.Monad
import Commons.Constraint
import Commons.Weight
import qualified Data.Map as Map

main :: IO ()
main = do
  (allocations, finalCommons, records) <- runCommonsM example emptyCommons
  
  putStrLn "Allocations:"
  mapM_ print (Map.toList allocations)
  
  putStrLn $ "\nRecords: " ++ show (length records)

example :: CommonsM (Map EntityId SignedQuantity)
example = do
  -- Create entities
  addVertexM "kitchen"
  addVertexM "alice"
  addVertexM "bob"
  
  -- Set up relationships
  addMembershipM "alice" "kitchen"
  addMembershipM "bob" "kitchen"
  
  -- Add capacities and needs
  addPotentialM "kitchen" $ Potential
    { potentialType = "meals"
    , magnitude = 100
    , unit = Just "meals/week"
    , resourceType = Just "food"
    , metadata = mempty
    }
  
  addPotentialM "alice" $ Potential
    { potentialType = "meals"
    , magnitude = -20  -- Alice needs 20 meals
    , unit = Just "meals/week"
    , resourceType = Just "food"
    , metadata = mempty
    }
  
  addPotentialM "bob" $ Potential
    { potentialType = "meals"
    , magnitude = -30  -- Bob needs 30 meals
    , unit = Just "meals/week"
    , resourceType = Just "food"
    , metadata = mempty
    }
  
  -- Allocate proportionally to need
  performAllocationM
    "kitchen"
    "meals"
    noConstraint
    needWeight
    "no constraint"
    "proportional to need"
```

**Output:**
```
Allocations:
("alice", 20.0)
("bob", 30.0)

Records: 1
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
- Can't allocate from a sink (checked at runtime via `isSource`)
- Constraints and weights are type-safe functions
- History is immutable

### 4. **Domain Alignment**
Code uses domain terminology from `commons.tex`:
- `capacityOf` / `needOf` instead of `abs (magnitude p)`
- `isSource` / `isSink` instead of `magnitude p > 0`
- Clear, intuitive naming throughout

---

## Further Reading

- **Mathematical Formalism**: See `commons.tex` for complete mathematical definitions
- **Examples**: See `app/Main.hs` for working examples
- **Terminology**: See `TERMINOLOGY.md` for design rationale
- **Refactoring**: See `REFACTORING_SUMMARY.md` for recent improvements

---

## License

MIT
