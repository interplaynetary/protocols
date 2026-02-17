OAuth for AT Protocol application developers
This guide is aimed at developers building applications on AT Protocol.

If you're building your own protocol implementation or OAuth Client SDK, the more detailed specification or advanced OAuth client implementation guide may be more appropriate.

What is OAuth?
OAuth is an authorization framework that lets developers request access to an account without requiring users to hand over their password. Without OAuth, if someone wanted to authorize a 3rd party app to access their account, their only option would be to type their username and password into that app. This is bad for all sorts of reasons, the first being that a 3rd party app gets to see, and likely save, passwords. And once an app has a username and password, the app would have full access to their account.

OAuth aims to solve these problems with a family of open specifications for managing secure authorization without requiring a person's username and password. If you've ever used a "Sign in with..." button or link on the web, you've used OAuth.

As a developer, you can request limited access to a person's account, meaning if you only need to post a message to someone's public timeline, you don't also need to request access to read their private messages. This is great for your app because you don't have to worry about managing data you don't need, and it's great for the person using your app because they don't need to worry about their DMs being compromised.

How is OAuth Different in AT Protocol?
ATProto specifies a particular "profile" of the OAuth standards, using OAuth 2.1 as the foundation.

There are a couple of details that might catch you off guard if you're used to using other OAuth systems.

Migration: ATProto users can migrate their accounts between servers (PDSes) over time. To facilitate this ATProto has a flexible Identity layer, which allows usernames (handles) to be resolved to a static user ID (DID), which in turn can be resolved to locate the user's PDS. When a user logs in to an app, the OAuth client dynamically resolves these relationships.

Client IDs: In other OAuth ecosystems, it is often necessary for client apps to pre-register themselves with the resource server. This is not viable in a decentralized system (with many clients and many resource servers), so ATProto addresses this using Client ID Metadata Documents.

We also support the use of "App Passwords". Accounts can create and revoke app passwords separate from their primary password, as a way of providing slightly finer-grained permissions for external apps that have not yet adopted OAuth. OAuth will be the recommended solution for nearly all apps going forward.

OAuth SDKs
The inner workings of OAuth can be fiddly, but the good news is that we’ve done our best to abstract it away via client SDKs, so you can focus on your app.

TypeScript
@atproto/oauth-client-browser (npmjs) - Suitable for frontend-only applications (e.g. SPAs).
@atproto/oauth-client-node (npmjs) - Suitable for Electron desktop apps or server-side deployments.
@atproto/oauth-client-expo (npmjs) - For use in React Native projects (e.g. mobile apps)
@atproto/oauth-client (npmjs) (This is the core implementation on which the above three libraries depend)
Go
Indigo (Online API Docs) - Suitable for native apps or server-side deployments
ATProto OAuth Example Apps
These simple example apps demonstrate usage of their respective SDKs.

Example App Language SDK Architecture Confidential Client? Localhost development client ID?
cookbook/react-native-oauth TypeScript @atproto/oauth-client-expo Mobile App (no backend) No No (requires hosted client metadata)
cookbook/vanillajs-oauth-web-app JavaScript @atproto/oauth-client-browser Web SPA (no backend) No Optionally
cookbook/go-oauth-web-app Go indigo Web BFF Optionally Optionally
cookbook/go-oauth-cli-app Go indigo Native CLI No No (requires hosted client metadata)
cookbook/python-oauth-web-app Python None Web BFF Optionally Optionally
The Python example does not use an SDK! It may be useful as reference when building an OAuth SDK from scratch, alongside the advanced OAuth client implementation guide

Types of App
The simplest type of app is one where the OAuth session is established directly between the user's device and the PDS, as demonstrated in the cookbook/vanillajs-oauth-web-app example. It's simple because it doesn't require a dedicated backend service, only hosting static resources.

If your app doesn't need long-lived sessions, then this approach is completely fine. But for other use cases, session lifetime will be limited because the app is a "public client", as opposed to a "confidential client". Becoming a confidential client involves establishing a secret key, bound to the client ID. If the client is publicly available and runs on the user's own device, it cannot protect a client secret. Thus, implementing a confidential client necessitates hosting some backend infrastructure, which the cookbook/go-oauth-web-app and cookbook/python-oauth-web-app examples demonstrate (both using the "BFF" pattern, see below).

See Types of Clients for more technical details on confidential vs. public clients.

There are several design strategies that can be used to "upgrade" a public client into a confidential client:

Backend For Frontend (BFF): The OAuth session is established between the app backend server and the PDS. This server-side session is associated with the user's frontend session via mechanisms such as session cookies. The frontend makes requests to the PDS by proxying them through the backend, which handles the OAuth authorization.
Token-Mediating Backend (TMB): Similar to the BFF pattern, except the backend passes OAuth access tokens to the frontend once the session has been established, allowing the frontend to make direct requests to the PDS.
Client Assertion Backend: A proposed alternative to the TMB pattern with simplified server-side logic.
Of these three, the BFF pattern is the currently recommended approach for building confidential-client applications. This is demonstrated in the cookbook/go-oauth-web-app and cookbook/python-oauth-web-app examples.

Scopes
The OAuth flow requires permission "scopes" which describe the level of access granted with the session. For now, granular permissions have been implemented on the bsky.social hosting service, and the self-hosted PDS distribution. Work on permission sets (including lexicon resolution) is in progress. Developers may start to implement more granular permissions -- for example, apps only asking for permissions to specific record types or API endpoints. We expect most apps to use the higher-level "permission sets" when they become available, which will provide more accessible language about the permissions being granted.

The minimal set of OAuth permissions that a third-party AT application should request to sign in with Bluesky are:

atproto
If you are making use of Bluesky profile information, you may also need:

rpc:app.bsky.actor.getProfile?aud=did:web:api.bsky.app#bsky_appview
If you need to link any uploaded images or videos to the records (posts) you create, you will also need:

blob:_/_
The ergonomics of OAuth scopes in AT Protocol are still evolving. This minimal set is designed to provide a known-good starting point for app developers that does not grant unnecessary permissions. While we finalize granular permission scopes, we are also supporting a set of temporary coarse-grained scopes called the "transition scopes". There are currently no plans to deprecate either the transition scopes or the use of App Passwords. For an overview of these transition scopes, and more in-depth information on OAuth, see Authorization Scopes. For the granular permission scopes, see Permissions.

Clients
OAuth client software is identified by a globally unique client_id. Distinct variants of client software may have distinct client_id values; for example the browser app and Android (mobile OS) variants of the same software might have different client_id values. The client_id must be a fully-qualified web URL from which the client-metadata JSON document can be fetched. For example, https://app.example.com/oauth-client-metadata.json. Some more about the client_id:

it must be a well-formed URL, following the W3C URL specification
the schema must be https://, and there must not be a port number included. Note that there is a special exception for http://localhost client_id values for development.
the path does not need to include oauth-client-metadata.json, but it is helpful convention.
If you have been using client-metadata.json rather than oauth-client-metadata.json, you can make this change to have your domain display on the auth flow page, rather than a URL string.

The auth flow page will display all the relevent permissions being granted. This is true both for apps using granular permissions, and for those using the transitional OAuth scopes.

Client Apps should be sure to check which auth scopes were actually approved during the auth flow. In particular, when requesting permission to read an account email address (account:email), the user might decline that permission while granting others. In theory, any individual permission might be denied while the overall request is granted.
