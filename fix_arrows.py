import re

html_path = '/Users/guide/Desktop/NightlifeAntigravity/index.html'
js_path = '/Users/guide/Desktop/NightlifeAntigravity/js/app.js'

with open(html_path, 'r') as f:
    html = f.read()

# Replace the specific section header
old_header = r"""                <div class="section-header" style="text-align: left; margin-bottom: 32px;">
                    <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 10px; letter-spacing: 0.2em; color: #EA003A; margin-bottom: 12px;">SELECT YOUR NIGHT</div>
                    <h2 style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 28px; color: #FFFFFF;">Choose Your Vibe\.</h2>
                    <p style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: rgba\(255,255,255,0\.55\); margin-top: 8px;">Each night is designed for a different crowd\. Pick yours\.</p>
                </div>"""

new_header = """                <div class="section-header" style="text-align: left; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 10px; letter-spacing: 0.2em; color: #EA003A; margin-bottom: 12px;">SELECT YOUR NIGHT</div>
                        <h2 style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 28px; color: #FFFFFF; margin-bottom: 0;">Choose Your Vibe.</h2>
                        <p style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.55); margin-top: 8px; margin-bottom: 0;">Each night is designed for a different crowd. Pick yours.</p>
                    </div>
                    <div class="desktop-arrows desktop-only" style="display: flex; gap: 12px; display: none;">
                        <button id="scroll-left" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; font-size: 18px;" onmouseover="this.style.background='#EA003A'; this.style.borderColor='#EA003A'" onmouseout="this.style.background='transparent'; this.style.borderColor='rgba(255,255,255,0.2)'">&#8592;</button>
                        <button id="scroll-right" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; font-size: 18px;" onmouseover="this.style.background='#EA003A'; this.style.borderColor='#EA003A'" onmouseout="this.style.background='transparent'; this.style.borderColor='rgba(255,255,255,0.2)'">&#8594;</button>
                    </div>
                </div>"""

# Wait, `display: none;` on `.desktop-arrows desktop-only`?
# In css/index.css, .desktop-only is usually `display: none; @media (min-width: 768px) { .desktop-only { display: block; } }`
# But since I used `display: flex; display: none;` inline, it will always be hidden!
# Better to use a CSS class or just remove `display: none` and rely on `.desktop-only`.
new_header = """                <div class="section-header" style="text-align: left; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 10px; letter-spacing: 0.2em; color: #EA003A; margin-bottom: 12px;">SELECT YOUR NIGHT</div>
                        <h2 style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 28px; color: #FFFFFF; margin-bottom: 0;">Choose Your Vibe.</h2>
                        <p style="font-family: 'Inter', sans-serif; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.55); margin-top: 8px; margin-bottom: 0;">Each night is designed for a different crowd. Pick yours.</p>
                    </div>
                    <div class="desktop-arrows desktop-only" style="gap: 12px;">
                        <button id="scroll-left" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; font-size: 18px;" onmouseover="this.style.background='#EA003A'; this.style.borderColor='#EA003A'" onmouseout="this.style.background='transparent'; this.style.borderColor='rgba(255,255,255,0.2)'">&#8592;</button>
                        <button id="scroll-right" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; font-size: 18px;" onmouseover="this.style.background='#EA003A'; this.style.borderColor='#EA003A'" onmouseout="this.style.background='transparent'; this.style.borderColor='rgba(255,255,255,0.2)'">&#8594;</button>
                    </div>
                </div>"""

html = re.sub(old_header, new_header, html)
with open(html_path, 'w') as f:
    f.write(html)

with open(js_path, 'r') as f:
    js = f.read()

js_scroll = """
    const scrollLeftBtn = document.getElementById('scroll-left');
    const scrollRightBtn = document.getElementById('scroll-right');
    const cardsContainer = document.querySelector('.night-cards-container');
    
    if (scrollLeftBtn && scrollRightBtn && cardsContainer) {
        scrollLeftBtn.addEventListener('click', () => {
            cardsContainer.scrollBy({ left: -340, behavior: 'smooth' });
        });
        scrollRightBtn.addEventListener('click', () => {
            cardsContainer.scrollBy({ left: 340, behavior: 'smooth' });
        });
    }
"""

js = js.replace('function initEventListeners() {', 'function initEventListeners() {' + js_scroll)

with open(js_path, 'w') as f:
    f.write(js)

