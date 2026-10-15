# Contratos de F0

## Productos — lib/data/products.ts

```ts
listProducts(options?: { soloDisponibles?: boolean }): Product[]
listByCategory(): ProductCategory[]
getProduct(id: string): Product | undefined
createProduct(input: ProductInput): Product
updateProduct(id: string, input: ProductUpdateInput): Product
updatePrice(id: string, precio: number): Product
togglePromo(id: string, precio_promo: number | null, etiqueta_promo?: string | null): Product
toggleDisponible(id: string): Product
deleteProduct(id: string): boolean
listCategories(): string[]
clearProducts(): number
```

`ProductCategory = { categoria: string; productos: Product[] }`. Incluye disponibles y agotados (F1 puede mostrar “Agotado”); categorías alfabéticas, destacados primero, luego orden, nombre e ID para desempate. `Product` refleja exactamente el contrato; `updated_at` se entrega como `Date` y se almacena como entero Unix en segundos. `deleteProduct` indica si existía; `clearProducts` devuelve cantidad eliminada y es una extensión para seed/importador.

## Validación — lib/validation/product.ts

Exports: `productSchema`, `createProductSchema` (alias), `updateProductSchema` (patch parcial), `ProductInput`, `ProductUpdateInput`, `ValidatedProduct`. Actualizar valida el producto completo combinado con el estado actual dentro de una transacción. Precio entero positivo; promo positiva y menor al precio. Al reducir precio por debajo de promo, falla sin modificar el registro. Imagen usa ruta local (`/uploads/...` o `uploads/...`), sin traversal ni URL externa. Booleanos/precios son tipados: convertir FormData antes de validar.

## Settings — lib/data/settings.ts

```ts
type Theme = { primary: string; secondary: string; text: string; font: string; logo: string }
type Background = { type: 'image' | 'video' | 'lottie' | 'component'; src: string; overlay: number }
getTheme(): Theme
setTheme(theme: Theme): Theme
getBackground(): Background
setBackground(background: Background): Background
```

Exporta también `defaultTheme`, `defaultBackground`. Setters reciben objetos completos. Colores hex de seis dígitos; overlay entre 0 y 1. Valores ausentes o JSON inválido devuelven defaults.

## Scaffold y decisiones

`Background` es export default con props `{ background: Background }`; pinta imagen y overlay. Registry vacío (`registry`), TODO para F3. Tema se aplica en layout con variables CSS y Tailwind (`primary`, `secondary`, `text`, `font-main`). Admin tiene navegación responsive básica, con targets de 44 px.

Proyecto dentro de `coffe-a/`, como solicita F0. Migraciones versionadas propias en `lib/db/migrate.ts`; Drizzle para esquema y acceso. Scripts: `dev`, `build`, `start`, `db:push`, `seed`, `import`, `test`, `typecheck`. No implementa F1/F2/F3 ni scraper/fondo animado, que corresponden a otros carriles.

Tailwind CSS 4 conserva el archivo de configuración mediante `@config`; se usa `@tailwindcss/postcss`. Next.js 15.5.28, Drizzle 0.45.4 y un override de PostCSS corrigen las alertas detectadas por npm audit manteniendo el stack solicitado.

Verificado: migración + seed, test de todas las funciones e importador con catálogo temporal, build y HTTP 200 en las cinco rutas de F0. Auditoría npm: cero vulnerabilidades. En PowerShell pasar flags con `npm.cmd` para evitar que `npm.ps1` los consuma.
