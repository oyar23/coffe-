import {z} from 'zod';
const fields=z.object({
 nombre:z.string().trim().min(1).max(150),descripcion:z.string().trim().max(2000).nullable().optional().default(null),categoria:z.string().trim().min(1).max(100),precio:z.number().int().positive(),precio_promo:z.number().int().positive().nullable().optional().default(null),etiqueta_promo:z.string().trim().max(80).nullable().optional().default(null),imagen:z.string().trim().min(1).refine(v=>!v.includes('..')&&!v.includes('\\')&&!/^[a-z]+:/i.test(v),'Usar una ruta local de public'),disponible:z.boolean().optional().default(true),destacado:z.boolean().optional().default(false),orden:z.number().int().optional().default(0)
});
export const productSchema=fields.refine(p=>p.precio_promo===null||p.precio_promo<p.precio,{message:'El precio promocional debe ser menor al precio',path:['precio_promo']});
export const createProductSchema=productSchema;
// Las ediciones son parciales; la capa de datos valida también el producto completo.
export const updateProductSchema=fields.partial().refine(p=>p.precio_promo==null||p.precio===undefined||p.precio_promo<p.precio,{message:'El precio promocional debe ser menor al precio',path:['precio_promo']});
export type ProductInput=z.input<typeof productSchema>;
export type ProductUpdateInput=z.input<typeof updateProductSchema>;
export type ValidatedProduct=z.output<typeof productSchema>;
