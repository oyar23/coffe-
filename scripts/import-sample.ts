import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { migrate } from '../lib/db/migrate';
import { db, sqlite } from '../lib/db';
import { listProducts, createProduct, updateProduct, deleteProduct, listByCategory } from '../lib/data/products';
import { productSchema } from '../lib/validation/product';

// Snapshot de filas verificadas de datos/precios.xlsx; no modifica el Excel.
const snapshotSchema = z.object({ seleccion: z.array(z.object({ fila: z.number().int().positive(), producto: productSchema })) });
const normalize = (value: string) => value.trim().toLocaleLowerCase('es-AR');
const key = (nombre: string, categoria: string) => `${normalize(categoria)}\0${normalize(nombre)}`;

async function main() {
  const snapshot = snapshotSchema.parse(JSON.parse(await readFile(path.resolve('scripts/catalogo-muestra.json'), 'utf8')));
  const keys = snapshot.seleccion.map(({ producto }) => key(producto.nombre, producto.categoria));
  if (new Set(keys).size !== keys.length) throw new Error('La muestra contiene productos duplicados.');
  migrate();
  const backup = path.resolve('data', `menu-before-excel-${new Date().toISOString().replace(/[:.]/g, '-')}.db`);
  await sqlite.backup(backup);

  const seedGroups = [['Cafés calientes', 'Espresso', 'Latte', 'Cappuccino'], ['Fríos', 'Cold brew', 'Latte helado', 'Limonada'], ['Pastelería', 'Medialuna', 'Brownie', 'Cheesecake'], ['Salados', 'Tostado', 'Croissant relleno', 'Bagel']];
  const seedPrices = new Map<string, number>();
  seedGroups.forEach(([categoria, ...names], c) => names.forEach((nombre, i) => seedPrices.set(key(nombre, categoria), 2500 + c * 700 + i * 500)));
  let created = 0, updated = 0, removedSeed = 0;
  db.transaction(() => {
    for (const product of listProducts()) {
      const seedPrice = seedPrices.get(key(product.nombre, product.categoria));
      if (product.descripcion === `${product.nombre} de coffe-a` && product.imagen === '/placeholder.svg' && product.precio === seedPrice) {
        deleteProduct(product.id); removedSeed++;
      }
    }
    const current = new Map(listProducts().map(product => [key(product.nombre, product.categoria), product]));
    for (const { producto } of snapshot.seleccion) {
      const existing = current.get(key(producto.nombre, producto.categoria));
      if (existing) { updateProduct(existing.id, producto); updated++; }
      else { createProduct(producto); created++; }
    }
  });
  const report = { created, updated, removedSeed, backup, categories: listByCategory().map(group => ({ categoria: group.categoria, productos: group.productos.length })) };
  await writeFile('data/catalogo-muestra-report.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
