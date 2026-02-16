/**
 * Ensures that different module configurations compile OK (no fields are missing in given combinations)
 *
 * @package: vf-graphql
 * @since:   2020-03-29
 */

const test = require('tape-catch')

const { makeMockSchema, exerciseSchema } = require('./helpers')
const { buildSchema, printSchema } = require('../lib/')

test('configuration: kitchen sink', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'ordering', 'filtering',
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process', 'recipe',
    'commitment', 'intent', 'satisfaction', 'fulfillment',
    'agreement', 'proposal',
    'geolocation',
    'plan', 'scenario',
    'appreciation', 'claim',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: standalone agent', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'agent',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: agent mapping', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'agent', 'geolocation',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: observation only', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: observation + geo', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation',
    'geolocation',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: observation & planning', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process',
    'commitment', 'intent', 'satisfaction', 'fulfillment',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: observation & planning + geo', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process',
    'commitment', 'intent', 'satisfaction', 'fulfillment',
    'geolocation',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: observation, planning & recipe', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process',
    'commitment', 'intent', 'satisfaction', 'fulfillment',
    'recipe',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: observation, planning & recipe + geo', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process',
    'commitment', 'intent', 'satisfaction', 'fulfillment',
    'recipe',
    'geolocation',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: recipe only', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'recipe',
  ])))
  exerciseSchema(schema)
  t.end()
})

// :TODO: support "planning only"

test('configuration: observation, planning & proposal', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process',
    'commitment', 'intent', 'satisfaction', 'fulfillment',
    'proposal',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: observation, planning & proposal + geo', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process',
    'commitment', 'intent', 'satisfaction', 'fulfillment',
    'proposal',
    'geolocation',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: observation, planning, recipe & proposal', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process',
    'commitment', 'intent', 'satisfaction', 'fulfillment',
    'recipe',
    'proposal',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: observation, planning, recipe & proposal + geo', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process',
    'commitment', 'intent', 'satisfaction', 'fulfillment',
    'recipe',
    'proposal',
    'geolocation',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: observation, planning & agreement', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process',
    'commitment', 'intent', 'satisfaction', 'fulfillment',
    'agreement',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: observation, planning & agreement + geo', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process',
    'commitment', 'intent', 'satisfaction', 'fulfillment',
    'agreement',
    'geolocation',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: observation, planning, recipe & agreement', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process',
    'commitment', 'intent', 'satisfaction', 'fulfillment',
    'recipe',
    'agreement',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: observation, planning, recipe & agreement + geo', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process',
    'commitment', 'intent', 'satisfaction', 'fulfillment',
    'recipe',
    'agreement',
    'geolocation',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: observation, planning & governance', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process',
    'commitment', 'intent', 'satisfaction', 'fulfillment',
    'proposal', 'agreement',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: observation, planning & governance + geo', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process',
    'commitment', 'intent', 'satisfaction', 'fulfillment',
    'proposal', 'agreement',
    'geolocation',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: observation, planning, recipe & governance', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process',
    'commitment', 'intent', 'satisfaction', 'fulfillment',
    'recipe',
    'proposal', 'agreement',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: observation, planning, recipe & governance + geo', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process',
    'commitment', 'intent', 'satisfaction', 'fulfillment',
    'recipe',
    'proposal', 'agreement',
    'geolocation',
  ])))
  exerciseSchema(schema)
  t.end()
})

// misc modules - testing in most isolated configurations only

test('configuration: gift economies', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process',
    'appreciation',
  ])))
  exerciseSchema(schema)
  t.end()
})

test('configuration: future claims', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process', 'intent',
    'claim',
  ])))
  exerciseSchema(schema)
  t.end()
})

// kitchen sink

test('configuration: everything', (t) => {
  const schema = makeMockSchema(printSchema(buildSchema([
    'history',
    'process_specification', 'resource_specification', 'action', 'measurement',
    'agent',
    'observation', 'process', 'recipe',
    'commitment', 'intent', 'satisfaction', 'fulfillment',
    'plan', 'scenario',
    'proposal', 'agreement',
    'appreciation',
    'claim',
    'geolocation',
  ])))
  exerciseSchema(schema)
  t.end()
})

