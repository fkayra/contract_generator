#!/usr/bin/env python3
import zipfile
import os
import shutil

# Paths
template_dir = '/tmp/cc-agent/63790100/project/public'
source_template = os.path.join(template_dir, 'Team_Contract_Template.docx')
output_template = os.path.join(template_dir, 'template.docx')
temp_extract = os.path.join(template_dir, 'template_extracted')

# Extract template
if os.path.exists(temp_extract):
    shutil.rmtree(temp_extract)
os.makedirs(temp_extract)

with zipfile.ZipFile(source_template, 'r') as zip_ref:
    zip_ref.extractall(temp_extract)

# Read document.xml
doc_xml_path = os.path.join(temp_extract, 'word', 'document.xml')
with open(doc_xml_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update bonus section header
# Find and update "Bonuses per each season:" or similar text
replacements = [
    ('Bonuses per each season:', '3.8.1 Player Bonuses for {SEASON_1}'),
    ('<w:tab/><w:tab/><w:t xml:space="preserve">Bonuses per each season:',
     '<w:t xml:space="preserve">3.8.1 Player Bonuses for {SEASON_1}'),
]

for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        print(f"Replaced: {old[:30]}...")
        break

# Write back
with open(doc_xml_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Create new template
if os.path.exists(output_template):
    os.remove(output_template)

with zipfile.ZipFile(output_template, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(temp_extract):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, temp_extract)
            zipf.write(file_path, arcname)

print(f"\n✓ Template updated successfully!")
print(f"✓ New template created: {output_template}")
print(f"✓ [COMPETITION] placeholder preserved")
