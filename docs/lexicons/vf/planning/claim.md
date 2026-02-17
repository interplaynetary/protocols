# vf.planning.claim

## Record

**ID**: `vf.planning.claim`

- **Type**: `record`
- **Description**: A claim for a future economic event(s) in reciprocity for an economic event that already occurred.
- `action` (Required): string (at-uri)
  - Defines the kind of flow, such as consume, produce, work, transfer, etc.
- `provider`: string (did)
  - The economic agent by whom the intended, committed, or actual economic event is initiated.
- `receiver`: string (did)
  - The economic agent whom the intended, committed, or actual economic event is for.
- `triggeredBy`: string (at-uri)
  - References an economic event that implied the claim, often based on a prior agreement.
- `due`: string (datetime)
  - The date, and time if desired, something is expected to be complete.
- `resourceQuantity`: ref
  - The amount and unit of the economic resource counted or inventoried.
- `effortQuantity`: ref
  - The amount and unit of the work or use or citation effort-based action. This is often expressed with a time unit, but also could be cycle counts or other measures of effort or usefulness.
- `created`: string (datetime)
  - The date, and time if desired, the information was agreed to or recorded.
- `note`: string
  - Any useful textual information related to the item.
- `finished`: boolean
  - The commitment or intent or process is complete or not.  This is irrespective of if the original goal has been met, and indicates simply that no more will be done.  Default false.
- `resourceClassifiedAs`: array
  - References one or more uri's for a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping; or can be one or more string classifications such as tags.
  - **Items**:
    - **Type**: `string`
- `resourceConformsTo`: string (at-uri)
  - The lowest level resource specification or definition of an existing or potential economic resource, whether one will ever be instantiated or not.

---

## Query

**ID**: `vf.planning.listClaims`

- **Type**: `query`
- **Description**: List claims. Filterable by: action, provider, receiver, triggeredBy, finished, resourceConformsTo.
- **Parameters**:
  - `uri`: string (at-uri)
    - Fetch a single record by AT-URI. Other filters are ignored when set.
  - `action`: string (at-uri)
    - Filter by action (AT-URI of referenced record).
  - `provider`: string (did)
    - Filter by provider (DID of referenced agent).
  - `receiver`: string (did)
    - Filter by receiver (DID of referenced agent).
  - `triggeredBy`: string (at-uri)
    - Filter by triggeredBy (AT-URI of referenced record).
  - `finished`: boolean
    - Filter by finished.
  - `resourceConformsTo`: string (at-uri)
    - Filter by resourceConformsTo (AT-URI of referenced record).
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

