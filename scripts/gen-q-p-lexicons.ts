// Generates properly structured query + procedure lexicons for all VF record types.
// Usage: bun generate-lexicons.ts
//
// This reads all existing record lexicons and generates matching query/procedure
// lexicons with proper AT Proto parameters, input, and output schemas.

import { Glob } from "bun";
import path from "path";

// Map of record NSID -> { query NSID, procedure NSID, description, plural name }
interface RecordMeta {
  queryId: string;
  procedureId: string;
  queryDesc: string;
  procedureDesc: string;
}

const recordMeta: Record<string, RecordMeta> = {
  "vf.agent.person": {
    queryId: "vf.agent.persons",
    procedureId: "vf.agent.createPerson",
    queryDesc: "List persons.",
    procedureDesc: "Create or update a person.",
  },
  "vf.agent.organization": {
    queryId: "vf.agent.organizations",
    procedureId: "vf.agent.createOrganization",
    queryDesc: "List organizations.",
    procedureDesc: "Create or update an organization.",
  },
  "vf.agent.ecologicalAgent": {
    queryId: "vf.agent.ecologicalAgents",
    procedureId: "vf.agent.createEcologicalAgent",
    queryDesc: "List ecological agents.",
    procedureDesc: "Create or update an ecological agent.",
  },
  "vf.agreement.agreement": {
    queryId: "vf.agreement.agreements",
    procedureId: "vf.agreement.createAgreement",
    queryDesc: "List agreements.",
    procedureDesc: "Create or update an agreement.",
  },
  "vf.agreement.agreementBundle": {
    queryId: "vf.agreement.agreementBundles",
    procedureId: "vf.agreement.createAgreementBundle",
    queryDesc: "List agreement bundles.",
    procedureDesc: "Create or update an agreement bundle.",
  },
  "vf.geo.spatialThing": {
    queryId: "vf.geo.spatialThings",
    procedureId: "vf.geo.createSpatialThing",
    queryDesc: "List spatial things (locations).",
    procedureDesc: "Create or update a spatial thing (location).",
  },
  "vf.knowledge.action": {
    queryId: "vf.knowledge.actions",
    procedureId: "vf.knowledge.createAction",
    queryDesc: "List actions.",
    procedureDesc: "Create or update an action.",
  },
  "vf.knowledge.processSpecification": {
    queryId: "vf.knowledge.processSpecifications",
    procedureId: "vf.knowledge.createProcessSpecification",
    queryDesc: "List process specifications.",
    procedureDesc: "Create or update a process specification.",
  },
  "vf.knowledge.resourceSpecification": {
    queryId: "vf.knowledge.resourceSpecifications",
    procedureId: "vf.knowledge.createResourceSpecification",
    queryDesc: "List resource specifications.",
    procedureDesc: "Create or update a resource specification.",
  },
  "vf.knowledge.unit": {
    queryId: "vf.knowledge.units",
    procedureId: "vf.knowledge.createUnit",
    queryDesc: "List units of measure.",
    procedureDesc: "Create or update a unit of measure.",
  },
  "vf.observation.economicEvent": {
    queryId: "vf.observation.economicEvents",
    procedureId: "vf.observation.createEconomicEvent",
    queryDesc: "List economic events.",
    procedureDesc: "Create or update an economic event.",
  },
  "vf.observation.economicResource": {
    queryId: "vf.observation.economicResources",
    procedureId: "vf.observation.createEconomicResource",
    queryDesc: "List economic resources.",
    procedureDesc: "Create or update an economic resource.",
  },
  "vf.planning.claim": {
    queryId: "vf.planning.claims",
    procedureId: "vf.planning.createClaim",
    queryDesc: "List claims.",
    procedureDesc: "Create or update a claim.",
  },
  "vf.planning.commitment": {
    queryId: "vf.planning.commitments",
    procedureId: "vf.planning.createCommitment",
    queryDesc: "List commitments.",
    procedureDesc: "Create or update a commitment.",
  },
  "vf.planning.intent": {
    queryId: "vf.planning.intents",
    procedureId: "vf.planning.createIntent",
    queryDesc: "List intents.",
    procedureDesc: "Create or update an intent.",
  },
  "vf.planning.plan": {
    queryId: "vf.planning.plans",
    procedureId: "vf.planning.createPlan",
    queryDesc: "List plans.",
    procedureDesc: "Create or update a plan.",
  },
  "vf.planning.process": {
    queryId: "vf.planning.processes",
    procedureId: "vf.planning.createProcess",
    queryDesc: "List processes.",
    procedureDesc: "Create or update a process.",
  },
  "vf.proposal.proposal": {
    queryId: "vf.proposal.proposals",
    procedureId: "vf.proposal.createProposal",
    queryDesc: "List proposals.",
    procedureDesc: "Create or update a proposal.",
  },
  "vf.proposal.proposalList": {
    queryId: "vf.proposal.proposalLists",
    procedureId: "vf.proposal.createProposalList",
    queryDesc: "List proposal lists.",
    procedureDesc: "Create or update a proposal list.",
  },
  "vf.recipe.recipe": {
    queryId: "vf.recipe.recipes",
    procedureId: "vf.recipe.createRecipe",
    queryDesc: "List recipes.",
    procedureDesc: "Create or update a recipe.",
  },
  "vf.recipe.recipeExchange": {
    queryId: "vf.recipe.recipeExchanges",
    procedureId: "vf.recipe.createRecipeExchange",
    queryDesc: "List recipe exchanges.",
    procedureDesc: "Create or update a recipe exchange.",
  },
  "vf.recipe.recipeFlow": {
    queryId: "vf.recipe.recipeFlows",
    procedureId: "vf.recipe.createRecipeFlow",
    queryDesc: "List recipe flows.",
    procedureDesc: "Create or update a recipe flow.",
  },
  "vf.recipe.recipeProcess": {
    queryId: "vf.recipe.recipeProcesses",
    procedureId: "vf.recipe.createRecipeProcess",
    queryDesc: "List recipe processes.",
    procedureDesc: "Create or update a recipe process.",
  },
  "vf.resource.batchLotRecord": {
    queryId: "vf.resource.batchLotRecords",
    procedureId: "vf.resource.createBatchLotRecord",
    queryDesc: "List batch/lot records.",
    procedureDesc: "Create or update a batch/lot record.",
  },
};

