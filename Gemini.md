# 🏛️ Gemini.md — Project Constitution
## Bangkok Club Crawl Web Application
> **This file is the supreme governance document for all code generation, design decisions, and AI behavior in this project.**
> If any file, instruction, or suggestion conflicts with this document, **this document overrides.**

---

## 📌 Section 0: Identity

| Field | Value |
|-------|-------|
| **Project Name** | Bangkok Club Crawl |
| **Business Entity** | BEST Nightlife Thailand |
| **Tagline** | Bangkok Nights. Done Right. |
| **Product Type** | Premium interactive web application |
| **North Star** | High-converting, premium web app for guest inquiries, experience showcase, and seamless booking |
| **Builder Protocol** | Read this file before generating ANY web page, booking flow, AI logic, automation, dashboard, copy, or feature |

---

## 📌 Section 1: Brand Identity Lock

> Bangkok Club Crawl is: **Neon energy inside structured control. Authority without arrogance. Social without chaos.**

### 1.1 What We Are
- Structured nightlife experiences in Bangkok
- A guided, curated nightlife flow across selected Sukhumvit venues
- Intentional escalation, seamless transitions, host-led social energy, controlled atmosphere
- **We design flow, not chaos.**

### 1.2 What We Are NOT
- ❌ A pub crawl
- ❌ Backpacker chaos
- ❌ Cheap party bus culture
- ❌ A drinking tour
- ❌ Aggressive club promoter energy

### 1.3 Brand Personality
| ✅ We Are | ❌ We Are Not |
|-----------|-------------|
| Electric | Reckless |
| Confident | Loud |
| Social | Awkward |
| Structured | Rigid |
| Premium but approachable | Exclusive or elitist |
| Organized chaos (guided spontaneity) | Uncontrolled chaos |

---

## 📌 Section 2: Visual Design System

### 2.1 Color Tokens (CSS Custom Properties)
```css
:root {
  /* === PRIMARY PALETTE === */
  --color-primary: #FF2D95;          /* Electric Pink — CTAs, highlights, active states ONLY */
  --color-primary-glow: rgba(255, 45, 149, 0.4);  /* Glow effect for buttons/accents */
  --color-primary-gradient: linear-gradient(135deg, #FF2D95, #FF6B9D); /* CTA buttons */

  /* === DARK BASE === */
  --color-dark-base: #111114;        /* Primary background — hero, main sections */
  --color-dark-surface: #1C1C1E;     /* Cards, elevated surfaces, modals */
  --color-dark-elevated: #2C2C2E;    /* Hover states, active cards */

  /* === NEUTRALS === */
  --color-white: #FFFFFF;            /* Headlines, high-contrast text */
  --color-gray: #8E8E93;            /* Subtext, dividers, disabled states */
  --color-gray-light: #AEAEB2;       /* Secondary text */
  --color-border: rgba(255, 255, 255, 0.08); /* Subtle card borders */

  /* === ACCENT === */
  --color-rose-gold: #B76E79;        /* Premium accents, icons */
  --color-rose-gold-gradient: linear-gradient(135deg, #B76E79, #E8C4A0); /* Icon highlights */
  --color-gold: #D4AF37;             /* Price display, premium indicators */

  /* === SEMANTIC === */
  --color-success: #30D158;          /* Payment success, confirmations */
  --color-error: #FF453A;            /* Errors, validation failures */
  --color-warning: #FFD60A;          /* Warnings, cautions */
}
```

### 2.2 Visual Balance Rule
> **45% Dark Base | 35% White (text/content) | 20% Pink Accent**
- Pink is **accent only** — never dominate the screen
- Dark base for high-impact areas (hero, booking wizard, chat)
- Light sections for informational blocks (FAQ, policies)

