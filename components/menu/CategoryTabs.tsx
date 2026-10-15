"use client";

import { useEffect, useRef, useState } from 'react';
import styles from './menu.module.css';
export type CategoryTabsProps = { categories: { id: string; nombre: string }[] };

export default function CategoryTabs({ categories }: CategoryTabsProps) {
  const [active, setActive] = useState(categories[0]?.id);
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const threshold = (nav.current?.getBoundingClientRect().height ?? 76) + 36;
      let current = categories[0]?.id;
      for (const category of categories) {
        const section = document.getElementById(category.id);
        if (section && section.getBoundingClientRect().top <= threshold) current = category.id;
      }
      if (window.scrollY > 0 && Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2) current = categories.at(-1)?.id ?? current;
      setActive(current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame); };
  }, [categories]);

  useEffect(() => {
    // Desplazar solo el carril horizontal, sin mover la página al cambiar el chip activo.
    const link = nav.current?.querySelector<HTMLAnchorElement>(`a[href="#${active}"]`);
    const rail = link?.parentElement;
    if (link && rail) {
      const left = link.offsetLeft;
      if (left < rail.scrollLeft || left + link.offsetWidth > rail.scrollLeft + rail.clientWidth) {
        rail.scrollTo({ left: left - (rail.clientWidth - link.offsetWidth) / 2, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      }
    }
  }, [active]);

  return <nav ref={nav} className={styles.categoryNav} aria-label="Categorías de la carta"><div className={styles.categoryRail}>{categories.map(category => <a key={category.id} href={`#${category.id}`} className={`${styles.categoryChip} ${active === category.id ? styles.activeChip : ''}`} aria-current={active === category.id ? 'location' : undefined} onClick={event => {
    const target = document.getElementById(category.id);
    if (!target) return;
    event.preventDefault();
    history.replaceState(null, '', `#${category.id}`);
    setActive(category.id);
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }}>{category.nombre}</a>)}</div></nav>;
}
