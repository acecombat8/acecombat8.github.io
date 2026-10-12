import type { ThemeConfig, ThemePresetName } from "./types";

export const themes: Partial<Record<ThemePresetName, ThemeConfig>> = {
  "obsidian-red": {
    name: "obsidian-red" as ThemePresetName,
    label: "Site Theme",
    description: "Selected site theme",
    tokens: {
  "background": "50 17% 7%",
  "foreground": "0 0% 99%",
  "card": "50 17% 12%",
  "card-foreground": "0 0% 99%",
  "primary": "46 50% 56%",
  "primary-foreground": "0 0% 0%",
  "secondary": "50 17% 18%",
  "muted": "50 17% 15%",
  "muted-foreground": "0 0% 99%",
  "border": "50 17% 23%",
  "radius": ".75rem",
  "card-shadow": "0 22px 70px hsl(46 50% 56% / .16)",
  "hero-gradient": "radial-gradient(circle at 78% 14%, hsl(46 50% 56% / .2), transparent 36%)",
  "background-pattern": "radial-gradient(hsl(46 50% 56% / .05) 1px, transparent 1px)",
  "font-sans": "\"Inter\", ui-sans-serif, system-ui, sans-serif",
  "font-heading": "\"Cormorant Garamond\", Georgia, Cambria, serif",
  "heading-weight": "600",
  "heading-letter-spacing": "-0.02em"
},
  },
};
