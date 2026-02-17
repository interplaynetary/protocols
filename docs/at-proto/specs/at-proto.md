AT Protocol
The Authenticated Transfer Protocol (AT Protocol or atproto) is a generic federated protocol for building open social media applications. Some recurring themes and features are:

Self-authenticating data and identity, allowing seamless account migrations and redistribution of content
Design for "big world" use cases, scaling to billions of accounts
Delegated authority over application-layer schemas and aggregation infrastructure
Re-use of existing data models from the dweb protocol family and network primitives from the web platform
Protocol Structure
Identity: account control is rooted in stable DID identifiers, which can be rapidly resolved to determine the current service provider location and Cryptographic keys associated with the account. Handles provide a more human-recognizable and mutable identifier for accounts.

Data: public content is stored in content-addressed and cryptographically verifiable Repositories. Data records and network messages all conform to a unified Data Model (with CBOR and JSON representations). Labels are a separate lightweight form of metadata, individually signed and distributed outside repositories.

Network: HTTP client-server and server-server APIs are described with Lexicons, as are WebSocket Event Streams. Individual records can be referenced across the network by AT URI. A Personal Data Server (PDS) acts as an account's trusted agent in the network, routes client network requests, and hosts repositories. A relay crawls many repositories and outputs a unified event Firehose.

Application: APIs and record schemas for applications built on atproto are specified in Lexicons, which are referenced by Namespaced Identifiers (NSIDs). Application-specific aggregations (such as search) are provided by an Application View (App View) service. Clients can include mobile apps, desktop software, or web interfaces.

The AT Protocol itself does not specify common social media conventions like follows or avatars, leaving these to application-level Lexicons. The com.atproto._ Lexicons provide common APIs for things like account signup and login. These could be considered part of AT Protocol itself, though they can also be extended or replaced over time as needed. Bluesky is a microblogging social app built on top of AT Protocol, with lexicons under the app.bsky._ namespace.

Protocol Extension and Applications
AT Protocol was designed from the beginning to balance stability and interoperation against flexibility for third-party application development.

The core protocol extension mechanism is development of new Lexicons under independent namespaces. Lexicons can declare new repository record schemas (stored in collections by NSID), new HTTP API endpoints, and new event stream endpoints and message types. It is also expected that new applications might require new network aggregation services ("AppViews") and client apps (eg, mobile apps or web interfaces).

It is expected that third parties will reuse Lexicons and record data across namespaces. For example, new applications are welcome to build on top of the social graph records specified in the app.bsky.\* Lexicons, as long as they comply with the schemas controlled by the bsky.app authority.

Governance structures for individual Lexicon namespaces are flexible. They could be developed and maintained by volunteer communities, corporations, consortia, academic researchers, funded non-profits, etc.

What Is Missing?
These specifications cover most details as implemented in Bluesky's reference implementation. A few important pieces have not been finalized, both in that reference implementation and in these specifications.

Moderation Primitives: The com.atproto.admin.\* routes for handling moderation reports and doing infrastructure-level take-downs is specified in Lexicons but should also be described in more detail.

Future Work
Smaller changes are described in individual specification documents, but a few large changes span the entire protocol.

Non-Public Content: mechanisms for private group and one-to-one communication will be an entire second phase of protocol development. This encompasses primitives like "private accounts", direct messages, encrypted data, and more. We recommend against simply "bolting on" encryption or private content using the existing protocol primitives.

Protocol Governance and Formal Standards Process: The current development focus is to demonstrate all the core protocol features via the reference implementation, including open federation. After that milestone, the intent is to stabilize the lower-level protocol and submit the specification for independent review and revision through a standards body such as the IETF or the W3C.
