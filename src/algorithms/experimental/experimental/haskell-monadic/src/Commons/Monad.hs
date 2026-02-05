{-# LANGUAGE GeneralizedNewtypeDeriving #-}
{-# LANGUAGE OverloadedStrings #-}

-- |
-- Module      : Commons.Monad
-- Description : Monadic API for Commons operations
-- Copyright   : (c) 2025
-- License     : MIT
--
-- Provides a monadic interface using StateT and WriterT for:
-- - Automatic state threading (Commons)
-- - Automatic history accumulation (AllocationRecords)
module Commons.Monad
  ( -- * The Commons monad
    CommonsM,
    runCommonsM,
    evalCommonsM,
    execCommonsM,
    liftIO,

    -- * Monadic operations
    addVertexM,
    addMembershipM,
    addPotentialM,
    performAllocationM,

    -- * Query operations
    getGraph,
    getPotentials,
    getHistory,
    getCommons,
  )
where

import Commons.Allocate (allocate)
import Commons.Graph (addEdge, addVertex)
import Commons.Potential (addPotential)
import Commons.Types
import Control.Monad.State
import Control.Monad.Writer
import Data.Map.Strict (Map)
import Data.Map.Strict qualified as Map
import Data.Text (Text)
import Data.Time (getCurrentTime)

-- ============================================================================
-- THE COMMONS MONAD
-- ============================================================================

-- | The Commons monad: StateT for Commons + WriterT for history + IO for time
newtype CommonsM a = CommonsM
  { unCommonsM :: StateT Commons (WriterT [AllocationRecord] IO) a
  }
  deriving
    ( Functor,
      Applicative,
      Monad,
      MonadState Commons,
      MonadWriter [AllocationRecord],
      MonadIO
    )

-- | Run the Commons monad, returning result, final state, and accumulated history
runCommonsM :: CommonsM a -> Commons -> IO (a, Commons, [AllocationRecord])
runCommonsM action commons = do
  ((result, finalCommons), records) <- runWriterT (runStateT (unCommonsM action) commons)
  return (result, finalCommons, records)

-- | Run the Commons monad, returning only the result and final state
evalCommonsM :: CommonsM a -> Commons -> IO (a, Commons)
evalCommonsM action commons = do
  (result, finalCommons, _) <- runCommonsM action commons
  return (result, finalCommons)

-- | Run the Commons monad, returning only the final state
execCommonsM :: CommonsM a -> Commons -> IO Commons
execCommonsM action commons = do
  (_, finalCommons, _) <- runCommonsM action commons
  return finalCommons

-- ============================================================================
-- MONADIC OPERATIONS
-- ============================================================================

-- | Add a vertex to the graph
addVertexM :: EntityId -> CommonsM ()
addVertexM eid = modify $ \commons ->
  commons {graph = addVertex eid (graph commons)}

-- | Add a membership edge
addMembershipM :: EntityId -> EntityId -> CommonsM ()
addMembershipM member parent = modify $ \commons ->
  commons {graph = addEdge member parent (graph commons)}

-- | Add a potential to a vertex
addPotentialM :: EntityId -> Potential -> CommonsM ()
addPotentialM eid pot = modify $ \commons ->
  commons {potentials = addPotential eid pot (potentials commons)}

-- | Perform allocation and automatically record it
performAllocationM ::
  -- | Provider
  EntityId ->
  -- | Source potential type
  PotentialType ->
  -- | Constraint function
  Constraint ->
  -- | Weight function
  Weight ->
  -- | Constraint description
  Text ->
  -- | Weight description
  Text ->
  CommonsM (Map EntityId SignedQuantity)
performAllocationM provider ptype constraintFn weightFn constraintDesc weightDesc = do
  -- Get current state
  commons <- get

  -- Get current time (IO action)
  timestamp <- liftIO getCurrentTime

  -- Perform pure allocation
  let allocations =
        allocate
          (graph commons)
          (potentials commons)
          provider
          ptype
          constraintFn
          weightFn

  -- Create record
  let record =
        AllocationRecord
          { arTimestamp = timestamp,
            arProvider = provider,
            arPotentialType = ptype,
            arAllocations = allocations,
            arFilter = constraintDesc,
            arWeight = weightDesc,
            arMetadata = Map.empty
          }

  -- Accumulate in Writer monad
  tell [record]

  -- Update state with new history
  modify $ \c -> c {history = record : history c}

  -- Return allocations
  return allocations

-- ============================================================================
-- QUERY OPERATIONS
-- ============================================================================

-- | Get the current graph
getGraph :: CommonsM Graph
getGraph = gets graph

-- | Get the current potentials
getPotentials :: CommonsM Potentials
getPotentials = gets potentials

-- | Get the current history
getHistory :: CommonsM History
getHistory = gets history

-- | Get the entire Commons state
getCommons :: CommonsM Commons
getCommons = get
