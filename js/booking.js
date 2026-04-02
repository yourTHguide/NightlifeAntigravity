/**
 * 🎫 Bangkok Club Crawl — Booking Logic
 * Handles standalone booking wizard on /book
 */

// ═══════════════════════════════════════════════════
//  GLOBAL: URL Parameter Tracking
// ═══════════════════════════════════════════════════
const URL_PARAMS = new URLSearchParams(window.location.search);
const TRACKED_SOURCE = URL_PARAMS.get('source') || null;
const TRACKED_NIGHT = URL_PARAMS.get('night') || null;

// 🛡️ Security: XSS Prevention Helper
function escHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    initBookingWizard();
});

// ═══════════════════════════════════════════════════
//  🧙‍♂️ BOOKING WIZARD INITIALIZATION
// ═══════════════════════════════════════════════════
function initBookingWizard() {
    const wizardContainer = document.getElementById('booking-wizard');
    if (!wizardContainer) return;

    console.log('Wizard initialized on standalone page.');

    // Pre-select day if night parameter exists
    if (TRACKED_NIGHT) {
        const nightMap = { 'thursday': '4', 'friday': '5', 'saturday': '6' };
        const val = nightMap[TRACKED_NIGHT.toLowerCase()];
        if (val) {
            const dayInput = wizardContainer.querySelector(`input[name="event-day"][value="${val}"]`);
            if (dayInput) {
                dayInput.checked = true;
                // Enable next button on step 1
                const nxt = wizardContainer.querySelector('#step-1 .next-step');
                if (nxt) nxt.disabled = false;
            }
        }
    }

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
        if (stepNum === 2) renderCalendar();
        if (stepNum === 3) initGuestBlocks();
        if (stepNum === 4) updateSummary();

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

    // Step 1: Day selection enablement
    const dayOptions = wizardContainer.querySelectorAll('input[name="event-day"]');
    dayOptions.forEach(opt => {
        opt.onchange = () => {
            wizardContainer.querySelector('#step-1 .next-step').disabled = false;
        };
    });

    // 📅 Step 2: Calendar System
    let currentCalMonth = new Date().getMonth();
    let currentCalYear = new Date().getFullYear();

    function renderCalendar() {
        const wrapper = document.getElementById('calendar-wrapper');
        const dayInput = wizardContainer.querySelector('input[name="event-day"]:checked');
        if (!dayInput) return;
        const targetDay = parseInt(dayInput.value);

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
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        for (let i = 0; i < firstDay; i++) {
            html += `<div class="calendar-day disabled"></div>`;
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(currentCalYear, currentCalMonth, d);
            const dayOfWeek = dateObj.getDay();
            const isTarget = dayOfWeek === targetDay;
            const isPast = dateObj < now;

            if (isTarget && !isPast) {
                const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                const isSelected = document.getElementById('selected-date').value === dateStr;
                html += `<div class="calendar-day available ${isSelected ? 'selected' : ''}" data-date="${dateStr}">${d}</div>`;
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
                wizardContainer.querySelector('#step-2 .next-step').disabled = false;
            };
        });
    }

    // 👥 Step 3: Guest Blocks Logic
    function initGuestBlocks() {
        const container = document.getElementById('guest-blocks-container');
        const addBtn = document.getElementById('add-guest-btn');
        const whatsappInput = document.getElementById('guest-whatsapp');

        if (container.children.length === 0) {
            addGuestBlock('female', 1);
        } else {
            updateGuestBlockPrices();
        }

        addBtn.onclick = () => addGuestBlock('male', 1);
        whatsappInput.oninput = (e) => {
            e.target.value = e.target.value.replace(/[^0-9\s-+\(\)]/g, '');
        };
    }

    function addGuestBlock(gender = 'male', count = 1) {
        const container = document.getElementById('guest-blocks-container');
        const dayInput = wizardContainer.querySelector('input[name="event-day"]:checked');
        const isThursday = dayInput && dayInput.value === '4';
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
        const dayInput = wizardContainer.querySelector('input[name="event-day"]:checked');
        const isThursday = dayInput && dayInput.value === '4';
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

    // 📋 Step 4: Summary & Promo
    const SUPABASE_URL = 'https://csltowtyzjknulqmgnku.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzbHRvd3R5emprbnVscW1nbmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODAyNzgsImV4cCI6MjA4NTk1NjI3OH0.0ryyMBhmHcBicdE1Cegn_6roISv9paOX0xSFDaZwLvU';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    let appliedPromo = null;

    function updateSummary() {
        const dateInput = document.getElementById('selected-date');
        const date = dateInput ? dateInput.value : 'TBD';
        const dayInput = wizardContainer.querySelector('input[name="event-day"]:checked');
        const dayValue = dayInput ? dayInput.value : '';
        const blocks = document.querySelectorAll('.guest-block');
        let subtotal = 0;
        let guestSummaryParts = [];

        blocks.forEach(block => {
            const gender = block.querySelector('.guest-gender-select').value;
            const count = parseInt(block.querySelector('.guest-count-input').value) || 0;
            if (count > 0) {
                subtotal += BCC_UTILS.calculatePrice(gender, count, dayValue);
                guestSummaryParts.push(`${count}x ${gender.charAt(0).toUpperCase() + gender.slice(1)}`);
            }
        });

        const summaryEvent = document.getElementById('summary-event');
        const summaryGuests = document.getElementById('summary-guests');
        const summarySubtotal = document.getElementById('summary-subtotal');

        if (summaryEvent) summaryEvent.textContent = date;
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

    if (applyBtn) {
        applyBtn.addEventListener('click', async () => {
            const code = promoInput.value.trim().toUpperCase();
            if (!code) return;

            applyBtn.textContent = 'Applying...';
            applyBtn.disabled = true;

            try {
                const { data, error } = await supabase
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
    }

    // 🔐 Step 4: Final Checkout
    const payBtn = document.getElementById('confirm-payment');
    if (payBtn) {
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

            const selectedDay = wizardContainer.querySelector('input[name="event-day"]:checked')?.value || null;

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
    }

    // Validation
    function validateStep(step) {
        if (step === 3) {
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
