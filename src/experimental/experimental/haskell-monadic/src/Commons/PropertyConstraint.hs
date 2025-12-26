{-# LANGUAGE LambdaCase #-}
{-# LANGUAGE OverloadedStrings #-}

-- |
-- Module      : Commons.PropertyConstraint
-- Description : Property-based constraint system
-- Copyright   : (c) 2025
-- License     : MIT
--
-- Constraints as predicates over node properties.
module Commons.PropertyConstraint where

import Commons.Commons
import Commons.Property
import Data.Map.Strict (Map)
import Data.Map.Strict qualified as Map
import Data.Set (Set)
import Data.Set qualified as Set
import Data.Text (Text)

-- ============================================================================
-- PROPERTY CONSTRAINTS
-- ============================================================================

-- | Property-based constraint
--   A constraint is a predicate over nodes based on their properties
data PropertyConstraint
  = -- | Property must exist
    PropExists Text
  | -- | Property must equal value
    PropEquals Text PropertyValue
  | -- | Numeric property > value
    PropGreaterThan Text Double
  | -- | Numeric property < value
    PropLessThan Text Double
  | -- | Numeric property >= value
    PropGreaterOrEqual Text Double
  | -- | Numeric property <= value
    PropLessOrEqual Text Double
  | -- | Property value in set
    PropIn Text (Set PropertyValue)
  | -- | Property value not in set
    PropNotIn Text (Set PropertyValue)
  | -- | Custom predicate on property value
    PropMatches Text (PropertyValue -> Bool)
  | -- | Custom predicate on entire node
    NodeMatches (Node -> Bool)
  | -- | Conjunction
    PropAnd [PropertyConstraint]
  | -- | Disjunction
    PropOr [PropertyConstraint]
  | -- | Negation
    PropNot PropertyConstraint
  | -- | Always true
    PropTrue
  | -- | Always false
    PropFalse

-- ============================================================================
-- CONSTRAINT EVALUATION
-- ============================================================================

-- | Evaluate a constraint on a node
evalConstraint :: PropertyConstraint -> Node -> Bool
evalConstraint (PropExists key) node =
  hasProperty key node
evalConstraint (PropEquals key val) node =
  getProperty key node == Just val
evalConstraint (PropGreaterThan key threshold) node =
  case getNumericProperty key node of
    Just n -> n > threshold
    Nothing -> False
evalConstraint (PropLessThan key threshold) node =
  case getNumericProperty key node of
    Just n -> n < threshold
    Nothing -> False
evalConstraint (PropGreaterOrEqual key threshold) node =
  case getNumericProperty key node of
    Just n -> n >= threshold
    Nothing -> False
evalConstraint (PropLessOrEqual key threshold) node =
  case getNumericProperty key node of
    Just n -> n <= threshold
    Nothing -> False
evalConstraint (PropIn key values) node =
  case getProperty key node of
    Just val -> val `Set.member` values
    Nothing -> False
evalConstraint (PropNotIn key values) node =
  case getProperty key node of
    Just val -> not (val `Set.member` values)
    Nothing -> True
evalConstraint (PropMatches key predicate) node =
  case getProperty key node of
    Just val -> predicate val
    Nothing -> False
evalConstraint (NodeMatches predicate) node =
  predicate node
evalConstraint (PropAnd constraints) node =
  all (\c -> evalConstraint c node) constraints
evalConstraint (PropOr constraints) node =
  any (\c -> evalConstraint c node) constraints
evalConstraint (PropNot constraint) node =
  not (evalConstraint constraint node)
evalConstraint PropTrue _ = True
evalConstraint PropFalse _ = False

-- ============================================================================
-- CONSTRAINT COMBINATORS
-- ============================================================================

-- | Combine constraints with AND
(.&&.) :: PropertyConstraint -> PropertyConstraint -> PropertyConstraint
c1 .&&. c2 = PropAnd [c1, c2]

-- | Combine constraints with OR
(.||.) :: PropertyConstraint -> PropertyConstraint -> PropertyConstraint
c1 .||. c2 = PropOr [c1, c2]

-- | Negate a constraint
notC :: PropertyConstraint -> PropertyConstraint
notC = PropNot

-- | All constraints must be satisfied
allC :: [PropertyConstraint] -> PropertyConstraint
allC = PropAnd

-- | Any constraint must be satisfied
anyC :: [PropertyConstraint] -> PropertyConstraint
anyC = PropOr

infixr 3 .&&.

infixr 2 .||.

-- ============================================================================
-- COMMON CONSTRAINTS
-- ============================================================================

-- | Node is a member of a specific type
isMemberOf :: EntityId -> PropertyConstraint
isMemberOf typeId =
  PropMatches "memberOf" $ \case
    PVNodeRefs refs -> typeId `Set.member` refs
    _ -> False

-- | Node has a specific type in its membership
hasType :: EntityId -> PropertyConstraint
hasType = isMemberOf

-- | Node has minimum reputation
minReputation :: Double -> PropertyConstraint
minReputation = PropGreaterOrEqual "reputation"

-- | Node has maximum reputation
maxReputation :: Double -> PropertyConstraint
maxReputation = PropLessOrEqual "reputation"

-- | Node has reputation in range
reputationInRange :: Double -> Double -> PropertyConstraint
reputationInRange minRep maxRep =
  PropAnd [minReputation minRep, maxReputation maxRep]

-- | Node has at least N memberships
minMembershipCount :: Int -> PropertyConstraint
minMembershipCount n =
  PropMatches "memberOf" $ \case
    PVNodeRefs refs -> Set.size refs >= n
    _ -> False

-- | Node has at most N memberships
maxMembershipCount :: Int -> PropertyConstraint
maxMembershipCount n =
  PropMatches "memberOf" $ \case
    PVNodeRefs refs -> Set.size refs <= n
    _ -> False

-- | Node has a potential of a specific type
hasPotentialOfType :: PotentialType -> PropertyConstraint
hasPotentialOfType ptype =
  PropMatches "potentials" $ \case
    PVPotentials pots -> any (\p -> potentialType p == ptype) pots
    _ -> False

-- | Node has capacity (positive potential) of a specific type
hasCapacityOfType :: PotentialType -> PropertyConstraint
hasCapacityOfType ptype =
  PropMatches "potentials" $ \case
    PVPotentials pots ->
      any (\p -> potentialType p == ptype && magnitude p > 0) pots
    _ -> False

-- | Node has need (negative potential) of a specific type
hasNeedOfType :: PotentialType -> PropertyConstraint
hasNeedOfType ptype =
  PropMatches "potentials" $ \case
    PVPotentials pots ->
      any (\p -> potentialType p == ptype && magnitude p < 0) pots
    _ -> False

-- ============================================================================
-- FILTER FROM CONSTRAINT
-- ============================================================================

-- | Convert a property constraint to a filter function
--   This allows property constraints to be used in allocation
constraintToFilter :: PropertyConstraint -> Commons -> EntityId -> Bool
constraintToFilter constraint commons nid =
  case getNode nid commons of
    Just node -> evalConstraint constraint node
    Nothing -> False

-- | Filter nodes in commons by constraint
filterNodes :: PropertyConstraint -> Commons -> [Node]
filterNodes constraint commons =
  filter (evalConstraint constraint) (Map.elems (nodes commons))

-- | Get node IDs that satisfy constraint
filterNodeIds :: PropertyConstraint -> Commons -> Set EntityId
filterNodeIds constraint commons =
  Set.fromList [nodeId node | node <- filterNodes constraint commons]
