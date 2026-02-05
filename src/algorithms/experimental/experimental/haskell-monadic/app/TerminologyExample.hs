{-# LANGUAGE OverloadedStrings #-}

-- |
-- Example showing how capacity/need terminology makes code more intuitive
module TerminologyExample where

import Commons.Types
import qualified Data.Map.Strict as Map

-- ============================================================================
-- HELPER FUNCTIONS (Proposed additions to Commons.Potential)
-- ============================================================================

-- | Get the capacity of a source potential (positive magnitude)
--   Returns 0 for sinks
capacityOf :: Potential -> Double
capacityOf p = max 0 (magnitude p)

-- | Get the need of a sink potential (absolute value of negative magnitude)
--   Returns 0 for sources
needOf :: Potential -> Double
needOf p = abs (min 0 (magnitude p))

-- | Check if potential is a source (has capacity)
isSource :: Potential -> Bool
isSource p = magnitude p > 0

-- | Check if potential is a sink (has need)
isSink :: Potential -> Bool
isSink p = magnitude p < 0

-- ============================================================================
-- BEFORE: Using magnitude directly (convoluted)
-- ============================================================================

allocateBefore :: Potential -> Potential -> Double -> Double
allocateBefore sourcePotential sinkPotential share =
  let source = magnitude sourcePotential -- What does "source" mean here?
      sinkMag = abs (magnitude sinkPotential) -- Why abs? Why magnitude?
      proportional = source * share
   in min proportional sinkMag

-- ============================================================================
-- AFTER: Using capacity/need terminology (intuitive)
-- ============================================================================

allocateAfter :: Potential -> Potential -> Double -> Double
allocateAfter sourcePotential sinkPotential share =
  let capacity = capacityOf sourcePotential -- Clear: how much can be provided
      need = needOf sinkPotential -- Clear: how much is needed
      proportionalShare = capacity * share -- Clear: recipient's share of capacity
   in min proportionalShare need -- Clear: can't exceed need

-- ============================================================================
-- EXAMPLE: Kitchen allocating meals
-- ============================================================================

example :: IO ()
example = do
  let kitchen =
        Potential
          { potentialType = "meals",
            magnitude = 100, -- +100 = capacity
            unit = Just "meals/week",
            resourceType = Just "food",
            metadata = Map.empty
          }

  let alice =
        Potential
          { potentialType = "meals",
            magnitude = -20, -- -20 = need
            unit = Just "meals/week",
            resourceType = Just "food",
            metadata = Map.empty
          }

  putStrLn "=== Kitchen Example ==="
  putStrLn $ "Kitchen capacity: " ++ show (capacityOf kitchen) ++ " meals"
  putStrLn $ "Alice's need: " ++ show (needOf alice) ++ " meals"
  putStrLn $ "Is kitchen a source? " ++ show (isSource kitchen)
  putStrLn $ "Is Alice a sink? " ++ show (isSink alice)

  -- Allocate with 40% share
  let share = 0.4
  let allocated = allocateAfter kitchen alice share

  putStrLn $ "\nAlice gets " ++ show share ++ " share:"
  putStrLn $ "  Proportional: " ++ show (capacityOf kitchen * share) ++ " meals"
  putStrLn $ "  Capped by need: " ++ show allocated ++ " meals"

  -- Compare with convoluted version
  let allocatedOld = allocateBefore kitchen alice share
  putStrLn $ "\nOld version gives same result: " ++ show allocatedOld
  putStrLn "But which code is easier to understand?"

-- ============================================================================
-- COMPARISON: Reading the code
-- ============================================================================

{-
BEFORE (requires mental translation):

  let source = magnitude sourcePotential
      sinkMag = abs (magnitude sinkPotential)
      proportional = source * share
  in min proportional sinkMag

Mental steps required:
1. "source" - wait, is this the source node or the capacity?
2. "magnitude sourcePotential" - this is positive for sources
3. "sinkMag" - why "Mag"? Is it signed or unsigned?
4. "abs (magnitude sinkPotential)" - oh, magnitude is negative, abs makes it positive
5. "proportional" - proportional to what?
6. "min proportional sinkMag" - ah, capped by the sink's magnitude

AFTER (direct mapping to domain):

  let capacity = capacityOf sourcePotential
      need = needOf sinkPotential
      proportionalShare = capacity * share
  in min proportionalShare need

Mental steps required:
1. "capacity" - how much the source can provide
2. "need" - how much the sink needs
3. "proportionalShare" - recipient's share of the capacity
4. "min proportionalShare need" - can't give more than needed

The second version reads like the mathematical formula!
-}
