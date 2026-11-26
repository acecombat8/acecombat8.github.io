import type { InternalLink } from "@/config/types";

// Navigation order is independent of editorial page order.
export const navigationGroups = [
  { label: "Mission Guides", slugs: ["mission-04", "mission-08", "mission-15", "mission-16", "mission-17", "mission-18", "mission-19", "mission-20", "mission-21", "mission-22", "mission-23", "mission-24", "mission-25", "mission-26", "mission-27", "mission-28-s-rank", "mission-29", "mission-30", "celaeno"] },
  { label: "Aircraft & MRP", slugs: ["best-planes", "best-online-planes", "mrp-farming", "best-parts"] },
  { label: "Collections", slugs: ["assault-records"] },
  { label: "S Rank", slugs: ["s-rank-guide", "mission-28-s-rank"] },
  { label: "Online & Seasons", slugs: ["best-online-planes", "online-season-2"] },
];

export function groupLinks(links: InternalLink[], slugs: string[]) {
  return slugs.flatMap((slug) => {
    const link = links.find((item) => item.slug === slug);
    return link ? [{ ...link, label: slug === "best-planes" ? "Aircraft" : link.label }] : [];
  });
}
