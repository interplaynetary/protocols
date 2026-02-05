{-# LANGUAGE OverloadedStrings #-}

-- |
-- Module      : Commons.Types
-- Description : Core type definitions for the Commons paradigm
-- Copyright   : (c) 2025
-- License     : MIT
--
-- The foundational types that directly map the mathematical formalism:
--   Commons = ⟨G, P, C, w, {Δ_t}⟩
module Commons.Types where

import Data.Map.Strict (Map)
import Data.Map.Strict qualified as Map
import Data.Set (Set)
import Data.Set qualified as Set
import Data.Text (Text)
import Data.Time (UTCTime)

-- ============================================================================
-- FOUNDATIONAL TYPES
-- ============================================================================

-- | Entity identifier (UUID in practice)
type EntityId = Text

-- | Slot name (resource type identifier)
type SlotName = Text

-- | Signed real number representing flow direction and magnitude
--   Positive = capacity (flows outward)
--   Negative = need (flows inward)
type SignedQuantity = Double

-- ============================================================================
-- GRAPH ALGEBRA: G = ⟨V, E⟩
-- ============================================================================

-- | The entity graph
--   V = vertices (entities)
--   E = edges (membership relations)
--
--   e₁ → e₂ means "e₁ is a member of e₂" or "e₂ is a type of e₁"
data Graph = Graph
  { -- | All entities in the system
    vertices :: Set EntityId,
    -- | Adjacency list: entity → {types of entity}
    edges :: Map EntityId (Set EntityId)
  }
  deriving (Show, Eq)

-- | Empty graph
emptyGraph :: Graph
emptyGraph = Graph Set.empty Map.empty

-- ============================================================================
-- POTENTIAL ALGEBRA: P(v) = {(τ, q, C)}
-- ============================================================================

-- | A potential represents a flow gradient with direction and magnitude
--   The sign indicates direction:
--     + = source potential (flows outward)
--     - = sink potential (flows inward)
--     0 = equilibrium
data Potential = Potential
  { -- | Type of flow (what can flow)
    potentialType :: PotentialType,
    -- | Signed magnitude (direction + intensity)
    magnitude :: SignedQuantity,
    -- | Optional unit of measurement
    unit :: Maybe Text,
    -- | Optional resource category
    resourceType :: Maybe Text,
    -- | Additional constraints and properties
    metadata :: Map Text Text
  }
  deriving (Show, Eq)

-- | Potential type identifier
--   In the mathematical formalism: τ ∈ N (types are nodes)
--   This enables types to be first-class entities with their own:
--     - Categories (type hierarchies)
--     - Potentials (meta-properties and flows)
--     - Participants (instances of this type)
type PotentialType = EntityId

-- | Potential collection for all vertices
--   Maps vertex ID to its potentials
type Potentials = Map EntityId [Potential]

-- | Empty potentials
emptyPotentials :: Potentials
emptyPotentials = Map.empty

-- ============================================================================
-- FILTER ALGEBRA: Φ: Entity → Bool
-- ============================================================================

-- | Attribute constraint for filtering
data AttributeConstraint
  = MinValue Double
  | MaxValue Double
  | InValues [Double]
  | CustomPredicate (Double -> Bool)

-- | Filter context: all information available for filtering
data FilterContext = FilterContext
  { fcGraph :: Graph,
    fcPotentials :: Potentials,
    fcEntity :: EntityId,
    -- | Optional source capacity for percentage-based constraints
    fcSourceCapacity :: Maybe SignedQuantity
  }
  deriving (Show, Eq)

-- | Filter function: determines if entity is eligible
--   Φ: Entity → Bool
type Filter = FilterContext -> Bool

-- ============================================================================
-- CONSTRAINT ALGEBRA: C: Entity → ℝ≥0 ∪ {∞}
-- ============================================================================

-- | Limit on flow to a vertex
data Limit
  = -- | ∞ (no constraint)
    NoLimit
  | -- | 0 (total exclusion)
    Exclude
  | -- | k (cap at specific value)
    Cap Double
  deriving (Show, Eq)

-- | Ordering for limits (Exclude < Cap k < NoLimit)
instance Ord Limit where
  compare Exclude Exclude = EQ
  compare Exclude _ = LT
  compare _ Exclude = GT
  compare NoLimit NoLimit = EQ
  compare NoLimit _ = GT
  compare _ NoLimit = LT
  compare (Cap k1) (Cap k2) = compare k1 k2

-- | Constraint function: returns limit for each vertex
--   C: Entity → ℝ≥0 ∪ {∞}
--   Constraints generalize filters by allowing graduated limits
type Constraint = FilterContext -> Limit

-- ============================================================================
-- WEIGHT ALGEBRA: w: Entity → ℝ
-- ============================================================================

-- | Weight context: all information available for weighting
data WeightContext = WeightContext
  { wcGraph :: Graph,
    wcPotentials :: Potentials,
    wcEntity :: EntityId,
    wcPotentialType :: PotentialType
  }
  deriving (Show, Eq)

-- | Weight function: assigns preference weight to entity
--   w: Entity → ℝ
type Weight = WeightContext -> Double

-- ============================================================================
-- HISTORY ALGEBRA: {Δ_t}
-- ============================================================================

-- | Allocation record: immutable event
--   Δ_t = record of what happened at time t
data AllocationRecord = AllocationRecord
  { arTimestamp :: UTCTime,
    arProvider :: EntityId,
    arPotentialType :: PotentialType,
    -- | Recipient → allocated quantity
    arAllocations :: Map EntityId SignedQuantity,
    -- | Description of filter used
    arFilter :: Text,
    -- | Description of weight function used
    arWeight :: Text,
    arMetadata :: Map Text Text
  }
  deriving (Show, Eq)

-- | Allocation history: append-only log
type History = [AllocationRecord]

-- | Empty history
emptyHistory :: History
emptyHistory = []

-- ============================================================================
-- COMPLETE SYSTEM: ⟨G, P, C, w, {Δ_t}⟩
-- ============================================================================

-- | The complete Commons system
data Commons = Commons
  { -- | G: Entity/type graph
    graph :: Graph,
    -- | P: Flow potentials (source/sink gradients)
    potentials :: Potentials,
    -- | {Δ_t}: Immutable allocation records
    history :: History
  }
  deriving (Show, Eq)

-- | Empty commons
emptyCommons :: Commons
emptyCommons = Commons emptyGraph emptyPotentials emptyHistory

-- ============================================================================
-- HELPER TYPES
-- ============================================================================

-- | Allocation result for a single entity
type Allocation = (EntityId, SignedQuantity)

-- | Configuration for allocation
data AllocationConfig = AllocationConfig
  { acProvider :: EntityId,
    acType :: PotentialType,
    acConstraint :: Constraint,
    acWeight :: Weight
  }

-- | Result of an allocation with metadata
data AllocationResult = AllocationResult
  { resultAllocations :: Map EntityId SignedQuantity,
    resultTotalAllocated :: SignedQuantity,
    resultUnallocated :: SignedQuantity,
    resultRecipientCount :: Int
  }
  deriving (Show, Eq)

-- | Tier configuration for multi-tier allocation
data Tier = Tier
  { -- | Lower priority allocated first
    tierPriority :: Int,
    -- | Constraint for this tier
    tierConstraint :: Constraint,
    -- | Preference function for this tier
    tierWeight :: Weight,
    -- | Human-readable label
    tierLabel :: Text
  }
