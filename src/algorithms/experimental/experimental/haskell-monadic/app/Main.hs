{-# LANGUAGE OverloadedStrings #-}

-- |
-- Module      : Main
-- Description : Monadic examples of the Commons paradigm
-- Copyright   : (c) 2025
-- License     : MIT
--
-- Demonstrates the monadic Haskell implementation using StateT and WriterT.
module Main where

import Commons.Constraint
import Commons.Monad
import Commons.Potential qualified
import Commons.Types
import Commons.Weight
import Data.Map.Strict qualified as Map
import Data.Set qualified as Set
import Data.Text qualified as T

-- ============================================================================
-- EXAMPLE 1: Basic Proportional Distribution (Monadic)
-- ============================================================================

example1M :: CommonsM ()
example1M = do
  -- Add vertices
  addVertexM "kitchen-1"
  addVertexM "alice"
  addVertexM "bob"

  -- Add memberships
  addMembershipM "alice" "kitchen-1"
  addMembershipM "bob" "kitchen-1"

  -- Add potentials
  addPotentialM "kitchen-1" $
    Potential
      { potentialType = "meals",
        magnitude = 100,
        unit = Just "meals/week",
        resourceType = Just "food",
        metadata = Map.empty
      }

  addPotentialM "alice" $
    Potential
      { potentialType = "meals",
        magnitude = -20,
        unit = Just "meals/week",
        resourceType = Just "food",
        metadata = Map.empty
      }

  addPotentialM "bob" $
    Potential
      { potentialType = "meals",
        magnitude = -30,
        unit = Just "meals/week",
        resourceType = Just "food",
        metadata = Map.empty
      }

  -- Perform allocation (automatically recorded!)
  allocations <-
    performAllocationM
      "kitchen-1"
      "meals"
      noConstraint
      needWeight
      "no constraint"
      "proportional to need"

  -- Display results
  liftIO $ putStrLn "\n=== Example 1: Basic Proportional Distribution (Monadic) ===\n"
  liftIO $ putStrLn "Allocations:"
  liftIO $
    mapM_
      ( \(eid, qty) ->
          putStrLn $ "  " ++ T.unpack eid ++ ": " ++ show qty ++ " meals"
      )
      (Map.toList allocations)

-- ============================================================================
-- EXAMPLE 2: Satisfaction-Weighted Distribution (Monadic)
-- ============================================================================

example2M :: CommonsM ()
example2M = do
  -- Add vertices
  addVertexM "tutor-1"
  addVertexM "alice"
  addVertexM "bob"

  -- Add memberships
  addMembershipM "alice" "tutor-1"
  addMembershipM "bob" "tutor-1"

  -- Add source potential
  addPotentialM "tutor-1" $
    Potential
      { potentialType = "tutoring",
        magnitude = 20,
        unit = Just "hours/week",
        resourceType = Just "education",
        metadata = Map.empty
      }

  -- Add sink potentials and recognition/reputation for Alice
  addPotentialM "alice" $ Potential "tutoring" (-10) (Just "hours/week") (Just "education") Map.empty
  addPotentialM "alice" $ Potential "recognition" 0.6 Nothing Nothing Map.empty
  addPotentialM "alice" $ Potential "reputation" 1.2 Nothing Nothing Map.empty

  -- Add sink potentials and recognition/reputation for Bob
  addPotentialM "bob" $ Potential "tutoring" (-10) (Just "hours/week") (Just "education") Map.empty
  addPotentialM "bob" $ Potential "recognition" 0.4 Nothing Nothing Map.empty
  addPotentialM "bob" $ Potential "reputation" 0.8 Nothing Nothing Map.empty

  -- Perform allocation
  allocations <-
    performAllocationM
      "tutor-1"
      "tutoring"
      noConstraint
      satisfactionWeighted
      "no constraint"
      "recognition × reputation"

  -- Display results
  liftIO $ putStrLn "\n=== Example 2: Satisfaction-Weighted Distribution (Monadic) ===\n"
  liftIO $ putStrLn "Allocations (satisfaction-weighted):"

  pots <- getPotentials
  liftIO $
    mapM_
      ( \(eid, qty) -> do
          let recognition = case Commons.Potential.getPotential pots eid "recognition" of
                Just p -> magnitude p
                Nothing -> 0
          let reputation = case Commons.Potential.getPotential pots eid "reputation" of
                Just p -> magnitude p
                Nothing -> 1.0
          let effective = recognition * reputation
          putStrLn $ "  " ++ T.unpack eid ++ ": " ++ show qty ++ " hours"
          putStrLn $
            "    (recognition: "
              ++ show recognition
              ++ ", reputation: "
              ++ show reputation
              ++ ", effective: "
              ++ show effective
              ++ ")"
      )
      (Map.toList allocations)

-- ============================================================================
-- EXAMPLE 3: Demonstrating Writer Monad (History Accumulation)
-- ============================================================================

example3M :: CommonsM ()
example3M = do
  liftIO $ putStrLn "\n=== Example 3: History Accumulation (Writer Monad) ===\n"

  -- Perform multiple allocations
  addVertexM "provider"
  addVertexM "recipient1"
  addVertexM "recipient2"

  addMembershipM "recipient1" "provider"
  addMembershipM "recipient2" "provider"

  addPotentialM "provider" $ Potential "resource" 100 Nothing Nothing Map.empty
  addPotentialM "recipient1" $ Potential "resource" (-30) Nothing Nothing Map.empty
  addPotentialM "recipient2" $ Potential "resource" (-70) Nothing Nothing Map.empty

  -- First allocation
  _ <- performAllocationM "provider" "resource" noConstraint needWeight "no constraint" "proportional"

  -- Check history
  history1 <- getHistory
  liftIO $ putStrLn $ "After first allocation: " ++ show (length history1) ++ " records"

  -- Second allocation (simulating another cycle)
  _ <- performAllocationM "provider" "resource" noConstraint needWeight "no constraint" "proportional"

  -- Check history again
  history2 <- getHistory
  liftIO $ putStrLn $ "After second allocation: " ++ show (length history2) ++ " records"

  liftIO $ putStrLn "\nHistory automatically accumulated via Writer monad!"

-- ============================================================================
-- MAIN
-- ============================================================================

main :: IO ()
main = do
  -- Run all examples in the Commons monad
  let initialCommons = emptyCommons

  -- Example 1
  (_, commons1, records1) <- runCommonsM example1M initialCommons
  putStrLn $ "\nRecords accumulated: " ++ show (length records1)

  -- Example 2 (starting fresh)
  (_, commons2, records2) <- runCommonsM example2M initialCommons
  putStrLn $ "\nRecords accumulated: " ++ show (length records2)

  -- Example 3 (demonstrating history)
  (_, commons3, records3) <- runCommonsM example3M initialCommons
  putStrLn $ "\nTotal records accumulated: " ++ show (length records3)

  putStrLn "\n=== All monadic examples complete ===\n"
