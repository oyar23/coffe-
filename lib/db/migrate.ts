import { sqlite } from './index';
// Versioned, atomic local migrations; never drops existing data.
export function migrate(){
 sqlite.exec('CREATE TABLE IF NOT EXISTS _migrations (version INTEGER PRIMARY KEY)');
 const applied=sqlite.prepare('SELECT version FROM _migrations WHERE version=1').get();
 if(!applied) sqlite.transaction(()=>{
 sqlite.exec(`CREATE TABLE products (
 id TEXT PRIMARY KEY NOT NULL, nombre TEXT NOT NULL, descripcion TEXT, categoria TEXT NOT NULL,
 precio INTEGER NOT NULL CHECK(precio>0), precio_promo INTEGER CHECK(precio_promo IS NULL OR (precio_promo>0 AND precio_promo<precio)), etiqueta_promo TEXT, imagen TEXT NOT NULL,
 disponible INTEGER NOT NULL DEFAULT 1, destacado INTEGER NOT NULL DEFAULT 0, orden INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL);
 CREATE TABLE settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
 CREATE INDEX products_category_order ON products(categoria,destacado,orden);`);
 sqlite.prepare('INSERT INTO _migrations(version) VALUES (1)').run();
 })();
}
