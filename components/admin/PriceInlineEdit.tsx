"use client";
import { useEffect, useRef, useState } from 'react';
import { updatePriceAction } from '@/app/admin/actions';
import { useToast } from './AdminShell';
import { formatPrice, type AdminProduct } from './types';
import styles from './admin.module.css';
export default function PriceInlineEdit({ product, onSaved, disabled }: { product: AdminProduct; onSaved: (p: AdminProduct) => void; disabled: boolean }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(product.precio));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();
  useEffect(() => { if (editing) { input.current?.focus(); input.current?.select(); } }, [editing]);
  const cancel = () => { setEditing(false); setError(''); setValue(String(product.precio)); };
  const save = async () => {
    if (busy) return;
    const amount = Number(value);
    if (!value.trim() || !Number.isSafeInteger(amount) || amount <= 0) { setError('Ingresá un precio entero mayor a cero.'); return; }
    if (product.precio_promo !== null && amount <= product.precio_promo) { setError('El precio debe ser mayor a la promo activa.'); return; }
    setBusy(true); setError('');
    try {
      const result = await updatePriceAction(product.id, amount);
      if (result.ok) { onSaved(result.data); setEditing(false); toast('Precio actualizado.'); }
      else { setError(result.error); toast(result.error, 'error'); }
    } catch { setError('No se pudo guardar. Reintentá.'); }
    finally { setBusy(false); }
  };
  return <div className={styles.inlinePrice}>{editing ? <><div className={styles.inlineInputRow}><span aria-hidden="true">$</span><input ref={input} type="number" inputMode="numeric" min="1" step="1" value={value} aria-label={`Precio de ${product.nombre}`} aria-invalid={!!error} aria-describedby={error ? `precio-error-${product.id}` : undefined} disabled={busy} onChange={event => setValue(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); void save(); } if (event.key === 'Escape') { event.preventDefault(); if (!busy) cancel(); } }} /><button type="button" className={styles.iconButton} onClick={() => void save()} disabled={busy} aria-label="Guardar precio">{busy ? '…' : '✓'}</button><button type="button" className={styles.iconButton} onClick={cancel} disabled={busy} aria-label="Cancelar precio">✕</button></div>{error && <p id={`precio-error-${product.id}`} className={styles.error} role="alert">{error}</p>}</> : <button className={styles.priceButton} type="button" disabled={disabled} aria-label={`Editar precio de ${product.nombre}: ${formatPrice(product.precio)}`} onClick={() => { setValue(String(product.precio)); setEditing(true); }}>{formatPrice(product.precio)} <span aria-hidden="true">✎</span></button>}</div>;
}
