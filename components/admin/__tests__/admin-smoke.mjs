import assert from 'node:assert/strict';
import { readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

if (process.env.ADMIN_TEST_ALLOW_MUTATIONS !== '1') throw new Error('Usar ADMIN_TEST_ALLOW_MUTATIONS=1 con servidor/base de prueba.');
const base = process.env.ADMIN_TEST_BASE_URL || 'http://127.0.0.1:3003';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Solo servidor local de pruebas');
const productsModule = await import('../../../lib/data/products.ts');
const products = productsModule.default ?? productsModule;
const displayModule = await import('../../../lib/data/menu-display.ts');
const display = displayModule.default ?? displayModule;
const originalDisplay = display.getMenuDisplay();
const manifest = JSON.parse(await readFile('.next/server/server-reference-manifest.json', 'utf8'));
const actions = Object.fromEntries(Object.entries(manifest.node).map(([id, value]) => [value.exportedName, id]));
async function action(name, args) {
  assert.ok(actions[name], `Acción encontrada: ${name}`);
  const response = await fetch(`${base}/admin`, { method: 'POST', headers: { 'Next-Action': actions[name], 'Content-Type': 'text/plain;charset=UTF-8', Origin: base, Accept: 'text/x-component' }, body: JSON.stringify(args) });
  const body = await response.text();
  assert.equal(response.status, 200, `${name}: ${body.slice(0, 300)}`);
  const row = body.split('\n').find(line => /^[a-f0-9]+:\{"ok":/.test(line));
  assert.ok(row, `Resultado de ${name}`);
  return JSON.parse(row.slice(row.indexOf(':') + 1));
}
async function page(route = '/') { const response = await fetch(base + route); return { status: response.status, body: await response.text() }; }
function card(body, id) { return body.match(new RegExp(`<article[^>]*aria-labelledby="producto-${id}"[\\s\\S]*?</article>`))?.[0] ?? ''; }
const input = { nombre: 'Prueba F2 sin foto', categoria: 'Verificacion F2', descripcion: 'Producto temporal de smoke test', precio: 4500, imagen: '/placeholder.svg', disponible: true, destacado: true, orden: 0 };
let created;
let uploaded;
try {
  assert.equal((await page('/admin')).status, 200);
  assert.equal((await page('/admin/productos/nuevo')).status, 200);
  assert.equal((await action('saveProductAction', [{ ...input, nombre: '', precio: -1 }])).ok, false);
  const result = await action('saveProductAction', [input]); assert.equal(result.ok, true); created = result.data.id;
  assert.equal(products.getProduct(created).nombre, input.nombre);
  assert.equal((await page(`/admin/productos/${created}`)).status, 200);
  assert.match((await page('/admin')).body, /Prueba F2 sin foto/);
  await action('setPhotosAction', [false]);
  let publicCard = card((await page()).body, created);
  assert.match(publicCard, /Recomendado/); assert.doesNotMatch(publicCard, /<img/);
  assert.equal((await action('updatePriceAction', [created, 7000])).ok, true);
  assert.match(card((await page()).body, created), /\$ 7\.000/);
  assert.equal((await action('updatePriceAction', [created, -1])).ok, false);
  assert.equal(products.getProduct(created).precio, 7000);
  assert.equal((await action('savePromoAction', [created, 5000, 'Promo F2'])).ok, true);
  publicCard = card((await page()).body, created);
  assert.match(publicCard, /Promo F2/); assert.match(publicCard, /<del/); assert.match(publicCard, /\$ 5\.000/);
  assert.equal((await action('updatePriceAction', [created, 4000])).ok, false);
  assert.equal((await action('savePromoAction', [created, 7000, 'Invalida'])).ok, false);
  assert.equal(products.getProduct(created).precio, 7000);
  assert.equal((await action('setDisponibleAction', [created, false])).ok, true);
  assert.match(card((await page()).body, created), /Agotado/);
  assert.equal((await action('setDisponibleAction', [created, true])).ok, true);
  assert.doesNotMatch(card((await page()).body, created), /Agotado/);
  assert.equal((await action('savePromoAction', [created, null, null])).ok, true);
  assert.doesNotMatch(card((await page()).body, created), /<del/);

  const png = await sharp({ create: { width: 64, height: 64, channels: 3, background: '#775533' } }).png().toBuffer();
  async function upload(bytes, type = 'image/png', origin = base) {
    const form = new FormData(); form.append('file', new Blob([bytes], { type }), 'prueba.png');
    return fetch(`${base}/api/upload`, { method: 'POST', headers: origin === null ? {} : { Origin: origin }, body: form });
  }
  assert.equal((await upload(png, 'image/png', null)).status, 403);
  assert.equal((await upload(png, 'image/png', 'no-es-url')).status, 403);
  assert.equal((await upload(png, 'image/svg+xml')).status, 415);
  assert.equal((await upload(Buffer.from('no es una imagen'))).status, 415);
  assert.equal((await upload(Buffer.alloc(5 * 1024 * 1024 + 1))).status, 413);
  const response = await upload(png); assert.equal(response.status, 201);
  uploaded = (await response.json()).path; assert.match(uploaded, /^\/uploads\/[a-f0-9-]+\.webp$/);
  const photo = await fetch(base + uploaded); assert.equal(photo.status, 200); assert.match(photo.headers.get('content-type'), /image\/webp/);
  assert.equal((await fetch(`${base}/_next/image?url=${encodeURIComponent(uploaded)}&w=256&q=75`)).status, 200);
  assert.equal((await action('saveProductAction', [{ ...input, nombre: 'Prueba F2 editada', precio: 7000, imagen: uploaded }, created])).ok, true);
  assert.equal(products.getProduct(created).imagen, uploaded);
  assert.match((await page('/admin')).body, /Prueba F2 editada/);
  assert.equal((await action('setPhotosAction', [true])).ok, true);
  assert.equal(display.getMenuDisplay().showProductImages, true);
  assert.match(card((await page()).body, created), /<img/);
  assert.equal((await action('setPhotosAction', [false])).ok, true);
  assert.equal(display.getMenuDisplay().showProductImages, false);
  assert.doesNotMatch(card((await page()).body, created), /<img/);
  assert.equal((await action('deleteProductAction', [created])).ok, true);
  assert.equal(products.getProduct(created), undefined);
  assert.equal(card((await page()).body, created), '');
  const missing = await page(`/admin/productos/${created}`);
  assert.ok(missing.status === 404 || missing.body.includes('Este producto no está en la carta'));
  assert.equal((await action('deleteProductAction', [created])).ok, false);
  created = undefined;
  console.log('OK F2: alta sin foto, edición, precio, validación, promo, disponibilidad, borrado, upload real tras arranque y fotos on/off en menú.');
} finally {
  if (created) products.deleteProduct(created);
  display.setMenuDisplay(originalDisplay);
  if (uploaded && /^\/uploads\/[a-f0-9-]+\.webp$/.test(uploaded)) await unlink(path.join(process.cwd(), 'public', uploaded.slice(1))).catch(() => {});
}
