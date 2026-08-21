'use strict';

/**
 * Preview-only mock data shaped EXACTLY like the canonical Product Read API
 * response (bcc-claude GET /api/products/:slug?storefront=bnt). Used only
 * by server.js's /events/:slug route when ?preview=<key> is present AND
 * canonicalProductApi.isMockAllowed() is true (never on a real production
 * deployment — see that file's guard).
 *
 * Content here is entirely invented demo copy. It intentionally does NOT
 * reuse New in Bangkok's real name, price, schedule, or description — this
 * exists to visually exercise the generic renderer's section variations
 * (full content, after-booking meeting point, sparse/no content), not to
 * preview any specific real Product ahead of publish.
 */

const IMG = (p) => `/assets/images/${p}`;

const full = {
  product: {
    slug: 'demo-full',
    name: 'Midnight Social',
    default_price: 890,
    default_start_time: '21:00:00',
  },
  content: {
    tagline: 'One night, every rooftop that matters.',
    short_description: 'A curated hop between three of Bangkok’s best rooftop and club venues, hosted start to finish.',
    full_description:
      'We handle the guest list, the queue, and the flow between venues so you don’t have to think about any of it. ' +
      'Just show up, meet the group, and let the night carry itself.',
    duration_minutes: 240,
    highlights: [
      'Skip-the-line entry at every stop',
      'Dedicated host with you all night',
      'Small mixed-nationality group, not a mega-tour',
    ],
    itinerary: [
      { title: 'Meet & welcome drink', description: 'Meet the group and your host over a welcome drink.' },
      { title: 'Rooftop #1', description: 'Golden-hour rooftop with skyline views.' },
      { title: 'Club transfer', description: 'Grouped transfer, skip-the-line entry.' },
      { title: 'Late-night close', description: 'Dancing until the group naturally winds down.' },
    ],
    whats_included: ['Host for the full night', 'Skip-the-line entry', 'One welcome drink'],
    whats_not_included: ['Transport to the first meeting point', 'Additional drinks after the welcome drink'],
    important_info: ['21+ only, ID required', 'Smart casual dress code'],
    meeting_point: {
      visibility: 'public',
      display_name: 'Sky Bar Meeting Point',
      address: '999 Rama I Rd, Pathum Wan, Bangkok',
      maps_url: 'https://maps.google.com/?q=Bangkok',
      instructions: 'Look for the host holding a small gold sign near the entrance.',
    },
  },
  media: [
    { kind: 'cover', alt: 'Rooftop crowd at night', sort_order: 0, url: IMG('hero-bg.jpg') },
    { kind: 'gallery', alt: 'Club interior', sort_order: 1, url: IMG('VIP Nightclubbing .jpg') },
    { kind: 'gallery', alt: 'Group photo', sort_order: 2, url: IMG('1. Meet/Lamaya group shot1.JPG') },
    { kind: 'gallery', alt: 'Bangkok skyline', sort_order: 3, url: IMG('BangkokMasquerade-218.jpg') },
  ],
  upcomingEvents: [
    { eventId: 'demo-1', eventDate: '2026-09-05', effectivePrice: 890, effectiveStartTime: '21:00:00' },
  ],
};

const afterBooking = {
  product: {
    slug: 'demo-after-booking',
    name: 'Private Rooftop Session',
    default_price: 2400,
    default_start_time: '20:00:00',
  },
  content: {
    tagline: 'Somewhere quieter, somewhere better.',
    short_description: 'A smaller, more private evening — exact venue confirmed once you’re booked in.',
    full_description: null,
    duration_minutes: 180,
    highlights: ['Small private group', 'Handpicked venue, confirmed after booking'],
    itinerary: [],
    whats_included: ['Host', 'Reserved seating'],
    whats_not_included: ['Food and drinks'],
    important_info: ['Exact venue shared after booking for guest-list purposes'],
    meeting_point: { visibility: 'after_booking' },
  },
  media: [{ kind: 'cover', alt: 'Private lounge', sort_order: 0, url: IMG('VIP Nightclubbing .jpg') }],
  upcomingEvents: [
    { eventId: 'demo-2', eventDate: '2026-09-12', effectivePrice: 2400, effectiveStartTime: '20:00:00' },
  ],
};

const minimal = {
  product: {
    slug: 'demo-minimal',
    name: 'Bare-Bones Listing',
    default_price: 500,
    default_start_time: '19:30:00',
  },
  content: null,
  media: [],
  upcomingEvents: [],
};

module.exports = { full, afterBooking, minimal };
