import re

#########################
# 1. FIX SECTION ORDER  #
#########################
html_path = '/Users/guide/Desktop/NightlifeAntigravity/index.html'
with open(html_path, 'r') as f:
    html = f.read()

# I will use a simple substring extraction since the order is known.
sections = {
    'hero': re.search(r'\s*<!-- Section 1: Hero -->.*?</section>', html, re.DOTALL).group(0),
    'flow': re.search(r'\s*<!-- Section 2: How Your Night Flows -->.*?</section>', html, re.DOTALL).group(0),
    'select': re.search(r'\s*<!-- Section 1\.2: Select Your Night -->.*?</section>', html, re.DOTALL).group(0),
    'audience': re.search(r'\s*<!-- Section 1\.3: Who This Is For -->.*?</section>', html, re.DOTALL).group(0),
    'features': re.search(r'\s*<!-- Section 3: What\'s Included -->.*?</section>', html, re.DOTALL).group(0),
    'hosts': re.search(r'\s*<!-- Section 1\.8: Your Night Conductors -->.*?</section>', html, re.DOTALL).group(0),
    'social': re.search(r'\s*<!-- Section 1\.4: Social Proof -->.*?</section>', html, re.DOTALL).group(0),
    'faq': re.search(r'\s*<!-- Section 5: FAQ -->.*?</section>', html, re.DOTALL).group(0),
    'cta': re.search(r'\s*<!-- Section: Final CTA -->.*?</section>', html, re.DOTALL).group(0),
}

# Fix FAQ background and text in HTML
sections['faq'] = sections['faq'].replace('background: #2F002F;', 'background: #1A0015;')
sections['faq'] = sections['faq'].replace('THE DETAILS', 'QUESTIONS')
sections['faq'] = sections['faq'].replace('Need to know.', 'Common questions.')
sections['faq'] = sections['faq'].replace('max-width: 800px;', 'max-width: 720px;')

ordered_sections = [
    sections['hero'],
    sections['flow'],
    sections['select'],
    sections['audience'],
    sections['features'],
    sections['hosts'],
    sections['social'],
    sections['faq'],
    sections['cta']
]

# Find where main starts and ends
main_start = html.find('<main>') + len('<main>')
main_end = html.find('</main>')

new_main_content = '\n'.join(ordered_sections) + '\n    '
new_html = html[:main_start] + new_main_content + html[main_end:]

with open(html_path, 'w') as f:
    f.write(new_html)
print("Fix 1: Section order restored.")

#########################
# 2. FIX HOSTS LAYOUT   #
#########################
css_path = '/Users/guide/Desktop/NightlifeAntigravity/css/index.css'
with open(css_path, 'r') as f:
    css = f.read()

hosts_css = """
.hosts-grid {
    display: flex;
    flex-direction: row;
    gap: 16px;
    overflow-x: auto;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 8px;
}

@media (min-width: 768px) {
    .hosts-grid {
        justify-content: center;
        overflow-x: visible;
    }
}

.host-card {
    flex-shrink: 0;
    width: 220px;
    min-width: 220px;
"""

# Replace the existing .hosts-grid and .host-card setup
css = re.sub(r'\.hosts-grid\s*\{.*?(?=\.host-card\s*\{)', '.hosts-grid {\n    display: flex;\n    flex-direction: row;\n    gap: 16px;\n    overflow-x: auto;\n    scroll-behavior: smooth;\n    -webkit-overflow-scrolling: touch;\n    scrollbar-width: none;\n    padding-bottom: 8px;\n}\n\n@media (min-width: 768px) {\n    .hosts-grid {\n        justify-content: center;\n        overflow-x: visible;\n    }\n}\n\n', css, flags=re.DOTALL)

# For .host-card, we will just add the flex properties
css = re.sub(r'(\.host-card\s*\{[^}]*?)(?=\})', r'\1    flex-shrink: 0;\n    width: 220px;\n    min-width: 220px;\n', css)

print("Fix 2: Hosts CSS updated.")

#########################
# 3. FIX FAQ CSS & DATA #
#########################

# Ensure faq styles exist in index.css
faq_css = """
.faq-card {
    width: 100%;
    padding: 20px 0;
    border-bottom: 1px solid rgba(255,255,255,0.10);
    cursor: pointer;
}
.faq-question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 15px;
    color: #FFFFFF;
}
.faq-icon {
    font-size: 20px;
    color: #EA003A;
}
.faq-answer {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
    font-family: 'Inter', sans-serif;
    font-weight: 400;
    font-size: 14px;
    color: rgba(255,255,255,0.65);
    line-height: 1.7;
}
.faq-card.active .faq-answer {
    max-height: 500px;
    padding: 16px 0 20px;
}
"""
if '.faq-card {' not in css:
    css += '\n' + faq_css

with open(css_path, 'w') as f:
    f.write(css)

data_path = '/Users/guide/Desktop/NightlifeAntigravity/js/data.js'
with open(data_path, 'r') as f:
    data_content = f.read()

new_faqs = """    faqs: [
        {
            question: "Do I need to come with a group?",
            answer: "Not at all. Most guests join solo or in pairs. The host makes sure everyone connects from the first stop."
        },
        {
            question: "What's the minimum age?",
            answer: "20 years old minimum. Smart casual dress code — no flip flops or singlets at premium venues."
        },
        {
            question: "How do I book?",
            answer: "Select your night above, choose a date, and complete checkout via Stripe. Confirmation arrives instantly by email."
        },
        {
            question: "What if it's cancelled?",
            answer: "We confirm or cancel by 7 PM on the event day. Full refund processed automatically if we cancel."
        },
        {
            question: "Can I book a private group?",
            answer: "Yes — for groups of 8 or more, contact us directly for a private crawl quote."
        }
    ],"""

data_content = re.sub(r'\s*faqs:\s*\[.*?],\n', '\n' + new_faqs + '\n', data_content, flags=re.DOTALL)
with open(data_path, 'w') as f:
    f.write(data_content)

print("Fix 3: FAQ data and CSS updated.")
