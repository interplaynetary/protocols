quickslice
Auto-indexing service and GraphQL API for AT Protocol Records

quickslice

bigmoves/quickslice:latest

Just deployed

/data

Deploy and Host quickslice on Railway
quickslice is a GraphQL API server for AT Protocol records. It automatically generates GraphQL schemas from Lexicon definitions, providing real-time data ingestion via Jetstream, historical backfill support, and Relay-compliant cursor-based pagination.

About Hosting quickslice
quickslice runs as a containerized Gleam/Erlang application with SQLite for storage. Hosting requires a Docker-capable platform with persistent volume support for the database. The server ingests data from the AT Protocol firehose in real-time and serves it via GraphQL. Configuration is handled through environment variables for OAuth and via the settings page once the application is deployed. The application exposes a health check endpoint at /health and a GraphiQL interface at /graphiql for query exploration.

Common Use Cases
Application backends: Build apps on AT Protocol data with filtering, sorting, and real-time subscriptions
Data exploration: Use GraphiQL to explore AT Protocol records interactively with automatic schema generation from Lexicons
Dependencies for quickslice Hosting
Persistent Volume: SQLite database requires persistent storage
Environment Secrets: OAUTH_SIGNING_KEY P-256 private key in multibase format (z-prefixed base58btc) for signing OAuth JWTs. Generate via the goat cli https://formulae.brew.sh/formula/goat. The command is: goat key generate -t p256
Deployment Dependencies
https://atproto.com
https://formulae.brew.sh/formula/goat
https://quickslice.slices.network
Implementation Details
Environment variables to configure: OAUTH_SIGNING_KEY=

Volume mount: /data (1GB minimum)

Health check path: /health

Why Deploy quickslice on Railway?
Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying quickslice on Railway, you are one step closer to supporting a complete full-stack application with minimal burden. Host your servers, databases, AI agents, and more on Railway.

---

quickslice
v0.20.0
Search docs...
Stars
51
CHANGELOG
Getting Started
Introduction
Tutorial
Guides
Queries
Joins
Mutations
Moderation
Notifications
Viewer State
Authentication
Deployment
Patterns
Troubleshooting
Reference
Aggregations
Subscriptions
Blobs
Variables
MCP
Quickslice
Warning This project is in early development. APIs may change without notice.

Quickslice is a quick way to spin up an AppView for AT Protocol applications. Import your Lexicon schemas and you get a GraphQL API with OAuth authentication, real-time sync from the network, and joins across record types without setting up a database or writing any backend code.

#The Problem
Building an AppView from scratch means writing a lot of infrastructure code:

Jetstream connection and event handling
Record ingestion and validation
Database schema design and normalization
XRPC API endpoints for querying and writing data
OAuth session management and PDS writes
Efficient batching when resolving related records
This adds up before you write any application logic.

#What Quickslice Does
Quickslice handles all of that automatically:

Connects to Jetstream and tracks the record types defined in your Lexicons
Indexes relevant records into a database (SQLite or Postgres)
Generates GraphQL queries, mutations, and subscriptions from your Lexicon definitions
Handles OAuth and writes records back to the user's PDS
Enables joins by DID, URI, or strong reference, so you can query a status and its author's profile in one request
#When to Use It
You want to skip the AppView boilerplate
You want to prototype Lexicon data structures quickly
You want OAuth handled for you
You want to ship your AppView already
#Next Steps
Build Statusphere with Quickslice: A hands-on tutorial showing what Quickslice handles for you

Previous
CHANGELOG
Next
Tutorial
On this page
The Problem
What Quickslice Does
When to Use It
Next Steps

---

quickslice
v0.20.0
Search docs...
Stars
51
CHANGELOG
Getting Started
Introduction
Tutorial
Guides
Queries
Joins
Mutations
Moderation
Notifications
Viewer State
Authentication
Deployment
Patterns
Troubleshooting
Reference
Aggregations
Subscriptions
Blobs
Variables
MCP
Tutorial: Build Statusphere with Quickslice
Let's build Statusphere, an app where users share their current status as an emoji. This is the same app from the AT Protocol docs, but using Quickslice as the AppView.

Along the way, we'll show what you'd write manually versus what Quickslice handles automatically.

Try it live: A working example is running at StackBlitz, connected to a slice at xyzstatusphere.slices.network with the xyz.statusphere.status lexicon.

NOTE: For the StackBliz example, OAuth will only work if you open the preview in a new tab and login from there 🫠.

#What We're Building
Statusphere lets users:

Log in with their AT Protocol identity
Set their status as an emoji
See a feed of everyone's statuses with profile information
By the end of this tutorial, you'll understand how Quickslice eliminates the boilerplate of building an AppView.

#Step 1: Project Setup and Importing Lexicons
Every AT Protocol app starts with Lexicons. Here's the Lexicon for a status record:

{
"lexicon": 1,
"id": "xyz.statusphere.status",
"defs": {
"main": {
"type": "record",
"key": "tid",
"record": {
"type": "object",
"required": ["status", "createdAt"],
"properties": {
"status": {
"type": "string",
"minLength": 1,
"maxGraphemes": 1,
"maxLength": 32
},
"createdAt": { "type": "string", "format": "datetime" }
}
}
}
}
}
Importing this Lexicon into Quickslice triggers three automatic steps:

