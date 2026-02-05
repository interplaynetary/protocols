{-# LANGUAGE OverloadedStrings #-}

-- |
-- Module      : Commons.Allocation
-- Description : Elegant allocation API with smart constructors and fluent interface
-- Copyright   : (c) 2025
-- License     : MIT
--
-- This module provides a more elegant API for allocations through:
-- - Smart constructors for common patterns
-- - Fluent interface for building configurations
-- - Richer result types with metadata
--
-- Example:
-- @
-- import Commons.Allocation
--
-- -- Simple proportional allocation
-- result <- allocateWith graph pots $ proportional "kitchen" "meals"
--
-- -- With constraints and custom weights
-- result <- allocateWith graph pots $
--   from "kitchen" "meals"
--     & cappedAt 10.0
--     & requiring "meals"
--     & weightedBy needWeight
-- @
module Commons.Allocation
  ( -- * Configuration builders
    AllocationConfig (..),
    from,
    proportional,
    equal,
    social,

    -- * Fluent combinators
    cappedAt,
    cappedAtPercent,
    requiring,
    weightedBy,
    withConstraint,
    withWeight,

    -- * Allocation functions
    allocateWith,
    allocateWith',

    -- * Result type
    AllocationResult (..),
    toMap,
  )
where

import Commons.Allocate (allocate)
import Commons.Constraint (Constraint, capAt, capAtPercent, hasPotential, noConstraint)
import Commons.Potential (capacityOf, getPotential)
import Commons.Types (AllocationConfig (..), AllocationResult (..), EntityId, Graph, PotentialType, Potentials, SignedQuantity, Weight)
import Commons.Weight (needWeight, satisfactionWeighted, unitWeight)
import Data.Map.Strict (Map)
import Data.Map.Strict qualified as Map

-- ============================================================================
-- SMART CONSTRUCTORS
-- ============================================================================

-- | Create an allocation configuration
from :: EntityId -> PotentialType -> AllocationConfig
from provider ptype =
  AllocationConfig
    { acProvider = provider,
      acType = ptype,
      acConstraint = noConstraint,
      acWeight = unitWeight
    }

-- | Proportional allocation (weighted by need)
proportional :: EntityId -> PotentialType -> AllocationConfig
proportional provider ptype =
  AllocationConfig
    { acProvider = provider,
      acType = ptype,
      acConstraint = noConstraint,
      acWeight = needWeight
    }

-- | Equal allocation (everyone gets same share)
equal :: EntityId -> PotentialType -> AllocationConfig
equal provider ptype =
  AllocationConfig
    { acProvider = provider,
      acType = ptype,
      acConstraint = noConstraint,
      acWeight = unitWeight
    }

-- | Social allocation (weighted by recognition × reputation)
social :: EntityId -> PotentialType -> AllocationConfig
social provider ptype =
  AllocationConfig
    { acProvider = provider,
      acType = ptype,
      acConstraint = noConstraint,
      acWeight = satisfactionWeighted
    }

-- ============================================================================
-- FLUENT COMBINATORS
-- ============================================================================

-- | Cap allocation at a specific value
cappedAt :: Double -> AllocationConfig -> AllocationConfig
cappedAt limit config = config {acConstraint = capAt limit}

-- | Cap allocation at a percentage of source capacity
cappedAtPercent :: Double -> AllocationConfig -> AllocationConfig
cappedAtPercent pct config = config {acConstraint = capAtPercent pct}

-- | Require recipients to have a specific potential type
requiring :: PotentialType -> AllocationConfig -> AllocationConfig
requiring ptype config = config {acConstraint = hasPotential ptype}

-- | Set the weight function
weightedBy :: Weight -> AllocationConfig -> AllocationConfig
weightedBy weight config = config {acWeight = weight}

-- | Add a constraint (replaces existing)
withConstraint :: Constraint -> AllocationConfig -> AllocationConfig
withConstraint constraint config = config {acConstraint = constraint}

-- | Set the weight function (alias for weightedBy)
withWeight :: Weight -> AllocationConfig -> AllocationConfig
withWeight = weightedBy

-- ============================================================================
-- ALLOCATION FUNCTIONS
-- ============================================================================

-- | Allocate using a configuration, returning a rich result
allocateWith :: Graph -> Potentials -> AllocationConfig -> AllocationResult
allocateWith graph pots config =
  let allocations =
        allocate
          graph
          pots
          (acProvider config)
          (acType config)
          (acConstraint config)
          (acWeight config)

      totalAllocated = sum (Map.elems allocations)

      unallocated = case getPotential pots (acProvider config) (acType config) of
        Just p -> capacityOf p - totalAllocated
        Nothing -> 0

      recipientCount = Map.size allocations
   in AllocationResult
        { resultAllocations = allocations,
          resultTotalAllocated = totalAllocated,
          resultUnallocated = unallocated,
          resultRecipientCount = recipientCount
        }

-- | Allocate using a configuration, returning just the map (backward compatible)
allocateWith' :: Graph -> Potentials -> AllocationConfig -> Map EntityId SignedQuantity
allocateWith' graph pots config = resultAllocations $ allocateWith graph pots config

-- ============================================================================
-- RESULT HELPERS
-- ============================================================================

-- | Convert AllocationResult to a simple map
toMap :: AllocationResult -> Map EntityId SignedQuantity
toMap = resultAllocations
