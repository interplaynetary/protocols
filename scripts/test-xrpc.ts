// Usage:
//   bun test-xrpc.ts                - run all read-only checks
//   bun test-xrpc.ts health         - health check
//   bun test-xrpc.ts stats          - record counts
//   bun test-xrpc.ts lexicons       - list registered lexicons
//   bun test-xrpc.ts backfill       - backfill job status
//   bun test-xrpc.ts list [nsid]    - list records via a query endpoint
//   bun test-xrpc.ts create         - create a test unit record
//   bun test-xrpc.ts list-all       - hit every query endpoint
//
// Set env vars:
//   HAPPYVIEW_URL=https://happyview-production.up.railway.app
//   AIP_URL=https://aip-production-0438.up.railway.app
//   AIP_TOKEN=<your DPoP access token>
//   DPOP_JWK='{"crv":"P-256","d":"...","kty":"EC","x":"...","y":"..."}'

import { SignJWT, importJWK } from "jose";
import { createHash, randomUUID } from "crypto";

const BASE_URL =
  process.env.HAPPYVIEW_URL || "https://happyview-production.up.railway.app";
const AIP_URL =
  process.env.AIP_URL || "https://aip-production-0438.up.railway.app";
const TOKEN = process.env.AIP_TOKEN || "";
const DPOP_JWK_STR = process.env.DPOP_JWK || "";
const YOUR_DID = "did:plc:jakdfmodsnsb2bmfw2l3cuwd";

// DPoP setup (only if credentials provided)
let privateKey: CryptoKey | null = null;
let publicJwk: { kty: "EC"; crv: "P-256"; x: string; y: string } | null = null;
let currentNonce: string | undefined;

if (TOKEN && DPOP_JWK_STR) {
  const dpopJwk = JSON.parse(DPOP_JWK_STR);
  privateKey = (await importJWK(
    { ...dpopJwk, kty: "EC", crv: "P-256" },
    "ES256"
  )) as CryptoKey;
  publicJwk = { kty: "EC", crv: "P-256", x: dpopJwk.x, y: dpopJwk.y };
}

async function generateDpopProof(): Promise<string> {
  const ath = createHash("sha256").update(TOKEN).digest("base64url");
  return new SignJWT({
    htm: "GET",
    htu: `${AIP_URL}/oauth/userinfo`,
    ath,
    ...(currentNonce ? { nonce: currentNonce } : {}),
  })
    .setProtectedHeader({ typ: "dpop+jwt", alg: "ES256", jwk: publicJwk! })
    .setJti(randomUUID())
    .setIssuedAt()
    .sign(privateKey!);
}

async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!privateKey) {
    return fetch(url, options);
  }

  let dpopProof = await generateDpopProof();
  let res = await fetch(url, {
    ...options,
    headers: {
      ...((options.headers as Record<string, string>) || {}),
      Authorization: `DPoP ${TOKEN}`,
      DPoP: dpopProof,
    },
  });

  if (res.status === 401) {
    const body = await res.text();
    try {
      const parsed = JSON.parse(body);
      if (parsed.dpop_nonce) {
        currentNonce = parsed.dpop_nonce;
        dpopProof = await generateDpopProof();
        res = await fetch(url, {
          ...options,
          headers: {
            ...((options.headers as Record<string, string>) || {}),
            Authorization: `DPoP ${TOKEN}`,
            DPoP: dpopProof,
          },
        });
      }
    } catch {}
  }

  const newNonce = res.headers.get("dpop-nonce");
  if (newNonce) currentNonce = newNonce;
  return res;
}

// All query NSIDs
const queryEndpoints = [
  "vf.agent.persons",
  "vf.agent.organizations",
  "vf.agent.ecologicalAgents",
  "vf.agreement.agreements",
  "vf.agreement.agreementBundles",
  "vf.geo.spatialThings",
  "vf.knowledge.actions",
  "vf.knowledge.processSpecifications",
  "vf.knowledge.resourceSpecifications",
  "vf.knowledge.units",
  "vf.observation.economicEvents",
  "vf.observation.economicResources",
  "vf.planning.claims",
  "vf.planning.commitments",
  "vf.planning.intents",
  "vf.planning.plans",
  "vf.planning.processes",
  "vf.proposal.proposals",
  "vf.proposal.proposalLists",
  "vf.recipe.recipes",
  "vf.recipe.recipeExchanges",
  "vf.recipe.recipeFlows",
  "vf.recipe.recipeProcesses",
  "vf.resource.batchLotRecords",
];

// --- Admin endpoints ---

async function health() {
  console.log("\n--- Health Check ---");
  const res = await fetch(`${BASE_URL}/health`);
  console.log(`Status: ${res.status} — ${await res.text()}`);
}

