"use client";

import { useEffect, useRef, type ReactNode } from 'react';
import styles from './menu.module.css';
export type RevealProps = { children: ReactNode };
export default function Reveal({ children }: RevealProps) {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = element.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    // El contenido es visible sin JS y durante la hidratación.
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) { node.dataset.revealed = 'true'; observer.unobserve(node); }
      }
    }, { threshold: 0.08 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={element} className={styles.reveal}>{children}</div>;
}
