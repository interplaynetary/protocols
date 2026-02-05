{-# LANGUAGE OverloadedStrings #-}

-- |
-- Module      : Commons.Potential
-- Description : Potential algebra operations
-- Copyright   : (c) 2025
-- License     : MIT
--
-- Potential algebra: P(v) = {(τ, q, C)}
--
-- Operations:
--   - get/add/remove potentials
--   - aggregate up/down the graph
--   - filter by sign (sources/sinks)
--   - intuitive accessors (capacity/need)
module Commons.Potential
  ( -- * Potential operations
    getPotentials,
    getPotential,
    addPotential,
    removePotential,
    updatePotential,

    -- * Intuitive accessors (capacity/need terminology)
    capacityOf,
    needOf,
    isSource,
    isSink,

    -- * Potential queries
    sources,
    sinks,
    netMagnitude,

    -- * Graph aggregation
    aggregateUp,
    aggregateDown,
    aggregateSourcesDown,
    aggregateSinksDown,
  )
where

import Commons.Graph (members, types)
import Commons.Types
import Data.Map.Strict (Map)
import Data.Map.Strict qualified as Map
import Data.Set (Set)
import Data.Set qualified as Set

-- ============================================================================
-- POTENTIAL OPERATIONS
-- ============================================================================

-- | Get all potentials for a vertex
getPotentials :: Potentials -> EntityId -> [Potential]
getPotentials pots eid = Map.findWithDefault [] eid pots

-- | Get a specific potential by type
getPotential :: Potentials -> EntityId -> PotentialType -> Maybe Potential
getPotential pots eid ptype =
  case filter (\p -> potentialType p == ptype) (getPotentials pots eid) of
    (p : _) -> Just p
    [] -> Nothing

-- | Add a potential to a vertex
addPotential :: EntityId -> Potential -> Potentials -> Potentials
addPotential eid pot pots =
  let current = getPotentials pots eid
   in Map.insert eid (pot : current) pots

-- | Remove a potential by type
removePotential :: EntityId -> PotentialType -> Potentials -> Potentials
removePotential eid ptype pots =
  let current = getPotentials pots eid
      filtered = filter (\p -> potentialType p /= ptype) current
   in Map.insert eid filtered pots

-- | Update a potential (replace if exists, add if not)
updatePotential :: EntityId -> Potential -> Potentials -> Potentials
updatePotential eid pot pots =
  let pots' = removePotential eid (potentialType pot) pots
   in addPotential eid pot pots'

-- ============================================================================
-- INTUITIVE ACCESSORS (capacity/need terminology)
-- ============================================================================

-- | Get the capacity of a source potential
--   Returns the positive magnitude for sources, 0 for sinks
--
--   From commons.tex: "capacity when the potential is a source (q > 0)"
capacityOf :: Potential -> Double
capacityOf p = max 0 (magnitude p)

-- | Get the need of a sink potential
--   Returns the absolute value of negative magnitude for sinks, 0 for sources
--
--   From commons.tex: "need when the potential is a sink (|q| where q < 0)"
needOf :: Potential -> Double
needOf p = abs (min 0 (magnitude p))

-- | Check if potential is a source (has capacity)
isSource :: Potential -> Bool
isSource p = magnitude p > 0

-- | Check if potential is a sink (has need)
isSink :: Potential -> Bool
isSink p = magnitude p < 0

-- ============================================================================
-- POTENTIAL QUERIES
-- ============================================================================

-- | Get all source potentials (positive magnitudes)
sources :: Potentials -> EntityId -> [Potential]
sources pots eid =
  filter (\p -> magnitude p > 0) (getPotentials pots eid)

-- | Get all sink potentials (negative magnitudes)
sinks :: Potentials -> EntityId -> [Potential]
sinks pots eid =
  filter (\p -> magnitude p < 0) (getPotentials pots eid)

-- | Get net magnitude for a potential type
netMagnitude :: Potentials -> EntityId -> PotentialType -> SignedQuantity
netMagnitude pots eid ptype =
  case getPotential pots eid ptype of
    Just p -> magnitude p
    Nothing -> 0

-- ============================================================================
-- GRAPH AGGREGATION
-- ============================================================================

-- | Agg_↑(v, τ) = Σ_{c ∈ Categories(v)} (Σ_{p ∈ P(c), type(p) = τ} p.q)
--   Aggregate potential magnitudes UP through category relationships
aggregateUp :: Graph -> Potentials -> EntityId -> PotentialType -> SignedQuantity
aggregateUp g pots eid ptype =
  let categoryIds = Set.toList (types g eid)
      magnitudes =
        [ magnitude p
          | cid <- categoryIds,
            p <- getPotentials pots cid,
            potentialType p == ptype
        ]
   in sum magnitudes

-- | Agg_↓(c, τ) = Σ_{v ∈ Participants(c)} (Σ_{p ∈ P(v), type(p) = τ} p.q)
--   Aggregate potential magnitudes DOWN through participant relationships
aggregateDown :: Graph -> Potentials -> EntityId -> PotentialType -> SignedQuantity
aggregateDown g pots cid ptype =
  let participantIds = Set.toList (members g cid)
      magnitudes =
        [ magnitude p
          | eid <- participantIds,
            p <- getPotentials pots eid,
            potentialType p == ptype
        ]
   in sum magnitudes

-- | Aggregate only sources (positive magnitudes) down
aggregateSourcesDown :: Graph -> Potentials -> EntityId -> PotentialType -> SignedQuantity
aggregateSourcesDown g pots cid ptype =
  let participantIds = Set.toList (members g cid)
      magnitudes =
        [ magnitude p
          | eid <- participantIds,
            p <- getPotentials pots eid,
            potentialType p == ptype,
            magnitude p > 0
        ]
   in sum magnitudes

-- | Aggregate only sinks (negative magnitudes) down, return absolute value
aggregateSinksDown :: Graph -> Potentials -> EntityId -> PotentialType -> SignedQuantity
aggregateSinksDown g pots cid ptype =
  let participantIds = Set.toList (members g cid)
      magnitudes =
        [ magnitude p
          | eid <- participantIds,
            p <- getPotentials pots eid,
            potentialType p == ptype,
            magnitude p < 0
        ]
   in abs (sum magnitudes)
