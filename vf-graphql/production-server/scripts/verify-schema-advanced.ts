
import { buildSchema } from '@valueflows/vf-graphql'
import { resolvers } from '../src/graphql/resolvers'
import * as dbSchema from '../src/db/schema'
import { 
  GraphQLObjectType, 
  GraphQLScalarType, 
  GraphQLInterfaceType, 
  GraphQLUnionType, 
  GraphQLInputObjectType,
  GraphQLNonNull, 
  GraphQLList,
  GraphQLType,
  GraphQLField
} from 'graphql'
import fs from 'fs'
import path from 'path'

console.log('🚀 Starting Advanced Schema Verification (Type Safety & Logic)...')

// 1. Load Schema & DB
console.log('📦 Loading ValueFlows Schema...')
const schema = buildSchema()
const typeMap = schema.getTypeMap()

// 2. Mapping Config
const graphQLTypeToDBTable: Record<string, any> = {
  'Action': dbSchema.actions,
  'Agent': dbSchema.agents, 
  'Person': dbSchema.agents, // Mapped to same table
  'Organization': dbSchema.agents, 
  'Agreement': dbSchema.agreements,
  'Appreciation': dbSchema.appreciations,
  'Claim': dbSchema.claims,
  'Commitment': dbSchema.commitments,
  'EconomicEvent': dbSchema.economicEvents,
  'EconomicResource': dbSchema.economicResources,
  'Fulfillment': dbSchema.fulfillments,
  'Intent': dbSchema.intents,
  'Plan': dbSchema.plans,
  'Process': dbSchema.processes,
  'ProcessSpecification': dbSchema.processSpecifications,
  'ProductBatch': dbSchema.productBatches,
  'Proposal': dbSchema.proposals,
  'ProposedIntent': dbSchema.proposedIntents,
  'RecipeExchange': dbSchema.recipeExchanges,
  'RecipeFlow': dbSchema.recipeFlows,
  'RecipeProcess': dbSchema.recipeProcesses,
  'ResourceSpecification': dbSchema.resourceSpecifications,
  'Satisfaction': dbSchema.satisfactions,
  'Scenario': dbSchema.scenarios,
  'ScenarioDefinition': dbSchema.scenarioDefinitions,
  'Settlement': dbSchema.settlements,
  'SpatialThing': dbSchema.spatialThings,
  'Unit': dbSchema.units,
}

// 3. Type Compatibility Rules
// GraphQL Scalar/Type -> Compatible Drizzle Column Types
const typeCompatibilityReqs: Record<string, string[]> = {
    'ID': ['PgUUID', 'PgText'], 
    'String': ['PgText', 'PgVarchar', 'PgUUID', 'PgEnumColumn'], // ID often represented as String in GQL
    'URI': ['PgText', 'PgVarchar'],
    'DateTime': ['PgTimestamp'],
    'Int': ['PgInteger', 'PgSerial'],
    'Float': ['PgNumeric', 'PgReal', 'PgDoublePrecision'],
    'Boolean': ['PgBoolean'],
    'Decimal': ['PgNumeric', 'PgDecimal'],
    'JSON': ['PgJsonb', 'PgJson'],
}

const issues: string[] = []

// Helper to unwrap GraphQL types safely without instanceof
function getBaseType(type: any): any {
  if (type.constructor.name === 'GraphQLNonNull') return getBaseType(type.ofType);
  if (type.constructor.name === 'GraphQLList') return getBaseType(type.ofType);
  return type;
}

function getBaseTypeName(type: any): string {
    const base = getBaseType(type);
    return base.name;
}

// 4. Verification Logic

console.log('🔍 validating Output Types & Column Compatibility...')

for (const typeName in typeMap) {
  if (typeName.startsWith('__')) continue
  const type = typeMap[typeName]

  if (type.constructor.name === 'GraphQLObjectType') {
     if (['Query', 'Mutation', 'Subscription'].includes(typeName)) continue;
     // Skip Relay connections
     if (typeName.endsWith('Connection') || typeName.endsWith('Edge') || typeName === 'PageInfo') continue;

     const dbTable = graphQLTypeToDBTable[typeName];
     if (!dbTable) {
         continue;
     }

     const fields = (type as any).getFields();
     for (const fieldName in fields) {
         const field = fields[fieldName];
         const explicitResolver = (resolvers as any)[typeName]?.[fieldName];
         
         let dbColumn: any = null;
         
         if (dbTable[fieldName]) dbColumn = dbTable[fieldName];
         
         if (dbColumn) {
             // If explicit resolver exists, we assume custom logic handles type conversion
             if (explicitResolver) continue;

             // Verify Type Compatibility
             const gqlTypeName = getBaseTypeName(field.type);
             const baseType = getBaseType(field.type);
             const validDbTypes = typeCompatibilityReqs[gqlTypeName];
             
             // Check if Object/Interface Type (Relation)
             if (baseType.constructor.name === 'GraphQLObjectType' || baseType.constructor.name === 'GraphQLInterfaceType') {
                 // Expect DB column to be UUID or Text (FK)
                 if (dbColumn.columnType !== 'PgUUID' && dbColumn.columnType !== 'PgText') {
                    // Logic check?
                 }
             } else if (validDbTypes) {
                 // It's a scalar/leaf
                 if (!validDbTypes.includes(dbColumn.columnType)) {
                     if (gqlTypeName === 'String' && dbColumn.columnType === 'PgEnumColumn') continue; // Enums are strings
                     
                     issues.push(`❌ TYPE MISMATCH: ${typeName}.${fieldName} (GQL: ${gqlTypeName}) vs DB Column ${fieldName} (DB: ${dbColumn.columnType})`)
                 }
             }
         }
     }
  }
}

