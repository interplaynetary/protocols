{-# LANGUAGE OverloadedStrings #-}

-- |
-- Module      : Commons.Commons
-- Description : Property-based Commons system
-- Copyright   : (c) 2025
-- License     : MIT
--
-- The complete Commons system using the property-based model.
-- Commons = ⟨N, Π, {Δ_t}⟩ where N is nodes, Π is properties, Δ_t is history.
module Commons.Commons where

import Commons.Property
import Data.Map.Strict (Map)
import Data.Map.Strict qualified as Map
import Data.Set (Set)
import Data.Set qualified as Set
import Data.Text (Text)
import Data.Time (UTCTime)

-- ============================================================================
-- COMMONS SYSTEM
-- ============================================================================

-- | The complete Commons system
--   Commons = ⟨N, Π, {Δ_t}⟩
data Commons = Commons
  { -- | N: All nodes in the system
    nodes :: Map EntityId Node,
    -- | {Δ_t}: Immutable allocation history
    history :: History
  }
  deriving (Show, Eq)

-- | Empty commons
emptyCommons :: Commons
emptyCommons = Commons Map.empty []

-- ============================================================================
-- NODE OPERATIONS
-- ============================================================================

-- | Add a node to the commons
addNode :: Node -> Commons -> Commons
addNode node commons =
  commons {nodes = Map.insert (nodeId node) node (nodes commons)}

-- | Get a node from the commons
getNode :: EntityId -> Commons -> Maybe Node
getNode nid commons = Map.lookup nid (nodes commons)

-- | Update a node in the commons
updateNode :: Node -> Commons -> Commons
updateNode = addNode

-- | Remove a node from the commons
removeNode :: EntityId -> Commons -> Commons
removeNode nid commons =
  commons {nodes = Map.delete nid (nodes commons)}

-- | Check if node exists
hasNode :: EntityId -> Commons -> Bool
hasNode nid commons = Map.member nid (nodes commons)

-- | Get all node IDs
allNodeIds :: Commons -> Set EntityId
allNodeIds commons = Map.keysSet (nodes commons)

-- ============================================================================
-- GRAPH OPERATIONS (EMERGENT FROM PROPERTIES)
-- ============================================================================

-- | Get members (participants) of a type
--   Returns all nodes that have typeId in their memberOf property
members :: Commons -> EntityId -> Set EntityId
members commons typeId =
  Set.fromList
    [ nid
      | (nid, node) <- Map.toList (nodes commons),
        typeId `Set.member` getMembership node
    ]

-- | Get types (categories) of a node
--   Returns the memberOf property of the node
types :: Commons -> EntityId -> Set EntityId
types commons nid =
  case getNode nid commons of
    Just node -> getMembership node
    Nothing -> Set.empty

-- | Add an edge (membership relation)
--   Makes nid a member of typeId
addEdge :: EntityId -> EntityId -> Commons -> Commons
addEdge nid typeId commons =
  case getNode nid commons of
    Just node -> updateNode (addMembership typeId node) commons
    Nothing -> commons

-- | Remove an edge
removeEdge :: EntityId -> EntityId -> Commons -> Commons
removeEdge nid typeId commons =
  case getNode nid commons of
    Just node -> updateNode (removeMembership typeId node) commons
    Nothing -> commons

-- | Get ancestors (transitive closure of types)
ancestors :: Commons -> EntityId -> Set EntityId
ancestors commons nid = go Set.empty (types commons nid)
  where
    go visited current
      | Set.null current = visited
      | otherwise =
          let newVisited = Set.union visited current
              nextLevel = Set.unions [types commons t | t <- Set.toList current]
              unvisited = Set.difference nextLevel newVisited
           in go newVisited unvisited

-- | Get descendants (transitive closure of members)
descendants :: Commons -> EntityId -> Set EntityId
descendants commons typeId = go Set.empty (members commons typeId)
  where
    go visited current
      | Set.null current = visited
      | otherwise =
          let newVisited = Set.union visited current
              nextLevel = Set.unions [members commons m | m <- Set.toList current]
              unvisited = Set.difference nextLevel newVisited
           in go newVisited unvisited

-- ============================================================================
-- POTENTIAL OPERATIONS
-- ============================================================================

-- | Get all potentials of a specific type from a node
getNodePotentialsOfType :: EntityId -> PotentialType -> Commons -> [Potential]
getNodePotentialsOfType nid ptype commons =
  case getNode nid commons of
    Just node -> getPotentialsOfType ptype node
    Nothing -> []

-- | Add a potential to a node
addNodePotential :: EntityId -> Potential -> Commons -> Commons
addNodePotential nid pot commons =
  case getNode nid commons of
    Just node -> updateNode (addPotential pot node) commons
    Nothing -> commons

-- | Get total capacity/need of a type across all nodes
totalPotential :: Commons -> PotentialType -> SignedQuantity
totalPotential commons ptype =
  sum
    [ magnitude pot
      | node <- Map.elems (nodes commons),
        pot <- getPotentials node,
        potentialType pot == ptype
    ]

-- ============================================================================
-- AGGREGATION
-- ============================================================================

-- | Upward aggregation: sum potentials from categories
--   Agg_↑(n, τ) = Σ_{c ∈ Categories(n)} Σ_{p ∈ P(c), τ(p) = τ} q(p)
aggregateUp :: Commons -> EntityId -> PotentialType -> SignedQuantity
aggregateUp commons nid ptype =
  sum
    [ magnitude pot
      | typeId <- Set.toList (types commons nid),
        pot <- getNodePotentialsOfType typeId ptype commons
    ]

-- | Downward aggregation: sum potentials from participants
--   Agg_↓(c, τ) = Σ_{n ∈ Participants(c)} Σ_{p ∈ P(n), τ(p) = τ} q(p)
aggregateDown :: Commons -> EntityId -> PotentialType -> SignedQuantity
aggregateDown commons typeId ptype =
  sum
    [ magnitude pot
      | memberId <- Set.toList (members commons typeId),
        pot <- getNodePotentialsOfType memberId ptype commons
    ]

-- ============================================================================
-- HISTORY
-- ============================================================================

-- | Allocation record
data AllocationRecord = AllocationRecord
  { arTimestamp :: UTCTime,
    arProvider :: EntityId,
    arPotentialType :: PotentialType,
    arAllocations :: Map EntityId SignedQuantity,
    arFilter :: Text,
    arWeight :: Text,
    arMetadata :: Map Text Text
  }
  deriving (Show, Eq)

-- | Allocation history
type History = [AllocationRecord]

-- | Add a record to history
addRecord :: AllocationRecord -> Commons -> Commons
addRecord record commons =
  commons {history = record : history commons}

-- ============================================================================
-- QUERY HELPERS
-- ============================================================================

-- | Find all nodes with a specific property
nodesWithProperty :: Text -> Commons -> [Node]
nodesWithProperty key commons =
  [node | node <- Map.elems (nodes commons), hasProperty key node]

-- | Find all nodes where property matches predicate
nodesWhere :: (Node -> Bool) -> Commons -> [Node]
nodesWhere predicate commons =
  filter predicate (Map.elems (nodes commons))

-- | Find all nodes of a specific type (including descendants)
nodesOfType :: EntityId -> Commons -> Set EntityId
nodesOfType typeId commons =
  Set.union (members commons typeId) (descendants commons typeId)

-- | Find all nodes that are instances of a type (direct members only)
instancesOf :: EntityId -> Commons -> Set EntityId
instancesOf typeId commons = members commons typeId
