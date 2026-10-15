"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Background as Config } from "@/lib/data/settings";
import { registry } from "./registry";
import { fontStylesheet } from "./fonts";
import styles from "./background.module.css";
const Video = dynamic(() => import("./VideoBackground"), { ssr: false });
const Lottie = dynamic(() => import("./LottieBackground"), { ssr: false });
export default function Background({
  background: initial,
}: {
  background: Config;
}) {
  const [draft, setDraft] = useState<Config | null>(null);
  const background = draft ?? initial;
  useEffect(() => {
    if (window.parent === window) return;
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== location.origin ||
        event.source !== window.parent ||
        event.data?.type !== "coffe-brand-preview"
      )
        return;
      const { theme, background: next } = event.data;
      setDraft(next);
      for (const key of ["primary", "secondary", "text"])
        document.body.style.setProperty(`--color-${key}`, theme[key]);
      document.body.style.setProperty("--font-main", theme.font);
      const logo = document.querySelector<HTMLImageElement>("header img");
      if (logo) {
        logo.src = theme.logo || "/placeholder.svg";
      }
    };
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: "coffe-brand-ready" }, location.origin);
    return () => window.removeEventListener("message", receive);
  }, []);
  const Component =
    background.type === "component" && Object.hasOwn(registry, background.src)
      ? registry[background.src as keyof typeof registry]
      : null;
  return (
    <>
      <link rel="stylesheet" href={fontStylesheet} />
      <div aria-hidden="true" className={styles.root}>
        {background.type === "image" && (
          <div
            className={styles.cover}
            style={{
              backgroundImage: `url(${JSON.stringify(background.src)})`,
            }}
          />
        )}
        {background.type === "video" && <Video src={background.src} />}
        {background.type === "lottie" && <Lottie src={background.src} />}
        {Component && <Component />}
        <div
          className={styles.overlay}
          style={{ opacity: Math.max(0, Math.min(1, background.overlay)) }}
        />
      </div>
    </>
  );
}
