#!/usr/bin/env python3
import zipfile
import re

with zipfile.ZipFile('/tmp/cc-agent/63790100/project/public/template.docx', 'r') as z:
    content = z.read('word/document.xml').decode('utf-8')

# Find the exact [COMPETITION] paragraph
match = re.search(r'(<w:p\s+[^>]*w14:paraId="0000004D"[^>]*>.*?</w:p>)', content, re.DOTALL)
if match:
    para = match.group(1)
    print("Found [COMPETITION] paragraph:")
    print("="*80)
    print(para)
    print("="*80)
    print(f"\nLength: {len(para)} characters")

    # Extract text
    texts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', para)
    print(f"Text content: {''.join(texts)}")
