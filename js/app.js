/**
 * 🚀 Bangkok Club Crawl — Main App Controller
 * Handles UI initialization, event listeners, and data binding.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🌃 Bangkok Club Crawl: System Initialized.');

    initFeaturesGrid();
    initRoutePreview();
    initRitualsSection();
    initSocialProofSection();
    initFAQSection();
    initBookingWizard();
    initChatAssistant();
    initScrollAnimations();
    initEventListeners();
});

/**
 * 📦 Initialize Features Grid
 */
function initFeaturesGrid() {
    const container = document.getElementById('features-container');
    if (!container) return;

    BCC_DATA.features.forEach(feature => {
        const card = document.createElement('div');
        card.className = 'card feature-card';
        card.innerHTML = `
            <div class="feature-icon">${feature.icon}</div>
            <h3 class="feature-title" style="font-size: var(--text-label); letter-spacing: var(--tracking-wide); margin-bottom: var(--space-sm);">${feature.title}</h3>
            <p class="feature-description" style="font-size: var(--text-small); color: var(--color-gray-light);">${feature.description}</p>
        `;
        container.appendChild(card);
    });
}

/**
 * 🗺️ Initialize Weekend Route Preview
 */
function initRoutePreview() {
    const carousel = document.getElementById('route-carousel');
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const lightbox = document.getElementById('route-lightbox');
    const bottomSheet = document.getElementById('venue-bottom-sheet');
    const sheetDetails = document.getElementById('sheet-details');
    const closeLightbox = document.querySelector('.lightbox-close');
    const sheetBookingBtn = document.getElementById('sheet-booking-btn');

    if (!carousel) return;

    let currentDay = 'friday';

    function renderRoute(day) {
        const route = BCC_DATA.routes[day];
        carousel.style.opacity = '0';

        setTimeout(() => {
            const wrapper = carousel.parentElement;
            carousel.innerHTML = route.map((stop, index) => `
                <div class="route-card ${index === 0 ? 'active' : ''}" data-index="${index}">
                    <video class="route-card-video" muted loop playsinline webkit-playsinline>
                        <source src="${stop.video}" type="video/mp4">
                    </video>
                    <div class="route-card-content">
                        <div class="stop-badge-container">
                            <span class="stop-badge">${stop.stop}</span>
                            <span class="click-indicator">↓</span>
                        </div>
                    </div>
                </div>
            `).join('');
            carousel.style.opacity = '1';
            wrapper.scrollLeft = 0; // Reset scroll on day swap
            attachCardEvents(day);
            handleVideoPlayback(); // Ensure first video plays
        }, 300);
    }

    function handleVideoPlayback() {
        const cards = carousel.querySelectorAll('.route-card');
        cards.forEach(card => {
            const video = card.querySelector('video');
            if (!video) return;

            if (card.classList.contains('active')) {
                video.play().catch(e => console.log('Autoplay blocked:', e));
                video.style.opacity = '1';
            } else {
                video.pause();
                video.style.opacity = '0.7';
            }
        });
    }

    function attachCardEvents(day) {
        const cards = carousel.querySelectorAll('.route-card');

        // Card Click Logic -> Discovery Bottom Sheet
        cards.forEach(card => {
            card.onclick = () => {
                // Ensure clicked card becomes active visually
                cards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                handleVideoPlayback();

                const index = card.dataset.index;
                const stopData = BCC_DATA.routes[day][index];

                sheetDetails.innerHTML = `
                    <span class="music-label" style="display: block; color: #F1D18A; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: var(--space-sm); font-weight: var(--weight-bold);">${stopData.music}</span>
                    <h3 style="font-family: var(--font-headline); font-size: 1.8rem; margin-bottom: var(--space-md); text-transform: uppercase;">${stopData.stop}</h3>
                    <p class="desc" style="color: var(--color-gray-light); line-height: 1.6; font-size: 1rem;">${stopData.description}</p>
                `;
                bottomSheet.classList.add('active');
            };
        });

        // Horizontal scroll snap behavior centering active card
        const wrapper = carousel.parentElement;
        wrapper.onscroll = () => {
            const centerX = wrapper.scrollLeft + (wrapper.offsetWidth / 2);
            let closestCard = null;
            let minDistance = Infinity;

            cards.forEach(card => {
                const cardRect = card.getBoundingClientRect();
                const wrapperRect = wrapper.getBoundingClientRect();
                const cardCenterX = cardRect.left + (cardRect.width / 2);
                const wrapperCenterX = wrapperRect.left + (wrapperRect.width / 2);
                const distance = Math.abs(cardCenterX - wrapperCenterX);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestCard = card;
                }
            });

            if (closestCard && !closestCard.classList.contains('active')) {
                cards.forEach(c => c.classList.remove('active'));
                closestCard.classList.add('active');
                handleVideoPlayback();
            }
        };
    }

    // Toggle day
    toggleBtns.forEach(btn => {
        btn.onclick = () => {
            if (btn.classList.contains('active')) return;
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDay = btn.dataset.day;
            renderRoute(currentDay);
        };
    });

    // Close Lightbox
    closeLightbox.onclick = () => lightbox.classList.remove('active');
    lightbox.onclick = (e) => { if (e.target === lightbox) lightbox.classList.remove('active'); };

    // Close Bottom Sheet
    bottomSheet.onclick = (e) => {
        if (e.target === bottomSheet) bottomSheet.classList.remove('active');
    };

    document.querySelector('.bottom-sheet-handle').onclick = () => bottomSheet.classList.remove('active');

    // Secure My Spot logic
    sheetBookingBtn.onclick = (e) => {
        e.stopPropagation();
        bottomSheet.classList.remove('active');
        const modal = document.getElementById('booking-modal');
        if (modal) {
            modal.classList.add('active');
            // Auto-select day in wizard based on toggle
            const val = currentDay === 'friday' ? '5' : '6';
            const dayInput = modal.querySelector(`input[name="event-day"][value="${val}"]`);
            if (dayInput) {
                dayInput.checked = true;
                dayInput.dispatchEvent(new Event('change'));
            }
        }
    };

    // Initial render
    carousel.style.transition = 'opacity 0.3s ease-in-out';
    renderRoute('friday');
}

