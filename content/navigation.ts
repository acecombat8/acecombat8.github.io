import type { InternalLink } from "@/config/types";

// Navigation order is independent of editorial page order.
export const navigationGroups = [
  { label: "Mission Guides", slugs: ["mission-08", "mission-15", "mission-16", "mission-17", "mission-18", "mission-22", "mission-23", "mission-24", "mission-25", "mission-26", "mission-27", "mission-28-s-rank", "mission-29", "mission-30"] },
  { label: "Aircraft & MRP", slugs: ["best-planes", "mrp-farming"] },
  { label: "S Rank", slugs: ["s-rank-guide", "mission-28-s-rank"] },
];

export function groupLinks(links: InternalLink[], slugs: string[]) {
  return slugs.flatMap((slug) => {
    const link = links.find((item) => item.slug === slug);
    return link ? [{ ...link, label: slug === "best-planes" ? "Aircraft" : link.label }] : [];
  });
}
