import zipfile
import os
import shutil
import xml.etree.ElementTree as ET

template_path = 'public/template.docx'
backup_path = 'public/template.docx.bak5'

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

# Also register other common namespaces to preserve them
other_ns = {
    'wpc': 'http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas',
    'cx': 'http://schemas.microsoft.com/office/drawing/2014/chartex',
    'cx1': 'http://schemas.microsoft.com/office/drawing/2015/9/8/chartex',
    'cx2': 'http://schemas.microsoft.com/office/drawing/2015/10/21/chartex',
    'cx3': 'http://schemas.microsoft.com/office/drawing/2016/5/9/chartex',
    'cx4': 'http://schemas.microsoft.com/office/drawing/2016/5/10/chartex',
    'cx5': 'http://schemas.microsoft.com/office/drawing/2016/5/11/chartex',
    'cx6': 'http://schemas.microsoft.com/office/drawing/2016/5/12/chartex',
    'cx7': 'http://schemas.microsoft.com/office/drawing/2016/5/13/chartex',
    'cx8': 'http://schemas.microsoft.com/office/drawing/2016/5/14/chartex',
    'mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
    'aink': 'http://schemas.microsoft.com/office/drawing/2016/ink',
    'am3d': 'http://schemas.microsoft.com/office/drawing/2017/model3d',
    'o': 'urn:schemas-microsoft-com:office:office',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'v': 'urn:schemas-microsoft-com:vml',
    'wp14': 'http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing',
    'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    'w10': 'urn:schemas-microsoft-com:office:word',
    'w15': 'http://schemas.microsoft.com/office/word/2012/wordml',
    'w16cex': 'http://schemas.microsoft.com/office/word/2018/wordml/cex',
    'w16cid': 'http://schemas.microsoft.com/office/word/2016/wordml/cid',
    'w16': 'http://schemas.microsoft.com/office/word/2018/wordml',
    'w16sdtdh': 'http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash',
    'w16se': 'http://schemas.microsoft.com/office/word/2015/wordml/symex',
    'wpg': 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
    'wpi': 'http://schemas.microsoft.com/office/word/2010/wordprocessingInk',
    'wne': 'http://schemas.microsoft.com/office/word/2006/wordml',
    'wps': 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape'
}

for prefix, uri in other_ns.items():
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

    # Strategy: Split the text into parts and make only "Buy-Outs:" bold
    # First, find the run containing "Buy-Outs:"
    runs_list = list(para.findall('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r'))

    for idx, run in enumerate(runs_list):
        text_elem = run.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
        if text_elem is not None and text_elem.text and 'Buy-Outs:' in text_elem.text:
            print(f"  Found text: '{text_elem.text}'")

            original_text = text_elem.text

            # Split at "Buy-Outs:"
            if 'Buy-Outs:' in original_text:
                before_text = original_text.split('Buy-Outs:')[0]
                after_text = ''.join(original_text.split('Buy-Outs:')[1:])

                print(f"  Before: '{before_text}'")
                print(f"  Target: 'Buy-Outs:'")
                print(f"  After: '{after_text}'")

                # Get the run properties to copy
                orig_rPr = run.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rPr')

                # Clear this run - we'll rebuild it
                parent = para
                run_index = list(parent).index(run)
                parent.remove(run)

                # Create three new runs: before, bold Buy-Outs:, after

                # Run 1: text before "Buy-Outs:"
                if before_text:
                    run1 = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                    if orig_rPr is not None:
                        # Copy original properties
                        import copy
                        run1.append(copy.deepcopy(orig_rPr))
                    t1 = ET.SubElement(run1, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                    t1.text = before_text
                    t1.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
                    parent.insert(run_index, run1)
                    run_index += 1

                # Run 2: "Buy-Outs:" with bold
                run2 = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                rPr2 = ET.SubElement(run2, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rPr')

                # Copy original properties if they exist
                if orig_rPr is not None:
                    for child in orig_rPr:
                        import copy
                        rPr2.append(copy.deepcopy(child))

                # Add bold
                bold = ET.SubElement(rPr2, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}b')

                t2 = ET.SubElement(run2, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                t2.text = 'Buy-Outs:'
                t2.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
                parent.insert(run_index, run2)
                run_index += 1

                # Run 3: text after "Buy-Outs:"
                if after_text:
                    run3 = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                    if orig_rPr is not None:
                        import copy
                        run3.append(copy.deepcopy(orig_rPr))
                    t3 = ET.SubElement(run3, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                    t3.text = after_text
                    t3.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
                    parent.insert(run_index, run3)

                print("  ✓ Split text and made 'Buy-Outs:' bold")
                break
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