### 2.3 Typography System
```css
:root {
  /* === FONT FAMILIES === */
  --font-headline: 'Montserrat', 'Poppins', sans-serif;
  --font-body: 'Inter', 'Poppins', sans-serif;

  /* === FONT SIZES === */
  --text-hero: clamp(2.25rem, 5vw, 3rem);    /* 36-48px — Hero headline */
  --text-h2: clamp(1.5rem, 3vw, 2rem);       /* 24-32px — Section headers */
  --text-h3: clamp(1.125rem, 2vw, 1.375rem); /* 18-22px — Card headers */
  --text-body: clamp(0.875rem, 1.5vw, 1rem); /* 14-16px — Body text */
  --text-small: clamp(0.75rem, 1vw, 0.8125rem); /* 12-13px — Captions */
  --text-label: 0.6875rem;                    /* 11px — Uppercase labels */

  /* === FONT WEIGHTS (MAX 3) === */
  --weight-bold: 700;      /* Headlines */
  --weight-semibold: 600;  /* Sub-headers, CTAs */
  --weight-regular: 400;   /* Body text */

  /* === LETTER SPACING === */
  --tracking-wide: 0.15em;   /* Uppercase labels */
  --tracking-normal: 0.01em; /* Body text */
}
```

### 2.4 Spacing Scale (4px Base)
```css
:root {
  --space-xs: 0.25rem;  /* 4px */
  --space-sm: 0.5rem;   /* 8px */
  --space-md: 1rem;     /* 16px */
  --space-lg: 1.5rem;   /* 24px */
  --space-xl: 2rem;     /* 32px */
  --space-2xl: 3rem;    /* 48px */
  --space-3xl: 4rem;    /* 64px */
  --space-4xl: 6rem;    /* 96px */
}
```

