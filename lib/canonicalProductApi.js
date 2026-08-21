'use strict';

/**
 * Server-to-server client for the canonical bcc-claude Product Read API
 * (Phase 4 Stage A: GET /api/products/:slug?storefront=bnt). This is the
 * ONLY way this repo touches Product data — never a direct Supabase
 * connection, never the BCC service-role key. Browser code must never call
 * this directly; only server.js route handlers should.
 *
 * Base URL defaults to the real production canonical domain rather than a
 * temporary preview deployment, so this keeps working with zero config
 * changes once bcc-claude's Phase 4 branch merges to main.
 */

const DEFAULT_PRODUCT_API_BASE = 'https://www.bkkclubcrawl.com';

function getProductApiBase() {
  const base = process.env.BCC_PRODUCT_API_BASE || DEFAULT_PRODUCT_API_BASE;
  return base.replace(/\/+$/, '');
}

// Preview-fixture mode must never be reachable on a real production
// deployment, regardless of query params a caller sends.
function isMockAllowed() {
  return process.env.VERCEL_ENV !== 'production';
}

/**
 * @returns {Promise<{status: 'ok', data: object} | {status: 'not_found'} | {status: 'error'}>}
 */
async function fetchCanonicalProduct(slug, { timeoutMs = 6000 } = {}) {
  const base = getProductApiBase();
  const url = `${base}/api/products/${encodeURIComponent(slug)}?storefront=bnt`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });

    if (res.status === 404) {
      return { status: 'not_found' };
    }
    if (!res.ok) {
      console.error(`[canonicalProductApi] ${url} returned HTTP ${res.status}`);
      return { status: 'error' };
    }

    const body = await res.json();
    if (!body || !body.product) {
      console.error(`[canonicalProductApi] ${url} returned an unexpected shape`);
      return { status: 'error' };
    }

    return { status: 'ok', data: body };
  } catch (err) {
    console.error(`[canonicalProductApi] request to ${url} failed:`, err && err.message ? err.message : err);
    return { status: 'error' };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetchCanonicalProduct, getProductApiBase, isMockAllowed };
