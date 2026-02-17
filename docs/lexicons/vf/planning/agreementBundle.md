# vf.planning.agreementBundle

## Record

**ID**: `vf.planning.agreementBundle`

- **Type**: `record`
- **Description**: A grouping of agreements to bundle detailed line item reciprocity.
- `created`: string (datetime)
  - The date, and time if desired, the information was agreed to or recorded.
- `name`: string
  - An informal or formal textual identifier for an object. Does not imply uniqueness.
- `note`: string
  - Any useful textual information related to the item.
- `bundles`: array
  - All the agreements included in this agreement bundle.
  - **Items**:
    - **Type**: `string`

---

## Query

**ID**: `vf.planning.listAgreementBundles`

- **Type**: `query`
- **Description**: List agreementBundles. Filterable by: bundles.
- **Parameters**:
  - `uri`: string (at-uri)
    - Fetch a single record by AT-URI. Other filters are ignored when set.
  - `bundles`: string (at-uri)
    - Filter where bundles array contains this AT-URI.
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

