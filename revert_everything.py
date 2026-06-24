import re
import os

html_path = '/Users/guide/Desktop/NightlifeAntigravity/index.html'

# 1. Save final-cta if it exists
with open(html_path, 'r') as f:
    html = f.read()

final_cta = re.search(r'\s*<!-- Section: Final CTA -->.*?</section>', html, re.DOTALL)
if final_cta:
    final_cta_str = final_cta.group(0)
else:
    final_cta_str = ""

# 2. git checkout everything
os.system('git checkout index.html css/index.css js/data.js js/app.js')

# 3. Apply update_main_cards.py to restore the 8 subpages
os.system('python3 update_main_cards.py')

# 4. Re-append final-cta to index.html if we had it
if final_cta_str:
    with open(html_path, 'r') as f:
        html = f.read()
    # Insert final-cta before </main>
    html = html.replace('</main>', final_cta_str + '\n    </main>')
    with open(html_path, 'w') as f:
        f.write(html)

# 5. Re-apply the Guide host card to js/data.js and js/app.js WITHOUT the \n syntax error
data_file = '/Users/guide/Desktop/NightlifeAntigravity/js/data.js'
with open(data_file, 'r') as f:
    data_content = f.read()

new_hosts = """    hosts: [
        {
            id: 'host-guide',
            name: 'Guide',
            image: 'assets/images/Hosts/guide host.JPG',
            role: 'FOUNDER & HOST',
            quote: '"Bangkok born. Every venue earned."'
        },
        {
            id: 'host-boom',
            name: 'Boom',
            image: 'assets/images/Hosts/boom host.jpg',
            role: 'SOCIAL CONNECTOR',
            quote: '"Nobody stays a stranger for long."'
        },
        {
            id: 'host-ice',
            name: 'Ice',
            image: 'assets/images/Hosts/Ice host.JPG',
            role: 'ENERGY HOST',
            quote: '"The room feels it before the music starts."'
        },
        {
            id: 'host-jj',
            name: 'JJ',
            image: 'assets/images/Hosts/JJ host.jpg',
            role: 'FLOW MANAGER',
            quote: '"Smooth transitions. The night never drops."'
        }
    ],"""

data_content = re.sub(r'hosts:\s*\[.*?],\n', new_hosts + '\n', data_content, flags=re.DOTALL)
with open(data_file, 'w') as f:
    f.write(data_content)

app_file = '/Users/guide/Desktop/NightlifeAntigravity/js/app.js'
with open(app_file, 'r') as f:
    app_content = f.read()

new_template = """    accordion.innerHTML = BCC_DATA.hosts.map((host, index) => `
        <div class="host-card" data-index="${index}">
            <div class="host-card-image">
                <img src="${host.image}" alt="${host.name}" style="object-fit: cover; object-position: center top; width: 100%; height: 100%;">
                <div class="host-card-overlay"></div>
            </div>
            <div class="host-card-content" style="padding: 20px;">
                <div style="display: flex; align-items: center;">
                    <span style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 18px; color: #FFFFFF;">${host.name}</span>
                    <span style="margin-left: 6px; display: inline-flex; align-items: center;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L15 4.5L18.5 4L20 7.5L23 9.5L21.5 13L23 16.5L20 18.5L18.5 22L15 21.5L12 24L9 21.5L5.5 22L4 18.5L1 16.5L2.5 13L1 9.5L4 7.5L5.5 4L9 4.5L12 2Z" fill="#EA003A"/>
                            <path d="M10 16L6 12L7.4 10.6L10 13.2L16.6 6.6L18 8L10 16Z" fill="#111111"/>
                        </svg>
                    </span>
                </div>
                <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #EA003A; margin-top: 4px;">
                    ${host.role}
                </div>
                <div style="font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 400; font-size: 14px; color: rgba(255,255,255,0.60); margin-top: 10px; white-space: pre-wrap;">${host.quote}</div>
            </div>
        </div>
    `).join('');
}"""

app_content = re.sub(r'accordion\.innerHTML = BCC_DATA\.hosts\.map.*?\}\n', new_template + '\n', app_content, flags=re.DOTALL)
with open(app_file, 'w') as f:
    f.write(app_content)

print("Reverted to requested state successfully.")
