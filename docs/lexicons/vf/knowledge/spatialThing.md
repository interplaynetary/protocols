# vf.knowledge.spatialThing

## Record

**ID**: `vf.knowledge.spatialThing`

- **Type**: `record`
- **Description**: Data that locates something relative to the Earth, usually a somewhat fixed location.
- `long`: string
  - The WGS84 longitude of a spatial thing (decimal degrees).
- `lat`: string
  - The WGS84 latitude of a spatial thing (decimal degrees).
- `alt`: string
  - The WGS84 altitude of a spatial thing (decimal meters above the local reference ellipsoid)
- `mappableAddress`: string
  - A textual address that can be mapped using mapping software.
- `hasDetailedGeometry`: string
  - A spatial geometry of any complexity and tooling supported by geosparql.
- `name`: string
  - An informal or formal textual identifier for an object. Does not imply uniqueness.
- `note`: string
  - Any useful textual information related to the item.

---

## Query

**ID**: `vf.knowledge.listSpatialThings`

- **Type**: `query`
- **Description**: List spatialThings.
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

