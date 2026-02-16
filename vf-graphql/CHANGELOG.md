## 0.9.0-alpha.12

- Added `mcp` server
- Bun Migration

## 0.9.0-alpha.11

- Added `image` to `ProcessSpecification`.
- Added `stage` to `CommitmentCreateParams` and `CommitmentUpdateParams`

## 0.9.0-alpha.10

- **Breaking:** revised _Recipe_ schemas. `RecipeResource` removed for simplicity and `RecipeFlow` now references `ResourceSpecification` directly.
- Added `ResourceSpecification.substitutable` property for declaring whether `EconomicResource` types are fungible or not.

## 0.9.0-alpha.9

- **Breaking:** introduced an arbitrary-precision `Decimal` type in place of all existing `Float` values to avoid rounding errors in some language backends.
- The pagination parameters `startCursor` and `endCursor` are now nullable, for cases where no results are returned.
- Updated `@graphql-tools/merge` to 8.3.16 to fix bundling errors when used with certain TypeScript compiler configurations.
- Added `imageList` to `Intent`, `Resource` and `ResourceSpecification` to allow specifying multiple "secondary" images for these records.
- `name` and `created` are now optional parameters when creating a new `Agreement`.

## 0.9.0-alpha.8

- Fixed schema files for `Commitment`, `Intent`, `Fulfillment` & `Satisfaction` history queries being incorrectly named, leading to missing query edges.

## 0.9.0-alpha.7

- **Breaking:** removed `deleteEconomicEvent` and `deleteEconomicResource` as there are bookkeeping repercussions for deleting them, even in simple cases.
- Fixed schema files for `ResourceSpecification` & `ProcessSpecification` history queries being incorrectly named, leading to missing query edges.

## 0.9.0-alpha.6

