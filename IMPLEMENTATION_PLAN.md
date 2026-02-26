# 🏗️ Phase 3: "Done Right" Booking Engine — Implementation Plan

> **Last Updated:** 27 Feb 2026  
> **Status:** ✅ BLOCKS 1-3 COMPLETE — Awaiting Zapier Setup (Block 4)

---

## ✅ Completed Work Summary

### Block 1: Stripe Products ✅
| Product | Stripe ID | Price ID | Amount |
|---------|-----------|----------|--------|
| Bangkok Club Crawl – Male Ticket | `prod_U3FLiKufEC1gKK` | `price_1T58qdCJiIAY18yY4JQFS8pb` | ฿1,500 |
| Bangkok Club Crawl – Female Ticket | `prod_U3FLHcEP09qED9` | `price_1T58qdCJiIAY18yYY6sPC96E` | ฿1,200 |

### Block 1: Database Schema ✅
| Table | Status | Details |
|-------|--------|---------|
| `guests` | ✅ Created | `id`, `first_name`, `email`, `phone` (UNIQUE), `tags[]`, `source`, timestamps |
| `bookings` | ✅ Evolved | Added `guest_id` FK, `event_date`, `stripe_session_id`, `pax_breakdown` JSONB |
| RLS Policies | ✅ Hardened | Anon: INSERT only. Service Role: full access. Promo codes: anon SELECT active only |

### Block 2: Booking Flow ✅
| Component | File | Status |
|-----------|------|--------|
| Express Server | `server.js` | ✅ Running at localhost:3000 |
| Create Checkout endpoint | `POST /api/create-checkout` | ✅ Tested — creates guest, pending booking, Stripe Checkout session |
| Stripe Webhook endpoint | `POST /api/stripe-webhook` | ✅ Built — verifies signature, updates booking to Paid, manages tags, fires Zapier |
| Verify Session endpoint | `GET /api/verify-session` | ✅ Built — success page fetches booking details |
| Booking Status endpoint | `GET /api/booking-status/:id` | ✅ Built — poll for status |
| Frontend Payment Flow | `js/app.js` | ✅ Updated — validates inputs, calls API, redirects to Stripe |
| Success Page | `booking-success.html` | ✅ Created — premium dark UI with booking details |
| Environment Config | `.env` | ✅ Created with all keys |

### Block 3: Webhook Logic ✅
Built into `server.js`. On `checkout.session.completed`:
1. ✅ Verifies Stripe signature
2. ✅ Extracts `booking_id` and `guest_id` from metadata
3. ✅ Updates booking → `payment_status: 'Paid'`
4. ✅ Removes `'Interested'` tag from guest
5. ✅ Adds `'Booked — [Date]'` tag to guest
6. ✅ Increments promo code `current_uses`
7. ✅ Fires Zapier webhook with full payload

---

## 🔧 Block 4: Zapier Setup (YOUR ACTION NEEDED)

### Step-by-Step: Creating the Catch Hook