### 2.5 Component Tokens
```css
:root {
  /* === BORDERS === */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* === SHADOWS & GLOWS === */
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.3);
  --shadow-elevated: 0 8px 32px rgba(0, 0, 0, 0.4);
  --glow-primary: 0 0 20px var(--color-primary-glow);
  --glow-primary-strong: 0 0 40px var(--color-primary-glow);

  /* === TRANSITIONS === */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;
  --transition-smooth: 500ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 2.6 Design Emotion Rules
| ✅ DO | ❌ DON'T |
|-------|---------|
| Electric but controlled | Rainbow neon |
| Premium but friendly | Club flyer chaos |
| Neon pulse inside structured luxury | Flashing animations |
| Subtle glow on interaction | Cheap glow effects |
| Luxury through restraint | Heavy gradients |
| Smooth micro-animations | Excessive motion |
| Warm lighting in photos | Sloppy drunk visuals |
| Faces visible, clean framing | Chaotic footage |

---

## 📌 Section 3: Data Architecture (Data-First Rule)

> **RULE:** All JSON schemas below MUST be defined and agreed upon before writing any UI code that creates or consumes this data.

### 3.1 Guest Schema
```json
{
  "$schema": "Guest",
  "$description": "A person who has expressed interest or made a booking",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique guest identifier"
    },
    "firstName": {
      "type": "string",
      "required": true,
      "description": "Guest's first name"
    },
    "lastName": {
      "type": "string",
      "required": true,
      "description": "Guest's last name"
    },
    "email": {
      "type": "string",
      "format": "email",
      "required": true,
      "description": "Primary contact email"
    },
    "phone": {
      "type": "string",
      "required": true,
      "description": "WhatsApp-compatible phone number with country code"
    },
    "gender": {
      "type": "string",
      "enum": ["male", "female", "other"],
      "required": true,
      "description": "Used for pricing logic (male: ฿1500, female: ฿1200). Never displayed publicly."
    },
    "nationality": {
      "type": "string",
      "required": false,
      "description": "Guest's nationality for crowd composition awareness"
    },
    "source": {
      "type": "string",
      "enum": ["direct", "airbnb", "getyourguide", "viator", "instagram", "referral", "other"],
      "description": "How the guest discovered the crawl"
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "CRM tags. Interest tags (fri/sat) cleared every Monday. Value tags persist."
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### 3.2 Booking Schema
```json
{
  "$schema": "Booking",
  "$description": "A ticket purchase transaction linking a guest to an event",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique booking reference"
    },
    "guestId": {
      "type": "string",
      "format": "uuid",
      "description": "Reference to Guest"
    },
    "eventId": {
      "type": "string",
      "format": "uuid",
      "description": "Reference to Event"
    },
    "ticketType": {
      "type": "string",
      "enum": ["standard", "private"],
      "default": "standard"
    },
    "quantity": {
      "type": "integer",
      "minimum": 1,
      "maximum": 7,
      "description": "Number of tickets. 8+ triggers private group path."
    },
    "unitPrice": {
      "type": "integer",
      "description": "Price per ticket in THB (1500 male, 1200 female)"
    },
    "totalPrice": {
      "type": "integer",
      "description": "quantity × unitPrice in THB"
    },
    "currency": {
      "type": "string",
      "default": "THB"
    },
    "paymentStatus": {
      "type": "string",
      "enum": ["pending", "completed", "failed", "refunded", "cancelled"],
      "default": "pending",
      "description": "Only 'completed' after Stripe webhook success"
    },
    "stripePaymentIntentId": {
      "type": "string",
      "description": "Stripe Payment Intent ID for tracking"
    },
    "stripeCheckoutSessionId": {
      "type": "string",
      "description": "Stripe Checkout Session ID"
    },
    "bookingSource": {
      "type": "string",
      "enum": ["web_direct", "chat_assistant", "manual"],
      "description": "How the booking was initiated"
    },
    "specialRequests": {
      "type": "string",
      "description": "Any special notes from the guest"
    },
    "refundEligible": {
      "type": "boolean",
      "default": true,
      "description": "Set to false on event day (same-day non-refundable)"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### 3.3 Event Schema
```json
{
  "$schema": "Event",
  "$description": "A scheduled Bangkok Club Crawl event (typically Friday or Saturday)",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid"
    },
    "date": {
      "type": "string",
      "format": "date",
      "description": "Event date (YYYY-MM-DD)"
    },
    "dayOfWeek": {
      "type": "string",
      "enum": ["friday", "saturday"],
      "description": "Events run on Fridays and Saturdays only"
    },
    "status": {
      "type": "string",
      "enum": ["scheduled", "confirmed", "cancelled", "completed"],
      "default": "scheduled",
      "description": "Moves to 'confirmed' after 7 PM check with ≥5 paid guests"
    },
    "paidGuestCount": {
      "type": "integer",
      "default": 0,
      "description": "Count of guests with paymentStatus = 'completed'"
    },
    "minimumGuests": {
      "type": "integer",
      "default": 5,
      "description": "Minimum for confirmation. NEVER expose to guests."
    },
    "confirmationDeadline": {
      "type": "string",
      "format": "time",
      "default": "19:00",
      "description": "7 PM cut-off for confirmation decision"
    },
    "hostId": {
      "type": "string",
      "format": "uuid",
      "description": "Assigned host for the event"
    },
    "venues": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Ordered venue list (CONFIDENTIAL — never show in UI)"
    },
    "whatsappGroupId": {
      "type": "string",
      "description": "Created ONLY after 7 PM confirmation"
    },
    "whatsappGroupLink": {
      "type": "string",
      "format": "uri",
      "description": "Join link sent to confirmed guests"
    },
    "meetupLocation": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "address": { "type": "string" },
        "googleMapsUrl": { "type": "string", "format": "uri" },
        "latitude": { "type": "number" },
        "longitude": { "type": "number" }
      },
      "description": "Shared ONLY after confirmation (not before 7 PM)"
    },
    "meetupTime": {
      "type": "string",
      "format": "time",
      "description": "Guest arrival time"
    },
    "founderOverride": {
      "type": "boolean",
      "default": false,
      "description": "If true, Founder approved running below minimum"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### 3.4 ChatMessage Schema
```json
{
  "$schema": "ChatMessage",
  "$description": "A single message in the AI chat assistant conversation",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid"
    },
    "sessionId": {
      "type": "string",
      "format": "uuid",
      "description": "Reference to ChatSession"
    },
    "role": {
      "type": "string",
      "enum": ["guest", "assistant", "system"],
      "description": "Who sent the message"
    },
    "content": {
      "type": "string",
      "description": "Message text content"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "intent": {
          "type": "string",
          "enum": ["greeting", "inquiry", "date_check", "solo_concern", "price_objection", "booking_request", "group_inquiry", "complaint", "general"],
          "description": "Detected guest intent for conversation routing"
        },
        "conversationStage": {
          "type": "string",
          "enum": ["warm_entry", "date_qualification", "rapport", "objection_handling", "controlled_close", "post_booking", "escalated"],
          "description": "Current position in the Date-First sales flow"
        },
        "escalationFlag": {
          "type": "boolean",
          "default": false,
          "description": "True if message triggers Founder escalation"
        },
        "escalationReason": {
          "type": "string",
          "enum": ["large_group", "angry_tone", "legal_language", "refund_conflict", "influencer_media", "custom_request"],
          "description": "Why escalation was triggered"
        },
        "bookingLinkSent": {
          "type": "boolean",
          "default": false,
          "description": "Whether booking link has been delivered in this conversation"
        }
      }
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

### 3.5 ChatSession Schema
```json
{
  "$schema": "ChatSession",
  "$description": "A conversation thread between a guest and the AI assistant",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid"
    },
    "guestId": {
      "type": "string",
      "format": "uuid",
      "description": "Linked guest (if identified/registered)"
    },
    "status": {
      "type": "string",
      "enum": ["active", "closed", "escalated", "converted"],
      "default": "active",
      "description": "'converted' = guest completed booking via chat"
    },
    "currentStage": {
      "type": "string",
      "enum": ["warm_entry", "date_qualification", "rapport", "objection_handling", "controlled_close", "post_booking", "escalated"],
      "default": "warm_entry",
      "description": "Tracks position in Date-First sales flow"
    },
    "guestContext": {
      "type": "object",
      "properties": {
        "dateConfirmed": {
          "type": "string",
          "enum": ["this_friday", "this_saturday", "future", "unsure", "not_confirmed"],
          "default": "not_confirmed"
        },
        "groupType": {
          "type": "string",
          "enum": ["solo", "couple", "small_group", "large_group"],
          "description": "solo=1, couple=2, small_group=3-7, large_group=8+"
        },
        "groupSize": {
          "type": "integer"
        },
        "objectionsRaised": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Track which objections have been addressed"
        }
      }
    },
    "messages": {
      "type": "array",
      "items": { "$ref": "ChatMessage" }
    },
    "bookingLinkSentAt": {
      "type": "string",
      "format": "date-time",
      "description": "When the booking link was sent (for follow-up timing)"
    },
    "followUpSentAt": {
      "type": "string",
      "format": "date-time",
      "description": "When the 12-hour follow-up was sent"
    },
    "startedAt": {
      "type": "string",
      "format": "date-time"
    },
    "lastActivityAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

