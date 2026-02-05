═══════════════════════════════════════════════════════════════════════
ARCHITECTURE: SEPARATION OF USER-INPUT AND DERIVED STATE
═══════════════════════════════════════════════════════════════════════

**Critical Design Principle:**
User-Input and Derived values are stored in SEPARATE data structures.
Tree nodes contain REFERENCES to derived values, not the values themselves.

**Why This Matters:**
- Tree structure (user inputs) remains stable
- Derived values can be recalculated without modifying tree
- Enables reactive computation (Svelte stores, computed properties)
- No need to rewrite tree every time calculations change

**Architecture Pattern:**

```typescript
// TREE STRUCTURE (User Inputs Only - Stable)
interface TreeNode {
  id: string;
  name: string;
  type: 'Root' | 'Goal' | 'CapacitySlot' | 'NeedSlot' | 'ContributionNode';
  
  // User inputs (stable - only change when user edits)
  points?: number;
  contributors?: Contributor[];
  anti_contributors?: Contributor[];
  manual_satisfaction?: number;
  
  // References to derived state (NOT the values themselves!)
  derived_state_ref: string; // Points to entry in DerivedStateMap
  
  children: TreeNode[];
}

// DERIVED STATE (Computed Values - Ephemeral)
interface DerivedState {
  node_id: string;
  
  // Computed values (recalculated reactively)
  weight: number;
  share_of_parent: number;
  satisfaction: number;
  
  // Timestamps for cache invalidation
  computed_at: number;
  dependencies: string[]; // IDs of nodes this depends on
}

// GLOBAL DERIVED STATE STORE
type DerivedStateMap = Record<string, DerivedState>;

// REACTIVE COMPUTATION
// When user input changes:
//   1. Tree structure updated (user inputs only)
//   2. Dependent derived states marked dirty
//   3. Reactive system recomputes derived values
//   4. DerivedStateMap updated
//   5. Tree references remain valid (just point to new values)
```

**Example:**

```typescript
// User creates a node
const goalNode: TreeNode = {
  id: "goal_123",
  name: "Healthcare Goal",
  type: "Goal",
  points: 70,  // USER INPUT
  derived_state_ref: "goal_123",  // Reference
  children: [...]
};

// System computes derived state separately
derivedStateMap["goal_123"] = {
  node_id: "goal_123",
  weight: 0.35,        // COMPUTED
  share_of_parent: 0.7, // COMPUTED
  satisfaction: 0.82,   // COMPUTED
  computed_at: Date.now(),
  dependencies: ["root", "sibling_456"]
};

// To access weight:
const weight = derivedStateMap[goalNode.derived_state_ref].weight;

// When parent points change:
//   - Update parent node's points (user input)
//   - Mark goal_123 as dirty
//   - Recompute derivedStateMap["goal_123"]
//   - goalNode.derived_state_ref unchanged!
```

**Benefits:**

1. **Immutable Tree Structure**: User inputs form stable tree
2. **Reactive Computation**: Derived values recompute automatically
3. **Efficient Updates**: Only recompute what changed
4. **Cache Friendly**: Can cache derived state separately
5. **Serialization**: Tree (user inputs) can be serialized without computed junk
6. **Parallel Computation**: Derived values computed in parallel

**Svelte Store Pattern:**

```typescript
// Tree is a writable store (user inputs)
const tree = writable<TreeNode>(rootNode);

// Derived state is computed stores
const derivedState = derived([tree], ([$tree]) => {
  return computeAllDerivedStates($tree);
});

// UI accesses both:
$: weight = $derivedState[node.derived_state_ref].weight;
$: satisfaction = $derivedState[node.derived_state_ref].satisfaction;

// When user updates tree:
tree.update(t => {
  // Modify user inputs only
  findNode(t, nodeId).points = newPoints;
  return t;
});
// → derivedState automatically recomputes!
```

═══════════════════════════════════════════════════════════════════════
TREE STRUCTURE (User Inputs Only)
═══════════════════════════════════════════════════════════════════════

State: Tree (User Inputs - Stable)
    Root
        id: string
        name: string
        entity_id: string
        
        User-Input: Contribution Node
            id: string
            name: string
            manual_satisfaction?: number
            User-Input: Contributors with Points
                id: string
                points: number
            User-Input: Anti-Contributors with Points (optional)
                id: string
                points: number
                
        User-Input: Higher-Order-Goal
            id: string
            name: string
            User-Input: Points (relative to siblings)
            
            User-Input: Capacity-Slot of Capacity-Type
                id: string
                name: string
                resource_type: string
                User-Input: Points (relative to siblings)
                User-Input: Available-Quantity
                User-Input: Contributors (default: empty = self)
                User-Input: Filters (optional)
                
                User-Input: Need-Slot of Need-Type
                    id: string
                    name: string
                    resource_type: string
                    User-Input: Points (relative to siblings)
                    User-Input: Declared-Quantity
                    User-Input: Specifications (optional)
                    
                    Allocation-Derived: (stored separately)
                        allocation_id: string
                        provider_id: string
                        capacity_slot_id: string
                        Offered-Quantity (computed)
                        User-Input: Accepted-Quantity
                        User-Input: Satisfaction :: Portion ∈ [0.0, 1.0]
                        Derived: Declined-Quantity = Offered - Accepted
                    ...
                ...
            ...

═══════════════════════════════════════════════════════════════════════
DERIVED STATE (Computed Values - Reactive)
═══════════════════════════════════════════════════════════════════════

Derived State Map: Record<node_id, DerivedState>

For Each Node:
    Derived: Weight = (Points / Parent_Total_Points) × Parent_Weight
    Derived: ShareOfParent = Points / Parent_Total_Points
    Derived: Satisfaction (aggregated from children or slots)
    
For Each Capacity-Slot:
    Derived: Weight (recursive from parent)
    Derived: Satisfaction (aggregated from needs)
    Derived: Allocated-Quantity (sum of allocations)
    
For Each Need-Slot:
    Derived: Weight (recursive from parent)
    Derived: Satisfaction (aggregated from allocations)
    Derived: Remaining-Need = Declared - Total-Accepted
    
For Each Allocation:
    Derived: Offered-Quantity (from allocation algorithm)
    Derived: Declined-Quantity = Offered - Accepted

═══════════════════════════════════════════════════════════════════════
REACTIVE COMPUTATION FLOW
═══════════════════════════════════════════════════════════════════════

User Edit → Tree Update (User Inputs Only)
    ↓
Dependency Graph Analysis
    ↓
Mark Affected Derived States as Dirty
    ↓
Reactive Recomputation (Parallel Where Possible)
    ↓
Update DerivedStateMap (New Values)
    ↓
UI Reactively Updates (Svelte/React/Vue)

**Example Scenario:**

1. User changes node points: 70 → 80
   - Update tree: node.points = 80
   - Mark dirty: [node, parent, siblings, children]
   
2. Reactive system recomputes:
   - Parent total points changed → recalc all sibling shares
   - This node's weight changed → recalc this node
   - Children depend on parent weight → recalc children
   
3. DerivedStateMap updated:
   - derivedState[node.id].weight = 0.40 (was 0.35)
   - derivedState[sibling.id].share_of_parent = 0.30 (was 0.35)
   - derivedState[child.id].weight = 0.20 (was 0.175)
   
4. Tree structure unchanged:
   - node.points = 80 (updated)
   - node.derived_state_ref = "node_id" (unchanged!)
   - node.children = [...] (unchanged!)

**Key Insight:**

User inputs and derived values happen IN PARALLEL in separate data structures.
Each node has a REFERENCE to its derived state.
We access the most up-to-date derivation without modifying the tree.


Synthezied:

State: Tree (User Inputs - Stable)
    Root
        id: string
        name: string
        entity_id: string
        
        User-Input: Contribution Node
            id: string
            name: string
            manual_satisfaction?: number
            User-Input: Contributors with Points
                id: string
                points: number
            User-Input: Anti-Contributors with Points (optional)
                id: string
                points: number
                
        User-Input: Higher-Order-Goal
            id: string
            name: string
            User-Input: Points (relative to siblings)
            
            User-Input: Capacity-Slot of Capacity-Type
                id: string
                name: string
                resource_type: string
                User-Input: Points (relative to siblings)
                Derived: Weight (recursive from parent)
                Derived: Satisfaction (aggregated from needs)
                
                User-Input: Need-Slot of Need-Type
                    id: string
                    name: string
                    resource_type: string
                    User-Input: Points (relative to siblings)
                    Derived: Weight (recursive from parent)
                    Derived: Satisfaction (aggregated from allocations)
                    
                    Allocation-Derived: (stored separately)
                        allocation_id: string
                        provider_id: string
                        capacity_slot_id: string
                        Offered-Quantity (computed)
                        User-Input: Accepted-Quantity
                        User-Input: Satisfaction :: Portion ∈ [0.0, 1.0]
                        Derived: Declined-Quantity = Offered-Quantity - Accepted-Quantity
                    ...
                ...
            ...


═══════════════════════════════════════════════════════════════════════
SYMBOLIC LINKS: CROSS-ENTITY TREE REFERENCES
═══════════════════════════════════════════════════════════════════════

