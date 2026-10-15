# Mostrar la carta con Vercel

Esta publicación es una muestra de la carta: 24 productos, categorías, promociones y fondo botánico animado. No incluye el panel admin. La edición completa sigue disponible en la versión local.

## Publicar

1. Subí el contenido de `coffe-a` a un repositorio de GitHub. No subas `node_modules`, `.next`, `.next-demo`, `.demo-build/out`, `data`, ni archivos `.env`.
2. En Vercel, elegí **Add New → Project** e importá ese repositorio.
3. Si el repositorio contiene directamente `package.json`, dejá **Root Directory** en `./`. Si subiste la carpeta contenedora, elegí `coffe-a`.
4. Dejá que Vercel tome la configuración de `vercel.json` y presioná **Deploy**. No hacen falta variables de entorno ni una base de datos.
5. Abrí el enlace generado, probalo desde el celular y envialo a la compradora. Si Vercel pide iniciar sesión al abrirlo, revisá **Settings → Deployment Protection** para permitir el acceso público a la muestra.

## Actualizar la muestra

Los datos publicados están guardados en `lib/demo/menu.json`. Para mostrar cambios realizados desde el admin local, ejecutá `npm run demo:snapshot`, subí los cambios a GitHub y Vercel volverá a publicar. Si agregás fotos o un logo en `public/uploads`, incluí explícitamente en Git los archivos utilizados por la muestra (esa carpeta se ignora por defecto). No publiques archivos privados.

## Comprobar antes de publicar

```powershell
npm ci
npm ci --prefix components/background --legacy-peer-deps
npm run build:demo
```

La salida estática queda en `.demo-build/out`. La compilación utiliza solamente las rutas `*.demo.tsx`; excluye admin, uploads y acciones del servidor. `npm run dev` y `npm run build` conservan la aplicación local completa con SQLite.
