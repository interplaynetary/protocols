/**
 * ValueFlows GraphQLClient mock
 *
 * Serves random mock datasources through the VF API
 *
 * @package: ValueFlows GraphQL client mock
 * @since:   2020-08-07
 * @updated: 2026-02-15 - Migrated to TypeScript
 */

import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { SchemaLink } from '@apollo/client/link/schema'
import { addMocksToSchema } from '@graphql-tools/mock'
import { buildSchema } from '@valueflows/vf-graphql'

const schema = addMocksToSchema({
  schema: buildSchema(),
  mocks: {
    URI: () => 'http://example.com/thing',
    DateTime: () => new Date().toISOString(),
  },
})

function initClient(): Promise<ApolloClient<NormalizedCacheObject>> {
  return new Promise((resolve) => resolve(
    new ApolloClient({
      cache: new InMemoryCache(),
      link: new SchemaLink({ schema })
    })
  ))
}

export default initClient
