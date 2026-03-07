/**
 * 🚀 Bangkok Club Crawl — Booking Engine Server
 * 
 * Endpoints:
 *   POST /api/create-checkout     → Guest upsert + Pending booking + Stripe Checkout
 *   POST /api/stripe-webhook      → Payment verification + Tag management + Email notifications
 *   POST /api/webhooks/bokun      → OTA webhook: Bokun booking notifications
 *   GET  /api/booking-status/:id  → Booking status lookup
 *   GET  /api/verify-session      → Stripe session verification for success page
 * 
 * Also serves the static frontend on all other routes.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

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

// ——— Email Config (Gmail SMTP via Nodemailer) ———
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bestnightlifethailand@gmail.com';

/**
 * Sends an email using the configured Gmail transporter.
 * Non-blocking — errors are logged but never crash the server.
 */
async function sendEmail({ to, subject, html, text }) {
    try {
        const info = await emailTransporter.sendMail({
            from: `"Bangkok Club Crawl" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            text
        });
        console.log(`📧 Email sent to ${to}: ${info.messageId}`);
        return true;
    } catch (err) {
        console.error(`⚠️ Email to ${to} failed (non-blocking):`, err.message);
        return false;
    }
}

/**
 * Generates the premium HTML email template for guest booking confirmation.
 * Brand-aligned: dark base, pink accents, Montserrat/Inter fonts.
 */
function buildGuestConfirmationHTML({ firstName, eventDate, pax, totalPaid, bookingId }) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmed</title>
</head>
<body style="margin:0;padding:0;background-color:#111114;font-family:'Inter',Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111114;">
        <tr>
            <td align="center" style="padding:40px 20px;">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding:30px 0 20px;">
                            <h1 style="margin:0;font-family:'Montserrat',Arial,sans-serif;font-size:28px;font-weight:700;color:#FFFFFF;letter-spacing:0.02em;">BANGKOK CLUB CRAWL</h1>
                            <p style="margin:8px 0 0;font-size:11px;color:#B76E79;letter-spacing:0.15em;text-transform:uppercase;">Bangkok Nights. Done Right.</p>
                        </td>
                    </tr>

                    <!-- Main Card -->
                    <tr>
                        <td style="background-color:#1C1C1E;border-radius:16px;border:1px solid rgba(255,255,255,0.08);padding:40px 32px;">
                            
                            <!-- Confirmation Badge -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom:24px;">
                                        <div style="display:inline-block;background:linear-gradient(135deg,#FF2D95,#FF6B9D);color:#FFFFFF;font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;padding:8px 24px;border-radius:9999px;">✓ BOOKING CONFIRMED</div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Greeting -->
                            <p style="margin:0 0 16px;font-size:18px;color:#FFFFFF;font-weight:600;">
                                Hey ${firstName} 👋
                            </p>
                            <p style="margin:0 0 28px;font-size:15px;color:#AEAEB2;line-height:1.6;">
                                You're locked in. Your Bangkok Club Crawl booking is confirmed and paid.
                            </p>

                            <!-- Booking Details -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#2C2C2E;border-radius:12px;padding:24px;margin-bottom:28px;">
                                <tr>
                                    <td style="padding:24px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding:6px 0;font-size:13px;color:#8E8E93;text-transform:uppercase;letter-spacing:0.1em;">Date</td>
                                                <td align="right" style="padding:6px 0;font-size:15px;color:#FFFFFF;font-weight:600;">${eventDate}</td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" style="border-bottom:1px solid rgba(255,255,255,0.08);padding:4px 0;"></td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0;font-size:13px;color:#8E8E93;text-transform:uppercase;letter-spacing:0.1em;">Guests</td>
                                                <td align="right" style="padding:6px 0;font-size:15px;color:#FFFFFF;font-weight:600;">${pax} pax</td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" style="border-bottom:1px solid rgba(255,255,255,0.08);padding:4px 0;"></td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0;font-size:13px;color:#8E8E93;text-transform:uppercase;letter-spacing:0.1em;">Total Paid</td>
                                                <td align="right" style="padding:6px 0;font-size:15px;color:#D4AF37;font-weight:600;">฿${totalPaid.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" style="border-bottom:1px solid rgba(255,255,255,0.08);padding:4px 0;"></td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0;font-size:13px;color:#8E8E93;text-transform:uppercase;letter-spacing:0.1em;">Ref</td>
                                                <td align="right" style="padding:6px 0;font-size:12px;color:#8E8E93;font-family:monospace;">${bookingId.slice(0, 8).toUpperCase()}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- What Happens Next -->
                            <p style="margin:0 0 12px;font-size:15px;color:#FFFFFF;font-weight:600;">What happens next?</p>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding:8px 0;font-size:14px;color:#AEAEB2;line-height:1.5;">
                                        <span style="color:#FF2D95;font-weight:600;">1.</span> On the day: We confirm the event by <strong style="color:#FFFFFF;">7 PM</strong>.
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;font-size:14px;color:#AEAEB2;line-height:1.5;">
                                        <span style="color:#FF2D95;font-weight:600;">2.</span> You'll receive a <strong style="color:#FFFFFF;">WhatsApp group link</strong> with the meetup location.
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;font-size:14px;color:#AEAEB2;line-height:1.5;">
                                        <span style="color:#FF2D95;font-weight:600;">3.</span> Our host guides the entire flow — just show up and enjoy the energy.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding:28px 0 0;">
                            <p style="margin:0 0 4px;font-size:12px;color:#8E8E93;">Questions? Reply to this email or message us on WhatsApp.</p>
                            <p style="margin:0;font-size:11px;color:#555;letter-spacing:0.05em;">BEST Nightlife Thailand · Bangkok Club Crawl</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

/**
 * Generates the admin notification email body (plain text for fast scanning).
 */
function buildAdminNotificationText({ firstName, email, phone, eventDate, pax, paxBreakdown, totalPaid, discountCode, discountAmount, bookingId, stripeSessionId }) {
    const breakdownStr = [paxBreakdown?.male ? `${paxBreakdown.male}M` : '', paxBreakdown?.female ? `${paxBreakdown.female}F` : ''].filter(Boolean).join(' + ');
    const discountStr = discountCode ? `\nPromo: ${discountCode} (-฿${discountAmount})` : '';
    return [
        `🎉 New Paid Booking`,
        ``,
        `Guest: ${firstName}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Date: ${eventDate}`,
        `Pax: ${pax} (${breakdownStr})`,
        `Total Paid: ฿${totalPaid.toLocaleString()}${discountStr}`,
        ``,
        `Booking ID: ${bookingId}`,
        `Stripe Session: ${stripeSessionId}`
    ].join('\n');
}

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

                    // ——— 6. Fetch booking details for email ———
                    const { data: bookingData } = await supabase
                        .from('bookings')
                        .select('quantity, pax_breakdown, total_price, discount_code, discount_amount, event_date')
                        .eq('id', bookingId)
                        .single();

                    // ——— 7A. Send GUEST CONFIRMATION EMAIL ———
                    if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
                        const confirmationHTML = buildGuestConfirmationHTML({
                            firstName: guestData.first_name,
                            eventDate: formattedDate,
                            pax: bookingData?.quantity || 0,
                            totalPaid: bookingData?.total_price || 0,
                            bookingId: bookingId
                        });

                        await sendEmail({
                            to: guestData.email,
                            subject: `Booking Confirmed! Bangkok Club Crawl — ${formattedDate} 🎉`,
                            html: confirmationHTML,
                            text: `Hey ${guestData.first_name}! Your Bangkok Club Crawl booking for ${formattedDate} (${bookingData?.quantity || 0} pax) is confirmed. Total paid: ฿${(bookingData?.total_price || 0).toLocaleString()}. You'll receive WhatsApp details on the day by 7 PM.`
                        });

                        // ——— 7B. Send ADMIN NOTIFICATION EMAIL ———
                        const adminText = buildAdminNotificationText({
                            firstName: guestData.first_name,
                            email: guestData.email,
                            phone: guestData.phone,
                            eventDate: formattedDate,
                            pax: bookingData?.quantity || 0,
                            paxBreakdown: bookingData?.pax_breakdown,
                            totalPaid: bookingData?.total_price || 0,
                            discountCode: bookingData?.discount_code,
                            discountAmount: bookingData?.discount_amount || 0,
                            bookingId: bookingId,
                            stripeSessionId: session.id
                        });

                        await sendEmail({
                            to: ADMIN_EMAIL,
                            subject: `New Booking: ${guestData.first_name} for ${formattedDate} — ${bookingData?.quantity || 0} pax`,
                            text: adminText
                        });
                    } else {
                        console.log('⏭️ Email credentials not configured — skipping email notifications');
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



// ═══════════════════════════════════════════════════
//  POST /api/webhooks/bokun
//  Bokun OTA sends HTTP Booking notifications here
//  Follows data-schema-rules Workspace Skill strictly:
//    Rule 1: Only touches Guest + Booking (core entities)
//    Rule 2: Minimum Data Rule (phone/OTA-ID + event_date + payment_status)
//    Rule 3: One Guest, One Profile (phone-first upsert)
//    Rule 4: Tagging (OTA-Booked tag applied)
//    Rule 5: OTA Fallback (Bokun ID when phone missing)
// ═══════════════════════════════════════════════════
app.post('/api/webhooks/bokun', async (req, res) => {
    console.log('📥 Bokun webhook received');

    // ——— 1. Authenticate: Verify BOKUN_API_KEY ———
    // Accepts the key via: Authorization: Bearer <key>, x-api-key header, or ?api_key= query param
    const expectedKey = process.env.BOKUN_API_KEY;

    if (!expectedKey) {
        console.error('❌ Bokun webhook: BOKUN_API_KEY not configured in environment');
        return res.status(500).json({ error: 'Webhook authentication not configured' });
    }

    const authHeader = req.headers['authorization'] || '';
    const xApiKey = req.headers['x-api-key'] || '';
    const queryKey = req.query.api_key || '';

    const providedKey =
        (authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '') ||
        xApiKey ||
        queryKey;

    if (!providedKey || providedKey !== expectedKey) {
        console.error('❌ Bokun webhook: Invalid or missing API key');
        return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
    }

    try {
        // ——— 2. Extract Bokun Booking ID ———
        // Bokun sends x-bokun-booking-id in headers; also may be in the body
        const bokunBookingId =
            req.headers['x-bokun-booking-id'] ||
            req.body?.bookingId ||
            req.body?.booking_id ||
            req.body?.confirmationCode ||
            req.body?.id;

        if (!bokunBookingId) {
            console.error('❌ Bokun webhook: No booking ID found in headers or body');
            return res.status(400).json({ error: 'Missing booking identifier (x-bokun-booking-id header or bookingId in body)' });
        }

        const bokunId = String(bokunBookingId);
        console.log(`📋 Bokun Booking ID: ${bokunId}`);

        // ——— 3. Extract Guest & Booking Data from Payload ———
        const body = req.body || {};

        // Bokun payloads can vary — extract what's available
        // Support nested customer/contact objects common in Bokun
        const customer = body.customer || body.contact || body.mainContact || body.leadCustomer || {};

        const firstName = customer.firstName || customer.first_name || body.firstName || body.first_name || null;
        const lastName = customer.lastName || customer.last_name || body.lastName || body.last_name || null;
        const email = customer.email || body.email || null;
        const rawPhone = customer.phone || customer.phoneNumber ||
            customer.phone_number || customer.mobile ||
            body.phone || body.phoneNumber || body.phone_number || null;
        const nationality = customer.nationality || customer.country || body.nationality || null;

        // Event date: Bokun uses various field names
        const rawEventDate = body.startDate || body.event_date || body.date ||
            body.activityDate || body.start_date ||
            body.startTime || body.departure_date || null;

        // Quantity / pax
        const quantity = parseInt(body.totalParticipants || body.participants ||
            body.pax || body.quantity || body.totalGuests || 1) || 1;

        // Total price from OTA (they handle payment)
        const totalPrice = parseFloat(body.totalPrice || body.total_price ||
            body.totalAmount || body.amount || 0) || 0;

        // ——— 4. Normalize Phone to E.164 (Rule 3) ———
        let normalizedPhone = null;
        if (rawPhone) {
            // Strip all non-digit/plus chars
            let cleaned = String(rawPhone).replace(/[^\d+]/g, '');
            // If starts with 0 (Thai local), convert to +66
            if (cleaned.startsWith('0') && cleaned.length >= 9) {
                cleaned = '+66' + cleaned.slice(1);
            }
            // Ensure + prefix
            if (!cleaned.startsWith('+') && cleaned.length >= 10) {
                cleaned = '+' + cleaned;
            }
            // Basic validation: must be at least 10 digits
            if (cleaned.replace(/\D/g, '').length >= 10) {
                normalizedPhone = cleaned;
            }
        }

        // ——— 5. Parse Event Date ———
        let eventDate = null;
        if (rawEventDate) {
            const parsed = new Date(rawEventDate);
            if (!isNaN(parsed.getTime())) {
                // Format as YYYY-MM-DD
                eventDate = parsed.toISOString().split('T')[0];
            }
        }

        // ——— 6. Validate Minimum Data Rule (Rule 2) ———
        // Requirement: phone OR OTA identifier + event_date + payment_status
        const hasIdentifier = normalizedPhone || bokunId;
        if (!hasIdentifier) {
            console.error('❌ Bokun webhook: Minimum Data Rule violation — no phone and no Bokun ID');
            return res.status(400).json({
                error: 'Minimum Data Rule: Guest must have a phone number or OTA booking ID'
            });
        }
        if (!eventDate) {
            console.error('❌ Bokun webhook: Minimum Data Rule violation — no event date');
            return res.status(400).json({
                error: 'Minimum Data Rule: Event date is required'
            });
        }
        // payment_status defaults to 'Paid' for OTA bookings (OTA handles payment)

        console.log(`📊 Bokun data parsed — Phone: ${normalizedPhone || 'N/A'} | Date: ${eventDate} | Pax: ${quantity}`);

        // ——— 7. Check for Duplicate Booking (idempotency) ———
        const { data: existingBooking } = await supabase
            .from('bookings')
            .select('id')
            .eq('ota_booking_id', bokunId)
            .single();

        if (existingBooking) {
            console.log(`⏭️ Bokun booking ${bokunId} already exists as ${existingBooking.id} — skipping`);
            return res.json({
                received: true,
                status: 'duplicate',
                message: 'Booking already processed',
                booking_id: existingBooking.id
            });
        }

        // ——— 8. Upsert Guest Profile (Rules 3 & 5) ———
        let guestId;
        let isNewGuest = false;

        if (normalizedPhone) {
            // Phone-first matching (Rule 3: phone is primary key)
            const { data: existingGuest } = await supabase
                .from('guests')
                .select('id, tags')
                .eq('phone', normalizedPhone)
                .single();

            if (existingGuest) {
                // UPDATE existing guest (COALESCE — don't overwrite with nulls)
                guestId = existingGuest.id;
                const updateFields = { updated_at: new Date().toISOString() };
                if (firstName) updateFields.first_name = firstName;
                if (lastName) updateFields.last_name = lastName;
                if (email) updateFields.email = email;
                if (nationality) updateFields.nationality = nationality;
                // Always update source to latest OTA
                updateFields.source = 'bokun';
                updateFields.ota_booking_id = bokunId;

                await supabase.from('guests').update(updateFields).eq('id', guestId);
                console.log(`👤 Existing guest updated: ${guestId}`);
            } else {
                // INSERT new guest with phone
                isNewGuest = true;
                const { data: newGuest, error: guestError } = await supabase
                    .from('guests')
                    .insert({
                        first_name: firstName,
                        last_name: lastName,
                        email: email,
                        phone: normalizedPhone,
                        nationality: nationality,
                        source: 'bokun',
                        ota_booking_id: bokunId,
                        tags: ['OTA-Booked'],
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select('id')
                    .single();

                if (guestError) {
                    console.error('❌ Guest creation failed:', guestError);
                    return res.status(500).json({ error: 'Failed to create guest profile' });
                }
                guestId = newGuest.id;
                console.log(`👤 New guest created (with phone): ${guestId}`);
            }
        } else {
            // OTA Fallback (Rule 5): No phone — use Bokun ID as unique identifier
            // Check if a guest already exists with this OTA booking ID
            const { data: existingOtaGuest } = await supabase
                .from('guests')
                .select('id, tags')
                .eq('ota_booking_id', bokunId)
                .single();

            if (existingOtaGuest) {
                guestId = existingOtaGuest.id;
                const updateFields = { updated_at: new Date().toISOString() };
                if (firstName) updateFields.first_name = firstName;
                if (lastName) updateFields.last_name = lastName;
                if (email) updateFields.email = email;
                if (nationality) updateFields.nationality = nationality;
                updateFields.source = 'bokun';

                await supabase.from('guests').update(updateFields).eq('id', guestId);
                console.log(`👤 Existing OTA guest updated: ${guestId}`);
            } else {
                // INSERT new guest WITHOUT phone (OTA Fallback — email is optional)
                isNewGuest = true;
                const { data: newGuest, error: guestError } = await supabase
                    .from('guests')
                    .insert({
                        first_name: firstName,
                        last_name: lastName,
                        email: email,     // Strictly optional (Rule 5)
                        phone: null,      // Will be attached later via WhatsApp
                        nationality: nationality,
                        source: 'bokun',
                        ota_booking_id: bokunId,
                        tags: ['OTA-Booked', 'Missing Phone'],
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select('id')
                    .single();

                if (guestError) {
                    console.error('❌ Guest creation (OTA fallback) failed:', guestError);
                    return res.status(500).json({ error: 'Failed to create guest profile' });
                }
                guestId = newGuest.id;
                console.log(`👤 New guest created (OTA fallback, no phone): ${guestId}`);
            }
        }

        // ——— 9. Apply Tags (Rule 4) ———
        const { data: guestForTags } = await supabase
            .from('guests')
            .select('tags')
            .eq('id', guestId)
            .single();

        let tags = guestForTags?.tags || [];

        // Add date-specific temporary tag
        const formattedDate = new Date(eventDate).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
        const bookedTag = `Booked — ${formattedDate}`;
        if (!tags.includes(bookedTag)) tags.push(bookedTag);

        // Add OTA identifier tag (permanent)
        if (!tags.includes('OTA-Booked')) tags.push('OTA-Booked');

        // Remove 'Interested' if present (they've booked now)
        tags = tags.filter(t => t !== 'Interested');

        await supabase.from('guests').update({ tags }).eq('id', guestId);

        // ——— 10. Create Booking Record (Rules 1 & 2) ———
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                guest_id: guestId,
                first_name: firstName,
                email: email,
                whatsapp_number: normalizedPhone,
                event_date: eventDate,
                quantity: quantity,
                total_price: totalPrice,
                payment_status: 'Paid',       // OTA handles payment
                booking_source: 'bokun',
                ota_booking_id: bokunId,
                created_at: new Date().toISOString()
            })
            .select('id')
            .single();

        if (bookingError) {
            console.error('❌ Booking creation failed:', bookingError);
            return res.status(500).json({ error: 'Failed to create booking record' });
        }

        console.log(`✅ Bokun booking processed: ${booking.id} | Guest: ${guestId} | Date: ${eventDate} | Pax: ${quantity}`);

        // ——— 11. Admin Notification Email ———
        if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
            const adminText = [
                `📥 New OTA Booking (Bokun)`,
                ``,
                `Guest: ${firstName || 'Unknown'} ${lastName || ''}`.trim(),
                `Email: ${email || 'Not provided'}`,
                `Phone: ${normalizedPhone || '⚠️ Missing — needs WhatsApp collection'}`,
                `Date: ${formattedDate}`,
                `Pax: ${quantity}`,
                `Total: ฿${totalPrice.toLocaleString() || 'N/A'}`,
                ``,
                `Bokun ID: ${bokunId}`,
                `Booking ID: ${booking.id}`,
                `Guest ID: ${guestId}`,
                normalizedPhone ? '' : `\n⚠️ ACTION NEEDED: Collect phone number when guest joins WhatsApp group.`
            ].filter(line => line !== undefined).join('\n');

            await sendEmail({
                to: ADMIN_EMAIL,
                subject: `OTA Booking: ${firstName || 'Guest'} for ${formattedDate} — ${quantity} pax (Bokun)`,
                text: adminText
            });
        }

        // ——— 12. Success Response ———
        return res.json({
            received: true,
            status: 'success',
            booking_id: booking.id,
            guest_id: guestId,
            is_new_guest: isNewGuest,
            phone_collected: !!normalizedPhone
        });

    } catch (err) {
        console.error('❌ Bokun webhook processing error:', err);
        return res.status(500).json({
            error: 'Webhook processing failed',
            message: err.message
        });
    }
});


// ——— Start Server (local dev only — Vercel uses module.exports) ———
if (require.main === module) {
    app.listen(PORT, () => {
        const emailReady = process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD && process.env.EMAIL_APP_PASSWORD !== 'YOUR_16_CHAR_APP_PASSWORD_HERE';
        console.log(`
╔══════════════════════════════════════════════════╗
║  🌃 Bangkok Club Crawl — Booking Engine          ║
║  Server running at http://localhost:${PORT}          ║
║                                                  ║
║  Endpoints:                                      ║
║    POST /api/create-checkout                     ║
║    POST /api/stripe-webhook                      ║
║    POST /api/webhooks/bokun                      ║
║    GET  /api/booking-status/:id                  ║
║                                                  ║
║  Email (Nodemailer):                             ║
║    Sender:  ${emailReady ? process.env.EMAIL_USER : '⏳ Not configured'}  ║
║    Admin:   ${emailReady ? ADMIN_EMAIL : '⏳ Not configured'}  ║
║    Status:  ${emailReady ? '✅ Ready' : '⏳ Paste App Password in .env'}              ║
╚══════════════════════════════════════════════════╝
        `);
    });
}

// Export for Vercel serverless
module.exports = app;
