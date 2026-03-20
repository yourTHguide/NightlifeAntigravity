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
    female: process.env.STRIPE_PRICE_FEMALE,
    thursday_male: process.env.STRIPE_PRICE_THURSDAY_MALE,
    thursday_female: process.env.STRIPE_PRICE_THURSDAY_FEMALE
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
        const { guest, event_date, pax, promo_code, event_day, source_channel } = req.body;

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

        // ——— 2. Detect Event Day & Server-side Price Calculation ———
        // Determine if this is a Thursday booking:
        //   - Frontend sends event_day ('4' = Thursday) as explicit signal
        //   - Fallback: derive day-of-week from event_date string
        let isThursday = false;
        if (event_day === '4' || event_day === 'Thursday') {
            isThursday = true;
        } else {
            const parsedDate = new Date(event_date + 'T12:00:00'); // noon to avoid timezone issues
            if (!isNaN(parsedDate.getTime()) && parsedDate.getDay() === 4) { // 4 = Thursday
                isThursday = true;
            }
        }

        const MALE_PRICE = isThursday ? 1200 : 1500;
        const FEMALE_PRICE = isThursday ? 1000 : 1200;
        let subtotal = (maleCount * MALE_PRICE) + (femaleCount * FEMALE_PRICE);

        console.log(`🗓️ Event: ${event_date} | Day: ${isThursday ? 'Thursday' : 'Fri/Sat'} | Pricing: M=${MALE_PRICE} F=${FEMALE_PRICE}`);
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
                    source: source_channel || 'website'
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

        // ——— 6. Build Stripe Checkout Line Items (Thursday vs Fri/Sat routing) ———
        const malePriceId = isThursday ? PRICES.thursday_male : PRICES.male;
        const femalePriceId = isThursday ? PRICES.thursday_female : PRICES.female;

        const lineItems = [];
        if (maleCount > 0) {
            lineItems.push({
                price: malePriceId,
                quantity: maleCount
            });
        }
        if (femaleCount > 0) {
            lineItems.push({
                price: femalePriceId,
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
                event_type: isThursday ? 'social_night' : 'club_crawl',
                phone: guest.phone,
                payment_status: 'Pending',
                promo_code: validatedPromoCode || '',
                source_channel: source_channel || 'web_direct'
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
        const sourceChannel = session.metadata?.source_channel;

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
                        .update({
                            tags,
                            ...(sourceChannel && sourceChannel !== 'web_direct' ? { source: sourceChannel } : {})
                        })
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
//  
//  IMPORTANT: Bokun webhooks are LIGHTWEIGHT — they send
//  the booking ID in headers and a minimal/variable JSON body.
//  This handler must be resilient to any payload shape.
//
//  Follows data-schema-rules Workspace Skill strictly:
//    Rule 1: Only touches Guest + Booking (core entities)
//    Rule 2: Minimum Data Rule (phone/OTA-ID + event_date + payment_status)
//    Rule 3: One Guest, One Profile (phone-first upsert)
//    Rule 4: Tagging (OTA-Booked tag applied)
//    Rule 5: OTA Fallback (Bokun ID when phone missing)
// ═══════════════════════════════════════════════════
app.post('/api/webhooks/bokun', async (req, res) => {
    console.log('═══════════════════════════════════════');
    console.log('📥 Bokun webhook received at', new Date().toISOString());

    // ——— 0. FULL PAYLOAD LOG (diagnostic — always log what Bokun sends) ———
    console.log('📋 Headers:', JSON.stringify({
        'x-bokun-booking-id': req.headers['x-bokun-booking-id'] || null,
        'x-bokun-topic': req.headers['x-bokun-topic'] || null,
        'x-bokun-vendor-id': req.headers['x-bokun-vendor-id'] || null,
        'x-bokun-hmac': req.headers['x-bokun-hmac'] ? '(present)' : null,
        'content-type': req.headers['content-type'] || null,
        'authorization': req.headers['authorization'] ? '(present)' : null,
        'x-api-key': req.headers['x-api-key'] ? '(present)' : null
    }));
    console.log('📋 Query params:', JSON.stringify(req.query || {}));
    console.log('📋 Raw body:', JSON.stringify(req.body || {}, null, 2));
    console.log('📋 Body type:', typeof req.body, '| Empty?', !req.body || Object.keys(req.body).length === 0);

    // ——— 1. Authenticate: Verify BOKUN_API_KEY ———
    const expectedKey = process.env.BOKUN_API_KEY;

    if (!expectedKey) {
        console.error('❌ BOKUN_API_KEY not configured in environment');
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
        console.error('❌ Invalid or missing API key');
        return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
    }

    try {
        const body = req.body || {};

        // ——— 2. DEEP EXTRACT: Flatten the entire payload to find fields ———
        // Bokun payloads vary wildly — recursively search for known field names
        function deepFind(obj, keys, maxDepth = 5, depth = 0) {
            if (!obj || typeof obj !== 'object' || depth > maxDepth) return null;
            for (const key of keys) {
                if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
                    return obj[key];
                }
            }
            // Search one level deeper in nested objects
            for (const val of Object.values(obj)) {
                if (val && typeof val === 'object' && !Array.isArray(val)) {
                    const found = deepFind(val, keys, maxDepth, depth + 1);
                    if (found !== null) return found;
                }
            }
            return null;
        }

        // ——— 3. Extract Bokun Booking ID ———
        // Priority: header > body fields
        const bokunBookingId =
            req.headers['x-bokun-booking-id'] ||
            deepFind(body, ['bookingId', 'booking_id', 'confirmationCode', 'confirmation_code',
                'reservationId', 'reservation_id', 'id', 'orderId', 'order_id',
                'referenceNumber', 'reference_number', 'externalId', 'external_id']);

        if (!bokunBookingId) {
            console.error('❌ No booking ID in headers or body. Full payload logged above.');
            return res.status(400).json({
                error: 'Missing booking identifier',
                help: 'Expected x-bokun-booking-id header or bookingId/id in body'
            });
        }

        const bokunId = String(bokunBookingId);
        console.log(`🔑 Bokun ID: ${bokunId}`);

        // ——— 4. Extract Guest Data (deep search) ———
        const firstName = deepFind(body, ['firstName', 'first_name', 'FirstName', 'name', 'customerName', 'guestName']) || null;
        const lastName = deepFind(body, ['lastName', 'last_name', 'LastName', 'surname', 'familyName']) || null;
        const email = deepFind(body, ['email', 'Email', 'emailAddress', 'email_address', 'customerEmail', 'contactEmail']) || null;
        const rawPhone = deepFind(body, ['phone', 'phoneNumber', 'phone_number', 'PhoneNumber', 'mobile',
            'mobilePhone', 'mobile_phone', 'telephone', 'tel', 'contactPhone']) || null;
        const nationality = deepFind(body, ['nationality', 'Nationality', 'country', 'countryCode', 'country_code']) || null;

        // ——— 5. Extract Event Date (aggressive deep search) ———
        // Bokun uses many different field names — search exhaustively
        const rawEventDate = deepFind(body, [
            // Bokun common fields
            'startDate', 'start_date', 'StartDate',
            'bookingDate', 'booking_date', 'BookingDate',
            'travelDate', 'travel_date', 'TravelDate',
            'date', 'Date',
            // Activity/tour fields
            'eventDate', 'event_date', 'EventDate',
            'activityDate', 'activity_date', 'ActivityDate',
            'tourDate', 'tour_date', 'TourDate',
            // Departure/arrival
            'departureDate', 'departure_date', 'DepartureDate',
            'arrivalDate', 'arrival_date', 'ArrivalDate',
            // Time-based (may contain date)
            'startTime', 'start_time', 'StartTime',
            'scheduledDate', 'scheduled_date',
            // Other OTA variants
            'serviceDate', 'service_date',
            'experienceDate', 'experience_date',
            'pickupDate', 'pickup_date',
            'checkinDate', 'checkin_date'
        ]) || null;

        let eventDate = null;
        let dateWasMissing = false;

        if (rawEventDate) {
            const dateStr = String(rawEventDate);
            // Try direct ISO parse
            let parsed = new Date(dateStr);
            // If fails, try extracting YYYY-MM-DD pattern from the string
            if (isNaN(parsed.getTime())) {
                const match = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
                if (match) parsed = new Date(match[0] + 'T12:00:00Z');
            }
            // If still fails, try DD/MM/YYYY or MM/DD/YYYY patterns
            if (isNaN(parsed.getTime())) {
                const slashMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
                if (slashMatch) parsed = new Date(`${slashMatch[3]}-${slashMatch[2]}-${slashMatch[1]}T12:00:00Z`);
            }
            // If still fails, try Unix timestamp (seconds or milliseconds)
            if (isNaN(parsed.getTime()) && /^\d+$/.test(dateStr)) {
                const ts = parseInt(dateStr);
                parsed = new Date(ts > 1e12 ? ts : ts * 1000);
            }
            if (!isNaN(parsed.getTime())) {
                eventDate = parsed.toISOString().split('T')[0];
            }
        }

        // MISSING DATE FALLBACK: Do NOT guess. Use sentinel date + flag.
        if (!eventDate) {
            dateWasMissing = true;
            eventDate = '1999-01-01'; // Sentinel: clearly invalid, flags for manual review
            console.error('🚨 DATE MISSING — assigned sentinel 1999-01-01. Guest will be tagged ⚠️ NEEDS DATE.');
        }

        // ——— 6. Extract Quantity & Price ———
        const rawQty = deepFind(body, ['totalParticipants', 'participants', 'pax', 'quantity',
            'totalGuests', 'guestCount', 'guest_count', 'numberOfGuests',
            'number_of_guests', 'seats', 'tickets']);
        const quantity = parseInt(rawQty) || 1;

        const rawPrice = deepFind(body, ['totalPrice', 'total_price', 'totalAmount', 'total_amount',
            'amount', 'price', 'orderTotal', 'order_total']);
        const totalPrice = parseFloat(rawPrice) || 0;

        // ——— 7. Normalize Phone to E.164 (Rule 3) ———
        let normalizedPhone = null;
        if (rawPhone) {
            let cleaned = String(rawPhone).replace(/[^\d+]/g, '');
            if (cleaned.startsWith('0') && cleaned.length >= 9) {
                cleaned = '+66' + cleaned.slice(1);
            }
            if (!cleaned.startsWith('+') && cleaned.length >= 10) {
                cleaned = '+' + cleaned;
            }
            if (cleaned.replace(/\D/g, '').length >= 10) {
                normalizedPhone = cleaned;
            }
        }

        // ——— 8. Validate Minimum Data Rule (Rule 2) ———
        // We ALWAYS have bokunId at this point (checked in step 3)
        // We ALWAYS have eventDate at this point (fallback in step 5)
        // Payment status = 'Paid' (hardcoded for OTA — they handle payment)
        // → Minimum Data Rule is GUARANTEED satisfied

        console.log('📊 Parsed data:');
        console.log(`   Name: ${firstName || '?'} ${lastName || ''}`);
        console.log(`   Email: ${email || 'N/A'}`);
        console.log(`   Phone: ${normalizedPhone || 'N/A (OTA Fallback active)'}`);
        console.log(`   Date: ${eventDate}`);
        console.log(`   Pax: ${quantity} | Price: ฿${totalPrice}`);

        // ——— 9. Check for Duplicate Booking (idempotency) ———
        const { data: existingBooking } = await supabase
            .from('bookings')
            .select('id')
            .eq('ota_booking_id', bokunId)
            .single();

        if (existingBooking) {
            console.log(`⏭️ Duplicate — Bokun ${bokunId} already exists as booking ${existingBooking.id}`);
            return res.json({
                received: true,
                status: 'duplicate',
                message: 'Booking already processed',
                booking_id: existingBooking.id
            });
        }

        // ——— 10. Upsert Guest Profile (Rules 3 & 5) ———
        let guestId;
        let isNewGuest = false;

        if (normalizedPhone) {
            // PHONE-FIRST matching (Rule 3)
            const { data: existingGuest } = await supabase
                .from('guests')
                .select('id, tags')
                .eq('phone', normalizedPhone)
                .single();

            if (existingGuest) {
                guestId = existingGuest.id;
                const updateFields = { updated_at: new Date().toISOString(), source: 'bokun', ota_booking_id: bokunId };
                if (firstName) updateFields.first_name = firstName;
                if (lastName) updateFields.last_name = lastName;
                if (email) updateFields.email = email;
                if (nationality) updateFields.nationality = nationality;
                updateFields.ota_platform = 'bokun';
                await supabase.from('guests').update(updateFields).eq('id', guestId);
                console.log(`👤 Existing guest updated: ${guestId}`);
            } else {
                isNewGuest = true;
                const { data: newGuest, error: guestError } = await supabase
                    .from('guests')
                    .insert({
                        first_name: firstName || 'Bokun Guest',
                        last_name: lastName,
                        email: email,
                        phone: normalizedPhone,
                        nationality: nationality,
                        source: 'bokun',
                        ota_booking_id: bokunId,
                        ota_platform: 'bokun',
                        tags: ['OTA-Booked'],
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select('id')
                    .single();

                if (guestError) {
                    console.error('❌ Guest creation failed:', JSON.stringify(guestError));
                    return res.status(500).json({ error: 'Failed to create guest', detail: guestError.message });
                }
                guestId = newGuest.id;
                console.log(`👤 New guest created (with phone): ${guestId}`);
            }
        } else {
            // OTA FALLBACK (Rule 5): No phone → use Bokun ID as unique identifier
            const { data: existingOtaGuest } = await supabase
                .from('guests')
                .select('id, tags')
                .eq('ota_booking_id', bokunId)
                .single();

            if (existingOtaGuest) {
                guestId = existingOtaGuest.id;
                const updateFields = { updated_at: new Date().toISOString(), source: 'bokun' };
                if (firstName) updateFields.first_name = firstName;
                if (lastName) updateFields.last_name = lastName;
                if (email) updateFields.email = email;
                if (nationality) updateFields.nationality = nationality;
                updateFields.ota_platform = 'bokun';
                await supabase.from('guests').update(updateFields).eq('id', guestId);
                console.log(`👤 Existing OTA guest updated: ${guestId}`);
            } else {
                isNewGuest = true;
                const { data: newGuest, error: guestError } = await supabase
                    .from('guests')
                    .insert({
                        first_name: firstName || 'Bokun Guest',
                        last_name: lastName,
                        email: email,
                        phone: null,               // OTA Fallback: phone collected later
                        nationality: nationality,
                        source: 'bokun',
                        ota_booking_id: bokunId,    // ← This IS the unique identifier
                        ota_platform: 'bokun',
                        tags: ['OTA-Booked', 'Missing Phone'],
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select('id')
                    .single();

                if (guestError) {
                    console.error('❌ Guest creation (OTA fallback) failed:', JSON.stringify(guestError));
                    return res.status(500).json({ error: 'Failed to create guest', detail: guestError.message });
                }
                guestId = newGuest.id;
                console.log(`👤 New guest created (OTA fallback, no phone): ${guestId}`);
            }
        }

        // ——— 11. Apply Tags (Rule 4) ———
        const { data: guestForTags } = await supabase
            .from('guests')
            .select('tags')
            .eq('id', guestId)
            .single();

        let tags = guestForTags?.tags || [];

        // Format date for display (used in tags and admin email)
        const formattedDate = dateWasMissing
            ? '⚠️ DATE MISSING'
            : new Date(eventDate + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

        // Add OTA identifier tag (permanent)
        if (!tags.includes('OTA-Booked')) tags.push('OTA-Booked');

        // Add date-specific tag (only if real date, not sentinel)
        if (!dateWasMissing) {
            const bookedTag = `Booked — ${formattedDate}`;
            if (!tags.includes(bookedTag)) tags.push(bookedTag);
        } else {
            // Flag for Founder Dashboard: date needs manual correction
            if (!tags.includes('⚠️ NEEDS DATE')) tags.push('⚠️ NEEDS DATE');
        }

        // Remove 'Interested' — they've booked now
        tags = tags.filter(t => t !== 'Interested');

        await supabase.from('guests').update({ tags }).eq('id', guestId);

        // ——— 12. Create Booking Record (Rules 1 & 2) ———
        const bookingInsert = {
            guest_id: guestId,
            first_name: firstName || 'Bokun Guest',
            email: email,
            whatsapp_number: normalizedPhone,   // null is OK (OTA Fallback)
            event_date: eventDate,
            quantity: quantity,
            total_price: totalPrice,
            payment_status: 'Confirmed',        // OTA-secured booking (guest paid via Bokun)
            booking_source: 'bokun',            // Source = Bokun
            ota_booking_id: bokunId,
            created_at: new Date().toISOString()
        };

        console.log('📝 Inserting booking:', JSON.stringify(bookingInsert));

        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert(bookingInsert)
            .select('id')
            .single();

        if (bookingError) {
            console.error('❌ Booking creation failed:', JSON.stringify(bookingError));
            return res.status(500).json({ error: 'Failed to create booking', detail: bookingError.message });
        }

        console.log(`✅ Bokun booking SUCCESS: ${booking.id} | Guest: ${guestId} | Date: ${eventDate} | Pax: ${quantity}`);
        console.log('═══════════════════════════════════════');

        // ——— 13. Admin Notification Email ———
        if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
            const adminText = [
                `📥 New OTA Booking (Bokun)`,
                ``,
                `Guest: ${firstName || 'Unknown'} ${lastName || ''}`.trim(),
                `Email: ${email || 'Not provided'}`,
                `Phone: ${normalizedPhone || '⚠️ Missing — collect via WhatsApp'}`,
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

        // ——— 14. Success Response ———
        return res.json({
            received: true,
            status: 'success',
            booking_id: booking.id,
            guest_id: guestId,
            is_new_guest: isNewGuest,
            phone_collected: !!normalizedPhone,
            event_date: eventDate,
            source: 'bokun',
            payment_status: 'Confirmed'
        });

    } catch (err) {
        console.error('❌ Bokun webhook FATAL error:', err.message);
        console.error('   Stack:', err.stack);
        console.log('═══════════════════════════════════════');
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
║    POST /api/omnichannel-chat                    ║
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

// ═══════════════════════════════════════════════════
//  🏛️ FOUNDER CONTROL PANEL — Admin API Routes
//  Secured by Supabase Auth + HMAC session tokens
// ═══════════════════════════════════════════════════

const crypto = require('crypto');

const FOUNDER_EMAIL = 'bestnightlifethailand@gmail.com';
const TOKEN_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use as HMAC secret
const TOKEN_EXPIRY_HOURS = 24;

// --- Admin Token Helpers ---
function createAdminToken(email) {
    const payload = JSON.stringify({
        email,
        exp: Date.now() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
    });
    const encoded = Buffer.from(payload).toString('base64url');
    const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
    return `${encoded}.${sig}`;
}

function verifyAdminToken(token) {
    try {
        const [encoded, sig] = token.split('.');
        if (!encoded || !sig) return null;
        const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
        if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
        const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString());
        if (payload.exp < Date.now()) return null;
        if (payload.email !== FOUNDER_EMAIL) return null;
        return payload;
    } catch {
        return null;
    }
}

// --- Admin Auth Middleware ---
function adminAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = auth.replace('Bearer ', '');
    const payload = verifyAdminToken(token);
    if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.adminEmail = payload.email;
    next();
}

// ═══ REALTIME SSE — Push changes to dashboard clients ═══
const sseClients = new Set();

// Supabase Realtime channel for bookings + guests
const realtimeChannel = supabase
    .channel('admin-dashboard')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        console.log('📡 Realtime: bookings change', payload.eventType);
        broadcastSSE({ type: 'bookings_change', event: payload.eventType, record: payload.new || {} });
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'guests' }, (payload) => {
        console.log('📡 Realtime: guests change', payload.eventType);
        broadcastSSE({ type: 'guests_change', event: payload.eventType, record: payload.new || {} });
    })
    .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
    });

function broadcastSSE(data) {
    const msg = `data: ${JSON.stringify(data)}\n\n`;
    for (const client of sseClients) {
        try { client.write(msg); } catch (e) { sseClients.delete(client); }
    }
}

// SSE endpoint — admin-authenticated streaming connection
app.get('/api/admin/stream', (req, res) => {
    // Verify admin token from query param (SSE can't send headers)
    const token = req.query.token;
    if (!token || !verifyAdminToken(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'        // Disable Nginx/Vercel buffering
    });

    // Send initial heartbeat
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    sseClients.add(res);
    console.log(`📡 SSE client connected (${sseClients.size} total)`);

    // Heartbeat every 30s to keep connection alive
    const heartbeat = setInterval(() => {
        try { res.write(`: heartbeat\n\n`); } catch (e) { clearInterval(heartbeat); }
    }, 30000);

    req.on('close', () => {
        sseClients.delete(res);
        clearInterval(heartbeat);
        console.log(`📡 SSE client disconnected (${sseClients.size} remaining)`);
    });
});

// ═══ POST /api/admin/login ═══
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Only allow founder email
        if (email.toLowerCase() !== FOUNDER_EMAIL) {
            console.log(`🚫 Admin login rejected: ${email}`);
            return res.status(401).json({ error: 'Access denied. This panel is restricted to authorized personnel.' });
        }

        // Verify credentials via Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            console.log(`🚫 Admin login failed for ${email}: ${error.message}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`✅ Admin login: ${email}`);
        const token = createAdminToken(email.toLowerCase());

        return res.json({
            token,
            email: data.user.email,
            expires_in: TOKEN_EXPIRY_HOURS * 3600
        });
    } catch (err) {
        console.error('❌ Admin login error:', err);
        return res.status(500).json({ error: 'Login failed' });
    }
});

// ═══ GET /api/admin/events ═══
// Returns upcoming events grouped by date with paid headcount
app.get('/api/admin/events', adminAuth, async (req, res) => {
    try {
        // Get today's date in Bangkok time (UTC+7)
        const now = new Date();
        const bkkOffset = 7 * 60 * 60 * 1000;
        const bkkNow = new Date(now.getTime() + bkkOffset);
        const todayStr = bkkNow.toISOString().split('T')[0];

        // Fetch ALL bookings from today onwards to avoid case-sensitivity issues
        const { data: rawBookings, error } = await supabase
            .from('bookings')
            .select('event_date, quantity, total_price, payment_status')
            .gte('event_date', todayStr)
            .order('event_date', { ascending: true });

        if (error) throw error;

        // Apply case-insensitive filter on the backend
        const validStatuses = ['paid', 'confirmed', 'completed', 'success', 'captured'];
        const bookings = (rawBookings || []).filter(b => {
            const status = (b.payment_status || '').toLowerCase();
            return validStatuses.includes(status);
        });

        // Group by date — ONLY paid/confirmed bookings count toward headcount
        const eventMap = {};
        bookings.forEach(b => {
            const date = b.event_date;
            if (!eventMap[date]) {
                eventMap[date] = { date, paid_count: 0, total_revenue: 0 };
            }
            // Parse quantity as integer
            eventMap[date].paid_count += (parseInt(b.quantity, 10) || 1);
            eventMap[date].total_revenue += (parseFloat(b.total_price) || 0);
        });

        // Add upcoming dates for next 30 days — 6 days/week (every day except Monday)
        // Bokun is open to book Tue-Sun
        for (let i = 0; i < 30; i++) {
            const d = new Date(bkkNow.getTime() + i * 24 * 60 * 60 * 1000);
            const day = d.getDay(); // 0=Sun, 1=Mon, 2=Tue...6=Sat
            if (day !== 1) { // Skip Monday only
                const ds = d.toISOString().split('T')[0];
                if (!eventMap[ds]) {
                    eventMap[ds] = { date: ds, paid_count: 0, total_revenue: 0 };
                }
            }
        }

        // Remove sentinel date (1999-01-01) from display
        delete eventMap['1999-01-01'];

        // Count bookings with sentinel dates needing manual correction
        const { data: needsDateBookings } = await supabase
            .from('bookings')
            .select('id')
            .eq('event_date', '1999-01-01')
            .in('payment_status', ['Paid', 'paid', 'Confirmed', 'confirmed', 'completed', 'Completed']);

        const events = Object.values(eventMap).sort((a, b) => a.date.localeCompare(b.date));

        return res.json({
            events,
            today: todayStr,
            needs_date_count: (needsDateBookings || []).length
        });
    } catch (err) {
        console.error('❌ Admin events error:', err);
        return res.status(500).json({ error: 'Failed to load events' });
    }
});

// ═══ GET /api/admin/guests ═══
// Returns all guest profiles for CRM view
app.get('/api/admin/guests', adminAuth, async (req, res) => {
    try {
        const { data: guests, error } = await supabase
            .from('guests')
            .select('id, first_name, last_name, email, phone, source, tags, nationality, gender, ota_booking_id, ota_platform, created_at, updated_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.json({ guests: guests || [] });
    } catch (err) {
        console.error('❌ Admin guests error:', err);
        return res.status(500).json({ error: 'Failed to load guests' });
    }
});

// ═══ GET /api/admin/kpis ═══
// Auto-calculates core business metrics
app.get('/api/admin/kpis', adminAuth, async (req, res) => {
    try {
        // Fetch ALL bookings for KPI calculations to avoid case-sensitivity issues
        const { data: rawBookings, error: bErr } = await supabase
            .from('bookings')
            .select('id, guest_id, event_date, quantity, total_price, payment_status, booking_source, created_at');

        if (bErr) throw bErr;

        // Apply case-insensitive filter
        const validStatuses = ['paid', 'confirmed', 'completed', 'success', 'captured'];
        const paidBookings = (rawBookings || []).filter(b => {
            const status = (b.payment_status || '').toLowerCase();
            return validStatuses.includes(status);
        });

        // Fetch all guests
        const { data: guests, error: gErr } = await supabase
            .from('guests')
            .select('id, phone, source, tags');

        if (gErr) throw gErr;

        const allGuests = guests || [];

        // --- Total Revenue ---
        const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

        // --- Events with bookings ---
        const eventDates = [...new Set(paidBookings.map(b => b.event_date))];
        const totalEventsWithBookings = eventDates.length;

        // --- Avg Revenue per Event ---
        const avgRevenuePerEvent = totalEventsWithBookings > 0
            ? Math.round(totalRevenue / totalEventsWithBookings)
            : 0;

        // --- Avg Guests per Event ---
        const totalPax = paidBookings.reduce((sum, b) => sum + (parseInt(b.quantity, 10) || 1), 0);
        const avgGuestsPerEvent = totalEventsWithBookings > 0
            ? (totalPax / totalEventsWithBookings)
            : 0;

        // --- Repeat Guest Rate ---
        // A repeat guest is someone who has 2+ paid bookings on different event dates
        const guestEventMap = {};
        paidBookings.forEach(b => {
            if (!b.guest_id) return;
            if (!guestEventMap[b.guest_id]) guestEventMap[b.guest_id] = new Set();
            guestEventMap[b.guest_id].add(b.event_date);
        });

        const uniqueBookedGuests = Object.keys(guestEventMap).length;
        const repeatGuests = Object.values(guestEventMap).filter(dates => dates.size >= 2).length;
        const repeatGuestRate = uniqueBookedGuests > 0
            ? (repeatGuests / uniqueBookedGuests) * 100
            : 0;

        // --- Guests with Phone ---
        const guestsWithPhone = allGuests.filter(g => g.phone && g.phone.trim().length > 0).length;

        // --- Source Breakdown ---
        const sourceBreakdown = {};
        paidBookings.forEach(b => {
            const src = b.booking_source || 'direct';
            sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1;
        });

        return res.json({
            total_revenue: totalRevenue,
            total_paid_bookings: paidBookings.length,
            total_events_with_bookings: totalEventsWithBookings,
            avg_revenue_per_event: avgRevenuePerEvent,
            avg_guests_per_event: avgGuestsPerEvent,
            total_guests: allGuests.length,
            guests_with_phone: guestsWithPhone,
            repeat_guests: repeatGuests,
            repeat_guest_rate: repeatGuestRate,
            source_breakdown: sourceBreakdown
        });
    } catch (err) {
        console.error('❌ Admin KPIs error:', err);
        return res.status(500).json({ error: 'Failed to calculate KPIs' });
    }
});

// ═══ POST /api/admin/clean-statuses ═══
// Standardizes legacy payment statuses to strict PascalCase standards
app.post('/api/admin/clean-statuses', adminAuth, async (req, res) => {
    try {
        console.log('🧹 Starting Database Status Standardization...');

        // 1. Standardize Direct Bookings (all non-Bokun) to 'Paid'
        const { error: directErr } = await supabase
            .from('bookings')
            .update({ payment_status: 'Paid' })
            .in('payment_status', ['paid', 'completed', 'Completed', 'success', 'captured'])
            .neq('booking_source', 'bokun');

        if (directErr) throw directErr;

        // 2. Standardize Bokun Bookings to 'Confirmed'
        const { error: bokunErr } = await supabase
            .from('bookings')
            .update({ payment_status: 'Confirmed' })
            .in('payment_status', ['confirmed', 'confirmed_at'])
            .eq('booking_source', 'bokun');

        if (bokunErr) throw bokunErr;

        // 3. Normalize all cases to PascalCase (Pending, Cancelled, etc)
        const others = [
            { old: 'pending', new: 'Pending' },
            { old: 'cancelled', new: 'Cancelled' },
            { old: 'refunded', new: 'Refunded' },
            { old: 'failed', new: 'Failed' }
        ];

        for (const status of others) {
            await supabase.from('bookings').update({ payment_status: status.new }).eq('payment_status', status.old);
        }

        console.log('✅ Database Status Standardization COMPLETE.');
        return res.json({ message: 'Standardization complete. All statuses now follow PascalCase rules.' });
    } catch (err) {
        console.error('❌ Status cleanup failed:', err);
        return res.status(500).json({ error: 'Cleanup failed', detail: err.message });
    }
});


// ═══════════════════════════════════════════════════
//  POST /api/omnichannel-chat
//  Unified webhook endpoint for n8n omnichannel messaging
//  Handles: WhatsApp, Instagram DM, Facebook Messenger
//  Flow: n8n → this endpoint → AI response → n8n → user
// ═══════════════════════════════════════════════════

// --- In-Memory Chat Session Store ---
// Key: unique user identifier (phone or handle), Value: session state
// In production, migrate to Supabase table for persistence
const chatSessions = {};
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours TTL

function getOrCreateSession(userKey) {
    if (chatSessions[userKey] && (Date.now() - chatSessions[userKey].lastActivity < SESSION_TTL_MS)) {
        chatSessions[userKey].lastActivity = Date.now();
        return chatSessions[userKey];
    }
    chatSessions[userKey] = {
        stage: 'warm_entry',
        dateConfirmed: null,
        groupType: null,
        groupSize: null,
        objectionsRaised: [],
        bookingLinkSent: false,
        messageCount: 0,
        escalated: false,
        lastActivity: Date.now(),
        createdAt: Date.now()
    };
    return chatSessions[userKey];
}

// Periodic cleanup of expired sessions
setInterval(() => {
    const now = Date.now();
    for (const key of Object.keys(chatSessions)) {
        if (now - chatSessions[key].lastActivity > SESSION_TTL_MS) {
            delete chatSessions[key];
        }
    }
}, 30 * 60 * 1000); // Clean every 30 minutes

// --- Sales Agent Logic (Server-Side Port) ---
// This is the full Date-First Sales Methodology engine

const ESCALATION_KEYWORDS = {
    large_group: ['corporate', 'company event', 'team building', 'birthday', 'bachelor', 'bachelorette', 'hen party', 'stag', 'special event', 'private event', 'private party', 'custom'],
    angry_tone: ['fuck', 'shit', 'bullshit', 'scam', 'terrible', 'disgusting', 'worst', 'horrible', 'awful', 'rip off', 'ripoff', 'rip-off'],
    legal_language: ['lawyer', 'attorney', 'sue', 'lawsuit', 'legal action', 'court', 'consumer protection', 'report you'],
    refund_conflict: ['chargeback', 'dispute charge', 'charge back', 'want my money back', 'demand refund', 'stolen money'],
    influencer_media: ['influencer', 'content creator', 'youtube', 'youtuber', 'media', 'press', 'journalist', 'review us', 'collab', 'collaboration', 'followers', '10k', '100k', 'tiktok']
};

const CONFIDENTIAL_TOPICS = {
    venues: ['iron balls', 'lennon', 'sing sing', 'chupa', 'levels', 'bobo', 'pastel', '1826'],
    margins: ['profit', 'margin', 'commission', 'how much do you make', 'what do you earn'],
    ratios: ['gender ratio', 'male female ratio', 'how many guys', 'how many girls', 'ratio', 'boy girl'],
    host_pay: ['host salary', 'host commission', 'how much hosts make', 'host pay', 'host earn']
};

function detectEscalationServer(text) {
    const lower = text.toLowerCase();
    for (const [reason, keywords] of Object.entries(ESCALATION_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lower.includes(keyword)) return reason;
        }
    }
    const groupMatch = lower.match(/(\d+)\s*(people|persons|guests|friends|of us|pax|group)/);
    if (groupMatch && parseInt(groupMatch[1]) >= 6) return 'large_group';
    const groupOfMatch = lower.match(/group\s*(of)?\s*(\d+)/);
    if (groupOfMatch && parseInt(groupOfMatch[2]) >= 6) return 'large_group';
    return null;
}

function detectConfidentialServer(text) {
    const lower = text.toLowerCase();
    for (const [topic, keywords] of Object.entries(CONFIDENTIAL_TOPICS)) {
        for (const keyword of keywords) {
            if (lower.includes(keyword)) return topic;
        }
    }
    return null;
}

function detectDateIntentServer(text) {
    const lower = text.toLowerCase();
    if (lower.includes('friday') && (lower.includes('this') || lower.includes('coming') || lower.includes('next') || !lower.includes('not'))) return 'this_friday';
    if (lower.includes('saturday') && (lower.includes('this') || lower.includes('coming') || lower.includes('next') || !lower.includes('not'))) return 'this_saturday';
    if (lower.includes('tonight') || lower.includes('today')) {
        const today = new Date().getDay();
        if (today === 5) return 'this_friday';
        if (today === 6) return 'this_saturday';
        return 'unsure';
    }
    if (lower.includes('this weekend') || lower.includes('this week')) return 'this_friday';
    if (lower.match(/^(yes|yeah|yep|sure)\b/)) return 'this_friday';
    if (lower.match(/next\s*(month|week|year)/) || lower.includes('later') || lower.includes('planning') || lower.includes('future')) return 'future';
    if (lower.includes('not sure') || lower.includes('maybe') || lower.includes('unsure') || lower.includes("don't know") || lower.includes('thinking')) return 'unsure';
    return null;
}

function detectGroupInfoServer(text) {
    const lower = text.toLowerCase();
    if (lower.includes('solo') || lower.includes('alone') || lower.includes('by myself') || lower.includes('just me') || lower.match(/\b1\s*(person|pax|guest)\b/)) return { type: 'solo', size: 1 };
    if (lower.includes('couple') || lower.includes('two of us') || lower.includes('2 of us') || lower.includes('me and my') || lower.includes('partner')) return { type: 'couple', size: 2 };
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

function detectIntentServer(text) {
    const lower = text.toLowerCase();
    if (lower.match(/^(hi|hello|hey|hiya|yo|sup|what's up|hola|good\s*(morning|evening|afternoon)|greetings)/)) return 'greeting';
    if (lower.match(/(book|reserve|sign up|join|register|sign me up|how do i join|how to book|i want to come|i want in|count me in)/)) return 'booking_request';
    if (lower.match(/(price|cost|how much|fee|charge|expensive|cheap|worth|pay|payment|money|afford|budget|thb|baht|฿)/)) return 'price_objection';
    if (lower.match(/(solo|alone|by myself|just me|single|no friends|don't know anyone|lonely|nervous|scared|anxious|worried|shy)/)) return 'solo_concern';
    if (lower.match(/(safe|safety|security|danger|secure|women|female|girl|lady|ladies|trust|worried|concern|sketchy|dodgy|legit)/)) return 'safety_concern';
    if (lower.match(/(pub crawl|bar crawl|bar hop|backpacker|party bus|drinking tour|booze|drunk|wasted|smashed|hammered)/)) return 'pub_crawl_confusion';
    if (lower.match(/(don't drink|non.?drinker|sober|no alcohol|teetotal|not a drinker|just about drinking)/)) return 'drinking_concern';
    if (lower.match(/(dress|wear|outfit|dress code|smart casual|flip.?flop|shorts|cloth|attire|what should i wear)/)) return 'dress_code';
    if (lower.match(/(which club|which venue|where do we go|what clubs|what bars|venue list|where exactly|which place|name.*club|club.*name)/)) return 'venue_inquiry';
    if (lower.match(/(when|what day|what night|which night|schedule|which day|friday|saturday|weekend|date|available|availability|upcoming)/)) return 'date_check';
    if (lower.match(/(what.*(include|included|get|receive|come with)|include|included|what do i get|what's in|what is in)/)) return 'whats_included';
    if (lower.match(/(refund|cancel|cancellation|money back|get back|return|change date|reschedule|postpone)/)) return 'refund_inquiry';
    if (lower.match(/(confirm|confirmation|guaranteed|will it happen|minimum|enough people|cancelled|cancel event)/)) return 'confirmation_inquiry';
    if (lower.match(/(how does it work|what happens|how it works|tell me more|explain|what is this|what.*about|describe)/)) return 'general_inquiry';
    if (lower.match(/(where.*meet|meeting point|meetup|meet up|pickup|pick up|location|where do we start|starting point)/)) return 'meetup_inquiry';
    if (lower.match(/(what time|when.*start|when.*end|how long|duration|hours|finish|start time|end time)/)) return 'time_inquiry';
    if (lower.match(/(thank|thanks|cheers|appreciate|bye|goodbye|see you|take care|great|awesome|cool|perfect|sounds good)/)) return 'positive_closing';
    return 'general';
}

// BOOKING_URL — used in text responses for messaging platforms (no HTML)
const BOOKING_URL = 'https://www.bkkclubcrawl.com/#booking';

function getEscalationResponseServer(reason) {
    switch (reason) {
        case 'large_group':
            return "For groups of 6 or more, we offer tailored experiences. I'll connect you with our team directly — they'll sort out the best setup for your crew.\n\n📩 Reach out to us at: info@bestnightlifethailand.com\n\nThey'll get back to you within a few hours.";
        case 'angry_tone':
            return "I understand your frustration, and I want to make sure this gets handled properly. I'm connecting you with our team lead who can address this directly.\n\n📩 Please email: info@bestnightlifethailand.com\n\nSomeone will respond to you promptly.";
        case 'legal_language':
            return "I take this seriously. For matters like this, I need to connect you with our management team directly.\n\n📩 Please contact: info@bestnightlifethailand.com\n\nThey'll address your concern properly.";
        case 'refund_conflict':
            return "I understand. Refund requests are handled by our team to make sure you're taken care of properly.\n\n📩 Please email: info@bestnightlifethailand.com with your booking reference.\n\nThey'll review your case and get back to you.";
        case 'influencer_media':
            return "We'd love to explore that. For media and collaboration inquiries, our team handles those directly.\n\n📩 Reach out to: info@bestnightlifethailand.com\n\nThey'll connect with you to discuss the details.";
        default:
            return "This is something I'll need to pass to our team. They'll be able to help you directly.\n\n📩 Email: info@bestnightlifethailand.com";
    }
}

function getConfidentialResponseServer(topic) {
    switch (topic) {
        case 'venues':
            return "We visit premium venues across Sukhumvit — each selected for atmosphere, music, and energy. The lineup is curated to create a deliberate flow, building from social warmup to peak energy.\n\nWe keep the exact lineup flexible to adapt to the night. That's part of what makes it curated, not a fixed checklist.";
        case 'margins':
        case 'host_pay':
            return "I appreciate the curiosity, but I can't share specifics on internal operations. What I can tell you is that the ฿1,500 covers a premium experience — 4 venues, VIP entry, hosts, transport, and drinks.\n\nAnything else I can help with?";
        case 'ratios':
            return "The group is always a curated, international mix. We focus on creating the right social energy rather than hitting specific numbers. The crowd is diverse, social, and well-matched.\n\nAnything else on your mind?";
        default:
            return "I appreciate the question, but I'm not able to share those details. Happy to help with anything about the experience itself though.";
    }
}

function handleIntentAtAnyStageServer(session, intent, text) {
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
                return `Let's get you in 👇\n\n→ Book Your Spot Now: ${BOOKING_URL}\n\nPick your date, add your details, and you're confirmed. Payment is via Stripe — secure and instant.`;
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

function handleWarmEntryServer(session, intent, dateIntent, text) {
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

function handleDateQualificationServer(session, intent, dateIntent, text) {
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
    return handleIntentAtAnyStageServer(session, intent, text) || "Got it. Just to get you the right info — are you looking at this Friday or Saturday?";
}

function handleRapportServer(session, intent, text) {
    const groupInfo = detectGroupInfoServer(text);
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
    return handleIntentAtAnyStageServer(session, intent, text) || "Good to have you. Will you be coming solo or with friends?";
}

function handleObjectionHandlingServer(session, intent, text) {
    const response = handleIntentAtAnyStageServer(session, intent, text);
    if (response) return response;
    const dateIntent = detectDateIntentServer(text);
    if (dateIntent === 'this_friday' || dateIntent === 'this_saturday') {
        session.dateConfirmed = dateIntent;
        session.stage = 'rapport';
        const day = dateIntent === 'this_friday' ? 'Friday' : 'Saturday';
        return `Great — ${day} works. Will you be coming solo or with a group?`;
    }
    if (!session.dateConfirmed) {
        return "I hear you. Are you in Bangkok this Friday or Saturday? That'll help me get you the right details.";
    }
    session.stage = 'controlled_close';
    return "Those are all fair questions. The short version: it's a premium, structured night — not random chaos. Everything's curated to flow.\n\nReady for me to send the booking link?";
}

function handleControlledCloseServer(session, intent, text) {
    const lower = text.toLowerCase();
    if (lower.match(/(yes|yeah|yep|sure|send it|let's go|let's do it|book|ready|i'm in|count me in|go for it|absolutely|definitely|do it|please|link)/)) {
        session.bookingLinkSent = true;
        session.stage = 'post_booking';
        return `Here you go 👇\n\n→ Book Your Spot Now: ${BOOKING_URL}\n\nThe form takes about 60 seconds. Pick your date, add your details, and you're in. Payment is via Stripe — secure and instant.\n\nOnce confirmed, you'll get the meet-up details. Any questions before you book?`;
    }
    const objectionResponse = handleIntentAtAnyStageServer(session, intent, text);
    if (objectionResponse) return objectionResponse;
    if (lower.match(/(think|maybe|not sure|later|consider|hmm|idk)/)) {
        return "No pressure at all. We run every Friday and Saturday, so the option's always there. If you're still deciding, just know we confirm the group by 7 PM on the day.\n\nFeel free to come back when you're ready — we'll sort your spot.";
    }
    return "Whenever you're ready, I can send the booking link. No rush — we run every weekend. 🙌";
}

function handlePostBookingServer(session, intent, text) {
    if (intent === 'dress_code') return "Dress code is smart casual. Think clean and styled — no flip-flops, no sports shorts, no sleeveless athletic wear. You don't need to overdress, just look like you planned the outfit.\n\nAnything else you need before the night?";
    if (intent === 'meetup_inquiry') return "The exact meetup location will be shared once your booking is confirmed — you'll receive all the details including the meeting point, time, and what to expect.\n\nAnything else on your mind?";
    if (intent === 'time_inquiry') return "The night starts at 9:30 PM. We recommend arriving a few minutes early. The last venue usually wraps between 2–3 AM depending on the energy of the group.\n\nAnything else?";
    if (intent === 'refund_inquiry') return "Here's how cancellations work:\n\n• Same-day cancellations are non-refundable\n• No-shows are non-refundable\n• If we cancel the event (rare), you'll be offered a reschedule or full refund immediately\n\nFor date changes, reach out to us as early as possible and we'll do our best to accommodate.\n\nAnything else?";
    if (intent === 'confirmation_inquiry') return "We confirm events by 7 PM on the day. Once confirmed, you'll receive the meetup details and a WhatsApp group link to connect with the crew.\n\nThe night is on. 🙌";
    if (intent === 'positive_closing') return "See you on the night. It's going to be a good one. 🙌\n\nBangkok Nights. Done Right.";
    return "You're all set. If anything comes up before the night, just message here. See you soon. 🙌";
}

function generateSalesResponse(session, text) {
    session.messageCount++;

    // Step 1: Escalation check
    const escalationReason = detectEscalationServer(text);
    if (escalationReason) {
        session.escalated = true;
        session.stage = 'escalated';
        return { response: getEscalationResponseServer(escalationReason), escalated: true, escalationReason };
    }

    // Step 2: Confidential check
    const confidentialTopic = detectConfidentialServer(text);
    if (confidentialTopic) {
        return { response: getConfidentialResponseServer(confidentialTopic), escalated: false };
    }

    // Step 3: Intent detection
    const intent = detectIntentServer(text);
    const dateIntent = detectDateIntentServer(text);
    const groupInfo = detectGroupInfoServer(text);

    if (dateIntent && !session.dateConfirmed) session.dateConfirmed = dateIntent;
    if (groupInfo) {
        session.groupType = groupInfo.type;
        session.groupSize = groupInfo.size;
        if (groupInfo.type === 'large_group') {
            session.escalated = true;
            session.stage = 'escalated';
            return { response: getEscalationResponseServer('large_group'), escalated: true, escalationReason: 'large_group' };
        }
    }

    let response;
    switch (session.stage) {
        case 'warm_entry':
            response = handleWarmEntryServer(session, intent, dateIntent, text);
            break;
        case 'date_qualification':
            response = handleDateQualificationServer(session, intent, dateIntent, text);
            break;
        case 'rapport':
            response = handleRapportServer(session, intent, text);
            break;
        case 'objection_handling':
            response = handleObjectionHandlingServer(session, intent, text);
            break;
        case 'controlled_close':
            response = handleControlledCloseServer(session, intent, text);
            break;
        case 'post_booking':
            response = handlePostBookingServer(session, intent, text);
            break;
        case 'escalated':
            response = "This has been flagged for our team. Someone from BEST Nightlife will reach out to you directly. Is there anything else I can help with in the meantime?";
            break;
        default:
            response = handleWarmEntryServer(session, intent, dateIntent, text);
    }

    return { response, escalated: false, stage: session.stage, intent };
}

// --- Channel Identification & User Key Extraction ---

function identifyChannel(payload) {
    // n8n sends a standardized payload with a 'channel' field
    // Fallback: detect from payload shape
    const ch = (payload.channel || '').toLowerCase();
    if (ch === 'whatsapp' || ch === 'wa') return 'whatsapp';
    if (ch === 'instagram' || ch === 'ig') return 'instagram';
    if (ch === 'facebook' || ch === 'fb' || ch === 'messenger') return 'facebook';

    // Auto-detect from payload fields
    if (payload.from && payload.from.startsWith('+')) return 'whatsapp';
    if (payload.instagram_handle || payload.ig_handle || payload.ig_username) return 'instagram';
    if (payload.page_id || payload.facebook_page_id || payload.psid) return 'facebook';

    return 'unknown';
}

function extractUserKey(channel, payload) {
    switch (channel) {
        case 'whatsapp': {
            let phone = payload.from || payload.phone || payload.sender_phone || payload.wa_id || '';
            // Normalize
            phone = String(phone).replace(/[^\d+]/g, '');
            if (phone.startsWith('0') && phone.length >= 9) phone = '+66' + phone.slice(1);
            if (!phone.startsWith('+') && phone.length >= 10) phone = '+' + phone;
            return { type: 'phone', value: phone || null };
        }
        case 'instagram': {
            const handle = payload.instagram_handle || payload.ig_handle || payload.ig_username || payload.sender_id || payload.from || '';
            return { type: 'ig_handle', value: handle.replace('@', '') || null };
        }
        case 'facebook': {
            const psid = payload.psid || payload.sender_id || payload.from || '';
            return { type: 'fb_psid', value: psid || null };
        }
        default:
            return { type: 'unknown', value: payload.from || payload.sender_id || null };
    }
}

// --- Webhook Secret for Security ---
const OMNICHANNEL_WEBHOOK_SECRET = process.env.OMNICHANNEL_WEBHOOK_SECRET || '';

app.post('/api/omnichannel-chat', async (req, res) => {
    console.log('📥 Omnichannel chat webhook received');

    try {
        // ——— 1. Optional Webhook Secret Verification ———
        if (OMNICHANNEL_WEBHOOK_SECRET) {
            const providedSecret =
                req.headers['x-webhook-secret'] ||
                req.headers['authorization']?.replace('Bearer ', '') ||
                req.query.secret || '';

            if (providedSecret !== OMNICHANNEL_WEBHOOK_SECRET) {
                console.error('❌ Omnichannel webhook: Invalid secret');
                return res.status(401).json({ error: 'Unauthorized: Invalid webhook secret' });
            }
        }

        const payload = req.body;

        // ——— 2. Extract Message ———
        const messageText = payload.message || payload.text || payload.body || payload.content || '';
        if (!messageText || !messageText.trim()) {
            return res.status(400).json({ error: 'Missing message content' });
        }

        // ——— 3. Identify Channel ———
        const channel = identifyChannel(payload);
        const userKey = extractUserKey(channel, payload);

        if (!userKey.value) {
            return res.status(400).json({ error: 'Cannot identify sender. Provide "from", "phone", "ig_handle", or "psid".' });
        }

        const sessionKey = `${channel}:${userKey.value}`;
        console.log(`📱 Channel: ${channel} | User: ${userKey.value} | Key: ${sessionKey}`);

        // ——— 4. Upsert Guest Profile in Supabase ———
        let guestId = null;
        try {
            if (channel === 'whatsapp' && userKey.type === 'phone') {
                // Phone-first matching (primary key per data-schema-rules)
                const { data: existingGuest } = await supabase
                    .from('guests')
                    .select('id, tags')
                    .eq('phone', userKey.value)
                    .single();

                if (existingGuest) {
                    guestId = existingGuest.id;
                    // Update source channel if first time from this channel
                    await supabase.from('guests').update({
                        source: 'whatsapp',
                        updated_at: new Date().toISOString()
                    }).eq('id', guestId);
                } else {
                    // Create minimal guest profile
                    const name = payload.sender_name || payload.profile_name || payload.name || null;
                    const { data: newGuest, error: guestError } = await supabase
                        .from('guests')
                        .insert({
                            first_name: name,
                            phone: userKey.value,
                            source: 'whatsapp',
                            tags: ['Interested'],
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                        .select('id')
                        .single();

                    if (!guestError && newGuest) {
                        guestId = newGuest.id;
                        console.log(`👤 New WhatsApp guest created: ${guestId}`);
                    }
                }
            } else if (channel === 'instagram' && userKey.type === 'ig_handle') {
                // Match by IG handle stored in metadata or source field
                const { data: existingGuest } = await supabase
                    .from('guests')
                    .select('id, tags')
                    .eq('ig_handle', userKey.value)
                    .single()
                    .catch(() => ({ data: null }));

                if (existingGuest) {
                    guestId = existingGuest.id;
                    await supabase.from('guests').update({
                        source: 'instagram',
                        updated_at: new Date().toISOString()
                    }).eq('id', guestId);
                } else {
                    const name = payload.sender_name || payload.name || userKey.value;
                    const { data: newGuest, error: guestError } = await supabase
                        .from('guests')
                        .insert({
                            first_name: name,
                            source: 'instagram',
                            ig_handle: userKey.value,
                            tags: ['Interested', 'IG-Lead'],
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                        .select('id')
                        .single();

                    if (!guestError && newGuest) {
                        guestId = newGuest.id;
                        console.log(`👤 New Instagram guest created: ${guestId}`);
                    }
                }
            } else if (channel === 'facebook' && userKey.type === 'fb_psid') {
                // Match by FB PSID
                const { data: existingGuest } = await supabase
                    .from('guests')
                    .select('id, tags')
                    .eq('fb_psid', userKey.value)
                    .single()
                    .catch(() => ({ data: null }));

                if (existingGuest) {
                    guestId = existingGuest.id;
                    await supabase.from('guests').update({
                        source: 'facebook',
                        updated_at: new Date().toISOString()
                    }).eq('id', guestId);
                } else {
                    const name = payload.sender_name || payload.name || null;
                    const { data: newGuest, error: guestError } = await supabase
                        .from('guests')
                        .insert({
                            first_name: name,
                            source: 'facebook',
                            fb_psid: userKey.value,
                            tags: ['Interested', 'FB-Lead'],
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                        .select('id')
                        .single();

                    if (!guestError && newGuest) {
                        guestId = newGuest.id;
                        console.log(`👤 New Facebook guest created: ${guestId}`);
                    }
                }
            }
        } catch (dbErr) {
            // Non-blocking — continue even if guest upsert fails
            console.error('⚠️ Guest upsert error (non-blocking):', dbErr.message);
        }

        // ——— 5. Generate AI Response via Sales Agent ———
        const session = getOrCreateSession(sessionKey);
        const result = generateSalesResponse(session, messageText.trim());

        console.log(`💬 Response generated | Stage: ${session.stage} | Escalated: ${result.escalated}`);

        // ——— 6. Send Admin Notification on Escalation ———
        if (result.escalated && process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: `🚨 Escalation: ${channel} message from ${userKey.value}`,
                text: [
                    `🚨 Chat Escalation (${channel.toUpperCase()})`,
                    ``,
                    `User: ${userKey.value}`,
                    `Reason: ${result.escalationReason || 'unknown'}`,
                    `Message: "${messageText.trim()}"`,
                    ``,
                    `Guest ID: ${guestId || 'Not linked'}`,
                    `Session Stage: ${session.stage}`
                ].join('\n')
            }).catch(err => console.error('⚠️ Escalation email failed:', err.message));
        }

        // ——— 7. Return Response for n8n ———
        return res.json({
            reply: result.response,
            channel: channel,
            user_key: userKey.value,
            user_key_type: userKey.type,
            guest_id: guestId,
            session_stage: session.stage,
            escalated: result.escalated,
            escalation_reason: result.escalationReason || null
        });

    } catch (err) {
        console.error('❌ Omnichannel chat error:', err);
        return res.status(500).json({
            error: 'Chat processing failed',
            message: err.message
        });
    }
});


// Export for Vercel serverless
module.exports = app;
