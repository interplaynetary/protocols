# vf.knowledge.resourceSpecification

## Record

**ID**: `vf.knowledge.resourceSpecification`

- **Type**: `record`
- **Description**: Specifies the kind of economic or environmental resource, even if the resource is not instantiated as an EconomicResource. Could define a material or digital thing, service, medium of exchange or currency, skill or type of work.
- `image`: string (uri)
  - The uri to an image relevant to the entity, such as a logo, avatar, photo, diagram, etc.
- `imageList`: array
  - A comma separated list of uri addresses to images relevant to the resource.
  - **Items**:
    - **Type**: `string`
- `name`: string
  - An informal or formal textual identifier for an object. Does not imply uniqueness.
- `note`: string
  - Any useful textual information related to the item.
- `mediumOfExchange`: boolean
  - True if the resource is a currency, money, token, credit, etc. used as a medium of exchange.
- `substitutable`: boolean
  - Defines if any resource of that type can be freely substituted for any other resource of that type when used, consumed, traded, etc.
- `defaultUnitOfEffort`: string (at-uri)
  - The default unit used for use or work.
- `defaultUnitOfResource`: string (at-uri)
  - The default unit used for the resource itself.
- `resourceClassifiedAs`: array
  - References one or more uri's for a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping; or can be one or more string classifications such as tags.
  - **Items**:
    - **Type**: `string`

---

## Query

**ID**: `vf.knowledge.listResourceSpecifications`

- **Type**: `query`
- **Description**: List resourceSpecifications. Filterable by: mediumOfExchange, substitutable, defaultUnitOfEffort, defaultUnitOfResource.
- **Parameters**:
  - `uri`: string (at-uri)
    - Fetch a single record by AT-URI. Other filters are ignored when set.
  - `mediumOfExchange`: boolean
    - Filter by mediumOfExchange.
  - `substitutable`: boolean
    - Filter by substitutable.
  - `defaultUnitOfEffort`: string (at-uri)
    - Filter by defaultUnitOfEffort (AT-URI of referenced record).
  - `defaultUnitOfResource`: string (at-uri)
    - Filter by defaultUnitOfResource (AT-URI of referenced record).
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

