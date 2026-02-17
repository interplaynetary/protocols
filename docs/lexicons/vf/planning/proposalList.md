# vf.planning.proposalList

## Record

**ID**: `vf.planning.proposalList`

- **Type**: `record`
- **Description**: A grouping of proposals, for publishing as a list.
- `created`: string (datetime)
  - The date, and time if desired, the information was agreed to or recorded.
- `name`: string
  - An informal or formal textual identifier for an object. Does not imply uniqueness.
- `note`: string
  - Any useful textual information related to the item.
- `proposedTo`: array
  - The agent(s) to which the proposal or proposal list is published.
  - **Items**:
    - **Type**: `string`
- `lists`: array
  - All the proposals included in this proposal list.
  - **Items**:
    - **Type**: `string`

---

## Query

**ID**: `vf.planning.listProposalLists`

- **Type**: `query`
- **Description**: List proposalLists. Filterable by: proposedTo, lists.
- **Parameters**:
  - `uri`: string (at-uri)
    - Fetch a single record by AT-URI. Other filters are ignored when set.
  - `proposedTo`: string (did)
    - Filter where proposedTo array contains this DID.
  - `lists`: string (at-uri)
    - Filter where lists array contains this AT-URI.
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

