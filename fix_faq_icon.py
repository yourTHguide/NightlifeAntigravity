import re

css_path = '/Users/guide/Desktop/NightlifeAntigravity/css/index.css'
with open(css_path, 'r') as f:
    css = f.read()

# I want to add transition and transform to the faq icon
icon_css = """
.faq-icon svg {
    transition: transform 0.3s ease;
}
.faq-card.active .faq-icon svg {
    transform: rotate(45deg);
}
"""

if '.faq-icon svg {' not in css:
    css += '\n' + icon_css
    with open(css_path, 'w') as f:
        f.write(css)

