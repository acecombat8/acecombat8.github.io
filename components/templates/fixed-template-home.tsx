import Link from "next/link";
import { ResponsiveBanner } from "@/components/integrations/responsive-banner";
import { Faq } from "@/components/site/faq";
import { JsonLd } from "@/components/site/json-ld";
import { PageSections } from "@/components/site/page-sections";
import { siteConfig } from "@/config/site";
import type { HomePageDefinition } from "@/config/types";
import { homeSchemas } from "@/lib/schema";
import { assetPath, routePath } from "@/lib/urls";

export function FixedTemplateHome({ home }: { home: HomePageDefinition }) {
  return <>
    <JsonLd data={homeSchemas(home)} />
    <main className="guide-main site-container">
      <header className="guide-hero guide-home-hero">
        <div className="guide-hero-copy">
          <p className="eyebrow">{home.hero.eyebrow}</p>
          <h1>{home.hero.heading}</h1>
          <p className="section-lead">{home.hero.lead}</p>
          <ul className="guide-fact-chips" aria-label="Game facts"><li>Released October 2, 2026</li><li>PS5 · Xbox Series X|S · Steam PC</li></ul>
          <p>{home.hero.supportingText}</p>
          <div className="guide-actions">
            {home.hero.primaryLink ? <Link className="button-primary" href={routePath(home.hero.primaryLink.slug)}>{home.hero.primaryLink.label}</Link> : null}
            {home.hero.quickLinks?.map((link) => <Link key={link.slug} className="button-secondary" href={routePath(link.slug)}>{link.label}</Link>)}
          </div>
          {home.hero.secondaryLink ? <a className="guide-source" href={home.hero.secondaryLink.url}>{home.hero.secondaryLink.label}</a> : null}
        </div>
        <div className="guide-hero-banner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assetPath(siteConfig.assets.cover)} alt="Ace Combat 8: Wings of Theve aircraft carrier banner" width={460} height={215} fetchPriority="high" />
        </div>
      </header>
      <ResponsiveBanner />
      <div className="guide-layout">
        <aside className="guide-toc" aria-label="On this page"><p className="eyebrow">On this page</p><ul>{home.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.heading}</a></li>)}<li><a href="#faq">Ace Combat 8 FAQ</a></li></ul></aside>
        <article className="guide-article"><PageSections sections={home.sections} nativeAdPlacement="after-first-section" /><Faq items={home.faq} heading="Ace Combat 8 FAQ" /></article>
      </div>
    </main>
  </>;
}
