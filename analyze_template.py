#!/usr/bin/env python3
import zipfile
import re
import xml.etree.ElementTree as ET

# Extract and parse template
with zipfile.ZipFile('/tmp/cc-agent/63790100/project/template_verify.zip', 'w') as z:
    pass

with zipfile.ZipFile('/tmp/cc-agent/63790100/project/public/template.docx', 'r') as z:
    content = z.read('word/document.xml').decode('utf-8')

# Find [COMPETITION] and surrounding context
match = re.search(r'(.{2000}\[COMPETITION\].{500})', content, re.DOTALL)
if match:
    snippet = match.group(1)

    # Find all paragraph boundaries
    paragraphs = re.findall(r'<w:p\s[^>]*>.*?</w:p>', snippet, re.DOTALL)

    print(f"Found {len(paragraphs)} paragraphs around [COMPETITION]")
    print("\n" + "="*80)

    for i, para in enumerate(paragraphs[-8:]):  # Last 8 paragraphs
        # Extract text content
        texts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', para)
        text_content = ''.join(texts)

        # Check if it contains COMPETITION
        has_comp = '[COMPETITION]' in para

        print(f"\nParagraph {i}: {text_content[:100]}")
        if has_comp:
            print("    ^^^ THIS IS THE [COMPETITION] PARAGRAPH ^^^")
            print(f"    Length: {len(para)} chars")
            # Show structure
            structure = re.sub(r'<w:t[^>]*>.*?</w:t>', '<w:t>TEXT</w:t>', para)
            print(f"    Structure preview: {structure[:300]}...")
