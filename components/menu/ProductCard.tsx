import Image from 'next/image';
import type { Product } from '@/lib/data/products';
import PromoBadge from './PromoBadge';
import styles from './menu.module.css';

export type ProductCardProps = { product: Product; showImage?: boolean };
const pesos = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
const price = (value: number) => `$ ${pesos.format(value)}`;

export default function ProductCard({ product, showImage = true }: ProductCardProps) {
  const imageVisible = showImage && !!product.imagen && !['/placeholder.svg', 'placeholder.svg'].includes(product.imagen);
  const promo = product.precio_promo !== null;
  const src = product.imagen ? (product.imagen.startsWith('/') ? product.imagen : `/${product.imagen}`) : '/placeholder.svg';
  return (
    <article className={`${styles.card} ${product.destacado ? styles.featured : ''} ${!product.disponible ? styles.unavailable : ''} ${!imageVisible ? styles.textOnly : ''}`} aria-labelledby={`producto-${product.id}`}>
      {imageVisible && <div className={styles.productImage}>
        <Image src={src} alt={product.nombre} fill sizes="(max-width: 600px) 104px, 144px" loading="lazy" className={styles.photo} />
        {!product.disponible && <span className={styles.soldOut}>Agotado</span>}
      </div>}
      <div className={styles.cardBody}>
        {product.destacado && <span className={styles.recommended}><span aria-hidden="true">✦</span> Recomendado</span>}
        {!imageVisible && !product.disponible && <span className={styles.textSoldOut}>Agotado</span>}
        <h3 id={`producto-${product.id}`}>{product.nombre}</h3>
        {product.descripcion && <p className={styles.description}>{product.descripcion}</p>}
        <div className={styles.priceRow}><div className={styles.prices}>{promo && <del aria-label={`Precio anterior: ${price(product.precio)}`}>{price(product.precio)}</del>}<span className={styles.price}>{price(product.precio_promo ?? product.precio)}</span></div>{(promo || product.etiqueta_promo) && <PromoBadge label={product.etiqueta_promo || 'Promo'} />}</div>
      </div>
    </article>
  );
}
