"use client";

import { usePathname } from "next/navigation";
import { adsterra } from "@/config/adsterra";
import { AdFrame } from "./ad-frame";

export function NativeAdClient() {
  const pathname = usePathname();
  return <aside className="ad-slot ad-native" data-ad-slot="native" aria-label="Advertisement">
    <span className="ad-label">Advertisement</span>
    <AdFrame key={pathname} code={adsterra.nativeBanner} title="Advertisement recommendations" height={180} autoHeight />
  </aside>;
}
