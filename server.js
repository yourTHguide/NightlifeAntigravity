/**
 * 🚀 Bangkok Club Crawl — Booking Engine Server
 * 
 * Two endpoints:
 *   POST /api/create-checkout  → Guest upsert + Pending booking + Stripe Checkout
 *   POST /api/stripe-webhook   → Payment verification + Tag management + Zapier trigger
 * 
 * Also serves the static frontend on all other routes.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

// ——— Config ———
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PRICES = {
    male: process.env.STRIPE_PRICE_MALE,
    female: process.env.STRIPE_PRICE_FEMALE
};

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || `http://localhost:${PORT}`;

const app = express();

// ——— Middleware ———
// Stripe webhook needs raw body for signature verification
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(cors());

// Serve static files (the landing page)
app.use(express.static(path.join(__dirname)));

// ═══════════════════════════════════════════════════
//  POST /api/create-checkout
//  Frontend calls this when user clicks "CONFIRM & PAY"
// ═══════════════════════════════════════════════════
app.post('/api/create-checkout', async (req, res) => {
    try {
        const { guest, event_date, pax, promo_code } = req.body;

        // ——— 1. Validate Input ———
        if (!guest?.first_name || !guest?.phone || !guest?.email) {
            return res.status(400).json({ error: 'Missing guest details (name, phone, email required)' });
        }
        // Validate email format (Stripe rejects invalid emails)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(guest.email)) {
            return res.status(400).json({ error: 'Please enter a valid email address' });
        }
        if (!event_date) {
            return res.status(400).json({ error: 'Missing event date' });
        }
        if (!pax?.male && !pax?.female) {
            return res.status(400).json({ error: 'Must have at least 1 guest' });
        }

        const maleCount = parseInt(pax.male) || 0;
        const femaleCount = parseInt(pax.female) || 0;
        const totalPax = maleCount + femaleCount;

        // ——— 2. Server-side Price Calculation ———
        const MALE_PRICE = 1500;
        const FEMALE_PRICE = 1200;
        let subtotal = (maleCount * MALE_PRICE) + (femaleCount * FEMALE_PRICE);
        let discountAmount = 0;
        let validatedPromoCode = null;

        // ——— 3. Validate Promo Code (server-side re-verification) ———
        if (promo_code) {
            const { data: promoData, error: promoError } = await supabase
                .from('promo_codes')
                .select('code, discount_type, discount_value, is_active, max_uses, current_uses, expires_at')
                .eq('code', promo_code.toUpperCase())
                .eq('is_active', true)
                .single();

            if (!promoError && promoData) {
                // Check expiry
                const notExpired = !promoData.expires_at || new Date(promoData.expires_at) > new Date();
                // Check usage limit
                const notMaxed = promoData.max_uses === null || promoData.current_uses < promoData.max_uses;

                if (notExpired && notMaxed) {
                    validatedPromoCode = promoData.code;
                    if (promoData.discount_type === 'percentage') {
                        discountAmount = Math.round(subtotal * (promoData.discount_value / 100));
                    } else {
                        discountAmount = Math.min(promoData.discount_value, subtotal);
                    }
                }
            }
            // If promo invalid, we silently ignore it (don't block the booking)
        }

        const totalAmount = Math.max(0, subtotal - discountAmount);

        // ——— 4. Upsert Guest (match by phone) ———
        // Try to find existing guest by phone
        const { data: existingGuest } = await supabase
            .from('guests')
            .select('id, tags')
            .eq('phone', guest.phone)
            .single();

        let guestId;
        let currentTags = [];

        if (existingGuest) {
            // Update existing guest info
            guestId = existingGuest.id;
            currentTags = existingGuest.tags || [];
            await supabase
                .from('guests')
                .update({
                    first_name: guest.first_name,
                    email: guest.email,
                    updated_at: new Date().toISOString()
                })
                .eq('id', guestId);
        } else {
            // Create new guest with 'Interested' tag
            const { data: newGuest, error: guestError } = await supabase
                .from('guests')
                .insert({
                    first_name: guest.first_name,
                    email: guest.email,
                    phone: guest.phone,
                    tags: ['Interested'],
                    source: 'website'
                })
                .select('id')
                .single();

            if (guestError) {
                console.error('❌ Guest creation failed:', guestError);
                return res.status(500).json({ error: 'Failed to create guest profile' });
            }
            guestId = newGuest.id;
            currentTags = ['Interested'];
        }

        // ——— 5. Create Pending Booking in Supabase ———
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                guest_id: guestId,
                first_name: guest.first_name,
                email: guest.email,
                whatsapp_number: guest.phone,
                event_date: event_date,
                quantity: totalPax,
                pax_breakdown: { male: maleCount, female: femaleCount },
                total_price: totalAmount,
                discount_code: validatedPromoCode,
                discount_amount: discountAmount,
                payment_status: 'Pending'
            })
            .select('id')
            .single();

        if (bookingError) {
            console.error('❌ Booking creation failed:', bookingError);
            return res.status(500).json({ error: 'Failed to create booking' });
        }

        console.log(`📋 Booking created: ${booking.id} | Guest: ${guestId} | Total: ฿${totalAmount}`);

        // ——— 6. Build Stripe Checkout Line Items ———
        const lineItems = [];
        if (maleCount > 0) {
            lineItems.push({
                price: PRICES.male,
                quantity: maleCount
            });
        }
        if (femaleCount > 0) {
            lineItems.push({
                price: PRICES.female,
                quantity: femaleCount
            });
        }

        // ——— 7. Handle Discount via Stripe Coupon ———
        // NOTE: THB uses satang (1 baht = 100 satang), so multiply by 100
        let stripeCouponId = null;
        if (discountAmount > 0 && validatedPromoCode) {
            // Create a one-time Stripe coupon for this specific discount
            const coupon = await stripe.coupons.create({
                amount_off: discountAmount * 100, // Convert baht → satang
                currency: 'thb',
                duration: 'once',
                name: `Promo: ${validatedPromoCode}`,
                metadata: {
                    booking_id: booking.id,
                    original_code: validatedPromoCode
                }
            });
            stripeCouponId = coupon.id;
        }

        // ——— 8. Create Stripe Checkout Session ———
        const sessionConfig = {
            mode: 'payment',
            // Let Stripe auto-select available payment methods for this account
            line_items: lineItems,
            customer_email: guest.email,
            metadata: {
                booking_id: booking.id,
                guest_id: guestId,
                event_date: event_date,
                promo_code: validatedPromoCode || ''
            },
            success_url: `${CLIENT_URL}/booking-success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${CLIENT_URL}/index.html?booking=cancelled`
        };

        // Apply discount if we created a coupon
        if (stripeCouponId) {
            sessionConfig.discounts = [{ coupon: stripeCouponId }];
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        // Store the Stripe session ID on the booking
        await supabase
            .from('bookings')
            .update({ stripe_session_id: session.id })
            .eq('id', booking.id);

        console.log(`✅ Stripe Checkout created: ${session.id}`);

        // ——— 9. Return Checkout URL ———
        return res.json({
            url: session.url,
            booking_id: booking.id,
            session_id: session.id
        });

    } catch (err) {
        console.error('❌ Checkout creation error:', err);
        // Return specific error message from Stripe if available
        const message = err.raw?.message || err.message || 'Server error creating checkout session';
        return res.status(err.statusCode || 500).json({ error: message });
    }
});


// ═══════════════════════════════════════════════════
//  POST /api/stripe-webhook
//  Stripe sends payment events here (Source of Truth)
// ═══════════════════════════════════════════════════
app.post('/api/stripe-webhook', async (req, res) => {
    let event;

    // ——— 1. Verify Stripe Signature ———
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (webhookSecret && webhookSecret !== 'whsec_PLACEHOLDER') {
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            console.error('⚠️ Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
    } else {
        // Dev mode: skip signature verification
        console.warn('⚠️ DEV MODE: Skipping webhook signature verification');
        event = JSON.parse(req.body);
    }

    // ——— 2. Handle checkout.session.completed ———
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const bookingId = session.metadata?.booking_id;
        const guestId = session.metadata?.guest_id;
        const eventDate = session.metadata?.event_date;
        const promoCode = session.metadata?.promo_code;

        if (!bookingId) {
            console.error('❌ Webhook: No booking_id in session metadata');
            return res.status(400).json({ error: 'Missing booking_id in metadata' });
        }

        console.log(`💰 Payment confirmed for booking: ${bookingId}`);

        try {
            // ——— 3. UPDATE Booking → 'Paid' ———
            const { error: updateError } = await supabase
                .from('bookings')
                .update({
                    payment_status: 'Paid',
                    stripe_session_id: session.id
                })
                .eq('id', bookingId);

            if (updateError) {
                console.error('❌ Failed to update booking:', updateError);
            } else {
                console.log(`✅ Booking ${bookingId} marked as Paid`);
            }

            // ——— 4. UPDATE Guest Tags ———
            if (guestId) {
                // Fetch current guest data
                const { data: guestData } = await supabase
                    .from('guests')
                    .select('tags, first_name, email, phone')
                    .eq('id', guestId)
                    .single();

                if (guestData) {
                    let tags = guestData.tags || [];

                    // Remove 'Interested' tag
                    tags = tags.filter(t => t !== 'Interested');

                    // Add 'Booked — [Date]' tag
                    const formattedDate = new Date(eventDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    });
                    const bookedTag = `Booked — ${formattedDate}`;
                    if (!tags.includes(bookedTag)) {
                        tags.push(bookedTag);
                    }

                    await supabase
                        .from('guests')
                        .update({ tags })
                        .eq('id', guestId);

                    console.log(`🏷️ Guest ${guestId} tags updated: [${tags.join(', ')}]`);

                    // ——— 5. Increment Promo Code Usage ———
                    if (promoCode) {
                        await supabase.rpc('increment_promo_usage', { code_value: promoCode })
                            .then(() => console.log(`🎟️ Promo "${promoCode}" usage incremented`))
                            .catch(async () => {
                                // Fallback: manual increment if RPC doesn't exist
                                const { data: promoData } = await supabase
                                    .from('promo_codes')
                                    .select('current_uses')
                                    .eq('code', promoCode)
                                    .single();
                                if (promoData) {
                                    await supabase
                                        .from('promo_codes')
                                        .update({ current_uses: promoData.current_uses + 1 })
                                        .eq('code', promoCode);
                                    console.log(`🎟️ Promo "${promoCode}" usage incremented (fallback)`);
                                }
                            });
                    }

                    // ——— 6. Fetch booking details for Zapier payload ———
                    const { data: bookingData } = await supabase
                        .from('bookings')
                        .select('quantity, pax_breakdown, total_price, discount_code, discount_amount, event_date')
                        .eq('id', bookingId)
                        .single();

                    // ——— 7. Trigger Zapier Webhook ———
                    const zapierUrl = process.env.ZAPIER_WEBHOOK_URL;
                    if (zapierUrl && zapierUrl !== 'https://hooks.zapier.com/hooks/catch/PLACEHOLDER') {
                        const zapierPayload = {
                            trigger: 'booking_confirmed',
                            booking_id: bookingId,
                            guest_name: guestData.first_name,
                            guest_email: guestData.email,
                            guest_phone: guestData.phone,
                            event_date: eventDate,
                            event_date_formatted: formattedDate,
                            pax: bookingData?.quantity || 0,
                            pax_breakdown: bookingData?.pax_breakdown || {},
                            total_paid: bookingData?.total_price || 0,
                            discount_code: bookingData?.discount_code || null,
                            discount_amount: bookingData?.discount_amount || 0,
                            stripe_session_id: session.id,
                            payment_status: 'Paid'
                        };

                        try {
                            const zapierResponse = await fetch(zapierUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(zapierPayload)
                            });
                            console.log(`📧 Zapier webhook fired: ${zapierResponse.status}`);
                        } catch (zapErr) {
                            console.error('⚠️ Zapier webhook failed (non-blocking):', zapErr.message);
                        }
                    } else {
                        console.log('⏭️ Zapier webhook URL not configured — skipping');
                    }
                }
            }

        } catch (err) {
            console.error('❌ Webhook processing error:', err);
            return res.status(500).json({ error: 'Webhook processing failed' });
        }
    }

    // Always acknowledge receipt
    res.json({ received: true });
});


// ═══════════════════════════════════════════════════
//  GET /api/booking-status/:id
//  Frontend can poll this after successful payment
// ═══════════════════════════════════════════════════
app.get('/api/booking-status/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('id, payment_status, event_date, quantity, total_price, discount_code')
            .eq('id', req.params.id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        return res.json(data);
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
});


// ═══════════════════════════════════════════════════
//  GET /api/verify-session
//  Success page calls this to show booking details
// ═══════════════════════════════════════════════════
app.get('/api/verify-session', async (req, res) => {
    try {
        const sessionId = req.query.session_id;
        if (!sessionId) {
            return res.status(400).json({ error: 'Missing session_id' });
        }

        // Look up booking by stripe_session_id
        const { data, error } = await supabase
            .from('bookings')
            .select('id, payment_status, event_date, quantity, total_price, discount_code, pax_breakdown')
            .eq('stripe_session_id', sessionId)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Booking not found for this session' });
        }

        return res.json({
            booking_id: data.id,
            payment_status: data.payment_status,
            event_date: data.event_date,
            quantity: data.quantity,
            total_price: data.total_price,
            discount_code: data.discount_code,
            pax_breakdown: data.pax_breakdown
        });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
});


// ——— Start Server ———
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║  🌃 Bangkok Club Crawl — Booking Engine      ║
║  Server running at http://localhost:${PORT}      ║
║                                              ║
║  Endpoints:                                  ║
║    POST /api/create-checkout                 ║
║    POST /api/stripe-webhook                  ║
║    GET  /api/booking-status/:id              ║
╚══════════════════════════════════════════════╝
    `);
});
