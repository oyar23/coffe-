"use client";
import { useEffect, useState } from "react";
export function useMotion() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!query.matches && !document.hidden);
    update();
    query.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      query.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return enabled;
}
