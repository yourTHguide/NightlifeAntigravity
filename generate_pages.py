import os
import re

# Read main index.html to extract common elements
with open('/Users/guide/Desktop/NightlifeAntigravity/index.html', 'r') as f:
    main_html = f.read()

# Extract head
head_match = re.search(r'<head>(.*?)</head>', main_html, re.DOTALL)
head = head_match.group(1) if head_match else ''
# Update paths to be absolute
head = head.replace('href="css/', 'href="/css/').replace('src="js/', 'src="/js/').replace('href="assets/', 'href="/assets/')

# Extract header
header_match = re.search(r'<header class="header">(.*?)</header>', main_html, re.DOTALL)
header = header_match.group(0) if header_match else ''
header = header.replace('href="#', 'href="/#').replace('href="index.html#', 'href="/#')

# Extract footer
footer_match = re.search(r'<footer class="footer".*?>(.*?)</footer>', main_html, re.DOTALL)
footer = footer_match.group(0) if footer_match else ''
footer = footer.replace('href="#', 'href="/#').replace('href="index.html#', 'href="/#')

# Basic Template
def generate_page(data):
    # Construct THE NIGHT list
    the_night_items = "\n".join([f"""<li style="display: flex; align-items: flex-start; margin-bottom: 12px; gap: 12px;">
                                <span style="width: 8px; height: 8px; border-radius: 50%; background: #EA003A; box-shadow: 0 0 6px rgba(234,0,58,0.50); display: inline-block; margin-top: 6px; flex-shrink: 0;"></span>
                                <span style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.80); line-height: 1.6;">{item}</span>
                            </li>""" for item in data['the_night']])
                            
    # Construct GOOD TO KNOW list
    good_to_know_items = "\n".join([f"""<li style="display: flex; align-items: flex-start; margin-bottom: 12px; gap: 12px;">
                                <span style="width: 8px; height: 8px; border-radius: 50%; background: #EA003A; box-shadow: 0 0 6px rgba(234,0,58,0.50); display: inline-block; margin-top: 6px; flex-shrink: 0;"></span>
                                <span style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.65); line-height: 1.6;">{item}</span>
                            </li>""" for item in data['good_to_know']])
    
    # Optional Callout Box
    series_specific_html = ""
    if data.get('series_specific_title'):
        series_specific_html += f"""
        <div style="margin-bottom: 32px;">
            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 10px; letter-spacing: 0.18em; color: #EA003A; text-transform: uppercase; margin-bottom: 16px;">{data['series_specific_title']}</div>
        """
        if data.get('series_specific_paragraph'):
            series_specific_html += f"""<p style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 15px; color: rgba(255,255,255,0.70); line-height: 1.7; margin-bottom: 16px;">{data['series_specific_paragraph']}</p>"""
            
        if data.get('series_specific_italic_full'):
            series_specific_html += f"""<p style="font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 400; font-size: 20px; color: rgba(255,255,255,0.80); line-height: 1.6; margin-bottom: 16px;">{data['series_specific_italic_full']}</p>"""
            
        if data.get('series_specific_lines'):
            for line in data['series_specific_lines']:
                series_specific_html += f"""<p style="font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 400; font-size: 16px; color: rgba(255,255,255,0.65); line-height: 1.6; margin-bottom: 8px;">{line}</p>"""
        
        if data.get('series_specific_secondary_title'):
            series_specific_html += f"""<div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 10px; letter-spacing: 0.18em; color: #EA003A; text-transform: uppercase; margin-top: 24px; margin-bottom: 16px;">{data['series_specific_secondary_title']}</div>"""
            if data.get('series_specific_secondary_lines'):
                for line in data['series_specific_secondary_lines']:
                    series_specific_html += f"""<p style="font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.6; margin-bottom: 8px;">{line}</p>"""

        if data.get('callout_box'):
            series_specific_html += f"""
            <div style="background: rgba(234,0,58,0.08); border: 1px solid rgba(234,0,58,0.20); border-left: 3px solid #EA003A; border-radius: 10px; padding: 20px 24px; margin-top: 24px; font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 400; font-size: {data.get('callout_fontsize', '16px')}; color: rgba(255,255,255,0.80); line-height: 1.6;">
                {data['callout_box']}
            </div>
            """
        if data.get('series_specific_note_below'):
            series_specific_html += f"""<p style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 13px; color: rgba(255,255,255,0.50); line-height: 1.6; margin-top: 16px;">{data['series_specific_note_below']}</p>"""
            
        series_specific_html += "</div>"

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    {head}
    <style>
        .subpage-hero {{
            position: relative;
            width: 100%;
            height: 55vh;
            background: linear-gradient(160deg, #41002A, #2F002F);
            background-size: cover;
            background-position: center;
        }}
        @media (min-width: 768px) {{
            .subpage-hero {{ height: 65vh; }}
        }}
        .subpage-hero-overlay {{
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, rgba(47,0,47,0.20) 0%, rgba(26,0,21,0.88) 100%);
        }}
        .subpage-back-nav {{
            position: absolute;
            top: 72px; /* below header */
            left: 24px;
            z-index: 10;
        }}
        @media (min-width: 768px) {{
            .subpage-back-nav {{ top: 100px; }}
        }}
        .sticky-bottom-bar {{
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 56px;
            background: linear-gradient(135deg, #EA003A 0%, #820065 100%);
            z-index: 999;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            padding-bottom: env(safe-area-inset-bottom);
        }}
        @media (min-width: 768px) {{
            .sticky-bottom-bar {{ display: none; }}
        }}
    </style>
</head>
<body style="background: #2F002F; margin: 0; padding-bottom: 56px;">

    {header}

    <!-- Back Navigation -->
    <div class="subpage-back-nav">
        <a href="/#select-night" style="font-family: 'Inter', sans-serif; font-weight: 500; font-size: 13px; color: rgba(255,255,255,0.50); text-decoration: none;">&larr; All Nights</a>
    </div>

    <!-- Hero -->
    <div class="subpage-hero">
        <div class="subpage-hero-overlay"></div>
        <div style="position: absolute; top: 20px; left: 20px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 9px; letter-spacing: 0.18em; color: #EA003A; text-transform: uppercase;">
            {data['series_tag']}
        </div>
        <h1 style="position: absolute; bottom: 0; left: 0; margin: 0; padding: 0 24px 24px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: clamp(32px, 7vw, 56px); color: #FFFFFF;">
            {data['headline']}
        </h1>
    </div>

    <!-- Content -->
    <main style="max-width: 640px; margin: 0 auto;">
        <!-- Positioning Line -->
        <p style="font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 400; font-size: 20px; color: rgba(255,255,255,0.70); padding: 32px 24px 8px; margin: 0;">
            {data['positioning_line']}
        </p>

        <!-- Description -->
        <p style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 15px; color: rgba(255,255,255,0.70); line-height: 1.7; padding: 0 24px 32px; margin: 0;">
            {data['description']}
        </p>

        <!-- THE NIGHT -->
        <div style="padding: 0 24px 32px; background: #1A0015; padding-top: 32px;">
            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 10px; letter-spacing: 0.18em; color: #EA003A; text-transform: uppercase; margin-bottom: 16px;">THE NIGHT</div>
            <ul style="list-style: none; padding: 0; margin: 0;">
                {the_night_items}
            </ul>
        </div>

        <!-- SERIES-SPECIFIC -->
        <div style="padding: 32px 24px; background: #2F002F;">
            {series_specific_html}
        </div>

        <!-- LOGISTICS -->
        <div style="padding: 32px 24px; background: #1A0015;">
            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 10px; letter-spacing: 0.18em; color: #EA003A; text-transform: uppercase; margin-bottom: 24px;">LOGISTICS</div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
                <!-- DATE & TIME -->
                <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 20px 24px;">
                    <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 10px; letter-spacing: 0.16em; color: rgba(255,255,255,0.40); text-transform: uppercase; margin-bottom: 8px;">DATE &amp; TIME</div>
                    <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 16px; color: #FFFFFF; line-height: 1.4;">{data['logistics_date']}</div>
                </div>
                <!-- LOCATION -->
                <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 20px 24px;">
                    <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 10px; letter-spacing: 0.16em; color: rgba(255,255,255,0.40); text-transform: uppercase; margin-bottom: 8px;">LOCATION</div>
                    <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 16px; color: #FFFFFF; line-height: 1.4;">{data['logistics_location']}</div>
                </div>
                <!-- PRICE -->
                <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 20px 24px;">
                    <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 10px; letter-spacing: 0.16em; color: rgba(255,255,255,0.40); text-transform: uppercase; margin-bottom: 8px;">PRICE</div>
                    <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 16px; color: #FFFFFF; line-height: 1.4;">{data['logistics_price']}</div>
                </div>
                <!-- SPOTS -->
                <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 20px 24px;">
                    <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 10px; letter-spacing: 0.16em; color: rgba(255,255,255,0.40); text-transform: uppercase; margin-bottom: 8px;">SPOTS</div>
                    <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 16px; color: #FFFFFF; line-height: 1.4;">{data['logistics_spots']}</div>
                </div>
            </div>
        </div>

        <!-- GOOD TO KNOW -->
        <div style="padding: 32px 24px; background: #2F002F;">
            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 10px; letter-spacing: 0.18em; color: #EA003A; text-transform: uppercase; margin-bottom: 16px;">GOOD TO KNOW</div>
            <ul style="list-style: none; padding: 0; margin: 0; margin-bottom: 24px;">
                {good_to_know_items}
            </ul>
            <p style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 12px; color: rgba(255,255,255,0.35); line-height: 1.6; margin: 0;">
                All are welcome regardless of the night's theme. Each series is designed with a specific crowd in mind &mdash; the energy and format reflect that. Capacity is strictly limited. Booking is confirmed only upon payment.
            </p>
        </div>
    </main>

    {footer}

    <!-- Sticky Bottom Bar -->
    <a href="/#select-night" class="sticky-bottom-bar">
        <span style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 15px; color: #FFFFFF;">Book This Night &mdash; From ฿{data['price_raw']}</span>
    </a>

    <script src="/js/app.js"></script>
</body>
</html>
"""
    return html_content

# We start with /saturday-signature
saturday_data = {
    'series_tag': 'FLAGSHIP · SATURDAY NIGHTS',
    'headline': 'BCC Signature Night',
    'positioning_line': 'The best version of Bangkok after dark.',
    'description': "Saturday is the flagship.<br>This is the night the brand was built on &mdash;<br>four of Bangkok's best venues, VIP entry,<br>two private party vans, and two dedicated hosts<br>who run the whole night so you just show up.<br>Mixed crowd, international energy,<br>peak Bangkok nightlife.<br>700+ five-star reviews.<br>Most of them are from a Saturday.",
    'the_night': [
        "4 premium venues &mdash; the highest-tier lineup of the week",
        "Two private party vans with music and lights &mdash; groups converge at each venue",
        "Welcome shots on arrival",
        "VIP entry at all stops &mdash; no queue, no negotiation at the door",
        "Two dedicated hosts managing the full night",
        "Capped at 24 guests &mdash; larger energy than weekday editions, still curated and controlled",
        "International mixed crowd: locals, expats, and travelers together"
    ],
    'series_specific_title': 'WHY SATURDAY IS DIFFERENT',
    'series_specific_paragraph': "Saturday has two vans, two hosts, and the biggest crowd of the week. The energy is higher because the city is fully switched on. The venues are running at their best. The host team makes sure every guest &mdash; from every corner of the group &mdash; has a night worth talking about.",
    'callout_fontsize': '18px',
    'callout_box': "700+ five-star reviews.<br>Most of them are from a Saturday.",
    'logistics_date': 'Every Saturday &middot; 9:30 PM &ndash; Late',
    'logistics_location': 'Sukhumvit 11 / Asoke area<br><span style="font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.70);">Meeting point confirmed on booking</span>',
    'logistics_price': '฿1,500 per person',
    'logistics_spots': 'Limited to 24 guests per night',
    'good_to_know': [
        "Smart casual dress code &mdash; strictly enforced at premium venues on Saturday",
        "Minimum age 20 years",
        "Saturday sells out regularly &mdash; book at least 3&ndash;5 days ahead",
        "Private group bookings available for 8+ guests",
        "Event confirmed or cancelled at 7 PM"
    ],
    'price_raw': '1,500'
}

# Ensure directory exists
os.makedirs('/Users/guide/Desktop/NightlifeAntigravity/saturday-signature', exist_ok=True)
with open('/Users/guide/Desktop/NightlifeAntigravity/saturday-signature/index.html', 'w') as f:
    f.write(generate_page(saturday_data))

print("Created saturday-signature/index.html")


# PAGE 01 — SOLO TRAVELER'S NIGHT
solo_data = {
    'series_tag': 'SOLO TRAVELERS · TUESDAY NIGHTS',
    'headline': "Solo Traveler's Night",
    'positioning_line': 'Arrive alone. Leave with a crew.',
    'description': "Tuesday nights are built for one specific person:<br>someone who showed up to Bangkok alone<br>and wants to actually meet people &mdash;<br>not just stand next to them at a bar.<br>The host actively connects guests from the<br>first stop. By venue three, you'll have people<br>you want to see again tomorrow.",
    'the_night': [
        "4 curated venues across Sukhumvit",
        "Dedicated host &mdash; active introductions from the first stop, not just logistics",
        "Welcome shots on arrival (from venue partnership)",
        "Private party van with music between venues",
        "VIP entry at all stops &mdash; no queue",
        "Capped at 12 guests &mdash; everyone interacts, nobody gets lost"
    ],
    'series_specific_title': 'WHO YOU\'LL MEET',
    'series_specific_lines': [
        "\"Travelers passing through Bangkok for a few nights\"",
        "\"Expats in their first weeks finding their crowd\"",
        "\"Anyone who travels solo and prefers real connection over standing at a bar alone\""
    ],
    'callout_fontsize': '16px',
    'callout_box': "Most guests on Solo Traveler's Night<br>exchange numbers before venue two.",
    'logistics_date': 'Every Tuesday &middot; 9:30 PM &ndash; Late',
    'logistics_location': 'Sukhumvit 11 / Asoke area<br><span style="font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.70);">Meeting point confirmed on booking</span>',
    'logistics_price': '฿1,000 per person',
    'logistics_spots': 'Limited to 12 guests per night',
    'good_to_know': [
        "Smart casual dress code",
        "Minimum age 20 years",
        "All are welcome &mdash; this night just naturally attracts solo bookers",
        "Groups of 2&ndash;4 welcome &mdash; you'll mix with the solo crowd",
        "Event confirmed or cancelled at 7 PM on the day of the event"
    ],
    'price_raw': '1,000'
}

# PAGE 06 — TGIF BANGKOK
tgif_data = {
    'series_tag': 'FRIDAY NIGHTS · ALL WELCOME',
    'headline': 'TGIF Bangkok',
    'positioning_line': 'The week is done. Bangkok begins.',
    'description': "Friday is the highest-energy night of the week<br>and we run it that way.<br>Four venues, a crowd that's ready,<br>and the kind of momentum that builds<br>from the first stop.<br>All are welcome &mdash;<br>the crowd is whoever showed up<br>and wanted a great Friday in Bangkok.",
    'the_night': [
        "4 curated venues &mdash; Friday lineup includes premium stops across Sukhumvit",
        "Higher energy pacing than weekday editions",
        "Welcome shots on arrival",
        "Private party van with music and lights between every venue",
        "VIP entry at all stops &mdash; no queue",
        "Capped at 12 &mdash; same intimacy as weekday nights at Friday energy levels"
    ],
    'series_specific_title': 'FRIDAY ENERGY',
    'series_specific_italic_full': "This is the highest-demand night of the week.<br>The venues are at peak energy.<br>The host keeps it moving and keeps it together.<br>Friday in Bangkok, done properly.",
    'logistics_date': 'Every Friday &middot; 9:30 PM &ndash; Late',
    'logistics_location': 'Sukhumvit 11 / Asoke area<br><span style="font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.70);">Meeting point confirmed on booking</span>',
    'logistics_price': '฿1,200 per person',
    'logistics_spots': 'Limited to 12 guests per night',
    'good_to_know': [
        "Smart casual dress code &mdash; some stops enforce this strictly on Fridays",
        "Minimum age 20 years",
        "Friday books out fastest &mdash; book at least 3&ndash;4 days ahead",
        "Works equally well for solo bookers, pairs, and small groups",
        "Event confirmed or cancelled at 7 PM"
    ],
    'price_raw': '1,200'
}

# PAGE 04 — GIRLS NIGHT BANGKOK
girls_data = {
    'series_tag': 'WOMEN-CURATED · THURSDAY NIGHTS',
    'headline': 'Girls Night Bangkok',
    'positioning_line': 'Your night. Properly done.',
    'description': "Bangkok has extraordinary nightlife &mdash;<br>but navigating it as a woman, especially solo<br>or in a small group, means managing things<br>you shouldn't have to think about.<br>This night removes all of that.<br>Venue selection is deliberate.<br>The host manages the group and the room.<br>You show up and enjoy it.",
    'the_night': [
        "4 venues &mdash; selected specifically for atmosphere, safety, and quality",
        "Female-aware hosting &mdash; the team knows what a good night looks like for this crowd",
        "Welcome shots on arrival",
        "Private party van with music between venues",
        "VIP entry at all stops &mdash; no door friction",
        "Capped at 12 &mdash; never oversized, always the right energy"
    ],
    'series_specific_title': 'DESIGNED FOR',
    'series_specific_lines': [
        "\"Women traveling Bangkok solo or in small groups\"",
        "\"Expat women who want a proper night without the planning\"",
        "\"Friend groups who want someone else to handle the logistics\"",
        "\"Bachelorette groups wanting a curated experience over a DIY crawl\""
    ],
    'callout_fontsize': '16px',
    'callout_box': "This is not a ladies drink free night.<br>It is a curated experience where the crowd,<br>the venues, and the energy are all considered.<br>The price reflects that.",
    'logistics_date': 'Every Thursday (Week 1 & 3) &middot; 9:30 PM &ndash; Late',
    'logistics_location': 'Sukhumvit 11 / Asoke area<br><span style="font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.70);">Meeting point confirmed on booking</span>',
    'logistics_price': '฿1,000 per person',
    'logistics_spots': 'Limited to 12 guests per night',
    'good_to_know': [
        "Smart casual to dressed up &mdash; both welcome, this crowd usually dresses well",
        "Minimum age 20 years",
        "All genders welcome &mdash; the night is curated for women, not exclusive to them",
        "Bachelorette groups of 8+: contact us for private booking options",
        "Event confirmed or cancelled at 7 PM"
    ],
    'price_raw': '1,000'
}

# PAGE 02 — NEW IN BANGKOK NIGHT
newinbkk_data = {
    'series_tag': 'NEW IN BANGKOK · WEDNESDAY NIGHTS',
    'headline': 'New in Bangkok Night',
    'positioning_line': 'Just landed. This is your room.',
    'description': "Moving to Bangkok &mdash; or visiting for an extended<br>stay &mdash; means starting from scratch socially.<br>This night is for people in that exact window:<br>new enough that you don't have a crew yet,<br>here long enough that you want to find one.<br>Everyone in the room is in the same position.<br>That's the whole point.",
    'the_night': [
        "4 curated venues across Sukhumvit",
        "Host introduces guests by name and context &mdash; personal introductions, not a group address",
        "Welcome shots on arrival",
        "Private party van with music between venues",
        "VIP entry at all stops",
        "Capped at 12 &mdash; intimate enough that everyone actually meets everyone",
        "Optional post-crawl group chat for guests who want to stay connected"
    ],
    'series_specific_title': 'THIS NIGHT IS FOR',
    'series_specific_lines': [
        "\"You moved to Bangkok in the last 1&ndash;3 months\"",
        "\"You're here for 2&ndash;6 weeks and want a real crowd\"",
        "\"You've been here longer but your social circle hasn't expanded beyond work yet\""
    ],
    'callout_fontsize': '16px',
    'callout_box': "Everyone on this night is either new to Bangkok<br>or actively building their circle.<br>Nobody has a pre-formed group.<br>The dynamic is different &mdash; and it works.",
    'logistics_date': 'Every Wednesday (Week 1 & 3) &middot; 9:30 PM &ndash; Late',
    'logistics_location': 'Sukhumvit 11 / Asoke area<br><span style="font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.70);">Meeting point confirmed on booking</span>',
    'logistics_price': '฿1,000 per person',
    'logistics_spots': 'Limited to 12 guests per night',
    'good_to_know': [
        "Smart casual dress code",
        "Minimum age 20 years",
        "Open to all &mdash; tourists welcome alongside expats and new residents",
        "Most conversation-forward night in the BCC series",
        "Event confirmed or cancelled at 7 PM"
    ],
    'price_raw': '1,000'
}

# PAGE 03 — DIGITAL NOMAD CRAWL
nomads_data = {
    'series_tag': 'NOMADS & REMOTE WORKERS · WEDNESDAY NIGHTS',
    'headline': 'Digital Nomad Crawl',
    'positioning_line': 'Work from anywhere. Tonight, Bangkok.',
    'description': "Bangkok is one of the world's great cities for<br>remote workers. The coworking spaces are full<br>of people doing interesting things &mdash;<br>but nobody talks to each other.<br>Wednesday nights fix that.<br>This is nightlife built for people who move through<br>the world independently and want to meet others<br>who do the same.",
    'the_night': [
        "4 venues &mdash; rooftop, cocktail bar, and club in the mix",
        "Host opens with light introductions: what you do, where you're from, how long you're in Bangkok",
        "Welcome shots on arrival",
        "Private party van with music between venues",
        "VIP entry at all stops",
        "Capped at 12 &mdash; the right size for conversations that actually go somewhere"
    ],
    'series_specific_title': 'THE CROWD',
    'series_specific_lines': [
        "\"Remote workers, freelancers, founders\"",
        "\"People between 25&ndash;40 who've lived in a lot of cities and know how to meet people\"",
        "\"Nomads who want Bangkok on their own terms\""
    ],
    'series_specific_secondary_title': 'WHAT PEOPLE TALK ABOUT',
    'series_specific_secondary_lines': [
        "\"Where they've been before Bangkok\"",
        "\"What they're working on\"",
        "\"Where they're going next\""
    ],
    'logistics_date': 'Every Wednesday (Week 2 & 4) &middot; 9:30 PM &ndash; Late',
    'logistics_location': 'Sukhumvit 11 / Asoke area<br><span style="font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.70);">Meeting point confirmed on booking</span>',
    'logistics_price': '฿1,000 per person',
    'logistics_spots': 'Limited to 12 guests per night',
    'good_to_know': [
        "Smart casual minimum &mdash; elevated welcome",
        "Minimum age 20 years",
        "Leave the laptop at the hotel",
        "Event confirmed or cancelled at 7 PM"
    ],
    'price_raw': '1,000'
}

# PAGE 05 — 30+ SOCIAL NIGHT
social_data = {
    'series_tag': 'GROWN-UP EDITION · THURSDAY NIGHTS',
    'headline': '30+ Social Night',
    'positioning_line': 'Bangkok nightlife. Your version of it.',
    'description': "The standard Bangkok club night was designed<br>for 23-year-olds on a gap year. This wasn't.<br>Thursday nights are for adults who want<br>real music, real conversation, and a crowd<br>where the energy is right &mdash;<br>without the chaos that comes with<br>everyone else's version of a big night out.",
    'the_night': [
        "4 venues &mdash; weighted toward cocktail bars, rooftops, and clubs with actual music taste",
        "Pacing that builds properly &mdash; never rushed, never stalled",
        "Welcome shots on arrival",
        "Private party van with music between venues",
        "VIP entry at all stops",
        "Crowd naturally skews 28&ndash;45 &mdash; not enforced, just the reality of who books this night",
        "Capped at 12 &mdash; the right size for real conversations across the group"
    ],
    'series_specific_title': 'THE DIFFERENCE',
    'series_specific_lines': [
        "\"Venues chosen for atmosphere, not just access\"",
        "\"Music with actual range &mdash; not just what the 22-year-olds want\"",
        "\"A host who reads the room, not one who performs for it\"",
        "\"Conversations that actually go somewhere\""
    ],
    'logistics_date': 'Every Thursday (Week 2 & 4) &middot; 9:30 PM &ndash; Late',
    'logistics_location': 'Sukhumvit 11 / Asoke area<br><span style="font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.70);">Meeting point confirmed on booking</span>',
    'logistics_price': '฿1,000 per person',
    'logistics_spots': 'Limited to 12 guests per night',
    'good_to_know': [
        "Smart casual minimum &mdash; this crowd typically dresses well",
        "Minimum age 20 years (crowd naturally skews 28&ndash;45)",
        "No enforced age ceiling &mdash; 30+ is the spirit, not the rule",
        "Works well for corporate groups wanting a weeknight out",
        "Event confirmed or cancelled at 7 PM"
    ],
    'price_raw': '1,000'
}

# PAGE 08 — LGBT+ NIGHT BANGKOK
lgbt_data = {
    'series_tag': 'INCLUSIVE · SUNDAY NIGHTS',
    'headline': 'LGBT+ Night Bangkok',
    'positioning_line': "Bangkok's most welcoming night out.",
    'description': "Bangkok is one of Asia's most genuinely<br>welcoming cities for the LGBT+ community &mdash;<br>and Sunday nights lean into that.<br>This is a curated nightlife experience<br>designed for a crowd that wants great venues,<br>real energy, and a room where everyone<br>belongs exactly as they are.",
    'the_night': [
        "4 venues &mdash; selected for inclusivity, atmosphere, and quality",
        "Host creates an actively welcoming environment from the first stop",
        "Welcome shots on arrival",
        "Private party van with music between venues",
        "VIP entry at all stops",
        "Capped at 12 &mdash; intimate and genuine, never a mass event"
    ],
    'series_specific_title': 'THE SPIRIT OF THIS NIGHT',
    'series_specific_italic_full': "This is not a specifically gay bar crawl.<br>It is a Bangkok nightlife experience that<br>actively creates space for everyone &mdash;<br>and where that welcome is genuine,<br>not performed.",
    'series_specific_note_below': "All genders and orientations welcome.<br>The crowd reflects the spirit of the night.",
    'logistics_date': 'Every Sunday &middot; 9:30 PM &ndash; Late',
    'logistics_location': 'Sukhumvit 11 / Asoke area<br><span style="font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.70);">Meeting point confirmed on booking</span>',
    'logistics_price': '฿1,200 per person',
    'logistics_spots': 'Limited to 12 guests per night',
    'good_to_know': [
        "Smart casual dress code",
        "Minimum age 20 years",
        "All genders and orientations welcome",
        "Sunday is one of Bangkok's strongest LGBT+ nights &mdash; the energy reflects that",
        "Event confirmed or cancelled at 7 PM"
    ],
    'price_raw': '1,200'
}

def generate_and_save(folder, data):
    import os
    os.makedirs(f'/Users/guide/Desktop/NightlifeAntigravity/{folder}', exist_ok=True)
    with open(f'/Users/guide/Desktop/NightlifeAntigravity/{folder}/index.html', 'w') as f:
        f.write(generate_page(data))
    print(f"Created {folder}/index.html")

generate_and_save('solo-night', solo_data)
generate_and_save('tgif', tgif_data)
generate_and_save('girls-night', girls_data)
generate_and_save('new-in-bangkok', newinbkk_data)
generate_and_save('nomad-nights', nomads_data)
generate_and_save('social-night', social_data)
generate_and_save('lgbtplus-night', lgbt_data)