/**
 * ⚡ Initialize Rituals (Experience) Section
 */
function initRitualsSection() {
    const section = document.querySelector('#experience .container');
    if (!section || !BCC_DATA.rituals) return;

    const timeline = document.createElement('div');
    timeline.className = 'ritual-timeline';

    BCC_DATA.rituals.forEach(ritual => {
        const card = document.createElement('div');
        card.className = 'ritual-card';
        card.style.backgroundImage = `linear-gradient(rgba(28, 28, 30, 0.8), rgba(28, 28, 30, 0.95)), url('${ritual.image}')`;
        card.style.backgroundSize = 'cover';
        card.style.backgroundPosition = 'center';
        card.innerHTML = `
            <div class="ritual-energy-container">
                <span class="ritual-energy-label">Energy: ${ritual.energy}</span>
                <div class="ritual-energy-bar">
                    <div class="ritual-energy-progress" style="width: ${ritual.energy}"></div>
                </div>
            </div>
            <span class="section-label" style="display:block; margin-top:var(--space-md)">${ritual.phase}</span>
            <h3 class="ritual-title">${ritual.title}</h3>
            <p class="ritual-desc">${ritual.description}</p>
        `;
        timeline.appendChild(card);
    });

    section.appendChild(timeline);
}

/**
 * ⭐️ Initialize Social Proof Section
 */
