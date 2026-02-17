# vf.planning.plan

## Record

**ID**: `vf.planning.plan`

- **Type**: `record`
- **Description**: A logical collection of processes, with optional connected agreements, that constitute a body of scheduled work with defined deliverable(s).
- `planIncludes`: array
  - The processes and and non-process commitments/intents that constitute the plan.
  - **Items**:
    - **Type**: `string`
- `hasIndependentDemand`: array
  - The commitments and/or intents which this plan was created to deliver.
  - **Items**:
    - **Type**: `string`
- `due`: string (datetime)
  - The date, and time if desired, something is expected to be complete.
- `created`: string (datetime)
  - The date, and time if desired, the information was agreed to or recorded.
- `name`: string
  - An informal or formal textual identifier for an object. Does not imply uniqueness.
- `note`: string
  - Any useful textual information related to the item.

---

## Query

**ID**: `vf.planning.listPlans`

- **Type**: `query`
- **Description**: List plans. Filterable by: planIncludes, hasIndependentDemand.
- **Parameters**:
  - `uri`: string (at-uri)
    - Fetch a single record by AT-URI. Other filters are ignored when set.
  - `planIncludes`: string (at-uri)
    - Filter where planIncludes array contains this AT-URI.
  - `hasIndependentDemand`: string (at-uri)
    - Filter where hasIndependentDemand array contains this AT-URI.
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

