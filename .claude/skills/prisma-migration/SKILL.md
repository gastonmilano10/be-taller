---
name: prisma-migration
description: Cambiar prisma/schema.prisma en be-taller y preparar la migración. Usar cuando haya que agregar o modificar modelos, campos o relaciones.
---

# Cambio de schema y migración (be-taller)

## Pasos

1. **Leer** `prisma/schema.prisma` y las migraciones existentes en `prisma/migrations/` para ver el estado actual.
2. **Editar** el schema. Mantener los nombres de modelos y campos del estilo existente. Fechas de auditoría: nota que hoy son String (ISO); no cambiar ese tipo sin pedido, porque rompe contratos.
3. **Generar cliente**: `yarn prisma:generate`.
4. **Migración**: crearla con `yarn prisma:migrate` **solo** si el usuario lo confirmó. Esto ejecuta `migrate dev` contra la base configurada.
5. **Deploy**: `yarn prisma:deploy` nunca sin confirmación explícita.
6. **Verificar**: `yarn type-check` y `yarn build`.

## Reglas

- No ejecutar `prisma migrate reset`, `db push` ni `migrate deploy` por iniciativa propia.
- No leer `.env*`. La URL de base de datos no se muestra.
- Si el cambio afecta una respuesta de la API, actualizar Swagger y validador (`add-endpoint`) y coordinar con el frontend (`cross-repo-contract`).
- `generated/prisma/` está desfasado y en `.gitignore`. No usarlo como referencia.
