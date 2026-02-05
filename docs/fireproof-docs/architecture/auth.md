Auth
Fireproof's end-user authentication architecture enables developers to add cloud sync and collaboration features to their applications while maintaining strict data isolation. The system integrates with identity management services, allowing applications to configure their preferred authentication providers and user experience. Each application defines its authentication scope through a tenant identifier, which creates an isolated namespace for all user data and sharing operations.

The initial sharing implementation is designed for trusted group collaboration similar to Google Docs, where all participants have equal access to shared ledgers, simplifying the access control model to metadata-level permissions.

The sharing architecture leverages Fireproof's immutable data model, where every change is cryptographically signed and recorded. This approach enables comprehensive audit trails and makes it possible to repair or roll back unauthorized changes without losing history.

