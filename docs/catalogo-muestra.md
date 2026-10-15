# Carta compacta y muestra del catálogo

Se quitó la presentación de la página pública: eslóganes, sello decorativo, texto del encabezado, numeración y contadores de secciones. Se conserva marca, navegación por categorías, productos y aclaración de moneda.

Fuente: `datos/precios.xlsx`, hoja `Hoja1`, 115 filas de productos (algunos aparecen también en Descuentos). Se seleccionaron 24 sin duplicar las promociones y se agruparon por tipo de producto:

| Categoría | Cantidad | Filas del Excel |
| --- | ---: | --- |
| Cafés calientes | 5 | 27, 28, 31, 32, 36 |
| Cafés fríos | 4 | 37, 39, 41, 47 |
| Bebidas sin café | 4 | 50, 52, 56, 58 |
| Desayunos y meriendas | 2 | 19, 20 |
| Pastelería | 5 | 77, 78, 81, 83, 86 |
| Salados | 4 | 79, 88, 92, 95 |

El precio actual viene de E; si F tiene un precio anterior mayor, se conserva como precio habitual y E como promo. `mas_vendido` (H) se usa como destacado. Las categorías comerciales como Descuentos no se usan como tipo de producto. No se descargaron imágenes externas; se mantiene el diseño sin fotos. Se reemplazaron menciones de la marca de origen en las descripciones seleccionadas por coffe-a. El Excel original permanece intacto.

## Volver a cargar la muestra

```powershell
npm run db:push
npm run import:sample
```

El snapshot trazable está en `scripts/catalogo-muestra.json`. El importador valida todo antes de escribir, guarda un backup SQLite consistente en `data/menu-before-excel-<fecha>.db`, elimina únicamente productos reconocidos del seed inicial e inserta/actualiza la muestra por nombre y categoría, dentro de una transacción. Conserva tema, fondo y configuración de fotos. Repetirlo actualiza la selección y no la duplica. Otros productos se conservan.

La primera carga creó 24 registros y retiró los 12 productos ficticios de F0. El reporte local queda en `data/catalogo-muestra-report.json`. `npm run seed` vuelve a los datos ficticios; usar `import:sample` para recuperar esta selección.

Verificado: 24 productos en 6 categorías, precios y promos reconciliados con el snapshot, HTTP 200 y ausencia de los textos de presentación en el HTML.

También pasaron `npm run typecheck` y los 2 tests de validación de marca. Se corrigieron dos conversiones Buffer/Blob en esos fixtures para compatibilidad de tipos. Revisión móvil a 375 px: carta sin presentación, seis secciones sin desbordes visibles, Lighthouse Accessibility 100/100 (auditoría sobre desarrollo, no una medición de performance de producción).
