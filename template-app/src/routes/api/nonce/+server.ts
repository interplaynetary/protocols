// Probe AIP with no credentials to obtain a fresh dpop-nonce.
// AIP always responds 401 + dpop-nonce, which the client can use in its
// first DPoP proof — avoiding the visible 401 retry in the callback flow.

import type { RequestHandler } from './$types';

const AIP_URL = import.meta.env.VITE_AIP_URL as string;

export const GET: RequestHandler = async () => {
  const res = await fetch(`${AIP_URL}/oauth/userinfo`);
  const nonce = res.headers.get('dpop-nonce');
  return new Response(JSON.stringify({ nonce: nonce ?? null }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
