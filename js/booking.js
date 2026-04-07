/**
 * 🎫 Bangkok Club Crawl — Booking Logic
 * Handles standalone booking wizard on /book
 */

// ═══════════════════════════════════════════════════
//  GLOBAL: URL Parameter Tracking & Supabase Auth
// ═══════════════════════════════════════════════════
const URL_PARAMS = new URLSearchParams(window.location.search);
const TRACKED_SOURCE = URL_PARAMS.get('source') || null;
const TRACKED_NIGHT = URL_PARAMS.get('night') || null; // Kept but now unused for Step 1 picking, can be used for logging

const SUPABASE_URL = 'https://csltowtyzjknulqmgnku.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzbHRvd3R5emprbnVscW1nbmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODAyNzgsImV4cCI6MjA4NTk1NjI3OH0.0ryyMBhmHcBicdE1Cegn_6roISv9paOX0xSFDaZwLvU';
let sbClient = null;

// 🛡️ Security: XSS Prevention Helper
function escHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
}

// Initialize immediately since the script is at the bottom of the body
console.log('booking.js loaded! Initializing wizard...');
if (window.supabase && window.supabase.createClient) {
    sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized as sbClient');
} else {
    console.warn('Supabase JS not found in window');
}

try {
    initBookingWizard();
} catch (e) {
    console.error('Error in initBookingWizard:', e);
}