**Core Insight:**
At any point in a tree, you can create a symbolic link (pointer) to any 
tree/subtree/node of another entity's tree. This enables recognizing 
external contributions without duplicating their entire tree structure.

**Example Use Case:**

```
Entity A (Space Advocacy Org):
  Root: "Space Exploration Advocacy"
    Goal: "Public Outreach"
      SymLink → NASA.tree["Public Education Programs"]  // Cross-entity reference
      SymLink → SpaceX.tree["Starship Updates"]
    Goal: "Research Funding"
      SymLink → NSF.tree["Space Grants"]
```

Entity A doesn't need NASA's full tree. They only care about NASA's 
"Public Education Programs" subtree and how satisfied NASA is with it.

**Key Properties:**

1. **Any-Level Linking**: Can link to:
   - Entire tree (Root)
   - Subtree (any Goal node)
   - Single slot (CapacitySlot or NeedSlot)
   - Leaf node (ContributionNode)

2. **Read-Only Remote Access**: 
   - You can't modify the linked entity's tree
   - You only read their ShareOfGeneralSatisfaction distribution
   - You subscribe to updates, not edit permissions

3. **Recognition Without Ownership**:
   - Linking means "I recognize this contributes to my goals"
   - You still assign local points to express how much you value it
   - Combined with their internal satisfaction to compute final contribution

═══════════════════════════════════════════════════════════════════════
TREE STORAGE: ID-BASED REFERENCES WITH REUSABLE NODES
═══════════════════════════════════════════════════════════════════════

**Architecture Change:**
Trees are stored as **flat lists of node IDs** with references, not nested objects.

**Why:**
- Efficient updates (modify one node, not rebuild tree)
- Easy symbolic link resolution (just reference IDs)
- Enables caching and pub-sub propagation
- Simpler synchronization across distributed systems
- **Allows nodes to appear in multiple places in the tree**

**Key Insight: Node Reuse**
A node can be referenced in multiple places in the tree, potentially with 
different children at each reference point. This enables:
- A capacity to appear under multiple goals
- A need to be fulfilled by multiple capacity providers
- Same resource offered in different contexts

**Storage Format:**

```typescript
// Tree stored as map of node IDs to nodes
type TreeStore = {
  entity_id: string;
  root_id: string;  // Entry point
  nodes: Record<NodeId, NodeDefinition>;  // Canonical node definitions
  tree_references: Record<TreeRefId, TreeReference>;  // How nodes are used in tree
  derived_state: Record<NodeId, DerivedState>;  // Computed values
}

// Canonical node definition (the "base" node)
interface NodeDefinition {
  id: string;
  type: 'Root' | 'Goal' | 'CapacitySlot' | 'NeedSlot' | 'ContributionNode' | 'SymLink';
  name: string;
  
  // Core node data
  points?: number;
  contributors?: Contributor[];
  resource_type?: string;
  available_quantity?: number;
  declared_quantity?: number;
  
  // Default children (used if not overridden in tree reference)
  default_child_ids: string[];
  
  // Symbolic link specific
  symlink_target?: SymLinkTarget;
}

// Tree reference (how a node is used in a specific location)
interface TreeReference {
  ref_id: string;           // Unique ID for this reference
  node_id: string;          // Which node definition this references
  parent_ref_id?: string;   // Parent reference (not node!)
  
  // Optional overrides for this specific tree placement
  child_ref_ids?: string[]; // Override children for this reference
  points_override?: number; // Override points at this location
}

interface SymLinkTarget {
  entity_id: string;     // Which entity's tree
  node_id: string;       // Which node in their tree
  link_type: 'tree' | 'subtree' | 'node';  // What to include
}
```

**Example: Node Reuse**

```typescript
// Entity with a capacity that appears in multiple goals
const entityA_tree: TreeStore = {
  entity_id: "entity_a",
  root_id: "ref_root",
  
  // Canonical node definitions (the actual nodes)
  nodes: {
    "root_1": {
      id: "root_1",
      type: "Root",
      name: "Community Garden",
      default_child_ids: []
    },
    "goal_education": {
      id: "goal_education",
      type: "Goal",
      name: "Educational Programs",
      points: 70,
      default_child_ids: []
    },
    "goal_production": {
      id: "goal_production",
      type: "Goal", 
      name: "Food Production",
      points: 30,
      default_child_ids: []
    },
    "capacity_garden_space": {
      id: "capacity_garden_space",
      type: "CapacitySlot",
      name: "Garden Plot Access",
      resource_type: "space",
      available_quantity: 100,  // 100 sq meters
      default_child_ids: []  // Default: no specific needs
    },
    "need_school_plot": {
      id: "need_school_plot",
      type: "NeedSlot",
      name: "School Garden Plot",
      resource_type: "space",
      declared_quantity: 40,
      default_child_ids: []
    },
    "need_composting": {
      id: "need_composting",
      type: "NeedSlot",
      name: "Composting Area",
      resource_type: "space",
      declared_quantity: 15,
      default_child_ids: []
    },
    "need_crop_beds": {
      id: "need_crop_beds",
      type: "NeedSlot",
      name: "Vegetable Beds",
      resource_type: "space",
      declared_quantity: 60,
      default_child_ids: []
    }
  },
  
  // Tree references (how nodes are arranged in the tree)
  tree_references: {
    "ref_root": {
      ref_id: "ref_root",
      node_id: "root_1",
      parent_ref_id: undefined,
      child_ref_ids: ["ref_goal_edu", "ref_goal_prod"]
    },
    
    // Education goal branch
    "ref_goal_edu": {
      ref_id: "ref_goal_edu",
      node_id: "goal_education",
      parent_ref_id: "ref_root",
      child_ref_ids: ["ref_cap_edu"]  // Reference to capacity
    },
    "ref_cap_edu": {
      ref_id: "ref_cap_edu",
      node_id: "capacity_garden_space",  // REUSING the same capacity node
      parent_ref_id: "ref_goal_edu",
      points_override: 80,  // Within education goal, this is 80 points
      child_ref_ids: ["ref_need_school"]  // Override: only school plot for education
    },
    "ref_need_school": {
      ref_id: "ref_need_school",
      node_id: "need_school_plot",
      parent_ref_id: "ref_cap_edu"
    },
    
    // Production goal branch
    "ref_goal_prod": {
      ref_id: "ref_goal_prod",
      node_id: "goal_production",
      parent_ref_id: "ref_root",
      child_ref_ids: ["ref_cap_prod"]  // Reference to capacity
    },
    "ref_cap_prod": {
      ref_id: "ref_cap_prod",
      node_id: "capacity_garden_space",  // REUSING the same capacity node!
      parent_ref_id: "ref_goal_prod",
      points_override: 60,  // Within production goal, this is 60 points
      child_ref_ids: ["ref_need_compost", "ref_need_crops"]  // Different children!
    },
    "ref_need_compost": {
      ref_id: "ref_need_compost",
      node_id: "need_composting",
      parent_ref_id: "ref_cap_prod"
    },
    "ref_need_crops": {
      ref_id: "ref_need_crops",
      node_id: "need_crop_beds",
      parent_ref_id: "ref_cap_prod"
    }
  },
  
  derived_state: {
    "root_1": { weight: 1.0, satisfaction: 0.75 },
    "goal_education": { weight: 0.7, satisfaction: 0.68 },
    "goal_production": { weight: 0.3, satisfaction: 0.82 },
    "capacity_garden_space": { weight: 0.56, satisfaction: 0.71 },
    "need_school_plot": { weight: 0.56, satisfaction: 0.85 },
    "need_composting": { weight: 0.09, satisfaction: 0.60 },
    "need_crop_beds": { weight: 0.21, satisfaction: 0.90 }
  }
}
```

**Key Benefits:**

1. **Same capacity, different contexts:**
   - `capacity_garden_space` appears in both education and production goals
   - Different children (needs) in each context
   - Different points/weights in each context

2. **Efficient storage:**
   - Node definition stored once
   - Multiple references point to it
   - Override only what's different

3. **Flexible modeling:**
   - Model reality: same resource serves multiple purposes
   - Track total capacity once, allocate across multiple needs
   - Different satisfaction in different contexts

**Navigation:**

```typescript
// Get node definition from reference
function getNode(tree: TreeStore, ref_id: string): NodeDefinition {
  const ref = tree.tree_references[ref_id];
  return tree.nodes[ref.node_id];
}

// Get children references
function getChildRefs(tree: TreeStore, ref_id: string): TreeReference[] {
  const ref = tree.tree_references[ref_id];
  const node = tree.nodes[ref.node_id];
  
  // Use override if present, otherwise use default
  const childRefIds = ref.child_ref_ids ?? 
                      node.default_child_ids.map(id => findRefForNode(tree, id, ref_id));
  
  return childRefIds.map(id => tree.tree_references[id]);
}

// Get effective points (with override)
function getEffectivePoints(tree: TreeStore, ref_id: string): number {
  const ref = tree.tree_references[ref_id];
  const node = tree.nodes[ref.node_id];
  
  return ref.points_override ?? node.points ?? 0;
}

// Traverse upward
function getAncestorRefs(tree: TreeStore, ref_id: string): TreeReference[] {
  const ancestors = [];
  let current = tree.tree_references[ref_id];
  while (current.parent_ref_id) {
    current = tree.tree_references[current.parent_ref_id];
    ancestors.push(current);
  }
  return ancestors;
}
```

