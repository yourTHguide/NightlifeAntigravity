# 📋 Findings Report — Bangkok Club Crawl Web Application
> **Protocol Zero | Phase 1: Research & Discovery**
> Generated: 2026-02-24 | Sources: Nightlife Expert Skill, nightlife_brain.md, NotebookLM Strategic Blueprint, Design Inspiration Assets

---

## 1. Intelligence Sources Consumed

| # | Source | Type | Key Contribution |
|---|--------|------|-----------------|
| 1 | `SKILL.md` (Nightlife Expert) | Skill File | Identity core, SOPs, brand rules, communication system |
| 2 | `nightlife_brain.md` | Brain File | Full system source of truth — pricing, venue policy, visual system, builder protocol |
| 3 | NotebookLM — "The Bangkok Club Crawl Strategic Blueprint" (32 sources) | MCP Notebook | AI communication rules, Host Authority System, sales flow, 11 SOPs, 3-Ritual Escalation, private group triggers |
| 4 | `design_inspiration/hero_section_idea.png` | Screenshot | Dark hero with moon logo, serif headline "Bangkok Club Crawl", neon pink CTA "ENTER THE NIGHT →" |
| 5 | `design_inspiration/booking_flow_style.png` | Screenshot | Step-based booking wizard — "Let's set your night." with Friday/Saturday selection, progress indicator in pink dashes |
| 6 | `design_inspiration/Check_out_style.png` | Screenshot | Checkout card with ฿1,500 pricing, quantity selector, Stripe badge, pink gradient CTA "CONTINUE TO PAYMENT →" |
| 7 | `design_inspiration/Included_features.png` | Screenshot | 6-card grid with rose gold icons: Curated Venues, VIP Entry, Hosts, Transportation, Welcome Drinks, Balanced Crowd |

---

## 2. North Star Definition

**Singular Desired Outcome:** Build a high-converting, premium interactive web app for the Bangkok Club Crawl that:
- Handles guest inquiries via an AI-powered chat assistant (Host Authority System tone)
- Showcases the structured nightlife experience with electric, premium visuals
- Provides a seamless, friction-reducing booking flow (Discover → Book → Pay → Confirm)
- Converts solo travelers and small groups into paid attendees
- Replaces OTA dependency with direct booking revenue

---

## 3. Customer & Market Intelligence

### 3.1 Primary Audience
- **Demographics:** International travelers, expats, digital nomads, young professionals, solo travelers (Age 23–38)
- **Geography:** Visitors to Bangkok, primarily staying in the Sukhumvit corridor
- **Psychographics:** Want to meet people naturally. Fear awkward solo bar experiences. Seek structured, safe nightlife. Willing to pay premium for curation.

### 3.2 Customer Hesitations (Must Address in UI)
| Hesitation | UI/UX Solution |
|-----------|---------------|
| "I'm nervous to go alone." | Solo traveler messaging: "Most guests arrive solo. Leave with a crew." |
| "Is it worth 1,500 THB?" | Value framing: Curated venues + VIP entry + host + transport + drinks |
| "What kind of crowd joins?" | Social proof: testimonials, crowd composition messaging |
| "Is this just a drinking party?" | "Structured Energy. Premium Connection." positioning |
| "Will it actually happen?" | Confidence signals: "Hosted Weekly" badge, review counts |

### 3.3 Customer Journey (Friction Reduction Map)
```
Discover → Evaluate → Clarify → Book → Confirm → WhatsApp → Attend → Repeat/Refer
   ↓          ↓         ↓        ↓        ↓          ↓          ↓          ↓
  Hero     Features   AI Chat   Wizard   Payment   Auto-Join   3-Ritual   Review
 Section   Section   Assistant  Flow     Webhook   Group       System     Prompt
```

---

## 4. Business Logic Requirements

### 4.1 Pricing Structure
| Ticket Type | Price | Notes |
|-------------|-------|-------|
| Standard (Direct Booking) | ฿1,500 / person | Public price, no gender split shown on web |
| Internal: Male | ฿1,500 THB | Backend logic only |
| Internal: Female | ฿1,200 THB | Backend logic only — **not displayed in UI** |
| Private/VIP Events | Custom quote | Founder-quoted. Triggered at 8+ guests |

> ⚠️ **Decision Required:** The design inspiration shows ฿1,500 flat. The brain file specifies gendered pricing. **Recommendation:** Show ฿1,500 as the public price. Apply gendered pricing logic server-side during checkout via a gender field in the booking form.

