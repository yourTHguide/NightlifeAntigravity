import re

html_path = '/Users/guide/Desktop/NightlifeAntigravity/index.html'

with open(html_path, 'r') as f:
    html = f.read()

# Replace the inner contents of <div class="night-cards-container">
cards_html = """
                    <!-- Tuesday -->
                    <a href="/solo-night" class="night-card" style="background-image: url('assets/images/1. Meet/tempImagev201zt.remini-enhanced.jpg'); background-size: cover; background-position: center; text-decoration: none;">
                        <div style="position: absolute; top: 16px; left: 16px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 9px; color: #EA003A; text-transform: uppercase; z-index: 3;">Tuesday</div>
                        <div class="night-card-overlay"></div>
                        <div class="night-card-content">
                            <div class="night-card-title">Solo Traveler's Night</div>
                            <div class="night-card-subtitle">From ฿1,000</div>
                            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; color: #EA003A; margin-top: 12px;">View This Night &rarr;</div>
                        </div>
                    </a>
                    <!-- Wednesday 1 -->
                    <a href="/new-in-bangkok" class="night-card" style="background-image: url('assets/images/2. Social Build/image.remini-enhanced (9).jpg'); background-size: cover; background-position: center; text-decoration: none;">
                        <div style="position: absolute; top: 16px; left: 16px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 9px; color: #EA003A; text-transform: uppercase; z-index: 3;">Wednesday</div>
                        <div class="night-card-overlay"></div>
                        <div class="night-card-content">
                            <div class="night-card-title">New in Bangkok Night</div>
                            <div class="night-card-subtitle">From ฿1,000</div>
                            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; color: #EA003A; margin-top: 12px;">View This Night &rarr;</div>
                        </div>
                    </a>
                    <!-- Wednesday 2 -->
                    <a href="/nomad-nights" class="night-card" style="background-image: url('assets/images/1. Meet/tempImageVg9T4j.remini-enhanced.jpg'); background-size: cover; background-position: center; text-decoration: none;">
                        <div style="position: absolute; top: 16px; left: 16px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 9px; color: #EA003A; text-transform: uppercase; z-index: 3;">Wednesday</div>
                        <div class="night-card-overlay"></div>
                        <div class="night-card-content">
                            <div class="night-card-title">Digital Nomad Crawl</div>
                            <div class="night-card-subtitle">From ฿1,000</div>
                            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; color: #EA003A; margin-top: 12px;">View This Night &rarr;</div>
                        </div>
                    </a>
                    <!-- Thursday 1 -->
                    <a href="/girls-night" class="night-card" style="background-image: url('assets/images/2. Social Build/tempImagege7ud6.remini-enhanced.jpg'); background-size: cover; background-position: center; text-decoration: none;">
                        <div style="position: absolute; top: 16px; left: 16px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 9px; color: #EA003A; text-transform: uppercase; z-index: 3;">Thursday</div>
                        <div class="night-card-overlay"></div>
                        <div class="night-card-content">
                            <div class="night-card-title">Girls Night Bangkok</div>
                            <div class="night-card-subtitle">From ฿1,000</div>
                            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; color: #EA003A; margin-top: 12px;">View This Night &rarr;</div>
                        </div>
                    </a>
                    <!-- Thursday 2 -->
                    <a href="/social-night" class="night-card" style="background-image: url('assets/images/1. Meet/tempImagetMAqsL.remini-enhanced.jpg'); background-size: cover; background-position: center; text-decoration: none;">
                        <div style="position: absolute; top: 16px; left: 16px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 9px; color: #EA003A; text-transform: uppercase; z-index: 3;">Thursday</div>
                        <div class="night-card-overlay"></div>
                        <div class="night-card-content">
                            <div class="night-card-title">30+ Social Night</div>
                            <div class="night-card-subtitle">From ฿1,000</div>
                            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; color: #EA003A; margin-top: 12px;">View This Night &rarr;</div>
                        </div>
                    </a>
                    <!-- Friday -->
                    <a href="/tgif" class="night-card" style="background-image: url('assets/images/2. Social Build/Rhodes group pic.JPG'); background-size: cover; background-position: center; text-decoration: none;">
                        <div style="position: absolute; top: 16px; left: 16px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 9px; color: #EA003A; text-transform: uppercase; z-index: 3;">Friday</div>
                        <div class="night-card-overlay"></div>
                        <div class="night-card-content">
                            <div class="night-card-title">TGIF Bangkok</div>
                            <div class="night-card-subtitle">From ฿1,200</div>
                            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; color: #EA003A; margin-top: 12px;">View This Night &rarr;</div>
                        </div>
                    </a>
                    <!-- Saturday -->
                    <a href="/saturday-signature" class="night-card" style="background-image: url('assets/images/2. Social Build/tempImageP4GGJA.remini-enhanced.jpg'); background-size: cover; background-position: center; text-decoration: none;">
                        <div style="position: absolute; top: 16px; left: 16px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 9px; color: #EA003A; text-transform: uppercase; z-index: 3;">Saturday</div>
                        <div class="night-card-overlay"></div>
                        <div class="night-card-content">
                            <div class="night-card-title">Signature Night</div>
                            <div class="night-card-subtitle">From ฿1,500</div>
                            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; color: #EA003A; margin-top: 12px;">View This Night &rarr;</div>
                        </div>
                    </a>
                    <!-- Sunday -->
                    <a href="/lgbtplus-night" class="night-card" style="background-image: url('assets/images/4. Peak/PHOTO-2024-08-09-18-53-29(2).remini-enhanced.jpg'); background-size: cover; background-position: center; text-decoration: none;">
                        <div style="position: absolute; top: 16px; left: 16px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 9px; color: #EA003A; text-transform: uppercase; z-index: 3;">Sunday</div>
                        <div class="night-card-overlay"></div>
                        <div class="night-card-content">
                            <div class="night-card-title">LGBT+ Night Bangkok</div>
                            <div class="night-card-subtitle">From ฿1,200</div>
                            <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; color: #EA003A; margin-top: 12px;">View This Night &rarr;</div>
                        </div>
                    </a>
"""

# We use the same precise split as before
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
print("Updated index.html cards with new images and title.")

