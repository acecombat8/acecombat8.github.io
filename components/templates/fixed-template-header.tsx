"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { InternalLink } from "@/config/types";
import { assetPath, routePath } from "@/lib/urls";

export function FixedTemplateHeader({ links }: { links: InternalLink[] }) {
  const missions = links.filter((link) => link.slug.startsWith("mission-"));
  const content = <>
    <Link href="/">Home</Link>
    <Link href={routePath("missions")}>Missions</Link>
    <details className="mission-menu">
      <summary>Mission guides</summary>
      <div>{missions.map((link) => <Link key={link.slug} href={routePath(link.slug)}>{link.label}</Link>)}</div>
    </details>
    <Link href={routePath("mrp-farming")}>MRP Farming</Link>
    <Link href={routePath("best-planes")}>Best Planes</Link>
  </>;
  return <header className="guide-header" onClick={(event) => {
    if ((event.target as HTMLElement).closest("a")) {
      event.currentTarget.querySelectorAll("details").forEach((menu) => { menu.open = false; });
    }
  }}>
    <div className="site-container guide-header-row">
      <Link href="/" className="guide-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={assetPath(siteConfig.assets.logo)} alt="" width="36" height="36" />
        <span>{siteConfig.shortName}</span>
      </Link>
      <nav className="guide-desktop-nav" aria-label="Primary navigation">{content}</nav>
      <details className="guide-mobile-menu">
        <summary>Menu</summary>
        <nav aria-label="Mobile navigation">{content}</nav>
      </details>
    </div>
  </header>;
}
