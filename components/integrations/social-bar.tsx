"use client";

import { useEffect } from "react";
import { adsterra } from "@/config/adsterra";

export function SocialBar() {
  useEffect(() => {
    // Document lifetime lock survives Strict Mode, route changes and remounts.
    // Keep this global script alive; Adsterra owns its floating UI.
    if (document.documentElement.dataset.adsterraSocialBar === "initialized") return;
    document.documentElement.dataset.adsterraSocialBar = "initialized";
    const script = document.createElement("script");
    script.id = "adsterra-social-bar";
    script.setAttribute("data-cfasync", adsterra.socialBar["data-cfasync"]);
    script.src = adsterra.socialBar.src;
    document.body.appendChild(script);
  }, []);

  return null;
}
