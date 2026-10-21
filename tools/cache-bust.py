"""Add ?v=<content hash> to local CSS/JS links in every page.

Run after changing any file in assets/ so browsers fetch the new copy
instead of a cached old one:  python3 tools/cache-bust.py
"""
import hashlib, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
pattern = re.compile(r'((?:href|src)=")(assets/[^"?]+\.(?:css|js))(?:\?v=[0-9a-f]+)?(")')

def version(path):
    return hashlib.sha1((root / path).read_bytes()).hexdigest()[:8]

for page in sorted(root.glob("*.html")):
    text = page.read_text()
    new = pattern.sub(lambda m: f"{m.group(1)}{m.group(2)}?v={version(m.group(2))}{m.group(3)}", text)
    if new != text:
        page.write_text(new)
        print("updated", page.name)
