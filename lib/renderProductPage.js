'use strict';

/**
 * Reusable BEST Nightlife Thailand product page renderer — Phase 4 Stage B.
 *
 * Pure function: takes a Product API response shape (see
 * lib/canonicalProductApi.js / bcc-claude's GET /api/products/:slug) and
 * returns a full HTML document string. No product-specific business logic
 * lives here — every section is optional and omitted when its data is
 * absent, so this same function renders New in Bangkok, a future product,
 * or a bare-bones listing with just a name and price.
 *
 * `booking` controls the CTA: while the BNT booking surface doesn't exist
 * yet (Stages C/D), callers pass { enabled: false } so this never renders a
 * broken checkout link or points at the legacy NightlifeAntigravity/BCC
 * checkout.
 */

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function baht(n) {
  if (n === null || n === undefined) return null;
  return `฿${Number(n).toLocaleString()}`;
}

function hhmm(t) {
  if (!t) return null;
  return String(t).slice(0, 5);
}

function durationLabel(minutes) {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

function formatEventDate(iso, { includeWeekday = true } = {}) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const options = includeWeekday
    ? { weekday: 'short', day: 'numeric', month: 'short' }
    : { day: 'numeric', month: 'short' };
  return d.toLocaleDateString('en-GB', options);
}

function bulletList(items, { small = false } = {}) {
  if (!items || items.length === 0) return '';
  const cls = small ? 'pp-bullets pp-bullets--small' : 'pp-bullets';
  return `<ul class="${cls}">${items
    .map(
      (item) => `
      <li class="pp-bullet-row">
        <span class="pp-bullet-dot"></span>
        <p class="pp-bullet-text">${escapeHTML(item)}</p>
      </li>`
    )
    .join('')}</ul>`;
}

// A small, neutral, reusable icon set for "What's included" cards — cycled
// by item order, not matched to keywords. Product-agnostic on purpose: this
// renderer has no idea what any given Product actually includes, only that
// each string in whats_included deserves a decorative visual anchor.
const INCLUDE_ICON_PATHS = [
  '<path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 7.1-1.01L12 2z"/>',
  '<path d="M6 3h12l-1.5 9a4.5 4.5 0 0 1-9 0L6 3z"/><path d="M12 15v6M9 21h6"/>',
  '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>',
  '<rect x="2" y="7" width="16" height="9" rx="2"/><path d="M18 10h3l1 3v3h-4"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>',
  '<path d="M3 9a2.5 2.5 0 0 1 0 5v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a2.5 2.5 0 0 1 0-5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/>',
];

