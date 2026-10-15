# coffe-a

El plan completo y contratos de fases están en `../AGENTS.md.md`. Leerlos antes de trabajar.

F0 controla `lib/data/`, `lib/db/`, `lib/validation/` y `app/layout.tsx`. F1 solo modifica `app/page.tsx` y `components/menu/`. F2 modifica `app/admin/` excepto `marca/` y `layout.tsx`, `components/admin/` y el endpoint autorizado de upload. F3 modifica `app/admin/marca/` y `components/background/`.

Usar `F0-CONTRACTS.md` para firmas exactas. No cambiar contratos sin coordinar con el usuario. Todo acceso de negocio a SQLite pasa por `lib/data/`. Scripts de migración son infraestructura. Trabajar en worktrees separados para fases en paralelo.
