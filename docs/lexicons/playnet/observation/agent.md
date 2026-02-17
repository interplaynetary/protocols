# playnet.observation.agent

## Record

**ID**: `playnet.observation.agent`

- **Type**: `record`
- **Description**: A human being. All persons are considered agents.
- `type`: string
  - The type of agent.
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

