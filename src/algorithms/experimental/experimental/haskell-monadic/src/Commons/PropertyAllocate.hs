{-# LANGUAGE OverloadedStrings #-}

-- |
-- Module      : Commons.PropertyAllocate
-- Description : Allocation functions for property-based model
-- Copyright   : (c) 2025
-- License     : MIT
--
-- Implements the Unified Flow Equation over the property-based model.
module Commons.PropertyAllocate where

import Commons.Commons
import Commons.Property
import Commons.PropertyConstraint
import Data.Map.Strict (Map)
import Data.Map.Strict qualified as Map
import Data.Set (Set)
import Data.Set qualified as Set
import Data.Text (Text)

-- ============================================================================
-- ALLOCATION CONFIGURATION
-- ============================================================================

-- | Weight function: assigns preference weight to each node
type WeightFunction = Commons -> EntityId -> EntityId -> Double

-- | Allocation configuration
data AllocationConfig = AllocationConfig
  { acProvider :: EntityId,
    acPotentialType :: PotentialType,
    acConstraint :: PropertyConstraint,
    acWeight :: WeightFunction
  }

-- | Allocation result
data AllocationResult = AllocationResult
  { resultAllocations :: Map EntityId SignedQuantity,
    resultTotalAllocated :: SignedQuantity,
    resultUnallocated :: SignedQuantity,
    resultRecipientCount :: Int
  }
  deriving (Show, Eq)

-- ============================================================================
-- CORE ALLOCATION
-- ============================================================================

-- | The Unified Flow Equation
--   Flow(s, r, τ) = min(q_s · w(r)/Σw(r'), |q_r|, C(r))
allocate :: AllocationConfig -> Commons -> AllocationResult
allocate config commons =
  let provider = acProvider config
      ptype = acPotentialType config
      constraint = acConstraint config
      weightFn = acWeight config

      -- Get provider's capacity
      providerCapacity = case getNode provider commons of
        Just node ->
          sum
            [ magnitude pot
              | pot <- getPotentials node,
                potentialType pot == ptype,
                magnitude pot > 0
            ]
        Nothing -> 0

      -- Get eligible recipients (have need + satisfy constraint)
      allRecipients = filterNodeIds constraint commons
      eligibleRecipients =
        Set.filter
          ( \rid ->
              let needs = getNodePotentialsOfType rid ptype commons
               in any (\p -> magnitude p < 0) needs
          )
          allRecipients

      -- Calculate weights
      weights =
        Map.fromList
          [ (rid, weightFn commons provider rid)
            | rid <- Set.toList eligibleRecipients
          ]
      totalWeight = sum (Map.elems weights)

      -- Allocate proportionally
      allocations
        | totalWeight == 0 = Map.empty
        | otherwise =
            Map.fromList
              [ ( rid,
                  let proportionalShare = providerCapacity * (w / totalWeight)
                      recipientNeed = abs $ sum [magnitude pot | pot <- getNodePotentialsOfType rid ptype commons]
                   in min proportionalShare recipientNeed
                )
                | (rid, w) <- Map.toList weights,
                  w > 0
              ]

      totalAllocated = sum (Map.elems allocations)
      unallocated = providerCapacity - totalAllocated
   in AllocationResult
        { resultAllocations = allocations,
          resultTotalAllocated = totalAllocated,
          resultUnallocated = unallocated,
          resultRecipientCount = Map.size allocations
        }

-- ============================================================================
-- WEIGHT FUNCTIONS
-- ============================================================================

-- | Uniform weights (equal distribution)
uniformWeight :: WeightFunction
uniformWeight _ _ _ = 1.0

-- | Weight by a numeric property
propertyWeight :: Text -> WeightFunction
propertyWeight propKey commons _ recipientId =
  case getNode recipientId commons of
    Just node -> maybe 0 id (getNumericProperty propKey node)
    Nothing -> 0

-- | Weight by reputation
reputationWeight :: WeightFunction
reputationWeight = propertyWeight "reputation"

-- | Mutual recognition weight
--   MR(p, r) = min(recognition(p, r), recognition(r, p))
mutualRecognitionWeight :: WeightFunction
mutualRecognitionWeight commons providerId recipientId =
  let getRecognition from to =
        case getNode from commons of
          Just node ->
            case getProperty "recognition" node of
              Just (PVMap recMap) ->
                case Map.lookup to recMap of
                  Just (PVNumber n) -> n
                  _ -> 0
              _ -> 0
          Nothing -> 0
      forwardRec = getRecognition providerId recipientId
      backwardRec = getRecognition recipientId providerId
   in min forwardRec backwardRec

-- | Composite weight (multiply multiple weight functions)
compositeWeight :: [WeightFunction] -> WeightFunction
compositeWeight weightFns commons provider recipient =
  product [wf commons provider recipient | wf <- weightFns]

-- ============================================================================
-- MULTI-TIER ALLOCATION
-- ============================================================================

-- | Tier configuration
data Tier = Tier
  { tierPriority :: Int,
    tierConstraint :: PropertyConstraint,
    tierWeight :: WeightFunction,
    tierLabel :: Text
  }

-- | Multi-tier allocation result
data MultiTierResult = MultiTierResult
  { mtrTiers :: [(Text, AllocationResult)],
    mtrTotalAllocated :: SignedQuantity,
    mtrUnallocated :: SignedQuantity
  }
  deriving (Show, Eq)

-- | Allocate across multiple tiers with priority
allocateMultiTier ::
  EntityId ->
  PotentialType ->
  [Tier] ->
  Commons ->
  MultiTierResult
allocateMultiTier provider ptype tiers commons =
  let sortedTiers = sortBy (\t1 t2 -> compare (tierPriority t1) (tierPriority t2)) tiers
      (tierResults, finalUnallocated) = allocateTiers sortedTiers initialCapacity []
   in MultiTierResult
        { mtrTiers = tierResults,
          mtrTotalAllocated = initialCapacity - finalUnallocated,
          mtrUnallocated = finalUnallocated
        }
  where
    initialCapacity = case getNode provider commons of
      Just node ->
        sum
          [ magnitude pot
            | pot <- getPotentials node,
              potentialType pot == ptype,
              magnitude pot > 0
          ]
      Nothing -> 0

    allocateTiers [] remaining results = (reverse results, remaining)
    allocateTiers (tier : rest) remaining results
      | remaining <= 0 = (reverse results, 0)
      | otherwise =
          let config =
                AllocationConfig
                  { acProvider = provider,
                    acPotentialType = ptype,
                    acConstraint = tierConstraint tier,
                    acWeight = tierWeight tier
                  }
              -- Temporarily update provider capacity for this tier
              result = allocate config commons
              allocated = resultTotalAllocated result
              newRemaining = remaining - allocated
           in allocateTiers rest newRemaining ((tierLabel tier, result) : results)

-- Helper for sorting (not in Prelude for this simple case)
sortBy :: (a -> a -> Ordering) -> [a] -> [a]
sortBy _ [] = []
sortBy cmp (x : xs) =
  let smaller = sortBy cmp [y | y <- xs, cmp y x == LT]
      larger = sortBy cmp [y | y <- xs, cmp y x /= LT]
   in smaller ++ [x] ++ larger

-- ============================================================================
-- CONVENIENCE FUNCTIONS
-- ============================================================================

-- | Simple allocation with uniform weights
allocateUniform ::
  EntityId ->
  PotentialType ->
  PropertyConstraint ->
  Commons ->
  AllocationResult
allocateUniform provider ptype constraint commons =
  allocate
    AllocationConfig
      { acProvider = provider,
        acPotentialType = ptype,
        acConstraint = constraint,
        acWeight = uniformWeight
      }
    commons

-- | Allocate with reputation weighting
allocateByReputation ::
  EntityId ->
  PotentialType ->
  PropertyConstraint ->
  Commons ->
  AllocationResult
allocateByReputation provider ptype constraint commons =
  allocate
    AllocationConfig
      { acProvider = provider,
        acPotentialType = ptype,
        acConstraint = constraint,
        acWeight = reputationWeight
      }
    commons

-- | Allocate with mutual recognition weighting
allocateByMutualRecognition ::
  EntityId ->
  PotentialType ->
  PropertyConstraint ->
  Commons ->
  AllocationResult
allocateByMutualRecognition provider ptype constraint commons =
  allocate
    AllocationConfig
      { acProvider = provider,
        acPotentialType = ptype,
        acConstraint = constraint,
        acWeight = mutualRecognitionWeight
      }
    commons
