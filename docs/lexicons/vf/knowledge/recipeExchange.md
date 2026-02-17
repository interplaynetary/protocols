# vf.knowledge.recipeExchange

## Record

**ID**: `vf.knowledge.recipeExchange`

- **Type**: `record`
- **Description**: Specifies an exchange type agreement as part of a recipe.
- `recipeStipulates`: array
  - All the primary clauses of a recipe exchange.
  - **Items**:
    - **Type**: `string`
- `recipeStipulatesReciprocal`: array
  - All the reciprocal clauses of a recipe exchange.
  - **Items**:
    - **Type**: `string`
- `name`: string
  - An informal or formal textual identifier for an object. Does not imply uniqueness.
- `note`: string
  - Any useful textual information related to the item.

---

## Query

**ID**: `vf.knowledge.listRecipeExchanges`

- **Type**: `query`
- **Description**: List recipeExchanges. Filterable by: recipeStipulates, recipeStipulatesReciprocal.
- **Parameters**:
  - `uri`: string (at-uri)
    - Fetch a single record by AT-URI. Other filters are ignored when set.
  - `recipeStipulates`: string (at-uri)
    - Filter where recipeStipulates array contains this AT-URI.
  - `recipeStipulatesReciprocal`: string (at-uri)
    - Filter where recipeStipulatesReciprocal array contains this AT-URI.
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

