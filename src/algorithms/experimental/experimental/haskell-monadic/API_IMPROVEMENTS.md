# API Elegance Analysis & Improvements

## Current API Strengths ✅

1. **Pure Functions** - Core allocation is pure
2. **Composable** - Constraints and weights compose naturally
3. **Type-Safe** - Leverages Haskell's type system
4. **Domain-Aligned** - Uses capacity/need terminology
5. **Monadic Interface** - Clean state management

## Potential Improvements 🎨

### 1. **Reduce Parameter Count with Configuration Types**

**Current (6 parameters):**
```haskell
allocate :: Graph 
         -> Potentials 
         -> EntityId 
         -> PotentialType 
         -> Constraint 
         -> Weight 
         -> Map EntityId SignedQuantity
```

**Proposed (cleaner):**
```haskell
-- Configuration type
data AllocationConfig = AllocationConfig
  { acProvider   :: EntityId
  , acType       :: PotentialType
  , acConstraint :: Constraint
  , acWeight     :: Weight
  }

-- Simplified signature
allocate :: Graph -> Potentials -> AllocationConfig -> Map EntityId SignedQuantity

-- Or even more elegant with a builder pattern:
allocation :: EntityId -> PotentialType -> Allocation
allocation provider ptype = Allocation
  { allocProvider = provider
  , allocType = ptype
  , allocConstraint = noConstraint
  , allocWeight = unitWeight
  }

-- Usage with lenses or record update:
allocate graph pots $ allocation "kitchen" "meals"
  { allocConstraint = capAt 10
  , allocWeight = needWeight
  }
```

**Benefits:**
- Fewer parameters to remember
- Named fields make intent clear
- Easy to add optional parameters
- Better for partial application

---

### 2. **Smart Constructors for Common Patterns**

**Current:**
```haskell
-- User has to know about noConstraint and needWeight
allocate graph pots provider ptype noConstraint needWeight
```

**Proposed:**
```haskell
-- Smart constructors for common cases
proportionalAllocation :: EntityId -> PotentialType -> Allocation
proportionalAllocation provider ptype = 
  allocation provider ptype
    { allocConstraint = noConstraint
    , allocWeight = needWeight
    }

equalAllocation :: EntityId -> PotentialType -> Allocation
equalAllocation provider ptype =
  allocation provider ptype
    { allocConstraint = noConstraint
    , allocWeight = unitWeight
    }

socialAllocation :: EntityId -> PotentialType -> Allocation
socialAllocation provider ptype =
  allocation provider ptype
    { allocConstraint = noConstraint
    , allocWeight = satisfactionWeighted
    }

-- Usage:
allocate graph pots $ proportionalAllocation "kitchen" "meals"
allocate graph pots $ socialAllocation "tutor" "hours"
```

**Benefits:**
- Self-documenting
- Reduces boilerplate
- Guides users to best practices

---

### 3. **Fluent Interface with Combinators**

**Current:**
```haskell
let constraint = capAt 10.0 .∧. hasPotential "meals"
allocate graph pots provider ptype constraint needWeight
```

**Proposed:**
```haskell
-- Fluent builder
allocate graph pots $
  from "kitchen" "meals"
    & withConstraint (capAt 10.0)
    & withConstraint (hasPotential "meals")
    & withWeight needWeight

-- Or even more elegant:
allocate graph pots $
  from "kitchen" "meals"
    & cappedAt 10.0
    & requiring "meals"
    & weightedBy needWeight

-- Where:
from :: EntityId -> PotentialType -> Allocation
withConstraint :: Constraint -> Allocation -> Allocation
withWeight :: Weight -> Allocation -> Allocation
cappedAt :: Double -> Allocation -> Allocation
requiring :: PotentialType -> Allocation -> Allocation
weightedBy :: Weight -> Allocation -> Allocation
```

**Benefits:**
- Reads like English
- Chainable operations
- IDE autocomplete friendly

---

### 4. **Simplified Monadic Interface**

**Current (verbose):**
```haskell
performAllocationM 
  "kitchen" 
  "meals" 
  noConstraint 
  needWeight
  "no constraint"      -- Description (redundant?)
  "proportional to need"
```

