{-# LANGUAGE OverloadedStrings #-}

{-|
Module      : Commons.Graph
Description : Graph algebra operations
Copyright   : (c) 2025
License     : MIT

Graph algebra: G = ⟨V, E⟩

Operations:
  - types(e): entities that e is a member of
  - members(t): entities that are members of t
  - ancestors(e): transitive closure upward
  - descendants(t): transitive closure downward
-}

module Commons.Graph
  ( -- * Graph construction
    addVertex
  , addEdge
  , removeVertex
  , removeEdge
    
    -- * Graph queries
  , types
  , members
  , ancestors
  , descendants
  , hasEdge
  , isType
  , isMember
  ) where

import Commons.Types
import Data.Set (Set)
import qualified Data.Set as Set
import Data.Map.Strict (Map)
import qualified Data.Map.Strict as Map

-- ============================================================================
-- GRAPH CONSTRUCTION
-- ============================================================================

-- | Add a vertex to the graph
addVertex :: EntityId -> Graph -> Graph
addVertex eid g = g { vertices = Set.insert eid (vertices g) }

-- | Add an edge: e₁ → e₂ means "e₁ is a member of e₂"
addEdge :: EntityId -> EntityId -> Graph -> Graph
addEdge from to g =
  let g' = addVertex from $ addVertex to g
      currentEdges = Map.findWithDefault Set.empty from (edges g')
      newEdges = Map.insert from (Set.insert to currentEdges) (edges g')
  in g' { edges = newEdges }

-- | Remove a vertex and all its edges
removeVertex :: EntityId -> Graph -> Graph
removeVertex eid g =
  let v' = Set.delete eid (vertices g)
      e' = Map.delete eid (edges g)
      e'' = Map.map (Set.delete eid) e'
  in Graph v' e''

-- | Remove an edge
removeEdge :: EntityId -> EntityId -> Graph -> Graph
removeEdge from to g =
  let currentEdges = Map.findWithDefault Set.empty from (edges g)
      newEdges = Set.delete to currentEdges
      e' = if Set.null newEdges
           then Map.delete from (edges g)
           else Map.insert from newEdges (edges g)
  in g { edges = e' }

-- ============================================================================
-- GRAPH QUERIES
-- ============================================================================

-- | Types(e) = {t ∈ V | (e,t) ∈ E}
--   Returns all entities that e is a member of
types :: Graph -> EntityId -> Set EntityId
types g eid = Map.findWithDefault Set.empty eid (edges g)

-- | Members(t) = {e ∈ V | (e,t) ∈ E}
--   Returns all entities that are members of t
members :: Graph -> EntityId -> Set EntityId
members g tid =
  Set.fromList
    [ eid
    | eid <- Set.toList (vertices g)
    , tid `Set.member` types g eid
    ]

-- | Ancestors(e) = transitive closure of types(e)
--   Returns all entities reachable by following type edges upward
ancestors :: Graph -> EntityId -> Set EntityId
ancestors g eid = go Set.empty (types g eid)
  where
    go visited frontier
      | Set.null frontier = visited
      | otherwise =
          let visited' = Set.union visited frontier
              next = Set.unions
                [ types g e
                | e <- Set.toList frontier
                , e `Set.notMember` visited
                ]
          in go visited' next

-- | Descendants(t) = transitive closure of members(t)
--   Returns all entities reachable by following member edges downward
descendants :: Graph -> EntityId -> Set EntityId
descendants g tid = go Set.empty (members g tid)
  where
    go visited frontier
      | Set.null frontier = visited
      | otherwise =
          let visited' = Set.union visited frontier
              next = Set.unions
                [ members g e
                | e <- Set.toList frontier
                , e `Set.notMember` visited
                ]
          in go visited' next

-- | Check if edge exists: e₁ → e₂
hasEdge :: Graph -> EntityId -> EntityId -> Bool
hasEdge g from to = to `Set.member` types g from

-- | Check if entity is a type (has members)
isType :: Graph -> EntityId -> Bool
isType g eid = not . Set.null $ members g eid

-- | Check if entity is a member (has types)
isMember :: Graph -> EntityId -> Bool
isMember g eid = not . Set.null $ types g eid
