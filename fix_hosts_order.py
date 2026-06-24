import re

data_file = '/Users/guide/Desktop/NightlifeAntigravity/js/data.js'
with open(data_file, 'r') as f:
    data_content = f.read()

new_hosts_section = """    // Night Conductors (Hosts)
    hosts: [
        {
            id: 'host-boom',
            name: 'Boom',
            image: 'assets/images/Hosts/boom host.jpg',
            role: 'SOCIAL CONNECTOR',
            quote: `"Nobody stays a stranger for long."`
        },
        {
            id: 'host-ice',
            name: 'Ice',
            image: 'assets/images/Hosts/Ice host.JPG',
            role: 'ENERGY HOST',
            quote: `"The room feels it before\\nthe music starts."`
        },
        {
            id: 'host-jj',
            name: 'JJ',
            image: 'assets/images/Hosts/JJ host.jpg',
            role: 'FLOW MANAGER',
            quote: `"Smooth transitions.\\nThe night never drops."`
        },
        {
            id: 'host-guide',
            name: 'Guide',
            image: 'assets/images/Hosts/guide host.JPG',
            role: 'FOUNDER & HOST',
            quote: `"Bangkok born. Every venue earned."`
        }
    ],

"""

# Regex replacing from `    // Night Conductors (Hosts)` to right before `    // JSON Schemas as reference (from Gemini.md)`
new_data_content = re.sub(r'\s*// Night Conductors \(Hosts\).*?(?=\s*// JSON Schemas as reference)', '\n' + new_hosts_section, data_content, flags=re.DOTALL)
with open(data_file, 'w') as f:
    f.write(new_data_content)

app_file = '/Users/guide/Desktop/NightlifeAntigravity/js/app.js'
with open(app_file, 'r') as f:
    app_content = f.read()

# Update object-position from 'center top' to 'center bottom'
new_app_content = app_content.replace('object-position: center top;', 'object-position: center bottom;')
with open(app_file, 'w') as f:
    f.write(new_app_content)