1. **Go to** [zapier.com/app/zaps](https://zapier.com/app/zaps) → Click **"+ Create"** → **"New Zap"**

2. **Trigger Step:**
   - Search for: **"Webhooks by Zapier"**
   - Choose event: **"Catch Hook"**
   - Click **"Continue"**
   - Zapier will show you a **custom webhook URL** like:
     ```
     https://hooks.zapier.com/hooks/catch/12345678/abcdefg/
     ```
   - **Copy this URL** — you'll paste it into our `.env` file

3. **Test the Trigger:**
   - After pasting the URL into `.env` (replacing `PLACEHOLDER`), restart the server
   - Make a test booking through the site and complete payment
   - Go back to Zapier and click **"Test trigger"** — it should find the sample data

4. **Action Step (Auto-Confirmation Email):**
   - Click **"+"** to add an action
   - Search for: **"Gmail"**  
   - Choose event: **"Send Email"**
   - **Map the fields from the webhook data:**

   | Gmail Field | Map To | Example Value |
   |-------------|--------|---------------|
   | **To** | `guest_email` | alex@mail.com |
   | **Subject** | Your template subject line | e.g. "You're In! Bangkok Club Crawl Confirmed 🎉" |
   | **Body** | Use your **"Auto-Confirmation Template"** | |

   **Available data fields from our webhook:**
   ```
   {{trigger.guest_name}}         → "Alex"
   {{trigger.guest_email}}        → "alex@mail.com"
   {{trigger.guest_phone}}        → "+66812345678"
   {{trigger.event_date}}         → "2026-03-07"
   {{trigger.event_date_formatted}} → "7 Mar 2026"
   {{trigger.pax}}                → 3
   {{trigger.pax_breakdown}}      → {"male": 2, "female": 1}
   {{trigger.total_paid}}         → 4200
   {{trigger.discount_code}}      → "NIGHTOWL10" (or null)
   {{trigger.discount_amount}}    → 270
   {{trigger.booking_id}}         → "f93302f8-..."
   {{trigger.stripe_session_id}}  → "cs_live_..."
   {{trigger.payment_status}}     → "Paid"
   ```

5. **Turn on the Zap** — click **"Publish"**

### After Zapier Setup

Once you have the Catch Hook URL:
1. Open `.env`
2. Replace: `ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/PLACEHOLDER`
3. With: `ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/YOUR_REAL_URL`
4. Restart the server: `npm run dev`

---

## 🔐 Stripe Webhook Registration

Before going live, you also need to register the webhook endpoint in Stripe:

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"+ Add endpoint"**
3. **Endpoint URL:** `https://YOUR_DOMAIN/api/stripe-webhook` (use your Vercel URL once deployed)
4. **Events to send:** Select `checkout.session.completed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (`whsec_...`)
7. Paste it into `.env` as `STRIPE_WEBHOOK_SECRET`

> ⚠️ For local testing, you can use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhook events:
> ```
> stripe listen --forward-to localhost:3000/api/stripe-webhook
> ```

---

## 📁 Current File Structure

```
NightlifeAntigravity/
├── server.js                 ← Express API (checkout + webhook + verify)
├── .env                      ← Secrets (Stripe, Supabase, Zapier)
├── package.json              ← Dependencies (express, stripe, supabase-js)
├── booking-success.html      ← Post-payment confirmation page
├── index.html                ← Landing page with booking wizard
├── css/index.css             ← Styles (includes promo code UI)
├── js/
│   ├── app.js                ← Frontend logic (real Stripe Checkout flow)
│   └── data.js               ← Event data + price config
└── ...
```

---

## 🧪 How to Test End-to-End

1. Start server: `npm run dev`
2. Open: `http://localhost:3000`
3. Click "ENTER THE NIGHT" → pick a date → add guests → fill details
4. (Optional) Enter promo code: `NIGHTOWL10` (10% off) or `VIP20` (20% off) or `BANGKOK200` (฿200 off)
5. Click "PAY NOW via Stripe"
6. Complete payment on Stripe Checkout page (use test card: `4242 4242 4242 4242`)
7. You'll be redirected to `booking-success.html`
8. Check Supabase: booking should show `payment_status: 'Paid'`
9. Check guest tags: should show `'Booked — [Date]'` (without `'Interested'`)
10. If Zapier is configured: confirmation email should arrive

---

## ⚠️ Still Needs Doing (When Deploying to Vercel)

| Task | When |
|------|------|
| Deploy to Vercel | After testing complete |
| Convert Express routes to Vercel serverless functions (`/api/*.js`) | During Vercel deploy |
| Register real Stripe webhook URL | After deployment |
| Update `.env` with production webhook signing secret | After webhook registration |
| Create Zap 2: Pre-event "Update Template" (scheduled daily check) | After Zap 1 is working |
| Set production `CLIENT_URL` in env | After deployment |