Jetstream registration: Quickslice tracks xyz.statusphere.status records from the network
Database schema: Quickslice creates a normalized table with proper columns and indexes
GraphQL types: Quickslice generates query, mutation, and subscription types
Without Quickslice With Quickslice
Write Jetstream connection code Import your Lexicon
Filter events for your collection xyz.statusphere.status
Validate incoming records
Design database schema Quickslice handles the rest.
Write ingestion logic
#Step 2: Querying Status Records
Query indexed records with GraphQL. Quickslice generates a query for each Lexicon type using Relay-style connections:

query GetStatuses {
xyzStatusphereStatus(
first: 20
sortBy: [{ field: createdAt, direction: DESC }]
) {
edges {
node {
uri
did
status
createdAt
}
}
}
}
The edges and nodes pattern comes from Relay, a GraphQL pagination specification. Each edge contains a node (the record) and a cursor for pagination.

You can filter with where clauses:

query RecentStatuses {
xyzStatusphereStatus(
first: 10
where: { status: { eq: "👍" } }
) {
edges {
node {
did
status
}
}
}
}
Without Quickslice With Quickslice
Design query API Query is auto-generated:
Write database queries
Handle pagination logic xyzStatusphereStatus { edges { node { status } } }
Build filtering and sorting
#Step 3: Joining Profile Data
Here Quickslice shines. Every status record has a did field identifying its author. In Bluesky, profile information lives in app.bsky.actor.profile records. Join directly from a status to its author's profile:

query StatusesWithProfiles {
xyzStatusphereStatus(first: 20) {
edges {
node {
status
createdAt
appBskyActorProfileByDid {
displayName
avatar { url }
}
}
}
}
}
The appBskyActorProfileByDid field is a DID join. It follows the did on the status record to find the profile authored by that identity.

Quickslice:

Collects DIDs from the status records
Batches them into a single database query (DataLoader pattern)
Joins profile data efficiently
Without Quickslice With Quickslice
Collect DIDs from status records Add join to your query:
Batch resolve DIDs to profiles
Handle N+1 query problem appBskyActorProfileByDid { displayName }
Write batching logic
Join data in API response
#Other Join Types
Quickslice also supports:

Forward joins: Follow a URI or strong ref to another record
Reverse joins: Find all records that reference a given record
See the Joins Guide for complete documentation.

#Step 4: Writing a Status (Mutations)
To set a user's status, call a mutation:

mutation CreateStatus($status: String!, $createdAt: DateTime!) {
createXyzStatusphereStatus(
input: { status: $status, createdAt: $createdAt }
) {
uri
status
createdAt
}
}
Quickslice:

Writes to the user's PDS: Creates the record in their personal data repository
Indexes optimistically: The record appears in queries immediately, before Jetstream confirmation
Handles OAuth: Uses the authenticated session to sign the write
Without Quickslice With Quickslice
Get OAuth session/agent Call the mutation:
Construct record with $type
Call putRecord XRPC on the PDS createXyzStatusphereStatus(input: { status: "👍" })
Optimistically update local DB
Handle errors
#Step 5: Authentication
Quickslice bridges AT Protocol OAuth. Your frontend initiates login; Quickslice manages the authorization flow:

User enters their handle (e.g., alice.bsky.social)
Your app redirects to Quickslice's OAuth endpoint
Quickslice redirects to the user's PDS for authorization
User approves the app
PDS redirects back to Quickslice with an auth code
Quickslice exchanges the code for tokens and establishes a session
For authenticated queries and mutations, include auth headers. The exact headers depend on your OAuth flow (DPoP or Bearer token). See the Authentication Guide for details.

#Step 6: Deploying to Railway
Deploy quickly with Railway:

Click the deploy button in the Quickstart Guide
Generate an OAuth signing key with goat key generate -t p256
Paste the key into the OAUTH_SIGNING_KEY environment variable
Generate a domain and redeploy
Create your admin account by logging in
Upload your Lexicons
See Deployment Guide for detailed instructions.

#What Quickslice Handled
Quickslice handled:

Jetstream connection: firehose connection, event filtering, reconnection
Record validation: schema checking against Lexicons
Database schema: tables, migrations, indexes
Query API: filtering, sorting, pagination endpoints
Batching: efficient related-record resolution
Optimistic updates: indexing before Jetstream confirmation
OAuth flow: token exchange, session management, DPoP proofs
Focus on your application logic; Quickslice handles infrastructure.

#Next Steps
Queries Guide: Filtering, sorting, and pagination
Joins Guide: Forward, reverse, and DID joins
Mutations Guide: Creating, updating, and deleting records
Authentication Guide: Setting up OAuth
Deployment Guide: Production configuration
Previous
Introduction
Next
Queries
On this page
What We're Building
Step 1: Project Setup and Importing Lexicons
Step 2: Querying Status Records
Step 3: Joining Profile Data
Other Join Types
Step 4: Writing a Status (Mutations)
Step 5: Authentication
Step 6: Deploying to Railway
What Quickslice Handled
Next Steps

---