### 4.2 Event Confirmation Logic (The 7 PM Rule)
1. At **7:00 PM sharp** on event day, check paid guest count
2. **≥ 5 paid guests** → Event confirmed → Create WhatsApp group → Send meetup details
3. **< 5 paid guests** → Founder decides: merge, reschedule, or run anyway
4. Founder can override minimum for strategic reasons (influencers, high-value guests)
5. AI must **never proactively mention** the minimum threshold

### 4.3 Private Group Triggers
- **8+ guests** in a single inquiry
- Keywords: "corporate", "birthday", "bachelor/bachelorette", "something special"
- Custom route or timing requests
- **Action:** Escalate to Founder. AI never quotes custom pricing.

### 4.4 Payment & Refund Policy
- **Advance payment required** — no pay-on-arrival
- **Payment processor:** Stripe (webhook-based confirmation)
- **Same-day cancellations:** Non-refundable
- **No-shows:** Not eligible for refunds
- **OTA cancellations:** Follow platform's policy
- **Event cancellation (< 5 guests):** Offer reschedule first, then full refund if declined
- **AI has NO authority to issue refunds**

### 4.5 Inclusions (What's in the Ticket)
| Included ✅ | Not Included ❌ |
|-------------|----------------|
| Entry to 4 curated venues | Hotel pickup/drop-off |
| Free VIP entry | Unlimited drinks |
| Dedicated experience hosts | Bottle service (unless arranged) |
| Smooth private transportation | |
| Welcome drinks (select stops) | |
| Balanced crowd design | |

---

## 5. AI Chat Assistant Specifications

### 5.1 Host Authority System — Tone Rules
- **Voice:** Confident, calm, structured, direct
- **Never:** Desperate, chaotic, slang-heavy, hype-driven
- **Formula:** Every reply = Acknowledge → Clarify/Reframe → Guide next step
- **Language:** Short paragraphs, clear structure. No "bro", no excessive emojis, no over-apologizing

### 5.2 Sales Conversation Flow (Date-First Model)
```
Step 1: Warm Entry + Date Qualification
  → "Are you in Bangkok this Friday or Saturday?"
  → No close attempt without date clarity

Step 2: Interest Branching
  → Yes (this weekend) → Move to rapport layer
  → Not sure → Soft-hold: "Confirmation usually happens by 7 PM on the day"
  → Future date → Nurture: "Message us closer to your dates"

Step 3: Solo vs Group Personalization
  → Solo: "Most guests join solo — the night is designed to break the ice naturally"
  → Group (2-5): "You'll mix naturally while keeping your own crew"
  → Group (6+): Escalate to Founder

Step 4: Objection Handling
  → Identify emotional root → Reframe calmly → Reduce friction → Guide next action
  → "Too expensive" → Reframe as structured access, never offer discount

Step 5: Controlled Close
  → "If you're around Friday, I can send the booking link now"
  → Link sent ONLY after date confirmed + objections addressed
```

### 5.3 AI Behavioral Boundaries
- **Never send booking link in first message**
- **Never discuss:** margins, host commissions, gender ratios, internal minimums
- **Urgency:** Time-based only ("Events run every weekend"), never volume-based ("only 2 spots left!")
- **Escalate to Founder:** angry tones, legal language, refund conflicts, 6+ groups, influencer/media
- **Abandoned payment follow-up:** 1 soft message after 12 hours, stop after 24 hours
- **Confirmation message:** Only after Stripe webhook success

---

## 6. Design System Specifications (from NotebookLM + Brain File + Design Inspiration)

### 6.1 Color System
| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#FF2D95` (Electric Pink) | CTAs, highlights, active states, accent ONLY |
| `--color-dark-base` | `#111114` | Primary backgrounds, hero sections |
| `--color-dark-surface` | `#1C1C1E` | Cards, elevated surfaces |
| `--color-white` | `#FFFFFF` | Headlines, high-contrast text |
| `--color-gray` | `#8E8E93` | Subtext, dividers, disabled states |
| `--color-rose-gold` | `linear-gradient(135deg, #B76E79, #E8C4A0)` | Premium accents, icons, subtle highlights |
| **Visual Balance Rule** | 45% Dark Base / 35% White / 20% Pink Accent | Global layout distribution |

### 6.2 Typography
| Role | Font Family | Size Range | Weight |
|------|------------|------------|--------|
| H1 (Hero) | Montserrat / Sora | 36–48px | Bold (700) |
| H2 (Section) | Montserrat / Poppins | 24–32px | SemiBold (600) |
| H3 (Card) | Poppins | 18–22px | SemiBold (600) |
| Body | Inter / Poppins | 14–16px | Regular (400) |
| Small/Caption | Inter | 12–13px | Regular (400) |
| **Rule:** Max 3 font weights. No serif. No decorative. | | | |

