# vf.observation.batchLotRecord

## Record

**ID**: `vf.observation.batchLotRecord`

- **Type**: `record`
- **Description**: A document which contains all the needed detail related to the production process of a particular batch or lot, a resource processed in the same process(es) so that it is expected to be homogeneous.
- `batchLotCode`: string
  - The code or identifier for this batch or lot, used to physically label individuals in the batch or lot.
- `expirationDate`: string (datetime)
  - The date after which a resource of this batch or lot should no longer be used or consumed.

---

## Query

**ID**: `vf.observation.listBatchLotRecords`

- **Type**: `query`
- **Description**: List batchLotRecords.
- **Parameters**:
  - `uri`: string (at-uri)
    - Fetch a single record by AT-URI. Other filters are ignored when set.
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

