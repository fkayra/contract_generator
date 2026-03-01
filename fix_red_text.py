import re

# Read the document.xml
with open('/tmp/cc-agent/63790100/project/public/template_fix/word/document.xml', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the paragraph containing {MULTI_SEASON_CLAUSE_FULL}
# This should be paragraph with paraId near the season clause
# Look for red color tags (<w:color w:val="FF0000"/>) near this placeholder

# Pattern to find the paragraph containing MULTI_SEASON_CLAUSE_FULL
pattern = r'(<w:p[^>]*>.*?\{MULTI_SEASON_CLAUSE_FULL\}.*?</w:p>)'
match = re.search(pattern, content, re.DOTALL)

if match:
    para = match.group(1)
    print("Found paragraph with MULTI_SEASON_CLAUSE_FULL")
    print(f"Length: {len(para)}")

    # Remove all red color formatting from this paragraph
    # Red color is specified as FF0000
    para_fixed = re.sub(r'<w:color w:val="FF0000"/>', '', para)

    # Also check for any other red color variations
    para_fixed = re.sub(r'<w:color w:val="ff0000"/>', '', para_fixed)

    # Replace in content
    content = content.replace(para, para_fixed)

    print(f"Removed red color tags")
else:
    print("Pattern not found, trying alternative search...")
    # Try to find just mentions of the placeholder
    if '{MULTI_SEASON_CLAUSE_FULL}' in content:
        print("Placeholder found in content")
        # Find all instances of red color and replace them
        # This is more aggressive but should work
        original_count = content.count('<w:color w:val="FF0000"/>')
        content = content.replace('<w:color w:val="FF0000"/>', '<w:color w:val="000000"/>')
        print(f"Replaced {original_count} red color tags with black")
    else:
        print("Placeholder not found at all!")

# Write back
with open('/tmp/cc-agent/63790100/project/public/template_fix/word/document.xml', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
