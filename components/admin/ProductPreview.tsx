import Image from 'next/image';
import { formatPrice, hasPhoto, localImage } from './types';
import styles from './admin.module.css';
export type PreviewProduct = { nombre: string; descripcion: string; categoria: string; precio: string; precio_promo: string; etiqueta_promo: string; imagen: string; disponible: boolean; destacado: boolean; promo: boolean };
export default function ProductPreview({ product, showImages }: { product: PreviewProduct; showImages: boolean }) {
  const price = Number(product.precio);
  const promoPrice = Number(product.precio_promo);
  const promo = product.promo && promoPrice > 0 && promoPrice < price;
  return <aside className={styles.previewPanel}><p className={styles.eyebrow}>ASÍ SE VERÁ EN TU CARTA</p><h2>Vista previa</h2><p className={styles.muted}>Los cambios se guardan cuando confirmás el formulario.</p><span className={styles.previewCategory}>{product.categoria.trim() || 'Categoría'}</span><article className={`${styles.previewCard} ${product.destacado ? styles.previewFeatured : ''}`}>
    {showImages && hasPhoto(product.imagen) && <Image src={localImage(product.imagen)} width={320} height={210} alt={product.nombre || 'Producto'} className={styles.previewPhoto} unoptimized />}
    <div className={styles.previewBody}>{product.destacado && <span className={styles.previewRecommended}>✦ Recomendado</span>}<h3>{product.nombre.trim() || 'Nombre del producto'}</h3><p className={styles.previewDescription}>{product.descripcion.trim() || 'Una breve descripción de lo que hace especial a este producto.'}</p><div className={styles.previewPrices}>{promo && <del>{formatPrice(price)}</del>}<strong>{price > 0 ? formatPrice(promo ? promoPrice : price) : '$ —'}</strong>{promo && <span className={styles.smallPromo}>{product.etiqueta_promo || 'Promo'}</span>}</div>{!product.disponible && <span className={styles.previewSoldOut}>Agotado</span>}</div>
  </article>{!showImages && <p className={styles.help}>Las fotos están ocultas para toda la carta. Podés activarlas desde Productos.</p>}</aside>;
}
