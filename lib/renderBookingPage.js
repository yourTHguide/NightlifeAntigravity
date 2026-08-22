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
 * cross-product discovery browser when no ?night is given.
 *
 * UX (approved mock-up): arriving with ?night=<slug> renders straight into
 * the one-page booking form — no "what are you booking?" re-ask, since we
 * already know. A product with exactly one upcoming occurrence skips the
 * date picker entirely and gets a "one night only" framing instead of a
 * single, pointless date button.
 *
 * Ticket type reads from an optional `ticketOptions` array on each event
 * (see server.js's shapeBntEvent + fixtures/bookingFixtures.js). That field
 * does not exist on the canonical feed today — it's a presentation-only
 * hook so this UI can be proven out now and wired to real canonical ticket
 * tiers later without a rewrite. When it's absent (every real event today),
 * this renders a single implicit option and shows no selector at all,
 * rather than forcing a meaningless choice.
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

    <section class="bp-section bp-discover" id="bp-discover" hidden>
      <p class="bp-eyebrow">Upcoming</p>
      <div class="bp-event-card-grid" id="bp-event-card-grid"></div>
    </section>

    <section class="bp-section bp-booking" id="bp-booking" hidden>
      <p class="bp-eyebrow">Step 1 of 1</p>
      <h1 class="bp-headline" id="bp-product-name">&nbsp;</h1>
      <p class="bp-subtitle" id="bp-product-subtitle" hidden></p>

      <div class="bp-field" id="bp-date-field" hidden>
        <p class="bp-field-label">Choose a date</p>
        <div class="bp-date-grid" id="bp-date-grid"></div>
      </div>

      <div class="bp-one-night" id="bp-one-night" hidden>
        <p class="bp-one-night-eyebrow">One Night Only</p>
        <p class="bp-one-night-text">A signature night that happens once. Be there for it.</p>
      </div>

      <div class="bp-summary-row" id="bp-summary-row" hidden>
        <div class="bp-field">
          <p class="bp-field-label">Date</p>
          <p class="bp-field-value" id="bp-date-value">&mdash;</p>
        </div>
        <div class="bp-field">
          <p class="bp-field-label">Start time</p>
          <p class="bp-field-value" id="bp-time-value">&mdash;</p>
        </div>
        <div class="bp-field">
          <p class="bp-field-label">Price</p>
          <p class="bp-field-value" id="bp-price-value">&mdash;</p>
        </div>
      </div>

      <div class="bp-field" id="bp-ticket-field" hidden>
        <p class="bp-field-label">Ticket type</p>
        <div class="bp-ticket-grid" id="bp-ticket-grid"></div>
      </div>

      <div class="bp-field">
        <p class="bp-field-label">Guests</p>
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
      discover: document.getElementById('bp-discover'),
      eventCardGrid: document.getElementById('bp-event-card-grid'),
      booking: document.getElementById('bp-booking'),
      productName: document.getElementById('bp-product-name'),
      productSubtitle: document.getElementById('bp-product-subtitle'),
      dateField: document.getElementById('bp-date-field'),
      dateGrid: document.getElementById('bp-date-grid'),
      oneNight: document.getElementById('bp-one-night'),
      summaryRow: document.getElementById('bp-summary-row'),
      dateValue: document.getElementById('bp-date-value'),
      timeValue: document.getElementById('bp-time-value'),
      priceValue: document.getElementById('bp-price-value'),
      ticketField: document.getElementById('bp-ticket-field'),
      ticketGrid: document.getElementById('bp-ticket-grid'),
      qtyValue: document.getElementById('bp-qty-value'),
      qtyMinus: document.getElementById('bp-qty-minus'),
      qtyPlus: document.getElementById('bp-qty-plus'),
      totalValue: document.getElementById('bp-total-value'),
      stickyBar: document.getElementById('bp-sticky-bar'),
      stickyTotal: document.getElementById('bp-sticky-total'),
    };

    var state = { events: [], selectedEventId: null, selectedTicketId: null, qty: 1 };

    function baht(n) {
      if (n === null || n === undefined || isNaN(n)) return '\\u2014';
      return '\\u0e3f' + Number(n).toLocaleString();
    }

    function hhmm(t) {
      if (!t) return '\\u2014';
      return String(t).slice(0, 5);
    }

    // Compact recap format: "5 Sep" — no weekday, no year (fast scanning,
    // per the approved mock-up; the full date already reads clearly off
    // the selected date card / one-night panel above it).
    function formatDateCompact(iso) {
      var d = new Date(iso + 'T00:00:00');
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }

    function dateParts(iso) {
      var d = new Date(iso + 'T00:00:00');
      if (isNaN(d.getTime())) return { month: '', day: iso, weekday: '' };
      return {
        month: d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
        day: d.toLocaleDateString('en-GB', { day: '2-digit' }),
        weekday: d.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase(),
      };
    }

    function show(el) { if (el) el.hidden = false; }
    function hide(el) { if (el) el.hidden = true; }

    function showEmpty(title, text) {
      hide(els.loading);
      hide(els.discover);
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

    // Architected for a future canonical multi-tier ticket schema (Early
    // Bird / General Admission / VIP). Every occurrence today carries
    // exactly one effectivePrice UNLESS the (preview-fixture-only)
    // ticketOptions field is present — real canonical events never send
    // it, so this always falls back to a single implicit option for them.
    function ticketOptionsFor(ev) {
      if (!ev) return [];
      if (Array.isArray(ev.ticketOptions) && ev.ticketOptions.length > 0) return ev.ticketOptions;
      return [{ id: 'implicit', label: 'General Admission', price: ev.effectivePrice }];
    }

    function lowestPriceFor(ev) {
      var options = ticketOptionsFor(ev);
      var prices = options.map(function (o) { return o.price; }).filter(function (p) { return typeof p === 'number'; });
      return prices.length ? Math.min.apply(null, prices) : ev.effectivePrice;
    }

    function currentEvent() {
      for (var i = 0; i < state.events.length; i++) {
        if (state.events[i].eventId === state.selectedEventId) return state.events[i];
      }
      return null;
    }

    function currentTicket(ev, options) {
      for (var i = 0; i < options.length; i++) {
        if (options[i].id === state.selectedTicketId) return options[i];
      }
      return options[0];
    }

    // Rebuilds the ticket-type list for the given event. Called once per
    // date selection (not per click) — selectTicket() below only toggles
    // classes and recalculates totals, it never rebuilds this grid.
    function renderTicketOptions(ev) {
      var options = ticketOptionsFor(ev);
      els.ticketGrid.innerHTML = '';
      state.selectedTicketId = options[0] ? options[0].id : null;

      if (options.length <= 1) {
        hide(els.ticketField);
        return;
      }

      options.forEach(function (opt, i) {
        var row = document.createElement('div');
        row.className = 'bp-ticket-option' + (i === 0 ? ' is-selected' : '');
        row.setAttribute('data-ticket-id', opt.id);
        row.setAttribute('role', 'radio');
        row.setAttribute('aria-checked', i === 0 ? 'true' : 'false');

        var radio = document.createElement('span');
        radio.className = 'bp-ticket-radio';
        radio.setAttribute('aria-hidden', 'true');

        var info = document.createElement('span');
        info.className = 'bp-ticket-info';
        var label = document.createElement('span');
        label.className = 'bp-ticket-label';
        label.textContent = opt.label;
        info.appendChild(label);
        if (opt.sublabel) {
          var sub = document.createElement('span');
          sub.className = 'bp-ticket-sublabel';
          sub.textContent = opt.sublabel;
          info.appendChild(sub);
        }

        var price = document.createElement('span');
        price.className = 'bp-ticket-price';
        price.textContent = baht(opt.price);

        row.appendChild(radio);
        row.appendChild(info);
        row.appendChild(price);
        row.addEventListener('click', function () { selectTicket(opt.id); });
        els.ticketGrid.appendChild(row);
      });

      show(els.ticketField);
    }

    function selectTicket(ticketId) {
      state.selectedTicketId = ticketId;
      var rows = els.ticketGrid.querySelectorAll('.bp-ticket-option');
      for (var i = 0; i < rows.length; i++) {
        var isSelected = rows[i].getAttribute('data-ticket-id') === ticketId;
        rows[i].classList.toggle('is-selected', isSelected);
        rows[i].setAttribute('aria-checked', isSelected ? 'true' : 'false');
      }
      updateTotals();
    }

    function updateTotals() {
      var ev = currentEvent();
      if (!ev) return;

      var options = ticketOptionsFor(ev);
      var ticket = currentTicket(ev, options);

      els.dateValue.textContent = formatDateCompact(ev.eventDate);
      els.timeValue.textContent = hhmm(ev.effectiveStartTime);
      els.priceValue.textContent = baht(ticket.price);

      els.qtyValue.textContent = String(state.qty);
      els.qtyMinus.disabled = state.qty <= 1;
      els.qtyPlus.disabled = state.qty >= MAX_QTY;

      var total = (typeof ticket.price === 'number' ? ticket.price : 0) * state.qty;
      els.totalValue.textContent = baht(total);
      els.stickyTotal.textContent = baht(total);
      els.booking.setAttribute('data-selected-event-id', ev.eventId);
      els.booking.setAttribute('data-selected-ticket-id', ticket.id);
    }

    function selectEvent(eventId) {
      state.selectedEventId = eventId;
      var cards = els.dateGrid.querySelectorAll('.bp-date-card');
      for (var i = 0; i < cards.length; i++) {
        var isSelected = cards[i].getAttribute('data-event-id') === eventId;
        cards[i].classList.toggle('is-selected', isSelected);
        cards[i].setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      }
      renderTicketOptions(currentEvent());
      show(els.summaryRow);
      updateTotals();
    }

    function renderBooking(events) {
      hide(els.loading);
      hide(els.empty);
      hide(els.discover);

      var sorted = events.slice().sort(function (a, b) { return a.eventDate < b.eventDate ? -1 : 1; });
      state.events = sorted;
      state.qty = 1;
      els.productName.textContent = sorted[0].productName || NIGHT;

      // Subtitle: preview-fixture-only today (see server.js's shapeBntEvent)
      // — simply stays hidden when the API doesn't send one, rather than
      // inventing copy.
      if (sorted[0].productSubtitle) {
        els.productSubtitle.textContent = sorted[0].productSubtitle;
        show(els.productSubtitle);
      } else {
        hide(els.productSubtitle);
      }

      els.dateGrid.innerHTML = '';
      if (sorted.length === 1) {
        // Exactly one upcoming occurrence: there is nothing to "choose" —
        // asking the guest to pick a date from a list of one reads as a
        // system limitation. Frame it as intentional instead.
        hide(els.dateField);
        show(els.oneNight);
      } else {
        hide(els.oneNight);
        sorted.forEach(function (e) {
          var parts = dateParts(e.eventDate);
          var card = document.createElement('button');
          card.type = 'button';
          card.className = 'bp-date-card';
          card.setAttribute('data-event-id', e.eventId);
          card.setAttribute('aria-pressed', 'false');
          var monthEl = document.createElement('span');
          monthEl.className = 'bp-date-card-month';
          monthEl.textContent = parts.month;
          var dayEl = document.createElement('span');
          dayEl.className = 'bp-date-card-day';
          dayEl.textContent = parts.day;
          var weekdayEl = document.createElement('span');
          weekdayEl.className = 'bp-date-card-weekday';
          weekdayEl.textContent = parts.weekday;
          card.appendChild(monthEl);
          card.appendChild(dayEl);
          card.appendChild(weekdayEl);
          card.addEventListener('click', function (evt) {
            selectEvent(evt.currentTarget.getAttribute('data-event-id'));
          });
          els.dateGrid.appendChild(card);
        });
        show(els.dateField);
      }

      selectEvent(sorted[0].eventId);
      show(els.booking);
      show(els.stickyBar);
    }

    function renderDiscover(events) {
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

      els.eventCardGrid.innerHTML = '';
      order.forEach(function (slug) {
        var e = byProduct[slug];
        var parts = dateParts(e.eventDate);

        var card = document.createElement('a');
        card.className = 'bp-event-card';
        card.href = bookHref(slug);
        if (e.heroImage) card.style.backgroundImage = 'url(' + encodeURI(String(e.heroImage)) + ')';

        var badge = document.createElement('div');
        badge.className = 'bp-event-card-badge';
        var badgeMonth = document.createElement('span');
        badgeMonth.textContent = parts.month;
        var badgeDay = document.createElement('span');
        badgeDay.textContent = parts.day;
        badge.appendChild(badgeMonth);
        badge.appendChild(badgeDay);

        var overlay = document.createElement('div');
        overlay.className = 'bp-event-card-overlay';
        var nameEl = document.createElement('p');
        nameEl.className = 'bp-event-card-name';
        nameEl.textContent = e.productName || slug;
        overlay.appendChild(nameEl);
        if (e.productSubtitle) {
          var subEl = document.createElement('p');
          subEl.className = 'bp-event-card-subtitle';
          subEl.textContent = e.productSubtitle;
          overlay.appendChild(subEl);
        }
        var priceEl = document.createElement('p');
        priceEl.className = 'bp-event-card-price';
        priceEl.textContent = 'From ' + baht(lowestPriceFor(e));
        overlay.appendChild(priceEl);

        card.appendChild(badge);
        card.appendChild(overlay);
        els.eventCardGrid.appendChild(card);
      });

      show(els.discover);
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
            renderDiscover(events);
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
