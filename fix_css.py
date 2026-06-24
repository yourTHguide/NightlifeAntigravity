import re

css_path = '/Users/guide/Desktop/NightlifeAntigravity/css/index.css'
with open(css_path, 'r') as f:
    css = f.read()

# I will replace from .night-card { to the end of .night-card-content { ... } 
# Let's write the exact block of css

new_css = """
.night-card {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    isolation: isolate;
    aspect-ratio: 2 / 3;
    cursor: pointer;
    transition: var(--transition-base);
    box-shadow: var(--shadow-card), inset 0 0 0 2px #2F002F;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    border: 1px solid var(--color-border);
    flex: 0 0 85%;
    scroll-snap-align: center;
}

@media (min-width: 768px) {
    .night-card {
        aspect-ratio: unset;
        min-height: 380px;
        flex: 0 0 300px;
        scroll-snap-align: start;
    }
}

.night-card:hover {
    transform: translateY(-8px);
    border-color: var(--color-primary);
    box-shadow: var(--shadow-elevated), 0 0 20px rgba(234, 0, 58, 0.35), inset 0 0 0 2px #2F002F;
}

.night-card-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
}

.night-card-overlay {
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    width: calc(100% + 4px);
    height: calc(100% + 4px);
    z-index: 1;
    pointer-events: none;
    border-radius: 14px;
    background: linear-gradient(
        to bottom,
        rgba(10,0,10,0.10) 0%,
        rgba(10,0,10,0.10) 15%,
        rgba(10,0,10,0.50) 45%,
        rgba(10,0,10,0.92) 70%,
        rgba(10,0,10,0.99) 100%
    );
    transition: var(--transition-base);
}

.night-card:hover .night-card-overlay {
    background: linear-gradient(
        to bottom,
        rgba(10,0,10,0.20) 0%,
        rgba(10,0,10,0.20) 15%,
        rgba(10,0,10,0.60) 45%,
        rgba(10,0,10,0.95) 70%,
        rgba(10,0,10,0.99) 100%
    );
}

.night-card-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 16px;
    text-align: left;
}

.night-card-title {
"""

# Now we find the right place to substitute in css
pattern = r'\.night-card\s*\{.*?(?=\.night-card-title\s*\{)'
new_css_content = re.sub(pattern, new_css, css, flags=re.DOTALL)

with open(css_path, 'w') as f:
    f.write(new_css_content)
print("Updated index.css")

