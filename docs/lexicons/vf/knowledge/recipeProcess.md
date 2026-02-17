# vf.knowledge.recipeProcess

## Record

**ID**: `vf.knowledge.recipeProcess`

- **Type**: `record`
- **Description**: Specifies a process in a recipe for use in planning from recipe.
- `hasRecipeInput`: array
  - All the inputs of a recipe process.
  - **Items**:
    - **Type**: `string`
- `hasRecipeOutput`: array
  - All the outputs of a recipe process.
  - **Items**:
    - **Type**: `string`
- `hasDuration`: ref
  - The temporal extent of the process.
- `image`: string (uri)
  - The uri to an image relevant to the entity, such as a logo, avatar, photo, diagram, etc.
- `name`: string
  - An informal or formal textual identifier for an object. Does not imply uniqueness.
- `note`: string
  - Any useful textual information related to the item.
- `processClassifiedAs`: array
  - References one or more uri's for a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping; or can be one or more string classifications such as tags.
  - **Items**:
    - **Type**: `string`
- `processConformsTo`: string (at-uri)
  - The standard specification or definition of a type of process.

---

## Query

**ID**: `vf.knowledge.listRecipeProcesses`

- **Type**: `query`
- **Description**: List recipeProcesses. Filterable by: hasRecipeInput, hasRecipeOutput, processConformsTo.
- **Parameters**:
  - `uri`: string (at-uri)
    - Fetch a single record by AT-URI. Other filters are ignored when set.
  - `hasRecipeInput`: string (at-uri)
    - Filter where hasRecipeInput array contains this AT-URI.
  - `hasRecipeOutput`: string (at-uri)
    - Filter where hasRecipeOutput array contains this AT-URI.
  - `processConformsTo`: string (at-uri)
    - Filter by processConformsTo (AT-URI of referenced record).
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

