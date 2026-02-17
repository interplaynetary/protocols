# vf.knowledge.recipeFlow

## Record

**ID**: `vf.knowledge.recipeFlow`

- **Type**: `record`
- **Description**: The specification of a resource inflow to, or outflow from, a recipe process; and/or a clause, or reciprocal clause, of a recipe exchange.
- `action` (Required): string (at-uri)
  - Defines the kind of flow, such as consume, produce, work, transfer, etc.
- `recipeInputOf`: string (at-uri)
  - Relates an input flow to its process in a recipe.
- `recipeOutputOf`: string (at-uri)
  - Relates an output flow to its process in a recipe.
- `recipeClauseOf`: string (at-uri)
  - Relates a flow to its exchange agreement in a recipe.
- `recipeReciprocalClauseOf`: string (at-uri)
  - Relates a reciprocal flow to its exchange agreement in a recipe.
- `resourceQuantity`: ref
  - The amount and unit of the economic resource counted or inventoried.
- `effortQuantity`: ref
  - The amount and unit of the work or use or citation effort-based action. This is often expressed with a time unit, but also could be cycle counts or other measures of effort or usefulness.
- `note`: string
  - Any useful textual information related to the item.
- `resourceClassifiedAs`: array
  - References one or more uri's for a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping; or can be one or more string classifications such as tags.
  - **Items**:
    - **Type**: `string`
- `resourceConformsTo`: string (at-uri)
  - The lowest level resource specification or definition of an existing or potential economic resource, whether one will ever be instantiated or not.
- `stage`: string (at-uri)
  - The required stage of the desired input economic resource. References the ProcessSpecification of the last process the economic resource went through.
- `state`: string
  - The required state of the desired input economic resource, after coming out of a test or review process.

---

## Query

**ID**: `vf.knowledge.listRecipeFlows`

- **Type**: `query`
- **Description**: List recipeFlows. Filterable by: action, recipeInputOf, recipeOutputOf, recipeClauseOf, recipeReciprocalClauseOf, resourceConformsTo, stage.
- **Parameters**:
  - `uri`: string (at-uri)
    - Fetch a single record by AT-URI. Other filters are ignored when set.
  - `action`: string (at-uri)
    - Filter by action (AT-URI of referenced record).
  - `recipeInputOf`: string (at-uri)
    - Filter by recipeInputOf (AT-URI of referenced record).
  - `recipeOutputOf`: string (at-uri)
    - Filter by recipeOutputOf (AT-URI of referenced record).
  - `recipeClauseOf`: string (at-uri)
    - Filter by recipeClauseOf (AT-URI of referenced record).
  - `recipeReciprocalClauseOf`: string (at-uri)
    - Filter by recipeReciprocalClauseOf (AT-URI of referenced record).
  - `resourceConformsTo`: string (at-uri)
    - Filter by resourceConformsTo (AT-URI of referenced record).
  - `stage`: string (at-uri)
    - Filter by stage (AT-URI of referenced record).
  - `limit`: integer
    - Maximum number of records to return.
  - `cursor`: string
    - Pagination cursor from a previous response.
- **Output** (application/json):
  - `records` (Required): array
    - **Items**:
      - `uri` (Required): string (at-uri)
        - AT-URI of the record.
      - `value`: unknown
        - The full record value.
  - `cursor`: string
    - Pagination cursor for next page.

---

