"use client";
import { useEffect, useRef, type ReactNode } from 'react';
import styles from './admin.module.css';
export default function Modal({ title, onClose, children, busy = false }: { title: string; onClose: () => void; children: ReactNode; busy?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const node = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    node?.showModal();
    return () => { node?.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="admin-dialog-title" onCancel={event => { event.preventDefault(); if (!busy) close.current(); }} onClick={event => { if (event.target === event.currentTarget && !busy) close.current(); }}>
    <div className={styles.dialogHeader}><h2 id="admin-dialog-title">{title}</h2><button type="button" className={styles.iconButton} disabled={busy} onClick={onClose} aria-label="Cerrar">✕</button></div>{children}
  </dialog>;
}