---

## 📌 Section 4: Business Rules Engine

### 4.1 Pricing Rules
```
RULE: PUBLIC_PRICE
  Display price = ฿1,500 per person (always)
  Never show gendered pricing in UI

RULE: GENDERED_PRICING
  IF guest.gender == "male" THEN unitPrice = 1500
  IF guest.gender == "female" THEN unitPrice = 1200
  IF guest.gender == "other" THEN unitPrice = 1500
  Applied at checkout calculation, never displayed as "discount"

RULE: PRIVATE_GROUP_TRIGGER
  IF booking.quantity >= 8 OR keywords("corporate", "birthday", "bachelor", "special")
  THEN escalate to Founder
  THEN display "Contact us for private events" message
  AI must NEVER quote custom pricing
```

### 4.2 Event Confirmation Rules
```
RULE: SEVEN_PM_RULE
  AT 19:00 on event.date:
    IF event.paidGuestCount >= 5 THEN event.status = "confirmed"
    IF event.paidGuestCount < 5 THEN notify Founder for decision
  
  Founder CAN override with founderOverride = true
  
  RULE: NEVER proactively mention minimum to guests
  RULE: WhatsApp group created ONLY after confirmation
  RULE: Meetup location shared ONLY after confirmation
```

### 4.3 Payment Rules
```
RULE: ADVANCE_PAYMENT
  All bookings require advance payment
  No pay-on-arrival under any circumstances

RULE: CONFIRMATION_TRIGGER
  booking.paymentStatus = "completed" ONLY after Stripe webhook success
  NOT after form submission, NOT after manual message

RULE: REFUND_POLICY
  Same-day cancellations: non-refundable
  No-shows: non-refundable
  OTA cancellations: follow platform policy
  Event cancellation (< 5 guests): offer reschedule first, then full refund
  AI has NO authority to issue refunds

RULE: ABANDONED_PAYMENT
  IF payment link sent AND no payment after 12 hours:
    Send 1 soft follow-up
  IF no payment after 24 hours:
    Stop follow-up. Remove "Interested" tag after 48 hours.
```

