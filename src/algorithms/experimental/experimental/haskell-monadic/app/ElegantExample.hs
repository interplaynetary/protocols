{-# LANGUAGE OverloadedStrings #-}

-- |
-- Demonstrating the elegant new allocation API
module Main where

import Commons.Allocation
import Commons.Monad
import Commons.Types
import Commons.Weight (needWeight, satisfactionWeighted)
import qualified Data.Map as Map

main :: IO ()
main = do
  putStrLn "=== Elegant API Examples ===\n"

  -- Example 1: Simple proportional allocation
  example1

  -- Example 2: Fluent interface
  example2

  -- Example 3: Rich result type
  example3

-- ============================================================================
-- Example 1: Smart Constructors
-- ============================================================================

example1 :: IO ()
example1 = do
  putStrLn "Example 1: Smart Constructors\n"

  (_, commons, _) <- runCommonsM setup emptyCommons

  let graph = Commons.Types.graph commons
      pots = potentials commons

  -- OLD WAY (still works):
  -- allocate graph pots "kitchen" "meals" noConstraint needWeight

  -- NEW WAY (elegant!):
  let result1 = allocateWith graph pots $ proportional "kitchen" "meals"

  putStrLn "Proportional allocation:"
  printResult result1

  let result2 = allocateWith graph pots $ equal "kitchen" "meals"

  putStrLn "\nEqual allocation:"
  printResult result2

  let result3 = allocateWith graph pots $ social "tutor" "hours"

  putStrLn "\nSocial allocation (recognition × reputation):"
  printResult result3

setup :: CommonsM ()
setup = do
  -- Kitchen example
  addVertexM "kitchen"
  addVertexM "alice"
  addVertexM "bob"

  addMembershipM "alice" "kitchen"
  addMembershipM "bob" "kitchen"

  addPotentialM "kitchen" $ Potential "meals" 100 Nothing Nothing mempty
  addPotentialM "alice" $ Potential "meals" (-20) Nothing Nothing mempty
  addPotentialM "bob" $ Potential "meals" (-30) Nothing Nothing mempty

  -- Tutor example
  addVertexM "tutor"
  addMembershipM "alice" "tutor"
  addMembershipM "bob" "tutor"

  addPotentialM "tutor" $ Potential "hours" 20 Nothing Nothing mempty
  addPotentialM "alice" $ Potential "hours" (-10) Nothing Nothing mempty
  addPotentialM "alice" $ Potential "recognition" 0.6 Nothing Nothing mempty
  addPotentialM "alice" $ Potential "reputation" 1.2 Nothing Nothing mempty

  addPotentialM "bob" $ Potential "hours" (-10) Nothing Nothing mempty
  addPotentialM "bob" $ Potential "recognition" 0.4 Nothing Nothing mempty
  addPotentialM "bob" $ Potential "reputation" 0.8 Nothing Nothing mempty

-- ============================================================================
-- Example 2: Fluent Interface
-- ============================================================================

example2 :: IO ()
example2 = do
  putStrLn "\n\nExample 2: Fluent Interface\n"

  (_, commons, _) <- runCommonsM setup emptyCommons

  let graph = Commons.Types.graph commons
      pots = potentials commons

  -- Build allocation configuration fluently
  let result =
        allocateWith graph pots $
          from "kitchen" "meals"
            & cappedAt 15.0
            & weightedBy needWeight

  putStrLn "Fluent allocation (capped at 15):"
  printResult result

-- ============================================================================
-- Example 3: Rich Result Type
-- ============================================================================

example3 :: IO ()
example3 = do
  putStrLn "\n\nExample 3: Rich Result Type\n"

  (_, commons, _) <- runCommonsM setup emptyCommons

  let graph = Commons.Types.graph commons
      pots = potentials commons

  let result = allocateWith graph pots $ proportional "kitchen" "meals"

  putStrLn $ "Total allocated: " ++ show (resultTotalAllocated result)
  putStrLn $ "Unallocated: " ++ show (resultUnallocated result)
  putStrLn $ "Recipients: " ++ show (resultRecipientCount result)
  putStrLn "\nAllocations:"
  printResult result

-- ============================================================================
-- Helpers
-- ============================================================================

printResult :: AllocationResult -> IO ()
printResult result =
  mapM_
    (\(eid, qty) -> putStrLn $ "  " ++ show eid ++ ": " ++ show qty)
    (Map.toList $ resultAllocations result)

-- Operator for fluent interface
(&) :: a -> (a -> b) -> b
x & f = f x

infixl 1 &
