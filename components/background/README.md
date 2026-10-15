# Fase 3 · Marca y fondos

Los cambios de esta fase viven únicamente en `app/admin/marca/` y `components/background/`.

## Instalación

Desde la raíz del proyecto:

```powershell
npm ci
npm ci --prefix components/background --legacy-peer-deps
npm run db:push
npm run seed # solo para una base de demo: reemplaza datos y marca
npm run build
npm start
```

La dependencia `lottie-react` está declarada en el paquete local de `components/background/` para respetar el alcance de archivos de F3. Se evita instalar otra copia de React con `--legacy-peer-deps`. En F4 se puede mover la dependencia al package.json raíz y eliminar el paquete local. El renderer Lottie y su librería son chunks dinámicos: solo se solicitan cuando se renderiza ese tipo.

## Agregar un componente de fondo

1. Crear `components/background/MiFondo.tsx`, con export default y sin props obligatorias. Usar las variables `--color-primary`, `--color-secondary`, `--color-text`. El contenedor tiene posición fixed; el componente debe llenar su padre (`position: absolute; inset: 0`).
2. Agregar el nombre estable `mi-fondo` al array de `components/background/names.ts`.
3. Agregar en `components/background/registry.ts` la entrada `'mi-fondo': dynamic(() => import('./MiFondo'), { ssr: false })`. El tipo del registry comprueba que todos los nombres tengan implementación.
4. En `/admin/marca`, elegir tipo Componente animado y luego `mi-fondo`. Guardar marca. El contrato persistido será `{type:'component', src:'mi-fondo', overlay:0.2}`.
5. Respetar `prefers-reduced-motion`, evitar filtros costosos y animar transform/opacity. El ejemplo `GradientBackground.tsx` muestra un gradiente CSS con movimiento sutil.

No se necesita editar el formulario ni las Server Actions al agregar una entrada.

## Archivos recomendados

- Imagen: WebP/JPG, idealmente menos de 300 KB, 1280–1920 px de lado mayor. El upload acepta JPG/PNG/WebP hasta 5 MB, corrige orientación y convierte a WebP de hasta 1920 px.
- Video: MP4 H.264, sin audio, `yuv420p`, `faststart`, loop corto de 4–8 segundos, 24–30 fps. Máximo 3 MiB y 1280 × 720 (o 720 × 1280). Preferir 640 × 360 y menos de 1 MB para celulares. El servidor comprueba tamaño y dimensiones del track; el navegador debe poder decodificarlo para generar el poster.
- El upload genera el poster JPEG automáticamente. Para un archivo colocado manualmente, agregar al lado `<ruta-video>.poster.jpg` (ejemplo `campana.mp4.poster.jpg`). Con movimiento reducido solo se muestra el poster y no se solicita el MP4. Las animaciones se detienen cuando la pestaña está oculta.
- Lottie: JSON Bodymovin vectorial, preferentemente menos de 100 KB, 30 fps y pocas capas. Límite de upload y renderer: 300.000 bytes, 60 fps y 60 capas, incluyendo precomposiciones. Sin expresiones, imágenes, audio ni referencias externas. Evitar máscaras, blur y paths excesivos; el peso solo no garantiza buen rendimiento. Con movimiento reducido queda el primer frame.
- Las Google Fonts Lora, Nunito y Playfair Display se cargan con `display=swap`, con fallback serif/sans-serif; Arial no requiere fuente externa.

Ejemplo de compresión con ffmpeg:

```powershell
ffmpeg -i original.mov -vf "scale=1280:720:force_original_aspect_ratio=decrease,fps=24" -an -c:v libx264 -crf 29 -pix_fmt yuv420p -movflags +faststart campana.mp4
```

## Preview y persistencia

Los fondos de tipo imagen ahora tienen un movimiento suave de zoom y desplazamiento, en un ciclo CSS de 26 segundos. `ImageBackground.tsx` pausa la animación si la pestaña está oculta y la desactiva con `prefers-reduced-motion`. No se genera un MP4: la animación forma parte de la web. No afecta al poster estático de los fondos de video.

El diseño compartido mediante la biblioteca de ChatGPT está pendiente de recibir como archivo: el enlace enviado requiere iniciar sesión y no permitió descargarlo. Para incluirlo en el repositorio y futuro deploy, guardarlo en `public/backgrounds/` y seleccionarlo como imagen en Marca. Si se sube desde el admin queda en `public/uploads/`, que está excluido de Git, por lo que se debe transferir por separado al hosting junto con la base local. La configuración activa se guarda en SQLite; no basta con copiar solo los archivos de código.

Los presets aplican tema y fondo juntos al borrador y conservan el logo. El iframe recibe el borrador por postMessage del mismo origen; no cambia SQLite. Guardar llama a `setTheme`, `setBackground` y `revalidatePath('/')`, y recarga el iframe. En mobile las pestañas permiten alternar entre edición y preview; en desktop se muestran lado a lado. Los uploads usan `/api/upload` para el logo si existe; ante 404 usan el endpoint propio. Fondos y poster se suben al endpoint propio, con validación específica. Las rutas de media sirven archivos agregados después del build y soportan rangos de video.

## Ejemplos y verificación

Ejemplos propios incluidos, sin dependencias de sitios externos:

- Imagen: `/backgrounds/default.svg`.
- Video: `/admin/marca/examples/sample.mp4` (640 × 360, aproximadamente 4 KB), con poster contiguo.
- Lottie: `/admin/marca/examples/sample.json` (una capa vectorial a 30 fps).
- Componente: `gradiente-cafe`.

Elegir el tipo correspondiente e ingresar la ruta en el editor; para probar el upload seleccionar los archivos de `components/background/assets/`.

Pruebas de upload y presupuestos (también comprueban poster, rangos, traversal y rechazo de archivos inválidos):

```powershell
npx tsx --test app/admin/marca/validation.test.ts
```

Chequeo manual pendiente si no hay navegador conectado: abrir DevTools, viewport 375 × 812, Performance > CPU 4x. Recorrer el menú con cada fondo; verificar scroll fluido, ausencia de errores y overflow horizontal, detener animaciones emulando reduced motion, y confirmar en Network que Lottie no se descarga con fondo imagen/video/component y que MP4 no se descarga con reduced motion. En Marca, probar las pestañas, secciones colapsables, uploads desde el celular y los tres presets con guardado.

## Integración con F1

`components/menu/menu.module.css` define `.backdropVeil` como un velo del color secundario al 94%, pintado encima del fondo. Esto atenúa fuertemente los fondos y no puede corregirse desde F3 sin modificar el alcance autorizado. F4 debe revisar esa opacidad para que las campañas destaquen manteniendo legibilidad. El overlay configurable de F3 se aplica siempre independientemente de ese velo.