### 4.4 Information Control Rules
```
RULE: NEVER_DISCLOSE
  - Internal profit margins
  - Host commission structure (base 1500 + 300/guest)
  - Gender-based pricing difference
  - Gender ratios of attendees
  - Minimum guest threshold (unless directly asked)
  - Internal venue list

RULE: REACTIVE_ONLY_INFO
  The following is shared ONLY when guest asks directly:
  - 7 PM confirmation cut-off
  - Minimum guest count
  - Specific venue names
  
RULE: URGENCY_STYLE
  Use time-based urgency: "Events run every weekend"
  NEVER use volume-based urgency: "Only 2 spots left!"
  Certainty sells better than scarcity
```

---

## 📌 Section 5: AI Chat Assistant Constitution

### 5.1 Tone: Host Authority System
```
VOICE = Confident + Calm + Structured + Direct
NEVER = Desperate + Chaotic + Slang-heavy + Hype-driven + Over-apologetic

FORMULA (every response):
  1. Acknowledge the guest's message
  2. Clarify or Reframe the topic
  3. Guide to the next step

LANGUAGE:
  - Short paragraphs, clear structure
  - No "bro" language
  - No excessive emojis (max 1-2 per message)
  - No over-apologizing
  - Authority converts better than excitement
```

### 5.2 Date-First Sales Flow
```
STAGE 1: warm_entry
  → Describe experience briefly
  → Ask: "Are you in Bangkok this Friday or Saturday?"
  → NO booking link. NO close attempt.

STAGE 2: date_qualification
  → "Yes, this weekend" → advance to rapport
  → "Not sure" → soft-hold: "We confirm by 7 PM on the day"
  → "Future date" → nurture: "Message us closer to your dates"

STAGE 3: rapport
  → Solo: "Most guests join solo — the night's designed to break the ice naturally"
  → Group (2-5): "You'll mix naturally while keeping your crew"
  → Group (6+): Escalate to Founder immediately

STAGE 4: objection_handling
  → Identify emotional root → Reframe → Reduce friction → Guide
  → "Too expensive" → "It's structured access and guided flow, not just entry"
  → NEVER offer discounts

STAGE 5: controlled_close
  → "If you're around Friday, I can send the booking link now"
  → Send link ONLY after date confirmed + objections addressed
```

### 5.3 Escalation Triggers
```
ESCALATE_TO_FOUNDER when:
  - Group size ≥ 6 in inquiry
  - Angry or aggressive tone detected
  - Legal language used
  - Refund conflict
  - Influencer or media inquiry
  - Custom event request
  - Keywords: "corporate", "birthday", "bachelor", "special"
```

---

## 📌 Section 6: Technical Architecture

### 6.1 Technology Stack
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Structure | HTML5 (semantic) | Accessibility, SEO |
| Styling | Vanilla CSS (custom properties) | Full control, no framework overhead |
| Logic | Vanilla JavaScript (ES6+) | No build step needed, direct DOM control |
| Fonts | Google Fonts (Montserrat, Inter) | Brand typography |
| Payments | Stripe Checkout | Industry standard, webhook-based |
| Chat AI | API integration (future) | Initially mock responses |
| Hosting | TBD (Vercel / Netlify) | Static site hosting |

