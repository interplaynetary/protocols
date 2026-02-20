import { query } from '$lib/xrpc.svelte';
import type { PageLoad } from './$types';
import type { LexList, AgentValue } from '$lib/types';

export const load: PageLoad = async ({ fetch }) => {
  try {
    const { records, cursor } = await query<LexList<AgentValue>>(
      'org.openassociation.listAgents',
      { limit: 20 },
      fetch,
    );
    return { records, cursor };
  } catch {
    return { records: [], cursor: undefined };
  }
};
