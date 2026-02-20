<script lang="ts">
  import { browser } from '$app/environment';
  import { auth } from '$lib/auth.svelte';
  import { query, procedure } from '$lib/xrpc.svelte';
  import type { LexList, AgentValue } from '$lib/types';
  import favicon from '$lib/assets/favicon.svg';

  let { children } = $props();

  if (browser) {
    auth.loadFromStorage();
  }

  const HAPPYVIEW_URL = import.meta.env.VITE_HAPPYVIEW_URL as string;

  $effect(() => {
    if (auth.isLoggedIn && auth.did && auth.token) {
      ensureAgent(auth.did, auth.token);
    }
  });

  async function ensureAgent(did: string, token: string) {
    try {
      const { records } = await query<LexList<AgentValue>>(
        'org.openassociation.listAgents',
        { did, limit: 1 },
      );
      if (records.length > 0) return;

      // Pre-fill from the user's Bluesky profile
      const profileRes = await fetch(`${HAPPYVIEW_URL}/xrpc/app.bsky.actor.getProfile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = profileRes.ok
        ? ((await profileRes.json()) as { displayName?: string; description?: string })
        : {};

      await procedure(
        'org.openassociation.createAgent',
        {
          agentType: 'person',
          ...(profile.displayName && { name: profile.displayName }),
          ...(profile.description && { note: profile.description }),
        },
        token,
      );
    } catch {
      // Silently ignore — lexicons may not be uploaded to HappyView yet
    }
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
