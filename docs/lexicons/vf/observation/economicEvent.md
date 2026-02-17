# vf.observation.economicEvent

## Record

**ID**: `vf.observation.economicEvent`

- **Type**: `record`
- **Description**: An observed economic flow, which could reflect creation or a change in the quantity, location, accountability and/or responsibility, of an economic resource, whether material or not.
- `action` (Required): string (at-uri)
  - Defines the kind of flow, such as consume, produce, work, transfer, etc.
- `inputOf`: string (at-uri)
  - Relates an input flow to its process.
- `outputOf`: string (at-uri)
  - Relates an output flow to its process.
- `resourceInventoriedAs`: string (at-uri)
  - Economic resource involved in the flow.
- `toResourceInventoriedAs`: string (at-uri)
  - Additional economic resource on the economic event when needed by the receiver. Used when a transfer or move, or sometimes other actions, requires explicitly identifying an economic resource by the receiver, which is identified differently by the sender.
- `provider`: string (did)
  - The economic agent by whom the intended, committed, or actual economic event is initiated.
- `receiver`: string (did)
  - The economic agent whom the intended, committed, or actual economic event is for.
- `corrects`: string (at-uri)
  - Used when an event was entered incorrectly and needs to be backed out or corrected. (The initial event cannot be changed.)
- `settles`: array
  - The claim(s) settled fully or partially by the economic event.
  - **Items**:
    - **Type**: `string`
- `hasBeginning`: string (datetime)
  - The planned or actual beginning date, and time if desired, of a flow or process.
- `hasEnd`: string (datetime)
  - The planned or actual ending date, and time if desired, of a flow or process.
- `hasPointInTime`: string (datetime)
  - The planned or actual date, and time if desired, of a flow; can be used instead of hasBeginning and hasEnd, if so, hasBeginning and hasEnd should be able to return this value.
- `resourceQuantity`: ref
  - The amount and unit of the economic resource counted or inventoried.
- `effortQuantity`: ref
  - The amount and unit of the work or use or citation effort-based action. This is often expressed with a time unit, but also could be cycle counts or other measures of effort or usefulness.
- `created`: string (datetime)
  - The date, and time if desired, the information was agreed to or recorded.
- `toLocation`: string (at-uri)
  - The new location of the receiver resource.
- `image`: string (uri)
  - The uri to an image relevant to the entity, such as a logo, avatar, photo, diagram, etc.
- `note`: string
  - Any useful textual information related to the item.
- `fulfills`: array
  - The commitment(s) fulfilled completely or partially by an economic event.
  - **Items**:
    - **Type**: `string`
- `satisfies`: array
  - The intent(s) satisfied fully or partially by an economic event or commitment.
  - **Items**:
    - **Type**: `string`
- `resourceClassifiedAs`: array
  - References one or more uri's for a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping; or can be one or more string classifications such as tags.
  - **Items**:
    - **Type**: `string`
- `resourceConformsTo`: string (at-uri)
  - The lowest level resource specification or definition of an existing or potential economic resource, whether one will ever be instantiated or not.
- `state`: string
  - The required state of the desired input economic resource, after coming out of a test or review process.
- `realizationOf`: string (at-uri)
  - This non-reciprocal economic event occurs as part of this agreement.
- `reciprocalRealizationOf`: string (at-uri)
  - This reciprocal economic event occurs as part of this agreement.

---

## Query

**ID**: `vf.observation.listEconomicEvents`

- **Type**: `query`
- **Description**: List economicEvents. Filterable by: action, inputOf, outputOf, resourceInventoriedAs, toResourceInventoriedAs, provider, receiver, corrects, settles, toLocation, fulfills, satisfies, resourceConformsTo, realizationOf, reciprocalRealizationOf.
- **Parameters**:
  - `uri`: string (at-uri)
    - Fetch a single record by AT-URI. Other filters are ignored when set.
  - `action`: string (at-uri)
    - Filter by action (AT-URI of referenced record).
  - `inputOf`: string (at-uri)
    - Filter by inputOf (AT-URI of referenced record).
  - `outputOf`: string (at-uri)
    - Filter by outputOf (AT-URI of referenced record).
  - `resourceInventoriedAs`: string (at-uri)
    - Filter by resourceInventoriedAs (AT-URI of referenced record).
  - `toResourceInventoriedAs`: string (at-uri)
    - Filter by toResourceInventoriedAs (AT-URI of referenced record).
  - `provider`: string (did)
    - Filter by provider (DID of referenced agent).
  - `receiver`: string (did)
    - Filter by receiver (DID of referenced agent).
  - `corrects`: string (at-uri)
    - Filter by corrects (AT-URI of referenced record).
  - `settles`: string (at-uri)
    - Filter where settles array contains this AT-URI.
  - `toLocation`: string (at-uri)
    - Filter by toLocation (AT-URI of referenced record).
  - `fulfills`: string (at-uri)
    - Filter where fulfills array contains this AT-URI.
  - `satisfies`: string (at-uri)
    - Filter where satisfies array contains this AT-URI.
  - `resourceConformsTo`: string (at-uri)
    - Filter by resourceConformsTo (AT-URI of referenced record).
  - `realizationOf`: string (at-uri)
    - Filter by realizationOf (AT-URI of referenced record).
  - `reciprocalRealizationOf`: string (at-uri)
    - Filter by reciprocalRealizationOf (AT-URI of referenced record).
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

