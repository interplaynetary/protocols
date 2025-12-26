# Commons Quick Reference

> **Common patterns and recipes for the Commons library**

---

## Table of Contents

- [Basic Allocation](#basic-allocation)
- [Weighted Allocation](#weighted-allocation)
- [Constrained Allocation](#constrained-allocation)
- [Multi-Tier Allocation](#multi-tier-allocation)
- [Working with Potentials](#working-with-potentials)
- [Custom Constraints](#custom-constraints)
- [Custom Weights](#custom-weights)

---

## Basic Allocation

### Equal Distribution

```haskell
import Commons.Constraint (noConstraint)
import Commons.Weight (unitWeight)

-- Everyone gets equal share
allocations = allocate graph pots provider ptype noConstraint unitWeight
```

### Proportional to Need

```haskell
import Commons.Constraint (noConstraint)
import Commons.Weight (needWeight)

-- Allocate proportionally to need
-- If Alice needs 20 and Bob needs 30, Alice gets 40% and Bob gets 60%
allocations = allocate graph pots provider ptype noConstraint needWeight
```

---

## Weighted Allocation

### By Reputation

```haskell
import Commons.Weight (capacityWeight)

-- Weight by reputation potential
allocations = allocate graph pots provider ptype noConstraint 
                (capacityWeight "reputation")
```

### By Recognition × Reputation (Mutual Satisfaction)

```haskell
import Commons.Weight (satisfactionWeighted)

-- Social allocation using MS formula
allocations = allocate graph pots provider ptype noConstraint 
                satisfactionWeighted
```

### Custom Combination

```haskell
import Commons.Weight (needWeight, capacityWeight, (.*.), scaleWeight)

-- Weight by need, scaled by reputation, with 2x multiplier
let weight = scaleWeight 2.0 (needWeight .*. capacityWeight "reputation")
allocations = allocate graph pots provider ptype noConstraint weight
```

---

## Constrained Allocation

### Cap Per Recipient

```haskell
import Commons.Constraint (capAt)

-- No one gets more than 10 units
allocations = allocate graph pots provider ptype (capAt 10.0) needWeight
```

### Percentage Cap

```haskell
import Commons.Constraint (capAtPercent)

-- No one gets more than 20% of total capacity
allocations = allocate graph pots provider ptype (capAtPercent 0.2) needWeight
```

### Require Specific Potential

```haskell
import Commons.Constraint (hasPotential)

-- Only allocate to entities with "meals" potential
allocations = allocate graph pots provider ptype 
                (hasPotential "meals") needWeight
```

### Combined Constraints

```haskell
import Commons.Constraint (capAt, hasPotential, (.∧.))

-- Cap at 10 AND must have "meals" potential
let constraint = capAt 10.0 .∧. hasPotential "meals"
allocations = allocate graph pots provider ptype constraint needWeight
```

---

## Multi-Tier Allocation

### Priority-Based

```haskell
import Commons.Types (Tier(..))
import Commons.Constraint (hasPotential, noConstraint)
import Commons.Weight (needWeight)

let tiers = 
      [ Tier 1 (hasPotential "priority") needWeight "High Priority"
      , Tier 2 (hasPotential "member") needWeight "Members"
      , Tier 3 noConstraint needWeight "Everyone Else"
      ]

allocations = allocateMultiTier graph pots provider ptype tiers
```

### Graduated Caps

```haskell
import Commons.Constraint (capAt)

let tiers =
      [ Tier 1 (capAt 20.0) needWeight "Tier 1: Max 20"
      , Tier 2 (capAt 10.0) needWeight "Tier 2: Max 10"
      , Tier 3 (capAt 5.0) needWeight "Tier 3: Max 5"
      ]

allocations = allocateMultiTier graph pots provider ptype tiers
```

---

## Working with Potentials

### Creating Potentials

```haskell
-- Source (capacity)
sourcePotential = Potential
  { potentialType = "meals"
  , magnitude = 100          -- Positive = capacity
  , unit = Just "meals/week"
  , resourceType = Just "food"
  , metadata = mempty
  }

-- Sink (need)
sinkPotential = Potential
  { potentialType = "meals"
  , magnitude = -20          -- Negative = need
  , unit = Just "meals/week"
  , resourceType = Just "food"
  , metadata = mempty
  }
```

### Checking Potential Direction

```haskell
import Commons.Potential (isSource, isSink, capacityOf, needOf)

if isSource potential then
  putStrLn $ "Has capacity: " ++ show (capacityOf potential)
else if isSink potential then
  putStrLn $ "Has need: " ++ show (needOf potential)
else
  putStrLn "At equilibrium"
```

### Aggregating Potentials

```haskell
import Commons.Potential (aggregateUp, aggregateDown)

-- Aggregate capacity upward through categories
totalCapacity = aggregateUp graph pots entityId "meals"

-- Aggregate needs downward through participants
totalNeed = aggregateDown graph pots entityId "meals"
```

---

## Custom Constraints

### Range Constraint

```haskell
import Commons.Constraint (Limit(..), Constraint)
import Commons.Potential (needOf, getPotential)

-- Only allocate to entities with need in range [min, max]
needInRange :: Double -> Double -> Constraint
needInRange minNeed maxNeed = \ctx ->
  case getPotential (fcPotentials ctx) (fcEntity ctx) (wcPotentialType ctx) of
    Just p ->
      let need = needOf p
      in if need >= minNeed && need <= maxNeed
         then NoLimit
         else Exclude
    Nothing -> Exclude
```

### Attribute-Based Constraint

```haskell
-- Only allocate to entities with specific metadata
hasAttribute :: Text -> Text -> Constraint
hasAttribute key value = \ctx ->
  case getPotential (fcPotentials ctx) (fcEntity ctx) (wcPotentialType ctx) of
    Just p ->
      case Map.lookup key (metadata p) of
        Just v | v == value -> NoLimit
        _ -> Exclude
    Nothing -> Exclude
```

### Geographic Constraint

```haskell
-- Cap based on distance from source
distanceCap :: (EntityId -> EntityId -> Double) -> Double -> Constraint
distanceCap distanceFn maxDistance = \ctx ->
  let distance = distanceFn (fcEntity ctx) sourceEntity
  in if distance <= maxDistance
     then NoLimit
     else Exclude
```

---

## Custom Weights

### Inverse Distance Weight

```haskell
import Commons.Types (Weight)

-- Weight inversely proportional to distance
inverseDistance :: (EntityId -> EntityId -> Double) -> Weight
inverseDistance distanceFn = \ctx ->
  let distance = distanceFn (wcEntity ctx) sourceEntity
  in if distance > 0
     then 1.0 / distance
     else 0.0
```

### Tiered Weight

```haskell
-- Different weights for different tiers
tieredWeight :: Map EntityId Double -> Weight
tieredWeight tierWeights = \ctx ->
  Map.findWithDefault 1.0 (wcEntity ctx) tierWeights
```

### Time-Based Weight

```haskell
import Data.Time (UTCTime, diffUTCTime)

-- Weight by how long entity has been waiting
waitingTime :: Map EntityId UTCTime -> UTCTime -> Weight
waitingTime joinTimes currentTime = \ctx ->
  case Map.lookup (wcEntity ctx) joinTimes of
    Just joinTime ->
      let seconds = diffUTCTime currentTime joinTime
      in realToFrac seconds
    Nothing -> 0.0
```

### Composite Weight

```haskell
-- Combine multiple factors
compositeWeight :: Weight
compositeWeight = \ctx ->
  let need = needWeight ctx
      reputation = capacityWeight "reputation" ctx
      priority = capacityWeight "priority" ctx
  in need * reputation * (1.0 + priority)
```

---

## Monadic Patterns

### Building a Commons Step-by-Step

```haskell
buildCommons :: CommonsM ()
buildCommons = do
  -- Add entities
  addVertexM "org"
  addVertexM "alice"
  addVertexM "bob"
  
  -- Set up hierarchy
  addMembershipM "alice" "org"
  addMembershipM "bob" "org"
  
  -- Add potentials
  addPotentialM "org" $ Potential "budget" 1000 Nothing Nothing mempty
  addPotentialM "alice" $ Potential "budget" (-300) Nothing Nothing mempty
  addPotentialM "bob" $ Potential "budget" (-500) Nothing Nothing mempty
```

### Querying State

```haskell
checkState :: CommonsM ()
checkState = do
  commons <- getCommons
  history <- getHistory
  
  liftIO $ putStrLn $ "Entities: " ++ show (Set.size $ vertices $ graph commons)
  liftIO $ putStrLn $ "Allocations: " ++ show (length history)
```

### Conditional Allocation

```haskell
conditionalAllocation :: CommonsM ()
conditionalAllocation = do
  pots <- getPotentials
  
  -- Only allocate if total need exceeds threshold
  let totalNeed = sum [needOf p | ps <- Map.elems pots, p <- ps]
  
  when (totalNeed > 100) $ do
    allocations <- performAllocationM
      "provider" "resource" noConstraint needWeight
      "no constraint" "proportional"
    
    liftIO $ print allocations
```

---

## Common Patterns

### Kitchen Allocation

```haskell
-- Allocate meals from kitchen to members
kitchenAllocation :: CommonsM (Map EntityId SignedQuantity)
kitchenAllocation = do
  addVertexM "kitchen"
  addVertexM "alice"
  addVertexM "bob"
  
  addMembershipM "alice" "kitchen"
  addMembershipM "bob" "kitchen"
  
  addPotentialM "kitchen" $ Potential "meals" 100 Nothing Nothing mempty
  addPotentialM "alice" $ Potential "meals" (-20) Nothing Nothing mempty
  addPotentialM "bob" $ Potential "meals" (-30) Nothing Nothing mempty
  
  performAllocationM "kitchen" "meals" noConstraint needWeight
    "no constraint" "proportional to need"
```

### Budget Distribution

```haskell
-- Distribute budget across departments
budgetDistribution :: CommonsM (Map EntityId SignedQuantity)
budgetDistribution = do
  addVertexM "company"
  addVertexM "engineering"
  addVertexM "marketing"
  
  addMembershipM "engineering" "company"
  addMembershipM "marketing" "company"
  
  addPotentialM "company" $ Potential "budget" 100000 Nothing Nothing mempty
  addPotentialM "engineering" $ Potential "budget" (-60000) Nothing Nothing mempty
  addPotentialM "marketing" $ Potential "budget" (-40000) Nothing Nothing mempty
  
  performAllocationM "company" "budget" noConstraint needWeight
    "no constraint" "proportional to need"
```

### Tutoring Hours

```haskell
-- Allocate tutoring hours based on recognition and reputation
tutoringAllocation :: CommonsM (Map EntityId SignedQuantity)
tutoringAllocation = do
  addVertexM "tutor"
  addVertexM "alice"
  addVertexM "bob"
  
  addMembershipM "alice" "tutor"
  addMembershipM "bob" "tutor"
  
  -- Tutor has 20 hours capacity
  addPotentialM "tutor" $ Potential "tutoring" 20 Nothing Nothing mempty
  
  -- Alice needs 10 hours, has high recognition
  addPotentialM "alice" $ Potential "tutoring" (-10) Nothing Nothing mempty
  addPotentialM "alice" $ Potential "recognition" 0.6 Nothing Nothing mempty
  addPotentialM "alice" $ Potential "reputation" 1.2 Nothing Nothing mempty
  
  -- Bob needs 10 hours, has lower recognition
  addPotentialM "bob" $ Potential "tutoring" (-10) Nothing Nothing mempty
  addPotentialM "bob" $ Potential "recognition" 0.4 Nothing Nothing mempty
  addPotentialM "bob" $ Potential "reputation" 0.8 Nothing Nothing mempty
  
  performAllocationM "tutor" "tutoring" noConstraint satisfactionWeighted
    "no constraint" "recognition × reputation"
```

---

## Debugging Tips

### Print Allocations

```haskell
import qualified Data.Map as Map

printAllocations :: Map EntityId SignedQuantity -> IO ()
printAllocations allocs = do
  putStrLn "Allocations:"
  mapM_ (\(eid, qty) -> putStrLn $ "  " ++ show eid ++ ": " ++ show qty)
        (Map.toList allocs)
```

### Check Potential Direction

```haskell
checkPotential :: Potential -> IO ()
checkPotential p = do
  putStrLn $ "Type: " ++ show (potentialType p)
  putStrLn $ "Magnitude: " ++ show (magnitude p)
  putStrLn $ "Is source: " ++ show (isSource p)
  putStrLn $ "Is sink: " ++ show (isSink p)
  putStrLn $ "Capacity: " ++ show (capacityOf p)
  putStrLn $ "Need: " ++ show (needOf p)
```

### Trace Constraint Evaluation

```haskell
traceConstraint :: Constraint -> FilterContext -> IO Limit
traceConstraint c ctx = do
  let limit = c ctx
  putStrLn $ "Entity: " ++ show (fcEntity ctx)
  putStrLn $ "Limit: " ++ show limit
  return limit
```

---

## Performance Tips

1. **Use strict maps**: `Data.Map.Strict` is already used throughout
2. **Batch operations**: Use the monadic interface to batch multiple operations
3. **Avoid redundant aggregations**: Cache aggregation results when possible
4. **Profile constraints**: Complex constraints can be expensive - profile before optimizing

---

## See Also

- **Full API Reference**: `API.md`
- **Mathematical Formalism**: `commons.tex`
- **Design Rationale**: `TERMINOLOGY.md`
- **Examples**: `app/Main.hs`
