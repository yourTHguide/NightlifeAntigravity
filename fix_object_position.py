import re

app_file = '/Users/guide/Desktop/NightlifeAntigravity/js/app.js'
with open(app_file, 'r') as f:
    app_content = f.read()

# Replace the style attribute for the img tag
old_img = '<img src="${host.image}" alt="${host.name}" style="object-fit: cover; object-position: center bottom; width: 100%; height: 100%;">'
new_img = '<img src="${host.image}" alt="${host.name}" style="object-fit: cover; object-position: ${(host.id === \'host-ice\' || host.id === \'host-guide\') ? \'center center\' : \'center bottom\'}; width: 100%; height: 100%;">'

new_app_content = app_content.replace(old_img, new_img)

if new_app_content != app_content:
    with open(app_file, 'w') as f:
        f.write(new_app_content)
    print("Updated app.js")
else:
    print("Failed to find the img tag to replace")

