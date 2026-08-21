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

function formatEventDate(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
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
  const dateLabel = nextEvent ? formatEventDate(nextEvent.eventDate) : null;

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
  if (dateLabel) quickFacts.push({ label: 'Next Date', value: dateLabel });
  if (timeLabel) quickFacts.push({ label: 'Start Time', value: timeLabel });
  if (durLabel) quickFacts.push({ label: 'Duration', value: durLabel });
  if (priceLabel) quickFacts.push({ label: 'Price', value: `${priceLabel} / person` });

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
            <p class="pp-fact-value">${escapeHTML(f.value)}</p>
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
        ${bulletList(whatsIncluded)}
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
    meetingPointHtml = `
    <section class="pp-section pp-section--alt">
      <div class="pp-section-inner">
        <p class="pp-eyebrow">Meeting Point</p>
        ${meetingPoint.display_name ? `<p class="pp-meeting-name">${escapeHTML(meetingPoint.display_name)}</p>` : ''}
        ${meetingPoint.address ? `<p class="pp-meeting-address">${escapeHTML(meetingPoint.address)}</p>` : ''}
        ${meetingPoint.maps_url ? `<a class="pp-meeting-link" href="${escapeHTML(meetingPoint.maps_url)}" target="_blank" rel="noreferrer">View on map →</a>` : ''}
        ${meetingPoint.instructions ? `<p class="pp-meeting-instructions">${escapeHTML(meetingPoint.instructions)}</p>` : ''}
      </div>
    </section>`;
  } else if (meetingPoint && meetingPoint.visibility === 'after_booking') {
    meetingPointHtml = `
    <section class="pp-section pp-section--alt">
      <div class="pp-section-inner">
        <p class="pp-eyebrow">Meeting Point</p>
        <p class="pp-meeting-afterbooking">Meeting point shared after booking.</p>
      </div>
    </section>`;
  }
  // visibility null / 'private' / unrecognized -> no section at all.

  const goodToKnowHtml =
    whatsNotIncluded.length > 0 || importantInfo.length > 0
      ? `
    <section class="pp-section">
      <div class="pp-section-inner">
        <p class="pp-eyebrow">Good To Know</p>
        <div class="pp-good-to-know">
          ${
            whatsNotIncluded.length > 0
              ? `<div><p class="pp-good-to-know-label">Not included</p>${bulletList(whatsNotIncluded, { small: true })}</div>`
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
