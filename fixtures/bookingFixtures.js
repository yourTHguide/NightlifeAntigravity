'use strict';

/**
 * Preview-only mock data shaped EXACTLY like the canonical availability feed
 * (bcc-claude GET /api/events?storefront=bnt — see lib/canonicalEventsApi.js),
 * plus a few presentation-only extra fields (subtitle, heroImage,
 * ticketOptions) that the canonical feed does NOT send today. Those extra
 * fields exist purely so this fixture can demonstrate UI the real API
 * doesn't have data for yet (a subtitle line, an image-led event card,
 * selectable ticket tiers) — see lib/renderBookingPage.js and server.js's
 * shapeBntEvent for how they degrade gracefully to nothing when absent.
 * This is NOT a canonical ticket-tier schema: it is fixture data proving
 * out UI that real canonical ticket tiers could later populate.
 *
 * Used only by server.js's GET /api/events route when ?preview=<key> is
 * present AND canonicalEventsApi.isMockAllowed() is true (never on a real
 * production deployment — see that module's guard).
 *
 * Entirely invented demo products/slugs — this intentionally does not reuse
 * New in Bangkok's (or any other real BEST Nightlife product's) name, price,
 * schedule, or slug, so it can never be mistaken for real availability and
 * never needs new-in-bkk to leave Draft to be tested.
 */

const RECURRING_TICKET_OPTIONS = [
  {
    id: 'early-bird',
    label: 'Early Bird',
    sublabel: 'Limited availability',
    price: 300,
    includes: ['Welcome shot', 'Priority entry'],
  },
  {
    id: 'general',
    label: 'General Admission',
    sublabel: 'Standard entry',
    price: 450,
    includes: ['Welcome shot', 'Standard entry'],
  },
];

const ONE_TIME_TICKET_OPTIONS = [
  {
    id: 'general',
    label: 'General Admission',
    sublabel: 'Standard entry',
    price: 1200,
    includes: ['Welcome drink', 'Standard entry'],
  },
  {
    id: 'vip',
    label: 'VIP Masked Pass',
    sublabel: 'VIP experience',
    price: 1800,
    includes: ['Welcome drink', 'Fast-track entry', 'Access to VIP area'],
  },
];

const demo = [
  {
    eventId: 'demo-evt-1a',
    productId: 'demo-prod-1',
    productSlug: 'demo-night-one',
    productName: 'Demo Night One',
    subtitle: 'Tuesday Social Night',
    heroImage: '/assets/images/VIP Nightclubbing .jpg',
    eventDate: '2026-09-05',
    nightSlug: 'demo-night-one',
    nightName: 'Demo Night One',
    effectivePrice: 890,
    effectiveStartTime: '21:00:00',
    capacity: null,
    ticketOptions: RECURRING_TICKET_OPTIONS,
  },
  {
    eventId: 'demo-evt-1b',
    productId: 'demo-prod-1',
    productSlug: 'demo-night-one',
    productName: 'Demo Night One',
    subtitle: 'Tuesday Social Night',
    heroImage: '/assets/images/VIP Nightclubbing .jpg',
    eventDate: '2026-09-12',
    nightSlug: 'demo-night-one',
    nightName: 'Demo Night One',
    effectivePrice: 890,
    effectiveStartTime: '21:00:00',
    capacity: null,
    ticketOptions: RECURRING_TICKET_OPTIONS,
  },
  {
    eventId: 'demo-evt-1c',
    productId: 'demo-prod-1',
    productSlug: 'demo-night-one',
    productName: 'Demo Night One',
    subtitle: 'Tuesday Social Night',
    heroImage: '/assets/images/VIP Nightclubbing .jpg',
    eventDate: '2026-09-19',
    nightSlug: 'demo-night-one',
    nightName: 'Demo Night One',
    effectivePrice: 990,
    effectiveStartTime: '21:00:00',
    capacity: null,
    ticketOptions: RECURRING_TICKET_OPTIONS,
  },
  {
    eventId: 'demo-evt-2a',
    productId: 'demo-prod-2',
    productSlug: 'demo-night-two',
    productName: 'Demo Night Two',
    subtitle: 'A Signature Experience',
    heroImage: '/assets/images/BangkokMasquerade-218.jpg',
    eventDate: '2026-09-06',
    nightSlug: 'demo-night-two',
    nightName: 'Demo Night Two',
    effectivePrice: 1200,
    effectiveStartTime: '20:30:00',
    capacity: 40,
    ticketOptions: ONE_TIME_TICKET_OPTIONS,
  },
];

module.exports = { demo };