async function stats() {
  console.log("\n--- Record Counts ---");
  const res = await authFetch(`${BASE_URL}/admin/stats`);
  if (!res.ok) return console.log(`Error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  console.log(`Total records: ${data.total_records}`);
  for (const c of data.collections ?? []) {
    console.log(`  ${c.collection}: ${c.count}`);
  }
}

async function backfillStatus() {
  console.log("\n--- Backfill Jobs ---");
  const res = await authFetch(`${BASE_URL}/admin/backfill/status`);
  if (!res.ok) return console.log(`Error: ${res.status} ${await res.text()}`);
  const jobs = await res.json();
  if (jobs.length === 0) return console.log("No backfill jobs");
  for (const j of jobs) {
    console.log(
      `  [${j.status}] ${j.collection ?? "all"} — ${j.processed_repos}/${j.total_repos} repos, ${j.total_records} records`
    );
  }
}

async function listLexicons() {
  console.log("\n--- Registered Lexicons ---");
  const res = await authFetch(`${BASE_URL}/admin/lexicons`);
  if (!res.ok) return console.log(`Error: ${res.status} ${await res.text()}`);
  const lexicons = await res.json();
  const records = lexicons.filter((l: any) => l.lexicon_type === "record");
  const queries = lexicons.filter((l: any) => l.lexicon_type === "query");
  const procedures = lexicons.filter(
    (l: any) => l.lexicon_type === "procedure"
  );

  console.log(`\nRecords (${records.length}):`);
  for (const l of records) console.log(`  ${l.id}`);

  console.log(`\nQueries (${queries.length}):`);
  for (const l of queries) console.log(`  GET /xrpc/${l.id}`);

  console.log(`\nProcedures (${procedures.length}):`);
  for (const l of procedures) console.log(`  POST /xrpc/${l.id}`);
}

// --- XRPC query endpoints ---

async function listRecords(nsid: string, limit = 5) {
  console.log(`\n--- GET /xrpc/${nsid}?limit=${limit} ---`);
  const res = await fetch(`${BASE_URL}/xrpc/${nsid}?limit=${limit}`);
  console.log(`Status: ${res.status}`);
  if (!res.ok) return console.log(await res.text());
  const data = await res.json();
  const count = data.records?.length ?? 0;
  console.log(`${count} record(s) returned`);
  if (count > 0) console.log(JSON.stringify(data.records[0], null, 2));
  if (data.cursor) console.log(`cursor: ${data.cursor} (more available)`);
}

async function listMyRecords(nsid: string, limit = 5) {
  console.log(`\n--- GET /xrpc/${nsid}?did=${YOUR_DID}&limit=${limit} ---`);
  const res = await fetch(
    `${BASE_URL}/xrpc/${nsid}?limit=${limit}&did=${YOUR_DID}`
  );
  console.log(`Status: ${res.status}`);
  if (!res.ok) return console.log(await res.text());
  console.log(JSON.stringify(await res.json(), null, 2));
}

async function listAll() {
  console.log("\n=== Querying all endpoints ===");
  for (const nsid of queryEndpoints) {
    const res = await fetch(`${BASE_URL}/xrpc/${nsid}?limit=1`);
    const status = res.status;
    if (res.ok) {
      const data = await res.json();
      const count = data.records?.length ?? 0;
      const cursor = data.cursor ? " (more)" : "";
      console.log(`  ${nsid}: ${status} — ${count} record(s)${cursor}`);
    } else {
      console.log(`  ${nsid}: ${status} — ${await res.text()}`);
    }
  }
}

// --- XRPC procedure endpoints ---

async function createUnit() {
  const nsid = "vf.knowledge.createUnit";
  console.log(`\n--- POST /xrpc/${nsid} ---`);
  if (!privateKey) return console.log("Set AIP_TOKEN and DPOP_JWK env vars");

  const res = await authFetch(`${BASE_URL}/xrpc/${nsid}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label: "kilogram", symbol: "kg" }),
  });
  console.log(`Status: ${res.status}`);
  console.log(JSON.stringify(await res.json(), null, 2));
}

async function createAction() {
  const nsid = "vf.knowledge.createAction";
  console.log(`\n--- POST /xrpc/${nsid} ---`);
  if (!privateKey) return console.log("Set AIP_TOKEN and DPOP_JWK env vars");

  const res = await authFetch(`${BASE_URL}/xrpc/${nsid}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      actionId: "produce",
      label: "Produce",
      inputOutput: "output",
    }),
  });
  console.log(`Status: ${res.status}`);
  console.log(JSON.stringify(await res.json(), null, 2));
}

// --- Run ---

const command = process.argv[2] || "all";
const arg = process.argv[3];

switch (command) {
  case "health":
    await health();
    break;
  case "stats":
    await stats();
    break;
  case "backfill":
    await backfillStatus();
    break;
  case "lexicons":
    await listLexicons();
    break;
  case "list":
    await listRecords(arg || "vf.knowledge.units");
    break;
  case "mine":
    await listMyRecords(arg || "vf.knowledge.units");
    break;
  case "list-all":
    await listAll();
    break;
  case "create":
    await createUnit();
    break;
  case "create-action":
    await createAction();
    break;
  case "all":
  default:
    await health();
    await stats();
    await listLexicons();
    await backfillStatus();
    break;
}
