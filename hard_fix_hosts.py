import re

css_path = '/Users/guide/Desktop/NightlifeAntigravity/css/index.css'
with open(css_path, 'r') as f:
    css = f.read()

# First, remove the old .hosts-grid completely just in case
css = re.sub(r'\.hosts-grid\s*\{.*?\}\s*', '', css, flags=re.DOTALL)
css = re.sub(r'@media\s*\(\s*min-width:\s*768px\s*\)\s*\{\s*\.hosts-grid\s*\{.*?\}\s*\}\s*', '', css, flags=re.DOTALL)
css = re.sub(r'\.hosts-grid::-webkit-scrollbar\s*\{.*?\}\s*', '', css, flags=re.DOTALL)

# Let's remove any explicit width: 100% or grid properties from .host-card
css = re.sub(r'(width:\s*100%;)', '', css)
css = re.sub(r'(display:\s*grid;)', '', css)

hard_fix_css = """
/* Hard Fix for Hosts Horizontal Scroll */
#hosts-accordion.hosts-grid {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    gap: 16px !important;
    overflow-x: scroll !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
    padding: 0 24px 8px !important;
    width: 100% !important;
    box-sizing: border-box !important;
}

#hosts-accordion.hosts-grid::-webkit-scrollbar {
    display: none !important;
}

#hosts-accordion.hosts-grid .host-card {
    flex: 0 0 220px !important;
    min-width: 220px !important;
    width: 220px !important;
    display: block !important;
}
"""

css += '\n' + hard_fix_css

with open(css_path, 'w') as f:
    f.write(css)

print("Applied hard fix CSS.")
