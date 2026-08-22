'use strict';

/**
 * Server-to-server client for the canonical bcc-claude availability feed
 * (Phase 3: GET /api/events?storefront=bnt). This is the ONLY way this repo
 * touches Event Instance data — never a direct Supabase connection, never
 * the BCC service-role key. Browser code must never call this directly;
 * only the local GET /api/events proxy route in server.js should.
 *
 * storefront=bnt is always hardcoded into the request URL below — there is
 * no parameter on this function that lets a caller override it, so a
 * browser-supplied ?storefront= on the local proxy route has nothing to
 * reach even if a caller tried to forward it.
 */

const { getProductApiBase, isMockAllowed } = require('./canonicalProductApi');

/**
 * @returns {Promise<{status: 'ok', events: object[]} | {status: 'error'}>}
 */
async function fetchCanonicalEvents({ timeoutMs = 6000 } = {}) {
  const base = getProductApiBase();
  const url = `${base}/api/events?storefront=bnt`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });

    if (!res.ok) {
      console.error(`[canonicalEventsApi] ${url} returned HTTP ${res.status}`);
      return { status: 'error' };
    }

    const body = await res.json();
    if (!body || !Array.isArray(body.events)) {
      console.error(`[canonicalEventsApi] ${url} returned an unexpected shape`);
      return { status: 'error' };
    }

    return { status: 'ok', events: body.events };
  } catch (err) {
    console.error(`[canonicalEventsApi] request to ${url} failed:`, err && err.message ? err.message : err);
    return { status: 'error' };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetchCanonicalEvents, isMockAllowed };
