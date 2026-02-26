# 🗺️ TASK PLAN — Bangkok Club Crawl Web Application
> **Protocol Zero | Master Build Checklist**
> Created: 2026-02-24 | Status: Phase 1 Complete ✅

---

## Build Philosophy
> "Revenue engine first. Automation second. Community later."
> — nightlife_brain.md, System Hierarchy

**Approach:** Data-First → Design System → Core UI → Booking Flow → AI Chat → Polish → Deploy

---

## Phase 0: Protocol Zero — Foundation ✅
> *Status: COMPLETE*

- [x] Read Nightlife Expert Skill (`SKILL.md`)
- [x] Read Brain File (`nightlife_brain.md`)
- [x] Analyze Design Inspiration screenshots (4 assets)
- [x] Query NotebookLM Strategic Blueprint (AI rules, SOPs, design system)
- [x] Create `findings.md` — Research & Discovery Report
- [x] Create `TASK_PLAN.md` — This file
- [x] Create `Gemini.md` — Project Constitution

---

## Phase 1: Data Architecture & Design System ✅
> *Priority: Define all data schemas before any UI code (Data-First Rule)*

### 1A: JSON Data Schemas ✅
- [x] Define `Guest` schema (personal info, gender, contact, tags)
- [x] Define `Booking` schema (ticket, pricing, payment status, event link)
- [x] Define `Event` schema (date, status, guest count, host, confirmation)
- [x] Define `ChatMessage` schema (role, content, timestamp, metadata)
- [x] Define `ChatSession` schema (guest link, messages[], status)
- [x] Document all schemas in `Gemini.md`

### 1B: Design System (CSS Custom Properties) ✅
- [x] Create `index.css` with full design token system
- [x] Import Google Fonts: Montserrat, Inter, Poppins
- [x] Define responsive breakpoints (mobile-first)
- [x] Create utility classes for common patterns (`.btn-primary`, `.card`, `.glow`)

---

## Phase 2: Core Page Structure ✅
> *Priority: Build the scrollable single-page layout*

### 2A: HTML Skeleton ✅
- [x] Create `index.html` with semantic structure
- [x] SEO meta tags (title, description, OG tags)
- [x] Section landmarks: hero, experience, features, social-proof, faq, footer
- [x] Viewport meta for mobile-first

- [x] Full-viewport dark background
- [x] Centered logo (BEST Nightlife Thailand moon logo)
- [x] Large headline: "Bangkok Club Crawl"
- [x] Subtitle: "STRUCTURED ENERGY · PREMIUM CONNECTION"
- [x] CTA button: "ENTER THE NIGHT →" (pink gradient with glow)
- [x] Subtle ambient animation (neon pulse, not chaotic)

### 2C: Experience Section (3-Ritual System) ✅
- [x] Section heading: "The Night, Designed."
- [x] Visual escalation timeline (The Spark → The Build → The Takeover)
- [x] Energy level indicators (40% → 70% → 90%)
- [x] Short copy for each ritual phase
- [x] Rose gold accent decorations

### 2D: What's Included Section ✅
- [x] 2-column card grid (6 features)
- [x] Rose gold outline icons per card
- [x] Dark card styling with subtle border
- [x] Uppercase feature labels
- [x] Footer tagline: "Not Random. Not Chaotic. Intentionally Designed."

### 2E: Social Proof Section ✅
- [x] Guest testimonial cards
- [x] Star ratings
- [x] "Hosted Weekly" badge
- [x] Guest count / community metrics

### 2F: FAQ Section ✅
- [x] Accordion-style Q&A
- [x] Address top 5 hesitations (solo anxiety, price value, crowd type, drinking concerns, reliability)
- [x] Confident, Host Authority System tone in answers

### 2G: Footer ✅
- [x] Brand tagline: "Bangkok Nights. Done Right."
- [x] Social media links
- [x] Legal links (Terms, Privacy)
- [x] "Official Booking · Hosted Weekly · Bangkok Club Crawl" text

---

## Phase 3: Booking Wizard 🔲
> *Priority: The revenue engine — this is the highest-conversion component*

### 3A: Wizard Flow (Multi-Step Modal)
- [ ] Step 1: "Choose Your Night" — Friday / Saturday selection
- [ ] Step 2: "Guest Details" — Name, email, phone, nationality, gender, group size
- [ ] Step 3: "Checkout" — Ticket summary, quantity selector, total calculation
- [ ] Progress indicator (pink dash markers, matching design inspiration)
- [ ] Back navigation at each step
- [ ] Smooth slide transitions between steps

### 3B: Pricing Logic
- [ ] Display ฿1,500 as public price
- [ ] Gender-based pricing (฿1,500 male / ฿1,200 female) applied in checkout calculation
- [ ] Quantity selector with ± buttons
- [ ] Dynamic total calculation
- [ ] Group size trigger: if 8+ → show "Contact us for private events" message