- Added all currently defined [inverse query relationships](https://www.valueflo.ws/specification/inverses/)
- **Breaking:** changed query edges of all `Process` flow relationships (`Commitment`, `Intent` and `EconomicEvent`) to parameterise filters consistently with other edges. Previous `action` parameter is now present as a property of the standard `filter` argument.
- **Breaking:** added pagination to all `Agent` relationship query edges
- **Breaking:** updated track & trace API queries:
    - `EconomicEvent` now has `previous` & `next`, which may be a `Process` or `EconomicResource`
    - `EconomicResource` now has `previous` & `next`, which may only return `EconomicEvent`s
    - Expanded `track` & `trace` queries on `EconomicEvent` & `EconomicResource` to return any of `Process`, `EconomicResource` or `EconomicEvent`
    - Renamed `track` & `trace` on `Process` to `previous` and `next` for compatibility with other records. These edges still only return `EconomicEvent` records.
- Added `Agent` filter params to agent query APIs, allowing filter by agent classification
- Added `Process`, `Commitment`, `Intent`, `Claim` & `Proposal` filter params to toplevel query APIs
- Added `offers` & `requests` convenience queries for easier `Proposal` retrieval
- Added convenience query edges `Proposal.primaryIntents` and `Proposal.reciprocalIntents`
- `Plan.processes`, `Scenario.plans` & `Scenario.refinements` are no longer paginated
- Added missing `Commitment.stage` field
- Fixed `Claim.provider` & `Claim.receiver` missing
- Fixed `inScopeOf` field being included in `Claim`, `Process` and `Scenario` when "agent" module is not defined
- Fixed `ScenarioDefinitionEdge` referencing `Satisfaction` instead of `ScenarioDefinition`
- **Breaking:** fixed `EconomicEvent.appreciationWith` incorrectly named as `EconomicEvent.appreciatedBy`

## 0.9.0-alpha.5

- Added `plannedWithin` to `Commitment`, for referencing `Plan`s that a `Commitment` is independently a part of (separate to any `Process`)

## 0.9.0-alpha.4

- **Breaking:** refactored schema modules to decouple into discrete types wherever possible. As a result, integrators will need to update any VF module ID whitelists. Only strongly-coupled record types remain declared in shared module files.
    - `observation.gql` no longer contains `Process` or `ProductBatch`, which are now in their own modules of the same names.
    - `planning.gql` no longer exists; see now the separate modules `commitment`, `intent`, `fulfillment` & `satisfaction`.
    - `knowledge.gql` no longer exists, and has been refactored into `action`, `process_specification` and `resource_specification`.

## 0.9.0-alpha.3

- Record metadata fields renamed for clarity: `currentRevision` is now `retrievedRevision`
- Revision author now references an REA `Agent`, rather than a scalar ID to be manually associated by applications
- Make return values for all inter-type edges non-mandatory so that errors are not thrown if implementations choose to omit null values
- Cleanup of `Agent` / `Proposal` query edges for pagination
- Downgrades/fixes in mock server due to GraphQL / Express compatibility issues

## 0.9.0-alpha.2

- Fix deletion mutations returning nullable values
- Fix `AgentRelationship.inScopeOf` not being assignable in create or update mutations

## 0.9.0-alpha.1

- **Breaking:** switched to a revision-based API for referencing updates & deletions, for compatibility with eventually-consistent distributed systems
    - Added a new optional `history` module, which implementations featuring human-facing conflict resolution capabilities may implement. These additional query edges, metadata and response types provide a minimal-footprint API which can be used to resolve conflicts between divergent branches of the same record. See the 'bridging' schemas beginning with `history.*` as a reference.
    - `revisionId` is now a mandatory field in all updateable record types. For systems which do not implement `history`, it is fine to return `revisionId` with the same value as `id` and to use this identifier for updates.
- **Breaking:** updated all record query edges and relationships to conform to the [Relay Connections specification](https://relay.dev/graphql/connections.htm) in order to efficiently manage large result sets by way of pagination.
    - Cursors for managing pagination are now required metadata to be provided with list-based result sets. Other optional page metadata may also be returned to assist with the user interface if the implementation can support it (see `pagination.gql`).
    - If the `filtering` module is enabled, query `filter` parameters are added to the record relationships. The parameter names and logic for these queries are defined in the `bridging/*.filtering.gql` schema files, and are particular to the type of data they relate.
    - Systems may also choose to implement the `ordering` module, which augments record relationships with an `orderBy` parameter. See the `bridging/*.ordering.gql` schema files.

## 0.8.5

- Fixed errata in fields being required or not:
    - `Claim.triggeredBy` is now required when creating
    - `Plan.name` is now required
    - `ScenarioDefinition.name` is now correctly required when creating, but not when updating
    - `Scenario.definedAs` is no longer required
    - Fixed `Intent` mutation parameters not being marked as required
- **Breaking:** added a new field `EconomicEvent.toLocation` for managing resource location updates. `EconomicResource.currentLocation` is no longer updateable directly.
- Fix `EconomicEvent.inScopeOf` being updateable when it should not be
- Fix `RecipeFlow.recipeFlowResource` not being required when it should be
- Fix `RecipeProcess.processConformsTo` being required when it should not be
- Added `Commitment.plannedWithin`
- Fixed IDs not being mandatory in all direct-retrieval API methods
- Added a mock GraphQLClient for direct use in UI code, to complement the mock GraphQLServer
- Fixed some geolocation fields being present in the generated schema when the `geolocation` module is not active
- Added a new edge `Plan.nonProcessCommitments` as an inverse mapping of `Commitment.plannedWithin`
- Switched to [PNPM](http://pnpm.js.org/) for package management for better cross-monorepo support
- **Reflect correct Apache-2.0 licensing** in NPM metadata (was: MIT)
- Updated GraphQL toolchain in dependencies: `@graphql-tools` v6-v8; `@graphql-codegen` v1-v2; `@apollo.client` v2-v3.

## 0.8.4

- Fixed casing of `AgreementResponse.agreement` to remove uppercase `A`
- GraphQL peer dependency minimum compatible version downgraded to `14.5.8`. (Incompatibilities were between GraphQL & GraphiQL, not this lib.)

## 0.8.3

- Added `classifiedAs` to `Organization`
- Added `onHandEffect` to `Action`
- Added `defaultUnitOfResource` to `ResourceSpecification`
- Added `RecipeExchange` to the _recipe_ module
- Further modularised schemas to allow economic modules to be used without `Agent` functionality
- Updated GraphQL modules to most recent version (`15.x` series) and configured `graphql` as a peerDependency to allow broader compatibility

## 0.8.2

- Allow overriding options for both `buildASTSchema` and `mergeTypeDefs`

## 0.8.1

- Allow overriding options to `mergeTypeDefs` in order to deal with looser validation in extension schemas

## 0.8.0

- Added an additional argument to `buildSchema` to allow passing extension schemas as SDL strings in order to extend core VF with custom domain-specific additions easily
- **Breaking:** removed loose `AnyType` custom scalar and restricted `inScopeOf` fields to only allow `Person | Organization` as valid values. Note that implementations may extend the `AccountingScope` union type if they wish to allow other types of record scoping (eg. groups without collective agency, geographical locations).
- **Breaking:** removed `all` prefixes from toplevel record listing endpoints for sensible autocomplete, and made search endpoint query prefixes into suffixes
- **Breaking:** fixed deletion methods taking `String` when they should receive `ID`

## 0.7.1

- Fix generated TypeScript / Flow types missing "bridging" fields due to misconfiguration of `graphql-codegen`
- Fix `EconomicEvent` appreciation edges linking directly to other events instead of via `Appreciation`

## 0.7.0

- Added descriptions to all `input` fields, to make interacting with the API more self-documenting
- Added pagination parameters to all list queries
- Removed many accounting fields from `EconomicEventUpdateParams` that should not have been present
- Added various fields missed in the original conversion:
    - `Agent.primaryLocation`
    - `Scenario.definedAs`
- Fixed missing input fields:
    - `basedOn` & `classifiedAs` in `ProcessUpdateParams`
    - `refinementOf` in `Plan` create / update
    - `resourceConformsTo` in `RecipeResource` create / update
    - `processClassifiedAs` in `RecipeProcess` create / update
    - `refinementOf` in `Scenario` create / update
    - `ScenarioDefinitionUpdateParams.name`
- Add missing mutations & queries for `Claim`, `Scenario`, `ScenarioDefinition` & `SpatialThing`
- Removed `pass` & `fail` actions from the set of core verbs (see [ValueFlows/#610](https://github.com/valueflows/valueflows/issues/610))

## 0.6.1

- Finished some rough edges on modularisation such that you no longer need to explicitly include `query` and `mutation` in the list of schemas to `buildSchema()`.

## 0.6.0

- **Breaking:** significant changes to the internal structure of the module to facilitate modular composition of schemas. Now exports a `buildSchema` function rather than pre-initialised `schema` object. Use `printSchema` on the output of `buildSchema()` for tools which require the input as an SDL schema string, rather than a GraphQLSchema object.

## 0.5.0

- **Breaking:** renames the `transfer-complete` action to `transfer`, as the former was confusing for some users
- Adds missed mutations for `Proposal` and related records

## 0.4.3

- Adds `defaultUnitOfEffort` to `ResourceSpecification` as a stop-gap for unit inference in VF0.4 release (see [#64](https://github.com/valueflows/vf-graphql/issues/64))

## 0.4.2

- Finalise fields for `EconmicResource` & `EconomicEvent` creation & update logic

## 0.4.1

- Adds missed mutations for `Unit` & `ProcessSpecification`

## 0.4.0

**Updated for ValueFlows 0.4 release.**

- Changed from [QUDT](http://www.qudt.org/pages/QUDToverviewPage.html) to [OM](https://github.com/HajoRijgersberg/OM) ontology for measurements
- New action metadata
- Add `EconomicResource` stage & state attributes
- Remove `before` & `after` time fields on `EconomicEvent` & `Process`

## 0.3.0

Initial release. Rough around the edges, missing many mutations & queries, but the core schema is stable.
