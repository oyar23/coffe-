import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { randomUUID } from 'node:crypto';
export const products = sqliteTable('products', {
 id:text('id').primaryKey().$defaultFn(()=>randomUUID()), nombre:text('nombre').notNull(), descripcion:text('descripcion'), categoria:text('categoria').notNull(), precio:integer('precio').notNull(), precio_promo:integer('precio_promo'), etiqueta_promo:text('etiqueta_promo'), imagen:text('imagen').notNull(), disponible:integer('disponible',{mode:'boolean'}).notNull().default(true), destacado:integer('destacado',{mode:'boolean'}).notNull().default(false), orden:integer('orden').notNull().default(0), updated_at:integer('updated_at',{mode:'timestamp'}).notNull().$defaultFn(()=>new Date())
});
export const settings=sqliteTable('settings',{key:text('key').primaryKey(),value:text('value').notNull()});
export type Product=typeof products.$inferSelect;
