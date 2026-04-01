/**
 * 🚀 Bangkok Club Crawl — Main App Controller
 * Handles UI initialization, event listeners, and data binding.
 */

// ═══════════════════════════════════════════════════
//  GLOBAL: URL Parameter Tracking
//  Reads ?night=thursday|friday|saturday  → Smart Traffic
//  Reads ?source=meetup|nomadtable|...    → CRM Source Tracking
// ═══════════════════════════════════════════════════
const URL_PARAMS = new URLSearchParams(window.location.search);
const TRACKED_SOURCE = URL_PARAMS.get('source') || null;  // e.g. 'meetup', 'nomadtable', 'instagram'
const TRACKED_NIGHT = URL_PARAMS.get('night') || null;     // e.g. 'thursday', 'friday', 'saturday'

if (TRACKED_SOURCE) {
    console.log(`📡 CRM Source captured: ${TRACKED_SOURCE}`);
}
if (TRACKED_NIGHT) {
    console.log(`🎯 Smart Traffic: auto-routing to ${TRACKED_NIGHT}`);
}

// 🛡️ Security: XSS Prevention Helper
function escHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
}


document.addEventListener('DOMContentLoaded', () => {
    console.log('🌃 Bangkok Club Crawl: System Initialized.');

    initSelectNightCards();
    initFeaturesGrid();
    initHostsSection();
    initFlowSection();

    initFAQSection();
    initBookingWizard();
    initChatAssistant();
    initScrollAnimations();
    initEventListeners();

    // ——— Smart Traffic: Auto-expand night modal from URL param ———
    if (TRACKED_NIGHT) {
        // Slight delay to ensure DOM is fully painted
        setTimeout(() => {
            triggerNightExpansion(TRACKED_NIGHT);
        }, 600);
    }
});

/**
 * 🎯 Smart Traffic: Programmatically trigger a night card expansion
 * Called from URL param routing (?night=thursday|friday|saturday)
 */
function triggerNightExpansion(nightParam) {
    const nightKey = nightParam.toLowerCase();
    const card = document.querySelector(`.night-card[data-night="${nightKey}"]`);

    if (card) {
        // Scroll to the Select Your Night section first
        const section = document.getElementById('select-night');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Trigger the card click after scroll finishes
        setTimeout(() => {
            card.click();
        }, 500);
    } else {
        console.warn(`⚠️ Smart Traffic: No card found for night="${nightKey}"`);
    }
}

/**
 * 🌠 Initialize "Select Your Night" Card Expansion
 */
