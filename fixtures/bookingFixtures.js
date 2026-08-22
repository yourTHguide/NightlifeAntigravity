'use strict';

/**
 * Preview-only mock data shaped EXACTLY like the canonical availability feed
 * (bcc-claude GET /api/events?storefront=bnt — see lib/canonicalEventsApi.js).
 * Used only by server.js's GET /api/events route when ?preview=<key> is
 * present AND canonicalEventsApi.isMockAllowed() is true (never on a real
 * production deployment — see that module's guard).
 *
 * Entirely invented demo products/slugs — this intentionally does not reuse
 * New in Bangkok's (or any other real BEST Nightlife product's) name, price,
 * schedule, or slug, so it can never be mistaken for real availability and
 * never needs new-in-bkk to leave Draft to be tested.
 */

const demo = [
  {
    eventId: 'demo-evt-1a',
    productId: 'demo-prod-1',
    productSlug: 'demo-night-one',
    productName: 'Demo Night One',
    eventDate: '2026-09-05',
    nightSlug: 'demo-night-one',
    nightName: 'Demo Night One',
    effectivePrice: 890,
    effectiveStartTime: '21:00:00',
    capacity: null,
  },
  {
    eventId: 'demo-evt-1b',
    productId: 'demo-prod-1',
    productSlug: 'demo-night-one',
    productName: 'Demo Night One',
    eventDate: '2026-09-12',
    nightSlug: 'demo-night-one',
    nightName: 'Demo Night One',
    effectivePrice: 890,
    effectiveStartTime: '21:00:00',
    capacity: null,
  },
  {
    eventId: 'demo-evt-1c',
    productId: 'demo-prod-1',
    productSlug: 'demo-night-one',
    productName: 'Demo Night One',
    eventDate: '2026-09-19',
    nightSlug: 'demo-night-one',
    nightName: 'Demo Night One',
    effectivePrice: 990,
    effectiveStartTime: '21:00:00',
    capacity: null,
  },
  {
    eventId: 'demo-evt-2a',
    productId: 'demo-prod-2',
    productSlug: 'demo-night-two',
    productName: 'Demo Night Two',
    eventDate: '2026-09-06',
    nightSlug: 'demo-night-two',
    nightName: 'Demo Night Two',
    effectivePrice: 1200,
    effectiveStartTime: '20:30:00',
    capacity: 40,
  },
];

module.exports = { demo };