// Read all record lexicons to extract their schemas
const recordSchemas: Record<string, any> = {};
const glob = new Glob("lexicons/vf/**/*.json");
for await (const filePath of glob.scan(".")) {
  const content = await Bun.file(filePath).json();
  const id = content.id as string;
  const type = content.defs?.main?.type;
  if (type === "record") {
    recordSchemas[id] = content;
  }
}

function nsidToPath(nsid: string): string {
  // vf.agent.persons -> lexicons/vf/agent/persons.json
  const parts = nsid.split(".");
  return path.join("lexicons", ...parts) + ".json";
}

// Build the record's properties schema for use in procedure input.
// Extracts the record.properties from the record lexicon and builds
// an object schema suitable for the procedure input.
function buildInputSchema(recordNsid: string): any {
  const record = recordSchemas[recordNsid];
  if (!record) return undefined;

  const recordDef = record.defs.main.record;
  // Clone the object schema from the record definition
  const schema: any = {
    type: "object",
    properties: { ...recordDef.properties },
  };
  if (recordDef.required) {
    schema.required = [...recordDef.required];
  }

  // Add optional `uri` field for update operations (HappyView auto-detects create vs update)
  schema.properties.uri = {
    type: "string",
    format: "at-uri",
    description:
      "If provided, updates the existing record at this AT URI instead of creating a new one.",
  };

  return schema;
}

// Build the output schema for a list query
function buildListOutputSchema(recordNsid: string): any {
  const record = recordSchemas[recordNsid];
  if (!record) {
    return {
      type: "object",
      properties: {
        records: { type: "array", items: { type: "unknown" } },
        cursor: { type: "string" },
      },
    };
  }

  const recordDef = record.defs.main.record;
  // Each record in the response includes uri + the record fields
  const recordView: any = {
    type: "object",
    required: ["uri"],
    properties: {
      uri: {
        type: "string",
        format: "at-uri",
        description: "The AT URI of this record.",
      },
      ...recordDef.properties,
    },
  };

  return {
    type: "object",
    properties: {
      records: {
        type: "array",
        items: recordView,
      },
      cursor: {
        type: "string",
        description: "Pagination cursor. Present when more records are available.",
      },
    },
  };
}

let written = 0;

for (const [recordNsid, meta] of Object.entries(recordMeta)) {
  // --- Query lexicon ---
  const queryLexicon = {
    lexicon: 1,
    id: meta.queryId,
    defs: {
      main: {
        type: "query",
        description: meta.queryDesc,
        parameters: {
          type: "params",
          properties: {
            uri: {
              type: "string",
              format: "at-uri",
              description:
                "Fetch a single record by its AT URI. When provided, other parameters are ignored.",
            },
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 20,
              description: "Maximum number of records to return.",
            },
            cursor: {
              type: "string",
              description: "Pagination cursor from a previous response.",
            },
            did: {
              type: "string",
              format: "did",
              description: "Filter records by author DID.",
            },
          },
        },
        output: {
          encoding: "application/json",
          schema: buildListOutputSchema(recordNsid),
        },
      },
    },
  };

  const queryPath = nsidToPath(meta.queryId);
  await Bun.write(queryPath, JSON.stringify(queryLexicon, null, 2) + "\n");
  console.log(`  wrote ${queryPath}`);
  written++;

  // --- Procedure lexicon ---
  const inputSchema = buildInputSchema(recordNsid);
  const procedureLexicon: any = {
    lexicon: 1,
    id: meta.procedureId,
    defs: {
      main: {
        type: "procedure",
        description: meta.procedureDesc,
        input: {
          encoding: "application/json",
          ...(inputSchema ? { schema: inputSchema } : {}),
        },
        output: {
          encoding: "application/json",
          description: "The response from the user's PDS after creating or updating the record.",
        },
      },
    },
  };

  const procPath = nsidToPath(meta.procedureId);
  await Bun.write(procPath, JSON.stringify(procedureLexicon, null, 2) + "\n");
  console.log(`  wrote ${procPath}`);
  written++;
}

console.log(`\nGenerated ${written} lexicon files.`);
