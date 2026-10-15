"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createProduct, updateProduct, updatePrice, togglePromo, deleteProduct, type Product } from '@/lib/data/products';
import { setMenuDisplay, type MenuDisplay } from '@/lib/data/menu-display';
import { productSchema } from '@/lib/validation/product';
import type { ActionResult } from '@/components/admin/types';

const idSchema = z.string().uuid('El identificador del producto no es válido');
function refresh() { revalidatePath('/'); revalidatePath('/admin'); }
function failure(error: unknown): { ok: false; error: string; fields?: Record<string, string> } {
  if (error instanceof z.ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of error.issues) fields[issue.path.join('.')] ??= issue.message;
    return { ok: false, error: 'Revisá los datos ingresados.', fields };
  }
  if (error instanceof Error && error.message === 'Producto no encontrado') return { ok: false, error: error.message };
  console.error('Error al guardar en admin:', error);
  return { ok: false, error: 'No se pudo guardar el cambio. Volvé a intentarlo.' };
}

export async function saveProductAction(input: unknown, id?: string): Promise<ActionResult<{ id: string }>> {
  try {
    const valid = productSchema.parse(input);
    const product = id ? updateProduct(idSchema.parse(id), valid) : createProduct(valid);
    refresh();
    if (id) revalidatePath(`/admin/productos/${id}`);
    return { ok: true, data: { id: product.id } };
  } catch (error) { return failure(error); }
}
export async function updatePriceAction(id: string, precio: number): Promise<ActionResult<Product>> {
  try { const p = updatePrice(idSchema.parse(id), z.number().int().positive().parse(precio)); refresh(); return { ok: true, data: p }; }
  catch (error) { return failure(error); }
}
export async function setDisponibleAction(id: string, disponible: boolean): Promise<ActionResult<Product>> {
  try { const p = updateProduct(idSchema.parse(id), { disponible: z.boolean().parse(disponible) }); refresh(); return { ok: true, data: p }; }
  catch (error) { return failure(error); }
}
export async function savePromoAction(id: string, precio: number | null, etiqueta: string | null): Promise<ActionResult<Product>> {
  try {
    const value = z.object({ precio: z.number().int().positive().nullable(), etiqueta: z.string().trim().max(80).nullable() }).parse({ precio, etiqueta });
    const p = togglePromo(idSchema.parse(id), value.precio, value.etiqueta); refresh(); return { ok: true, data: p };
  } catch (error) { return failure(error); }
}
export async function deleteProductAction(id: string): Promise<ActionResult> {
  try { if (!deleteProduct(idSchema.parse(id))) return { ok: false, error: 'Producto no encontrado' }; refresh(); return { ok: true, data: undefined }; }
  catch (error) { return failure(error); }
}
export async function setPhotosAction(showProductImages: boolean): Promise<ActionResult<MenuDisplay>> {
  try { const data = setMenuDisplay({ showProductImages: z.boolean().parse(showProductImages) }); refresh(); return { ok: true, data }; }
  catch (error) { return failure(error); }
}