### 6.3 UI Component Patterns (from Design Inspiration)
| Component | Pattern |
|-----------|---------|
| **Hero Section** | Full-dark background, centered logo, large serif-style headline, subtitle in tracked uppercase, pink gradient CTA button with glow |
| **Booking Wizard** | Multi-step flow with pink dash progress indicator, "Let's set your night." header, card-style selection (Friday/Saturday), back navigation |
| **Checkout Card** | Dark card with subtle border, ticket label + price in gold, quantity ± selector, total in gold, Stripe badge, pink gradient CTA |
| **Features Grid** | 2-column grid of dark cards with rose gold outline icons, uppercase labels, tagline below grid |
| **Buttons** | Pink gradient background (#FF2D95), white text, border-radius 8-12px, subtle glow on hover, arrow indicator (→) |
| **Glow Effects** | Sparingly — button hovers, hero accents only. Never flashing or chaotic. |

### 6.4 Design Emotion Rules
✅ **Electric but controlled** — ❌ Never chaotic
✅ **Premium but friendly** — ❌ Never cheap or flyer-like
✅ **Neon pulse inside structured luxury** — ❌ Never rainbow neon or heavy gradients
✅ **Luxury through restraint** — ❌ Never excessive motion or glow

---

## 7. The 3-Ritual Escalation System (Experience Framework)

This is the core product logic that the UI must communicate:

| Ritual | Name | Energy Level | Goal | Host Action |
|--------|------|-------------|------|-------------|
| 1 | **The Spark** | 40% | Lower social anxiety, establish belonging | Welcome toast, greetings, signal guided night |
| 2 | **The Build** | 70% | Cross-group interaction, strangers → crew | "We move together" transitions, crew photo |
| 3 | **The Takeover** | 90% | Shared climax, peak memory | Anchor: "Bangkok Nights. Done Right." Intentional close |

**UI Implication:** The experience section should visually communicate this escalation — potentially as a timeline or journey graphic showing energy building.

---

## 8. Technical Requirements

### 8.1 Core Pages / Sections
1. **Hero Section** — First impression, CTA to booking
2. **Experience Overview** — 3-Ritual system, what makes this different
3. **What's Included** — 6-feature grid
4. **Social Proof** — Testimonials, review highlights
5. **Booking Wizard** — Multi-step: Select Night → Guest Details → Checkout
6. **AI Chat Assistant** — Floating widget, Host Authority System
7. **FAQ Section** — Address common hesitations
8. **Footer** — Brand tagline, social links, legal

### 8.2 Data Architecture (Data-First Rule)
Must define JSON schemas for:
- **Booking** (the transaction)
- **Guest** (the person)
- **Event** (the scheduled crawl)
- **Chat Message** (AI conversation)
- **Chat Session** (conversation thread)

### 8.3 Integration Points
| System | Purpose | Priority |
|--------|---------|----------|
| Stripe | Payment processing + webhook confirmation | P0 |
| WhatsApp (via API) | Post-confirmation group creation | P1 |
| CRM | Guest tagging, interest tracking, follow-up automation | P1 |
| Analytics | Conversion tracking, funnel analysis | P2 |

---

## 9. Key Design Decisions & Recommendations

1. **Mobile-First:** Design inspiration is entirely mobile. Build mobile-first with responsive desktop adaptation.
2. **Single-Page App Feel:** All sections on one scrollable page with smooth transitions. Booking wizard as modal/overlay.
3. **Gendered Pricing Hidden:** Show ฿1,500 publicly. Collect gender in booking form. Apply discount server-side.
4. **AI Chat Widget:** Bottom-right floating button with pink glow. Opens as slide-up panel on mobile.
5. **No Venue Names in UI:** Per policy, venues rotate. Show "4 Curated Venues" but never lock names publicly.
6. **Stripe Checkout:** Use Stripe Checkout or Payment Links for fastest integration. Webhook confirms booking.
7. **WhatsApp Integration:** Post-7PM confirmation only. Link in confirmation message, not on main site.

---

## 10. Risk & Constraint Log

| Risk | Mitigation |
|------|-----------|
| Low conversion from chat abandonment | 12-hour soft follow-up automation |
| Guest anxiety about solo attendance | Prominent solo traveler messaging throughout |
| Price objection at ฿1,500 | Value framing (not discount). Feature grid as social proof. |
| Event cancellation (< 5 guests) | 7 PM rule is reactive info only. Build confidence, not doubt. |
| OTA dependency | Direct booking incentives (faster confirmation, WhatsApp access) |
| Scope creep | TASK_PLAN.md phases with clear boundaries |

---

*End of Findings Report. This document feeds directly into `TASK_PLAN.md` and `Gemini.md`.*
