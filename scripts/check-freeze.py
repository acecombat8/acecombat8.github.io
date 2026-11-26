"""Freeze editorial source and independently built HTML against an explicit commit.

Usage: python3 scripts/check-freeze.py BASELINE_OUT --base COMMIT
Build BASELINE_OUT from that commit before editing; never copy the final export.
"""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('baseline', type=Path)
parser.add_argument('--base', required=True)
args = parser.parse_args()
base = subprocess.check_output(['git', 'rev-parse', args.base], cwd=ROOT, text=True).strip()

def original(path):
    return subprocess.check_output(['git', 'show', f'{base}:{path}'], cwd=ROOT)

old = json.loads(original('content/generated/pages.json'))
current = json.loads((ROOT / 'content/generated/pages.json').read_text())
assert current[:len(old)] == old, 'Existing page objects changed or reordered'
assert len(current) == len(old) + 4, 'Expected exactly four additions'
assert {p['slug'] for p in current[len(old):]} == {'online-season-2', 'celaeno', 'mission-04', 'best-parts'}
allowed = {'content/generated/pages.json', 'content/navigation.ts', 'components/site/site-footer.tsx', 'components/templates/fixed-template-header.tsx', 'app/globals.css'}
for folder in ['app', 'config', 'lib', 'components', 'content', '.github/workflows']:
    for name in subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', base, folder], cwd=ROOT, text=True).splitlines():
        if name not in allowed:
            assert (ROOT / name).read_bytes() == original(name), f'Frozen source changed: {name}'

def parts(source):
    main = re.search(r'<main\b.*?</main>', source, re.S).group()
    return {
        'main': main,
        'headings': re.findall(r'<h[123]\b.*?</h[123]>', main, re.S),
        'metadata': re.findall(r'<title>.*?</title>|<meta\b[^>]*>|<link\b[^>]*rel="canonical"[^>]*>', source),
        'schemas': re.findall(r'<script type="application/ld\+json">(.*?)</script>', source, re.S),
        'integrationScripts': re.findall(r'<script\b[^>]*src="https?://[^>]*>.*?</script>', source, re.S),
    }

assert args.baseline.is_dir(), 'Missing independently built baseline'
rows = []
for slug in ['', *[p['slug'] for p in old]]:
    local = f'{slug}/index.html' if slug else 'index.html'
    before = parts((args.baseline / local).read_text())
    after = parts((ROOT / 'out' / local).read_text())
    rows.append({'url': '/' + (slug + '/' if slug else ''), 'checks': {key: before[key] == after[key] for key in before}})
report = {'baseCommit': base, 'oldPages': len(old), 'objectDifferences': [], 'homeSha256': hashlib.sha256(original('content/generated/home.json')).hexdigest(), 'homeUnchanged': (ROOT / 'content/generated/home.json').read_bytes() == original('content/generated/home.json'), 'routes': rows}
dest = ROOT / 'output/qa/freeze-report.json'
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(json.dumps(report, indent=2) + '\n')
assert report['homeUnchanged']
assert all(all(row['checks'].values()) for row in rows), json.dumps(rows, indent=2)
print(f'PASS: homepage + {len(old)} existing pages retain source, main HTML, headings, metadata, schemas and integration scripts against {base}.')
