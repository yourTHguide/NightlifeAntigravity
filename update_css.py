import re

with open('css/index.css', 'r') as f:
    css = f.read()

# Replace :root
new_root = """:root {
  /* Colors */
  --color-bg-primary: #2F002F;
  --color-bg-secondary: #1A0015;
  --color-accent-crimson: #EA003A;
  --color-accent-fuchsia: #820065;
  --color-accent-plum: #600061;
  --color-accent-mardi: #41002A;
  --color-white: #FFFFFF;
  --color-text-secondary: rgba(255,255,255,0.60);
  --color-text-muted: rgba(255,255,255,0.35);
  --color-card-bg: rgba(255,255,255,0.04);
  --color-card-border: 1px solid rgba(255,255,255,0.08);

  /* Fonts */
  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'Inter', sans-serif;

  /* Spacing */
  --space-xs: 8px;
  --space-sm: 16px;
  --space-md: 24px;
  --space-lg: 40px;
  --space-xl: 60px;
  --space-2xl: 80px;

  /* Border radius */
  --radius-card: 12px;
  --radius-button: 6px;

  /* Transitions */
  --transition-base: 0.2s ease;
  --transition-smooth: 0.3s ease;
}"""
css = re.sub(r':root\s*\{[^}]*\}', new_root, css)

# Replace Reset & Base
base_pattern = r'/\* === RESET & BASE === \*/.*?body\s*\{.*?\}'
new_base = """/* === RESET & BASE === */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-bg-primary);
  color: var(--color-white);
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* No white backgrounds anywhere */
section {
  background-color: var(--color-bg-primary);
}

section:nth-child(even) {
  background-color: var(--color-bg-secondary);
}

/* Section padding */
.section-padding {
  padding: var(--space-2xl) var(--space-md);
}

@media (max-width: 768px) {
  .section-padding {
    padding: var(--space-xl) var(--space-md);
  }
}"""
css = re.sub(base_pattern, new_base, css, flags=re.DOTALL)

# Add Typography Base to the end
typography = """
/* === TYPOGRAPHY BASE === */
.font-display {
  font-family: var(--font-display);
  font-style: italic;
}

.eyebrow {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-accent-crimson);
  display: block;
  margin-bottom: 12px;
}

.section-headline {
  font-family: var(--font-body);
  font-size: clamp(24px, 5vw, 36px);
  font-weight: 600;
  color: var(--color-white);
  line-height: 1.15;
  margin-bottom: 16px;
}

.section-subtext {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 400;
  color: var(--color-text-secondary);
  line-height: 1.7;
  max-width: 600px;
}
"""
css += typography

# Replace Global Button Style (we will just rename the old .btn-primary to .btn-primary-old and append new ones at the end to be safe, or regex replace it)
btn_pattern = r'\.btn-primary\s*\{[^}]*\}'
new_btn = """.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg, 
    var(--color-accent-crimson) 0%, 
    var(--color-accent-fuchsia) 100%
  );
  color: var(--color-white);
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  padding: 16px 32px;
  border-radius: var(--radius-button);
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: opacity var(--transition-base);
  white-space: nowrap;
}"""
css = re.sub(btn_pattern, new_btn, css)

btn_hover_pattern = r'\.btn-primary:hover\s*\{[^}]*\}'
new_btn_hover = """.btn-primary:hover {
  opacity: 0.9;
}

.btn-primary:active {
  opacity: 0.85;
}

/* Full width variant */
.btn-primary-full {
  width: 100%;
  display: flex;
}"""
css = re.sub(btn_hover_pattern, new_btn_hover, css)

# Global Card Style
card_style = """
/* === GLOBAL CARD STYLE === */
.card-base {
  background: var(--color-card-bg);
  border: var(--color-card-border);
  border-radius: var(--radius-card);
  overflow: hidden;
}

.crimson-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  min-width: 8px;
  border-radius: 50%;
  background-color: var(--color-accent-crimson);
  box-shadow: 0 0 6px rgba(234,0,58,0.50);
  margin-right: 12px;
  vertical-align: middle;
  flex-shrink: 0;
}

.callout-box {
  background: rgba(234,0,58,0.08);
  border: 1px solid rgba(234,0,58,0.20);
  border-left: 3px solid var(--color-accent-crimson);
  border-radius: 10px;
  padding: 20px 24px;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 16px;
  color: rgba(255,255,255,0.80);
  margin-top: 24px;
}
"""
css += card_style

# Remove any white backgrounds (I'll do a regex replace)
css = re.sub(r'background:\s*(#fff|#ffffff|white)\s*;', 'background-color: var(--color-bg-primary);', css, flags=re.IGNORECASE)
css = re.sub(r'background-color:\s*(#fff|#ffffff|white)\s*;', 'background-color: var(--color-bg-primary);', css, flags=re.IGNORECASE)

with open('css/index.css', 'w') as f:
    f.write(css)

print("Updated index.css")