function initSocialProofSection() {
    const section = document.querySelector('#social .container');
    if (!section) return;

    section.innerHTML = `
        <div class="section-header">
            <span class="section-label">Guest Experience</span>
            <h2 class="section-h2">What <span class="text-gradient-pink">Guests Say</span></h2>
        </div>
        
        <div class="reviews-container" style="display: flex; flex-direction: column; gap: var(--space-2xl); margin-top: var(--space-2xl);">
            <!-- Airbnb Reviews Widget -->
            <div class="elfsight-app-c9a3552e-9881-4e1c-98f3-0a366fc9e590" data-elfsight-app-lazy></div>
            
            <!-- Google Reviews Widget -->
            <div class="elfsight-app-2a8f47e3-cd44-475c-a54d-5df650fcf6b7" data-elfsight-app-lazy></div>
        </div>
    `;
}

/**
 * ❓ Initialize FAQ Section
 */
function initFAQSection() {
    const section = document.querySelector('#faq .container');
    if (!section) return;

    const faqContainer = document.createElement('div');
    faqContainer.className = 'faq-container';
    faqContainer.style.maxWidth = '800px';
    faqContainer.style.margin = '0 auto';

    BCC_DATA.faqs.forEach((faq, index) => {
        const item = document.createElement('div');
        item.className = 'faq-item';
        item.style.marginBottom = 'var(--space-md)';
        item.style.borderBottom = '1px solid var(--color-border)';
        item.style.paddingBottom = 'var(--space-md)';

        item.innerHTML = `
            <div class="faq-question" style="font-weight: var(--weight-semibold); cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: var(--space-sm) 0;">
                <span>${faq.question}</span>
                <span class="faq-icon" style="color: var(--color-primary); transition: var(--transition-base);">+</span>
            </div>
            <div class="faq-answer" style="display: none; padding: var(--space-sm) 0; color: var(--color-gray-light); font-size: var(--text-body);">
                ${faq.answer}
            </div>
        `;

        // Toggle logic
        item.querySelector('.faq-question').addEventListener('click', () => {
            const answer = item.querySelector('.faq-answer');
            const icon = item.querySelector('.faq-icon');
            const isOpen = answer.style.display === 'block';

            answer.style.display = isOpen ? 'none' : 'block';
            icon.textContent = isOpen ? '+' : '−';
            icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        });

        faqContainer.appendChild(item);
    });

    section.appendChild(faqContainer);
}

/**
 * 🧙‍♂️ Initialize Booking Wizard
 */
