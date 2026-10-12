"use client";

import { useEffect, useRef } from "react";

export function AdFrame({ code, title, width, height, autoHeight = false }: {
  code: string;
  title: string;
  width?: number;
  height: number;
  autoHeight?: boolean;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  function resizeNative() {
    if (!autoHeight) return;
    observerRef.current?.disconnect();
    const frame = frameRef.current;
    const body = frame?.contentDocument?.body;
    if (!frame || !body) return;
    const resize = () => {
      frame.style.height = `${Math.max(height, Math.ceil(body.getBoundingClientRect().height), body.scrollHeight)}px`;
    };
    resize();
    observerRef.current = new ResizeObserver(resize);
    observerRef.current.observe(body);
  }

  // Browser parsing preserves the official scripts, including document.write
  // and atOptions. Globals and timers die when the route's frame is removed.
  // Only trusted constants from config/adsterra.ts are passed here; no eval.
  return <iframe
    ref={frameRef}
    title={title}
    width={width}
    height={height}
    className="ad-frame"
    onLoad={resizeNative}
    srcDoc={`<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;padding:0;background:transparent}</style></head><body>${code}</body></html>`}
  />;
}
