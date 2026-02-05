{-# LANGUAGE OverloadedStrings #-}

-- |
-- Module      : Commons.Constraint
-- Description : Constraint algebra for graduated limits
-- Copyright   : (c) 2025
-- License     : MIT
--
-- Constraint algebra: C: Entity → ℝ≥0 ∪ {∞}
--
-- Provides composable constraints for limiting flow to recipients.
-- Constraints generalize filters by allowing graduated limits, not just binary eligibility.
module Commons.Constraint
  ( -- * Types
    Limit (..),
    Constraint,

    -- * Basic constraints
    noConstraint,
    exclude,
    capAt,
    capAtPercent,
    hasPotential,
    potentialInRange,

    -- * Constraint combinators
    (.∧.),
    tightest,
    allConstraints,

    -- * Filter compatibility
    fromFilter,
    asFilter,
  )
where

import Commons.Potential (getPotential)
import Commons.Types

-- ============================================================================
-- BASIC CONSTRAINTS
-- ============================================================================

-- | No constraint (always allows flow)
noConstraint :: Constraint
noConstraint _ = NoLimit

-- | Exclude all (never allows flow)
exclude :: Constraint
exclude _ = Exclude

-- | Cap at absolute value
capAt :: Double -> Constraint
capAt k _ = Cap k

-- | Cap at percentage of source capacity
-- Note: Requires source capacity to be passed in context
capAtPercent :: Double -> Constraint
capAtPercent alpha ctx =
  case fcSourceCapacity ctx of
    Just q_s -> Cap (alpha * q_s)
    Nothing -> NoLimit -- If no source capacity known, no limit

-- | Check if vertex has a potential (binary: NoLimit or Exclude)
hasPotential :: PotentialType -> Constraint
hasPotential ptype ctx =
  case getPotential (fcPotentials ctx) (fcEntity ctx) ptype of
    Just _ -> NoLimit
    Nothing -> Exclude

-- | Constrain based on potential magnitude range
potentialInRange :: PotentialType -> Double -> Double -> Constraint
potentialInRange ptype minVal maxVal ctx =
  case getPotential (fcPotentials ctx) (fcEntity ctx) ptype of
    Just p ->
      let q = magnitude p
       in if q >= minVal && q <= maxVal
            then NoLimit
            else Exclude
    Nothing -> Exclude

-- ============================================================================
-- CONSTRAINT COMBINATORS
-- ============================================================================

-- | Minimum (tightest constraint)
(.∧.) :: Constraint -> Constraint -> Constraint
(.∧.) c1 c2 = \ctx -> minLimit (c1 ctx) (c2 ctx)

-- | Select tightest of multiple constraints
tightest :: [Constraint] -> Constraint
tightest constraints = \ctx -> minimum (map (\c -> c ctx) constraints)

-- | All constraints (same as tightest)
allConstraints :: [Constraint] -> Constraint
allConstraints = tightest

-- ============================================================================
-- LIMIT OPERATIONS
-- ============================================================================

-- | Minimum of two limits (tightest constraint)
minLimit :: Limit -> Limit -> Limit
minLimit Exclude _ = Exclude
minLimit _ Exclude = Exclude
minLimit NoLimit l = l
minLimit l NoLimit = l
minLimit (Cap k1) (Cap k2) = Cap (min k1 k2)

-- ============================================================================
-- FILTER COMPATIBILITY
-- ============================================================================

-- | Convert a Filter to a Constraint
fromFilter :: Filter -> Constraint
fromFilter f = \ctx -> if f ctx then NoLimit else Exclude

-- | Convert a Constraint to a Filter (loses graduated information)
asFilter :: Constraint -> Filter
asFilter c = \ctx -> case c ctx of
  Exclude -> False
  _ -> True

-- ============================================================================
-- INFIX OPERATORS
-- ============================================================================

infixr 3 .∧.
