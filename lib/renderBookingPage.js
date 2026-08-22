'use strict';

/**
 * Generic BEST Nightlife Thailand booking page renderer — Phase 4 Stage C.
 *
 * Renders the page shell only. All availability data is fetched
 * client-side from the local GET /api/events proxy (never the canonical
 * bcc-claude API directly, never Supabase) — this keeps the rule "the
 * browser calls only the local BNT /api/events" literally true. No
 * product-specific logic lives here: the same shell serves any BNT
 * product's booking flow via ?night=<product-slug>, or a generic
 * cross-product selector when no ?night is given.
 *
 * The booking CTA is present but structurally non-clickable (a plain <div>,
 * not a <button>/<a>) — Stripe checkout is Stage D, not this stage. No
 * script here ever calls /api/create-checkout or any legacy checkout route.
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

// Safe to embed a JS value inside an inline <script> block: JSON.stringify
// already quotes/escapes for JS string syntax, but a literal "</script>"
// inside the *value* (e.g. a mischievous ?night= query param) would still
// close the surrounding tag when parsed as HTML. Escaping "<" neutralizes
// that without affecting JSON.parse-ability on the JS side (JSON doesn't
// require "<" to be escaped, so < round-trips transparently).
function safeJsonForScript(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function renderBookingPage({ night = '', previewKey = null, previewBanner = null, pageUrl = '' } = {}) {
  const bannerHtml = previewBanner
    ? `<div class="bp-preview-banner">${escapeHTML(previewBanner)}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Book Your Night | BEST Nightlife Thailand</title>
  <meta name="description" content="Book your spot for a BEST Nightlife Thailand experience — pick a date, choose your quantity, and see your total instantly.">
  ${pageUrl ? `<meta property="og:url" content="${escapeHTML(pageUrl)}">` : ''}
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="/css/booking-page.css">
</head>
<body class="bp-root">
  ${bannerHtml}
  <nav class="bp-nav" data-banner="${previewBanner ? 'true' : 'false'}">
    <a class="bp-nav-home" href="/">
      <img class="bp-nav-logo" src="/assets/logo/BEST Nightlife Thailand LOGO.png" alt="BEST Nightlife Thailand">
      <span class="bp-nav-name">Book Your Night</span>
    </a>
  </nav>

  <main class="bp-main" data-nofixed="${previewBanner ? 'true' : 'false'}">
    <div class="bp-loading" id="bp-loading">
      <p class="bp-loading-text">Loading availability&hellip;</p>
    </div>

    <div class="bp-empty" id="bp-empty" hidden>
      <h1 class="bp-empty-title" id="bp-empty-title">No dates available</h1>
      <p class="bp-empty-text" id="bp-empty-text">Check back soon.</p>
      <a class="bp-empty-link" href="/">&larr; Back to BEST Nightlife Thailand</a>
    </div>

    <section class="bp-section bp-selector" id="bp-selector" hidden>
      <p class="bp-eyebrow">Choose Your Night</p>
      <h1 class="bp-headline">What are you booking?</h1>
      <div class="bp-selector-grid" id="bp-selector-grid"></div>
    </section>

    <section class="bp-section bp-booking" id="bp-booking" hidden>
      <p class="bp-eyebrow">Booking</p>
      <h1 class="bp-headline" id="bp-product-name">&nbsp;</h1>

      <div class="bp-field">
        <p class="bp-field-label">Select a date</p>
        <div class="bp-date-grid" id="bp-date-grid"></div>
      </div>

      <div class="bp-summary-row">
        <div class="bp-field">
          <p class="bp-field-label">Start time</p>
          <p class="bp-field-value" id="bp-time-value">&mdash;</p>
        </div>
        <div class="bp-field">
          <p class="bp-field-label">Price</p>
          <p class="bp-field-value" id="bp-price-value">&mdash;</p>
        </div>
      </div>

      <div class="bp-field">
        <p class="bp-field-label">Quantity</p>
        <div class="bp-qty-stepper">
          <button type="button" class="bp-qty-btn" id="bp-qty-minus" aria-label="Decrease quantity">&minus;</button>
          <span class="bp-qty-value" id="bp-qty-value">1</span>
          <button type="button" class="bp-qty-btn" id="bp-qty-plus" aria-label="Increase quantity">+</button>
        </div>
      </div>

      <div class="bp-total-row">
        <span class="bp-total-label">Total</span>
        <span class="bp-total-value" id="bp-total-value">&mdash;</span>
      </div>

      <div class="bp-cta" id="bp-cta">CONTINUE TO BOOKING</div>
      <p class="bp-cta-note">Secure checkout arrives in the next release &mdash; nothing is charged yet.</p>
    </section>

    <footer class="bp-footer">
      <p class="bp-footer-text">&copy; 2026 BEST Nightlife Thailand &middot; Sanctuary Nexus Co., Ltd. &middot; Bangkok</p>
    </footer>
  </main>

  <div class="bp-sticky-bar bp-sticky-bar--disabled" id="bp-sticky-bar" hidden>
    <span class="bp-sticky-price" id="bp-sticky-total">&mdash;</span>
    <div class="bp-sticky-cta">Continue &rarr;</div>
  </div>

  <script>
  (function () {
    var NIGHT = ${safeJsonForScript(night || '')};
    var PREVIEW = ${safeJsonForScript(previewKey || '')};
    var MAX_QTY = 10;

    var els = {
      loading: document.getElementById('bp-loading'),
      empty: document.getElementById('bp-empty'),
      emptyTitle: document.getElementById('bp-empty-title'),
      emptyText: document.getElementById('bp-empty-text'),
      selector: document.getElementById('bp-selector'),
      selectorGrid: document.getElementById('bp-selector-grid'),
      booking: document.getElementById('bp-booking'),
      productName: document.getElementById('bp-product-name'),
      dateGrid: document.getElementById('bp-date-grid'),
      timeValue: document.getElementById('bp-time-value'),
      priceValue: document.getElementById('bp-price-value'),
      qtyValue: document.getElementById('bp-qty-value'),
      qtyMinus: document.getElementById('bp-qty-minus'),
      qtyPlus: document.getElementById('bp-qty-plus'),
      totalValue: document.getElementById('bp-total-value'),
      stickyBar: document.getElementById('bp-sticky-bar'),
      stickyTotal: document.getElementById('bp-sticky-total'),
    };

    var state = { events: [], selectedEventId: null, qty: 1 };

    function baht(n) {
      if (n === null || n === undefined || isNaN(n)) return '\\u2014';
      return '\\u0e3f' + Number(n).toLocaleString();
    }

    function hhmm(t) {
      if (!t) return '\\u2014';
      return String(t).slice(0, 5);
    }

    function formatDate(iso) {
      var d = new Date(iso + 'T00:00:00');
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    }

    function show(el) { if (el) el.hidden = false; }
    function hide(el) { if (el) el.hidden = true; }

    function showEmpty(title, text) {
      hide(els.loading);
      hide(els.selector);
      hide(els.booking);
      hide(els.stickyBar);
      els.emptyTitle.textContent = title;
      els.emptyText.textContent = text;
      show(els.empty);
    }

    function bookHref(slug) {
      var qs = 'night=' + encodeURIComponent(slug);
      if (PREVIEW) qs += '&preview=' + encodeURIComponent(PREVIEW);
      return '/book?' + qs;
    }

    function renderSelector(events) {
      hide(els.loading);
      hide(els.empty);
      hide(els.booking);
      hide(els.stickyBar);

      var sorted = events.slice().sort(function (a, b) { return a.eventDate < b.eventDate ? -1 : 1; });
      var byProduct = {};
      var order = [];
      sorted.forEach(function (e) {
        if (!byProduct[e.productSlug]) {
          byProduct[e.productSlug] = e;
          order.push(e.productSlug);
        }
      });

      if (order.length === 0) {
        showEmpty('No experiences available to book', 'Check back soon \\u2014 new dates open regularly.');
        return;
      }

      els.selectorGrid.innerHTML = '';
      order.forEach(function (slug) {
        var e = byProduct[slug];
        var card = document.createElement('a');
        card.className = 'bp-selector-card';
        card.href = bookHref(slug);
        var nameEl = document.createElement('p');
        nameEl.className = 'bp-selector-card-name';
        nameEl.textContent = e.productName || slug;
        var metaEl = document.createElement('p');
        metaEl.className = 'bp-selector-card-meta';
        metaEl.textContent = formatDate(e.eventDate) + ' \\u00b7 ' + baht(e.effectivePrice);
        card.appendChild(nameEl);
        card.appendChild(metaEl);
        els.selectorGrid.appendChild(card);
      });

      show(els.selector);
    }

    function updateTotals() {
      var ev = null;
      for (var i = 0; i < state.events.length; i++) {
        if (state.events[i].eventId === state.selectedEventId) { ev = state.events[i]; break; }
      }
      if (!ev) return;

      els.timeValue.textContent = hhmm(ev.effectiveStartTime);
      els.priceValue.textContent = baht(ev.effectivePrice) + ' / person';
      els.qtyValue.textContent = String(state.qty);
      els.qtyMinus.disabled = state.qty <= 1;
      els.qtyPlus.disabled = state.qty >= MAX_QTY;

      var total = (typeof ev.effectivePrice === 'number' ? ev.effectivePrice : 0) * state.qty;
      els.totalValue.textContent = baht(total);
      els.stickyTotal.textContent = baht(total);
      els.booking.setAttribute('data-selected-event-id', ev.eventId);
    }

    function selectEvent(eventId) {
      state.selectedEventId = eventId;
      var chips = els.dateGrid.querySelectorAll('.bp-date-chip');
      for (var i = 0; i < chips.length; i++) {
        var isSelected = chips[i].getAttribute('data-event-id') === eventId;
        chips[i].classList.toggle('is-selected', isSelected);
        chips[i].setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      }
      updateTotals();
    }

    function renderBooking(events) {
      hide(els.loading);
      hide(els.empty);
      hide(els.selector);

      var sorted = events.slice().sort(function (a, b) { return a.eventDate < b.eventDate ? -1 : 1; });
      state.events = sorted;
      state.qty = 1;
      els.productName.textContent = sorted[0].productName || NIGHT;

      els.dateGrid.innerHTML = '';
      sorted.forEach(function (e) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'bp-date-chip';
        chip.setAttribute('data-event-id', e.eventId);
        chip.setAttribute('aria-pressed', 'false');
        chip.textContent = formatDate(e.eventDate);
        chip.addEventListener('click', function (evt) {
          selectEvent(evt.currentTarget.getAttribute('data-event-id'));
        });
        els.dateGrid.appendChild(chip);
      });

      selectEvent(sorted[0].eventId);
      show(els.booking);
      show(els.stickyBar);
    }

    function loadEvents() {
      var url = '/api/events' + (PREVIEW ? '?preview=' + encodeURIComponent(PREVIEW) : '');
      fetch(url, { headers: { accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (body) {
          var events = (body && Array.isArray(body.events)) ? body.events : [];
          if (NIGHT) {
            var matching = events.filter(function (e) { return e.productSlug === NIGHT; });
            if (matching.length === 0) {
              showEmpty(
                'No upcoming dates for this experience',
                'This event may be fully booked, not yet open, or no longer available. Explore our other experiences instead.'
              );
              return;
            }
            renderBooking(matching);
          } else {
            renderSelector(events);
          }
        })
        .catch(function () {
          showEmpty('We couldn\\u2019t load availability', 'Please try again in a moment.');
        });
    }

    els.qtyMinus.addEventListener('click', function () {
      if (state.qty > 1) { state.qty -= 1; updateTotals(); }
    });
    els.qtyPlus.addEventListener('click', function () {
      if (state.qty < MAX_QTY) { state.qty += 1; updateTotals(); }
    });

    loadEvents();
  })();
  </script>
</body>
</html>`;
}

module.exports = { renderBookingPage };
