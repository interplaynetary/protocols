{-# LANGUAGE OverloadedStrings #-}

-- |
-- Module      : Commons.Property
-- Description : Property-based object graph model
-- Copyright   : (c) 2025
-- License     : MIT
--
-- Core property types for the property-based Commons model.
-- Everything is a node with properties; the graph emerges from properties.
module Commons.Property where

import Data.Map.Strict (Map)
import Data.Map.Strict qualified as Map
import Data.Set (Set)
import Data.Set qualified as Set
import Data.Text (Text)

-- ============================================================================
-- PROPERTY VALUES
-- ============================================================================

-- | Property value types
--   Properties can hold various types of values
data PropertyValue
  = -- | Text value
    PVText Text
  | -- | Numeric value (signed)
    PVNumber Double
  | -- | Boolean value
    PVBool Bool
  | -- | Reference to another node
    PVNodeRef EntityId
  | -- | Set of references to other nodes
    PVNodeRefs (Set EntityId)
  | -- | Potential (capacity/need)
    PVPotential Potential
  | -- | List of potentials
    PVPotentials [Potential]
  | -- | Nested property map
    PVMap (Map Text PropertyValue)
  | -- | List of values
    PVList [PropertyValue]
  deriving (Show, Eq, Ord)

-- ============================================================================
-- CORE TYPES (from Commons.Types)
-- ============================================================================

-- | Entity identifier
type EntityId = Text

-- | Signed quantity (positive = capacity, negative = need)
type SignedQuantity = Double

-- | Potential type identifier (references a node)
type PotentialType = EntityId

-- | A potential represents a flow gradient
data Potential = Potential
  { potentialType :: PotentialType,
    magnitude :: SignedQuantity,
    unit :: Maybe Text,
    resourceType :: Maybe Text,
    metadata :: Map Text Text
  }
  deriving (Show, Eq, Ord)

-- ============================================================================
-- PROPERTIES
-- ============================================================================

-- | A property with metadata
data Property = Property
  { propKey :: Text,
    propValue :: PropertyValue,
    propMetadata :: Map Text Text
  }
  deriving (Show, Eq)

-- | Create a simple property without metadata
prop :: Text -> PropertyValue -> Property
prop key val = Property key val Map.empty

-- | Create a property with metadata
propWith :: Text -> PropertyValue -> Map Text Text -> Property
propWith = Property

-- ============================================================================
-- NODES
-- ============================================================================

-- | A node with properties
--   The fundamental unit of the Commons
data Node = Node
  { nodeId :: EntityId,
    nodeProperties :: Map Text Property
  }
  deriving (Show, Eq)

-- | Create an empty node
emptyNode :: EntityId -> Node
emptyNode nid = Node nid Map.empty

-- | Add a property to a node
addProperty :: Property -> Node -> Node
addProperty p node = node {nodeProperties = Map.insert (propKey p) p (nodeProperties node)}

-- | Get a property value from a node
getProperty :: Text -> Node -> Maybe PropertyValue
getProperty key node = propValue <$> Map.lookup key (nodeProperties node)

-- | Set a property on a node
setProperty :: Text -> PropertyValue -> Node -> Node
setProperty key val = addProperty (prop key val)

-- | Remove a property from a node
removeProperty :: Text -> Node -> Node
removeProperty key node = node {nodeProperties = Map.delete key (nodeProperties node)}

-- ============================================================================
-- SPECIAL PROPERTY ACCESSORS
-- ============================================================================

-- | Get membership (categories/types this node belongs to)
--   Looks for "memberOf" property containing node references
getMembership :: Node -> Set EntityId
getMembership node =
  case getProperty "memberOf" node of
    Just (PVNodeRefs refs) -> refs
    _ -> Set.empty

-- | Set membership
setMembership :: Set EntityId -> Node -> Node
setMembership refs = setProperty "memberOf" (PVNodeRefs refs)

-- | Add a membership
addMembership :: EntityId -> Node -> Node
addMembership typeId node =
  setMembership (Set.insert typeId (getMembership node)) node

-- | Remove a membership
removeMembership :: EntityId -> Node -> Node
removeMembership typeId node =
  setMembership (Set.delete typeId (getMembership node)) node

-- | Get potentials from a node
--   Looks for "potentials" property containing potential list
getPotentials :: Node -> [Potential]
getPotentials node =
  case getProperty "potentials" node of
    Just (PVPotentials pots) -> pots
    _ -> []

-- | Set potentials
setPotentials :: [Potential] -> Node -> Node
setPotentials pots = setProperty "potentials" (PVPotentials pots)

-- | Add a potential
addPotential :: Potential -> Node -> Node
addPotential pot node =
  setPotentials (pot : getPotentials node) node

-- | Get potentials of a specific type
getPotentialsOfType :: PotentialType -> Node -> [Potential]
getPotentialsOfType ptype node =
  filter (\p -> potentialType p == ptype) (getPotentials node)

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- | Check if node has a property
hasProperty :: Text -> Node -> Bool
hasProperty key node = Map.member key (nodeProperties node)

-- | Get numeric property value
getNumericProperty :: Text -> Node -> Maybe Double
getNumericProperty key node =
  case getProperty key node of
    Just (PVNumber n) -> Just n
    _ -> Nothing

-- | Get text property value
getTextProperty :: Text -> Node -> Maybe Text
getTextProperty key node =
  case getProperty key node of
    Just (PVText t) -> Just t
    _ -> Nothing

-- | Get boolean property value
getBoolProperty :: Text -> Node -> Maybe Bool
getBoolProperty key node =
  case getProperty key node of
    Just (PVBool b) -> Just b
    _ -> Nothing

-- | Get node reference property value
getNodeRefProperty :: Text -> Node -> Maybe EntityId
getNodeRefProperty key node =
  case getProperty key node of
    Just (PVNodeRef ref) -> Just ref
    _ -> Nothing

-- | Get node references property value
getNodeRefsProperty :: Text -> Node -> Maybe (Set EntityId)
getNodeRefsProperty key node =
  case getProperty key node of
    Just (PVNodeRefs refs) -> Just refs
    _ -> Nothing
