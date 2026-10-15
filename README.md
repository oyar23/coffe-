# coffe-a — Fase 0

Requisitos: Node.js 22 LTS y npm. SQLite local; sin servicios externos.

```powershell
cd coffe-a # si estás en la carpeta que contiene AGENTS.md.md
npm ci
npm run db:push
npm run seed
npm run dev
```

Abrir http://localhost:3000. `/`, `/admin`, `/admin/productos/nuevo`, `/admin/productos/[id]` y `/admin/marca` son stubs para las fases siguientes. No hay autenticación.

```powershell
npm test
npm run build
npm start
```

`db:push` ejecuta migraciones SQL versionadas y transaccionales, sin Drizzle Kit. `seed` **reemplaza** todos los productos y restablece tema/fondo; crea 12 productos, 4 categorías, 2 destacados, 2 promos y 1 no disponible. `npm test` usa SQLite temporal y no toca la demo. `DATABASE_PATH` permite elegir otra DB (default `data/menu.db`). Ejecutar migraciones antes de arrancar o construir. No incluir DB ni uploads en Git.

## Importar catálogo

Poner `scraper-output/catalogo.json` y `scraper-output/imagenes/*` dentro de este proyecto. Cada fila contiene `nombre`, `categoria`, `precio` (entero positivo), `imagen` (por ejemplo `imagenes/latte.jpg`) y opcionalmente `descripcion`.

```powershell
npm run import
npm.cmd run import -- --reset
```

En PowerShell usar `npm.cmd` al pasar flags: el wrapper `npm.ps1` puede consumir `--reset`. En otras shells sirve `npm run import -- --reset`.

Copia imágenes locales jpg/jpeg/png/webp/avif/gif a `/uploads/<uuid>.<ext>`, valida los productos y reporta errores por fila con salida no cero. Sin reset conserva productos existentes. Con reset valida todo el catálogo antes de vaciar; ante errores de validación no modifica productos. Los archivos anteriores no se borran automáticamente. Respaldar DB/uploads antes de importar datos importantes.

## Contrato para F1/F2/F3

Las funciones son **sincrónicas**, solo para servidor Node. Importarlas desde Server Components/Server Actions; no desde componentes cliente. Las mutaciones devuelven el producto guardado y lanzan errores ante datos inválidos o ID inexistente. Las Server Actions de F2/F3 deben llamar a `revalidatePath('/')` y las rutas del admin afectadas. Layout dinámico para leer cambios de tema al recargar.

Ver [F0-CONTRACTS.md](F0-CONTRACTS.md) para firmas y decisiones. Los tipos de formulario están en `lib/validation/product.ts` y no dependen de SQLite. Toda operación de productos/settings pasa por `lib/data/`; scripts de infraestructura y migraciones usan `lib/db/`.

## Muestra de productos del Excel

Para cargar los 24 productos seleccionados de `datos/precios.xlsx` en lugar de los datos ficticios: `npm run db:push` y `npm run import:sample`. El importador hace backup y conserva tema/fondo. Ver [selección y categorías](docs/catalogo-muestra.md).
