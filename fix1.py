import re

content = open('/Users/guide/Desktop/NightlifeAntigravity/index.html').read()

def replace_card(m):
    day = m.group(1)
    img = m.group(2)
    title = m.group(3)
    subtitle = m.group(4)
    
    tag = day.capitalize()
    if day == 'solo': tag = 'Solo'
    elif day == 'nomad': tag = 'Nomad'
    elif day == 'women': tag = 'Women'
    elif day == 'vip': tag = 'VIP'
    elif day == 'private': tag = 'Private'

    return f"""<div class="night-card" data-night="{day}" style="background-image: url('{img}'); background-size: cover; background-position: center;">
                        <div style="position: absolute; top: 16px; left: 16px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 9px; color: #EA003A; text-transform: uppercase; z-index: 3;">{tag}</div>
                        <div class="night-card-overlay"></div>
                        <div class="night-card-content">
                            <div class="night-card-title">{title}</div>
                            <div class="night-card-subtitle">{subtitle}</div>
                            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; color: #EA003A; margin-top: 12px;">View This Night &rarr;</div>
                        </div>
                    </div>"""

pattern = r'<div class="night-card" data-night="([^"]+)" style="background-image: url\(\'([^\']+)\'\); background-size: cover; background-position: center;">\s*<div class="night-card-overlay"></div>\s*<div class="night-card-content">\s*<div class="night-card-title">([^<]+)</div>\s*<div class="night-card-subtitle">([^<]+)</div>\s*</div>\s*</div>'

new_content = re.sub(pattern, replace_card, content)

with open('/Users/guide/Desktop/NightlifeAntigravity/index.html', 'w') as f:
    f.write(new_content)
