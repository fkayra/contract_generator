#!/usr/bin/env python3
import zipfile
import re

with zipfile.ZipFile('/tmp/cc-agent/63790100/project/public/template.docx', 'r') as z:
    content = z.read('word/document.xml').decode('utf-8')

# Find all section headings (numbered sections)
sections = re.findall(r'<w:t[^>]*>([0-9]+\.[0-9]+[^<]{0,100})</w:t>', content)

print("Sections found in template:")
print("="*80)
for i, section in enumerate(sections[:30], 1):
    print(f"{i:2d}. {section[:80]}")

# Check where COMPETITION is relative to these sections
comp_pos = content.find('[COMPETITION]')
section_38_pos = content.find('3.8')

print(f"\n\nPosition of '3.8': {section_38_pos}")
print(f"Position of '[COMPETITION]': {comp_pos}")
print(f"\nDistance: {comp_pos - section_38_pos} characters")
