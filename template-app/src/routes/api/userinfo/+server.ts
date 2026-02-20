// Proxy the OAuth userinfo request server-side to avoid CORS issues.
// Uses plain Bearer auth — tokens are not DPoP-bound so AIP accepts Bearer here.

import type { RequestHandler } from './$types';

const AIP_URL = import.meta.env.VITE_AIP_URL as string;

export const GET: RequestHandler = async ({ request }) => {
  const authorization = request.headers.get('x-authorization') ?? '';

  const res = await fetch(`${AIP_URL}/oauth/userinfo`, {
    headers: { Authorization: authorization },
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
};
