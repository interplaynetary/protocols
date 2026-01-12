# Tree V2 - ShareMap Architecture

This module implements the **Fluid Tree Model** with ShareMap-based terminal nodes, symbolic links, and allocation-derived satisfaction.

## Core Principle

> **"The tree structure ends when value touches an Identity"**

This is elegantly expressed as: **Terminal nodes have ShareMaps**.

## Architecture Overview

### Key Concepts

1. **ShareMap**: Unified representation of identity-to-value mappings (points or quantities)
2. **Terminal vs Structural**: Nodes either aggregate (structural) or touch identity (terminal)
3. **Node Definitions** (`nodes`): Canonical node data stored once
4. **Tree References** (`tree_references`): How nodes appear in specific tree locations
5. **Derived State** (`derived_state`): Computed values (weight, satisfaction, allocation ShareMaps)
6. **Symbolic Links**: Cross-entity references with cached satisfaction data

### Terminal Nodes

Terminal nodes are where value touches identity. They have a `share_map` (direct or derived):

- **ContributionNode**: Direct action/contribution (user-input ShareMap)
- **Goal** (terminal): Direct team members (user-input ShareMap)
- **CapacitySlot** (terminal): Recipients/utilization (allocation-derived ShareMap)
- **NeedSlot** (terminal): Providers/fulfillment (allocation-derived ShareMap)

### Structural Nodes

Structural nodes aggregate satisfaction from children:

- **Root**: Tree root
- **Goal** (structural): Aggregates sub-goals, capacities, needs
- **CapacitySlot** (structural): Aggregates needs
- **NeedSlot** (structural): Aggregates sub-needs

### Node Reuse

Nodes can be referenced multiple times in a tree with different:
- **Children**: Override `default_child_ids` with `child_ref_ids`
- **Points**: Override node's `points` with `points_override`

This enables:
- Same capacity serving multiple goals
- Same need fulfilled by multiple capacity providers
- Context-specific relationships

## Module Structure

```
src/tree-v2/
├── schemas/           # Zod schemas & TypeScript types
│   ├── primitives.ts  # Basic types (ShareMap, EntityId, NodeId, etc.)
│   ├── nodes.ts       # Node definitions (6 types)
│   ├── references.ts  # Tree references
│   ├── derived.ts     # Derived state (with allocation_share_maps)
│   ├── allocations.ts # Allocation records
│   ├── symlinks.ts    # Symbolic link cache
│   ├── tree.ts        # Tree store
│   ├── entity.ts      # Entity state
│   └── network.ts     # Network state
├── tree/              # Tree operations & validation
├── computation/       # Satisfaction & share computation
│   ├── sharemap.ts    # ShareMap derivation from allocations
│   ├── satisfaction.ts # Unified terminal/structural satisfaction
│   └── shares.ts      # ShareOfGeneralSatisfaction calculation
├── symlinks/          # SymLink operations
├── allocations/       # Allocation logic
└── tests/             # Comprehensive test suite
```

## Schema Hierarchy

```
NetworkState
└── entities: Record<EntityId, EntityState>
    ├── tree_store: TreeStore
    │   ├── nodes: Record<NodeId, NodeDefinition>
    │   │   └── share_map?: ShareMap (for terminal nodes)
    │   ├── tree_references: Record<RefId, TreeReference>
    │   └── derived_state: Record<NodeId, DerivedState>
    │       ├── allocation_share_maps?: AllocationShareMaps
    │       └── contributor_shares?: ShareMap
    ├── symlink_cache: SymLinkCache
    ├── share_map: Record<EntityId, number>
    └── allocations: AllocationRecord[]
```

## Node Types

1. **Root**: Tree root (one per tree)
2. **Goal**: Intent node (can be structural or terminal)
3. **CapacitySlot**: Resource supply (can be structural or terminal)
4. **NeedSlot**: Resource demand (can be structural or terminal)
5. **ContributionNode**: Terminal action node (always terminal)
6. **SymLink**: Cross-entity reference (always terminal)

## ShareMap Architecture

### Direct ShareMap (User Input)
```typescript
const contributionNode: ContributionNode = {
  type: 'ContributionNode',
  share_map: {
    'alice': 50,  // Alice contributed 50 points
    'bob': 30,    // Bob contributed 30 points
  },
};
```

### Allocation-Derived ShareMap (Computed)
```typescript
// For CapacitySlot (provider perspective)
derived_state[capacity_id].allocation_share_maps = {
  offered_share_map: { 'recipient_1': 100, 'recipient_2': 50 },
  accepted_share_map: { 'recipient_1': 80, 'recipient_2': 40 },
  declined_share_map: { 'recipient_1': 20, 'recipient_2': 10 },
};

// For NeedSlot (recipient perspective)
derived_state[need_id].allocation_share_maps = {
  offered_share_map: { 'provider_1': 100, 'provider_2': 50 },
  accepted_share_map: { 'provider_1': 80, 'provider_2': 40 },
  declined_share_map: { 'provider_1': 20, 'provider_2': 10 },
};
```

## Satisfaction Calculation

### Unified Terminal Satisfaction
```typescript
// All terminal nodes use the same elegant calculation
S_terminal = weighted_average(share_map, entity_satisfactions)
```

### Unified Structural Satisfaction
```typescript
// All structural nodes use the same elegant calculation
S_structural = weighted_average(children_satisfaction, children_weights)
```

## Example Usage

```typescript
import { TreeStoreSchema, NodeDefinitionSchema } from './schemas';
import { deriveAllocationShareMaps } from './computation/sharemap';

// Parse and validate tree data
const tree = TreeStoreSchema.parse(jsonData);

// Create a terminal ContributionNode
const contributionNode: ContributionNode = {
  id: 'contrib_123',
  type: 'ContributionNode',
  name: 'Build Feature X',
  share_map: {
    'alice': 60,
    'bob': 40,
  },
  default_child_ids: [],
  created_at: Date.now(),
  updated_at: Date.now(),
};

// Validate it
const validated = NodeDefinitionSchema.parse(contributionNode);

// Derive ShareMaps from allocations
const capacityShareMaps = deriveAllocationShareMaps(
  'capacity_123',
  allocations,
  'capacity'
);
```

## Design Principles

- **Elegance**: Terminal = ShareMap (unified concept)
- **Immutability**: All operations return new instances
- **Type Safety**: Full Zod validation with terminal node refinements
- **Pure Functions**: No side effects in computations
- **Separation of Concerns**: Terminal vs Structural logic
- **Testability**: Each function independently testable