function initBookingWizard() {
    const modal = document.getElementById('booking-modal');
    const openBtn = document.getElementById('start-booking');
    const closeBtn = document.getElementById('close-booking');

    if (!modal) return;

    // Open/Close logic
    const openModal = () => modal.classList.add('active');
    const closeModal = () => modal.classList.remove('active');

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    if (closeBtn) closeBtn.onclick = closeModal;

    // Wizard Navigation
    let currentStep = 1;
    const steps = modal.querySelectorAll('.wizard-step');
    const nextBtns = modal.querySelectorAll('.next-step');
    const prevBtns = modal.querySelectorAll('.prev-step');

    const showStep = (stepNum) => {
        steps.forEach((step, index) => {
            step.style.display = (index + 1 === stepNum) ? 'block' : 'none';
        });
        currentStep = stepNum;
        if (stepNum === 2) renderCalendar();
        if (stepNum === 3) initGuestBlocks();
        if (stepNum === 4) updateSummary();
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
    const dayOptions = modal.querySelectorAll('input[name="event-day"]');
    dayOptions.forEach(opt => {
        opt.onchange = () => {
            modal.querySelector('#step-1 .next-step').disabled = false;
        };
    });

    // Step 2: Calendar Rendering
    let currentCalMonth = new Date().getMonth();
    let currentCalYear = new Date().getFullYear();

    function renderCalendar() {
        const wrapper = document.getElementById('calendar-wrapper');
        const dayInput = modal.querySelector('input[name="event-day"]:checked');
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
                    <div class="calendar-day-label">S</div>
                    <div class="calendar-day-label">M</div>
                    <div class="calendar-day-label">T</div>
                    <div class="calendar-day-label">W</div>
                    <div class="calendar-day-label">T</div>
                    <div class="calendar-day-label">F</div>
                    <div class="calendar-day-label">S</div>
        `;

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

        // Listeners for selects
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
                modal.querySelector('#step-2 .next-step').disabled = false;
            };
        });
    }

    // Form Validation 
    function validateStep(step) {
        if (step === 3) {
            const name = document.getElementById('guest-name').value;
            const email = document.getElementById('guest-email').value;
            const whatsapp = document.getElementById('guest-whatsapp').value;
            if (!name || !email || !whatsapp) {
                alert('Please complete all guest details including WhatsApp.');
                return false;
            }
        }
        return true;
    }

    // ===== PROMO CODE SYSTEM =====
    const SUPABASE_URL = 'https://csltowtyzjknulqmgnku.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzbHRvd3R5emprbnVscW1nbmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODAyNzgsImV4cCI6MjA4NTk1NjI3OH0.0ryyMBhmHcBicdE1Cegn_6roISv9paOX0xSFDaZwLvU';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Promo state
    let appliedPromo = null; // { code, discount_type, discount_value }

    // Update Step 4 Summary
    function updateSummary() {
        const date = document.getElementById('selected-date').value || 'TBD';
        const blocks = document.querySelectorAll('.guest-block');
        let subtotal = 0;
        let guestSummaryParts = [];

        blocks.forEach(block => {
            const gender = block.querySelector('.guest-gender-select').value;
            const count = parseInt(block.querySelector('.guest-count-input').value) || 0;
            if (count > 0) {
                subtotal += BCC_UTILS.calculatePrice(gender, count);
                guestSummaryParts.push(`${count}x ${gender.charAt(0).toUpperCase() + gender.slice(1)}`);
            }
        });

        document.getElementById('summary-event').textContent = date;
        document.getElementById('summary-guests').textContent = guestSummaryParts.join(', ');
        document.getElementById('summary-subtotal').textContent = BCC_UTILS.formatCurrency(subtotal);

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
            discountRow.classList.add('visible');
            discountAmountEl.textContent = `-${BCC_UTILS.formatCurrency(discountAmount)}`;
        } else {
            discountRow.classList.remove('visible');
        }

        const finalTotal = Math.max(0, subtotal - discountAmount);
        document.getElementById('summary-total').textContent = BCC_UTILS.formatCurrency(finalTotal);
    }

    // Promo Code Apply Logic
    const promoInput = document.getElementById('promo-code-input');
    const applyBtn = document.getElementById('apply-promo-btn');
    const promoFeedback = document.getElementById('promo-feedback');

    if (applyBtn) {
        applyBtn.addEventListener('click', async () => {
            const code = promoInput.value.trim().toUpperCase();
            if (!code) {
                showPromoFeedback('Please enter a promo code', 'error');
                promoInput.classList.add('error');
                setTimeout(() => promoInput.classList.remove('error'), 600);
                return;
            }

            // Loading state
            applyBtn.classList.add('loading');
            applyBtn.disabled = true;
            promoInput.classList.remove('success', 'error');
            promoFeedback.textContent = '';
            promoFeedback.className = 'promo-feedback';

            try {
                const { data, error } = await supabase
                    .from('promo_codes')
                    .select('code, discount_type, discount_value')
                    .eq('code', code)
                    .eq('is_active', true)
                    .single();

                if (error || !data) {
                    showPromoFeedback('Invalid or expired code', 'error');
                    promoInput.classList.add('error');
                    setTimeout(() => promoInput.classList.remove('error'), 600);
                } else {
                    // Apply the promo
                    appliedPromo = data;
                    const label = data.discount_type === 'percentage'
                        ? `${data.discount_value}% off`
                        : `${BCC_UTILS.formatCurrency(data.discount_value)} off`;
                    showPromoFeedback(`"${data.code}" applied — ${label}`, 'success');
                    promoInput.classList.add('success');
                    promoInput.disabled = true;
                    applyBtn.style.display = 'none';

                    // Show remove button
                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.className = 'promo-remove-btn';
                    removeBtn.textContent = 'Remove';
                    removeBtn.id = 'remove-promo-btn';
                    removeBtn.addEventListener('click', () => {
                        appliedPromo = null;
                        promoInput.value = '';
                        promoInput.disabled = false;
                        promoInput.classList.remove('success');
                        applyBtn.style.display = '';
                        removeBtn.remove();
                        promoFeedback.textContent = '';
                        promoFeedback.className = 'promo-feedback';
                        updateSummary();
                    });
                    promoInput.parentElement.appendChild(removeBtn);

                    updateSummary();
                }
            } catch (err) {
                console.error('Promo code verification failed:', err);
                showPromoFeedback('Network error — try again', 'error');
            } finally {
                applyBtn.classList.remove('loading');
                applyBtn.disabled = false;
            }
        });

        // Enter key to apply
        promoInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyBtn.click();
            }
        });
    }

    function showPromoFeedback(message, type) {
        promoFeedback.textContent = message;
        promoFeedback.className = `promo-feedback ${type}`;
    }

    // Step 3: Guest Blocks Logic
    function initGuestBlocks() {
        const container = document.getElementById('guest-blocks-container');
        const addBtn = document.getElementById('add-guest-btn');
        const whatsappInput = document.getElementById('guest-whatsapp');

        if (container.children.length === 0) {
            addGuestBlock('female', 1); // Start with 1 Female by default
        }

        addBtn.onclick = () => addGuestBlock('male', 1);

        // WhatsApp auto-format (allows + for international)
        whatsappInput.oninput = (e) => {
            e.target.value = e.target.value.replace(/[^0-9\s-+\(\)]/g, '');
        };
    }

    function addGuestBlock(gender = 'male', count = 1) {
        const container = document.getElementById('guest-blocks-container');
        const block = document.createElement('div');
        block.className = 'guest-block';
        block.innerHTML = `
            <select class="guest-gender-select" style="flex: 2; padding: var(--space-sm); background: var(--color-dark-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-white);">
                <option value="male" ${gender === 'male' ? 'selected' : ''}>Male (฿1,500)</option>
                <option value="female" ${gender === 'female' ? 'selected' : ''}>Female (฿1,200)</option>
            </select>
            <input type="number" class="guest-count-input" value="${count}" min="1" max="10" style="width: 60px; padding: var(--space-sm); background: var(--color-dark-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-white);">
            <button type="button" class="remove-guest-btn">&times;</button>
        `;

        block.querySelector('.remove-guest-btn').onclick = () => {
            if (container.children.length > 1) block.remove();
        };

        container.appendChild(block);
    }

    // Payment Button Logic — Real Stripe Checkout Integration
    const payBtn = document.getElementById('confirm-payment');
    if (payBtn) {
        payBtn.onclick = async () => {
            // ——— Validate required fields ———
            const name = document.getElementById('guest-name').value.trim();
            const email = document.getElementById('guest-email').value.trim();
            const whatsapp = document.getElementById('guest-whatsapp').value.trim();
            const eventDate = document.getElementById('selected-date').value;

            if (!name || !email || !whatsapp) {
                alert('Please fill in your Name, Email, and WhatsApp number.');
                return;
            }
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            if (!eventDate) {
                alert('Please select an event date first.');
                return;
            }

            // ——— Collect pax breakdown ———
            const blocks = document.querySelectorAll('.guest-block');
            let maleCount = 0;
            let femaleCount = 0;

            blocks.forEach(block => {
                const gender = block.querySelector('.guest-gender-select').value;
                const count = parseInt(block.querySelector('.guest-count-input').value) || 0;
                if (gender === 'male') maleCount += count;
                else femaleCount += count;
            });

            if (maleCount + femaleCount === 0) {
                alert('Please add at least 1 guest.');
                return;
            }

            // ——— Show loading state ———
            payBtn.textContent = 'CREATING CHECKOUT...';
            payBtn.disabled = true;
            payBtn.style.opacity = '0.7';

            // ——— Build payload ———
            const payload = {
                guest: {
                    first_name: name,
                    email: email,
                    phone: whatsapp
                },
                event_date: eventDate,
                pax: {
                    male: maleCount,
                    female: femaleCount
                },
                promo_code: appliedPromo ? appliedPromo.code : null
            };

            console.log('📋 Checkout payload:', payload);

            try {
                const response = await fetch('/api/create-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Checkout creation failed');
                }

                console.log('✅ Redirecting to Stripe Checkout:', data.url);

                // Redirect to Stripe Checkout
                window.location.href = data.url;

            } catch (err) {
                console.error('❌ Checkout error:', err);
                alert(`Booking failed: ${err.message}\n\nPlease try again.`);
                payBtn.textContent = 'PAY NOW via Stripe';
                payBtn.disabled = false;
                payBtn.style.opacity = '1';
            }
        };
    }
}

/**
 * 💬 Initialize AI Chat Assistant
 */
function initChatAssistant() {
    const toggleBtn = document.getElementById('chat-toggle');
    const closeBtn = document.getElementById('close-chat');
    const panel = document.getElementById('chat-panel');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat');
    const messages = document.getElementById('chat-messages');

    if (!panel) return;

    toggleBtn.onclick = () => {
        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        if (panel.style.display === 'flex') {
            input.focus();
        }
    };

    closeBtn.onclick = () => {
        panel.style.display = 'none';
    };

    const addMessage = (role, content) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = role === 'user' ? 'user-msg' : 'ai-msg';
        msgDiv.textContent = content;
        messages.appendChild(msgDiv);
        messages.scrollTop = messages.scrollHeight;
    };

    const handleSend = () => {
        const text = input.value.trim();
        if (!text) return;

        addMessage('user', text);
        input.value = '';

        // Typing indicator simulation
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-msg';
        typingDiv.textContent = '...';
        messages.appendChild(typingDiv);
        messages.scrollTop = messages.scrollHeight;

        // Mock AI Response (Host Authority System)
        setTimeout(() => {
            typingDiv.remove();
            let response = "I understand. Our night is designed for exactly that. Would you like to see our availability for this weekend?";

            // Simple keyword logic
            const lowerText = text.toLowerCase();
            if (lowerText.includes('price') || lowerText.includes('cost')) {
                response = "The experience is ฿1,500 (฿1,200 for ladies). This includes 4 curated venues, VIP entry, transport, and shots. It's structured access, not just a bar crawl.";
            } else if (lowerText.includes('solo') || lowerText.includes('alone')) {
                response = "Most of our guests arrive solo. We structure the night to break the ice naturally. You'll arrive solo but leave with a crew.";
            } else if (lowerText.includes('safe') || lowerText.includes('women')) {
                response = "Safety and comfort are our priority. Our dedicated hosts manage the vibe and group flow at all times. It's a high-energy but controlled environment.";
            } else if (lowerText.includes('club') || lowerText.includes('venue')) {
                response = "We visit Sukhumvit's best clubs – a mix of high-energy bars and premium dance floors. VIP entry is included throughout.";
            }

            addMessage('ai', response);
        }, 1500);
    };

    sendBtn.onclick = handleSend;
    input.onkeypress = (e) => {
        if (e.key === 'Enter') handleSend();
    };
}

/**
 * 🎬 Initialize Scroll Animations
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));
}


/**
 * 🖱️ Initialize Event Listeners
 */
function initEventListeners() {
    // Universal Booking Trigger
    const bookingTriggers = document.querySelectorAll('#start-booking, .cta-open-booking');
    const modal = document.getElementById('booking-modal');

    if (modal) {
        bookingTriggers.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.add('active');
            });
        });
    }

    // Header scroll background effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 50) {
                header.style.backgroundColor = 'rgba(17, 17, 20, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
                header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
            } else {
                header.style.backgroundColor = 'transparent';
                header.style.backdropFilter = 'none';
                header.style.boxShadow = 'none';
            }
        }
    });
}
