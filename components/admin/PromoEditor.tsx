"use client";
import { useState, type FormEvent } from 'react';
import { savePromoAction } from '@/app/admin/actions';
import { useToast } from './AdminShell';
import Modal from './Modal';
import { formatPrice, type AdminProduct } from './types';
import styles from './admin.module.css';
export default function PromoEditor({ product, onClose, onSaved }: { product: AdminProduct; onClose: () => void; onSaved: (p: AdminProduct) => void }) {
  const [price, setPrice] = useState(product.precio_promo?.toString() ?? '');
  const [label, setLabel] = useState(product.etiqueta_promo ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  async function save(remove = false) {
    const amount = Number(price);
    if (!remove && (!price.trim() || !Number.isSafeInteger(amount) || amount <= 0 || amount >= product.precio)) { setError(`Usá un entero mayor a cero y menor a ${formatPrice(product.precio)}.`); return; }
    setBusy(true); setError('');
    try { const result = await savePromoAction(product.id, remove ? null : amount, remove ? null : label || null);
      if (result.ok) { onSaved(result.data); toast(remove ? 'Promo desactivada.' : 'Promo guardada.'); onClose(); }
      else setError(result.fields?.precio_promo || result.error);
    } catch { setError('No se pudo guardar la promo. Reintentá.'); }
    finally { setBusy(false); }
  }
  return <Modal title={`Promo · ${product.nombre}`} busy={busy} onClose={onClose}><form onSubmit={(event: FormEvent) => { event.preventDefault(); void save(); }} className={styles.dialogBody}>
    <p className={styles.muted}>Precio habitual: {formatPrice(product.precio)}</p>
    <label className={styles.field}>Precio promocional<input type="number" inputMode="numeric" min="1" max={product.precio - 1} step="1" value={price} onChange={event => setPrice(event.target.value)} required autoFocus disabled={busy} /></label>
    <label className={styles.field}>Etiqueta <span className={styles.optional}>opcional</span><input value={label} onChange={event => setLabel(event.target.value)} placeholder="Por ejemplo: 2x1 o Especial" maxLength={80} disabled={busy} /></label>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <div className={styles.dialogActions}>{product.precio_promo !== null && <button className={styles.secondaryButton} type="button" onClick={() => void save(true)} disabled={busy}>Quitar promo</button>}<button className={styles.primaryButton} disabled={busy}>{busy ? 'Guardando…' : 'Guardar promo'}</button></div>
  </form></Modal>;
}
