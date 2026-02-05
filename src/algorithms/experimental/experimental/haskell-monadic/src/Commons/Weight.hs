{-# LANGUAGE OverloadedStrings #-}

-- |
-- Module      : Commons.Weight
-- Description : Weight algebra and combinators
-- Copyright   : (c) 2025
-- License     : MIT
--
-- Weight algebra: w: Entity → ℝ
--
-- Provides composable weight functions for preference ordering.
module Commons.Weight
  ( -- * Basic weights
    unitWeight,
    needWeight,
    capacityWeight,
    satisfactionWeighted,

    -- * Deprecated (use needWeight instead)
    sinkMagnitude,

    -- * Weight combinators
    (.*.),
    (.+.),
    scaleWeight,
    maxWeight,
    minWeight,
  )
where

import Commons.Potential (capacityOf, getPotential, needOf)
import Commons.Types

-- ============================================================================
-- BASIC WEIGHTS
-- ============================================================================

-- | Unit weight (equal preference for all)
unitWeight :: Weight
unitWeight _ = 1.0

-- | Weight by need (for sinks)
--   Returns the absolute value of negative magnitude
needWeight :: Weight
needWeight ctx =
  case getPotential (wcPotentials ctx) (wcEntity ctx) (wcPotentialType ctx) of
    Just p -> needOf p
    Nothing -> 0

-- | Deprecated: Use needWeight instead
{-# DEPRECATED sinkMagnitude "Use needWeight instead" #-}
sinkMagnitude :: Weight
sinkMagnitude = needWeight

-- | Weight by capacity (for sources)
--   Returns the positive magnitude
capacityWeight :: PotentialType -> Weight
capacityWeight ptype ctx =
  case getPotential (wcPotentials ctx) (wcEntity ctx) ptype of
    Just p -> capacityOf p
    Nothing -> 0

-- | Satisfaction-weighted: recognition × reputation
--   Implements v6's MS formula
satisfactionWeighted :: Weight
satisfactionWeighted ctx =
  let recognition = capacityWeight "recognition" ctx
      reputation = case getPotential (wcPotentials ctx) (wcEntity ctx) "reputation" of
        Just p -> capacityOf p -- Reputation is a capacity (positive)
        Nothing -> 1.0 -- Default reputation
   in recognition * reputation

-- ============================================================================
-- WEIGHT COMBINATORS
-- ============================================================================

-- | Multiply weights: w₁ × w₂
(.*.) :: Weight -> Weight -> Weight
(.*.) w1 w2 = \ctx -> w1 ctx * w2 ctx

-- | Add weights: w₁ + w₂
(.+.) :: Weight -> Weight -> Weight
(.+.) w1 w2 = \ctx -> w1 ctx + w2 ctx

-- | Scale weight by constant: c × w
scaleWeight :: Double -> Weight -> Weight
scaleWeight c w = \ctx -> c * w ctx

-- | Maximum of two weights
maxWeight :: Weight -> Weight -> Weight
maxWeight w1 w2 = \ctx -> max (w1 ctx) (w2 ctx)

-- | Minimum of two weights
minWeight :: Weight -> Weight -> Weight
minWeight w1 w2 = \ctx -> min (w1 ctx) (w2 ctx)

-- ============================================================================
-- INFIX OPERATORS
-- ============================================================================

infixl 7 .*.

infixl 6 .+.
