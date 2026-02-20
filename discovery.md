target_collection

shows up even in the server side1


## The `target_collection` field

Query and procedure lexicons need to know which record collection they operate on. Set `target_collection` to the NSID of the record lexicon:

```sh
curl -X POST http://localhost:3000/admin/lexicons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lexicon_json": {
      "lexicon": 1,
      "id": "games.gamesgamesgamesgames.listGames",
      "defs": {
        "main": {
          "type": "query",
          "parameters": {
            "type": "params",
            "properties": {
              "limit": { "type": "integer" }
            }
          },
          "output": { "encoding": "application/json" }
        }
      }
    },
    "target_collection": "games.gamesgamesgamesgames.game"
  }'
```


-----

So i added the target collections! No more error 400

now we face a different error:

GET https://happyview-production.up.railway.app/xrpc/app.bsky.actor.getProfile 401 (Unauthorized)
window.fetch @ fetcher.js?v=9a3e432a:66
ensureAgent @ +layout.svelte:31
await in ensureAgent
$effect @ +layout.svelte:18
update_reaction @ chunk-LX7SKULT.js?v=9a3e432a:3418
update_effect @ chunk-LX7SKULT.js?v=9a3e432a:3557
flush_queued_effects @ chunk-LX7SKULT.js?v=9a3e432a:2547
process @ chunk-LX7SKULT.js?v=9a3e432a:2216
flush_effects @ chunk-LX7SKULT.js?v=9a3e432a:2505
flush @ chunk-LX7SKULT.js?v=9a3e432a:2308
(anonymous) @ chunk-LX7SKULT.js?v=9a3e432a:2429
run_all @ chunk-LX7SKULT.js?v=9a3e432a:43
run_micro_tasks @ chunk-LX7SKULT.js?v=9a3e432a:673
flush_tasks @ chunk-LX7SKULT.js?v=9a3e432a:686
flushSync @ chunk-LX7SKULT.js?v=9a3e432a:2460
Svelte4Component @ chunk-NAWC2KUW.js?v=9a3e432a:849
(anonymous) @ chunk-NAWC2KUW.js?v=9a3e432a:799
initialize @ client.js?v=9a3e432a:587
_hydrate @ client.js?v=9a3e432a:2859
await in _hydrate
start @ client.js?v=9a3e432a:361
await in start
(anonymous) @ (index):36
Promise.then
(anonymous) @ (index):35Understand this error
xrpc.svelte.ts:36  POST https://happyview-production.up.railway.app/xrpc/org.openassociation.createAgent 401 (Unauthorized)


Summary of HTTP Status Codes
200 OK: The request was successful. If there is a response body (optional), there should be a Content-Type header.

400 Bad Request: Request was invalid, and was not processed

401 Unauthorized: Authentication is required for this endpoint. There should be a WWW-Authenticate header.

403 Forbidden: The client lacks permission for this endpoint

404 Not Found: Can indicate a missing resource. This can also indicate that the server does not support atproto, or does not support this endpoint. See response error message (or lack thereof) to clairfy.

413 Payload Too Large: Request body was too large. If possible, split in to multiple smaller requests.

429 Too Many Requests: A resource limit has been exceeded, client should back off. There may be a Retry-After header indicating a specific back-off time period.

500 Internal Server Error: Generic internal service error. Client may retry after a delay.

501 Not Implemented: The specified endpoint is known, but not implemented. Client should not retry. In particular, returned when WebSockets are requested by not implemented by server.

502 Bad Gateway, 503 Service Unavailable, or 504 Gateway Timeout: These all usually indicate temporary or permanent service downtime. Clients may retry after a delay.

Usage and Implementation Guidelines
Clients are encouraged to implement timeouts, limited retries, and randomized exponential backoff. This increases robustness in the inevitable case of sporadic downtime, while minimizing load on struggling servers.

Servers should implement custom JSON error responses for all requests with an /xrpc/ path prefix, but realistically, many services will return generic load-balancer or reverse-proxy HTML error pages. Clients should be robust to non-JSON error responses.

HTTP servers and client libraries usually limit the overall size of URLs, including query parameters, and these limits constrain the use of parameters in XRPC.

PDS implementations are free to restrict blob uploads as they see fit. For example, they may have a global maximum size or restricted set of allowed MIME types. These should be a superset of blob constraints for all supported Lexicons.

Security and Privacy Considerations
Only HTTPS should be used over the open internet.

Care should be taken with personally identifiable information in blobs, such as EXIF metadata. It is currently the client's responsibility to strip any sensitive EXIF metadata from blobs before uploading. It would be reasonable for a PDS to help prevent accidental metadata leakage as well; see future changes section below.

Possible Future Changes
The auth system is likely to be entirely overhauled.

Lexicons should be able to indicate whether auth is required.

The role of the PDS as a generic gateway may be formalized and extended. A generic mechanism for proxying specific XRPC endpoints on to other network services may be added. Generic caching of queries and blobs may be specified. Mutation of third-party responses by the PDS might be explicitly allowed.

An explicit decision about whether HTTP redirects are supported.

Cursor pagination behavior should be clarified when a cursor is returned but the result list is empty, and when a cursor value is repeated.

To help prevent accidental publishing of sensitive metadata embedded in media blobs, a query parameter may be added to the upload blob endpoint to opt-out of metadata stripping, and default to either blocking upload or auto-striping such metadata for all blobs.

The lxm JWT field for inter-service auth may become required.
