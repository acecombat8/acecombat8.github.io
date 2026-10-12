# Ace Combat 8 Guide

Independent English fan guide for [ACE COMBAT 8: WINGS OF THEVE](https://acecombat8.github.io/). The site uses Next.js, React and TypeScript with static HTML export for GitHub Pages.

The seven editorial routes are `/`, `/missions/`, `/mission-16/`, `/mission-26/`, `/mission-28-s-rank/`, `/mrp-farming/` and `/best-planes/`. Existing informational and legal pages are excluded from the sitemap and marked noindex.

## Local checks

```sh
npm ci
npm run typecheck
npm run lint
npm run build
npm run qa
```

The build creates `out/`, including `.nojekyll`. Serve this directory with any static web server to inspect the finished site.

## Source archive

```sh
npm run package
```

This creates `release/ace-combat-8-source.zip` with the source, content, assets, lockfile and deployment workflow inside an `ace-combat-8/` folder. It excludes dependencies, build output, caches, Git history, environment files and local credentials. Packaging does not rebuild the site and requires the `zip` command available on macOS and Linux.

## GitHub Pages

Use the `acecombat8.github.io` repository and select **Settings → Pages → Source → GitHub Actions**. The included workflow checks, exports and deploys `out/` on pushes to `main` or manual dispatch. This organization site uses an empty base path and no CNAME.

The public Google Analytics measurement ID is configured in `content/generated/integrations.json`. Bing verification uses the existing workflow environment settings. Never put private credentials into public content or assets.

Adsterra configuration is in `config/adsterra.ts`. Each page has one responsive Banner (320×50 below 768px, otherwise 728×90) and one Native slot. Social Bar initializes once per browser document. Legacy native-script environment settings do not control the ad slots.

## Content and assets

Edit `content/generated/home.json` and `content/generated/pages.json`; the typed renderer supports sections, subsections, checklists, tables, internal links, public source links and visible FAQs. Every guide includes its actual edit date and source links. No fixed rank cutoff, aircraft price or farming payout is promised.

The aircraft emblem, abstract cover and PNG social preview are original site graphics. They are not gameplay screenshots or official publisher artwork. The bundled fonts retain their license notice. Game names and trademarks belong to their respective owners; this guide is not affiliated with the publisher.
