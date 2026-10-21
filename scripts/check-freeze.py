"""Audit the 13 frozen pages against this batch's fresh local baseline.

The pre-edit build and full editorial snapshots live only in ignored output/qa/.
Shared navigation/footer sources are the only allowed existing-file changes.
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIRECTORY = ROOT / 'output/qa/2026-10-21'
BASELINE = DIRECTORY / 'frozen-baseline.json'
if not BASELINE.is_file():
    raise SystemExit('Missing pre-edit baseline: output/qa/2026-10-21/frozen-baseline.json')
baseline = json.loads(BASELINE.read_text())


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True).encode()).hexdigest()


pages = json.loads((ROOT / 'content/generated/pages.json').read_text())
assert len(baseline['pages']) == 12, 'Baseline must contain twelve original subpages'
assert pages[:12] == baseline['pages'], 'Frozen page definitions changed or reordered'
assert len(pages) == 18, 'Expected exactly six new definitions'
assert {p['slug'] for p in pages[12:]} == {
    'mission-30', 'mission-24', 'mission-22', 'mission-23', 'mission-29', 'mission-18'
}, 'Unapproved new page'
assert json.loads((ROOT / 'content/generated/home.json').read_text()) == baseline['home'], 'Homepage changed'
allowed = {
    'content/generated/pages.json', 'content/navigation.ts', 'app/globals.css',
    'components/templates/fixed-template-header.tsx', 'components/site/site-footer.tsx',
}
for file, expected in baseline['files'].items():
    if file not in allowed:
        assert hashlib.sha256((ROOT / file).read_bytes()).hexdigest() == expected, f'Frozen source changed: {file}'
rows = []
for slug, expected in baseline['rendered'].items():
    source = (ROOT / 'out' / (slug + '/index.html' if slug else 'index.html')).read_text()
    main = re.search(r'<main\b.*?</main>', source, re.S).group()
    parts = {
        'main': main,
        'headings': re.findall(r'<h[123]\b.*?</h[123]>', main, re.S),
        'metadata': re.findall(r'<title>.*?</title>|<meta\b[^>]*>|<link\b[^>]*rel="canonical"[^>]*>', source),
        'schemas': re.findall(r'<script type="application/ld\+json">(.*?)</script>', source, re.S),
    }
    actual = {key: digest(value) for key, value in parts.items()}
    rows.append({
        'url': '/' + (slug + '/' if slug else ''),
        'checks': {key: actual[key] == value for key, value in expected['hashes'].items()},
        'hashes': actual,
        'editorialDefinitionUnchanged': True,
        'inlineLinkExceptions': [],
    })
(DIRECTORY / 'freeze-report.json').write_text(json.dumps(rows, indent=2) + '\n')
assert len(rows) == 13 and all(all(row['checks'].values()) for row in rows), json.dumps(rows, indent=2)
print('PASS: all 13 original definitions, main HTML, headings, metadata and schemas are unchanged; no inline-link exceptions.')
