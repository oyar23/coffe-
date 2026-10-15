"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './admin.module.css';

type Notice = { message: string; kind: 'success' | 'error' };
const ToastContext = createContext<(message: string, kind?: Notice['kind']) => void>(() => {});
export function useToast() { return useContext(ToastContext); }

export default function AdminShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const menuButton = useRef<HTMLButtonElement>(null);
  const toast = useCallback((message: string, kind: Notice['kind'] = 'success') => {
    if (timer.current) clearTimeout(timer.current);
    setNotice({ message, kind });
    timer.current = setTimeout(() => setNotice(null), 5500);
  }, []);
  useEffect(() => {
    setNavOpen(false);
    const message = sessionStorage.getItem('coffe-a-notice');
    if (message) { sessionStorage.removeItem('coffe-a-notice'); toast(message); }
  }, [pathname, toast]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (navOpen) document.querySelector<HTMLAnchorElement>('.admin-nav a')?.focus();
    const close = (event: KeyboardEvent) => { if (navOpen && event.key === 'Escape') { setNavOpen(false); menuButton.current?.focus(); } };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [navOpen]);

  return <ToastContext.Provider value={toast}><div className={styles.root} data-nav-open={navOpen} data-view={pathname === '/admin/productos/nuevo' ? 'new' : 'list'}>
    <div className={styles.topbar}><div className={styles.topbarStart}><button ref={menuButton} type="button" className={styles.menuButton} aria-expanded={navOpen} onClick={() => setNavOpen(value => !value)} aria-label={navOpen ? 'Cerrar navegación' : 'Abrir navegación'}>{navOpen ? '✕' : '☰'}</button><span>ADMINISTRACIÓN <span className={styles.topbarBrand}>/ coffe-a</span></span></div><Link href="/" target="_blank" rel="noreferrer" className={styles.menuLink}>Ver carta <span aria-hidden="true">↗</span></Link></div>
    {navOpen && <button type="button" className={styles.navBackdrop} aria-label="Cerrar navegación" onClick={() => { setNavOpen(false); menuButton.current?.focus(); }} />}
    {children}
    <div className={styles.toastRegion} aria-live="polite" aria-atomic="true">{notice && <div className={styles.toast} data-kind={notice.kind} role={notice.kind === 'error' ? 'alert' : 'status'}><span>{notice.kind === 'error' ? '!' : '✓'}</span><p>{notice.message}</p><button type="button" aria-label="Cerrar aviso" onClick={() => setNotice(null)}>✕</button></div>}</div>
  </div></ToastContext.Provider>;
}