// ═══════════════════════════════════════════════════
//  🧙‍♂️ BOOKING WIZARD INITIALIZATION
// ═══════════════════════════════════════════════════
function initBookingWizard() {
    console.log('initBookingWizard called');
    const wizardContainer = document.getElementById('booking-wizard');
    if (!wizardContainer) {
        console.error('CRITICAL: #booking-wizard not found in DOM!');
        return;
    }

    console.log('Wizard initialized on standalone page.');

    // Wizard Navigation State
    let currentStep = 1;
    const steps = wizardContainer.querySelectorAll('.wizard-step');
    const nextBtns = wizardContainer.querySelectorAll('.next-step');
    const prevBtns = wizardContainer.querySelectorAll('.prev-step');

    const showStep = (stepNum) => {
        steps.forEach((step, index) => {
            step.style.display = (index + 1 === stepNum) ? 'block' : 'none';
        });
        currentStep = stepNum;
        if (stepNum === 2) initGuestBlocks();
        if (stepNum === 3) updateSummary();

        // Scroll to top of card on step change for mobile
        const card = document.querySelector('.booking-card');
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    nextBtns.forEach(btn => {
        btn.onclick = () => {
            if (validateStep(currentStep)) {
                showStep(currentStep + 1);
            }
        };
    });

    prevBtns.forEach(btn => {
        btn.onclick = () => {
            showStep(currentStep - 1);
        };
    });

    // 📅 Step 1: Calendar System (Fetched from server API)
    let currentCalMonth = new Date().getMonth();
    let currentCalYear = new Date().getFullYear();
    let availableDates = [];

    async function fetchAvailableDates() {
        const wrapper = document.getElementById('calendar-wrapper');
        wrapper.innerHTML = '<div style="text-align: center; padding: 2rem; color: #FF2D95;">Loading available dates...</div>';

        try {
            const res = await fetch('/api/available-dates');
            if (!res.ok) throw new Error('Server returned ' + res.status);
            const json = await res.json();
            availableDates = json.dates || [];
            console.log('📅 Available dates loaded:', availableDates.length);
            renderCalendar();
        } catch (err) {
            console.error('Failed to fetch available dates:', err);
            wrapper.innerHTML = '<div style="text-align: center; padding: 2rem; color: #fb7185;">Failed to load calendar. Please refresh.</div>';
        }
    }

    function renderCalendar() {
        const wrapper = document.getElementById('calendar-wrapper');

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let monthOptions = monthNames.map((m, i) => `<option value="${i}" ${i === currentCalMonth ? 'selected' : ''}>${m}</option>`).join('');
        let yearOptions = [2026, 2027].map(y => `<option value="${y}" ${y === currentCalYear ? 'selected' : ''}>${y}</option>`).join('');

        let html = `
            <div class="calendar-container">
                <div class="calendar-header">
                    <select class="calendar-select" id="cal-month-select">${monthOptions}</select>
                    <select class="calendar-select" id="cal-year-select">${yearOptions}</select>
                </div>
                <div class="calendar-grid">
                    <div class="calendar-day-label">S</div><div class="calendar-day-label">M</div><div class="calendar-day-label">T</div><div class="calendar-day-label">W</div><div class="calendar-day-label">T</div><div class="calendar-day-label">F</div><div class="calendar-day-label">S</div>`;

        const firstDay = new Date(currentCalYear, currentCalMonth, 1).getDay();
        const daysInMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();

        // Use user's local timezone for matching 'isPast' strictly by visual date
        const todayObj = new Date();
        todayObj.setHours(0, 0, 0, 0);

        for (let i = 0; i < firstDay; i++) {
            html += `<div class="calendar-day disabled"></div>`;
        }
        for (let d = 1; d <= daysInMonth; d++) {
            // Reconstruct ISO date to match Supabase response format (YYYY-MM-DD)
            const mm = String(currentCalMonth + 1).padStart(2, '0');
            const dd = String(d).padStart(2, '0');
            const dateStrIso = `${currentCalYear}-${mm}-${dd}`;

            const dateObj = new Date(currentCalYear, currentCalMonth, d);
            const isPast = dateObj < todayObj;

            // Check if explicitly open
            const isAvailable = availableDates.includes(dateStrIso) && !isPast;

            if (isAvailable) {
                const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                const isSelected = document.getElementById('selected-date').value === dateStrIso;
                html += `<div class="calendar-day available ${isSelected ? 'selected' : ''}" data-date="${dateStrIso}" data-date-gb="${dateStr}">${d}</div>`;
            } else {
                html += `<div class="calendar-day disabled">${d}</div>`;
            }
        }
        html += `</div></div>`;
        wrapper.innerHTML = html;

        document.getElementById('cal-month-select').onchange = (e) => {
            currentCalMonth = parseInt(e.target.value);
            renderCalendar();
        };
        document.getElementById('cal-year-select').onchange = (e) => {
            currentCalYear = parseInt(e.target.value);
            renderCalendar();
        };

        wrapper.querySelectorAll('.calendar-day.available').forEach(day => {
            day.onclick = () => {
                wrapper.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                day.classList.add('selected');
                document.getElementById('selected-date').value = day.dataset.date;
                wizardContainer.querySelector('#step-1 .next-step').disabled = false;

                // When picking a date, if user goes back, make sure pricing recalculates
                updateGuestBlockPrices();
            };
        });
    }

    // Initialize: show Step 1 and fetch dates
    showStep(1);
    fetchAvailableDates();

    // 👥 Step 2: Guest Blocks Logic
    function initGuestBlocks() {
        const container = document.getElementById('guest-blocks-container');
        const addBtn = document.getElementById('add-guest-btn');
        const whatsappInput = document.getElementById('guest-whatsapp');

        if (container.children.length === 0) {
            addGuestBlock('female', 1);
        } else {
            updateGuestBlockPrices();
        }

        // Only attach onclick if not already attached
        if (!addBtn.hasAttribute('data-bound')) {
            addBtn.onclick = () => addGuestBlock('male', 1);
            whatsappInput.oninput = (e) => {
                e.target.value = e.target.value.replace(/[^0-9\s-+\(\)]/g, '');
            };
            addBtn.setAttribute('data-bound', 'true');
        }
    }

    function isThursdaySelected() {
        const selectedDate = document.getElementById('selected-date').value;
        if (!selectedDate) return false;
        try {
            const dateObj = new Date(selectedDate);
            return dateObj.getDay() === 4; // 0 = Sun ... 4 = Thu
        } catch { return false; }
    }

    function addGuestBlock(gender = 'male', count = 1) {
        const container = document.getElementById('guest-blocks-container');
        const isThursday = isThursdaySelected();
        const malePrice = isThursday ? '1,200' : '1,500';
        const femalePrice = isThursday ? '1,000' : '1,200';

        const block = document.createElement('div');
        block.className = 'guest-block';
        block.innerHTML = `
            <select class="guest-gender-select" style="flex: 2; padding: var(--space-sm); background: var(--color-dark-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-white);">
                <option value="male" ${gender === 'male' ? 'selected' : ''}>Male (฿${malePrice})</option>
                <option value="female" ${gender === 'female' ? 'selected' : ''}>Female (฿${femalePrice})</option>
            </select>
            <input type="number" class="guest-count-input" value="${count}" min="1" max="10" style="width: 60px; padding: var(--space-sm); background: var(--color-dark-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-white);">
            <button type="button" class="remove-guest-btn">&times;</button>
        `;

        block.querySelector('.remove-guest-btn').onclick = () => {
            if (container.children.length > 1) {
                block.remove();
                updateSummary();
            }
        };

        // Trigger summary update on change
        block.querySelectorAll('select, input').forEach(el => {
            el.onchange = updateSummary;
        });

        container.appendChild(block);
    }

    function updateGuestBlockPrices() {
        const isThursday = isThursdaySelected();
        const malePrice = isThursday ? '1,200' : '1,500';
        const femalePrice = isThursday ? '1,000' : '1,200';

        const selects = wizardContainer.querySelectorAll('.guest-gender-select');
        selects.forEach(select => {
            const options = select.querySelectorAll('option');
            options.forEach(opt => {
                if (opt.value === 'male') opt.textContent = `Male (฿${malePrice})`;
                if (opt.value === 'female') opt.textContent = `Female (฿${femalePrice})`;
            });
        });
    }

    // 📋 Step 3: Summary & Promo
    let appliedPromo = null;

    function updateSummary() {
        const dateInput = document.getElementById('selected-date');
        const selectedDateStrIso = dateInput ? dateInput.value : '';
        const dateDisplay = selectedDateStrIso ? new Date(selectedDateStrIso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD';

        const blocks = document.querySelectorAll('.guest-block');
        let subtotal = 0;
        let guestSummaryParts = [];

        blocks.forEach(block => {
            const gender = block.querySelector('.guest-gender-select').value;
            const count = parseInt(block.querySelector('.guest-count-input').value) || 0;
            if (count > 0) {
                // Determine day value for calculatePrice function ('4' for thursday)
                let dayValue = '5';
                try {
                    if (selectedDateStrIso && new Date(selectedDateStrIso).getDay() === 4) {
                        dayValue = '4';
                    }
                } catch { }

                subtotal += BCC_UTILS.calculatePrice(gender, count, dayValue);
                guestSummaryParts.push(`${count}x ${gender.charAt(0).toUpperCase() + gender.slice(1)}`);
            }
        });

        const summaryEvent = document.getElementById('summary-event');
        const summaryGuests = document.getElementById('summary-guests');
        const summarySubtotal = document.getElementById('summary-subtotal');

        if (summaryEvent) summaryEvent.textContent = dateDisplay;
        if (summaryGuests) summaryGuests.textContent = guestSummaryParts.join(', ');
        if (summarySubtotal) summarySubtotal.textContent = BCC_UTILS.formatCurrency(subtotal);

        // Calculate discount
        let discountAmount = 0;
        const discountRow = document.getElementById('promo-discount-row');
        const discountAmountEl = document.getElementById('promo-discount-amount');

        if (appliedPromo) {
            if (appliedPromo.discount_type === 'percentage') {
                discountAmount = Math.round(subtotal * (appliedPromo.discount_value / 100));
            } else {
                discountAmount = Math.min(appliedPromo.discount_value, subtotal);
            }
            if (discountRow) discountRow.style.display = 'flex';
            if (discountAmountEl) discountAmountEl.textContent = `-${BCC_UTILS.formatCurrency(discountAmount)}`;
        } else {
            if (discountRow) discountRow.style.display = 'none';
        }

        const finalTotal = Math.max(0, subtotal - discountAmount);
        const summaryTotal = document.getElementById('summary-total');
        if (summaryTotal) summaryTotal.textContent = BCC_UTILS.formatCurrency(finalTotal);
    }

    // Promo Code Logic
    const promoInput = document.getElementById('promo-code-input');
    const applyBtn = document.getElementById('apply-promo-btn');
    const promoFeedback = document.getElementById('promo-feedback');

    if (applyBtn && !applyBtn.hasAttribute('data-bound')) {
        applyBtn.addEventListener('click', async () => {
            const code = promoInput.value.trim().toUpperCase();
            if (!code) return;

            applyBtn.textContent = 'Applying...';
            applyBtn.disabled = true;

            try {
                const { data, error } = await sbClient
                    .from('promo_codes')
                    .select('code, discount_type, discount_value')
                    .eq('code', code)
                    .eq('is_active', true)
                    .single();

                if (error || !data) {
                    promoFeedback.textContent = 'Invalid or expired code';
                    promoFeedback.style.color = 'var(--color-error)';
                    promoInput.style.borderColor = 'var(--color-error)';
                } else {
                    appliedPromo = data;
                    promoFeedback.textContent = `Applied!`;
                    promoFeedback.style.color = 'var(--color-success)';
                    promoInput.disabled = true;
                    applyBtn.style.display = 'none';
                    updateSummary();
                }
            } catch (err) {
                console.error(err);
            } finally {
                applyBtn.textContent = 'Apply';
                applyBtn.disabled = false;
            }
        });
        applyBtn.setAttribute('data-bound', 'true');
    }

    // 🔐 Final Checkout
    const payBtn = document.getElementById('confirm-payment');
    if (payBtn && !payBtn.hasAttribute('data-bound')) {
        payBtn.onclick = async () => {
            const name = document.getElementById('guest-name').value.trim();
            const email = document.getElementById('guest-email').value.trim();
            const whatsapp = document.getElementById('guest-whatsapp').value.trim();
            const eventDate = document.getElementById('selected-date').value;

            if (!name || !email || !whatsapp || !eventDate) {
                alert('Please fill in all details.');
                return;
            }

            payBtn.textContent = 'CREATING CHECKOUT...';
            payBtn.disabled = true;

            let selectedDay = '5';
            try {
                selectedDay = new Date(eventDate).getDay() === 4 ? '4' : '5';
            } catch { }

            // PAX breakdown
            const blocks = document.querySelectorAll('.guest-block');
            let maleCount = 0;
            let femaleCount = 0;
            blocks.forEach(block => {
                const gender = block.querySelector('.guest-gender-select').value;
                const count = parseInt(block.querySelector('.guest-count-input').value) || 0;
                if (gender === 'male') maleCount += count;
                else femaleCount += count;
            });

            const payload = {
                guest: { first_name: name, email: email, phone: whatsapp },
                event_date: eventDate,
                event_day: selectedDay,
                pax: { male: maleCount, female: femaleCount },
                promo_code: appliedPromo ? appliedPromo.code : null,
                source_channel: TRACKED_SOURCE || null
            };

            try {
                const response = await fetch('/api/create-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();
                if (response.ok) {
                    window.location.href = data.url;
                } else {
                    alert(data.error || 'Checkout failed');
                }
            } catch (err) {
                console.error(err);
                alert('Error creating checkout.');
            } finally {
                payBtn.textContent = 'CONFIRM & PAY';
                payBtn.disabled = false;
            }
        };
        payBtn.setAttribute('data-bound', 'true');
    }

    // Validation
    function validateStep(step) {
        if (step === 2) { // Step 2 is now Guest Details
            const name = document.getElementById('guest-name').value;
            const email = document.getElementById('guest-email').value;
            const whatsapp = document.getElementById('guest-whatsapp').value;
            if (!name || !email || !whatsapp) {
                alert('Please complete all details.');
                return false;
            }
        }
        return true;
    }
}
