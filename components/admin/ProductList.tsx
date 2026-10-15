"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { deleteProductAction, setDisponibleAction, setPhotosAction } from '@/app/admin/actions';
import { useToast } from './AdminShell';
import PriceInlineEdit from './PriceInlineEdit';
import PromoEditor from './PromoEditor';
import Modal from './Modal';
import { formatPrice, hasPhoto, localImage, type AdminProduct } from './types';
import styles from './admin.module.css';

export default function ProductList({ initialProducts, showProductImages }: { initialProducts: AdminProduct[]; showProductImages: boolean }) {
  const [products, setProducts] = useState(initialProducts);
  const [photos, setPhotos] = useState(showProductImages);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [promo, setPromo] = useState<AdminProduct | null>(null);
  const [toDelete, setToDelete] = useState<AdminProduct | null>(null);
  const toast = useToast();
  const [deleteError, setDeleteError] = useState('');
  useEffect(() => setProducts(initialProducts), [initialProducts]);
  useEffect(() => setPhotos(showProductImages), [showProductImages]);
  const categories = useMemo(() => [...new Set(products.map(p => p.categoria))], [products]);
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filtered = products.filter(p => (!category || p.categoria === category) && normalize(p.nombre).includes(normalize(query.trim())));
  const groups = categories.map(categoria => ({ categoria, productos: filtered.filter(p => p.categoria === categoria) })).filter(g => g.productos.length);
  const patch = (product: AdminProduct) => setProducts(current => current.map(p => p.id === product.id ? product : p));
  async function availability(product: AdminProduct) {
    setBusy(product.id);
    try { const result = await setDisponibleAction(product.id, !product.disponible); if (result.ok) { patch(result.data); toast(result.data.disponible ? 'Producto disponible.' : 'Producto marcado como agotado.'); } else toast(result.error, 'error'); }
    catch { toast('No se pudo cambiar la disponibilidad.', 'error'); }
    finally { setBusy(null); }
  }
  async function togglePhotos() {
    setBusy('photos');
    try { const result = await setPhotosAction(!photos); if (result.ok) { setPhotos(result.data.showProductImages); toast(result.data.showProductImages ? 'Fotos activadas en la carta.' : 'Fotos ocultas en la carta.'); } else toast(result.error, 'error'); }
    catch { toast('No se pudo cambiar la visibilidad de fotos.', 'error'); }
    finally { setBusy(null); }
  }
  async function remove() {
    if (!toDelete) return;
    const product = toDelete;
    setDeleteError('');
    setBusy(product.id);
    try { const result = await deleteProductAction(product.id); if (result.ok) { setProducts(current => current.filter(p => p.id !== product.id)); setToDelete(null); toast('Producto eliminado.'); } else setDeleteError(result.error); }
    catch { setDeleteError('No se pudo eliminar el producto.'); }
    finally { setBusy(null); }
  }
  return <>
    <div className={styles.pageHeading}><div><p className={styles.eyebrow}>TU CARTA, SIEMPRE AL DÍA</p><h1>Productos<span className={styles.count}>{products.length}</span></h1><p className={styles.muted}>Precios, promos y disponibilidad en un solo lugar.</p></div><Link href="/admin/productos/nuevo" className={styles.primaryButton}>＋ Nuevo producto</Link></div>
    <div className={styles.stats}><div><span>En la carta</span><strong>{products.length}</strong></div><div><span>Disponibles</span><strong>{products.filter(p => p.disponible).length}</strong></div><div><span>Con promo</span><strong>{products.filter(p => p.precio_promo !== null).length}</strong></div></div>
    <section className={styles.photoSetting} aria-labelledby="photo-setting-title"><div><h2 id="photo-setting-title">Fotos en la carta</h2><p>{photos ? 'Se muestran las fotos cargadas. Los productos sin foto conservan su diseño de texto.' : 'Carta sin fotos. Podés cargarlas ahora y activarlas cuando estén listas.'}</p></div><button className={styles.switch} type="button" role="switch" aria-checked={photos} aria-label="Mostrar fotos de productos en la carta" onClick={() => void togglePhotos()} disabled={!!busy}><span /></button></section>
    <div className={styles.filterPanel}><label className={styles.search}><span aria-hidden="true">⌕</span><input type="search" aria-label="Buscar producto por nombre" placeholder="Buscar un producto…" value={query} onChange={event => setQuery(event.target.value)} /></label><div className={styles.chips} aria-label="Filtrar por categoría"><button type="button" aria-pressed={!category} onClick={() => setCategory('')} className={!category ? styles.selectedChip : ''}>Todas</button>{categories.map(c => <button key={c} type="button" aria-pressed={category === c} className={category === c ? styles.selectedChip : ''} onClick={() => setCategory(c)}>{c}</button>)}</div></div>
    <div className={styles.listMeta}><span>{filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}</span><span>Tocá un precio para editarlo</span></div>
    {groups.length === 0 ? <div className={styles.empty}><h2>{products.length ? 'No encontramos productos.' : 'Tu carta empieza acá.'}</h2><p>{products.length ? 'Probá con otro nombre o categoría.' : 'Cargá tu primer producto. La foto es opcional.'}</p>{products.length ? <button type="button" className={styles.secondaryButton} onClick={() => { setQuery(''); setCategory(''); }}>Limpiar filtros</button> : <Link href="/admin/productos/nuevo" className={styles.primaryButton}>Crear producto</Link>}</div> : groups.map(group => <section key={group.categoria} className={styles.productGroup} aria-label={group.categoria}><div className={styles.groupTitle}><h2>{group.categoria}</h2><span>{group.productos.length}</span></div><div className={styles.productRows}>{group.productos.map(product => <article key={product.id} className={styles.productRow}>
      <div className={styles.productIdentity}>{hasPhoto(product.imagen) ? <Image src={localImage(product.imagen)} alt="" width={56} height={56} className={styles.thumbnail} unoptimized /> : <div className={styles.noThumbnail} aria-label="Sin foto">☕</div>}<div><h3>{product.nombre}{product.destacado && <span className={styles.star} aria-label="Recomendado">✦</span>}</h3><p>{product.descripcion || 'Sin descripción'}</p>{product.precio_promo !== null && <span className={styles.smallPromo}>{product.etiqueta_promo || 'Promo'} · {formatPrice(product.precio_promo)}</span>}</div></div>
      <div className={styles.rowPrice}><span className={styles.mobileLabel}>Precio</span><PriceInlineEdit product={product} disabled={!!busy} onSaved={patch} /></div>
      <div className={styles.rowAvailability}><button type="button" className={styles.availabilityButton} role="switch" aria-checked={product.disponible} aria-label={`${product.disponible ? 'Disponible' : 'Agotado'}: ${product.nombre}`} onClick={() => void availability(product)} disabled={!!busy}><span className={styles.miniSwitch} data-on={product.disponible}><span /></span>{busy === product.id ? 'Guardando…' : product.disponible ? 'Disponible' : 'Agotado'}</button></div>
      <div className={styles.rowActions}><button className={product.precio_promo !== null ? styles.promoButtonActive : styles.secondaryButton} type="button" onClick={() => setPromo(product)} disabled={!!busy} aria-label={`${product.precio_promo !== null ? 'Promo activa' : 'Promo'} de ${product.nombre}`}>{product.precio_promo !== null ? 'Promo activa' : <><span aria-hidden="true">＋</span> Promo</>}</button><Link href={`/admin/productos/${product.id}`} className={styles.editButton} aria-label={`Editar ${product.nombre}`}>Editar</Link><button className={styles.iconButton} type="button" onClick={() => { setDeleteError(''); setToDelete(product); }} disabled={!!busy} aria-label={`Eliminar ${product.nombre}`}>⌫</button></div>
    </article>)}</div></section>)}
    {promo && <PromoEditor product={promo} onClose={() => setPromo(null)} onSaved={patch} />}
    {toDelete && <Modal title="Eliminar producto" onClose={() => setToDelete(null)} busy={!!busy}><div className={styles.dialogBody}><p>¿Eliminar <strong>{toDelete.nombre}</strong> de la carta?</p><p className={styles.muted}>Esta acción no se puede deshacer. También podés marcarlo como agotado para conservarlo.</p>{deleteError && <p className={styles.error} role="alert">{deleteError}</p>}<div className={styles.dialogActions}><button type="button" className={styles.secondaryButton} disabled={!!busy} onClick={() => setToDelete(null)}>Cancelar</button><button type="button" className={styles.primaryButton} disabled={!!busy} onClick={() => void remove()}>{busy ? 'Eliminando…' : 'Eliminar producto'}</button></div></div></Modal>}
  </>;
}
