import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Supabase using service role to bypass RLS for guest upserts
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const resendApiKey = process.env.RESEND_API_KEY;
const adminEmail = process.env.ADMIN_EMAIL || 'bestnightlifethailand@gmail.com';
const resend = new Resend(resendApiKey);

/**
 * Safely escape user-supplied strings before interpolating into HTML templates
 * to prevent Cross-Site Scripting (XSS).
 */
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(req, res) {
  // Only allow secure POST submissions
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { name, whatsapp, date, groupSize, occasion, preferredVibe, budgetRange, inquiryType } = req.body;

    // 1. Validate mandatory fields
    if (!name || !whatsapp) {
      return res.status(400).json({ error: 'Name and WhatsApp number are required.' });
    }

    // 2. Normalize WhatsApp number to E.164 (Rule 3)
    let normalizedPhone = null;
    if (whatsapp) {
      let cleaned = String(whatsapp).replace(/[^\d+]/g, '');
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

    if (!normalizedPhone) {
      return res.status(400).json({ error: 'Please enter a valid WhatsApp phone number (e.g. +66812345678 or 0812345678).' });
    }

    // 3. Upsert Guest Profile (Rule 3: One Guest, One Profile)
    const { data: existingGuest, error: fetchError } = await supabase
      .from('guests')
      .select('id, tags')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ Supabase fetch guest error:', fetchError);
      return res.status(500).json({ error: 'Database query failure.' });
    }

    let guestId;
    const tagToAppend = '⭐ Private Inquiry';

    if (existingGuest) {
      guestId = existingGuest.id;
      // Deduplicate tags (Rule 4)
      let tags = existingGuest.tags || [];
      if (!tags.includes(tagToAppend)) {
        tags.push(tagToAppend);
      }

      const { error: updateError } = await supabase
        .from('guests')
        .update({
          first_name: name,
          tags: tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', guestId);

      if (updateError) {
        console.error('❌ Supabase update guest error:', updateError);
        return res.status(500).json({ error: 'Failed to update guest profile.' });
      }
      console.log(`👤 Guest ${guestId} updated with Private Inquiry tag`);
    } else {
      // Create new guest with custom generated guestId
      const firstName = name.trim().split(/\s+/)[0] || 'Guest';
      const cleanFirstName = firstName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '') || 'guest';
      const phoneDigits = String(normalizedPhone || '').replace(/\D/g, '');
      const last3 = phoneDigits.length >= 3 ? phoneDigits.slice(-3) : '000';
      const customGuestId = `${cleanFirstName}-${last3}`;

      const { data: newGuest, error: insertError } = await supabase
        .from('guests')
        .insert({
          id: customGuestId,
          first_name: name,
          phone: normalizedPhone,
          tags: [tagToAppend],
          source: 'website_inquiry',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('❌ Supabase insert guest error:', insertError);
        return res.status(500).json({ error: 'Failed to create guest profile.' });
      }
      guestId = newGuest.id;
      console.log(`👤 New guest ${guestId} created with Private Inquiry tag`);
    }

    // 4. Record details in experience_inquiries table
    const { data: inquiry, error: inquiryError } = await supabase
      .from('experience_inquiries')
      .insert({
        guest_id: guestId,
        inquiry_type: inquiryType || 'Private Inquiry',
        event_date: date || null,
        group_size: groupSize ? String(groupSize) : null,
        occasion: occasion || null,
        preferred_vibe: preferredVibe || null,
        budget_range: budgetRange ? String(budgetRange) : null
      })
      .select('id')
      .single();

    if (inquiryError) {
      console.error('❌ Supabase insert inquiry error:', inquiryError);
      return res.status(500).json({ error: 'Failed to record experience inquiry.' });
    }
    console.log(`📋 Experience inquiry recorded in database: ${inquiry.id}`);

    // 5. Send Instant Email Alert via standard Gmail SMTP
    const leadType = inquiryType || 'Private Inquiry';
    const emailSubject = `🚨 VIP LEAD: ${name} - ${leadType}`;
    
    // Construct rich, elegant HTML body matching the brand guidelines (Sukhumvit vibes)
    const emailHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${emailSubject}</title>
</head>
<body style="margin:0;padding:0;background-color:#08080A;font-family:'Inter',sans-serif;color:#FFFFFF;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#08080A;">
        <tr>
            <td align="center" style="padding:40px 20px;">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding-bottom:24px;">
                            <h1 style="margin:0;font-family:'Montserrat',sans-serif;font-size:24px;font-weight:700;color:#FFFFFF;letter-spacing:0.05em;text-transform:uppercase;">🚨 NEW VIP LEAD</h1>
                            <p style="margin:6px 0 0;font-size:11px;color:#FF2D95;letter-spacing:0.15em;text-transform:uppercase;">BEST Nightlife Thailand — Premium Pipeline</p>
                        </td>
                    </tr>

                    <!-- Card Body -->
                    <tr>
                        <td style="background-color:#121216;border-radius:16px;border:1px solid rgba(255,255,255,0.06);padding:32px;box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                            
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                <tr>
                                    <td>
                                        <div style="display:inline-block;background:linear-gradient(135deg,#FF2D95,#FF6B9D);color:#FFFFFF;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;padding:6px 16px;border-radius:9999px;">
                                            ${escapeHTML(leadType)}
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <h2 style="margin:0 0 20px;font-size:20px;font-family:'Montserrat',sans-serif;color:#D4AF37;font-weight:600;">
                                Inquiry Details
                            </h2>

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1C1C22;border-radius:12px;padding:20px;border:1px solid rgba(255,255,255,0.04);">
                                <tr>
                                    <td style="padding:8px 0;font-size:13px;color:#8E8E93;text-transform:uppercase;letter-spacing:0.08em;width:35%;">Guest Name</td>
                                    <td style="padding:8px 0;font-size:14px;color:#FFFFFF;font-weight:600;">${escapeHTML(name)}</td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="border-bottom:1px solid rgba(255,255,255,0.06);"></td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;font-size:13px;color:#8E8E93;text-transform:uppercase;letter-spacing:0.08em;">WhatsApp</td>
                                    <td style="padding:8px 0;font-size:14px;color:#FFFFFF;font-weight:600;">
                                        <a href="https://wa.me/${escapeHTML(normalizedPhone).replace('+', '')}" style="color:#00E676;text-decoration:none;font-weight:700;">
                                            ${escapeHTML(normalizedPhone)} 💬 (Click to Chat)
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="border-bottom:1px solid rgba(255,255,255,0.06);"></td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;font-size:13px;color:#8E8E93;text-transform:uppercase;letter-spacing:0.08em;">Event Date</td>
                                    <td style="padding:8px 0;font-size:14px;color:#FFFFFF;font-weight:600;">${escapeHTML(date || 'TBD')}</td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="border-bottom:1px solid rgba(255,255,255,0.06);"></td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;font-size:13px;color:#8E8E93;text-transform:uppercase;letter-spacing:0.08em;">Group Size</td>
                                    <td style="padding:8px 0;font-size:14px;color:#FFFFFF;font-weight:600;">${escapeHTML(groupSize || 'TBD')} pax</td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="border-bottom:1px solid rgba(255,255,255,0.06);"></td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;font-size:13px;color:#8E8E93;text-transform:uppercase;letter-spacing:0.08em;">Occasion</td>
                                    <td style="padding:8px 0;font-size:14px;color:#FFFFFF;font-weight:600;">${escapeHTML(occasion || 'N/A')}</td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="border-bottom:1px solid rgba(255,255,255,0.06);"></td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;font-size:13px;color:#8E8E93;text-transform:uppercase;letter-spacing:0.08em;">Preferred Vibe</td>
                                    <td style="padding:8px 0;font-size:14px;color:#FFFFFF;font-weight:600;">${escapeHTML(preferredVibe || 'N/A')}</td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="border-bottom:1px solid rgba(255,255,255,0.06);"></td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;font-size:13px;color:#8E8E93;text-transform:uppercase;letter-spacing:0.08em;">Estimated Budget</td>
                                    <td style="padding:8px 0;font-size:15px;color:#D4AF37;font-weight:700;">${escapeHTML(budgetRange || 'TBD')}</td>
                                </tr>
                            </table>

                            <div style="margin-top:28px;padding:16px;background-color:rgba(212,175,55,0.05);border-radius:10px;border:1px dashed rgba(212,175,55,0.2);">
                                <h3 style="margin:0 0 6px 0;font-size:12px;color:#D4AF37;text-transform:uppercase;letter-spacing:0.05em;">💡 AI Analyst Reference</h3>
                                <p style="margin:0;font-size:12px;color:#AEAEB2;line-height:1.5;">
                                    Cross-reference these requirements against the <strong>Expansion Pricing Guide.md</strong>. Pitch high-value packages (Mid/Premium tiers) first, adjustments down, and bundle add-ons to secure healthy margins!
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding-top:24px;">
                            <p style="margin:0;font-size:11px;color:#55555C;letter-spacing:0.05em;text-transform:uppercase;">
                                BEST Nightlife Thailand Database Management System
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    // Dispatch email asynchronously so the client request is never slowed down
    try {
      if (resendApiKey) {
        const response = await resend.emails.send({
          from: 'BEST Lead Alerts <onboarding@resend.dev>',
          to: adminEmail,
          subject: emailSubject,
          html: emailHTML,
          text: `New VIP Lead:\nName: ${name}\nWhatsApp: ${normalizedPhone}\nExperience: ${leadType}\nDate: ${date || 'TBD'}\nPax: ${groupSize || 'TBD'}\nOccasion: ${occasion || 'N/A'}\nVibe: ${preferredVibe || 'N/A'}\nBudget: ${budgetRange || 'TBD'}`
        });
        if (response.error) {
          throw response.error;
        }
        console.log(`📧 Resend email alert successfully dispatched to ${adminEmail}: ${response.data.id}`);
      } else {
        console.warn('⚠️ Resend API key not configured in env — skipping email alert');
      }
    } catch (emailErr) {
      console.error('⚠️ Resend email alert dispatch failed (non-blocking):', emailErr.message || emailErr);
      // We intentionally do not throw here, so the frontend still gets a 200 OK success response.
    }

    // 6. Return standard response
    return res.status(200).json({
      success: true,
      message: 'Inquiry submitted successfully',
      inquiryId: inquiry.id,
      guestId: guestId
    });

  } catch (error) {
    console.error('❌ Server error handling vip inquiry:', error);
    return res.status(500).json({ error: 'Internal server error processing inquiry.' });
  }
}
