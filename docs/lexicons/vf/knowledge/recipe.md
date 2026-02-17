# vf.knowledge.recipe

## Record

**ID**: `vf.knowledge.recipe`

- **Type**: `record`
- **Description**: Optional instance of a recipe which directly specifies the recipe processes included.
- `primaryOutput`: string (at-uri)
  - The main type of resource the recipe is intended to produce or deliver.
- `recipeIncludes`: array
  - The collection of processes needed for this recipe.
  - **Items**:
    - **Type**: `string`
- `name`: string
  - An informal or formal textual identifier for an object. Does not imply uniqueness.
- `note`: string
  - Any useful textual information related to the item.

---

## Query

**ID**: `vf.knowledge.listRecipes`

- **Type**: `query`
- **Description**: List recipes. Filterable by: primaryOutput, recipeIncludes.
- **Parameters**:
  - `uri`: string (at-uri)
    - Fetch a single record by AT-URI. Other filters are ignored when set.
  - `primaryOutput`: string (at-uri)
    - Filter by primaryOutput (AT-URI of referenced record).
  - `recipeIncludes`: string (at-uri)
    - Filter where recipeIncludes array contains this AT-URI.
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

