document.addEventListener("DOMContentLoaded", () => {
    const experiences = [
        { 
            tier: "EXPERIENCE 01 / 14",
            title: "Yacht Party — Pattaya", 
            price: "From 3,000 THB / person", 
            pills: ["Private Cruise", "Sunset View", "10-30 Pax"], 
            category: "LUXURY",
            img: "assets/images/Yacht Party.jpg", 
            inc: "4-hour private charter, captain and crew, sound system, drinks package, and a dedicated party host." 
        },
        { 
            tier: "EXPERIENCE 02 / 14",
            title: "Pool Villa Party", 
            price: "From 4,800 THB / person", 
            pills: ["Private Villa", "DJ Included", "No Curfew"], 
            category: "PRODUCTION",
            img: "assets/images/Pool villa party1.jpg", 
            inc: "Luxury villa matching your group size, professional DJ, sound & light setup, and full event hosting." 
        },
        { 
            tier: "EXPERIENCE 03 / 14",
            title: "Penthouse Suite Party", 
            price: "From 25,000 THB flat", 
            pills: ["Your Space", "Club Lights", "Private DJ"], 
            category: "PRODUCTION",
            img: "assets/images/card-penthouse.jpeg", 
            inc: "We bring the club to your suite. Includes a pro DJ for 3 hours, premium sound, party lighting, and clean setup/breakdown." 
        },
        { 
            tier: "EXPERIENCE 04 / 14",
            title: "Proposal Night", 
            price: "From 20,000 THB flat", 
            pills: ["Rooftop VIP", "Champagne", "Photographer"], 
            category: "CELEBRATION",
            img: "assets/images/hero.jpeg", /* fallback */
            inc: "Premium rooftop table setup, senior host coordinator, 1 bottle of champagne, flowers, and a hidden photographer." 
        },
        { 
            tier: "EXPERIENCE 05 / 14",
            title: "Anniversary Night", 
            price: "From 10,000 THB flat", 
            pills: ["Rooftop Dinner", "Cocktails", "Couples"], 
            category: "CELEBRATION",
            img: "assets/images/hero.jpeg", /* fallback */
            inc: "Ultra-premium table booking, signature cocktails, fresh flowers at the table, and fully customized planning." 
        },
        { 
            tier: "EXPERIENCE 06 / 14",
            title: "Bachelor Night Out", 
            price: "From 2,000 THB / person", 
            pills: ["Stag Party", "VIP Transport", "3 Venues"], 
            category: "CELEBRATION",
            img: "assets/images/card-bachelor.jpeg", 
            inc: "High-energy 3-club tour, premium party sprinter with sound system, free welcome shots, and a private group host." 
        },
        { 
            tier: "EXPERIENCE 07 / 14",
            title: "Bachelorette Night", 
            price: "From 2,000 THB / person", 
            pills: ["Girls Night", "VIP Entry", "Party Sprinter"], 
            category: "CELEBRATION",
            img: "assets/images/hen-party.jpg", 
            inc: "Tailored premium venue route, private luxury sprinter transport, free welcome shots, hen prop kit, and full hosting." 
        },
        { 
            tier: "EXPERIENCE 08 / 14",
            title: "Birthday Night Out", 
            price: "From 2,000 THB / person", 
            pills: ["Celebration", "VIP Access", "Birthday Surprise"], 
            category: "CELEBRATION",
            img: "assets/images/birthday party.JPG", 
            inc: "Curated 2-3 venue tour, express line bypass, private sprinter lounge, welcome shots, and full birthday surprise coordination." 
        },
        { 
            tier: "EXPERIENCE 09 / 14",
            title: "Private Club Crawl", 
            price: "From 1,500 THB / person", 
            pills: ["Private Group", "Line Bypass", "Custom Clubs"], 
            category: "LUXURY",
            img: "assets/images/Bangkok Club Crawl.png", 
            inc: "The ultimate custom Bangkok club tour. Private transport, express skip-the-line club access, welcome shots, and your own host." 
        },
        { 
            tier: "EXPERIENCE 10 / 14",
            title: "VIP Table Bookings", 
            price: "Pricing on inquiry — submit details for a custom proposal within 4 hours.", 
            pills: ["Top Clubs", "Skip Lines", "Best Tables"], 
            category: "LUXURY",
            img: "assets/images/vip-table.jpg", 
            inc: "Access to the best tables at Sing Sing, Levels, and premier venues. Instant entry list skip-the-line validation. (Venue minimum spends apply)." 
        },
        { 
            tier: "EXPERIENCE 11 / 14",
            title: "Corporate Team Night", 
            price: "From 1,800 THB / person", 
            pills: ["Companies", "Team Building", "Full Transport"], 
            category: "CELEBRATION",
            img: "assets/images/card-corporate.jpeg", 
            inc: "Smooth, safe, and exciting venue itineraries designed for corporate groups. Includes transport, drinks, and full host management." 
        },
        { 
            tier: "EXPERIENCE 12 / 14",
            title: "Rooftop Private Buyout", 
            price: "Pricing on inquiry — submit details for a custom proposal within 4 hours.", 
            pills: ["Skyline Views", "Full Venue", "Custom Budget"], 
            category: "LUXURY",
            img: "assets/images/card-rooftop.jpeg", 
            inc: "Complete private buyout of Bangkok’s top rooftop spaces. Full concept setup, guest management, and staffing included." 
        },
        { 
            tier: "EXPERIENCE 13 / 14",
            title: "Brand & Creator Events", 
            price: "Pricing on inquiry — submit details for a custom proposal within 4 hours.", 
            pills: ["Agencies", "Launch Party", "Media Ready"], 
            category: "PRODUCTION",
            img: "assets/images/Bangkok Mob.png", 
            inc: "Access to partner clubs, lighting optimized for content creation, local network activation, and full on-ground event management." 
        },
        { 
            tier: "EXPERIENCE 14 / 14",
            title: "Immersive Themed Productions", 
            price: "Pricing on inquiry — submit details for a custom proposal within 4 hours.", 
            pills: ["Bangkok Mob", "Masquerade", "100+ Guests"], 
            category: "PRODUCTION",
            img: "assets/images/BangkokMasquerade-218.jpg", 
            inc: "Turnkey high-concept large events. Complete set design, venue transformation, specialized visual effects, and custom talent casting based on our landmark concepts like Bangkok Mob and Bangkok Masquerade." 
        }
    ];

    const deckContainer = document.getElementById('deck-container');
    const bottomSheetOverlay = document.getElementById('bottom-sheet-overlay');
    const dragHandle = document.getElementById('drag-handle');
    const closeSheet = document.getElementById('close-sheet');
    let currentIndex = 0;

    // Helper to generate a pill HTML string
    const generatePills = (pillsArray) => {
        return pillsArray.map(pill => `<span class="pill">${pill}</span>`).join('');
    };

    // Render the cards dynamically
    experiences.forEach((exp, index) => {
        const card = document.createElement('div');
        card.classList.add('deck-card');
        
        // Initial state logic
        if (index === 0) card.classList.add('front');
        else if (index === 1) card.classList.add('middle');
        else if (index === 2) card.classList.add('back');
        else card.classList.add('hidden');
        
        card.dataset.index = index;
        // Fix for missing image fallback
        card.style.backgroundImage = `url('${exp.img || "assets/images/hero.jpeg"}')`;

        card.innerHTML = `
            <div class="card-category">${exp.category || "VIP"}</div>
            <div class="card-content">
                <div class="tier-label">${exp.tier}</div>
                <div class="card-bottom">
                    <h3 class="card-title" style="font-weight: 700;">${exp.title}</h3>
                    <div class="pill-container">
                        ${generatePills(exp.pills)}
                    </div>
                    <button class="btn-glow card-cta">VIEW DETAILS</button>
                </div>
            </div>
        `;
        
        deckContainer.appendChild(card);
    });

    const cards = Array.from(document.querySelectorAll('.deck-card'));

    const updateDeck = () => {
        cards.forEach((card, index) => {
            card.classList.remove('front', 'middle', 'back', 'hidden');
            
            // Calculate relative index based on current
            let relativeIndex = index - currentIndex;
            
            // For continuous looping (optional, but requested simple cycle)
            if (relativeIndex < 0) {
                // Cards before the current one stay hidden in the stack
                card.classList.add('hidden');
            } else if (relativeIndex === 0) {
                card.classList.add('front');
            } else if (relativeIndex === 1) {
                card.classList.add('middle');
            } else if (relativeIndex === 2) {
                card.classList.add('back');
            } else {
                card.classList.add('hidden');
            }
        });
    };

    const nextCard = () => {
        if (currentIndex < experiences.length - 1) {
            currentIndex++;
            updateDeck();
        } else {
            // Loop back to beginning if desired
            currentIndex = 0;
            updateDeck();
        }
    };

    const prevCard = () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateDeck();
        } else {
            currentIndex = experiences.length - 1;
            updateDeck();
        }
    };

    // Bind navigation chevrons if they exist
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if (btnPrev && btnNext) {
        btnPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            prevCard();
        });
        btnNext.addEventListener('click', (e) => {
            e.stopPropagation();
            nextCard();
        });
    }

    // Swipe handling logic for touch screens
    let touchStartX = 0;
    let touchEndX = 0;

    deckContainer.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    deckContainer.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {passive: true});

    const handleSwipe = () => {
        if (touchEndX < touchStartX - 50) {
            // Swiped left
            nextCard();
        }
        if (touchEndX > touchStartX + 50) {
            // Swiped right
            prevCard();
        }
    };

    // Click & Drag mouse swipe support for desktop users
    let isDragging = false;
    let dragStartX = 0;

    deckContainer.addEventListener('mousedown', e => {
        // Only trigger if clicking a card itself (not CTA)
        if (e.target.closest('.card-cta')) return;
        isDragging = true;
        dragStartX = e.clientX;
    });

    window.addEventListener('mouseup', e => {
        if (!isDragging) return;
        isDragging = false;
        let dragEndX = e.clientX;
        if (dragEndX < dragStartX - 80) {
            nextCard();
        } else if (dragEndX > dragStartX + 80) {
            prevCard();
        }
    });

    // Click handler for front card CTA to open modal
    deckContainer.addEventListener('click', (e) => {
        const clickedCard = e.target.closest('.deck-card');
        if (!clickedCard) return;

        // If they clicked the front card or CTA
        if (clickedCard.classList.contains('front')) {
            openBottomSheet(currentIndex);
        } else if (clickedCard.classList.contains('middle')) {
            // Just advance
            nextCard();
        }
    });

    // Bottom Sheet Logic
    const openBottomSheet = (index) => {
        const exp = experiences[index];
        document.getElementById('sheet-title').innerText = exp.title;
        document.getElementById('sheet-price').innerText = exp.price;
        document.getElementById('sheet-inclusions').innerText = exp.inc;
        
        // Update WhatsApp link based on experience
        const message = encodeURIComponent(`Hi BEST Nightlife! I'm interested in the ${exp.title} experience.`);
        document.getElementById('sheet-btn').href = `https://wa.me/66660399569?text=${message}`;
        
        bottomSheetOverlay.classList.add('active');
    };

    const closeSheetFn = () => {
        bottomSheetOverlay.classList.remove('active');
    };

    closeSheet.addEventListener('click', closeSheetFn);
    dragHandle.addEventListener('click', closeSheetFn);
    bottomSheetOverlay.addEventListener('click', (e) => {
        if (e.target === bottomSheetOverlay) closeSheetFn();
    });

});