### 3C: Payment Integration
- [ ] Stripe Checkout integration (or Stripe Payment Links)
- [ ] "Secure Payment via Stripe" badge
- [ ] CTA: "CONTINUE TO PAYMENT →" (pink gradient)
- [ ] Webhook handler stub for payment confirmation
- [ ] Success / failure redirect pages

### 3D: Post-Booking Flow
- [ ] Confirmation screen with booking details
- [ ] "You'll receive WhatsApp details after 7 PM on event day" message
- [ ] Email confirmation template
- [ ] Booking reference number display

---

## Phase 4: AI Chat Assistant 🔲
> *Priority: Conversion assistant + guest support*

### 4A: Chat Widget UI
- [ ] Floating button (bottom-right, pink glow pulse)
- [ ] Slide-up chat panel (mobile-optimized)
- [ ] Message bubbles (user = dark, AI = slightly lighter)
- [ ] Typing indicator animation
- [ ] Chat header with "Bangkok Club Crawl" branding

### 4B: Chat Logic Engine
- [ ] Message handling system (send/receive)
- [ ] Conversation state management
- [ ] Date-First Model implementation
- [ ] Solo vs. Group branching logic
- [ ] Objection handling responses
- [ ] Controlled close with booking link delivery
- [ ] Escalation triggers (6+ guests, angry tone, legal language)

### 4C: Host Authority System Responses
- [ ] Response template library (JSON)
- [ ] Tone validation: confident, calm, structured, direct
- [ ] Acknowledge → Clarify → Guide formula enforcement
- [ ] Information control boundaries (no margins, no minimums, no gender ratios)
- [ ] Follow-up discipline (1 soft nudge after 12h, stop after 24h)

### 4D: Chat Integration
- [ ] API connection (local mock → production API)
- [ ] Conversation persistence (session-based)
- [ ] Booking link injection at appropriate conversation stage
- [ ] Handoff flag for Founder escalation

---

## Phase 5: Interactions & Animations 🔲
> *Priority: Premium feel — "electric but controlled"*

- [ ] Smooth scroll navigation
- [ ] Section reveal animations (fade-up on scroll)
- [ ] Button hover effects (glow expansion)
- [ ] Card hover states (subtle lift + glow)
- [ ] Booking wizard step transitions (slide)
- [ ] Chat widget open/close animation
- [ ] Hero subtle ambient animation (neon pulse)
- [ ] Loading states for payment processing
- [ ] Mobile touch interactions

---

## Phase 6: Responsive & Cross-Browser 🔲
> *Priority: Mobile-first (design inspiration is all mobile)*

- [ ] Mobile layout (< 768px) — primary design target
- [ ] Tablet layout (768px – 1024px)
- [ ] Desktop layout (> 1024px)
- [ ] Touch-friendly tap targets (min 44px)
- [ ] Safari/iOS specific fixes
- [ ] Chrome/Android testing
- [ ] Desktop browser testing (Chrome, Safari, Firefox)

---

## Phase 7: Content & Assets 🔲
> *Priority: Replace all placeholders with real content*

- [ ] Generate/source hero background imagery
- [ ] Create feature icons (rose gold style)
- [ ] Write all section copy (Host Authority System tone)
- [ ] Write FAQ content
- [ ] Create/place BEST Nightlife Thailand logo
- [ ] Social proof content (real or representative testimonials)
- [ ] Legal pages (Terms of Service, Privacy Policy, Refund Policy)

---

## Phase 8: Testing & QA 🔲
> *Priority: Production readiness*

- [ ] Booking flow end-to-end walkthrough
- [ ] Chat assistant conversation scenarios
- [ ] Payment flow testing (Stripe test mode)
- [ ] Mobile device testing (minimum 3 devices)
- [ ] Performance audit (Lighthouse)
- [ ] Accessibility check (contrast ratios, keyboard nav)
- [ ] SEO validation (meta tags, heading hierarchy)
- [ ] Cross-browser validation

---

## Phase 9: Deployment 🔲
> *Priority: Go live*

- [ ] Choose hosting (Vercel / Netlify / custom)
- [ ] Domain configuration
- [ ] SSL certificate verification
- [ ] Stripe production keys
- [ ] Analytics integration (GA4 / similar)
- [ ] Conversion tracking setup
- [ ] Final pre-launch review
- [ ] Deploy to production

---

## 📊 Phase Priority Matrix

| Phase | Priority | Dependency | Est. Complexity |
|-------|----------|-----------|----------------|
| 0: Protocol Zero | P0 ✅ | None | Complete |
| 1: Data + Design System | P0 | Phase 0 | Medium |
| 2: Core Page Structure | P0 | Phase 1 | Medium |
| 3: Booking Wizard | P0 | Phase 2 | High |
| 4: AI Chat Assistant | P1 | Phase 2 | High |
| 5: Interactions | P1 | Phase 2 | Medium |
| 6: Responsive | P1 | Phase 2 | Medium |
| 7: Content & Assets | P2 | Phase 2 | Low |
| 8: Testing & QA | P2 | All above | Medium |
| 9: Deployment | P3 | Phase 8 | Low |

---

*This task plan is governed by `Gemini.md` — the Project Constitution.*
