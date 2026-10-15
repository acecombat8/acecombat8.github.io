"""Compare the seven pre-existing pages with a locally recorded pre-edit export.

Baseline: output/qa/frozen-baseline.json (recorded before this expansion).
This checks editorial objects, metadata, JSON-LD and main HTML byte-for-byte
through SHA-256, allowing only shared header/footer changes outside <main>.
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASELINE = ROOT / 'output/qa/frozen-baseline.json'
if not BASELINE.is_file():
    raise SystemExit('Missing pre-edit baseline: output/qa/frozen-baseline.json')
baseline = json.loads(BASELINE.read_text())

def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True).encode()).hexdigest()

pages = json.loads((ROOT / 'content/generated/pages.json').read_text())
assert pages[:len(baseline['pages'])] == baseline['pages'], 'Existing page definitions changed or reordered'
assert len(pages) == len(baseline['pages']) + 6, 'Expected exactly six new definitions'
assert json.loads((ROOT / 'content/generated/home.json').read_text()) == baseline['home'], 'Homepage definition changed'
for file, expected in baseline['files'].items():
    if file == 'content/generated/pages.json':
        continue
    assert hashlib.sha256((ROOT / file).read_bytes()).hexdigest() == expected, f'Frozen source changed: {file}'
rows = []
for slug, expected in baseline['rendered'].items():
    source = (ROOT / 'out' / (slug + '/index.html' if slug else 'index.html')).read_text()
    parts = {
        'main': re.search(r'<main\b.*?</main>', source, re.S).group(),
        'metadata': re.findall(r'<title>.*?</title>|<meta\b[^>]*>|<link\b[^>]*rel="canonical"[^>]*>', source),
        'schemas': re.findall(r'<script type="application/ld\+json">(.*?)</script>', source, re.S),
    }
    actual = {key: digest(value) for key, value in parts.items()}
    row = {'url': '/' + (slug + '/' if slug else ''), 'checks': {key: actual[key] == expected[key] for key in expected}, 'hashes': actual}
    rows.append(row)
(ROOT / 'output/qa/freeze-report.json').write_text(json.dumps(rows, indent=2) + '\n')
assert all(all(row['checks'].values()) for row in rows), json.dumps(rows, indent=2)
print('PASS: all seven original page definitions, main HTML, metadata and schemas are unchanged.')
