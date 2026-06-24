import re

html_path = '/Users/guide/Desktop/NightlifeAntigravity/index.html'

with open(html_path, 'r') as f:
    html = f.read()

# We will rewrite the cards using the new structure
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
                    <a href="{card['href']}" class="night-card" style="text-decoration: none;">
                        <img src="{card['img']}" class="night-card-bg" alt="{card['title']}">
                        <div class="night-card-overlay"></div>
                        <div class="night-card-content">
                            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 9px; color: #EA003A; text-transform: uppercase;">{card['tag']}</div>
                            <div>
                                <div class="night-card-title">{card['title']}</div>
                                <div class="night-card-subtitle">{card['price']}</div>
                                <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; color: #EA003A; margin-top: 12px; position: relative; z-index: 2;">View This Night &rarr;</div>
                            </div>
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
print("Updated index.html structure for the cards.")

