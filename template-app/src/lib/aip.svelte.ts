// src/lib/aip.svelte.ts
//
// AIP OAuth 2.0 login flow — PKCE, plain Bearer token (no DPoP).
// HappyView validates tokens via AIP's /oauth/userinfo using Bearer,
// so tokens must NOT be DPoP-bound.

import { auth } from '$lib/auth.svelte';

const AIP_URL = import.meta.env.VITE_AIP_URL as string;

// ── PKCE helpers ──────────────────────────────────────────────────────────────

function randomString(len = 32): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function codeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// ── session keys (sessionStorage) ────────────────────────────────────────────

const SK = {
  verifier: 'aip_verifier',
  state: 'aip_state',
  clientId: 'aip_client_id',
  redirectUri: 'aip_redirect_uri',
} as const;

function clearOAuthSession() {
  Object.values(SK).forEach((k) => sessionStorage.removeItem(k));
}

// ── AIP state ─────────────────────────────────────────────────────────────────

class Aip {
  loading = $state(false);
  error = $state<string | null>(null);

  /** Step 1: register client, build authorize URL, redirect. */
  async login(handle: string) {
    this.loading = true;
    this.error = null;
    try {
      // PKCE
      const verifier = randomString(32);
      const challenge = await codeChallenge(verifier);
      const state = randomString(16);

      // Register a public OAuth client
      const redirectUri = `${window.location.origin}/login/callback`;
      const regRes = await fetch(`${AIP_URL}/oauth/clients/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redirect_uris: [redirectUri],
          grant_types: ['authorization_code'],
          response_types: ['code'],
          token_endpoint_auth_method: 'none',
          application_type: 'web',
          client_name: 'Open Association',
        }),
      });
      if (!regRes.ok) throw new Error(`Client registration failed (${regRes.status})`);
      const { client_id } = (await regRes.json()) as { client_id: string };

      // Persist OAuth session for the callback
      sessionStorage.setItem(SK.verifier, verifier);
      sessionStorage.setItem(SK.state, state);
      sessionStorage.setItem(SK.clientId, client_id);
      sessionStorage.setItem(SK.redirectUri, redirectUri);

      // Redirect to AIP
      const url = new URL(`${AIP_URL}/oauth/authorize`);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('client_id', client_id);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('code_challenge', challenge);
      url.searchParams.set('code_challenge_method', 'S256');
      url.searchParams.set('state', state);
      url.searchParams.set('scope', 'atproto');
      url.searchParams.set('login_hint', handle);
      window.location.href = url.toString();
    } catch (e: unknown) {
      this.error = e instanceof Error ? e.message : 'Login failed';
      this.loading = false;
    }
  }

  /** Step 2: exchange code for a plain Bearer token, store session. */
  async handleCallback(code: string, returnedState: string): Promise<boolean> {
    this.loading = true;
    this.error = null;
    try {
      if (returnedState !== sessionStorage.getItem(SK.state)) {
        throw new Error('State mismatch — possible CSRF');
      }

      const verifier = sessionStorage.getItem(SK.verifier)!;
      const clientId = sessionStorage.getItem(SK.clientId)!;
      const redirectUri = sessionStorage.getItem(SK.redirectUri)!;

      // Exchange code for plain Bearer token (no DPoP).
      const tokenRes = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          code_verifier: verifier,
        }),
      });
      if (!tokenRes.ok) throw new Error(`Token exchange failed (${tokenRes.status})`);

      const { access_token, sub } = (await tokenRes.json()) as {
        access_token: string;
        sub?: string;
      };

      // Resolve DID — usually returned as `sub` in the token response.
      let did = sub;
      if (!did) {
        const infoRes = await fetch('/api/userinfo', {
          headers: { 'x-authorization': `Bearer ${access_token}` },
        });
        if (!infoRes.ok) throw new Error(`Userinfo failed (${infoRes.status})`);
        did = ((await infoRes.json()) as { sub: string }).sub;
      }

      auth.setSession(access_token, did!);
      clearOAuthSession();
      return true;
    } catch (e: unknown) {
      this.error = e instanceof Error ? e.message : 'Login failed';
      return false;
    } finally {
      this.loading = false;
    }
  }
}

export const aip = new Aip();
