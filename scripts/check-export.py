"""Validate the exported editorial pages and their public navigation."""
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'out'
HOST = 'https://acecombat8.github.io'
SLUGS = ['', 'mission-28-s-rank', 'mission-16', 'mrp-farming', 'mission-26', 'missions', 'best-planes']
PREVIEW = '--preview' in sys.argv
errors = []

def check(condition, message):
    if not condition:
        errors.append(message)

class Document(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.title = ''
        self.meta = {}
        self.canonical = ''
        self.h1 = 0
        self.main_count = 0
        self.main_depth = 0
        self.main_text = []
        self.ignore = 0
        self.title_active = False
        self.schema_active = False
        self.schema_text = ''
        self.schemas = []
        self.ids = set()
        self.links = []
        self.assets = []
        self.in_footer = False
        self.footer_links = set()
        self.in_nav = 0
        self.nav_links = set()
        self.has_lang = False
        self.visible_text = []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html':
            self.has_lang = a.get('lang') == 'en'
        if tag == 'title':
            self.title_active = True
        if tag == 'meta':
            self.meta[a.get('name', a.get('property', ''))] = a.get('content', '')
        if tag == 'link' and a.get('rel') == 'canonical':
            self.canonical = a.get('href', '')
        if tag == 'main':
            self.main_depth += 1
            self.main_count += 1
        if tag == 'h1':
            self.h1 += 1
        if tag in ['script', 'style', 'nav', 'aside']:
            self.ignore += 1
        if tag == 'script' and a.get('type') == 'application/ld+json':
            self.schema_active = True
            self.schema_text = ''
        if tag == 'footer':
            self.in_footer = True
        if tag == 'nav':
            self.in_nav += 1
        if 'id' in a:
            check(a['id'] not in self.ids, 'Duplicate HTML id: ' + a['id'])
            self.ids.add(a['id'])
        if tag == 'a':
            href = a.get('href', '')
            self.links.append(href)
            if self.in_footer:
                self.footer_links.add(href)
            if self.in_nav:
                self.nav_links.add(href)
            check(bool(href), 'Empty link destination')
        if tag == 'img':
            check('alt' in a, 'Image missing alt')
            self.assets.append(a.get('src', ''))

    def handle_endtag(self, tag):
        if tag == 'title':
            self.title_active = False
        if tag == 'main':
            self.main_depth -= 1
        if tag in ['script', 'style', 'nav', 'aside']:
            self.ignore -= 1
        if tag == 'script' and self.schema_active:
            parsed = json.loads(self.schema_text)
            self.schemas.extend(parsed if isinstance(parsed, list) else [parsed])
            self.schema_active = False
        if tag == 'footer':
            self.in_footer = False
        if tag == 'nav':
            self.in_nav -= 1

    def handle_data(self, data):
        if self.title_active:
            self.title += data
        if self.schema_active:
            self.schema_text += data
        if self.main_depth and not self.ignore:
            self.main_text.append(data)
        if not self.ignore:
            self.visible_text.append(data)

check(OUT.is_dir(), 'out/ is missing')
if not OUT.is_dir():
    raise SystemExit('\n'.join(errors))
documents = {}
for file in OUT.rglob('*.html'):
    documents[file.relative_to(OUT).as_posix()] = Document(file.read_text())
rows = []
for slug in SLUGS:
    local = f'{slug}/index.html' if slug else 'index.html'
    check(local in documents, 'Missing route: ' + local)
    if local not in documents:
        continue
    doc = documents[local]
    url = HOST + '/' + (slug + '/' if slug else '')
    words = len(re.findall(r"[A-Za-z0-9]+(?:['’\-][A-Za-z0-9]+)*", ' '.join(doc.main_text)))
    check(doc.h1 == 1, local + ': expected exactly one H1')
    check(doc.main_count == 1, local + ': expected exactly one main landmark')
    check(doc.has_lang, local + ': expected English document')
    check(doc.canonical == url, local + ': incorrect canonical')
    check(0 < len(doc.title) <= 60, local + ': title exceeds 60 characters')
    check(0 < len(doc.meta.get('description', '')) <= 160, local + ': description exceeds 160 characters')
    check(words >= (1200 if not slug else 900), local + f': insufficient substantive word count ({words})')
    check(doc.meta.get('og:url') == url, local + ': incorrect OG URL')
    check(doc.meta.get('og:image') == HOST + '/images/guide-og.png', local + ': invalid OG image')
    if not PREVIEW:
        check(doc.meta.get('robots') == 'index, follow', local + ': restrictive robots metadata')
    destinations = {'/' + (s + '/' if s else '') for s in SLUGS}
    check(destinations <= doc.footer_links, local + ': footer does not contain all seven destinations')
    check(destinations <= doc.nav_links, local + ': global navigation does not expose all routes')
    visible = ' '.join(doc.visible_text)
    schema_types = set()
    for schema in doc.schemas:
        schema_types.add(schema.get('@type'))
        if schema.get('@type') == 'FAQPage':
            for question in schema['mainEntity']:
                check(question['name'] in visible, local + ': invisible schema FAQ question')
                check(question['acceptedAnswer']['text'] in visible, local + ': invisible schema FAQ answer')
        if schema.get('@type') == 'BreadcrumbList':
            for item in schema['itemListElement']:
                check(item['item'] in [HOST + d for d in destinations], local + ': invalid breadcrumb route')
        check(not any(key in schema for key in ['aggregateRating', 'offers']), local + ': unsupported rating or offer')
    check('FAQPage' in schema_types, local + ': missing visible FAQ schema')
    check(('BreadcrumbList' if slug else 'VideoGame') in schema_types, local + ': missing page schema')
    rows.append(dict(url=url, title=doc.title, titleCharacters=len(doc.title), descriptionCharacters=len(doc.meta.get('description', '')), words=words, h1=doc.h1, schemas=sorted(schema_types)))

check(len({r['title'] for r in rows}) == 7, 'Titles are not unique')
check(len({documents[(s + '/index.html') if s else 'index.html'].meta.get('description') for s in SLUGS}) == 7, 'Descriptions are not unique')
for local, doc in documents.items():
    for href in doc.links + doc.assets:
        p = urlsplit(href)
        if p.scheme and p.netloc != 'acecombat8.github.io':
            continue
        if p.path:
            target = unquote(p.path).lstrip('/')
            if not target:
                target = 'index.html'
            elif target.endswith('/'):
                target += 'index.html'
            check((OUT / target).is_file(), local + ': broken local destination ' + href)
        else:
            target = local
        if p.fragment and target in documents:
            check(unquote(p.fragment) in documents[target].ids, local + ': broken fragment ' + href)
    if local not in [('index.html' if not s else s + '/index.html') for s in SLUGS]:
        check('noindex' in doc.meta.get('robots', ''), local + ': non-editorial page should be noindex')

sitemap = ElementTree.parse(OUT / 'sitemap.xml')
locations = [node.text for node in sitemap.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
check(set(locations) == {r['url'] for r in rows} and len(locations) == 7, 'Sitemap must contain exactly seven editorial URLs')
robots = (OUT / 'robots.txt').read_text()
check('Sitemap: ' + HOST + '/sitemap.xml' in robots, 'Incorrect robots sitemap')
if not PREVIEW:
    check('Allow: /' in robots and 'Disallow: /' not in robots, 'Robots must allow crawling')
check((OUT / '.nojekyll').is_file(), 'Missing .nojekyll')
check(not (OUT / 'CNAME').exists(), 'Unexpected CNAME')
check((OUT / 'images/guide-og.png').is_file(), 'Missing social image')
check((OUT / 'images/guide-mark.svg').is_file(), 'Missing favicon')
# Inspect public text and bundles without echoing any suspicious value.
for file in OUT.rglob('*'):
    if not file.is_file() or file.suffix.lower() not in ['.html', '.txt', '.js', '.json', '.svg', '.webmanifest']:
        continue
    source = file.read_text(errors='replace')
    pattern = r'Yorich|ChatGPT|Codex|Claude|Fact Pack|Evidence ID|Generated by|/Users/|/private/|Bearer\s+[A-Za-z0-9._-]{15,}|-----BEGIN .*PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{24,}'
    check(not re.search(pattern, source, re.I), 'Public provenance or credential pattern in ' + str(file.relative_to(OUT)))
check(any('G-TH3K3HRPNN' in f.read_text(errors='replace') for f in OUT.rglob('*') if f.is_file() and f.suffix in ['.js', '.html']), 'Existing public GA measurement ID was not retained')
print(json.dumps(rows, indent=2))
if errors:
    print('\nFAILED:', *errors, sep='\n- ', file=sys.stderr)
    raise SystemExit(1)
print('PASS: seven routes, rendered content, metadata, navigation, links, schemas, sitemap, assets and public-output scan.')
