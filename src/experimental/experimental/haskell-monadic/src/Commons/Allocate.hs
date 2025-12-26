{-# LANGUAGE OverloadedStrings #-}

-- |
-- Module      : Commons.Allocate
-- Description : Allocation algorithm - the unified flow equation
-- Copyright   : (c) 2025
-- License     : MIT
--
-- The unified allocation equation:
--
--   Alloc(p, τ, r) = min(q_p · w(r)/Σw(e), |q_r|)
--
-- Where:
--   - p = provider vertex
--   - τ = potential type
--   - r = recipient vertex
--   - q_p = source magnitude (positive)
--   - q_r = sink magnitude (negative)
--   - w = weight function
--   - Σw(e) = sum of weights over all eligible recipients
module Commons.Allocate
  ( -- * Core allocation
    allocate,
    allocateMultiTier,

    -- * Helper functions
    eligibleRecipients,
    computeWeights,
    normalizeShares,
  )
where

import Commons.Graph (members)
import Commons.Potential (capacityOf, getPotential, isSink, isSource, needOf)
import Commons.Types
import Data.List (sortOn)
import Data.Map.Strict (Map)
import Data.Map.Strict qualified as Map
import Data.Set (Set)
import Data.Set qualified as Set

-- ============================================================================
-- CORE ALLOCATION
-- ============================================================================

-- | The unified allocation equation
--
--   Alloc(p, τ, r) = min(q_p · w(r)/Σw(e), |q_r|, C(r))
--
--   Steps:
--     1. Filter eligible recipients (C)
--     2. Compute weights for each (w)
--     3. Normalize to shares (w/Σw)
--     4. Allocate proportionally, capped by sink magnitude and constraint limit
allocate ::
  Graph ->
  Potentials ->
  -- | Provider
  EntityId ->
  -- | Source potential type
  PotentialType ->
  -- | C: constraint function
  Constraint ->
  -- | w: weight function
  Weight ->
  Map EntityId SignedQuantity
allocate g pots provider ptype constraintFn weightFn =
  case getPotential pots provider ptype of
    Nothing -> Map.empty
    Just sourcePotential
      | not (isSource sourcePotential) -> Map.empty
      | otherwise ->
          let -- Step 1: Filter eligible recipients
              capacity = capacityOf sourcePotential
              eligible = eligibleRecipients g pots provider ptype capacity constraintFn

              -- Step 2: Compute weights
              weights = computeWeights g pots ptype weightFn eligible

              -- Step 3: Normalize to shares
              shares = normalizeShares weights

              -- Step 4: Allocate proportionally, capped by need and constraint
              allocations =
                Map.mapWithKey
                  ( \eid share ->
                      let need = case getPotential pots eid ptype of
                            Just p -> needOf p
                            Nothing -> 0
                          proportionalShare = capacity * share
                          -- Apply constraint limit
                          ctx = FilterContext g pots eid (Just capacity)
                          constraintLimit = case constraintFn ctx of
                            NoLimit -> proportionalShare -- No constraint
                            Exclude -> 0 -- Should not happen (filtered)
                            Cap k -> k -- Cap at k
                       in min proportionalShare (min need constraintLimit)
                  )
                  shares
           in allocations

-- | Multi-tier allocation
--   Allocates source across multiple tiers sequentially
--   Lower priority numbers are allocated first
allocateMultiTier ::
  Graph ->
  Potentials ->
  -- | Provider
  EntityId ->
  -- | Source potential type
  PotentialType ->
  -- | Tier configurations
  [Tier] ->
  -- | Recipient → (Tier → Quantity)
  Map EntityId (Map Int SignedQuantity)
allocateMultiTier g pots provider ptype tiers =
  case getPotential pots provider ptype of
    Nothing -> Map.empty
    Just sourcePotential
      | not (isSource sourcePotential) -> Map.empty
      | otherwise ->
          let sortedTiers = sortOn tierPriority tiers
              initialCapacity = capacityOf sourcePotential
           in go sortedTiers initialCapacity Map.empty
  where
    go [] _ results = results
    go (tier : rest) remaining results
      | remaining <= 0 = results
      | otherwise =
          let -- Allocate for this tier
              tierAllocs =
                allocate
                  g
                  pots
                  provider
                  ptype
                  (tierConstraint tier)
                  (tierWeight tier)

              -- Update remaining source
              allocated = sum (Map.elems tierAllocs)
              remaining' = remaining - allocated

              -- Merge into results
              priority = tierPriority tier
              results' =
                Map.unionWith
                  Map.union
                  results
                  (Map.map (\qty -> Map.singleton priority qty) tierAllocs)
           in go rest remaining' results'

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- | Find eligible recipients
--   E = C(Participants(provider)) where C(r) > 0
eligibleRecipients ::
  Graph ->
  Potentials ->
  EntityId ->
  PotentialType ->
  -- | Source capacity for constraint evaluation
  SignedQuantity ->
  Constraint ->
  Set EntityId
eligibleRecipients g pots provider ptype sourceCapacity constraintFn =
  let participantIds = members g provider
      eligible =
        Set.filter
          ( \eid ->
              let ctx = FilterContext g pots eid (Just sourceCapacity)
                  limit = constraintFn ctx
               in limit /= Exclude && hasMatchingSink pots eid ptype
          )
          participantIds
   in eligible

-- | Check if vertex has a matching sink potential (has need)
hasMatchingSink :: Potentials -> EntityId -> PotentialType -> Bool
hasMatchingSink pots eid ptype =
  case getPotential pots eid ptype of
    Just p -> isSink p
    Nothing -> False

-- | Compute weights for eligible recipients
--   w: Entity → ℝ
computeWeights ::
  Graph ->
  Potentials ->
  PotentialType ->
  Weight ->
  Set EntityId ->
  Map EntityId Double
computeWeights g pots ptype weightFn eligible =
  Map.fromList
    [ (eid, weight)
      | eid <- Set.toList eligible,
        let ctx = WeightContext g pots eid ptype,
        let weight = weightFn ctx,
        weight > 0
    ]

-- | Normalize weights to shares (sum = 1.0)
normalizeShares :: Map EntityId Double -> Map EntityId Double
normalizeShares weights
  | Map.null weights = Map.empty
  | otherwise =
      let total = sum (Map.elems weights)
       in if total > 0
            then Map.map (/ total) weights
            else Map.empty
