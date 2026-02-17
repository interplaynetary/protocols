# vf.planning.proposal

## Record

**ID**: `vf.planning.proposal`

- **Type**: `record`
- **Description**: Published requests or offers, sometimes with what is expected in return.
- `hasBeginning`: string (datetime)
  - The planned or actual beginning date, and time if desired, of a flow or process.
- `hasEnd`: string (datetime)
  - The planned or actual ending date, and time if desired, of a flow or process.
- `unitBased`: boolean
  - This group of intents contains unit based quantities, which can be multipied to create commitments; commonly seen in a price list or e-commerce. Default false.
- `purpose`: string
  - The type of proposal, whether offer or request (others may be added as need arises).
  - **Known Values**: `offer`, `request`
- `created`: string (datetime)
  - The date, and time if desired, the information was agreed to or recorded.
- `eligibleLocation`: string (at-uri)
  - Location or area where the proposal is valid.
- `name`: string
  - An informal or formal textual identifier for an object. Does not imply uniqueness.
- `note`: string
  - Any useful textual information related to the item.
- `publishes`: array
  - The primary intent(s) of this published proposal. Would be used in intent matching.
  - **Items**:
    - **Type**: `string`
- `reciprocal`: array
  - The reciprocal intent(s) of this published proposal. Not meant to be used for intent matching.
  - **Items**:
    - **Type**: `string`
- `proposedTo`: array
  - The agent(s) to which the proposal or proposal list is published.
  - **Items**:
    - **Type**: `string`
- `listedIn`: array
  - This proposal is part of these lists of proposals.
  - **Items**:
    - **Type**: `string`

---

## Query

**ID**: `vf.planning.listProposals`

- **Type**: `query`
- **Description**: List proposals. Filterable by: unitBased, purpose, eligibleLocation, publishes, reciprocal, proposedTo, listedIn.
- **Parameters**:
  - `uri`: string (at-uri)
    - Fetch a single record by AT-URI. Other filters are ignored when set.
  - `unitBased`: boolean
    - Filter by unitBased.
  - `purpose`: string
    - Filter by purpose value.
  - `eligibleLocation`: string (at-uri)
    - Filter by eligibleLocation (AT-URI of referenced record).
  - `publishes`: string (at-uri)
    - Filter where publishes array contains this AT-URI.
  - `reciprocal`: string (at-uri)
    - Filter where reciprocal array contains this AT-URI.
  - `proposedTo`: string (did)
    - Filter where proposedTo array contains this DID.
  - `listedIn`: string (at-uri)
    - Filter where listedIn array contains this AT-URI.
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

