import { siteConfig } from "@/config/site";
import type { FaqItem, HomePageDefinition, SeoPageDefinition } from "@/config/types";
import { absoluteUrl } from "./urls";

type Schema = Record<string, unknown>;

function breadcrumbItems(slug: string, title: string, parentSlug?: string | null) {
  const segments = slug.split("/").filter(Boolean);
  const items: Schema[] = [
    { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl() },
  ];

  if (parentSlug) items.push({ "@type": "ListItem", position: 2, name: "Missions", item: absoluteUrl(parentSlug) });

  segments.forEach((segment, index) => {
    const partial = segments.slice(0, index + 1).join("/");
    items.push({
      "@type": "ListItem",
      position: index + (parentSlug ? 3 : 2),
      name: index === segments.length - 1 ? title : segment.replace(/-/g, " "),
      item: absoluteUrl(partial),
    });
  });

  return items;
}

function faqSchema(faq: FaqItem[]): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function homeSchemas(page: HomePageDefinition): Schema[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.siteName,
      url: absoluteUrl(),
      description: siteConfig.description,
      inLanguage: siteConfig.language,
    },
    {
      "@context": "https://schema.org",
      "@type": "VideoGame",
      name: siteConfig.game.name,
      genre: siteConfig.game.genre,
      gamePlatform: ["PlayStation 5", "Xbox Series X|S", "PC (Steam)"],
      datePublished: "2026-10-02",
      author: { "@type": "Organization", name: siteConfig.game.developer },
      url: siteConfig.game.officialUrl,
    },
    faqSchema(page.faq),
  ];
}

export function pageSchemas(page: SeoPageDefinition): Schema[] {
  const schemas: Schema[] = [
    {
      "@context": "https://schema.org",
      "@type": page.pageType === "legal" || page.slug === "missions" ? "WebPage" : "Article",
      name: page.title,
      description: page.description,
      url: absoluteUrl(page.slug),
      dateModified: page.lastReviewed,
      inLanguage: siteConfig.language,
      isPartOf: { "@type": "WebSite", name: siteConfig.siteName, url: absoluteUrl() },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems(page.slug, page.navLabel, page.parentSlug),
    },
  ];

  if (page.faq?.length) schemas.push(faqSchema(page.faq));

  if (page.slug === "missions") {
    const links = page.sections.find((section) => section.id === "list")?.links ?? [];
    schemas.push({ "@context": "https://schema.org", "@type": "ItemList", itemListElement: links.map((link, index) => ({ "@type": "ListItem", position: index + 1, name: link.label, url: absoluteUrl(link.slug) })) });
  }
  return schemas;
}
