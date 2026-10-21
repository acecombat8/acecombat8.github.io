"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { siteConfig } from "@/config/site";
import type { InternalLink } from "@/config/types";
import { navigationGroups, groupLinks } from "@/content/navigation";
import { assetPath, routePath } from "@/lib/urls";

export function FixedTemplateHeader({ links }: { links: InternalLink[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const close = () => { setOpen(false); setExpanded(null); };

  useEffect(() => {
    if (!open) return;
    const mobile = window.matchMedia("(max-width: 1023px)");
    const previousOverflow = document.body.style.overflow;
    const syncScroll = () => {
      document.body.style.overflow = open && mobile.matches ? "hidden" : previousOverflow;
    };
    syncScroll();
    mobile.addEventListener("change", syncScroll);
    return () => {
      document.body.style.overflow = previousOverflow;
      mobile.removeEventListener("change", syncScroll);
    };
  }, [open]);

  useEffect(() => {
    function outside(event: PointerEvent) {
      if (!header.current?.contains(event.target as Node)) { setOpen(false); setExpanded(null); }
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);

  return <>{open ? <button className="guide-nav-backdrop" aria-label="Close navigation backdrop" tabIndex={-1} onClick={close} /> : null}<header ref={header} className="guide-header" onKeyDown={(event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (expanded) { setExpanded(null); lastTrigger.current?.focus(); }
      else if (open) { setOpen(false); toggle.current?.focus(); }
    }
  }} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
  }}>
    <div className="site-container guide-header-row">
      <Link href={routePath("")} className="guide-brand" onClick={close}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={assetPath(siteConfig.assets.logo)} alt="" width="36" height="36" />
        <span>{siteConfig.shortName}</span>
      </Link>
      <Link className="guide-mobile-missions" href={routePath("missions")} onClick={close}>Missions</Link>
      <button ref={toggle} type="button" className="guide-nav-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="guide-navigation" onClick={() => { setOpen(!open); setExpanded(null); }}>
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}<span>Menu</span>
      </button>
      <nav id="guide-navigation" className={`guide-navigation${open ? " is-open" : ""}`} aria-label="Primary navigation">
        <Link className="guide-mobile-home" href={routePath("")} onClick={close}>Home</Link>
        <Link href={routePath("missions")} onClick={close}>Missions</Link>
        {navigationGroups.map((group, index) => <div className={`guide-nav-group${index === 1 ? " guide-tools-group" : ""}`} key={group.label}>
          <button type="button" aria-expanded={expanded === group.label} aria-controls={`guide-group-${index}`} onClick={(event) => {
            lastTrigger.current = event.currentTarget;
            setExpanded(expanded === group.label ? null : group.label);
          }}>{group.label}<ChevronDown size={14} aria-hidden="true" /></button>
          <div id={`guide-group-${index}`} className={`guide-nav-panel${expanded === group.label ? " is-expanded" : ""}`}>
            {groupLinks(links, group.slugs).map((link) => <Link key={link.slug} href={routePath(link.slug)} onClick={close}>{link.label}</Link>)}
          </div>
        </div>)}
      </nav>
    </div>
  </header></>;
}
