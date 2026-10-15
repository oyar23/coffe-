import {eq,asc,desc} from 'drizzle-orm';
import {db} from '../db';
import {products,type Product} from '../db/schema';
import {productSchema,updateProductSchema,type ProductInput,type ProductUpdateInput} from '../validation/product';
export type {Product,ProductInput,ProductUpdateInput};
export type ProductCategory={categoria:string;productos:Product[]};
export function listProducts({soloDisponibles=false}:{soloDisponibles?:boolean}={}):Product[]{return db.select().from(products).where(soloDisponibles?eq(products.disponible,true):undefined).orderBy(asc(products.categoria),desc(products.destacado),asc(products.orden),asc(products.nombre),asc(products.id)).all();}
export function listByCategory():ProductCategory[]{const groups=new Map<string,Product[]>();for(const p of listProducts()){if(!groups.has(p.categoria))groups.set(p.categoria,[]);groups.get(p.categoria)!.push(p);}return [...groups].map(([categoria,productos])=>({categoria,productos}));}
export function getProduct(id:string):Product|undefined{return db.select().from(products).where(eq(products.id,id)).get();}
export function createProduct(input:ProductInput):Product{return db.insert(products).values(productSchema.parse(input)).returning().get();}
export function updateProduct(id:string,input:ProductUpdateInput):Product{return db.transaction(()=>{const current=getProduct(id);if(!current)throw new Error('Producto no encontrado');const patch=updateProductSchema.parse(input);const valid=productSchema.parse({...current,...patch});return db.update(products).set({...valid,updated_at:new Date()}).where(eq(products.id,id)).returning().get();});}
export function updatePrice(id:string,precio:number):Product{return updateProduct(id,{precio});}
export function togglePromo(id:string,precio_promo:number|null,etiqueta_promo:string|null=null):Product{return updateProduct(id,{precio_promo,etiqueta_promo:precio_promo===null?null:etiqueta_promo});}
export function toggleDisponible(id:string):Product{return db.transaction(()=>{const current=getProduct(id);if(!current)throw new Error('Producto no encontrado');return updateProduct(id,{disponible:!current.disponible});});}
export function deleteProduct(id:string):boolean{return db.delete(products).where(eq(products.id,id)).run().changes>0;}
export function listCategories():string[]{return db.selectDistinct({categoria:products.categoria}).from(products).orderBy(asc(products.categoria)).all().map(p=>p.categoria);}
// Para importaciones y seeds; mantiene el acceso a datos dentro de esta capa.
export function clearProducts():number{return db.delete(products).run().changes;}
