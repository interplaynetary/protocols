# vf.knowledge.action

## Record

**ID**: `vf.knowledge.action`

- **Type**: `record`
- **Description**: An action verb defining the kind of flow and its behavior.
- `actionId` (Required): string
  - The canonical identifier for this action type
  - **Known Values**: `accept`, `cite`, `combine`, `consume`, `copy`, `deliverService`, `dropoff`, `lower`, `modify`, `move`, `pickup`, `produce`, `raise`, `separate`, `transfer`, `transferAllRights`, `transferCustody`, `use`, `work`
- `label` (Required): string
  - The display label defined for the network for the unit of measure, overrides om.
- `inputOutput`: string
  - Denotes if a process input or output, or not applicable to a process.
  - **Known Values**: `input`, `notApplicable`, `output`, `outputInput`
- `pairsWith`: string
  - The action that usually affects the same resource as a complement in the same flow.
- `createResource`: string
  - The action can create an economic resource.
  - **Known Values**: `notApplicable`, `optional`, `optionalTo`
- `eventQuantity`: string
  - The event quantity applicable is resource quantity, effort quantity, or both.
  - **Known Values**: `both`, `effort`, `resource`
- `accountingEffect`: string
  - The increment and/or decrement effect the action will have on the accounting quantity of an inventoried resource.
  - **Known Values**: `decrement`, `decrementIncrement`, `increment`, `incrementTo`
- `onhandEffect`: string
  - The increment and/or decrement effect the action will have on the onhand quantity of an inventoried resource.
  - **Known Values**: `decrement`, `decrementIncrement`, `increment`, `incrementTo`
- `locationEffect`: string
  - This action can update the current location of an inventoried resource.
  - **Known Values**: `new`, `notApplicable`, `update`, `updateTo`
- `containedEffect`: string
  - The contained in resource should be updated or removed.
  - **Known Values**: `notApplicable`, `remove`, `update`, `updateTo`
- `accountableEffect`: string
  - The primaryAccountable should be updated to the event receiver, or not.
  - **Known Values**: `new`, `updateTo`
- `stageEffect`: string
  - The stage of the inventoried resource should be updated, or not.
  - **Known Values**: `update`
- `stateEffect`: string
  - The state of the from or to inventoried resource should be updated, or not.
  - **Known Values**: `update`, `updateTo`

---

## Query

**ID**: `vf.knowledge.listActions`

- **Type**: `query`
- **Description**: List actions. Filterable by: actionId, inputOutput, createResource, eventQuantity, accountingEffect, onhandEffect, locationEffect, containedEffect, accountableEffect, stageEffect, stateEffect.
- **Parameters**:
  - `uri`: string (at-uri)
    - Fetch a single record by AT-URI. Other filters are ignored when set.
  - `actionId`: string
    - Filter by actionId value.
  - `inputOutput`: string
    - Filter by inputOutput value.
  - `createResource`: string
    - Filter by createResource value.
  - `eventQuantity`: string
    - Filter by eventQuantity value.
  - `accountingEffect`: string
    - Filter by accountingEffect value.
  - `onhandEffect`: string
    - Filter by onhandEffect value.
  - `locationEffect`: string
    - Filter by locationEffect value.
  - `containedEffect`: string
    - Filter by containedEffect value.
  - `accountableEffect`: string
    - Filter by accountableEffect value.
  - `stageEffect`: string
    - Filter by stageEffect value.
  - `stateEffect`: string
    - Filter by stateEffect value.
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

