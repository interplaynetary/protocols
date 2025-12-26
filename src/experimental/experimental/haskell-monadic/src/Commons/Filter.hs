{-# LANGUAGE OverloadedStrings #-}

{-|
Module      : Commons.Filter
Description : Filter algebra and combinators
Copyright   : (c) 2025
License     : MIT

Filter algebra: Φ: Entity → Bool

Provides composable filters for constraining eligible recipients.
-}

module Commons.Filter
  ( -- * Basic filters
    noFilter
  , hasPotential
  , potentialInRange
  , potentialEquals
    
    -- * Filter combinators
  , (.&&.)
  , (.||.)
  , notFilter
  , allFilters
  , anyFilter
  ) where

import Commons.Types
import Commons.Potential (getPotential)

-- ============================================================================
-- BASIC FILTERS
-- ============================================================================

-- | No filtering (always true)
noFilter :: Filter
noFilter _ = True

-- | Check if vertex has a potential with given type
hasPotential :: PotentialType -> Filter
hasPotential ptype ctx =
  case getPotential (fcPotentials ctx) (fcEntity ctx) ptype of
    Just _  -> True
    Nothing -> False

-- | Check if potential magnitude is in range [min, max]
potentialInRange :: PotentialType -> Double -> Double -> Filter
potentialInRange ptype minVal maxVal ctx =
  case getPotential (fcPotentials ctx) (fcEntity ctx) ptype of
    Just p  -> let q = magnitude p
               in q >= minVal && q <= maxVal
    Nothing -> False

-- | Check if potential magnitude equals value
potentialEquals :: PotentialType -> Double -> Filter
potentialEquals ptype val ctx =
  case getPotential (fcPotentials ctx) (fcEntity ctx) ptype of
    Just p  -> magnitude p == val
    Nothing -> False

-- ============================================================================
-- FILTER COMBINATORS
-- ============================================================================

-- | Logical AND: both filters must pass
(.&&.) :: Filter -> Filter -> Filter
(.&&.) f1 f2 = \ctx -> f1 ctx && f2 ctx

-- | Logical OR: either filter can pass
(.||.) :: Filter -> Filter -> Filter
(.||.) f1 f2 = \ctx -> f1 ctx || f2 ctx

-- | Logical NOT: invert filter
notFilter :: Filter -> Filter
notFilter f = \ctx -> not (f ctx)

-- | All filters must pass
allFilters :: [Filter] -> Filter
allFilters filters = \ctx -> all (\f -> f ctx) filters

-- | Any filter can pass
anyFilter :: [Filter] -> Filter
anyFilter filters = \ctx -> any (\f -> f ctx) filters

-- ============================================================================
-- INFIX OPERATORS
-- ============================================================================

infixr 3 .&&.
infixr 2 .||.