function initSelectNightCards() {
    const cards = document.querySelectorAll('.night-card');
    const modal = document.getElementById('event-expansion-modal');
    if (!cards.length || !modal) return;

    const hero = modal.querySelector('.expansion-hero');
    const titleEl = document.getElementById('expansion-title');
    const subtitleEl = document.getElementById('expansion-day-time');
    const closeBtn = document.getElementById('close-expansion');

    // Dynamic content elements
    const descEl = document.getElementById('expansion-desc');
    const featuresEl = document.getElementById('expansion-features');
    const galleryEl = document.getElementById('expansion-gallery');
    const timeEl = document.getElementById('expansion-time');
    const locationEl = document.getElementById('expansion-location');
    const priceEl = document.getElementById('expansion-price');
    const bookBtn = document.getElementById('expansion-book-btn');

    // Content Data Mapping based on requirement
    const nightData = {
        'Thursday': {
            desc: "Relaxed. Social. Easy to connect.\n\nBest for expats, nomads, solo joiners, and social nights.",
            features: [
                "3 curated venues",
                "Transportation included (if needed)",
                "Social-first atmosphere",
                "Relaxed pacing",
                "Ends around midnight"
            ],
            gallery: [
                "assets/images/image.remini-enhanced (9).jpg",
                "assets/images/Rhodes group pic.JPG",
                "assets/images/tempImagetMAqsL.remini-enhanced.jpg",
                "assets/images/tempImageVg9T4j.remini-enhanced.jpg",
                "assets/images/tempImagege7ud6.remini-enhanced.jpg"
            ],
            time: "Every Thursday\n9:00 PM – ~12:30 AM",
            location: "Thonglor / Ekkamai area — exact meeting point shared after booking",
            price: "Male: 1,200 THB\nFemale: 1,000 THB",
            bookingValue: "4" // Maps to a potential Thursday option in booking wizard later. Will use 5 for now as fallback.
        },
        'Friday': {
            desc: "The perfect balance of social and party.\n\nBest for the full guided nightlife experience.",
            features: [
                "4 curated venues",
                "Private van included",
                "Hosted group experience",
                "Strong group energy",
                "Full guided nightlife experience"
            ],
            gallery: [
                "assets/images/IMG_4924.jpg",
                "assets/images/IMG_5047-min.jpeg",
                "assets/images/IMG_4944.jpg",
                "assets/images/tempImage8KAjpq.remini-enhanced.jpg",
                "assets/images/IMG_5097-min.jpeg",
                "assets/images/IMG_2367.remini-enhanced.jpg",
                "assets/images/IMG_4940.jpg",
                "assets/images/tempImagepFGk6y.remini-enhanced.jpg"
            ],
            time: "Every Friday\n9:30 PM – Late",
            location: "Lower Sukhumvit area — exact meeting point shared after booking",
            price: "Male: 1,500 THB\nFemale: 1,200 THB",
            bookingValue: "5"
        },
        'Saturday': {
            desc: "High energy. Peak night. Biggest crowd.\n\nBest for the full party experience and our signature Saturday vibe.",
            features: [
                "4 top venues",
                "Private van included",
                "Highest energy night",
                "Best for full party experience",
                "Signature Saturday vibe"
            ],
            gallery: [
                "assets/images/Chupa group shot.JPG",
                "assets/images/image.remini-enhanced (11).jpg",
                "assets/images/tempImagebe81ZZ.remini-enhanced.jpg",
                "assets/images/tempImageTvGNfS.remini-enhanced.jpg",
                "assets/images/tempImagege7ud6.remini-enhanced.jpg",
                "assets/images/image.remini-enhanced (8).jpg",
                "assets/images/image.remini-enhanced (9).jpg",
                "assets/images/IMG_4078(1).remini-enhanced.jpg",
                "assets/images/tempImagev201zt.remini-enhanced.jpg"
            ],
            time: "Every Saturday\n9:30 PM – Late",
            location: "Sukhumvit 11 / Asoke area — exact meeting point shared after booking",
            price: "Male: 1,500 THB\nFemale: 1,200 THB",
            bookingValue: "6"
        }
    };

    let activeCard = null;

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (activeCard) return; // Prevent multiple clicks
            activeCard = card;

            // Get bounding box of the clicked card
            const rect = card.getBoundingClientRect();

            // Extract info from clicked card
            const title = card.querySelector('.night-card-subtitle').innerText;
            const dayStr = card.querySelector('.night-card-title').innerText;
            const lookupDay = dayStr.charAt(0).toUpperCase() + dayStr.slice(1).toLowerCase();

            // Extract the background image
            const bgImage = card.style.backgroundImage || getComputedStyle(card).backgroundImage;

            // --- Populating Content Based On Day ---
            const data = nightData[lookupDay] || nightData['Friday']; // fallback

            hero.style.backgroundImage = bgImage;
            titleEl.innerText = title;

            const shortTitle = title.split(' — ')[0];
            const eventTime = data.time.split('\n')[1] || "9:30 PM";
            subtitleEl.innerText = `${shortTitle} | ${dayStr} • ${eventTime}`;

            descEl.innerText = data.desc;
            if (featuresEl) {
                featuresEl.innerHTML = (data.features || []).map(f => `<li>${escHtml(f)}</li>`).join('');
            }
            if (galleryEl) {
                galleryEl.innerHTML = (data.gallery || []).map(img => `<img src="${escHtml(img)}" alt="${escHtml(dayStr)} Event" class="expansion-gallery-img">`).join('');
            }

            timeEl.innerText = data.time;
            locationEl.innerText = data.location;
            priceEl.innerText = data.price;

            // Setup book button bridging
            bookBtn.onclick = () => {
                closeBtn.click(); // close the expansion modal
                setTimeout(() => {
                    const bookingModal = document.getElementById('booking-modal');
                    if (bookingModal) {
                        bookingModal.classList.add('active');
                        // Pre-select day 
                        const dayInput = bookingModal.querySelector(`input[name="event-day"][value="${data.bookingValue}"]`);
                        if (dayInput) {
                            dayInput.checked = true;
                            dayInput.dispatchEvent(new Event('change'));
                        }
                    }
                }, 550); // wait for scale down animation to finish
            };

            // Set initial position starting from the card's position
            modal.style.setProperty('--card-x', `${rect.left}px`);
            modal.style.setProperty('--card-y', `${rect.top}px`);
            modal.style.setProperty('--card-w', `${rect.width}px`);
            modal.style.setProperty('--card-h', `${rect.height}px`);

            // Display modal and trigger reflow
            modal.classList.add('active');

            // Add 'expanded' to trigger CSS transitions to full screen
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    modal.classList.add('expanded');
                    document.body.style.overflow = 'hidden'; // Prevent background scrolling
                });
            });
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('expanded');
        document.body.style.overflow = '';

        // Wait for transition to finish before hiding completely
        setTimeout(() => {
            modal.classList.remove('active');
            activeCard = null;
        }, 500); // matches the 0.5s CSS transition
    });
}

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
                    <img class="route-card-image" src="${stop.image}" alt="${stop.venue}">
                    <div class="route-card-overlay"></div>
                    <div class="route-card-content">
                        <span class="route-music-capsule">${stop.music}</span>
                        <h3 class="route-venue-title">${stop.venue}</h3>
                        <div class="stop-badge-container">
                            <span class="stop-badge-subtle">${stop.stop}</span>
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
            const img = card.querySelector('.route-card-image');
            if (!img) return;

            if (card.classList.contains('active')) {
                img.style.opacity = '1';
            } else {
                img.style.opacity = '0.7';
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
 * 🌊 Initialize Flow Section (Collapsible Steps)
 */
function initFlowSection() {
    const steps = document.querySelectorAll('.collapsible-step');
    steps.forEach(step => {
        step.addEventListener('click', () => {
            step.classList.toggle('expanded');
        });
    });
}

/**
 * 👑 Initialize Hosts Section
 */
function initHostsSection() {
    const accordion = document.getElementById('hosts-accordion');
    if (!accordion || !BCC_DATA.hosts) return;

    accordion.innerHTML = BCC_DATA.hosts.map((host, index) => `
        <div class="host-accordion-item" data-index="${index}">
            <div class="host-header">
                <div class="host-portrait-small">
                    <img src="${host.image}" alt="${host.name}">
                </div>
                <div class="host-info-brief">
                    <h3 class="host-name">${host.name} <span class="verified-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L15 4.5L18.5 4L20 7.5L23 9.5L21.5 13L23 16.5L20 18.5L18.5 22L15 21.5L12 24L9 21.5L5.5 22L4 18.5L1 16.5L2.5 13L1 9.5L4 7.5L5.5 4L9 4.5L12 2Z" fill="#D4AF37"/>
                            <path d="M10 16L6 12L7.4 10.6L10 13.2L16.6 6.6L18 8L10 16Z" fill="#111114"/>
                        </svg>
                    </span></h3>
                    <span class="role-capsule">${host.role}</span>
                    <p class="host-short-desc">"${host.shortDesc}"</p>
                    <p class="host-stat-line"><span style="color:#D4AF37;">★</span> ${host.stats}</p>
                </div>
                <div class="host-expand-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="#D4AF37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
            
            <div class="host-expanded-content">
                <div class="host-expanded-inner">
                    <div class="host-portrait-large">
                        <img src="${host.image}" alt="${host.name}">
                    </div>
                    <p class="host-full-desc">${host.description}</p>
                    <div class="host-skills">
                        ${host.badges.map(badge => `<span class="skill-badge">${badge}</span>`).join('')}
                    </div>
                    <button class="btn host-action-btn">See ${host.name} In Action</button>
                </div>
            </div>
        </div>
    `).join('');

    const items = accordion.querySelectorAll('.host-accordion-item');

    items.forEach(item => {
        const header = item.querySelector('.host-header');

        header.addEventListener('click', () => {
            const isExpanded = item.classList.contains('expanded');

            // Close all others
            items.forEach(otherItem => {
                otherItem.classList.remove('expanded');
                const content = otherItem.querySelector('.host-expanded-content');
                if (content) content.style.maxHeight = null;
            });

            if (!isExpanded) {
                // Open this
                item.classList.add('expanded');
                const content = item.querySelector('.host-expanded-content');
                // Calculate actual height needed
                if (content) {
                    content.style.maxHeight = content.scrollHeight + "px";
                }

                // Optional: scroll into view smoothly
                setTimeout(() => {
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 300);
            }
        });
    });
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
        const dayInput = document.querySelector('input[name="event-day"]:checked');
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
    function updateGuestBlockPrices() {
        const dayInput = document.querySelector('input[name="event-day"]:checked');
        const isThursday = dayInput && dayInput.value === '4';
        const malePrice = isThursday ? '1,200' : '1,500';
        const femalePrice = isThursday ? '1,000' : '1,200';

        const selects = document.querySelectorAll('.guest-gender-select');
        selects.forEach(select => {
            const options = select.querySelectorAll('option');
            options.forEach(opt => {
                if (opt.value === 'male') opt.textContent = `Male (฿${malePrice})`;
                if (opt.value === 'female') opt.textContent = `Female (฿${femalePrice})`;
            });
        });
    }

    function initGuestBlocks() {
        const container = document.getElementById('guest-blocks-container');
        const addBtn = document.getElementById('add-guest-btn');
        const whatsappInput = document.getElementById('guest-whatsapp');

        if (container.children.length === 0) {
            addGuestBlock('female', 1); // Start with 1 Female by default
        } else {
            updateGuestBlockPrices();
        }

        addBtn.onclick = () => addGuestBlock('male', 1);

        // WhatsApp auto-format (allows + for international)
        whatsappInput.oninput = (e) => {
            e.target.value = e.target.value.replace(/[^0-9\s-+\(\)]/g, '');
        };
    }

    function addGuestBlock(gender = 'male', count = 1) {
        const container = document.getElementById('guest-blocks-container');
        const dayInput = document.querySelector('input[name="event-day"]:checked');
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
            const selectedDay = document.querySelector('input[name="event-day"]:checked')?.value || null;
            const payload = {
                guest: {
                    first_name: name,
                    email: email,
                    phone: whatsapp
                },
                event_date: eventDate,
                event_day: selectedDay,
                pax: {
                    male: maleCount,
                    female: femaleCount
                },
                promo_code: appliedPromo ? appliedPromo.code : null,
                source_channel: TRACKED_SOURCE || null  // CRM: captured from ?source= URL param
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
 * Implements the Date-First Sales Methodology with Host Authority tone.
 * Based on SOP Master & AI Training documents.
 */
function initChatAssistant() {
    const toggleBtn = document.getElementById('chat-toggle');
    const closeBtn = document.getElementById('close-chat');
    const panel = document.getElementById('chat-panel');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat');
    const messagesContainer = document.getElementById('chat-messages');

    if (!panel) return;

    // ═══════════════════════════════════════════════════════════
    // CONVERSATION STATE — Tracks position in the Date-First flow
    // ═══════════════════════════════════════════════════════════
    const session = {
        stage: 'warm_entry',       // warm_entry → date_qualification → rapport → objection_handling → controlled_close → post_booking → escalated
        dateConfirmed: null,       // 'this_friday' | 'this_saturday' | 'future' | 'unsure' | null
        groupType: null,           // 'solo' | 'couple' | 'small_group' | 'large_group'
        groupSize: null,
        objectionsRaised: [],      // Track addressed objections
        bookingLinkSent: false,
        messageCount: 0,
        escalated: false
    };

    // ═══════════════════════════════════════════════════════════
    // ESCALATION KEYWORDS — Triggers human handoff
    // ═══════════════════════════════════════════════════════════
    const ESCALATION_KEYWORDS = {
        large_group: ['corporate', 'company event', 'team building', 'birthday', 'bachelor', 'bachelorette', 'hen party', 'stag', 'special event', 'private event', 'private party', 'custom'],
        angry_tone: ['fuck', 'shit', 'bullshit', 'scam', 'terrible', 'disgusting', 'worst', 'horrible', 'awful', 'rip off', 'ripoff', 'rip-off'],
        legal_language: ['lawyer', 'attorney', 'sue', 'lawsuit', 'legal action', 'court', 'consumer protection', 'report you'],
        refund_conflict: ['chargeback', 'dispute charge', 'charge back', 'want my money back', 'demand refund', 'stolen money'],
        influencer_media: ['influencer', 'content creator', 'youtube', 'youtuber', 'media', 'press', 'journalist', 'review us', 'collab', 'collaboration', 'followers', '10k', '100k', 'tiktok']
    };

    // ═══════════════════════════════════════════════════════════
    // INFORMATION CONTROL — Never disclose these
    // ═══════════════════════════════════════════════════════════
    const CONFIDENTIAL_TOPICS = {
        venues: ['iron balls', 'lennon', 'sing sing', 'chupa', 'levels', 'bobo', 'pastel', '1826'],
        margins: ['profit', 'margin', 'commission', 'how much do you make', 'what do you earn'],
        ratios: ['gender ratio', 'male female ratio', 'how many guys', 'how many girls', 'ratio', 'boy girl'],
        host_pay: ['host salary', 'host commission', 'how much hosts make', 'host pay', 'host earn']
    };

    // ═══════════════════════════════════════════════════════════
    // UI FUNCTIONS
    // ═══════════════════════════════════════════════════════════
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

        // Support HTML in AI messages (for booking links, etc.)
        if (role === 'ai') {
            // For AI messages, we trust our OWN template links but should sanitize the rest if it's external
            // Currently, it's all internal hardcoded templates + the booking success link handler
            msgDiv.innerHTML = content;
        } else {
            // User messages MUST be textContent
            msgDiv.textContent = content;
        }


        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    const showTyping = () => {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-msg typing-indicator';
        typingDiv.textContent = '...'; // Safer than innerHTML for simple text

        typingDiv.id = 'typing-indicator';
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return typingDiv;
    };

    const removeTyping = () => {
        const el = document.getElementById('typing-indicator');
        if (el) el.remove();
    };

    // ═══════════════════════════════════════════════════════════
    // DETECTION HELPERS
    // ═══════════════════════════════════════════════════════════

    function detectEscalation(text) {
        const lower = text.toLowerCase();
        for (const [reason, keywords] of Object.entries(ESCALATION_KEYWORDS)) {
            for (const keyword of keywords) {
                if (lower.includes(keyword)) {
                    return reason;
                }
            }
        }
        // Group size escalation: detect numbers >= 6
        const groupMatch = lower.match(/(\d+)\s*(people|persons|guests|friends|of us|pax|group)/);
        if (groupMatch && parseInt(groupMatch[1]) >= 6) {
            return 'large_group';
        }
        // Also check phrases like "group of 8"
        const groupOfMatch = lower.match(/group\s*(of)?\s*(\d+)/);
        if (groupOfMatch && parseInt(groupOfMatch[2]) >= 6) {
            return 'large_group';
        }
        return null;
    }

    function detectConfidentialQuery(text) {
        const lower = text.toLowerCase();
        for (const [topic, keywords] of Object.entries(CONFIDENTIAL_TOPICS)) {
            for (const keyword of keywords) {
                if (lower.includes(keyword)) {
                    return topic;
                }
            }
        }
        return null;
    }

    function detectDateIntent(text) {
        const lower = text.toLowerCase();
        if (lower.includes('friday') && (lower.includes('this') || lower.includes('coming') || lower.includes('next') || !lower.includes('not'))) return 'this_friday';
        if (lower.includes('saturday') && (lower.includes('this') || lower.includes('coming') || lower.includes('next') || !lower.includes('not'))) return 'this_saturday';
        if (lower.includes('tonight') || lower.includes('today')) {
            const today = new Date().getDay();
            if (today === 5) return 'this_friday';
            if (today === 6) return 'this_saturday';
            return 'unsure';
        }
        if (lower.includes('this weekend') || lower.includes('this week')) return 'this_friday'; // Default to Friday
        if (lower.includes('yes') && (session.stage === 'warm_entry' || session.stage === 'date_qualification')) return 'this_friday';
        if (lower.match(/next\s*(month|week|year)/) || lower.includes('later') || lower.includes('planning') || lower.includes('future')) return 'future';
        if (lower.includes('not sure') || lower.includes('maybe') || lower.includes('unsure') || lower.includes('don\'t know') || lower.includes('thinking')) return 'unsure';
        return null;
    }

    function detectGroupInfo(text) {
        const lower = text.toLowerCase();
        if (lower.includes('solo') || lower.includes('alone') || lower.includes('by myself') || lower.includes('just me') || lower.match(/\b1\s*(person|pax|guest)\b/)) {
            return { type: 'solo', size: 1 };
        }
        if (lower.includes('couple') || lower.includes('two of us') || lower.includes('2 of us') || lower.includes('me and my') || lower.includes('partner')) {
            return { type: 'couple', size: 2 };
        }
        const numMatch = lower.match(/(\d+)\s*(people|persons|guests|friends|of us|pax|mates|buddies)/);
        if (numMatch) {
            const size = parseInt(numMatch[1]);
            if (size >= 8) return { type: 'large_group', size };
            if (size >= 3) return { type: 'small_group', size };
            if (size === 2) return { type: 'couple', size };
            return { type: 'solo', size: 1 };
        }
        return null;
    }

    function detectIntent(text) {
        const lower = text.toLowerCase();

        // Greeting detection
        if (lower.match(/^(hi|hello|hey|hiya|yo|sup|what's up|hola|good\s*(morning|evening|afternoon)|greetings)/)) return 'greeting';

        // Booking intent
        if (lower.match(/(book|reserve|sign up|join|register|sign me up|how do i join|how to book|i want to come|i want in|count me in)/)) return 'booking_request';

        // Price inquiry
        if (lower.match(/(price|cost|how much|fee|charge|expensive|cheap|worth|pay|payment|money|afford|budget|thb|baht|฿)/)) return 'price_objection';

        // Solo concern
        if (lower.match(/(solo|alone|by myself|just me|single|no friends|don't know anyone|lonely|nervous|scared|anxious|worried|shy)/)) return 'solo_concern';

        // Safety concern
        if (lower.match(/(safe|safety|security|danger|secure|women|female|girl|lady|ladies|trust|worried|concern|sketchy|dodgy|legit)/)) return 'safety_concern';

        // Pub crawl confusion
        if (lower.match(/(pub crawl|bar crawl|bar hop|backpacker|party bus|drinking tour|booze|drunk|wasted|smashed|hammered)/)) return 'pub_crawl_confusion';

        // Drinking concern
        if (lower.match(/(don't drink|non.?drinker|sober|no alcohol|teetotal|not a drinker|just about drinking)/)) return 'drinking_concern';

        // Dress code
        if (lower.match(/(dress|wear|outfit|dress code|smart casual|flip.?flop|shorts|cloth|attire|what should i wear)/)) return 'dress_code';

        // Venue inquiry
        if (lower.match(/(which club|which venue|where do we go|what clubs|what bars|venue list|where exactly|which place|name.*club|club.*name)/)) return 'venue_inquiry';

        // Date inquiry
        if (lower.match(/(when|what day|what night|which night|schedule|which day|friday|saturday|weekend|date|available|availability|upcoming)/)) return 'date_check';

        // What's included
        if (lower.match(/(what.*(include|included|get|receive|come with)|include|included|what do i get|what's in|what is in)/)) return 'whats_included';

        // Refund / cancellation
        if (lower.match(/(refund|cancel|cancellation|money back|get back|return|change date|reschedule|postpone)/)) return 'refund_inquiry';

        // Confirmation / 7PM
        if (lower.match(/(confirm|confirmation|guaranteed|will it happen|minimum|enough people|cancelled|cancel event)/)) return 'confirmation_inquiry';

        // How it works
        if (lower.match(/(how does it work|what happens|how it works|tell me more|explain|what is this|what.*about|describe)/)) return 'general_inquiry';

        // Meetup location
        if (lower.match(/(where.*meet|meeting point|meetup|meet up|pickup|pick up|location|where do we start|starting point)/)) return 'meetup_inquiry';

        // Time inquiry
        if (lower.match(/(what time|when.*start|when.*end|how long|duration|hours|finish|start time|end time)/)) return 'time_inquiry';

        // Thank you / bye
        if (lower.match(/(thank|thanks|cheers|appreciate|bye|goodbye|see you|take care|great|awesome|cool|perfect|sounds good)/)) return 'positive_closing';

        return 'general';
    }

    // ═══════════════════════════════════════════════════════════
    // RESPONSE ENGINE — Host Authority System
    // Formula: 1. Acknowledge → 2. Reframe/Clarify → 3. Guide
    // ═══════════════════════════════════════════════════════════

    function generateResponse(text) {
        session.messageCount++;
        const lower = text.toLowerCase();

        // ——— STEP 1: Check Escalation ———
        const escalationReason = detectEscalation(text);
        if (escalationReason) {
            session.escalated = true;
            session.stage = 'escalated';
            return getEscalationResponse(escalationReason);
        }

        // ——— STEP 2: Check Confidential Queries ———
        const confidentialTopic = detectConfidentialQuery(text);
        if (confidentialTopic) {
            return getConfidentialResponse(confidentialTopic);
        }

        // ——— STEP 3: Detect Intent & Respond by Stage ———
        const intent = detectIntent(text);
        const dateIntent = detectDateIntent(text);
        const groupInfo = detectGroupInfo(text);

        // Update session state
        if (dateIntent && !session.dateConfirmed) {
            session.dateConfirmed = dateIntent;
        }
        if (groupInfo) {
            session.groupType = groupInfo.type;
            session.groupSize = groupInfo.size;
            // Large group → escalate
            if (groupInfo.type === 'large_group') {
                session.escalated = true;
                session.stage = 'escalated';
                return getEscalationResponse('large_group');
            }
        }

        // Route through the Date-First stages
        switch (session.stage) {
            case 'warm_entry':
                return handleWarmEntry(intent, dateIntent, text);
            case 'date_qualification':
                return handleDateQualification(intent, dateIntent, text);
            case 'rapport':
                return handleRapport(intent, text);
            case 'objection_handling':
                return handleObjectionHandling(intent, text);
            case 'controlled_close':
                return handleControlledClose(intent, text);
            case 'post_booking':
                return handlePostBooking(intent, text);
            case 'escalated':
                return "This has been flagged for our team. Someone from BEST Nightlife will reach out to you directly. Is there anything else I can help with in the meantime?";
            default:
                return handleWarmEntry(intent, dateIntent, text);
        }
    }

    // ——— STAGE HANDLERS ———

    function handleWarmEntry(intent, dateIntent, text) {
        // Date offered immediately → advance
        if (dateIntent === 'this_friday' || dateIntent === 'this_saturday') {
            session.stage = 'rapport';
            const day = dateIntent === 'this_friday' ? 'Friday' : 'Saturday';
            return `Great — ${day} it is. The night starts at 9:30 PM, moving through 4 curated venues across Sukhumvit with VIP entry, dedicated hosts, and smooth transport between stops.\n\nWill you be joining solo or bringing a group?`;
        }

        if (dateIntent === 'future') {
            session.stage = 'date_qualification';
            return "No rush. We run every Friday and Saturday. When you're closer to your dates in Bangkok, reach out and we'll get you sorted.\n\nAnything you'd like to know about the experience in the meantime?";
        }

        if (dateIntent === 'unsure') {
            session.stage = 'date_qualification';
            return "No worries. We run every Friday and Saturday. If you're still confirming your plans, just know — we finalize the group by 7 PM on the day. Plenty of time to decide.\n\nWhat brings you to Bangkok?";
        }

        switch (intent) {
            case 'greeting':
                return "Hey — welcome. 🙌\n\nBangkok Club Crawl is a structured nightlife experience. 4 curated venues, dedicated hosts, VIP entry, and smooth transport between stops. Every Friday and Saturday on Sukhumvit.\n\nAre you in Bangkok this Friday or Saturday?";

            case 'booking_request':
                session.stage = 'date_qualification';
                return "Happy to help you get booked in. First — are you looking at this Friday or Saturday?";

            case 'price_objection':
                session.stage = 'objection_handling';
                if (!session.objectionsRaised.includes('price')) session.objectionsRaised.push('price');
                return "The experience is ฿1,500 per person. That covers 4 premium venues with VIP entry, dedicated hosts guiding the flow, smooth transport between stops, and welcome drinks.\n\nIt's structured access — not just club entry. The night is designed to flow.\n\nAre you in Bangkok this weekend?";

            case 'solo_concern':
                session.stage = 'objection_handling';
                if (!session.objectionsRaised.includes('solo')) session.objectionsRaised.push('solo');
                session.groupType = 'solo';
                session.groupSize = 1;
                return "That's actually how most of our guests join — solo. The night is structured to make connection happen naturally. You'll arrive alone and leave with a crew.\n\nOur hosts are there specifically to manage the social flow so nobody's left standing on the side.\n\nAre you in Bangkok this Friday or Saturday?";

            case 'general_inquiry':
                return "Bangkok Club Crawl is a structured nightlife experience across 4 curated Sukhumvit venues. Each stop is designed to escalate the energy — from a social warmup to a full peak by the final club.\n\nYou get VIP entry, dedicated hosts, transport between stops, and welcome drinks. It's designed to flow — not random, not chaotic.\n\nAre you in Bangkok this Friday or Saturday?";

            case 'whats_included':
                return "Here's what's included:\n\n• 4 curated venues across Sukhumvit\n• VIP / priority entry at each stop\n• Dedicated hosts guiding the night's flow\n• Transport between venues\n• Welcome drinks at selected stops\n• An international, curated crowd\n\nThe night runs from 9:30 PM and moves through a deliberate energy arc — social warmup to peak.\n\nAre you in Bangkok this weekend?";

            case 'date_check':
                session.stage = 'date_qualification';
                return "We run every Friday and Saturday on Sukhumvit. The night starts at 9:30 PM.\n\nWhich night works better for you?";

            case 'safety_concern':
                if (!session.objectionsRaised.includes('safety')) session.objectionsRaised.push('safety');
                return "Safety and comfort are built into the structure. Our dedicated hosts manage the vibe and group flow the entire night. It's high energy but always controlled — we design the atmosphere, we don't leave it to chance.\n\nAre you considering this Friday or Saturday?";

            default:
                return "Thanks for reaching out. Bangkok Club Crawl is a curated nightlife experience — 4 venues, VIP entry, dedicated hosts, and smooth transport. Every Friday and Saturday.\n\nAre you in Bangkok this weekend?";
        }
    }

    function handleDateQualification(intent, dateIntent, text) {
        if (dateIntent === 'this_friday' || dateIntent === 'this_saturday') {
            session.stage = 'rapport';
            const day = dateIntent === 'this_friday' ? 'Friday' : 'Saturday';
            return `${day} — solid choice. The night kicks off at 9:30 PM across 4 curated venues on Sukhumvit. VIP entry, hosts, transport — everything's handled.\n\nWill you be joining solo or with a group?`;
        }

        if (dateIntent === 'future') {
            return "Perfect. We run every Friday and Saturday, so whenever your Bangkok dates are locked in, just reach out and we'll sort your spot.\n\nAnything specific you want to know about the experience?";
        }

        if (dateIntent === 'unsure') {
            return "That's completely fine. We confirm events by 7 PM on the day, so there's flexibility. When you're clearer on plans, we'll be here.\n\nIn the meantime — anything you'd like to know?";
        }

        // Handle other intents within this stage
        return handleIntentAtAnyStage(intent, text) || "Got it. Just to get you the right info — are you looking at this Friday or Saturday?";
    }

    function handleRapport(intent, text) {
        const groupInfo = detectGroupInfo(text);
        if (groupInfo) {
            session.groupType = groupInfo.type;
            session.groupSize = groupInfo.size;
        }

        if (session.groupType === 'solo' || intent === 'solo_concern') {
            if (!session.objectionsRaised.includes('solo')) session.objectionsRaised.push('solo');
            session.stage = 'controlled_close';
            return "Perfect. Most guests join solo — it's actually how 70%+ of our crowd arrives. The night is intentionally designed so the ice breaks naturally from the first venue.\n\nOur hosts guide the social energy, so you won't be standing on the sideline. You'll arrive solo, leave with a crew.\n\nWant me to send you the booking link?";
        }

        if (session.groupType === 'couple') {
            session.stage = 'controlled_close';
            return "Great — as a pair, you'll blend right in. The night mixes your crew with the wider group naturally, so you get the best of both: your own dynamic plus a bigger social energy.\n\nReady to lock in your spots?";
        }

        if (session.groupType === 'small_group') {
            session.stage = 'controlled_close';
            return `Nice — a group of ${session.groupSize} fits perfectly. You'll keep your crew while mixing with the wider group naturally. The hosts make sure the energy stays inclusive.\n\nShall I send you the booking link to secure your spots?`;
        }

        // If we don't have group info yet, ask
        return handleIntentAtAnyStage(intent, text) || "Good to have you. Will you be coming solo or with friends?";
    }

    function handleObjectionHandling(intent, text) {
        const response = handleIntentAtAnyStage(intent, text);
        if (response) return response;

        // Check if date has been confirmed during objection handling
        const dateIntent = detectDateIntent(text);
        if (dateIntent === 'this_friday' || dateIntent === 'this_saturday') {
            session.dateConfirmed = dateIntent;
            session.stage = 'rapport';
            const day = dateIntent === 'this_friday' ? 'Friday' : 'Saturday';
            return `Great — ${day} works. Will you be coming solo or with a group?`;
        }

        // After handling objection, guide back to date
        if (!session.dateConfirmed) {
            return "I hear you. Are you in Bangkok this Friday or Saturday? That'll help me get you the right details.";
        }

        session.stage = 'controlled_close';
        return "Those are all fair questions. The short version: it's a premium, structured night — not random chaos. Everything's curated to flow.\n\nReady for me to send the booking link?";
    }

    function handleControlledClose(intent, text) {
        const lower = text.toLowerCase();

        // Positive response → send booking link
        if (lower.match(/(yes|yeah|yep|sure|send it|let's go|let's do it|book|ready|i'm in|count me in|go for it|absolutely|definitely|do it|please|link)/)) {
            session.bookingLinkSent = true;
            session.stage = 'post_booking';
            return "Here you go 👇\n\n<a href='#' onclick=\"document.getElementById('booking-modal').classList.add('active'); document.getElementById('chat-panel').style.display='none'; return false;\" style='color: var(--color-primary); text-decoration: underline; font-weight: 600;'>→ Book Your Spot Now</a>\n\nThe form takes about 60 seconds. Pick your date, add your details, and you're in. Payment is via Stripe — secure and instant.\n\nOnce confirmed, you'll get the meet-up details. Any questions before you book?";
        }

        // Hesitation or new objection
        const objectionResponse = handleIntentAtAnyStage(intent, text);
        if (objectionResponse) return objectionResponse;

        // Still hesitant — no pressure, authority style
        if (lower.match(/(think|maybe|not sure|later|consider|hmm|idk)/)) {
            return "No pressure at all. We run every Friday and Saturday, so the option's always there. If you're still deciding, just know we confirm the group by 7 PM on the day.\n\nFeel free to come back when you're ready — we'll sort your spot.";
        }

        return "Whenever you're ready, I can send the booking link. No rush — we run every weekend. 🙌";
    }

    function handlePostBooking(intent, text) {
        const lower = text.toLowerCase();

        if (intent === 'dress_code') {
            return "Dress code is smart casual. Think clean and styled — no flip-flops, no sports shorts, no sleeveless athletic wear. You don't need to overdress, just look like you planned the outfit.\n\nAnything else you need before the night?";
        }

        if (intent === 'meetup_inquiry') {
            return "The exact meetup location will be shared once your booking is confirmed — you'll receive all the details including the meeting point, time, and what to expect.\n\nAnything else on your mind?";
        }

        if (intent === 'time_inquiry') {
            return "The night starts at 9:30 PM. We recommend arriving a few minutes early. The last venue usually wraps between 2–3 AM depending on the energy of the group.\n\nAnything else?";
        }

        if (intent === 'refund_inquiry') {
            return "Here's how cancellations work:\n\n• Same-day cancellations are non-refundable\n• No-shows are non-refundable\n• If we cancel the event (rare), you'll be offered a reschedule or full refund immediately\n\nFor date changes, reach out to us as early as possible and we'll do our best to accommodate.\n\nAnything else?";
        }

        if (intent === 'confirmation_inquiry') {
            return "We confirm events by 7 PM on the day. Once confirmed, you'll receive the meetup details and a WhatsApp group link to connect with the crew.\n\nThe night is on. 🙌";
        }

        if (intent === 'positive_closing') {
            return "See you on the night. It's going to be a good one. 🙌\n\nBangkok Nights. Done Right.";
        }

        return "You're all set. If anything comes up before the night, just message here. See you soon. 🙌";
    }

    // ——— CROSS-STAGE INTENT HANDLER ———
    // Handles intents that can appear at any stage

    function handleIntentAtAnyStage(intent, text) {
        switch (intent) {
            case 'price_objection':
                if (!session.objectionsRaised.includes('price')) session.objectionsRaised.push('price');
                return "The experience is ฿1,500 per person. That includes:\n\n• 4 premium Sukhumvit venues\n• VIP / priority entry\n• Dedicated hosts managing the flow\n• Transport between stops\n• Welcome drinks\n\nIt's not just venue entry — it's structured access. The night is designed to escalate naturally, with a host guiding every transition.\n\nWorth it? Our guests consistently rate us 5 stars.";

            case 'solo_concern':
                if (!session.objectionsRaised.includes('solo')) session.objectionsRaised.push('solo');
                session.groupType = 'solo';
                session.groupSize = 1;
                return "Most of our guests arrive solo — it's actually the most common way people join. The night is intentionally structured to break the ice from the very first venue.\n\nOur hosts are there to guide the social energy, introduce people naturally, and keep the momentum building. You'll arrive alone and leave with a crew.\n\nNo awkward standing around. That's the whole point.";

            case 'safety_concern':
                if (!session.objectionsRaised.includes('safety')) session.objectionsRaised.push('safety');
                return "Safety and comfort are core to what we do. Our dedicated hosts are with the group the entire night — managing the vibe, the transitions, and the energy.\n\nIt's high-energy but always controlled. We design the atmosphere — we don't leave it to chance. Our crowd is international, respectful, and curated.";

            case 'pub_crawl_confusion':
                if (!session.objectionsRaised.includes('pub_crawl')) session.objectionsRaised.push('pub_crawl');
                return "We get that question — but this isn't a pub crawl. No matching t-shirts, no beer pong, no backpacker chaos.\n\nBangkok Club Crawl is a structured nightlife experience. Think: curated venues, intentional escalation, dedicated hosts, and smooth transport. Every stop is chosen for energy and flow.\n\nIt's guided spontaneity — not random bar hopping.";

            case 'drinking_concern':
                if (!session.objectionsRaised.includes('drinking')) session.objectionsRaised.push('drinking');
                return "This isn't a drinking tour. While welcome drinks are included, the night is really about connection, energy, and flow.\n\nPlenty of guests don't drink heavily — the experience is designed around social momentum, not alcohol. You'll enjoy it either way.";

            case 'dress_code':
                return "Dress code is smart casual. Clean and styled — think: jeans or chinos, a nice shirt or top, clean shoes.\n\nAvoid flip-flops, sports shorts, or sleeveless athletic wear. You don't need to overdress — just look intentional.";

            case 'venue_inquiry':
                return "We visit premium venues across Sukhumvit — each chosen for energy, music, and atmosphere. The route is curated to build momentum, moving from social warmup to full peak.\n\nWe keep the specific lineup flexible because we adapt based on the night's energy and crowd. That's part of what makes it curated, not a fixed checklist.";

            case 'whats_included':
                return "Here's what's included:\n\n• 4 curated Sukhumvit venues\n• VIP / priority entry at each stop\n• Dedicated hosts guiding the flow\n• Transport between venues\n• Welcome drinks at select stops\n• An international, curated crowd\n\nThe night is designed to escalate — from a social spark to full energy.";

            case 'time_inquiry':
                return "The night kicks off at 9:30 PM. We move through 4 venues, with the last stop usually wrapping between 2–3 AM depending on the group's energy.\n\nPlan for a full night out.";

            case 'refund_inquiry':
                return "Our refund policy is straightforward:\n\n• Same-day cancellations: non-refundable\n• No-shows: non-refundable\n• If we cancel the event, you'll be offered a reschedule or full refund immediately\n\nFor any specific situation, you can reach out to our team directly.";

            case 'confirmation_inquiry':
                return "We run every Friday and Saturday. Events are confirmed by 7 PM on the day. Once confirmed, you'll receive all the meetup details and a WhatsApp group link.\n\nIf for some reason the event doesn't go ahead, you'll be offered a reschedule or full refund.";

            case 'meetup_inquiry':
                return "The meetup location is shared after your booking is confirmed. You'll get the exact address, Google Maps link, and timing — everything you need.\n\nThe starting point is always on Sukhumvit, easy to reach.";

            case 'date_check':
                return "We run every Friday and Saturday on Sukhumvit. The night starts at 9:30 PM.\n\nWhich night are you looking at?";

            case 'booking_request':
                if (session.dateConfirmed && (session.dateConfirmed === 'this_friday' || session.dateConfirmed === 'this_saturday')) {
                    session.bookingLinkSent = true;
                    session.stage = 'post_booking';
                    return "Let's get you in 👇\n\n<a href='#' onclick=\"document.getElementById('booking-modal').classList.add('active'); document.getElementById('chat-panel').style.display='none'; return false;\" style='color: var(--color-primary); text-decoration: underline; font-weight: 600;'>→ Book Your Spot Now</a>\n\nPick your date, add your details, and you're confirmed. Payment is via Stripe — secure and instant.";
                }
                if (!session.dateConfirmed) {
                    session.stage = 'date_qualification';
                    return "Happy to get you booked in. First — are you looking at this Friday or Saturday?";
                }
                break;

            case 'positive_closing':
                if (session.bookingLinkSent) {
                    return "See you on the night. It's going to be a good one. 🙌\n\nBangkok Nights. Done Right.";
                }
                return "Glad to help! If you need anything else or want to lock in a spot, just say the word. 🙌";

            case 'greeting':
                return "Hey! 🙌 How can I help? Looking to join the Bangkok Club Crawl?";

            default:
                return null;
        }
        return null;
    }

    // ——— ESCALATION RESPONSES ———

    function getEscalationResponse(reason) {
        switch (reason) {
            case 'large_group':
                return "For groups of 6 or more, we offer tailored experiences. I'll connect you with our team directly — they'll sort out the best setup for your crew.\n\n📩 Reach out to us at: <strong>info@bestnightlifethailand.com</strong>\n\nThey'll get back to you within a few hours.";
            case 'angry_tone':
                return "I understand your frustration, and I want to make sure this gets handled properly. I'm connecting you with our team lead who can address this directly.\n\n📩 Please email: <strong>info@bestnightlifethailand.com</strong>\n\nSomeone will respond to you promptly.";
            case 'legal_language':
                return "I take this seriously. For matters like this, I need to connect you with our management team directly.\n\n📩 Please contact: <strong>info@bestnightlifethailand.com</strong>\n\nThey'll address your concern properly.";
            case 'refund_conflict':
                return "I understand. Refund requests are handled by our team to make sure you're taken care of properly.\n\n📩 Please email: <strong>info@bestnightlifethailand.com</strong> with your booking reference.\n\nThey'll review your case and get back to you.";
            case 'influencer_media':
                return "We'd love to explore that. For media and collaboration inquiries, our team handles those directly.\n\n📩 Reach out to: <strong>info@bestnightlifethailand.com</strong>\n\nThey'll connect with you to discuss the details.";
            default:
                return "This is something I'll need to pass to our team. They'll be able to help you directly.\n\n📩 Email: <strong>info@bestnightlifethailand.com</strong>";
        }
    }

    // ——— CONFIDENTIAL QUERY RESPONSES ———

    function getConfidentialResponse(topic) {
        switch (topic) {
            case 'venues':
                return "We visit premium venues across Sukhumvit — each selected for atmosphere, music, and energy. The lineup is curated to create a deliberate flow, building from social warmup to peak energy.\n\nWe keep the exact lineup flexible to adapt to the night. That's what makes it curated, not a rigid checklist.";
            case 'margins':
            case 'host_pay':
                return "I appreciate the curiosity, but I can't share specifics on internal operations. What I can tell you is that the ฿1,500 covers a premium experience — 4 venues, VIP entry, hosts, transport, and drinks.\n\nAnything else I can help with?";
            case 'ratios':
                return "The group is always a curated, international mix. We focus on creating the right social energy rather than hitting specific numbers. The crowd is diverse, social, and well-matched.\n\nAnything else on your mind?";
            default:
                return "I appreciate the question, but I'm not able to share those details. Happy to help with anything about the experience itself though.";
        }
    }

    // ═══════════════════════════════════════════════════════════
    // MAIN SEND HANDLER
    // ═══════════════════════════════════════════════════════════

    const handleSend = () => {
        const text = input.value.trim();
        if (!text) return;

        addMessage('user', text);
        input.value = '';

        const typingIndicator = showTyping();

        // Simulate natural response delay (800ms - 2000ms)
        const delay = Math.min(800 + text.length * 15, 2000);

        setTimeout(() => {
            removeTyping();
            const response = generateResponse(text);
            addMessage('ai', response);
        }, delay);
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