**Proposed:**
```haskell
-- Simpler: descriptions auto-generated from constraint/weight
allocateM $ from "kitchen" "meals"
  & weightedBy needWeight

-- Or with explicit description if needed:
allocateM $ from "kitchen" "meals"
  & weightedBy needWeight
  & describedAs "Custom allocation logic"

-- Auto-generated description would be:
-- "Allocating meals from kitchen with needWeight"
```

**Benefits:**
- Less redundant information
- Descriptions auto-generated when sensible
- Can override when needed

---

### 5. **Type-Level Safety for Potential Types**

**Current (stringly-typed):**
```haskell
addPotentialM "kitchen" $ Potential "meals" 100 Nothing Nothing mempty
--                                   ^^^^^^^ String - no type safety
```

**Proposed (phantom types):**
```haskell
-- Define potential types at type level
data Meals
data Hours
data Budget

-- Type-safe potentials
class PotentialType a where
  potentialName :: Proxy a -> Text

instance PotentialType Meals where
  potentialName _ = "meals"

-- Usage:
addPotentialM @Meals "kitchen" $ capacity 100
addPotentialM @Meals "alice" $ need 20

-- Type-safe allocation
allocateM @Meals $ from "kitchen"
  & weightedBy needWeight
```

**Benefits:**
- Compile-time safety
- Can't mix incompatible types
- Better IDE support

---

### 6. **Lens-Based Access**

**Current:**
```haskell
let g = graph commons
let p = potentials commons
```

**Proposed:**
```haskell
import Control.Lens

-- Define lenses
graph :: Lens' Commons Graph
potentials :: Lens' Commons Potentials
history :: Lens' Commons History

-- Usage:
commons ^. graph
commons & graph %~ addVertex "alice"
commons & potentials . at "alice" ?~ [potential]
```

**Benefits:**
- Composable updates
- Standard Haskell idiom
- Powerful combinators

---

### 7. **Operator Overloading for Common Operations**

**Current:**
```haskell
constraint = capAt 10.0 .∧. hasPotential "meals"
weight = needWeight .*. capacityWeight "reputation"
```

**Proposed (keep current, but add alternatives):**
```haskell
-- Keep .∧. and .*. but also support:
constraint = capAt 10.0 <> hasPotential "meals"  -- Monoid instance
weight = needWeight * capacityWeight "reputation" -- Num instance?

-- Or use standard operators:
constraint = capAt 10.0 `and` hasPotential "meals"
weight = needWeight `times` capacityWeight "reputation"
```

**Benefits:**
- More familiar to Haskellers
- Leverage existing type classes

---

### 8. **Result Type Instead of Map**

**Current:**
```haskell
allocate :: ... -> Map EntityId SignedQuantity
```

**Proposed:**
```haskell
data AllocationResult = AllocationResult
  { arAllocations :: Map EntityId SignedQuantity
  , arTotalAllocated :: SignedQuantity
  , arUnallocated :: SignedQuantity
  , arRecipientCount :: Int
  , arMetadata :: Map Text Text
  }

allocate :: ... -> AllocationResult
```

**Benefits:**
- More information available
- Can add metadata without breaking API
- Self-documenting

---

### 9. **Validation and Error Handling**

**Current (silent failures):**
```haskell
allocate g pots provider ptype c w
-- Returns empty map if provider doesn't exist
```

**Proposed (explicit errors):**
```haskell
data AllocationError
  = ProviderNotFound EntityId
  | NoSourcePotential EntityId PotentialType
  | InvalidConstraint Text
  | InvalidWeight Text

allocate :: ... -> Either AllocationError AllocationResult

-- Or in monadic context:
allocateM :: ... -> CommonsM (Either AllocationError AllocationResult)
-- Or use ExceptT:
allocateM :: ... -> ExceptT AllocationError CommonsM AllocationResult
```

**Benefits:**
- Explicit error handling
- Better debugging
- Type-safe failure modes

---

### 10. **Streaming/Incremental Allocation**

**Current (all at once):**
```haskell
allocate :: ... -> Map EntityId SignedQuantity
```

