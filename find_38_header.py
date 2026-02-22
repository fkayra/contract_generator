#!/usr/bin/env python3
import zipfile
import re

with zipfile.ZipFile('/tmp/cc-agent/63790100/project/public/template.docx', 'r') as z:
    content = z.read('word/document.xml').decode('utf-8')

# Find all paragraphs around "3.8" and "BONUSES"
# Look for the structure
match = re.search(r'(.{3000})3\.8[\s\S]{0,50}BONUSES(.{3000})', content)
if match:
    before = match.group(1)
    after = match.group(2)

    # Get paragraphs
    paragraphs_before = re.findall(r'<w:p\s[^>]*>.*?</w:p>', before, re.DOTALL)[-5:]
    paragraphs_after = re.findall(r'<w:p\s[^>]*>.*?</w:p>', after, re.DOTALL)[:5]

    print("Last 5 paragraphs BEFORE '3.8 BONUSES':")
    print("="*80)
    for i, para in enumerate(paragraphs_before, 1):
        texts = re.findall(r'<w:t[^>]*>([^<]*)</w:t>', para)
        text = ''.join(texts).strip()
        if text:
            print(f"{i}. {text[:200]}")

    print("\n\nFirst 5 paragraphs AFTER '3.8 BONUSES':")
    print("="*80)
    for i, para in enumerate(paragraphs_after, 1):
        texts = re.findall(r'<w:t[^>]*>([^<]*)</w:t>', para)
        text = ''.join(texts).strip()
        if text:
            print(f"{i}. {text[:200]}")

# Also show exact structure of 3.8 BONUSES paragraph
match = re.search(r'(<w:p[^>]*>[\s\S]*?3\.8[\s\S]*?BONUSES[\s\S]*?</w:p>)', content)
if match:
    para = match.group(1)
    print("\n\n3.8 BONUSES paragraph structure:")
    print("="*80)
    print(f"ParaId: {re.search(r'paraId=\"([^\"]+)\"', para).group(1) if re.search(r'paraId=\"([^\"]+)\"', para) else 'NOT FOUND'}")
    texts = re.findall(r'<w:t[^>]*>([^<]*)</w:t>', para)
    print(f"Text: {''.join(texts)}")
    print(f"Length: {len(para)} chars")
