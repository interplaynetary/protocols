# ValueFlows AT Protocol Lexicons

This directory contains AT Protocol lexicon definitions for the ValueFlows vocabulary.

## Structure

```
lexicons/vf/
├── agent/
│   ├── person.json                    # Natural person with economic agency
│   └── organization.json              # Organization or group with economic agency
├── observation/
│   ├── defs.json                      # Shared definitions (measure, action)
│   ├── economicEvent.json             # Observed economic flow
│   └── economicResource.json          # Useful resource
├── plan/
│   ├── process.json                   # Transformation activity
│   └── commitment.json                # Planned economic flow promise
├── knowledge/
│   ├── processSpecification.json      # Process type definition
│   └── resourceSpecification.json     # Resource type definition
└── measurement/
    └── unit.json                      # Unit of measurement
```

## Key Design Decisions

### 1. No Floating Point Numbers

AT Protocol data model disallows floats. We use **scaled integers** for decimal values:

```json
{
  "hasNumericalValue": 12500, // Represents 125.00
  "scale": 2 // Divide by 10^2 = 100
}
```

### 2. Reference Types

- **Agents**: Referenced by DID (`format: "did"`)
- **Records**: Referenced by AT URI (`format: "at-uri"`)
- **External Resources**: Referenced by generic URI (`format: "uri"`)

### 3. Shared Definitions

Common types like `measure` and `action` are defined in `vf.observation.defs` and referenced via:

```json
{
  "type": "ref",
  "ref": "vf.observation.defs#measure"
}
```

### 4. Temporal Fields

All datetime fields use ISO 8601 format (`format: "datetime"`):

- `hasBeginning` / `hasEnd`: Time ranges
- `hasPointInTime`: Single point in time
- `due`: Expected completion time

## Usage with Quickslice

Import lexicons into Quickslice:

```bash
quickslice lexicon import lexicons/vf/agent/person.json
quickslice lexicon import lexicons/vf/observation/economicEvent.json
# ... etc
```

Quickslice will auto-generate GraphQL schema with:

- DID joins: `vfAgentPersonByProvider`
- URI joins: `vfPlanProcessByInputOf`
- Reverse joins: `vfObservationEconomicEventsByInputOf`

## Validation

All lexicons follow AT Protocol specifications:

- Lexicon version: 1
- Record key type: `tid` (Timestamp Identifier)
- String constraints: `maxLength`, `maxGraphemes`
- Required fields marked explicitly

## Next Steps

1. Deploy Quickslice instance
2. Import all lexicons
3. Verify GraphQL schema generation
4. Test DID/URI joins with sample data
