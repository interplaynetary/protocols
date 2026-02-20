// Proxy the OAuth token exchange server-side to avoid CORS issues.
// DPoP is NOT used here — tokens must be plain Bearer so that HappyView
// can validate them with AIP's userinfo endpoint via Bearer auth.

import type { RequestHandler } from './$types';

const AIP_URL = import.meta.env.VITE_AIP_URL as string;

export const POST: RequestHandler = async ({ request }) => {
  const params = (await request.json()) as Record<string, string>;

  const res = await fetch(`${AIP_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
};
