# Phase 4 Stage B — BNT Product Page Template v1 (LOCKED)

**Status:** ✅ Complete — visually approved by project owner. Locked as the
reusable baseline for `/events/:slug`.

**Branch:** `phase4-stageB-events-product-page` (not merged to `main`)
**Locked at commit:** `a732946` — "Phase 4 Stage B refinement: fix
heading-margin specificity bug + BCC-style sticky bar"

**Scope:** the reusable BEST Nightlife Thailand product/event page —
`lib/renderProductPage.js` (renderer), `css/product-page.css` (design
system), `fixtures/productPageFixtures.js` (preview-only demo data),
`server.js` `GET /events/:slug` route. No changes to the canonical
Product API, its data contracts, or checkout.

---

## What "locked" means

This is the approved visual/structural baseline for every future Product
Page built on this renderer. Changes from here on should be scoped
additions (new optional sections, new Stage C/D functionality) — not
another pass at the typography/color/spacing system below, unless the
project owner explicitly asks to revisit it.

## Design system (locked)

**Fonts:** Cormorant Garamond (serif/display, editorial headings) +
Montserrat (sans, body/UI) — same pairing as `about.html` /
`css/luxury-landing.css`, loaded via the file's own `@import` so the page
has no runtime dependency on those files.

**Base palette:**
- Background `#0D0D0D`, surfaces `#1C1C1E` / `#2C2C2E`
- Text: primary `#FFFFFF`, body `rgba(255,255,255,0.86)`, secondary
  `rgba(255,255,255,0.68)`, tertiary `rgba(255,255,255,0.42)`

**Accent — BNT fuchsia (primary decorative accent):**
`--pp-accent #EA003A` + `--pp-accent-2 #820065`, reused verbatim from
`about.html` / `luxury-landing.css` (`--color-core-accent` /
`--color-fuchsia`). Drives eyebrow labels, bullet dots, timeline
markers/line, include-card icons/borders, meeting-point link,
after-booking icon/card border, hero tagline, and the editorial serif
heading gradient (`linear-gradient(135deg, #EA003A, #820065)`,
background-clip:text — same treatment as About's `.card-header`, e.g.
"We bring the real Thai hospitality.").

**Gold — functional UI only, not a brand accent:**
`--pp-gold #D4AF37`, kept only for the primary CTA button, the sticky
booking bar's fuchsia gradient replaced it everywhere else — see the
open item below.

**Typography hierarchy:**
1. Eyebrow — uppercase, sans-serif, fuchsia, letter-spaced
2. Editorial heading — italic serif, fuchsia gradient, larger, generous
   line-height
3. Primary body — off-white, sans-serif, high readability
4. Secondary/tertiary text — muted grey, only for genuinely secondary
   info (footer, meeting-point instructions, not-included items)

**Spacing rhythm (eyebrow → heading → content), real measured values:**
- `.pp-eyebrow` margin-bottom: `10px` (`26px` for the standalone case —
  Good To Know, which has no heading between eyebrow and content)
- `.pp-headline` margin-bottom: `26px`

This required fixing a real bug, not just picking numbers: a global
`.pp-root h1, .pp-root h2, .pp-root h3 { margin: 0; }` reset (specificity
0,1,1) was silently overriding every margin declared on the plain
`.pp-headline` class (0,1,0) — three earlier rounds of "increase the
margin" were no-ops. Fixed by scoping the rule to `.pp-root .pp-headline`
(0,2,0). The values above are real, verified via `getBoundingClientRect`,
not guessed.

## Components (locked)

- **Quick Facts** — compact values on mobile (`5 Sept`, `฿890`), richer
  values on desktop (`Sat 5 Sept`, `฿890 / person`), always one row, no
  wrap
- **Highlights** — eyebrow + gradient heading + bullet list
- **What's Included** — icon card grid (2-col mobile, 3-col desktop)
- **How The Night Goes** — numbered timeline with connecting line
- **Meeting Point** — key-less Google Maps embed + location card when
  `visibility:'public'`; static designed placeholder card when
  `visibility:'after_booking'` (no address/maps fields ever referenced
  for that shape); nothing rendered otherwise
- **Good To Know** — eyebrow only, no duplicate heading; not-included
  list (pink × marker) + important-info bullets
- **Gallery** — horizontal scroll-snap strip
- **CTA + sticky mobile booking bar** — BCC-style: fuchsia/magenta
  gradient (`--pp-accent-gradient`), safe-area aware. Enabled state:
  data-driven price left, solid white "Book Your Spot →" pill button
  right. Disabled state (current real behavior — `booking.enabled` is
  always `false` in Stage B): same gradient system, centered "Booking
  opens soon" text, no anchor/button element (structurally
  non-clickable). `.pp-main` reserves `84px + safe-area-inset-bottom` at
  the bottom so content never sits under the fixed bar.

All three fixtures (`full`, `afterBooking`, `minimal`) render correctly
against this system — verified on mobile (390px) and desktop (1440px).

## Known open item — not yet resolved

`claude.md` (this repo's dual-brand design-rules doc) documents BNT's
accent policy as gold-primary, with electric pink restricted to "a
minimal secondary accent" (hover glows, thin borders, tab underlines,
small text links) — explicitly "DO NOT use solid pink" for primary
elements. This locked template does the opposite: fuchsia is the primary
decorative accent throughout, matching how `about.html` actually uses it
today. The project owner approved this as final direction for the
Product Page, but `claude.md` itself has not been updated to match —
it's currently self-contradictory. Worth reconciling in a follow-up
(likely: update `claude.md`'s BNT accent-policy section to match actual
About Us / Product Page usage) before this pattern is copied elsewhere.

## Explicitly untouched

- Product API / canonical data contracts
- `/events/:slug` route logic and `?preview=` fixture mechanism
- Checkout / booking behavior (still disabled — Stage C/D)
- `new-in-bkk` Draft status and visibility on both storefronts
- `main` branch — this work lives only on `phase4-stageB-events-product-page`

## Next

Stage C (booking implementation) — not started.
