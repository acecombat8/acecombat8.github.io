"""Compare the 19 established editorial pages with Git HEAD.

Optionally pass an independently built HEAD export directory to verify rendered
main HTML, headings, SEO tags and JSON-LD as well as source definitions.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def head(path):
    return subprocess.check_output(['git', 'show', f'HEAD:{path}'], cwd=ROOT)


original = json.loads(head('content/generated/pages.json'))
current = json.loads((ROOT / 'content/generated/pages.json').read_text())
assert len(original) == 18, 'Expected eighteen established subpages in HEAD'
assert current[:18] == original, 'Frozen page definitions changed or reordered'
assert len(current) == 23 and {p['slug'] for p in current[18:]} == {
    'best-online-planes', 'mission-19', 'mission-20', 'mission-21', 'assault-records'
}, 'Expected exactly the five approved new pages'
assert (ROOT / 'content/generated/home.json').read_bytes() == head('content/generated/home.json'), 'Frozen homepage changed'
# Shared navigation/footer may change; editorial rendering and SEO must not.
for directory in ['app', 'config', 'lib', 'components', 'content']:
    for name in subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', 'HEAD', directory], cwd=ROOT, text=True).splitlines():
        if name in {'content/generated/pages.json', 'content/navigation.ts', 'components/site/site-footer.tsx', 'components/templates/fixed-template-header.tsx', 'app/globals.css'}:
            continue
        assert (ROOT / name).read_bytes() == head(name), f'Frozen source changed: {name}'


def parts(source):
    main = re.search(r'<main\b.*?</main>', source, re.S).group()
    return {
        'main': main,
        'headings': re.findall(r'<h[123]\b.*?</h[123]>', main, re.S),
        'metadata': re.findall(r'<title>.*?</title>|<meta\b[^>]*>|<link\b[^>]*rel="canonical"[^>]*>', source),
        'schemas': re.findall(r'<script type="application/ld\+json">(.*?)</script>', source, re.S),
    }


rows = []
if len(sys.argv) > 1:
    baseline = Path(sys.argv[1])
    for slug in ['', *[p['slug'] for p in original]]:
        local = f'{slug}/index.html' if slug else 'index.html'
        before, after = parts((baseline / local).read_text()), parts((ROOT / 'out' / local).read_text())
        checks = {key: before[key] == after[key] for key in before}
        rows.append({'url': '/' + (slug + '/' if slug else ''), 'checks': checks})
    report = ROOT / 'output/qa/freeze-report.json'
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(json.dumps(rows, indent=2) + '\n')
    assert all(all(row['checks'].values()) for row in rows), json.dumps(rows, indent=2)
    print('PASS: all 19 original pages retain identical main HTML, headings, SEO metadata and schemas.')
else:
    print('PASS: all 19 original editorial definitions and SEO/rendering sources are unchanged. Pass HEAD out/ to compare rendered output.')
