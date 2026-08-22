# Phase 4 Stage C — Generic BNT Booking Surface

**Status:** ✅ Complete — generic booking page + proxy live on this branch,
not merged to `main`.

**Branch:** `phase4-stageC-bnt-booking-surface` (based on the locked
`phase4-stageB-events-product-page` @ `1a6212a`)

**Scope:** a generic BEST Nightlife Thailand booking surface at `GET /book`
that works for any BNT product via `?night=<product-slug>`, backed by a
thin server-to-server proxy at `GET /api/events`. No product-specific
logic anywhere in this stage — no New in Bangkok hardcoding, no second
checkout implementation, no Stripe integration (Stage D).

---

## Booking-page contract — `GET /book`

**Query params:**
- `?night=<product-slug>` — preselects that product's booking flow.
- `?preview=<fixture-key>` — Preview-only mock data (see Fixture contract
  below). Ignored on Production.
- Neither param combination changes the HTTP status: `/book` always
  returns `200` and renders the page shell. All availability resolution
  (found / empty / invalid) happens **client-side** after the shell loads,
  by fetching the local `/api/events` proxy — this is what keeps "the
  browser calls only the local BNT `/api/events`" literally true, and lets
  one route serve every state without a server-side branch per outcome.

**Behavior once the client-side fetch resolves:**
- `?night=<slug>` matches ≥1 event → booking form: product name, a date
  chip per upcoming Event Instance (soonest first, pre-selected), start
  time + price for the selected date, a quantity stepper (1–10, floor/ceil
  enforced), a live total (`price × qty`), and the canonical `eventId` of
  the selected occurrence kept in JS state + mirrored onto
  `#bp-booking[data-selected-event-id]` for inspection/testing.
- `?night=<slug>` matches 0 events → empty state, generic copy that does
  **not** distinguish "Draft", "inactive", "no upcoming dates", or
  "slug never existed" — same fail-closed, non-distinguishing pattern
  Stage B's Product Page 404 already uses.
- No `?night` → generic cross-product selector: one card per distinct
  `productSlug` present in the feed (soonest event per product), each
  linking to `/book?night=<slug>` (carrying `?preview=` along if set). Do
  **not** default to any specific product.
- Fetch fails (network error, non-2xx) → same empty-state UI with a
  "couldn't load availability, try again" message — fails gracefully, no
  uncaught error, no broken page.

**Booking CTA:** `CONTINUE TO BOOKING` (main) and `Continue →` (sticky
mobile bar) are both plain `<div>`s, not `<button>`/`<a>` — structurally
non-clickable, matching Stage B's own "Booking opens soon" convention.
Nothing in this page ever calls `/api/create-checkout` or any other
checkout route. That wiring is explicitly Stage D.

**Visual system:** self-contained `css/booking-page.css` (own `@import`,
own `:root` tokens) on the locked BNT palette — dark base, fuchsia/magenta
`--bp-accent-gradient` (`#EA003A → #820065`) for eyebrows/headings/date-chip
selection/sticky bar, gold reserved for the CTA only, Cormorant Garamond +
Montserrat. Mobile-first, 44px+ touch targets on the quantity stepper and
date chips.

## Proxy contract — `GET /api/events`

Thin server-to-server proxy, the **only** way this repo touches Event
Instance data (never a direct Supabase connection, never the BCC
service-role key — same rule Stage A's `canonicalProductApi.js` already
follows).

- `storefront` is hardcoded to `bnt` inside `lib/canonicalEventsApi.js`
  when calling the canonical endpoint — there is no code path that reads
  a browser-supplied `storefront` and forwards it. A client hitting
  `/api/events?storefront=bcc` gets ignored; it always gets BNT-visible
  data only.
- Response is trimmed to exactly what the booking UI needs:
  ```json
  { "events": [
    { "eventId": "...", "productSlug": "...", "productName": "...",
      "eventDate": "YYYY-MM-DD", "effectiveStartTime": "HH:MM:SS",
      "effectivePrice": 890 }
  ]}
  ```
  (`productId`, `nightSlug`, `nightName`, `capacity` from the canonical
  feed are intentionally dropped — not needed by this UI.)
- Canonical upstream: `bcc-claude` `GET /api/events?storefront=bnt`
  (`app/api/events/route.ts`, live today — not aspirational). It already
  gates on `products.status='active' AND products.visible_bnt=true AND
  event_dates.is_open AND event_date >= today(Asia/Bangkok)`, so
  `new-in-bkk` (Draft, `visible_bnt=false`) never appears in a live
  response regardless of anything this repo does.
- Upstream base URL: `BCC_PRODUCT_API_BASE` env var (reused from Stage A —
  same canonical backend, one config knob), defaulting to
  `https://www.bkkclubcrawl.com`. Preview deployments can override it to
  point at a Preview deployment of `bcc-claude`; Production leaves it
  unset and gets the real canonical domain automatically.
- Upstream unreachable / non-OK / malformed → `503 { error: "..." }`,
  never a crash, never stale/fabricated data.
- `?preview=<key>` → served entirely from `fixtures/bookingFixtures.js`,
  gated by `isMockAllowed()` (`VERCEL_ENV !== 'production'`) — identical
  hard-disable mechanism to Stage B. Unknown fixture key → `404`.

## Fixture / Preview-testing contract

`fixtures/bookingFixtures.js` exports one scenario, `demo`, shaped exactly
like the canonical feed: two invented products —
`demo-night-one` (3 upcoming dates, price varies by date) and
`demo-night-two` (1 upcoming date) — entirely fictional names/slugs/prices,
never New in Bangkok's real data.

Test paths (Preview only):
- `/book?night=demo-night-one&preview=demo` — multi-date booking flow
- `/book?night=demo-night-two&preview=demo` — single-date booking flow
- `/book?preview=demo` — generic cross-product selector (2 cards)
- `/book?night=anything-not-in-the-list&preview=demo` — empty state
- `/api/events?preview=demo` — raw trimmed JSON

`new-in-bkk` was not touched, activated, or referenced anywhere in this
stage — Draft stays Draft, and it was never used to test any of the above.

## Legacy guardrails respected

- `/book.html` (the literal, extension-ful legacy BCC URL) still 301s to
  `https://www.bkkclubcrawl.com/book`, unchanged.
- `/book` (extensionless) is the **only** thing reclaimed in this stage —
  intentional, per the target flow
  `bestnightlifethailand.com/book?night=[slug]`. This is not "legacy
  cleanup"; it's Stage C's literal deliverable.
- No other legacy BCC page, Stripe/webhook route, Bokun webhook route, or
  old Next.js/script/doc file was modified or deleted.

## Remaining Stage D work (explicitly out of scope here)

- Wire the booking CTA to a real checkout call once the shared canonical
  checkout backend exists for BNT products (dynamic `eventId`-based
  checkout, not the legacy BCC `/api/create-checkout`).
- Decide/implement guest-detail collection (name/contact) ahead of
  checkout, if not already covered by the shared checkout flow.
- Success/cancel redirect handling back into the BNT surface.
- Activating `new-in-bkk` (or any other real product) for BNT remains a
  separate, explicit decision — never a side effect of Stage D wiring.