═══════════════════════════════════════════════════════════════════════
SUBSCRIPTION CACHE: TRACTABLE CROSS-ENTITY CALCULATION
═══════════════════════════════════════════════════════════════════════

**Problem:**
Computing allocations across entities requires knowing their satisfaction 
distributions. You CAN'T traverse entire remote trees every time—too expensive.

**Solution:**
Maintain a **subscription cache** of remote satisfaction distributions.

**Pub-Sub Model:**

```
Entity A has SymLink → NASA.tree["education_goal"]

Subscription:
  A subscribes to topic: "nasa/satisfaction/education_goal"
  
Publish:
  NASA computes satisfaction for education_goal → publishes update
  
Cache:
  A receives update → caches NASA's satisfaction distribution locally
  
Allocation Computation:
  A uses cached satisfaction values (not live tree traversal)
```

**Cache Structure:**

```typescript
interface SymLinkCache {
  // Which symbolic links we're subscribed to
  subscriptions: Record<SymLinkId, SymLinkSubscription>;
  
  // Cached satisfaction data from remote entities
  remote_satisfaction: Record<SymLinkId, RemoteSatisfactionData>;
}

interface SymLinkSubscription {
  symlink_id: string;           // Local symlink node ID
  target_entity_id: string;     // Remote entity
  target_node_id: string;       // Remote node
  subscribed_at: number;        // When we subscribed
  last_update: number;          // Last time we got data
}

interface RemoteSatisfactionData {
  entity_id: string;
  node_id: string;
  
  // The critical data we need for allocation
  satisfaction: number;         // 0.0-1.0
  weight: number;               // Within their tree
  
  // ShareOfGeneralSatisfaction distribution for this subtree
  // (Who THEY recognize as contributing to this goal)
  contributor_shares: Record<EntityId, number>;
  
  // Metadata
  computed_at: number;
  tree_version: string;         // For change detection
}
```

**Example Cache:**

```typescript
const entityA_cache: SymLinkCache = {
  subscriptions: {
    "a_symlink_1": {
      symlink_id: "a_symlink_1",
      target_entity_id: "nasa",
      target_node_id: "nasa_education_goal",
      subscribed_at: 1704672000,
      last_update: 1704675600
    },
    "a_symlink_2": {
      symlink_id: "a_symlink_2",
      target_entity_id: "spacex", 
      target_node_id: "spacex_comms_capacity",
      subscribed_at: 1704672000,
      last_update: 1704675300
    }
  },
  
  remote_satisfaction: {
    "a_symlink_1": {
      entity_id: "nasa",
      node_id: "nasa_education_goal",
      satisfaction: 0.82,        // NASA's calculated satisfaction
      weight: 0.25,              // Within NASA's tree
      contributor_shares: {
        "smithsonian": 0.35,     // NASA recognizes Smithsonian 35%
        "planetarium_network": 0.28,
        "university_consortium": 0.22,
        "entity_a": 0.15         // NASA recognizes Entity A 15%!
      },
      computed_at: 1704675600,
      tree_version: "nasa_v142"
    },
    "a_symlink_2": {
      entity_id: "spacex",
      node_id: "spacex_comms_capacity",
      satisfaction: 0.45,
      weight: 0.08,
      contributor_shares: {
        "marketing_team": 0.60,
        "entity_a": 0.25,        // SpaceX recognizes Entity A 25%
        "media_partners": 0.15
      },
      computed_at: 1704675300,
      tree_version: "spacex_v89"
    }
  }
}
```

═══════════════════════════════════════════════════════════════════════
PUB-SUB PROPAGATION: EFFICIENT UPDATES
═══════════════════════════════════════════════════════════════════════

**Topic Structure:**

```
Topics follow pattern: {entity_id}/satisfaction/{node_id}

Examples:
  "nasa/satisfaction/education_goal"
  "spacex/satisfaction/comms_capacity"  
  "entity_a/satisfaction/root"
```

**Subscription Flow:**

```
1. Entity A creates SymLink to NASA's node
   ↓
2. A subscribes to topic: "nasa/satisfaction/education_goal"
   ↓
3. NASA computes satisfaction (during their calculation cycle)
   ↓
4. NASA publishes to topic: "nasa/satisfaction/education_goal"
   Message: { satisfaction: 0.82, weight: 0.25, contributor_shares: {...} }
   ↓
5. A receives update → stores in cache
   ↓
6. A's allocation computation uses cached value (no tree traversal!)
```

**Propagation Algorithm:**

```typescript
// When NASA recalculates their tree
function propagateSatisfactionUpdates(
  entity: EntityState,
  tree: TreeStore,
  derived_state: DerivedStateMap
) {
  // For each node in the tree
  for (const node_id in tree.nodes) {
    const node = tree.nodes[node_id];
    const state = derived_state[node_id];
    
    // Check if anyone is subscribed to this node
    const subscribers = getSubscribers(`${entity.entity_id}/satisfaction/${node_id}`);
    
    if (subscribers.length > 0) {
      // Compute contributor shares for this node's subtree
      const contributorShares = computeShareOfGeneralSatisfaction(
        tree,
        derived_state,
        node_id
      );
      
      // Publish update
      publish(`${entity.entity_id}/satisfaction/${node_id}`, {
        entity_id: entity.entity_id,
        node_id: node_id,
        satisfaction: state.satisfaction,
        weight: state.weight,
        contributor_shares: contributorShares,
        computed_at: Date.now(),
        tree_version: entity.tree_version
      });
    }
  }
}
```

**Incremental Updates:**

Only publish when values actually change:

```typescript
function shouldPublishUpdate(
  previous: RemoteSatisfactionData,
  current: RemoteSatisfactionData,
  threshold: number = 0.01  // 1% change threshold
): boolean {
  // Check if satisfaction changed significantly
  if (Math.abs(current.satisfaction - previous.satisfaction) > threshold) {
    return true;
  }
  
  // Check if any contributor share changed significantly
  for (const entity_id in current.contributor_shares) {
    const prevShare = previous.contributor_shares[entity_id] || 0;
    const currShare = current.contributor_shares[entity_id];
    if (Math.abs(currShare - prevShare) > threshold) {
      return true;
    }
  }
  
  return false;
}
```

**Subscription Management:**

```typescript
interface SubscriptionManager {
  // Track all subscriptions
  active_subscriptions: Map<Topic, Set<EntityId>>;
  
  // Subscribe to a topic
  subscribe(topic: string, subscriber_id: string): void;
  
  // Unsubscribe (when symlink deleted)
  unsubscribe(topic: string, subscriber_id: string): void;
  
  // Get all subscribers to a topic
  getSubscribers(topic: string): string[];
  
  // Publish to all subscribers
  publish(topic: string, data: RemoteSatisfactionData): void;
}
```

═══════════════════════════════════════════════════════════════════════
ALLOCATION WITH SYMBOLIC LINKS
═══════════════════════════════════════════════════════════════════════

**Computing ShareOfGeneralSatisfaction with SymLinks:**

```typescript
function computeShareWithSymLinks(
  tree: TreeStore,
  derived_state: DerivedStateMap,
  cache: SymLinkCache,
  target_contributor: EntityId
): number {
  let totalShare = 0;
  
  // Traverse tree to find all contribution nodes
  for (const node_id in tree.nodes) {
    const node = tree.nodes[node_id];
    const state = derived_state[node_id];
    
    if (node.type === 'ContributionNode' && node.contributors) {
      // Direct contributor recognition
      const contributor = node.contributors.find(c => c.id === target_contributor);
      if (contributor) {
        const nodeShare = (contributor.points / sumPoints(node.contributors)) 
                        * state.weight 
                        * state.satisfaction;
        totalShare += nodeShare;
      }
    }
    
    if (node.type === 'SymLink' && node.symlink_target) {
      // Indirect recognition via symbolic link
      const cached = cache.remote_satisfaction[node_id];
      if (cached && cached.contributor_shares[target_contributor]) {
        // The remote entity recognizes this contributor
        // Weight it by our local importance of this symlink
        const localWeight = state.weight;  // How important this symlink is in our tree
        const remoteShare = cached.contributor_shares[target_contributor];  // Their recognition
        const remoteSatisfaction = cached.satisfaction;  // How satisfied they are
        
        const symlinkShare = localWeight * remoteShare * remoteSatisfaction;
        totalShare += symlinkShare;
      }
    }
  }
  
  return totalShare;
}
```

**Example Calculation:**

```
Entity A calculating ShareOfGeneralSatisfaction for "entity_b":

1. Direct Recognition (Contribution nodes):
   Node "marketing_efforts" has entity_b with 40 points (out of 100 total)
   weight=0.3, satisfaction=0.8
   → 0.4 × 0.3 × 0.8 = 0.096

2. Indirect Recognition (SymLink to NASA):
   SymLink "nasa_education" has weight=0.56 in A's tree
   NASA's cached data shows entity_b gets 0.15 share from NASA
   NASA's satisfaction for this node = 0.82
   → 0.56 × 0.15 × 0.82 = 0.069
   
3. Indirect Recognition (SymLink to SpaceX):
   SymLink "spacex_comms" has weight=0.14 in A's tree
   SpaceX's cached data shows entity_b gets 0.25 share from SpaceX
   SpaceX's satisfaction = 0.45
   → 0.14 × 0.25 × 0.45 = 0.016

Total Share: 0.096 + 0.069 + 0.016 = 0.181 (18.1%)
```

