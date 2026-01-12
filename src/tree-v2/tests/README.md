# Tree V2 Tests

Comprehensive test suite for the tree-v2 module using Vitest.

## Test Coverage

### Schemas (2 test files)
- ✅ `primitives.test.ts` - Tests for all primitive types
- ✅ `nodes.test.ts` - Tests for all node types and discriminated union

### Tree Operations (3 test files)
- ✅ `mutation.test.ts` - Node/reference CRUD operations
- ✅ `navigation.test.ts` - Tree navigation and traversal
- ✅ `validation.test.ts` - Structure validation and integrity

### Computation (1 test file)
- ✅ `weights.test.ts` - Weight and share calculation

### Serialization (1 test file)
- ✅ `json.test.ts` - JSON serialization/deserialization

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test src/tree-v2/tests/tree/mutation.test.ts
```

## Test Statistics

- **Total Test Files**: 7
- **Estimated Total Tests**: ~100+
- **Modules Covered**: All core modules

## Test Organization

```
tests/
├── schemas/
│   ├── primitives.test.ts
│   └── nodes.test.ts
├── tree/
│   ├── mutation.test.ts
│   ├── navigation.test.ts
│   └── validation.test.ts
├── computation/
│   └── weights.test.ts
└── serialization/
    └── json.test.ts
```

## Future Test Coverage

Additional tests to add:
- ⏳ ShareOfGeneralSatisfaction calculation
- ⏳ SymLink operations
- ⏳ Subscription management
- ⏳ Pub-sub propagation
- ⏳ Allocation calculation
- ⏳ Allocation management
- ⏳ Integration tests
