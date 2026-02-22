#!/usr/bin/env python3
import zipfile
import re

# Simulated test - check what sections exist before 3.8
with zipfile.ZipFile('/tmp/cc-agent/63790100/project/public/template.docx', 'r') as z:
    content = z.read('word/document.xml').decode('utf-8')

# Find position of 3.8 and show what's before it
pos_38 = content.find('3.8')

# Get content before 3.8 (last 5000 chars)
before_38 = content[max(0, pos_38-5000):pos_38+200]

# Extract text content
texts = re.findall(r'<w:t[^>]*>([^<]*)</w:t>', before_38)
text_content = ''.join(texts)

# Show last 2000 chars of text before 3.8
print("Text content before 3.8 section:")
print("="*80)
print(text_content[-2000:])
print("="*80)

# Also check section structure
print("\n\nLooking for section 3.7, 3.6, 3.5, etc:")
for section_num in ['3.7', '3.6', '3.5', '3.4', '3.3', '3.2', '3.1', '3.0', '2.']:
    if section_num in content:
        print(f"  ✓ Found section {section_num}")
        # Get context around it
        pos = content.find(section_num)
        context = content[pos:pos+500]
        texts = re.findall(r'<w:t[^>]*>([^<]*)</w:t>', context)
        print(f"    Text: {''.join(texts)[:150]}")
    else:
        print(f"  ✗ Section {section_num} not found")
