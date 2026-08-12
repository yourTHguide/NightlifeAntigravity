import re

with open('css/index.css', 'r') as f:
    css = f.read()

# EDIT 1 & 2
target_1 = """.night-cards-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    margin-top: var(--space-2xl);
}"""

replacement_1 = """.night-cards-container {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 16px;
    margin-top: var(--space-2xl);
    overflow-x: auto;
    overflow-y: visible;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 8px 0 16px;
    width: 100%;
}

.night-cards-container::-webkit-scrollbar {
    display: none;
}"""
css = css.replace(target_1, replacement_1)

# EDIT 3
target_3 = """@media (min-width: 768px) {
    .night-cards-container {
        flex-direction: row;
        justify-content: center;
        align-items: stretch;
    }
}"""

replacement_3 = """@media (min-width: 768px) {
    .night-cards-container {
        flex-direction: row;
        justify-content: flex-start;
        align-items: stretch;
    }
}"""
css = css.replace(target_3, replacement_3)

# EDIT 4
target_4 = """.night-card {
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
    min-height: 250px;
    background-size: cover;
    background-position: center;
    cursor: pointer;
    transition: var(--transition-base);
    box-shadow: var(--shadow-card);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    border: 1px solid var(--color-border);
    flex: 1;
}"""

replacement_4 = """.night-card {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    background-size: cover;
    background-position: center;
    cursor: pointer;
    transition: var(--transition-base);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    border: 1px solid rgba(255,255,255,0.08);
    flex: 0 0 240px;
    width: 240px;
    min-width: 240px;
    height: 360px;
    text-decoration: none;
}

@media (min-width: 769px) {
    .night-card {
        flex: 0 0 260px;
        width: 260px;
        min-width: 260px;
        height: 390px;
    }
}"""
css = css.replace(target_4, replacement_4)

# EDIT 5
target_5 = """@media (min-width: 768px) {
    .night-card {
        min-height: 380px;
    }
}"""
css = css.replace(target_5, "")

# EDIT 6
target_6 = """.night-card-overlay {
    position: absolute;
    inset: -2px;
    background: linear-gradient(to top, rgba(28, 28, 30, 0.95) 0%, rgba(28, 28, 30, 0.4) 60%, rgba(28, 28, 30, 0.1) 100%);
    z-index: 1;
    transition: var(--transition-base);
    border-radius: inherit;
    pointer-events: none;
}"""

replacement_6 = """.night-card-overlay {
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(
        to bottom,
        rgba(10,0,10,0.10) 0%,
        rgba(10,0,10,0.10) 20%,
        rgba(10,0,10,0.55) 55%,
        rgba(10,0,10,0.97) 100%
    );
    z-index: 1;
    pointer-events: none;
    border-radius: inherit;
}"""
css = css.replace(target_6, replacement_6)

# EDIT 7
target_7 = """.night-card-title {
    font-size: var(--text-h3);
    background: var(--color-gold-brushed);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: var(--space-xs);
    font-family: var(--font-headline);
    font-weight: var(--weight-bold);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}"""

replacement_7 = """.night-card-title {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #FFFFFF;
    margin-bottom: 4px;
    line-height: 1.3;
}"""
css = css.replace(target_7, replacement_7)

# EDIT 8: Remove bottom appended blocks
# Find the start of the appended blocks
match = re.search(r'/\* Step 5 (fix|final fix).*', css, flags=re.IGNORECASE | re.DOTALL)
if match:
    css = css[:match.start()].rstrip() + "\n"

with open('css/index.css', 'w') as f:
    f.write(css)

print("Done")
