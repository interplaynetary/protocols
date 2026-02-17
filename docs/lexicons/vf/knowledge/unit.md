# vf.knowledge.unit

## Record

**ID**: `vf.knowledge.unit`

- **Type**: `record`
- **Description**: A standard unit of measure, defined and adopted by convention or by law.
- `omUnitIdentifier`: string (uri)
  - The unique identifier of the om unit of measure, for standardization across networks.
- `label` (Required): string
  - The display label defined for the network for the unit of measure, overrides om.
- `symbol`: string
  - The display symbol defined for the network for the unit of measure, overrides om.
- `classifiedAs`: array
  - References one or more uri's for a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping; or it can be one or more string classifications such as tags.
  - **Items**:
    - **Type**: `string`

---

## Query

**ID**: `vf.knowledge.listUnits`

- **Type**: `query`
- **Description**: List units.
- **Parameters**:
  - `uri`: string (at-uri)
    - Fetch a single record by AT-URI. Other filters are ignored when set.
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

