import Link from "next/link";
import { ResponsiveBanner } from "@/components/integrations/responsive-banner";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Faq } from "@/components/site/faq";
import { JsonLd } from "@/components/site/json-ld";
import { PageSections } from "@/components/site/page-sections";
import { RelatedPages } from "@/components/site/related-pages";
import type { SeoPageDefinition } from "@/config/types";
import { getRelatedPages } from "@/content/registry";
import { pageSchemas } from "@/lib/schema";
import { routePath } from "@/lib/urls";

export function FixedTemplateInner({ page }: { page: SeoPageDefinition }) {
  const quickRoute = page.hero.quickRoute?.length ? <div className="guide-quick-route"><p className="eyebrow">Quick route</p><ol>{page.hero.quickRoute.map((step) => <li key={step}>{step}</li>)}</ol></div> : null;
  return <>
    <JsonLd data={pageSchemas(page)} />
    <main className="guide-main site-container">
      <Breadcrumbs slug={page.slug} current={page.navLabel} parentSlug={page.parentSlug} />
      <header className="guide-hero">
        <p className="eyebrow">{page.hero.eyebrow}</p>
        <h1>{page.hero.heading}</h1>
        {page.hero.answerFirst ? quickRoute : null}
        <p className="section-lead">{page.hero.lead}</p>
        <div className="guide-actions">
          <a className="button-primary" href={`#${page.sections[0].id}`}>Read the guide</a>
          {page.hero.quickLinks?.map((link) => <Link className="button-secondary" key={link.slug} href={routePath(link.slug)}>{link.label}</Link>)}
        </div>
        {!page.hero.answerFirst ? quickRoute : null}
        {page.hero.answerFirst ? <p className="guide-date">Reviewed <time dateTime={page.lastReviewed}>{page.lastReviewed}</time></p> : <p className="guide-date">Updated <time dateTime={page.lastReviewed}>{page.lastReviewed}</time></p>}
      </header>
      <ResponsiveBanner />
      <div className="guide-layout">
        <aside className="guide-toc" aria-label="On this page"><p className="eyebrow">On this page</p><ul>{page.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.heading}</a></li>)}{page.faq?.length ? <li><a href="#faq">FAQ</a></li> : null}</ul></aside>
        <article className="guide-article"><PageSections sections={page.sections} nativeAdPlacement={page.slug === "missions" || page.slug === "mrp-farming" ? "after-first-paragraph" : "after-first-section"} />{page.faq?.length ? <Faq items={page.faq} heading={`${page.navLabel} FAQ`} /> : null}<RelatedPages pages={getRelatedPages(page)} /></article>
      </div>
    </main>
  </>;
}