function includeIconSvg(index) {
  const paths = INCLUDE_ICON_PATHS[index % INCLUDE_ICON_PATHS.length];
  return `<svg class="pp-include-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function includeCards(items) {
  if (!items || items.length === 0) return '';
  return `<div class="pp-include-grid">${items
    .map(
      (item, i) => `
      <div class="pp-include-card">
        ${includeIconSvg(i)}
        <p class="pp-include-text">${escapeHTML(item)}</p>
      </div>`
    )
    .join('')}</div>`;
}

function notIncludedList(items) {
  if (!items || items.length === 0) return '';
  return `<ul class="pp-not-list">${items
    .map(
      (item) => `
      <li class="pp-not-item">
        <span class="pp-not-mark" aria-hidden="true">&#10005;</span>
        <span>${escapeHTML(item)}</span>
      </li>`
    )
    .join('')}</ul>`;
}

const AFTER_BOOKING_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<rect x="5" y="10" width="14" height="9" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>' +
  '</svg>';

// Builds a key-less Google Maps embed URL from already-sanitized meeting-point
// text (address, falling back to display_name) — the same "output=embed"
// technique bkkclubcrawl.com's own event pages use. Only ever called for
// visibility:'public', where the canonical API has already decided this
// location is safe to show; never touches maps_url or any field that could
// exist on an 'after_booking' payload (that shape carries no location fields
// at all, so there is nothing here to leak even by accident).
function buildMapEmbedUrl(meetingPoint) {
  const query = (meetingPoint.address || meetingPoint.display_name || '').trim();
  if (!query) return null;
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}

function renderProductPage({ product, content, media, upcomingEvents }, opts = {}) {
  const {
    booking = { enabled: false },
    previewBanner = null, // string | null — shown as a sticky banner when set
    pageUrl = '',
  } = opts;

  const cover = (media || []).find((m) => m.kind === 'cover') || null;
  const gallery = (media || [])
    .filter((m) => m.kind === 'gallery')
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const nextEvent = (upcomingEvents && upcomingEvents[0]) || null;
  const effectivePrice = nextEvent ? nextEvent.effectivePrice : product.default_price;
  const effectiveStartTime = nextEvent ? nextEvent.effectiveStartTime : product.default_start_time;
  const priceLabel = baht(effectivePrice);
  const timeLabel = hhmm(effectiveStartTime);
  const durLabel = durationLabel(content ? content.duration_minutes : null);
  const dateLabelFull = nextEvent ? formatEventDate(nextEvent.eventDate) : null;
  const dateLabelCompact = nextEvent ? formatEventDate(nextEvent.eventDate, { includeWeekday: false }) : null;

  const tagline = content && content.tagline ? content.tagline.trim() : null;
  const shortDescription = content && content.short_description ? content.short_description.trim() : null;
  const fullDescription = content && content.full_description ? content.full_description.trim() : null;
  const highlights = (content && content.highlights ? content.highlights : []).filter(Boolean);
  const itinerary = (content && content.itinerary ? content.itinerary : []).filter((s) => s && (s.title || s.description));
  const whatsIncluded = (content && content.whats_included ? content.whats_included : []).filter(Boolean);
  const whatsNotIncluded = (content && content.whats_not_included ? content.whats_not_included : []).filter(Boolean);
  const importantInfo = (content && content.important_info ? content.important_info : []).filter(Boolean);
  const meetingPoint = content ? content.meeting_point : null;

  const quickFacts = [];
  if (dateLabelFull) quickFacts.push({ label: 'Next Date', value: dateLabelFull, compact: dateLabelCompact });
  if (timeLabel) quickFacts.push({ label: 'Start Time', value: timeLabel, compact: timeLabel });
  if (durLabel) quickFacts.push({ label: 'Duration', value: durLabel, compact: durLabel });
  if (priceLabel) quickFacts.push({ label: 'Price', value: `${priceLabel} / person`, compact: priceLabel });

  const title = `${escapeHTML(product.name)} | BEST Nightlife Thailand`;
  const metaDescription = escapeHTML(shortDescription || tagline || `${product.name} — BEST Nightlife Thailand.`);

  const bannerHtml = previewBanner
    ? `<div class="pp-preview-banner">${escapeHTML(previewBanner)}</div>`
    : '';

  const heroHtml = `
    <section class="pp-hero">
      ${cover
        ? `<img class="pp-hero-img" src="${escapeHTML(cover.url)}" alt="${escapeHTML(cover.alt || product.name)}">`
        : `<div class="pp-hero-fallback-bg"></div>`}
      <div class="pp-hero-scrim"></div>
      <div class="pp-hero-content">
        <h1 class="pp-hero-title">${escapeHTML(product.name)}</h1>
        ${tagline ? `<p class="pp-hero-tagline">${escapeHTML(tagline)}</p>` : ''}
      </div>
    </section>`;

  const quickFactsHtml =
    quickFacts.length > 0
      ? `
    <section class="pp-quickfacts">
      <div class="pp-quickfacts-inner">
        ${quickFacts
          .map(
            (f) => `
          <div>
            <p class="pp-fact-label">${escapeHTML(f.label)}</p>
            <p class="pp-fact-value pp-fact-value--full">${escapeHTML(f.value)}</p>
            <p class="pp-fact-value pp-fact-value--compact">${escapeHTML(f.compact)}</p>
          </div>`
          )
          .join('')}
      </div>
    </section>`
      : '';

  const introHtml =
    shortDescription || fullDescription
      ? `
    <section class="pp-section pp-section--alt">
      <div class="pp-section-inner">
        ${shortDescription ? `<p class="pp-lede">${escapeHTML(shortDescription)}</p>` : ''}
        ${fullDescription ? `<p class="pp-body-copy">${escapeHTML(fullDescription)}</p>` : ''}
      </div>
    </section>`
      : '';

  const highlightsHtml =
    highlights.length > 0
      ? `
    <section class="pp-section">
      <div class="pp-section-inner">
        <p class="pp-eyebrow">Highlights</p>
        <h2 class="pp-headline">What makes this different.</h2>
        ${bulletList(highlights)}
      </div>
    </section>`
      : '';

  const includedHtml =
    whatsIncluded.length > 0
      ? `
    <section class="pp-section pp-section--alt">
      <div class="pp-section-inner">
        <p class="pp-eyebrow">The Night</p>
        <h2 class="pp-headline">What&rsquo;s included.</h2>
        ${includeCards(whatsIncluded)}
      </div>
    </section>`
      : '';

  const itineraryHtml =
    itinerary.length > 0
      ? `
    <section class="pp-section">
      <div class="pp-section-inner">
        <p class="pp-eyebrow">How The Night Goes</p>
        <h2 class="pp-headline">The flow.</h2>
        <div class="pp-timeline">
          ${itinerary
            .map(
              (step, i) => `
            <div class="pp-timeline-row">
              <div class="pp-timeline-marker">${i + 1}</div>
              <div class="pp-timeline-body">
                ${step.title ? `<p class="pp-timeline-title">${escapeHTML(step.title)}</p>` : ''}
                ${step.description ? `<p class="pp-timeline-desc">${escapeHTML(step.description)}</p>` : ''}
              </div>
            </div>`
            )
            .join('')}
        </div>
      </div>
    </section>`
      : '';

  let meetingPointHtml = '';
  if (meetingPoint && meetingPoint.visibility === 'public' && (meetingPoint.display_name || meetingPoint.address)) {
    const mapEmbedUrl = buildMapEmbedUrl(meetingPoint);
    meetingPointHtml = `
    <section class="pp-section pp-section--alt">
      <div class="pp-section-inner">
        <p class="pp-eyebrow">Meeting Point</p>
        ${
          mapEmbedUrl
            ? `<div class="pp-map-embed"><iframe title="${escapeHTML(
                meetingPoint.display_name || product.name
              )} location" src="${escapeHTML(mapEmbedUrl)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`
            : ''
        }
        <div class="pp-loc-card">
          <span class="pp-loc-card-icon" aria-hidden="true">&#128205;</span>
          <div>
            ${meetingPoint.display_name ? `<p class="pp-loc-name">${escapeHTML(meetingPoint.display_name)}</p>` : ''}
            ${meetingPoint.address ? `<p class="pp-loc-address">${escapeHTML(meetingPoint.address)}</p>` : ''}
            ${meetingPoint.instructions ? `<p class="pp-loc-instructions">${escapeHTML(meetingPoint.instructions)}</p>` : ''}
            ${
              meetingPoint.maps_url
                ? `<a class="pp-loc-link" href="${escapeHTML(meetingPoint.maps_url)}" target="_blank" rel="noreferrer">Open in Google Maps →</a>`
                : ''
            }
          </div>
        </div>
      </div>
    </section>`;
  } else if (meetingPoint && meetingPoint.visibility === 'after_booking') {
    // This object shape carries only { visibility: 'after_booking' } — no
    // address/maps_url/instructions field exists to reference here even by
    // mistake. Every word below is static, generic copy, never API data.
    meetingPointHtml = `
    <section class="pp-section pp-section--alt">
      <div class="pp-section-inner">
        <p class="pp-eyebrow">Meeting Point</p>
        <div class="pp-afterbooking-card">
          <div class="pp-afterbooking-icon">${AFTER_BOOKING_ICON}</div>
          <p class="pp-afterbooking-title">Meeting point shared after booking</p>
          <p class="pp-afterbooking-text">Exact venue and directions will be sent after purchase.</p>
        </div>
      </div>
    </section>`;
  }
  // visibility null / 'private' / unrecognized -> no section at all.

  const goodToKnowHtml =
    whatsNotIncluded.length > 0 || importantInfo.length > 0
      ? `
    <section class="pp-section">
      <div class="pp-section-inner">
        <p class="pp-eyebrow pp-eyebrow--standalone">Good To Know</p>
        <div class="pp-good-to-know">
          ${
            whatsNotIncluded.length > 0
              ? `<div><p class="pp-good-to-know-label">Not included</p>${notIncludedList(whatsNotIncluded)}</div>`
              : ''
          }
          ${
            importantInfo.length > 0
              ? `<div><p class="pp-good-to-know-label">Important info</p>${bulletList(importantInfo, { small: true })}</div>`
              : ''
          }
        </div>
      </div>
    </section>`
      : '';

  const galleryHtml =
    gallery.length > 0
      ? `
    <section class="pp-section pp-section--alt" style="padding-left:0; padding-right:0;">
      <div class="pp-section-inner" style="padding: 0 20px;">
        <p class="pp-eyebrow">Gallery</p>
      </div>
      <div class="pp-gallery-strip">
        ${gallery
          .map(
            (img) =>
              `<img class="pp-gallery-item" src="${escapeHTML(img.url)}" alt="${escapeHTML(img.alt || product.name)}">`
          )
          .join('')}
      </div>
    </section>`
      : '';

  const ctaHtml = booking.enabled
    ? `<a class="pp-btn-primary" href="${escapeHTML(booking.href)}">Book Now${priceLabel ? ` — ${priceLabel} per person` : ''}</a>`
    : `<div class="pp-btn-disabled">Booking opens soon</div>`;

  const stickyBarHtml = booking.enabled
    ? `
    <div class="pp-sticky-bar">
      ${
        priceLabel
          ? `<div class="pp-sticky-price"><span class="pp-sticky-price-amount">${priceLabel}</span><span class="pp-sticky-price-unit">/ PERSON</span></div>`
          : '<span></span>'
      }
      <a class="pp-sticky-cta" href="${escapeHTML(booking.href)}">Book Your Spot →</a>
    </div>`
    : `
    <div class="pp-sticky-bar pp-sticky-bar--disabled">
      <span class="pp-sticky-disabled-text">Booking opens soon</span>
    </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${title}</title>
  <meta name="description" content="${metaDescription}">
  <meta property="og:title" content="${escapeHTML(product.name)} | BEST Nightlife Thailand">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:type" content="website">
  ${pageUrl ? `<meta property="og:url" content="${escapeHTML(pageUrl)}">` : ''}
  ${cover ? `<meta property="og:image" content="${escapeHTML(cover.url)}">` : ''}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="/css/product-page.css">
</head>
<body class="pp-root">
  ${bannerHtml}
  <nav class="pp-nav" data-banner="${previewBanner ? 'true' : 'false'}">
    <a class="pp-nav-home" href="/">
      <img class="pp-nav-logo" src="/assets/logo/BEST Nightlife Thailand LOGO.png" alt="BEST Nightlife Thailand">
      <span class="pp-nav-name">${escapeHTML(product.name)}</span>
    </a>
  </nav>

  <main class="pp-main" data-nofixed="${previewBanner ? 'true' : 'false'}">
    ${heroHtml}
    ${quickFactsHtml}
    ${introHtml}
    ${highlightsHtml}
    ${includedHtml}
    ${itineraryHtml}
    ${meetingPointHtml}
    ${goodToKnowHtml}
    ${galleryHtml}

    <section class="pp-cta-section">
      ${ctaHtml}
    </section>

    <footer class="pp-footer">
      <p class="pp-footer-text">© 2026 BEST Nightlife Thailand · Sanctuary Nexus Co., Ltd. · Bangkok</p>
    </footer>
  </main>

  ${stickyBarHtml}
</body>
</html>`;
}

/**
 * Branded fallback page for 404 / upstream-error states — never the raw
 * Express default error page, never a distinguishable "draft vs missing"
 * signal (matches the canonical API's own fail-closed 404 contract).
 */
function renderProductFallbackPage({ title, message }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)} | BEST Nightlife Thailand</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="/css/product-page.css">
</head>
<body class="pp-root">
  <div class="pp-fallback">
    <h1 class="pp-fallback-title">${escapeHTML(title)}</h1>
    <p class="pp-fallback-text">${escapeHTML(message)}</p>
    <a class="pp-fallback-link" href="/">Back to BEST Nightlife Thailand</a>
  </div>
</body>
</html>`;
}

module.exports = { renderProductPage, renderProductFallbackPage };