**Proposed (streaming):**
```haskell
import Streaming
import qualified Streaming.Prelude as S

-- Stream allocations one at a time
allocateStream :: ... -> Stream (Of (EntityId, SignedQuantity)) CommonsM ()

-- Usage:
S.mapM_ print $ allocateStream graph pots config
```

**Benefits:**
- Memory efficient for large allocations
- Can process incrementally
- Composable with other streams

---

## Recommended Implementation Priority

### Phase 1: Low-Hanging Fruit (High Impact, Low Effort)

1. **Smart Constructors** ⭐⭐⭐
   ```haskell
   proportionalAllocation :: EntityId -> PotentialType -> Allocation
   equalAllocation :: EntityId -> PotentialType -> Allocation
   socialAllocation :: EntityId -> PotentialType -> Allocation
   ```
   - Easy to add
   - Immediate usability improvement
   - Backward compatible

2. **Result Type** ⭐⭐⭐
   ```haskell
   data AllocationResult = AllocationResult { ... }
   ```
   - More informative
   - Easy to extend
   - Can keep old function for compatibility

3. **Auto-Generated Descriptions** ⭐⭐
   ```haskell
   -- Remove redundant description parameters
   -- Generate from constraint/weight Show instances
   ```

### Phase 2: Medium Effort, High Value

4. **Configuration Type** ⭐⭐⭐
   ```haskell
   data AllocationConfig = AllocationConfig { ... }
   ```
   - Cleaner API
   - More extensible
   - Breaking change (needs migration)

5. **Fluent Interface** ⭐⭐
   ```haskell
   from "kitchen" "meals" & cappedAt 10 & weightedBy needWeight
   ```
   - Very elegant
   - Great UX
   - Requires some design work

### Phase 3: Advanced Features

6. **Error Handling** ⭐⭐
   ```haskell
   Either AllocationError AllocationResult
   ```
   - Better debugging
   - More robust
   - Breaking change

7. **Type-Level Safety** ⭐
   ```haskell
   allocateM @Meals $ from "kitchen"
   ```
   - Compile-time safety
   - Complex implementation
   - May be overkill

8. **Lenses** ⭐
   - Standard Haskell
   - Adds dependency
   - Optional enhancement

---

## Concrete Proposal: Minimal Elegant API

Here's what I'd implement for maximum elegance with minimal breaking changes:

```haskell
-- 1. Add smart constructors (backward compatible)
proportional :: EntityId -> PotentialType -> Allocation
equal :: EntityId -> PotentialType -> Allocation
social :: EntityId -> PotentialType -> Allocation

-- 2. Add fluent combinators (backward compatible)
(&) :: a -> (a -> b) -> b  -- Already in Prelude
cappedAt :: Double -> Allocation -> Allocation
requiring :: PotentialType -> Allocation -> Allocation
weightedBy :: Weight -> Allocation -> Allocation

-- 3. Enhanced result type (backward compatible via conversion)
data AllocationResult = AllocationResult
  { allocations :: Map EntityId SignedQuantity
  , totalAllocated :: SignedQuantity
  , unallocated :: SignedQuantity
  }

toMap :: AllocationResult -> Map EntityId SignedQuantity
toMap = allocations

-- 4. Keep old API, add new one
allocate :: Graph -> Potentials -> EntityId -> PotentialType 
         -> Constraint -> Weight -> Map EntityId SignedQuantity

allocate' :: Graph -> Potentials -> Allocation -> AllocationResult

-- Usage:
-- Old way (still works):
allocate graph pots "kitchen" "meals" noConstraint needWeight

-- New way (more elegant):
allocate' graph pots $ 
  proportional "kitchen" "meals"
    & cappedAt 10.0
    & requiring "meals"
```

---

## Summary

The current API is already quite good! The main improvements would be:

1. **Smart constructors** for common patterns (easy win)
2. **Fluent interface** for chaining (elegant)
3. **Richer result types** (more informative)
4. **Better error handling** (more robust)

All of these can be added **without breaking existing code** by providing new functions alongside the old ones.

The key is to make the **common case trivial** while keeping the **complex case possible**.
