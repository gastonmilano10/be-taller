---
name: verify-be
description: Verificar un cambio en be-taller antes de cerrarlo (type-check y build). Usar al terminar una implementación en be-taller.
---

# Verificación de be-taller

No hay tests ni lint configurados. La verificación es de tipos y de compilación.

## Pasos

1. `yarn type-check` (`tsc --noEmit`). Reportar errores completos.
2. `yarn build` (`tsc` a `dist/`). Reportar errores completos.
3. Si el cambio toca Prisma, confirmar que `yarn prisma:generate` ya corrió (la migración es un paso aparte, ver `prisma-migration`).
4. Revisar a mano que el JSDoc Swagger del endpoint tocado coincide con el código.

## Reporte

Indicar qué comandos corrieron y su resultado. Si `yarn test` se menciona, aclarar que es un placeholder que falla. No declarar éxito sin salida de comando.
