# vf.observation.economicResource

## Record

**ID**: `vf.observation.economicResource`

- **Type**: `record`
- **Description**: Economic or environmental things (material or digital), media of exchange, which agents agree should be accounted for and which can be inventoried.
- `containedIn`: array
  - Used when an economic resource contains units also defined as separate economic resources, for example a tool kit or a package of resources for shipping.
  - **Items**:
    - **Type**: `string`
- `contains`: array
  - An economic resource contains at least one other economic resource, for example a tool kit or package of resources for shipping.
  - **Items**:
    - **Type**: `string`
- `primaryAccountable`: string (did)
  - The agent currently with primary rights and responsibilites for the economic resource. It is the agent that is associated with the accountingQuantity of the economic resource.
- `accountingQuantity`: ref
  - The current amount and unit of the economic resource for which the agent has primary rights and responsibilities, sometimes thought of as ownership. This can be either stored or derived from economic events affecting the resource.
- `onhandQuantity`: ref
  - The current amount and unit of the economic resource which is under direct control of the agent.  It may be more or less than the accounting quantity. This can be either stored or derived from economic events affecting the resource.
- `currentLocation`: string (at-uri)
  - The current physical location of an economic resource.  Could be at any level of granularity, from a town to an address to a warehouse location.  Usually mappable.
- `currentVirtualLocation`: string (uri)
  - The current virtual place a digital economic resource is located. Usually used for documents, code, or other electronic resource.
- `currentCurrencyLocation`: string
  - The current virtual place a currency economic resource is located, for example the address for a bank account, crypto wallet, etc., in a domain standard format.
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
- `trackingIdentifier`: string
  - Any identifier used to track a singular resource, such as a serial number or VIN.
- `ofBatchLot`: string (at-uri)
  - The batch lot record of this resource, if it is a batch or lot resource.
- `unitOfEffort`: string (at-uri)
  - The unit used for use or work or sometimes cite actions.
- `classifiedAs`: array
  - References one or more uri's for a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping; or it can be one or more string classifications such as tags.
  - **Items**:
    - **Type**: `string`
- `conformsTo`: string (at-uri)
  - The primary resource specification or definition of an existing or potential economic resource.
- `stage`: string (at-uri)
  - The required stage of the desired input economic resource. References the ProcessSpecification of the last process the economic resource went through.
- `state`: string
  - The required state of the desired input economic resource, after coming out of a test or review process.

---

## Query

**ID**: `vf.observation.listEconomicResources`

- **Type**: `query`
- **Description**: List economicResources. Filterable by: containedIn, contains, primaryAccountable, currentLocation, ofBatchLot, unitOfEffort, conformsTo, stage.
- **Parameters**:
  - `uri`: string (at-uri)
    - Fetch a single record by AT-URI. Other filters are ignored when set.
  - `containedIn`: string (at-uri)
    - Filter where containedIn array contains this AT-URI.
  - `contains`: string (at-uri)
    - Filter where contains array contains this AT-URI.
  - `primaryAccountable`: string (did)
    - Filter by primaryAccountable (DID of referenced agent).
  - `currentLocation`: string (at-uri)
    - Filter by currentLocation (AT-URI of referenced record).
  - `ofBatchLot`: string (at-uri)
    - Filter by ofBatchLot (AT-URI of referenced record).
  - `unitOfEffort`: string (at-uri)
    - Filter by unitOfEffort (AT-URI of referenced record).
  - `conformsTo`: string (at-uri)
    - Filter by conformsTo (AT-URI of referenced record).
  - `stage`: string (at-uri)
    - Filter by stage (AT-URI of referenced record).
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

