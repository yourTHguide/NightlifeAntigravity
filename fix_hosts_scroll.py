import re

css_path = '/Users/guide/Desktop/NightlifeAntigravity/css/index.css'
with open(css_path, 'r') as f:
    css = f.read()

# Replace .hosts-grid block
new_hosts_grid = """
.hosts-grid {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 16px;
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding-bottom: 8px;
    padding-left: 24px;
    padding-right: 24px;
    width: 100%;
}

.hosts-grid::-webkit-scrollbar {
    display: none;
}
"""

css = re.sub(r'\.hosts-grid\s*\{.*?(?=\.host-card\s*\{)', new_hosts_grid + '\n', css, flags=re.DOTALL)

# Replace .host-card block
new_host_card = """
.host-card {
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: linear-gradient(145deg, rgba(65, 0, 42, 0.4), rgba(47, 0, 47, 0.2));
    border: 1px solid rgba(234, 0, 58, 0.15);
    box-shadow: var(--shadow-card);
    transition: var(--transition-base);
    cursor: pointer;
    text-decoration: none;
    flex: 0 0 220px;
    min-width: 220px;
    width: 220px;
}
"""

# Wait, the previous `.host-card` block looks like this:
"""
.host-card {
    background: linear-gradient(145deg, rgba(65, 0, 42, 0.4), rgba(47, 0, 47, 0.2));
    border: 1px solid rgba(234, 0, 58, 0.15);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: var(--transition-base);
    flex-shrink: 0;
    width: 220px;
    min-width: 220px;
}
"""

css = re.sub(r'\.host-card\s*\{.*?(?=\.host-card:hover\s*\{)', new_host_card + '\n', css, flags=re.DOTALL)

with open(css_path, 'w') as f:
    f.write(css)

print("Updated hosts-grid and host-card css")
