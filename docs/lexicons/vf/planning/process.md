# vf.planning.process

## Record

**ID**: `vf.planning.process`

- **Type**: `record`
- **Description**: An activity that changes inputs into outputs, by transforming or transporting economic resource(s).
- `hasInput`: array
  - All the input flows of a process.
  - **Items**:
    - **Type**: `string`
- `hasOutput`: array
  - All the output flows of a process.
  - **Items**:
    - **Type**: `string`
- `plannedWithin`: string (at-uri)
  - The process with its inputs and outputs, or the non-process commitment or intent, is part of the plan.
- `inScopeOf`: string (did)
  - Scope here means executed in the context of an agent.
- `hasBeginning`: string (datetime)
  - The planned or actual beginning date, and time if desired, of a flow or process.
- `hasEnd`: string (datetime)
  - The planned or actual ending date, and time if desired, of a flow or process.
- `name`: string
  - An informal or formal textual identifier for an object. Does not imply uniqueness.
- `note`: string
  - Any useful textual information related to the item.
- `finished`: boolean
  - The commitment or intent or process is complete or not.  This is irrespective of if the original goal has been met, and indicates simply that no more will be done.  Default false.
- `basedOn`: string (at-uri)
  - The definition or standard specification for a process.
- `classifiedAs`: array
  - References one or more uri's for a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping; or it can be one or more string classifications such as tags.
  - **Items**:
    - **Type**: `string`

---

## Query

**ID**: `vf.planning.listProcesses`

- **Type**: `query`
- **Description**: List processes. Filterable by: hasInput, hasOutput, plannedWithin, inScopeOf, finished, basedOn.
- **Parameters**:
  - `uri`: string (at-uri)
    - Fetch a single record by AT-URI. Other filters are ignored when set.
  - `hasInput`: string (at-uri)
    - Filter where hasInput array contains this AT-URI.
  - `hasOutput`: string (at-uri)
    - Filter where hasOutput array contains this AT-URI.
  - `plannedWithin`: string (at-uri)
    - Filter by plannedWithin (AT-URI of referenced record).
  - `inScopeOf`: string (did)
    - Filter by inScopeOf (DID of referenced agent).
  - `finished`: boolean
    - Filter by finished.
  - `basedOn`: string (at-uri)
    - Filter by basedOn (AT-URI of referenced record).
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

