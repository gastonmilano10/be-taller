---
name: add-endpoint
description: Agregar o modificar un endpoint en be-taller (ruta, validador zod, controller, JSDoc Swagger y middlewares de auth). Usar cuando se cree o cambie una ruta de la API.
---

# Nuevo endpoint en be-taller

## Pasos

1. **Recurso**: revisar `src/routes/<recurso>.ts` y `src/controllers/<recurso>.controller.ts`. Reusar el recurso existente antes de crear uno.
2. **Validador**: `src/validators/<recurso>.validator.ts` con zod. Tipos numéricos vs string deben coincidir con `prisma/schema.prisma`.
3. **Controller**: en `src/controllers/<recurso>.controller.ts`. Acceso a Prisma directo, como el resto. Respuesta con el formato del recurso (`{ isError: false, data }` o `{ isError: true, error }`).
4. **Ruta**: en `src/routes/<recurso>.ts`:
   - Patrón RPC: `router.get("/x")`, `router.post("/create")`, etc. Respetar el verbo del recurso.
   - Middlewares en orden: `authenticate`, `authorize(...)` según el recurso, `validate(schema, "body"|"query")`.
5. **Swagger**: JSDoc `@swagger` en la ruta con los campos reales (tipos, required, responses 400/401/403/404).
6. **Códigos**: 201 create, 200 get/edit, 200 delete lógico, 400 validación, 404 si no existe.
7. **Verificar**: `yarn type-check` y `yarn build`. No hay tests; probar el endpoint manualmente solo si el usuario lo pide, sin ejecutar migraciones.

## Reglas

- No leer `.env*`. Los valores de `JWT_*` y `DATABASE_URL` no se consultan.
- Si cambia el schema de Prisma, usar `prisma-migration`.
- Si cambia el contrato consumido por el frontend, usar `cross-repo-contract`.
- Antes de cerrar, revisar los bugs conocidos en `be-taller/CLAUDE.md` que toquen el recurso.
