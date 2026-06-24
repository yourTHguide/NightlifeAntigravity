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
            price: "Male: 1,500 THB\nFemale: 1,200 THB",
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
                window.location.href = `/book?night=${lookupDay.toLowerCase()}`;
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
        window.location.href = `/book?night=${currentDay}`;
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
                            <path d="M12 2L15 4.5L18.5 4L20 7.5L23 9.5L21.5 13L23 16.5L20 18.5L18.5 22L15 21.5L12 24L9 21.5L5.5 22L4 18.5L1 16.5L2.5 13L1 9.5L4 7.5L5.5 4L9 4.5L12 2Z" fill="#EA003A"/>
                            <path d="M10 16L6 12L7.4 10.6L10 13.2L16.6 6.6L18 8L10 16Z" fill="#111114"/>
                        </svg>
                    </span></h3>
                    <span class="role-capsule">${host.role}</span>
                    <p class="host-short-desc">"${host.shortDesc}"</p>
                    <p class="host-stat-line"><span class="text-gradient-gold">★</span> ${host.stats}</p>
                </div>
                <div class="host-expand-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="#EA003A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
 * 🧙‍♂️ Initialize Booking Wizard (Redirect)
 */
function initBookingWizard() {
    const openBtn = document.getElementById('start-booking');
    if (openBtn) {
        openBtn.onclick = () => window.location.href = '/book';
    }
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

    bookingTriggers.forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = '/book';
        });
    });

    // Header scroll background effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

const headerEl = document.querySelector('.header');
if (headerEl) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      headerEl.classList.add('nav-scrolled');
    } else {
      headerEl.classList.remove('nav-scrolled');
    }
  });
}

