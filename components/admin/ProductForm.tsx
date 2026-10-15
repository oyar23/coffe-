"use client";
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveProductAction } from '@/app/admin/actions';
import { productSchema } from '@/lib/validation/product';
import type { AdminProduct } from './types';
import { useToast } from './AdminShell';
import ImageUpload from './ImageUpload';
import ProductPreview, { type PreviewProduct } from './ProductPreview';
import styles from './admin.module.css';

type FormValues = PreviewProduct & { orden: string };
export default function ProductForm({ initial, categories, showImages }: { initial?: AdminProduct; categories: string[]; showImages: boolean }) {
  const [form, setForm] = useState<FormValues>({ nombre: initial?.nombre ?? '', descripcion: initial?.descripcion ?? '', categoria: initial?.categoria ?? '', precio: initial?.precio.toString() ?? '', precio_promo: initial?.precio_promo?.toString() ?? '', etiqueta_promo: initial?.etiqueta_promo ?? '', imagen: initial?.imagen ?? '/placeholder.svg', disponible: initial?.disponible ?? true, destacado: initial?.destacado ?? false, orden: initial?.orden.toString() ?? '0', promo: initial?.precio_promo != null });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [promoOpen, setPromoOpen] = useState(initial?.precio_promo != null);
  const toast = useToast();
  const router = useRouter();
  function change<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm(current => ({ ...current, [key]: value }));
    setErrors(current => { const next = { ...current }; delete next[key]; return next; });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending || uploading) return;
    const input = { nombre: form.nombre, descripcion: form.descripcion || null, categoria: form.categoria, precio: Number(form.precio), precio_promo: form.promo ? Number(form.precio_promo) : null, etiqueta_promo: form.promo ? form.etiqueta_promo || null : null, imagen: form.imagen, disponible: form.disponible, destacado: form.destacado, orden: form.orden.trim() ? Number(form.orden) : 0 };
    const result = productSchema.safeParse(input);
    if (!result.success) {
      const messages: Record<string, string> = {};
      const friendly: Record<string, string> = { nombre: 'Ingresá un nombre de hasta 150 caracteres.', categoria: 'Elegí o escribí una categoría de hasta 100 caracteres.', precio: 'Ingresá un precio entero mayor a cero.', descripcion: 'La descripción debe tener hasta 2000 caracteres.', orden: 'El orden debe ser un número entero.', etiqueta_promo: 'La etiqueta debe tener hasta 80 caracteres.' };
      for (const issue of result.error.issues) { const field = issue.path.join('.'); messages[field] ??= friendly[field] || issue.message; }
      if (messages.precio_promo) setPromoOpen(true);
      setErrors(messages); toast('Revisá los campos marcados.', 'error');
      requestAnimationFrame(() => document.getElementById(`product-${Object.keys(messages)[0]}`)?.focus());
      return;
    }
    setPending(true); setErrors({});
    try {
      const saved = await saveProductAction(result.data, initial?.id);
      if (!saved.ok) { setErrors(saved.fields ?? {}); toast(saved.error, 'error'); return; }
      sessionStorage.setItem('coffe-a-notice', initial ? 'Producto actualizado.' : 'Producto creado.');
      router.push('/admin'); router.refresh();
    } catch { toast('No se pudo guardar el producto. Volvé a intentarlo.', 'error'); }
    finally { setPending(false); }
  }
  const error = (name: string) => errors[name] && <span id={`error-${name}`} className={styles.error} role="alert">{errors[name]}</span>;
  const attrs = (name: string) => ({ id: `product-${name}`, 'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `error-${name}` : undefined });
  return <>
    <Link href="/admin" className={styles.breadcrumb}>← Volver a productos</Link>
    <div className={styles.pageHeading}><div><p className={styles.eyebrow}>DALE UN LUGAR EN TU CARTA</p><h1>{initial ? 'Editar producto' : 'Nuevo producto'}</h1><p className={styles.muted}>Contá qué lo hace especial. La foto puede esperar.</p></div></div>
    <form onSubmit={submit} noValidate className={styles.form}>
      <div className={styles.formColumns}><fieldset className={styles.formFields} disabled={pending}>
        <section className={styles.formSection}><div className={styles.formSectionTitle}><span>01</span><h2>Información del producto</h2></div>
          <label className={styles.field} htmlFor="product-nombre">Nombre <span className={styles.required}>*</span><input {...attrs('nombre')} value={form.nombre} onChange={event => change('nombre', event.target.value)} maxLength={150} placeholder="Por ejemplo: Latte de vainilla" required autoComplete="off" />{error('nombre')}</label>
          <label className={styles.field} htmlFor="product-descripcion">Descripción <span className={styles.optional}>opcional</span><textarea {...attrs('descripcion')} value={form.descripcion} onChange={event => change('descripcion', event.target.value)} maxLength={2000} rows={3} placeholder="Ingredientes, sabor o una buena razón para probarlo…" />{error('descripcion')}</label>
          <div className={styles.twoFields}><label className={styles.field} htmlFor="product-categoria">Categoría <span className={styles.required}>*</span><input {...attrs('categoria')} value={form.categoria} onChange={event => change('categoria', event.target.value)} list="product-categories" maxLength={100} placeholder="Elegí o escribí una nueva" required /><datalist id="product-categories">{categories.map(category => <option key={category} value={category} />)}</datalist>{error('categoria')}</label><label className={styles.field} htmlFor="product-precio">Precio en pesos <span className={styles.required}>*</span><input {...attrs('precio')} type="number" inputMode="numeric" min="1" step="1" value={form.precio} onChange={event => change('precio', event.target.value)} placeholder="4500" required />{error('precio')}</label></div>
        </section>
        <section className={styles.formSection}><div className={styles.formSectionTitle}><span>02</span><h2>Foto del producto <span className={styles.optional}>opcional</span></h2></div><ImageUpload value={form.imagen} onChange={value => change('imagen', value)} onBusyChange={setUploading} disabled={pending} />{error('imagen')}</section>
        <section className={styles.formSection}><div className={styles.formSectionTitle}><span>03</span><h2>Cómo aparece en la carta</h2></div><label className={styles.checkField}><input type="checkbox" checked={form.disponible} onChange={event => change('disponible', event.target.checked)} /><span><strong>Disponible</strong><small>Si lo desactivás, se verá como Agotado.</small></span></label><label className={styles.checkField}><input type="checkbox" checked={form.destacado} onChange={event => change('destacado', event.target.checked)} /><span><strong>Destacar producto</strong><small>Aparece primero en su categoría, con la etiqueta Recomendado.</small></span></label><label className={styles.field} htmlFor="product-orden">Orden dentro de la categoría<input {...attrs('orden')} type="number" inputMode="numeric" step="1" value={form.orden} onChange={event => change('orden', event.target.value)} />{error('orden')}<span className={styles.help}>Los números menores aparecen primero.</span></label></section>
        <details className={styles.formSection} open={promoOpen} onToggle={event => setPromoOpen(event.currentTarget.open)}><summary className={styles.promoSummary}>Promoción <span className={styles.optional}>opcional</span><span aria-hidden="true">＋</span></summary><div className={styles.promoFields}><label className={styles.checkField}><input type="checkbox" checked={form.promo} onChange={event => change('promo', event.target.checked)} /><span><strong>Activar precio promocional</strong><small>El precio habitual se mostrará tachado.</small></span></label>{form.promo && <div className={styles.twoFields}><label className={styles.field} htmlFor="product-precio_promo">Precio promocional<input {...attrs('precio_promo')} type="number" inputMode="numeric" min="1" step="1" value={form.precio_promo} onChange={event => change('precio_promo', event.target.value)} />{error('precio_promo')}</label><label className={styles.field} htmlFor="product-etiqueta_promo">Etiqueta<input {...attrs('etiqueta_promo')} value={form.etiqueta_promo} onChange={event => change('etiqueta_promo', event.target.value)} maxLength={80} placeholder="2x1, Especial, Nuevo…" />{error('etiqueta_promo')}</label></div>}</div></details>
      </fieldset><ProductPreview product={form} showImages={showImages} /></div>
      <div className={styles.formFooter}><span className={styles.help}>* Campos obligatorios</span><div><Link href="/admin" className={styles.secondaryButton} onClick={event => { if (pending || uploading) event.preventDefault(); }} aria-disabled={pending || uploading}>Cancelar</Link><button type="submit" className={styles.primaryButton} disabled={pending || uploading}>{pending ? 'Guardando…' : uploading ? 'Subiendo foto…' : initial ? 'Guardar cambios' : 'Crear producto'}</button></div></div>
    </form>
  </>;
}
