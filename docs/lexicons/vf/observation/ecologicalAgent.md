# vf.observation.ecologicalAgent

## Record

**ID**: `vf.observation.ecologicalAgent`

- **Type**: `record`
- **Description**: A non-human being; or a functional group of non-human beings; or an ecosystem of living beings that includes non-humans; but it has agency and receives and/or provides economic/ecological resources.
- `primaryLocation`: string (at-uri)
  - The main place an agent is located, often an address where activities occur and mail can be sent. This is usually a mappable geographic location.
- `image`: string (uri)
  - The uri to an image relevant to the entity, such as a logo, avatar, photo, diagram, etc.
- `name`: string
  - An informal or formal textual identifier for an object. Does not imply uniqueness.
- `note`: string
  - Any useful textual information related to the item.
- `classifiedAs`: array
  - References one or more uri's for a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping; or it can be one or more string classifications such as tags.
  - **Items**:
    - **Type**: `string`

---

## Query

**ID**: `vf.observation.listEcologicalAgents`

- **Type**: `query`
- **Description**: List ecologicalAgents. Filterable by: primaryLocation.
- **Parameters**:
  - `uri`: string (at-uri)
    - Fetch a single record by AT-URI. Other filters are ignored when set.
  - `primaryLocation`: string (at-uri)
    - Filter by primaryLocation (AT-URI of referenced record).
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

