#!/usr/bin/env python3
import zipfile
import os
import shutil

# Paths
template_dir = '/tmp/cc-agent/63790100/project/public'
template_path = os.path.join(template_dir, 'template.docx')
temp_extract = os.path.join(template_dir, 'template_extracted')
doc_xml_path = os.path.join(temp_extract, 'word', 'document.xml')

# Extract template
if os.path.exists(temp_extract):
    shutil.rmtree(temp_extract)
os.makedirs(temp_extract)

with zipfile.ZipFile(template_path, 'r') as zip_ref:
    zip_ref.extractall(temp_extract)

# Read document.xml
with open(doc_xml_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update bonus section header
# Change "Bonuses per each season:" to numbered section with season placeholder
old_text = '<w:t xml:space="preserve">Bonuses per each season:'
new_text = '<w:t xml:space="preserve">3.8.1 Player Bonuses for {SEASON_1}'

content = content.replace(old_text, new_text)

# Write back
with open(doc_xml_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Create new template
new_template_path = template_path
if os.path.exists(new_template_path):
    os.remove(new_template_path)

with zipfile.ZipFile(new_template_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(temp_extract):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, temp_extract)
            zipf.write(file_path, arcname)

print("Template updated successfully!")
print(f"Updated template: {new_template_path}")
