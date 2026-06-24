import re

#######################
# REVERT HTML         #
#######################
html_path = '/Users/guide/Desktop/NightlifeAntigravity/index.html'

with open(html_path, 'r') as f:
    html = f.read()

cards_data = [
    {
        'href': '/solo-night',
        'img': 'assets/images/1. Meet/tempImagev201zt.remini-enhanced.jpg',
        'tag': 'Tuesday',
        'title': 'Solo Traveler\'s Night',
        'price': 'From ฿1,000'
    },
    {
        'href': '/new-in-bangkok',
        'img': 'assets/images/2. Social Build/image.remini-enhanced (9).jpg',
        'tag': 'Wednesday',
        'title': 'New in Bangkok Night',
        'price': 'From ฿1,000'
    },
    {
        'href': '/nomad-nights',
        'img': 'assets/images/1. Meet/tempImageVg9T4j.remini-enhanced.jpg',
        'tag': 'Wednesday',
        'title': 'Digital Nomad Crawl',
        'price': 'From ฿1,000'
    },
    {
        'href': '/girls-night',
        'img': 'assets/images/2. Social Build/tempImagege7ud6.remini-enhanced.jpg',
        'tag': 'Thursday',
        'title': 'Girls Night Bangkok',
        'price': 'From ฿1,000'
    },
    {
        'href': '/social-night',
        'img': 'assets/images/1. Meet/tempImagetMAqsL.remini-enhanced.jpg',
        'tag': 'Thursday',
        'title': '30+ Social Night',
        'price': 'From ฿1,000'
    },
    {
        'href': '/tgif',
        'img': 'assets/images/2. Social Build/Rhodes group pic.JPG',
        'tag': 'Friday',
        'title': 'TGIF Bangkok',
        'price': 'From ฿1,200'
    },
    {
        'href': '/saturday-signature',
        'img': 'assets/images/2. Social Build/tempImageP4GGJA.remini-enhanced.jpg',
        'tag': 'Saturday',
        'title': 'Signature Night',
        'price': 'From ฿1,500'
    },
    {
        'href': '/lgbtplus-night',
        'img': 'assets/images/4. Peak/PHOTO-2024-08-09-18-53-29(2).remini-enhanced.jpg',
        'tag': 'Sunday',
        'title': 'LGBT+ Night Bangkok',
        'price': 'From ฿1,200'
    }
]

cards_html = ""
for card in cards_data:
    cards_html += f"""
                    <a href="{card['href']}" class="night-card" style="background-image: url('{card['img']}'); background-size: cover; background-position: center; text-decoration: none;">
                        <div style="position: absolute; top: 16px; left: 16px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 9px; color: #EA003A; text-transform: uppercase; z-index: 3;">{card['tag']}</div>
                        <div class="night-card-overlay"></div>
                        <div class="night-card-content">
                            <div class="night-card-title">{card['title']}</div>
                            <div class="night-card-subtitle">{card['price']}</div>
                            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; color: #EA003A; margin-top: 12px;">View This Night &rarr;</div>
                        </div>
                    </a>"""

start_marker = '<div class="night-cards-container">'
end_marker = '<!-- Section 1.3: Who This Is For -->'

parts = html.split(start_marker)
prefix = parts[0]
remaining = start_marker.join(parts[1:])
end_parts = remaining.split(end_marker)
suffix = end_parts[-1]

new_html = prefix + start_marker + '\n' + cards_html + '\n                </div>\n            </div>\n        </section>\n\n        ' + end_marker + suffix

with open(html_path, 'w') as f:
    f.write(new_html)

#######################
# REVERT CSS          #
#######################
css_path = '/Users/guide/Desktop/NightlifeAntigravity/css/index.css'
with open(css_path, 'r') as f:
    css = f.read()

reverted_css = """
.night-card {
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
    aspect-ratio: 2 / 3;
    background-size: cover;
    background-position: center;
    cursor: pointer;
    transition: var(--transition-base);
    box-shadow: var(--shadow-card);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    border: 1px solid var(--color-border);
    flex: 0 0 85%;
    scroll-snap-align: center;
}

@media (min-width: 768px) {
    .night-card {
        aspect-ratio: unset;
        min-height: 380px;
        flex: 0 0 300px;
        scroll-snap-align: start;
    }
}

.night-card:hover {
    transform: translateY(-8px);
    border-color: var(--color-primary);
    box-shadow: var(--shadow-elevated), 0 0 20px rgba(234, 0, 58, 0.35);
}

.night-card-overlay {
    position: absolute;
    inset: -2px;
    background: linear-gradient(to bottom, transparent 0%, transparent 20%, rgba(10,0,10,0.55) 55%, rgba(10,0,10,0.96) 100%);
    z-index: 1;
    transition: var(--transition-base);
    border-radius: inherit;
    pointer-events: none;
}

.night-card:hover .night-card-overlay {
    background: linear-gradient(to bottom, transparent 0%, transparent 20%, rgba(10,0,10,0.65) 55%, rgba(10,0,10,0.99) 100%);
}

.night-card-content {
    position: relative;
    z-index: 2;
    padding: var(--space-xl);
    text-align: left;
}

.night-card-title {
"""

pattern = r'\.night-card\s*\{.*?(?=\.night-card-title\s*\{)'
new_css_content = re.sub(pattern, reverted_css, css, flags=re.DOTALL)

with open(css_path, 'w') as f:
    f.write(new_css_content)

print("Reverted night-cards successfully.")

