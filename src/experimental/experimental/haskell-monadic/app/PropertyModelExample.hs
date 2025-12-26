{-# LANGUAGE OverloadedStrings #-}

-- | Property-Based Model Example
--   Demonstrates the new property-based Commons model
module Main where

import Commons.Commons
import Commons.Property
import Commons.PropertyAllocate
import Commons.PropertyConstraint
import Data.Map.Strict qualified as Map
import Data.Set qualified as Set
import Data.Text (Text)
import Data.Text.IO qualified as TIO

main :: IO ()
main = do
  putStrLn "\n=== Property-Based Commons Example ===\n"

  -- Create a simple example with meals
  let commons = createMealExample

  putStrLn "Created Commons with:"
  putStrLn $ "  - " ++ show (Map.size (nodes commons)) ++ " nodes"
  putStrLn ""

  -- Show the graph structure (emergent from properties)
  putStrLn "Graph structure (emergent from 'memberOf' properties):"
  showGraphStructure commons
  putStrLn ""

  -- Show potentials
  putStrLn "Potentials:"
  showPotentials commons
  putStrLn ""

  -- Perform allocation
  putStrLn "Performing allocation from Kitchen..."
  let result =
        allocateUniform
          "Kitchen"
          "Meals"
          (hasNeedOfType "Meals")
          commons
  showAllocationResult result
  putStrLn ""

  -- Demonstrate property-based constraints
  putStrLn "Demonstrating property-based constraints:"
  demonstrateConstraints commons

-- | Create a simple meal example
createMealExample :: Commons
createMealExample =
  let -- Create nodes
      kitchen =
        emptyNode "Kitchen"
          & setMembership (Set.fromList ["MealProvider"])
          & setPotentials [Potential "Meals" 100 (Just "meals") Nothing Map.empty]
          & setProperty "reputation" (PVNumber 0.9)

      alice =
        emptyNode "Alice"
          & setMembership (Set.fromList ["Person"])
          & setPotentials [Potential "Meals" (-20) (Just "meals") Nothing Map.empty]
          & setProperty "reputation" (PVNumber 0.8)

      bob =
        emptyNode "Bob"
          & setMembership (Set.fromList ["Person"])
          & setPotentials [Potential "Meals" (-30) (Just "meals") Nothing Map.empty]
          & setProperty "reputation" (PVNumber 0.6)

      -- Types
      mealProvider = emptyNode "MealProvider"
      person = emptyNode "Person"

      -- Add all nodes to commons
      commons =
        emptyCommons
          & addNode kitchen
          & addNode alice
          & addNode bob
          & addNode mealProvider
          & addNode person
   in commons

-- Helper for chaining operations
(&) :: a -> (a -> b) -> b
x & f = f x

infixl 1 &

-- | Show graph structure
showGraphStructure :: Commons -> IO ()
showGraphStructure commons = do
  mapM_
    ( \(nid, node) -> do
        let membership = getMembership node
        if not (Set.null membership)
          then
            putStrLn $
              "  "
                ++ show nid
                ++ " → "
                ++ show (Set.toList membership)
          else return ()
    )
    (Map.toList (nodes commons))

-- | Show potentials
showPotentials :: Commons -> IO ()
showPotentials commons = do
  mapM_
    ( \(nid, node) -> do
        let pots = getPotentials node
        if not (null pots)
          then do
            putStrLn $ "  " ++ show nid ++ ":"
            mapM_
              ( \pot ->
                  putStrLn $
                    "    - "
                      ++ show (potentialType pot)
                      ++ ": "
                      ++ show (magnitude pot)
              )
              pots
          else return ()
    )
    (Map.toList (nodes commons))

-- | Show allocation result
showAllocationResult :: AllocationResult -> IO ()
showAllocationResult result = do
  putStrLn $ "  Total allocated: " ++ show (resultTotalAllocated result)
  putStrLn $ "  Unallocated: " ++ show (resultUnallocated result)
  putStrLn $ "  Recipients: " ++ show (resultRecipientCount result)
  putStrLn "  Allocations:"
  mapM_
    ( \(rid, amount) ->
        putStrLn $ "    - " ++ show rid ++ ": " ++ show amount
    )
    (Map.toList (resultAllocations result))

-- | Demonstrate constraints
demonstrateConstraints :: Commons -> IO ()
demonstrateConstraints commons = do
  putStrLn "\n1. Nodes with reputation > 0.7:"
  let highRep = filterNodes (PropGreaterThan "reputation" 0.7) commons
  mapM_ (\n -> putStrLn $ "   - " ++ show (nodeId n)) highRep

  putStrLn "\n2. Nodes that are members of 'Person':"
  let people = filterNodes (isMemberOf "Person") commons
  mapM_ (\n -> putStrLn $ "   - " ++ show (nodeId n)) people

  putStrLn "\n3. Nodes with needs (negative potentials):"
  let withNeeds =
        filterNodes
          ( PropMatches "potentials" $ \case
              PVPotentials pots -> any (\p -> magnitude p < 0) pots
              _ -> False
          )
          commons
  mapM_ (\n -> putStrLn $ "   - " ++ show (nodeId n)) withNeeds

  putStrLn "\n4. Complex constraint (Person AND reputation > 0.7):"
  let complexResult =
        filterNodes
          (isMemberOf "Person" .&&. PropGreaterThan "reputation" 0.7)
          commons
  mapM_ (\n -> putStrLn $ "   - " ++ show (nodeId n)) complexResult

  putStrLn ""
