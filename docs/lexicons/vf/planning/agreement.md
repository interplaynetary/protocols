# vf.planning.agreement

## Record

**ID**: `vf.planning.agreement`

- **Type**: `record`
- **Description**: A set of reciprocal commitments among economic agents, and/or a set of reciprocal economic events.
- `created`: string (datetime)
  - The date, and time if desired, the information was agreed to or recorded.
- `name`: string
  - An informal or formal textual identifier for an object. Does not imply uniqueness.
- `note`: string
  - Any useful textual information related to the item.
- `stipulates`: array
  - All the primary commitments that constitute the agreement.
  - **Items**:
    - **Type**: `string`
- `stipulatesReciprocal`: array
  - All the reciprocal commitments that constitute the agreement.
  - **Items**:
    - **Type**: `string`
- `realizes`: array
  - All the non-reciprocal economic events (with or without commitments) that realize the agreement.
  - **Items**:
    - **Type**: `string`
- `realizesReciprocal`: array
  - All the reciprocal economic events (with or without commitments) that realize the agreement.
  - **Items**:
    - **Type**: `string`
- `bundledIn`: string (at-uri)
  - This agreement is bundled with other agreements, for example in an order.

---

## Query

**ID**: `vf.planning.listAgreements`

- **Type**: `query`
- **Description**: List agreements. Filterable by: stipulates, stipulatesReciprocal, realizes, realizesReciprocal, bundledIn.
- **Parameters**:
  - `uri`: string (at-uri)
    - Fetch a single record by AT-URI. Other filters are ignored when set.
  - `stipulates`: string (at-uri)
    - Filter where stipulates array contains this AT-URI.
  - `stipulatesReciprocal`: string (at-uri)
    - Filter where stipulatesReciprocal array contains this AT-URI.
  - `realizes`: string (at-uri)
    - Filter where realizes array contains this AT-URI.
  - `realizesReciprocal`: string (at-uri)
    - Filter where realizesReciprocal array contains this AT-URI.
  - `bundledIn`: string (at-uri)
    - Filter by bundledIn (AT-URI of referenced record).
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