**Key Insight:**
Entity A values NASA's education programs (weight=0.56 in their tree).
NASA values entity_b (0.15 share in NASA's contributor distribution).
Therefore, A should value entity_b transitively for their contribution to NASA.

═══════════════════════════════════════════════════════════════════════
TRACTABILITY ANALYSIS
═══════════════════════════════════════════════════════════════════════

**Without Caching (Naïve Approach):**
```
For each allocation cycle:
  For each entity A:
    For each symlink in A's tree:
      Traverse remote entity's ENTIRE tree
      Compute satisfaction from scratch
      Compute contributor shares from scratch
      
Complexity: O(Entities × SymLinks × RemoteTreeSize)
With 1000 entities, 10 symlinks each, trees of 100 nodes:
  = 1,000,000 tree traversals per cycle
  = INTRACTABLE
```

**With Subscription Cache (This Design):**
```
Offline (when trees change):
  Each entity computes their own tree ONCE
  Publishes to subscribed topics
  Subscribers cache the results
  
During allocation cycle:
  For each entity A:
    For each symlink in A's tree:
      Look up cached satisfaction (O(1) hash lookup)
      Use cached contributor_shares (already computed)
      
Complexity: O(Entities × SymLinks × 1)
With same parameters:
  = 10,000 cache lookups per cycle
  = TRACTABLE ✓
```

**Space Complexity:**
```
Per entity cache storage:
  SymLinks × (Satisfaction data + Contributor shares)
  
Assume 10 symlinks, 20 contributors per linked node:
  10 × (8 bytes + 20 × 16 bytes) = 10 × 328 bytes = 3.28 KB per entity
  
For 10,000 entities: 32.8 MB total cache
  = Easily fits in memory ✓
```

**Update Frequency:**
```
Trees don't change every second—they change on allocation cycles.

Typical update pattern:
  - Allocation cycle runs: every hour (or day)
  - Satisfaction ratings added: after allocations
  - Tree structure changes: manually (rare)
  
Update propagation:
  1 cycle → 10,000 entities → 100,000 symlinks (worst case)
  = 100,000 pub-sub messages per cycle
  = Easily handled by message queue systems ✓
```

═══════════════════════════════════════════════════════════════════════
SCHEMA ADDITIONS FOR SYMBOLIC LINKS
═══════════════════════════════════════════════════════════════════════

```typescript
// SymLink Node Type
const SymLinkNodeSchema = BaseNodeSchema.extend({
  type: z.literal('SymLink'),
  points: PointsSchema,  // How much THIS entity values the link
  
  symlink_target: z.object({
    entity_id: EntityIdSchema,
    node_id: z.string(),
    link_type: z.enum(['tree', 'subtree', 'node'])
  }),
  
  // SymLinks are leaf nodes (no local children)
  default_child_ids: z.array(z.never()).default([]),
  parent_id: z.string()
});

type SymLinkNode = z.infer<typeof SymLinkNodeSchema>;

// Base node definition (canonical node in flat store)
const NodeDefinitionSchema = z.union([
  RootNodeSchema,
  GoalNodeSchema,
  CapacitySlotSchema,
  ContributionNodeSchema,
  ContributionNodeSchema,
  SymLinkNodeSchema,
]).extend({
  default_child_ids: z.array(z.string())  // Default children if not overridden
});

type NodeDefinition = z.infer<typeof NodeDefinitionSchema>;

// Tree reference (how a node appears in a specific tree location)
const TreeReferenceSchema = z.object({
  ref_id: z.string(),
  node_id: z.string(),  // Points to NodeDefinition
  parent_ref_id: z.string().optional(),
  
  // Optional overrides for this specific placement
  child_ref_ids: z.array(z.string()).optional(),  // Override children
  points_override: PointsSchema.optional()  // Override points
});

type TreeReference = z.infer<typeof TreeReferenceSchema>;

// Flat tree storage with reusable nodes
const TreeStoreSchema = z.object({
  entity_id: EntityIdSchema,
  root_id: z.string(),  // Points to root TreeReference
  nodes: z.record(z.string(), NodeDefinitionSchema),  // Canonical node definitions
  tree_references: z.record(z.string(), TreeReferenceSchema),  // Tree structure
  derived_state: z.record(z.string(), DerivedStateSchema)
});

type TreeStore = z.infer<typeof TreeStoreSchema>;

// Subscription cache
const RemoteSatisfactionDataSchema = z.object({
  entity_id: EntityIdSchema,
  node_id: z.string(),
  satisfaction: SatisfactionSchema,
  weight: z.number().min(0).max(1),
  contributor_shares: z.record(EntityIdSchema, z.number().min(0).max(1)),
  computed_at: TimestampSchema,
  tree_version: z.string()
});

const SymLinkCacheSchema = z.object({
  subscriptions: z.record(z.string(), z.object({
    symlink_id: z.string(),
    target_entity_id: EntityIdSchema,
    target_node_id: z.string(),
    subscribed_at: TimestampSchema,
    last_update: TimestampSchema
  })),
  remote_satisfaction: z.record(z.string(), RemoteSatisfactionDataSchema)
});

type SymLinkCache = z.infer<typeof SymLinkCacheSchema>;

// Updated entity state
const EntityStateSchema = z.object({
  tree_store: TreeStoreSchema,  // Flat store with reusable nodes
  symlink_cache: SymLinkCacheSchema,
  share_map: ShareMapSchema,
  last_updated: TimestampSchema
});
```

═══════════════════════════════════════════════════════════════════════
SATISFACTION AGGREGATION FORMULAS
═══════════════════════════════════════════════════════════════════════

Need-Slot Satisfaction (weighted by accepted quantity):
    Σ(allocation.accepted × allocation.satisfaction) / Σ(allocation.accepted)
    
    If no allocations: 0.0

Capacity-Slot Satisfaction (weighted by child weights):
    Σ(need_slot.weight × need_slot.satisfaction) / Σ(need_slot.weight)
    
    If no needs: 0.0

Goal Satisfaction (weighted by child weights):
    Σ(child.weight × child.satisfaction) / Σ(child.weight)
    
    For leaf contribution nodes: Uses manual_satisfaction if provided, else 1.0
    For empty leaf nodes: 0.0

═══════════════════════════════════════════════════════════════════════
BOOTSTRAP & COEXISTENCE MODEL
═══════════════════════════════════════════════════════════════════════

Non-Slot Contributors (Initial/Ongoing Recognition):
    - User directly inputs contributor points at root or goal nodes
    - Represents contributions not tied to specific resource allocations
    - Examples: mission alignment, advocacy, coordination, intangible value
    - These contribute to satisfaction calculation alongside slot-based data
    - Do NOT decay or get replaced by slot-based satisfaction
    
    Usage:
        - Cold start: Establish initial recognition before any allocations
SATISFACTION AGGREGATION FORMULAS
═══════════════════════════════════════════════════════════════════════

Need-Slot Satisfaction (weighted by accepted quantity):
    Σ(allocation.accepted × allocation.satisfaction) / Σ(allocation.accepted)
    
    If no allocations: 0.0

Capacity-Slot Satisfaction (weighted by child weights):
    Σ(need_slot.weight × need_slot.satisfaction) / Σ(need_slot.weight)
    
    If no needs: 0.0

Goal Satisfaction (weighted by child weights):
    Σ(child.weight × child.satisfaction) / Σ(child.weight)
    
    For leaf contribution nodes: Uses manual_satisfaction if provided, else 1.0
    For empty leaf nodes: 0.0
        - Ongoing: Recognize intangible contributions parallel to tangible resources
        - Bootstrap new relationships: Give initial points to build trust and recognition

Slot-Based Satisfaction (Operational Feedback):
    - Automatically derived from actual allocation outcomes
    - Represents concrete resource exchange satisfaction
    - Continuously updated as allocations occur and are rated
    - Provides objective feedback on resource utility
    
Coexistence:
    Both non-slot and slot-based contributions flow into the same 
    ShareOfGeneralSatisfaction calculation:
    
    Total contribution = Non-Slot contribution + Slot-Based contribution
    
    Example:
        Entity A recognizes Entity B with:
        - Non-Slot node: 40 points (30% of non-slot contributors)
        - Slot satisfactions: contributes 20% via resource allocations
        
        Both contributions aggregate into Entity B's total share
        according to their respective weights in the tree

    This enables:
        ✓ New relationships to start with trust (non-slot points)
        ✓ Established relationships to be validated by outcomes (slot satisfaction)
        ✓ Intangible contributions to be recognized alongside tangible ones
        ✓ Gradual trust-building as allocation history develops

═══════════════════════════════════════════════════════════════════════
CONTRIBUTOR SHARE CALCULATION
═══════════════════════════════════════════════════════════════════════

ShareOfGeneralSatisfaction(Target_Entity, Contributor):
    Step 1: Calculate influence pools across all nodes
        P_total = Σ(contribution_nodes: node.weight × node.satisfaction)
        N_total = Σ(nodes_with_anti_contributors: node.weight × node.dissatisfaction)
        
        where dissatisfaction = 1.0 - satisfaction
    
    Step 2: Calculate recognition pools
        TotalInfluence = P_total + N_total
        PositivePool = P_total / TotalInfluence
        AntiPool = N_total / TotalInfluence
    
    Step 3: Calculate contributor's raw shares
        For each contribution node where Contributor is listed:
            ContributorShare = (node.weight × node.satisfaction) × 
                             (contributor.points / total_contributor_points)
        
        RawPositiveShare = Σ(all positive contribution shares)
        RawAntiShare = Σ(all anti-contribution shares)
    
    Step 4: Apply pool-bounded recognition
        BoundedPositiveShare = (RawPositiveShare / P_total) × PositivePool
        BoundedAntiShare = (RawAntiShare / N_total) × AntiPool
        
        FinalShare = BoundedPositiveShare - BoundedAntiShare

ShareOfTotal-Satisfaction_A→B = ShareOfGeneralSatisfaction(A, B)

═══════════════════════════════════════════════════════════════════════
ALLOCATION MODEL
═══════════════════════════════════════════════════════════════════════

Collective-Satisfaction(Capacity-Contributors):
    When multiple entities co-provide capacity:
        For each contributor C in Capacity-Contributors:
            CollectiveShare_C = ShareOfGeneralSatisfaction with other contributors
        
        Normalize shares to sum to 1.0

## Allocation

*The Core Mechanism*

Entities have **needs** (goals whose realization depends on capacity) and **availabilities** (capacities they can provide). The challenge is multi-provider, multi-recipient need satisfaction under constraints:

$$
Find \ X \ s.t. \ \forall i, \sum_j X_{ij} \le C_i \land \forall j, \sum_i X_{ij} \le N_j
$$

*Capacity $C_i$ of provider i, $N_j$ = Need of recipient j.*

#### Provider Constraints

Each provider has finite capacities (each summing to 100%) to distribute among compatible recipients. They prefer to allocate to needs whose contributions they value most highly.

#### Recipient Constraints

Each recipient has specific needs with finite capacity requirements. They prefer to receive from providers they trust/value most highly.

#### Two-Sided Optimization

The system must simultaneously satisfy provider preferences (allocate to valued needs) and recipient preferences (receive from valued providers) while respecting capacity/need limits.

This is a **constrained weighted allocation problem**: finding the allocation matrix that minimizes deviation from both providers' priorities and recipients' source preferences, subject to capacity and need constraints.

$$
\min_X \sum_{i,j} (\Phi(X_{ij}, P_{ij}) + \Psi(X_{ij}, R_{ji}))
$$

*where for i, $\Phi,\Psi$ = Cost functions.*

**Key Mechanism:** The protocol finds the allocation matrix that satisfies all capacity and need constraints while remaining as close as possible to the expressed preferences of both providers and recipients. This is the *least biased* solution - it doesn't impose any preference beyond what entities themselves express. The system converges to this solution through iterative constraint satisfaction, where capacity and need limits are enforced while preserving the proportional relationships in the expressed preferences.

$$
X_{ij} : X_{ik} \approx P_{ij} : P_{ik}
$$

*(Proportional Preservation).*

The allocation mechanism has several important mathematical properties that emerge from constraint satisfaction:

#### Proportional Preservation

If you express that Need A is twice as aligned as Need B, the system allocates approximately twice as much capacity to A (when feasible given constraints). The proportional relationships you express are preserved in the final allocation.

#### Least Biased Solution

Among all possible allocations that satisfy the constraints, the system selects the one that introduces the least additional bias beyond what entities express. This is the entropy-maximizing (information-theoretically optimal) solution.

#### Constraint Propagation

When constraints bind (e.g., a recipient reaches capacity), the effects propagate through the network. Capacity that cannot flow to a full recipient automatically redistributes to other compatible needs according to expressed preferences.

#### Equilibrium Convergence

The system converges to a stable equilibrium where no entity can improve their allocation quality (measured by preference satisfaction) without degrading someone else's. This is a Pareto-efficient outcome.


═══════════════════════════════════════════════════════════════════════
ZOD SCHEMA IMPLEMENTATION
═══════════════════════════════════════════════════════════════════════

```typescript
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════

// Satisfaction value: [0.0, 1.0]
const SatisfactionSchema = z.number().min(0).max(1);

// Points for contributors/nodes (positive integers)
const PointsSchema = z.number().int().positive();

// Entity ID (public key, contact ID, or other identifier)
const EntityIdSchema = z.string().min(1);

// ISO 8601 timestamp
const TimestampSchema = z.string().datetime();

// ═══════════════════════════════════════════════════════════════════════
// CONTRIBUTOR
// ═══════════════════════════════════════════════════════════════════════

const ContributorSchema = z.object({
  id: EntityIdSchema,
  points: PointsSchema,
});

type Contributor = z.infer<typeof ContributorSchema>;

// ═══════════════════════════════════════════════════════════════════════
// RESOURCE TYPES & FILTERS
// ═══════════════════════════════════════════════════════════════════════

const ResourceTypeSchema = z.enum([
  'funding',
  'expertise',
  'facilities',
  'equipment',
  'materials',
  'labor',
  'other'
]).or(z.string()); // Allow custom types

const LocationSchema = z.object({
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

const TimeWindowSchema = z.object({
  start: TimestampSchema,
  end: TimestampSchema,
  recurrence: z.enum(['once', 'daily', 'weekly', 'monthly', 'yearly']).optional(),
});

const FilterRulesSchema = z.object({
  time: TimeWindowSchema.optional(),
  location: LocationSchema.optional(),
  resource_subtype: z.string().optional(),
  min_quantity: z.number().optional(),
  max_quantity: z.number().optional(),
});

// ═══════════════════════════════════════════════════════════════════════
// ALLOCATION
// ═══════════════════════════════════════════════════════════════════════

const AllocationRecordSchema = z.object({
  id: z.string().uuid(),
  provider_id: EntityIdSchema,
  recipient_id: EntityIdSchema,
  capacity_slot_id: z.string(),
  need_slot_id: z.string(),
  
  // User inputs
  offered_quantity: z.number().nonnegative(),
  accepted_quantity: z.number().nonnegative(),
  satisfaction: SatisfactionSchema,
  
  // Derived
  declined_quantity: z.number().nonnegative(),
  
  // Metadata
  resource_type: ResourceTypeSchema,
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

type AllocationRecord = z.infer<typeof AllocationRecordSchema>;

// ═══════════════════════════════════════════════════════════════════════
// SLOTS
// ═══════════════════════════════════════════════════════════════════════

const NeedSlotSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal('NeedSlot'),
  
  // User inputs
  points: PointsSchema,
  resource_type: ResourceTypeSchema,
  declared_quantity: z.number().nonnegative(),
  specifications: FilterRulesSchema.optional(),
  
  // Derived
  weight: z.number().min(0).max(1),
  satisfaction: SatisfactionSchema,
  allocations: z.array(AllocationRecordSchema),
  remaining_need: z.number().nonnegative(),
  
  // Metadata
  parent_id: z.string(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

type NeedSlot = z.infer<typeof NeedSlotSchema>;

const CapacitySlotSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal('CapacitySlot'),
  
  // User inputs
  points: PointsSchema,
  resource_type: ResourceTypeSchema,
  available_quantity: z.number().nonnegative(),
  contributors: z.array(ContributorSchema).default([]), // Empty = self only
  filters: FilterRulesSchema.optional(),
  
  // Derived
  weight: z.number().min(0).max(1),
  satisfaction: SatisfactionSchema,
  allocated_quantity: z.number().nonnegative(),
  
  // Child need slots
  needs: z.array(z.lazy(() => NeedSlotSchema)),
  
  // Metadata
  parent_id: z.string(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

type CapacitySlot = z.infer<typeof CapacitySlotSchema>;

// ═══════════════════════════════════════════════════════════════════════
// NODES (Goals)
// ═══════════════════════════════════════════════════════════════════════

// Base node (common fields)
const BaseNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  
  // Derived
  weight: z.number().min(0).max(1),
  satisfaction: SatisfactionSchema,
  share_of_parent: z.number().min(0).max(1),
  
  // Metadata
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

// Contribution node
const ContributionNodeSchema = BaseNodeSchema.extend({
  type: z.literal('ContributionNode'),
  
  // User inputs
  manual_satisfaction: SatisfactionSchema.optional(),
  contributors: z.array(ContributorSchema),
  anti_contributors: z.array(ContributorSchema).optional(),
  
  // No children for leaf contribution nodes
  children: z.array(z.never()).default([]),
});

type ContributionNode = z.infer<typeof ContributionNodeSchema>;

// Goal node (structural decomposition)
const GoalNodeSchema = BaseNodeSchema.extend({
  type: z.literal('Goal'),
  
  // User inputs
  points: PointsSchema,
  
  // Children can be goals, capacity slots, or non-slot nodes
  children: z.array(
    z.lazy(() => 
      z.union([
        GoalNodeSchema,
        CapacitySlotSchema,
        ContributionNodeSchema,
      ])
    )
  ),
  
  parent_id: z.string(),
});

type GoalNode = z.infer<typeof GoalNodeSchema>;

// Root node (top of tree)
const RootNodeSchema = BaseNodeSchema.extend({
  type: z.literal('Root'),
  entity_id: EntityIdSchema,
  
  // Root always has weight = 1.0, share_of_parent = 1.0
  weight: z.literal(1.0),
  share_of_parent: z.literal(1.0),
  
  // Children can be goals or contribution nodes
  children: z.array(
    z.lazy(() => 
      z.union([
        GoalNodeSchema,
        ContributionNodeSchema,
      ])
    )
  ),
});

type RootNode = z.infer<typeof RootNodeSchema>;

// ═══════════════════════════════════════════════════════════════════════
// TREE
// ═══════════════════════════════════════════════════════════════════════

const TreeSchema = RootNodeSchema;

type Tree = z.infer<typeof TreeSchema>;

// ═══════════════════════════════════════════════════════════════════════
// NETWORK STATE
// ═══════════════════════════════════════════════════════════════════════

// Map of entity_id -> their tree
const NetworkSchema = z.record(EntityIdSchema, TreeSchema);

// Share map: entity_id -> share value [0, 1]
const ShareMapSchema = z.record(EntityIdSchema, z.number().min(0).max(1));

// Entity's complete state
const EntityStateSchema = z.object({
  tree: TreeSchema,
  share_map: ShareMapSchema, // Who this entity recognizes
  last_updated: TimestampSchema,
});

type EntityState = z.infer<typeof EntityStateSchema>;

// Full network state
const NetworkStateSchema = z.object({
  entities: z.record(EntityIdSchema, EntityStateSchema),
  global_allocations: z.array(AllocationRecordSchema),
  version: z.string(),
  updated_at: TimestampSchema,
});

type NetworkState = z.infer<typeof NetworkStateSchema>;

// ═══════════════════════════════════════════════════════════════════════
// ALLOCATION CALCULATION TYPES
// ═══════════════════════════════════════════════════════════════════════

const AllocationShareSchema = z.object({
  recipient_id: EntityIdSchema,
  allocated_quantity: z.number().nonnegative(),
  share: z.number().min(0).max(1),
});

const AllocationResultSchema = z.object({
  capacity_slot_id: z.string(),
  provider_id: EntityIdSchema,
  total_capacity: z.number().nonnegative(),
  allocations: z.array(AllocationShareSchema),
  remaining_capacity: z.number().nonnegative(),
});

type AllocationResult = z.infer<typeof AllocationResultSchema>;

// ═══════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════

export {
  // Primitives
  SatisfactionSchema,
  PointsSchema,
  EntityIdSchema,
  TimestampSchema,
  
  // Contributors
  ContributorSchema,
  
  // Resources
  ResourceTypeSchema,
  LocationSchema,
  TimeWindowSchema,
  FilterRulesSchema,
  
  // Allocations
  AllocationRecordSchema,
  
  // Slots
  NeedSlotSchema,
  CapacitySlotSchema,
  
  // Nodes
  ContributionNodeSchema,
  GoalNodeSchema,
  RootNodeSchema,
  
  // Tree
  TreeSchema,
  
  // Network
  NetworkSchema,
  ShareMapSchema,
  EntityStateSchema,
  NetworkStateSchema,
  
  // Allocation calculations
  AllocationShareSchema,
  AllocationResultSchema,
};

export type {
  Contributor,
  AllocationRecord,
  NeedSlot,
  CapacitySlot,
  ContributionNode,
  GoalNode,
  RootNode,
  Tree,
  EntityState,
  NetworkState,
  AllocationShare,
  AllocationResult,
};
```

═══════════════════════════════════════════════════════════════════════
SCHEMA NOTES
═══════════════════════════════════════════════════════════════════════

1. **Recursive Types**: Using z.lazy() for recursive tree structures
   (GoalNode can contain GoalNodes, CapacitySlots can contain NeedSlots, etc.)

2. **Discriminated Unions**: Each node type has a 'type' literal field
   for runtime type discrimination and exhaustive pattern matching

3. **Validation Bounds**:
   - Satisfaction: [0.0, 1.0]
   - Weight: [0.0, 1.0]
   - Points: positive integers
   - Quantities: non-negative numbers

4. **Metadata**: All entities include created_at and updated_at timestamps
   for auditing and synchronization

5. **Derived Fields**: Schemas include both user inputs and derived values
   for complete state representation (computed values cached for performance)

6. **Empty Arrays as Defaults**: contributors: [] means "self only" for
   capacity contributors (following the coexistence model)

7. **Optional Fields**: Anti-contributors, filters, and manual_satisfaction
   are optional to simplify common cases

8. **Type Safety**: Full TypeScript types exported for compile-time checking

═══════════════════════════════════════════════════════════════════════
ADDITIONAL FEATURES FROM EXISTING IMPLEMENTATION
═══════════════════════════════════════════════════════════════════════

The following features from the current codebase (schemas.ts) should be 
integrated into the above model:

**1. ITC Causality Tracking (Instead of Simple Timestamps)**

```typescript
const ITCStampSchema = z.object({
  id: ITCIdSchema,     // Can be: 0 (null), 1 (full), or {l, r} (split)
  event: ITCEventSchema // Can be: number (counter) or {n, l, r} (tree)
});
```

ITC (Interval Tree Clocks) provide O(log n) causality tracking vs O(n) for
vector clocks. Replace simple `updated_at` timestamps with ITC stamps for
proper distributed conflict resolution.

**2. Hierarchical Availability Windows**

Current system has 4 levels of time specificity:
- Level 1 (Month-specific): Different patterns per month for yearly recurrence
- Level 2 (Week-specific): Different patterns per week for monthly recurrence  
- Level 3 (Day-specific): Different patterns per day for weekly recurrence
- Level 4 (Simple): Same time ranges all days/weeks/months

```typescript
const AvailabilityWindowSchema = z.object({
  month_schedules: z.array(MonthScheduleSchema).optional(),
  week_schedules: z.array(WeekScheduleSchema).optional(),
  day_schedules: z.array(DayScheduleSchema).optional(),
  time_ranges: z.array(TimeRangeSchema).optional()
});
```

This enables expressing complex patterns like:
- "First Monday of each month: 9am-12pm"
- "September only: all weekdays 10am-5pm"
- "Even weeks: Tuesday/Thursday 2pm-4pm"

**3. Organizations & Recursive Membership**

```typescript
const OrganizationSchema = z.object({
  org_id: z.string(),
  names: z.record(z.string(), z.string()), // Multi-language
  emoji: z.string().optional(),
  description: z.string().optional()
});

// Members can be pubkeys, contact_ids, OR org_ids (recursive!)
const MembersSchema = z.array(z.string());
```

This allows:
- Collective capacities: `members: ['org_humanitarian_coalition']`
- Nested orgs: org_abc includes org_def which includes individuals
- Multi-language names: `names: { en: "Garden", es: "Jardín" }`

**4. Contacts System (for pre-public-key relationships)**

```typescript
const ContactSchema = z.object({
  contact_id: z.string(),
  name: z.string(),
  public_key: z.string().optional(), // May not have key yet
  emoji: z.string().optional()
});
```

Enables recognizing people before they join the network:
- Add "Alice" as contributor → gets contact_id
- Later Alice joins → link contact_id to her public_key
- Smooth onboarding without losing history

**5. Divisibility Constraints (prevents over-fragmentation)**

```typescript
{
  max_natural_div: z.number().gte(1).optional(),
  min_allocation_percentage: PercentageSchema.optional()
}
```

Examples:
- Person's time: `max_natural_div: 1` (can't split a person)
- Large grant: `min_allocation_percentage: 0.1` (don't allocate <10%)
- Prevents allocating 0.001% of someone's capacity to 1000 recipients

**6. Multi-Dimensional Need Types (Per-Type Tracking)**

Current system tracks everything per type_id:
- Damping factors: α_k per type k
- Convergence: separate for each type
- Allocations: A_total^k(i, t) per recipient per type

```typescript
const PerTypeDampingHistoryEntrySchema = z.object({
  type_id: z.string().min(1),
  overAllocation: z.number(),
  timestamp: z.number().int().positive()
});
```

This enables:
- Food needs converge faster than housing needs
- Different damping for different resource types
- Per-type satisfaction tracking (already in your model!)

**7. Slot Filters & Subscriptions**

```typescript
const SlotFilterSchema = z.object({
  filter_id: z.string(),
  applies_to: z.enum(['capacity', 'need', 'both']),
  source_pubkeys: z.array(z.string()).optional(),
  type_ids: z.array(z.string()).optional(),
  must_include_me: z.boolean().optional(),
  location_max_distance_km: z.number().optional()
});
```

Users can:
- Subscribe to specific people's capacities/needs
- Filter by type, location, involvement
- Multiple filters combined with OR (match ANY)

**8. Booking & Advance Notice**

```typescript
{
  advance_notice_hours: z.number().gte(0).optional(),
  booking_window_hours: z.number().gte(0).optional()
}
```

Real-world constraints:
- "Need 48 hours advance notice to schedule"
- "Can only book within next 2 weeks"

**9. Mutual Agreement Flag**

```typescript
{
  mutual_agreement_required: z.boolean().default(false)
}
```

For sensitive allocations that require explicit acceptance:
- Childcare (safety)
- Housing (compatibility)
- High-commitment volunteering

**10. Convergence Metrics (Frobenius Norm)**

Multi-dimensional convergence tracking:

```typescript
const ConvergenceMetricsSchema = z.object({
  frobeniusNorm: z.number().nonnegative(),        // ||N⃗⃗(t)||_F
  frobeniusNormPrevious: z.number().nonnegative(),
  perTypeMetrics: z.record(z.string(), PerTypeConvergenceMetricsSchema),
  universalSatisfactionAchieved: z.boolean(),     // ∀i,k: N_i^k(t) = 0
  freedomMetric: z.number().nonnegative()
});
```

**11. Legacy Compatibility Types**

schemas.ts maintains backward compatibility during migration:
```typescript
export type BaseCapacity = Commitment;
export type ProviderCapacity = Commitment & { id?: string };
```

═══════════════════════════════════════════════════════════════════════
INTEGRATION RECOMMENDATIONS
═══════════════════════════════════════════════════════════════════════

**Immediate Additions to test2.md:**

1. **Replace timestamps with ITC stamps** throughout
   - Better causality tracking in distributed system
   - Handles concurrent updates properly

2. **Add Organizations to tree structure**
   ```
   Root
       └── Non-Slot Contributors (can include org_ids)
   ```

3. **Add Contacts to tree structure**
   ```
   Root
       └── Non-Slot Contributors (can include contact_ids)
   ```

4. **Enhance FilterRulesSchema** with:
   - Hierarchical availability windows
   - Advance notice requirements
   - Booking windows
   - Divisibility constraints

5. **Add per-type damping** to allocation formula
   - Each need type k has damping factor α_k(t)
   - Prevents oscillation independently per type

6. **Add convergence tracking schemas**
   - Frobenius norm for multi-dimensional convergence
   - Per-type convergence metrics
   - Universal satisfaction condition

7. **Add mutual_agreement_required flag**
   - For allocations requiring explicit acceptance
   - Prevents unwanted commitments

**Terminology Reconciliation:**

Current code uses "fulfillment" but your spec uses "satisfaction".
Options:
- Keep "fulfillment" (less breaking change)
- Migrate to "satisfaction" (clearer semantics)
- Use both: fulfillment = technical, satisfaction = user-facing

**Schema Evolution Path:**

Your test2.md could become v6, building on v4's multi-dimensional framework:
- v4: Multi-dimensional needs per type (current schemas.ts)
- v5: Global recognition model (also in schemas.ts)
- v6: Satisfaction-based feedback loop (your test2.md)

The key insight: Your satisfaction model is conceptually cleaner, but
schemas.ts has battle-tested implementation details you'll need.

═══════════════════════════════════════════════════════════════════════
STABILITY ANALYSIS: PREVENTING INFINITE REACTIVE LOOPS
═══════════════════════════════════════════════════════════════════════

**Critical Question:** Does satisfaction-based feedback create oscillations or
instabilities?

**POTENTIAL LOOP 1: Allocation-Satisfaction Oscillation**

```
Cycle t:   Provider A allocates 100 units → Recipient rates 0.4 (too much)
Cycle t+1: Provider A allocates 40 units → Recipient rates 1.0 (perfect!)
Cycle t+2: Provider A allocates 100 units → Recipient rates 0.4 (too much again)
Cycle t+3: ...oscillates forever
```

**STABILIZERS:**
1. **Need Caps (Hard Bound):**
   ```
   FinalAllocation = min(RawAllocation, DeclaredNeed)
   ```
   Even if satisfaction suggests more, can't exceed declared need.

2. **Declining Mechanism (Self-Regulation):**
   ```
   If Offered > ActualNeed:
     Accept only ActualNeed
     Decline remainder
     Satisfaction still high (got what you needed)
   
   Result: No oscillation—you get exactly what you need every cycle
   ```

3. **Weighted Aggregation (Smoothing):**
   ```
   ShareOfGeneralSatisfaction aggregates across ALL nodes
   Single allocation satisfaction changes → small change in global share
   Not 1:1 mapping, dampens oscillation
   ```

**Verdict:** STABLE ✓
- Need caps prevent over-allocation
- Decline mechanism lets recipients self-regulate
- Aggregation smooths individual allocation variance

**POTENTIAL LOOP 2: ShareOfGeneralSatisfaction Circular Dependency**

```
A's satisfaction with B depends on B's allocations/contributions to A
B's satisfaction with A depends on A's allocations/contributions to B
A's allocations to B depend on ShareOfGeneralSatisfaction_A→B
B's allocations to A depend on ShareOfGeneralSatisfaction_B→A

Circular dependency: A→B depends on B→A depends on A→B...
```

**ANALYSIS:**
This is actually a **fixed-point problem**, not an infinite loop.

```
Iteration 0: Use initial recognition (bootstrap)
  ShareOfGeneralSatisfaction based on initial non-slot contributors

Iteration 1: After first allocation cycle
  A allocates to B based on ShareOfGeneralSatisfaction_A→B
  B allocates to A based on ShareOfGeneralSatisfaction_B→A
  Both rate satisfaction on received allocations
  
Iteration 2: Update ShareOfGeneralSatisfaction
  New satisfaction values flow into trees
  Recalculate ShareOfGeneralSatisfaction for next cycle
  
Iteration 3+: Converges to fixed point
  Satisfaction ratings stabilize as allocations match needs
```

**STABILIZERS:**
1. **Satisfaction Is Retrospective (Breaks Simultaneity):**
   ```
   Cycle t:   Allocations happen (based on cycle t-1 satisfaction)
   Cycle t:   Recipients rate satisfaction (after receiving)
   Cycle t+1: New allocations use cycle t satisfaction
   
   Time delay breaks circular dependency
   ```

2. **Need Fulfillment Reduces Sensitivity:**
   ```
   As needs get met → satisfaction stabilizes
   When DeclaredNeed ≈ TotalReceived → satisfaction ≈ 1.0
   High satisfaction → stable allocations → high satisfaction (stable loop)
   ```

3. **Independent Calculation:**
   ```
   ShareOfGeneralSatisfaction_A→B is computed independently from B→A
   Each entity maintains their own tree and satisfaction calculations
   No forced agreement or min function needed
   ```

**Verdict:** CONVERGES ✓
- Time delay breaks simultaneity
- Independent calculations prevent forced constraints
- Convergence to satisfaction equilibrium

**POTENTIAL LOOP 3: Tree Aggregation Feedback**

```
Allocation satisfaction → Need-Slot satisfaction
Need-Slot satisfaction → Capacity-Slot satisfaction  
Capacity-Slot satisfaction → Goal satisfaction
Goal satisfaction → ShareOfGeneralSatisfaction
ShareOfGeneralSatisfaction → Future allocation
Future allocation → Allocation satisfaction (loop)
```

**ANALYSIS:**
This is the core learning loop—it's INTENDED behavior, but needs stability.

**STABILIZERS:**
1. **Hierarchical Aggregation (Dampening Factor):**
   ```
   Each level averages children with weights
   
   Single allocation satisfaction = 0.3
     ↓ (averaged with 10 other allocations)
   Need-Slot satisfaction = 0.7 (dampened)
     ↓ (averaged with 5 sibling need-slots)
   Capacity-Slot satisfaction = 0.75 (further dampened)
     ↓ (averaged with other capacity slots)
   Goal satisfaction = 0.80 (heavily dampened)
   
   Impact on global share: small
   ```

2. **Multiple Contributors Per Node:**
   ```
   If node has 10 contributors each with points:
   Single contributor's satisfaction affects their share: 1/10 = 10%
   
   Not winner-take-all—proportional impact
   ```

3. **Per-Type Damping (from v4/v5):**
   ```
   α_k(t) ∈ {0.5, 0.8, 1.0}
   
   If system detects oscillation in type k:
     Reduce α_k → reduce allocation responsiveness
     
   Adaptive damping per resource type prevents over-reaction
   ```

**Verdict:** STABLE WITH DAMPING ✓
- Hierarchical aggregation provides natural dampening
- Proportional impact (not binary)
- Existing per-type damping mechanism applies

**POTENTIAL LOOP 4: Decline Cascade**

```
Cycle t:   Many recipients over-allocated
           All decline excess simultaneously
           
Cycle t+1: Massive capacity surge (all declined resources available)
           System allocates even more
           
Cycle t+2: Even more declines
           Worse cascade
```

**ANALYSIS:**
Declining resources return to provider's available capacity in SAME cycle.

**STABILIZERS:**
1. **Same-Cycle Reallocation:**
   ```
   Within Cycle t:
     Step 1: Calculate allocations
     Step 2: Recipients accept/decline
     Step 3: Declined resources → back to available capacity
     Step 4: Reallocate declined resources to other recipients
     
   All happens in one calculation round—no cascade across cycles
   ```

2. **Need-Based Capping:**
   ```
   FinalAllocation = min(RawAllocation, RemainingNeed)
   
   Even if capacity surges, can't force allocation beyond need
   Recipients don't have to actively decline—system auto-caps
   ```

3. **Learning From Decline Patterns:**
   ```
   If Provider A consistently over-allocates:
     Recipients consistently decline
     A's satisfaction ratings decrease
     A's future allocation share decreases
     
   System learns to allocate less from A
   ```

**Verdict:** NO CASCADE ✓
- Same-cycle reallocation
- Need caps prevent forced over-allocation
- System learns from decline patterns

**POTENTIAL LOOP 5: Strategic Satisfaction Gaming**

```
Recipient learns:
  "If I rate satisfaction low, I get more next cycle from others"
  "If I rate satisfaction high, I get less next cycle"
  
Strategic behavior: Always rate low to maximize allocation
```

**ANALYSIS:**
This is NOT an infinite loop, but a potential gaming vector.

**PROTECTIONS:**
1. **Recognition Controls Eligibility:**
   ```
   Satisfaction affects ALLOCATION WEIGHT among eligible recipients
   Recognition affects WHO IS ELIGIBLE
   
   If B games satisfaction:
     A can remove B from recognition entirely
     B gets zero allocation (regardless of satisfaction)
   ```

2. **Network Reputation Effects:**
   ```
   If B consistently gives dishonest satisfaction ratings:
     - Other providers see this pattern
     - Other providers reduce recognition of B
     - B becomes isolated in network
     - Bad strategy long-term
   ```

3. **Self-Harm From Bad Data:**
   ```
   If B gives dishonest low satisfaction:
     B's own decision-making suffers
     B thinks A is unhelpful when A is actually helpful
     B might reduce recognition of A
     B loses access to genuinely helpful provider
     
   Honest reporting = optimal strategy for B's own learning
   ```

4. **Asymmetric Impact:**
   ```
   If B underrates A:
     - B's ShareOfGeneralSatisfaction_B→A might decrease
     - But this only affects A's allocation to B
     - Other entities still allocate to B based on their own ShareOfGeneralSatisfaction
     - B cannot force A to allocate more by gaming satisfaction
   ```

**Verdict:** GAMING-RESISTANT ✓
- Recognition provides override control
- Network effects punish dishonesty
- Self-harm from bad data disincentivizes gaming
- Asymmetric calculation prevents forced manipulation

**POTENTIAL LOOP 6: Recognition-Satisfaction Conflict**

```
Recognition tree says: "A contributes 80% to my mission"
Satisfaction data says: "A's allocations have 30% satisfaction"

Which wins? Does this create conflict/oscillation?
```

**RESOLUTION:**
Recognition and Satisfaction serve different functions (coexistence model).

```
Recognition (Non-Slot):
  - Intangible contributions (mission alignment, advocacy, etc.)
  - Manual input
  - Controls eligibility and baseline share
  
Satisfaction (Slot-Based):
  - Tangible resource allocations
  - Automatic feedback
  - Modulates allocation weight within eligible set

Combined Calculation:
  Total ShareOfGeneralSatisfaction(Target, Contributor) =
    Non-Slot contribution (from recognition tree) +
    Slot-Based contribution (from satisfaction aggregation)
    
  Both weighted by their tree positions
  No conflict—they add together
```

**Example:**
```
Entity A → Entity B total share:
  Non-Slot Recognition: 40% (for mission alignment, advocacy)
  Slot Satisfaction: 20% (for resource allocations, weighted by satisfaction)
  
  Total: 60% combined share (normalized across all entities)
  
  If slot satisfaction drops to 5%:
    Non-slot stays at 40% (manual recognition unchanged)
    Total drops to 45%
    
  Message: "B is mission-aligned but their resources aren't helping"
  Action: Keep relationship, adjust resource types
```

**Verdict:** NO CONFLICT ✓
- Recognition and Satisfaction operate in different domains
- Additive combination, not competitive
- Allows nuanced relationships (good partner, wrong resources)

═══════════════════════════════════════════════════════════════════════
STABILITY GUARANTEES (FORMAL)
═══════════════════════════════════════════════════════════════════════

**Theorem (v6 Stability):**
The satisfaction-based feedback system converges to a stable equilibrium
under the following conditions:

**C1. Bounded Allocations:**
  ∀ recipients i, resources k:
    0 ≤ FinalAllocation_i^k ≤ DeclaredNeed_i^k
  
  Hard bounds prevent unbounded growth.

**C2. Satisfaction Domain:**
  ∀ satisfaction ratings S:
    S ∈ [0, 1]
  
  Bounded feedback signal.

**C3. Temporal Separation:**
  Cycle t:   Allocations computed
  Cycle t:   Satisfaction rated (after allocation)
  Cycle t+1: Next allocations use cycle t satisfaction
  
  Time delay breaks circular dependency.

**C4. Hierarchical Dampening:**
  Each aggregation level averages with weights:
    Satisfaction_parent = Σ(w_i × Satisfaction_child_i) / Σ(w_i)
  
  Propagation dampens with tree depth.

**C5. Per-Type Adaptive Damping:**
  For each resource type k:
    α_k(t) ∈ {0.5, 0.8, 1.0}
  
  If oscillation detected: α_k ← 0.5 (reduce responsiveness)

**C6. Network Effect Penalties:**
  Dishonest satisfaction reporting → 
    Reduced recognition from other entities →
      Reduced total allocation →
        Incentive for honest reporting

**C7. Independent Calculation:**
  ShareOfGeneralSatisfaction_A→B computed independently from B→A
  No forced agreement or min function
  Allows asymmetric recognition

**Convergence Property:**
Under C1-C7, the system converges to a satisfaction equilibrium:
  
  lim(t→∞) ||N⃗⃗(t)||_F → 0  (if sufficient capacity)
  
  OR
  
  lim(t→∞) ||N⃗⃗(t)||_F → constant  (capacity-limited equilibrium)

Where satisfaction ratings stabilize at true utility values.

**Proof Sketch:**
1. Need caps (C1) + Satisfaction bounds (C2) → Bounded state space
2. Time delay (C3) → No simultaneous circular dependency
3. Dampening (C4, C5) → Contraction mapping
4. Independent calculations (C7) → No forced constraints, natural convergence
5. Bounded state + Contraction → Fixed point exists (Banach fixed-point theorem)
6. Network penalties (C6) → Unique honest equilibrium is optimal

∎

═══════════════════════════════════════════════════════════════════════
IMPLEMENTATION REQUIREMENTS FOR STABILITY
═══════════════════════════════════════════════════════════════════════

**Required in v6 Implementation:**

1. **Per-Type Damping (Already in v4/v5):**
   ```typescript
   const MultiDimensionalDampingSchema = z.object({
     damping_factors: z.record(z.string(), z.number().min(0).max(1)),
     damping_history: z.record(z.string(), z.array(PerTypeDampingHistoryEntrySchema))
   });
   ```

2. **Oscillation Detection (Add to v6):**
   ```typescript
   function detectOscillation(
     history: SatisfactionHistory,
     windowSize: number = 3
   ): boolean {
     // Check if satisfaction alternates between high/low
     const values = history.slice(-windowSize);
     const variance = calculateVariance(values);
     const meanChange = calculateMeanAbsoluteChange(values);
     
     return variance > VARIANCE_THRESHOLD && 
            meanChange > CHANGE_THRESHOLD;
   }
   ```

3. **Adaptive Satisfaction Responsiveness (New):**
   ```typescript
   function calculateAllocationShare(
     shareOfGeneralSatisfaction: number,
     dampingFactor: number,
     oscillationDetected: boolean
   ): number {
     const responsiveness = oscillationDetected ? 0.5 : 1.0;
     return shareOfGeneralSatisfaction * dampingFactor * responsiveness;
   }
   ```

4. **Same-Cycle Decline Reallocation (New):**
   ```typescript
   function computeAllocations(
     capacities: CapacitySlot[],
     needs: NeedSlot[],
     shareMap: Map<EntityId, number>
   ): AllocationResult {
     // Round 1: Initial allocation
     const initialAllocations = computeRawAllocations(...);
     
     // Round 2: Accept/Decline (within same cycle)
     const acceptedAllocations = applyAcceptDecline(initialAllocations, needs);
     
     // Round 3: Reallocate declined capacity (within same cycle)
     const declinedCapacity = calculateDeclinedCapacity(initialAllocations, acceptedAllocations);
     const finalAllocations = reallocateDeclined(acceptedAllocations, declinedCapacity, needs);
     
     return finalAllocations;
   }
   ```

5. **Satisfaction History Tracking (New):**
   ```typescript
   const SatisfactionHistorySchema = z.object({
     allocation_id: z.string(),
     satisfaction_values: z.array(z.object({
       value: SatisfactionSchema,
       timestamp: TimestampSchema,
       cycle: z.number()
     })),
     oscillation_detected: z.boolean()
   });
   ```

═══════════════════════════════════════════════════════════════════════
CONCLUSION
═══════════════════════════════════════════════════════════════════════

**No Infinite Reactive Loops** ✓

The v6 satisfaction-based feedback system is stable because:

1. **Hard bounds** prevent unbounded growth
2. **Time delays** break circular dependencies  
3. **Hierarchical dampening** smooths feedback
4. **Per-type adaptive damping** prevents oscillation
5. **Independent calculations** allow asymmetric recognition
6. **Network effects** penalize strategic gaming
7. **Same-cycle reallocation** prevents cascades

The system converges to a satisfaction equilibrium where allocations
match actual utility, and satisfaction ratings reflect true helpfulness.

This is a **learning system with guaranteed stability**—it gets smarter
without becoming chaotic.
