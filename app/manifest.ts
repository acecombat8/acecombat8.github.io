import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { themes } from "@/config/themes";
import { assetPath } from "@/lib/urls";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const theme = themes[siteConfig.theme.preset];
  const tokens = { ...theme?.tokens, ...siteConfig.theme.overrides };
  return {
    name: siteConfig.siteName,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: assetPath("/"),
    display: "standalone",
    background_color: `hsl(${tokens.background})`,
    theme_color: `hsl(${tokens.primary})`,
    icons: [{ src: assetPath(siteConfig.assets.logo), sizes: "354x328", type: "image/png" }],
  };
}