// 5. Input Type Verification
console.log('🔍 Validating Input Types...')
for (const typeName in typeMap) {
    if (typeMap[typeName].constructor.name !== 'GraphQLInputObjectType') continue;
    if (typeName.startsWith('__')) continue;
    
    // Check if names match a DB model, e.g. `EconomicEventCreateInput`
    let modelName = typeName.replace(/CreateInput$/, '').replace(/UpdateInput$/, '').replace(/Input$/, '');
    
    if (modelName === 'Measurement') continue; 
    
    const dbTable = graphQLTypeToDBTable[modelName];
    if (!dbTable) continue;
    
    const inputType = typeMap[typeName] as any;
    const fields = inputType.getFields();
    
    for (const fieldName in fields) {
        const field = fields[fieldName];
        const dbColumn = dbTable[fieldName];
        
        if (dbColumn) {
            // Check Nullability
            // GQL Input: `name: String!` (Non-Null) -> field.type is GraphQLNonNull
            // DB: `name: text().notNull()`
            
            const isGqlNonNull = field.type.constructor.name === 'GraphQLNonNull';
            const isDbNotNull = dbColumn.notNull;
            const hasDefault = dbColumn.hasDefault;
            
            if (!isGqlNonNull && isDbNotNull && !hasDefault) {
                if (fieldName !== 'id' && fieldName !== 'revisionId' && fieldName !== 'createdAt' && fieldName !== 'updatedAt') {
                   issues.push(`⚠️  NULLABILITY RISK: ${typeName}.${fieldName} is nullable in GQL Input but NOT NULL in DB (and no default)`)
                }
            }
        }
    }
}

// 6. Missing Field Detection (Data Exposure Audit)
console.log('🔍 Auditing Missing Fields (DB -> GQL)...')
const IGNORED_DB_FIELDS = ['created_at', 'updated_at', 'revision_id', 'password', 'hash', 'salt']; 

for (const gqlTypeName in graphQLTypeToDBTable) {
    const dbTable = graphQLTypeToDBTable[gqlTypeName];
    const gqlType = typeMap[gqlTypeName];
    
    if (!gqlType || gqlType.constructor.name !== 'GraphQLObjectType') continue;
    
    const gqlFields = gqlType.getFields();
    
    // Drizzle table columns are usually in (dbTable as any)[key] or via getTableColumns if using introspection
    // But since we imported the table object directly, we can iterate its keys if it's a standard Drizzle table definition
    // Drizzle table objects usually have column definitions as keys.
    
    for (const key in dbTable) {
        // Drizzle columns usually have properties like 'name', 'notNull', 'primary'
        // We filter for objects that look like columns
        const col = dbTable[key];
        if (col && typeof col === 'object' && 'name' in col && 'columnType' in col) {
             const dbColName = col.name; // e.g. "created_at"
             // convert snake_case to camelCase for GQL check
             const camelName = key; // Drizzle export object usually uses camelCase keys: e.g. { createdAt: ... }
             
             if (IGNORED_DB_FIELDS.includes(dbColName)) continue;
             if (key === 'id') continue; // ID is verified elsewhere/standard
             
             // Check if GQL has this field
             if (!gqlFields[camelName]) {
                 // Check if it's a relationship field in GQL (might have different name)
                 // e.g. DB `author_id` -> GQL `author`
                 // Naive check: if 'camelName' ends with 'Id', check for stripped version
                 let isRel = false;
                 if (camelName.endsWith('Id')) {
                     const relName = camelName.slice(0, -2);
                     if (gqlFields[relName]) isRel = true;
                 }
                 
                 if (!isRel) {
                      issues.push(`❌ MISSING EXPOSURE: DB Column '${gqlTypeName}.${camelName}' (${dbColName}) is NOT exposed in GraphQL. Intentional?`)
                 }
             }
        }
    }
}

// 7. Connection & Edge Verification
console.log('🔍 Verifying Relay Edges...')
for (const typeName in typeMap) {
    if (typeName.endsWith('Edge') && typeMap[typeName].constructor.name === 'GraphQLObjectType') {
        const edgeType = typeMap[typeName] as GraphQLObjectType;
        const fields = edgeType.getFields();
        const fieldNames = Object.keys(fields);
        
        // Standard keys: node, cursor
        const customFields = fieldNames.filter(f => f !== 'node' && f !== 'cursor');
        
        if (customFields.length > 0) {
            // Check if these custom fields have resolvers or mapping
             issues.push(`⚠️  CUSTOM EDGE FIELDS: ${typeName} has custom fields [${customFields.join(', ')}]. Verify resolvers exist.`)
        }
    }
}

// Reporting
console.log('\n--- 🛡️ Advanced Verification Report ---')
if (issues.length === 0) {
    console.log('✨ Clean! No type, nullability, logic, or edge flags detected.')
    process.exit(0)
} else {
    issues.forEach(i => console.log(i))
    console.log(`\nFound ${issues.length} potential issues.`)
    process.exit(0) 
}