### 6.2 File Structure
```
NightlifeAntigravity/
├── Gemini.md                 # This file — Project Constitution
├── TASK_PLAN.md              # Build phases & checklist
├── findings.md               # Research & discovery report
├── nightlife_brain.md        # Business source of truth
├── SKILL.md                  # Nightlife Expert Skill
├── design_inspiration/       # Visual reference screenshots
│   ├── hero_section_idea.png
│   ├── booking_flow_style.png
│   ├── Check_out_style.png
│   └── Included_features.png
├── index.html                # Main application entry
├── css/
│   ├── index.css             # Design system tokens + global styles
│   ├── hero.css              # Hero section styles
│   ├── features.css          # What's Included section
│   ├── experience.css        # 3-Ritual Escalation section
│   ├── booking.css           # Booking wizard styles
│   ├── chat.css              # AI chat widget styles
│   └── responsive.css        # Responsive overrides
├── js/
│   ├── app.js                # Main application controller
│   ├── booking.js            # Booking wizard logic
│   ├── chat.js               # Chat assistant engine
│   ├── data.js               # Data schemas & validation
│   └── animations.js         # Scroll & interaction animations
├── assets/
│   ├── images/               # Photography & backgrounds
│   ├── icons/                # Rose gold feature icons (SVG)
│   └── logo/                 # BEST Nightlife Thailand logos
└── data/
    ├── responses.json        # AI chat response templates
    ├── faq.json              # FAQ content
    └── features.json         # What's Included content
```

### 6.3 Responsive Breakpoints
```css
/* Mobile First (default) */
/* Tablet: min-width: 768px */
/* Desktop: min-width: 1024px */
/* Large Desktop: min-width: 1440px */
```

### 6.4 Performance Targets
| Metric | Target |
|--------|--------|
| Lighthouse Performance | ≥ 90 |
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| Time to Interactive | < 3.5s |

---

## 📌 Section 7: SEO Requirements

```html
<title>Bangkok Club Crawl — Structured Nightlife Experience | BEST Nightlife Thailand</title>
<meta name="description" content="Join Bangkok's premier structured nightlife experience. Curated venues, VIP entry, dedicated hosts, and smooth transportation. Every Friday & Saturday on Sukhumvit. Bangkok Nights. Done Right.">
<meta property="og:title" content="Bangkok Club Crawl — Bangkok Nights. Done Right.">
<meta property="og:description" content="Premium structured nightlife experience in Bangkok. Curated venues, VIP entry, and dedicated hosts every weekend.">
<meta property="og:type" content="website">
```

- Single `<h1>` per page: "Bangkok Club Crawl"
- Proper heading hierarchy: h1 → h2 → h3
- Semantic HTML5 elements: `<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`
- All interactive elements have unique, descriptive `id` attributes

---

## 📌 Section 8: System Hierarchy

> **Revenue engine first → Automation second → Community later.**

| Priority | Component | Rationale |
|----------|-----------|-----------|
| P0 | Booking Wizard + Payment | Direct revenue generation |
| P0 | Core Page (Hero, Features, Experience) | Conversion support |
| P1 | AI Chat Assistant | Inquiry handling, conversion lift |
| P1 | Responsive Design | Mobile traffic is primary |
| P2 | Analytics & Tracking | Optimization data |
| P2 | Content & Assets | Visual polish |
| P3 | CRM Integration | Automation layer |
| P3 | WhatsApp Automation | Post-booking operations |

---

## 📌 Section 9: Governance Rules

1. **This file overrides** any conflicting instruction from any source.
2. **Data schemas** (Section 3) must be implemented before UI code that consumes them.
3. **Brand rules** (Section 2) must be applied to every visual element — no exceptions.
4. **AI tone** (Section 5) must be consistent across all chat responses and UI copy.
5. **Information control** (Section 4.4) must be enforced — no accidental data leaks.
6. **Founder authority** overrides automation logic at all times.
7. **Mobile-first** development — desktop is the adaptation, not the primary target.
8. **Test before ship** — every phase requires validation before advancing.

---

> *"Bangkok Nights. Done Right." — This constitution ensures it.*
