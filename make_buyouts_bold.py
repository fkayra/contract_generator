import zipfile
import os
import shutil
import xml.etree.ElementTree as ET

template_path = 'public/template.docx'
backup_path = 'public/template.docx.bak4'

# Create backup
shutil.copy(template_path, backup_path)
print(f"✓ Backup created: {backup_path}")

# Define namespaces
namespaces = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'w14': 'http://schemas.microsoft.com/office/word/2010/wordml'
}

# Register namespaces to preserve prefixes
for prefix, uri in namespaces.items():
    ET.register_namespace(prefix, uri)

# Open the docx file
with zipfile.ZipFile(template_path, 'r') as zip_ref:
    # Read document.xml
    with zip_ref.open('word/document.xml') as f:
        tree = ET.parse(f)
        root = tree.getroot()

# Find the paragraph with paraId 00000079 (9.1 Buy-Outs:)
para = None
for p in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
    para_id = p.get('{http://schemas.microsoft.com/office/word/2010/wordml}paraId')
    if para_id == '00000079':
        para = p
        break

if para is not None:
    print("✓ Found paragraph 00000079 (9.1 Buy-Outs:)")

    # Find all text runs in this paragraph
    for run in para.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r'):
        # Get text content
        text_elem = run.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
        if text_elem is not None and text_elem.text and 'Buy-Outs:' in text_elem.text:
            print(f"  Found 'Buy-Outs:' text: {text_elem.text}")

            # Check if run properties exist
            rPr = run.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rPr')
            if rPr is None:
                # Create rPr if it doesn't exist
                rPr = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rPr')
                # Insert as first child
                run.insert(0, rPr)
                print("  Created rPr element")

            # Check if bold already exists
            bold = rPr.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}b')
            if bold is None:
                # Add bold
                bold = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}b')
                rPr.append(bold)
                print("  ✓ Added bold formatting to 'Buy-Outs:'")
            else:
                print("  Already bold")
else:
    print("✗ Paragraph 00000079 not found!")
    exit(1)

# Save the modified XML back to the docx
temp_dir = 'temp_docx_extract'
os.makedirs(temp_dir, exist_ok=True)

# Extract all files
with zipfile.ZipFile(template_path, 'r') as zip_ref:
    zip_ref.extractall(temp_dir)

# Write the modified document.xml
tree.write(os.path.join(temp_dir, 'word', 'document.xml'),
          xml_declaration=True,
          encoding='UTF-8',
          method='xml')

# Create new docx
with zipfile.ZipFile(template_path, 'w', zipfile.ZIP_DEFLATED) as docx:
    for foldername, subfolders, filenames in os.walk(temp_dir):
        for filename in filenames:
            file_path = os.path.join(foldername, filename)
            arcname = os.path.relpath(file_path, temp_dir)
            docx.write(file_path, arcname)

# Clean up
shutil.rmtree(temp_dir)

print("\n✓ Template updated successfully!")
print(f"  Backup saved as: {backup_path}")
