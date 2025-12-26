{-# LANGUAGE OverloadedStrings #-}

-- |
-- Module      : TypesAsNodesExample
-- Description : Demonstrates types as first-class nodes
-- 
-- This example shows how types can have their own potentials,
-- categories, and participants, creating a fully reflexive system.

module Main where

import Commons.Graph
import Commons.Potential
import Commons.Types
import Data.Map.Strict qualified as Map
import Data.Set qualified as Set

main :: IO ()
main = do
  putStrLn "\n=== Types as Nodes Example ===\n"
  
  -- Example 1: Type with Potentials
  putStrLn "Example 1: Types Can Have Potentials"
  putStrLn "-------------------------------------"
  example1
  
  -- Example 2: Type Hierarchies
  putStrLn "\nExample 2: Type Hierarchies"
  putStrLn "----------------------------"
  example2
  
  -- Example 3: Type-Type Flows
  putStrLn "\nExample 3: Type-Type Flows"
  putStrLn "--------------------------"
  example3
  
  -- Example 4: Self-Typing
  putStrLn "\nExample 4: Self-Typing (Reflexive)"
  putStrLn "----------------------------------"
  example4

-- Example 1: Types Can Have Potentials
example1 :: IO ()
example1 = do
  let graph = emptyGraph
      potentials = emptyPotentials
  
  -- Create MealType as a node
  let graph' = addVertex "MealType" graph
  
  -- MealType has its own potentials
  let mealTypePotential = Potential
        { potentialType = "Nutrition"
          , magnitude = 100  -- MealType provides Nutrition
          , unit = Just "calories"
          , resourceType = Just "abstract"
          , metadata = Map.empty
        }
  let potentials' = addPotential "MealType" mealTypePotential potentials
  
  -- Kitchen has a potential of type MealType
  let graph'' = addVertex "Kitchen" graph'
  let kitchenPotential = Potential
        { potentialType = "MealType"  -- Type is a node!
          , magnitude = 50
          , unit = Just "meals"
          , resourceType = Nothing
          , metadata = Map.empty
        }
  let potentials'' = addPotential "Kitchen" kitchenPotential potentials'
  
  putStrLn "MealType (the type) has potential:"
  print $ getPotentials potentials'' "MealType"
  
  putStrLn "\nKitchen has potential of type MealType:"
  print $ getPotentials potentials'' "Kitchen"

-- Example 2: Type Hierarchies
example2 :: IO ()
example2 = do
  let graph = emptyGraph
  
  -- Create type hierarchy: MealType → FoodType → ConsumableType
  let graph' = addVertex "ConsumableType" graph
  let graph'' = addVertex "FoodType" graph'
  let graph''' = addVertex "MealType" graph''
  
  -- Build hierarchy via edges
  let graph4 = addEdge "MealType" "FoodType" graph'''
  let graph5 = addEdge "FoodType" "ConsumableType" graph4
  
  -- Kitchen is a member of MealType
  let graph6 = addVertex "Kitchen" graph5
  let graph7 = addEdge "Kitchen" "MealType" graph6
  
  putStrLn "Type hierarchy:"
  putStrLn "  ConsumableType"
  putStrLn "    └─ FoodType"
  putStrLn "       └─ MealType"
  putStrLn "          └─ Kitchen (instance)"
  
  putStrLn "\nKitchen's categories (direct):"
  print $ types graph7 "Kitchen"
  
  putStrLn "\nKitchen's ancestors (transitive):"
  print $ ancestors graph7 "Kitchen"
  
  putStrLn "\nMealType's participants:"
  print $ members graph7 "MealType"

-- Example 3: Type-Type Flows
example3 :: IO ()
example3 = do
  let graph = emptyGraph
      potentials = emptyPotentials
  
  -- Create two type nodes
  let graph' = addVertex "TypeA" graph
  let graph'' = addVertex "TypeB" graph'
  
  -- TypeA provides TypeB-ness
  let typeAPotential = Potential
        { potentialType = "TypeB"  -- TypeA has capacity of type TypeB
          , magnitude = 100
          , unit = Nothing
          , resourceType = Just "meta"
          , metadata = Map.empty
        }
  let potentials' = addPotential "TypeA" typeAPotential potentials
  
  -- TypeB needs TypeB-ness (self-typing)
  let typeBPotential = Potential
        { potentialType = "TypeB"  -- TypeB needs itself
          , magnitude = -50
          , unit = Nothing
          , resourceType = Just "meta"
          , metadata = Map.empty
        }
  let potentials'' = addPotential "TypeB" typeBPotential potentials'
  
  putStrLn "TypeA has capacity of type TypeB:"
  print $ getPotentials potentials'' "TypeA"
  
  putStrLn "\nTypeB has need of type TypeB:"
  print $ getPotentials potentials'' "TypeB"
  
  putStrLn "\nFlow can occur: TypeA → TypeB"
  putStrLn "  (TypeA provides TypeB-ness to TypeB)"

-- Example 4: Self-Typing (Reflexive System)
example4 :: IO ()
example4 = do
  let graph = emptyGraph
      potentials = emptyPotentials
  
  -- Create TypeType: the type of types
  let graph' = addVertex "TypeType" graph
  
  -- TypeType provides infinite TypeType-ness
  let typeTypePotential = Potential
        { potentialType = "TypeType"  -- Self-reference!
          , magnitude = 1000
          , unit = Just "type-validity"
          , resourceType = Just "meta-meta"
          , metadata = Map.empty
        }
  let potentials' = addPotential "TypeType" typeTypePotential potentials
  
  -- MealType needs to be validated as a type
  let graph'' = addVertex "MealType" graph'
  let mealTypeValidation = Potential
        { potentialType = "TypeType"
          , magnitude = -1  -- Needs 1 unit of type-validity
          , unit = Just "type-validity"
          , resourceType = Just "meta"
          , metadata = Map.empty
        }
  let potentials'' = addPotential "MealType" mealTypeValidation potentials'
  
  putStrLn "TypeType (meta-type) provides TypeType-ness:"
  print $ getPotentials potentials'' "TypeType"
  
  putStrLn "\nMealType needs TypeType-ness (to be a valid type):"
  print $ getPotentials potentials'' "MealType"
  
  putStrLn "\nFlow: TypeType → MealType"
  putStrLn "  (TypeType validates MealType as a type)"
  
  putStrLn "\nThis creates a fully reflexive system where:"
  putStrLn "  - Types can validate other types"
  putStrLn "  - Types can validate themselves"
  putStrLn "  - The system can describe its own type structure"
