import re

data_file = '/Users/guide/Desktop/NightlifeAntigravity/js/data.js'
with open(data_file, 'r') as f:
    data_content = f.read()

# Replace quotes that contain literal newlines with backticks, or fix the newlines
new_hosts = """    hosts: [
        {
            id: 'host-guide',
            name: 'Guide',
            image: 'assets/images/Hosts/guide host.JPG',
            role: 'FOUNDER & HOST',
            quote: `"Bangkok born. Every venue earned."`
        },
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
        }
    ],"""

new_data_content = re.sub(r'hosts:\s*\[.*?],\n', new_hosts + '\n', data_content, flags=re.DOTALL)
with open(data_file, 'w') as f:
    f.write(new_data_content)

