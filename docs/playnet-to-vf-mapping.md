# Playnet to ValueFlows Migration Mapping

This document provides a comprehensive mapping of Playnet's unified execution schemas (`Resource`, `Person`, `Process`, `UseRight`) into the strictly normalized, graph-based Linked Data ontology of ValueFlows (VF).

## Core Differences in Philosophy

1. **Embedded vs. Normalized**: Playnet uses heavily "overloaded" schemas. A `Person` in Playnet holds their identity, skills, availability calendar, and location entirely directly on the `Person` object. In ValueFlows, an `Agent` only holds identity and location; their skills and availability are represented as separate graph edges (e.g., `Intent`s offering `ResourceSpecification`s for a specific time range).
2. **Planes of Operation**: ValueFlows enforces strict separation of layers:
   - **Knowledge Layer**: What _can_ exist (Classes, Specifications, Recipes).
   - **Planning Layer**: What _is intended/agreed_ to exist (Intents, Proposals, Commitments, Agreements, Plans).
   - **Observation Layer**: What _actually_ exists (EconomicEvents, EconomicResources, Agents).
     Playnet often mixes these (e.g., `Resource` having both physical identity and availability windows).

---

## 1. The \`Resource\` Schema

In Playnet, `Resource` encompasses the concept, the physical item, its availability, its location, and its governance.

### Mapping Breakdown

| Playnet Field                                                              | ValueFlows Concept                           | VF Target Field(s)                         | Notes                                                                                                                                                     |
| -------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                                                                       | `EconomicResource` / `ResourceSpecification` | `id`                                       | Depends on context.                                                                                                                                       |
| `type_id`                                                                  | `ResourceSpecification`                      | `conformsTo`                               | Points the Resource to its Knowledge-layer specification.                                                                                                 |
| `quantity`, `unit`                                                         | `Measure`                                    | `accountingQuantity`, `onhandQuantity`     | Defines the actual inventoried amount.                                                                                                                    |
| `emoji`, `description`                                                     | `ResourceSpecification`                      | `image`, `note`                            |                                                                                                                                                           |
| `author`, `governed_by`                                                    | `Agent`                                      | `primaryAccountable`                       | Represents governance/ownership.                                                                                                                          |
| `location`, `street_address`, `longitude`, `latitude`, `h3_idx`            | `SpatialThing`                               | `currentLocation`                          | Extracted into a standalone spatial entity.                                                                                                               |
| `start_date`, `end_date`, `time_zone`, `availability_window`, `recurrence` | `Intent`                                     | `hasBeginning`, `hasEnd`, `hasPointInTime` | VF resources do not "have" availability natively. Availability is modeled as an `Intent` where the Resource is offered (`provider`, `availableQuantity`). |

### Leftovers (Requires Extension or Policy Engine)

- **Constraints (`min_atomic_size`, `max_participation`, `max_concurrency`, `min_calendar_duration`, `required_skills`, `filter_rule`, `mutual_agreement_required`)**: ValueFlows does not natively enforce constraints like concurrency limits natively on an `EconomicResource`. These would either live as custom extensions in a `ResourceSpecification.note` or belong to the operational logic of the networking engine.
- **Allocation (`priority_distribution`)**: Out of scope for VF.
- **Booking Rules (`advance_notice_hours`, `booking_window_hours`)**: Out of scope for VF.

---

## 2. The \`Person\` Schema

In Playnet, a `Person` embeds skills, labor power, explicit inventories, and availability calendars.

### Mapping Breakdown

| Playnet Field                      | ValueFlows Concept      | VF Target Field(s)       | Notes                                                                                                                                                   |
| ---------------------------------- | ----------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`, `name`                       | `Person` (Agent)        | `id`, `name`             |                                                                                                                                                         |
| `skills`                           | `ResourceSpecification` | N/A (Linked via Intent)  | A skill is a Specification (e.g., "Sound Engineer").                                                                                                    |
| `availability_window`              | `Intent`                | `hasBeginning`, `hasEnd` | "Alice is free Monday" = `Intent` to `work` between time X and Y.                                                                                       |
| `location.*`                       | `SpatialThing`          | `primaryLocation`        |                                                                                                                                                         |
| `labor_powers`, `skills_inventory` | `Intent`                | `availableQuantity`      | To say Alice has 5 hours/day as an Electrician: `Intent` where `provider` = Alice, `resourceConformsTo` = "Electrician", `availableQuantity` = 5 hours. |

### Leftovers

- **Calendar Limits (`max_hours_per_day`, `max_hours_per_week`)**: VF `Intent`s represent explicitly offered chunks of time/flow. A global per-day rolling cap needs to be enforced via business logic maintaining the active `Intent` quantities.

---

## 3. The \`Process\` and \`Slots\`

Playnet's `Process` holds multiple `Slots` (Dependencies) which need satisfaction.

### Mapping Breakdown

| Playnet Concept                                 | ValueFlows Concept         | VF Equivalent & Transformation                                                                                                                                                     |
| ----------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Template Process** (via `ProcessDescription`) | `Recipe` / `RecipeProcess` | A template of what needs to be done.                                                                                                                                               |
| **Active Process**                              | `Plan` / `Process`         | A coordinated action happening in real life.                                                                                                                                       |
| **`NeedSlot`**                                  | `Intent` / `Commitment`    | An active "Need" is an `Intent` with action `consume`, `work`, or `use`, pointing to a `ResourceSpecification`. Once fulfilled, it becomes a `Commitment` linked to the `Process`. |
| **`CompositionSlot`**                           | `Plan` / `Process` linkage | Translated to the VF relation `planIncludes`, nesting sub-processes.                                                                                                               |

### Leftovers

- **`ConditionSlot`**: "Process starts only if weather is sunny". VF processes do not hold state-driven condition predicates. This belongs strictly to the Matcher / Policy Engine.
- **`DataSlot`**: Arbitrary human-input data fields do not map to VF's supply-chain graphs. These must be stored in application state or custom properties.

---

## 4. Use-Rights and Allocation

Playnet manages Use-Rights (⭐) via `RightsCatalog`, `UseRight`, and `Permissions/Responsibilities`.

### Mapping Breakdown

| Playnet Concept                         | ValueFlows Concept          | VF Transformation                                                                                      |
| --------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Rights Catalog / Templates**          | `Proposal` / `ProposalList` | A catalog of open rights is a list of published `Proposal`s.                                           |
| **`holder_constraints`**                | `Proposal`                  | `eligibleLocation` or matching logic.                                                                  |
| **`permissions` (Can / Must / Cannot)** | `Agreement` / `Commitment`  | The actual rights granted in an `Agreement`. "Can" = explicit `stipulates` (You can `use` Resource X). |
| **`responsibilities`**                  | `Agreement`                 | `stipulatesReciprocal` (If you `use` Resource X, you must `work` Y hours or `transfer` Z value).       |
| **`Constraints` (Temporal/Spatial)**    | `Commitment`                | Limits on the grant mapped to `hasBeginning`, `hasEnd`, `eligibleLocation`.                            |
| **`TimeSlot` / `AllocationEntry`**      | `Commitment`                | The discrete time when a right is actually allocated to an Agent maps to an active `Commitment`.       |

### Leftovers

- **`RiskFactor` & `BlockReason` (Match Status)**: These computation artifacts are purely algorithm state, and do not persist in VF proper.
- **`valid_combinations` & Compatibility logic**: VF manages reciprocal agreements but does not natively run combinatorial compatibility matrices (e.g., "Right A cannot be held while Right B is held"). This logic must remain in Playnet's allocator.
-
