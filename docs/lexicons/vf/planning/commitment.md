# vf.planning.commitment

## Record

**ID**: `vf.planning.commitment`

- **Type**: `record`
- **Description**: A planned economic flow that has been scheduled or promised by one agent to another agent.
- `action` (Required): string (at-uri)
  - Defines the kind of flow, such as consume, produce, work, transfer, etc.
- `inputOf`: string (at-uri)
  - Relates an input flow to its process.
- `outputOf`: string (at-uri)
  - Relates an output flow to its process.
- `plannedWithin`: string (at-uri)
  - The process with its inputs and outputs, or the non-process commitment or intent, is part of the plan.
- `independentDemandOf`: string (at-uri)
  - This plan is the way this commitment or intent will be realized.
- `resourceInventoriedAs`: string (at-uri)
  - Economic resource involved in the flow.
- `provider`: string (did)
  - The economic agent by whom the intended, committed, or actual economic event is initiated.
- `receiver`: string (did)
  - The economic agent whom the intended, committed, or actual economic event is for.
- `hasBeginning`: string (datetime)
  - The planned or actual beginning date, and time if desired, of a flow or process.
- `hasEnd`: string (datetime)
  - The planned or actual ending date, and time if desired, of a flow or process.
- `hasPointInTime`: string (datetime)
  - The planned or actual date, and time if desired, of a flow; can be used instead of hasBeginning and hasEnd, if so, hasBeginning and hasEnd should be able to return this value.
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
- `satisfies`: array
  - The intent(s) satisfied fully or partially by an economic event or commitment.
  - **Items**:
    - **Type**: `string`
- `finished`: boolean
  - The commitment or intent or process is complete or not.  This is irrespective of if the original goal has been met, and indicates simply that no more will be done.  Default false.
- `resourceClassifiedAs`: array
  - References one or more uri's for a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping; or can be one or more string classifications such as tags.
  - **Items**:
    - **Type**: `string`
- `resourceConformsTo`: string (at-uri)
  - The lowest level resource specification or definition of an existing or potential economic resource, whether one will ever be instantiated or not.
- `stage`: string (at-uri)
  - The required stage of the desired input economic resource. References the ProcessSpecification of the last process the economic resource went through.
- `state`: string
  - The required state of the desired input economic resource, after coming out of a test or review process.
- `clauseOf`: string (at-uri)
  - This commitment is a primary part of the agreement.
- `reciprocalClauseOf`: string (at-uri)
  - This commitment is a reciprocal part of the agreement.

---

## Query

**ID**: `vf.planning.listCommitments`

- **Type**: `query`
- **Description**: List commitments. Filterable by: action, inputOf, outputOf, plannedWithin, independentDemandOf, resourceInventoriedAs, provider, receiver, satisfies, finished, resourceConformsTo, stage, clauseOf, reciprocalClauseOf.
- **Parameters**:
  - `uri`: string (at-uri)
    - Fetch a single record by AT-URI. Other filters are ignored when set.
  - `action`: string (at-uri)
    - Filter by action (AT-URI of referenced record).
  - `inputOf`: string (at-uri)
    - Filter by inputOf (AT-URI of referenced record).
  - `outputOf`: string (at-uri)
    - Filter by outputOf (AT-URI of referenced record).
  - `plannedWithin`: string (at-uri)
    - Filter by plannedWithin (AT-URI of referenced record).
  - `independentDemandOf`: string (at-uri)
    - Filter by independentDemandOf (AT-URI of referenced record).
  - `resourceInventoriedAs`: string (at-uri)
    - Filter by resourceInventoriedAs (AT-URI of referenced record).
  - `provider`: string (did)
    - Filter by provider (DID of referenced agent).
  - `receiver`: string (did)
    - Filter by receiver (DID of referenced agent).
  - `satisfies`: string (at-uri)
    - Filter where satisfies array contains this AT-URI.
  - `finished`: boolean
    - Filter by finished.
  - `resourceConformsTo`: string (at-uri)
    - Filter by resourceConformsTo (AT-URI of referenced record).
  - `stage`: string (at-uri)
    - Filter by stage (AT-URI of referenced record).
  - `clauseOf`: string (at-uri)
    - Filter by clauseOf (AT-URI of referenced record).
  - `reciprocalClauseOf`: string (at-uri)
    - Filter by reciprocalClauseOf (AT-URI of referenced record).
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

