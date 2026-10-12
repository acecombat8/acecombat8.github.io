"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { adsterra } from "@/config/adsterra";
import { AdFrame } from "./ad-frame";

export function ResponsiveBanner() {
  const pathname = usePathname();
  const [selection, setSelection] = useState<{ pathname: string; desktop: boolean } | null>(null);

  useEffect(() => {
    // Select once per page visit, after hydration. Resize does not request a
    // second ad; a new route selects again using its current viewport.
    const task = requestAnimationFrame(() => {
      setSelection({ pathname, desktop: window.matchMedia("(min-width: 768px)").matches });
    });
    return () => cancelAnimationFrame(task);
  }, [pathname]);

  const active = selection?.pathname === pathname ? selection : null;
  return <aside className="ad-slot ad-banner" data-ad-slot="banner" data-size={active ? (active.desktop ? "728x90" : "320x50") : undefined} aria-label="Advertisement">
    <span className="ad-label">Advertisement</span>
    <div className="ad-banner-space">
      {active ? <AdFrame
        key={pathname}
        code={active.desktop ? adsterra.desktopBanner : adsterra.mobileBanner}
        title="Advertisement banner"
        width={active.desktop ? 728 : 320}
        height={active.desktop ? 90 : 50}
      /> : null}
    </div>
  </aside>;
}
