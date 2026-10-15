import type { Product } from '@/lib/data/products';
export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string; fields?: Record<string, string> };
export type AdminProduct = Product;
export function localImage(src: string) { return src.startsWith('/') ? src : `/${src}`; }
export function hasPhoto(src: string | null | undefined) { return !!src && !['/placeholder.svg', 'placeholder.svg'].includes(src); }
export function formatPrice(value: number) { return `$ ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(value)}`; }
