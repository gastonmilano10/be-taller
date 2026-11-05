# be-taller — instrucciones para Claude Code

## Comandos

- `yarn dev` (nodemon, ejecuta `ts-node src/index.ts`).
- `yarn build` (tsc a `dist/`), `yarn start` (`node dist/index.js`), `yarn type-check` (`tsc --noEmit`).
- Prisma: `yarn prisma:generate`, `yarn prisma:migrate` (`migrate dev`), `yarn prisma:deploy` (`migrate deploy`).
- `yarn test` es un placeholder que falla. No hay tests ni lint configurados.
- No ejecutar `prisma:migrate` ni `prisma:deploy` sin confirmación explícita.
- Scripts `check:3001`, `stop:3001`, `restart:3001` son solo para Windows (PowerShell).

## Stack (versiones de package.json)

- Express `^5.1`, TypeScript `^5.8`, Prisma `^6.10` (PostgreSQL), zod `^3.25`, jsonwebtoken `^9.0.3`.
- swagger-jsdoc 6 + swagger-ui-express 5 (UI en `/api-docs`), express-rate-limit 8, helmet, cookie-parser.

## Estructura

- `src/index.ts`: app, middlewares globales (helmet, cors, rate limit, json 100kb), montaje de rutas y handler de errores.
- `src/routes/<recurso>.ts`: rutas con JSDoc `@swagger`. Rutas base sin prefijo `/api`.
- `src/middlewares/`: `auth.middleware.ts` (`authenticate`), `role.middleware.ts` (`authorize(...roles)`), `validate.ts` (`validate(schema, "body"|"query")`).
- `src/controllers/<recurso>.controller.ts`: lógica y acceso a Prisma directo. No hay capa de servicios de negocio.
- `src/validators/<recurso>.validator.ts`: esquemas zod.
- `src/services/auth.service.ts`: helpers de tokens (crear access/refresh).
- `src/swagger.ts`: configuración de swagger-jsdoc.
- `prisma/schema.prisma` y `prisma/migrations/`. `generated/` está en `.gitignore` y no se usa.

## Convenciones

- Nombres: `<recurso>.<capa>.ts` en kebab-case.
- Rutas RPC: verbo en el path (`GET /clients/get`, `POST /clients/create`, `PUT /clients/edit`, `DELETE /materials/delete`). Respetar el patrón al agregar rutas.
- Respuestas de éxito: `{ isError: false, data }`. Errores de controller: `{ isError: true, error }`. Errores de auth y middlewares: `{ message }`. Validación: `{ message, errors: [{ path, message }] }`. Mantener el formato del recurso que se toca.
- Códigos: 201 create, 200 get/edit, 200 delete (baja lógica), 204 logout, 400 validación, 401, 403, 404, 500.
- Validación: zod en `validators/`, aplicado con `validate()` en la ruta.
- Auth: access JWT de 30 min (`issuer: be-taller`, `audience: fe-taller`). Refresh de 7 días firmado con `JWT_REFRESH_SECRET`, guardado como SHA-256 (`tokenHash`), con rotación y detección de reuso.
- Variables de entorno requeridas: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_CLIENT_ID`, `DATABASE_URL`. Opcionales: `PORT`, `FRONTEND_URL`, `NODE_ENV`. Nunca leer sus valores.
- Swagger: escrito a mano en JSDoc de cada ruta. Al cambiar una ruta, actualizar su JSDoc en el mismo cambio.

## Bugs conocidos (no corregir sin pedido)

1. `GET /auth/me` probablemente responde 500: `auth.controller.ts` lee `req.user!.id` pero el JWT firma `userId`.
2. El handler global responde 500 a cualquier error, incluido JSON malformado (debería ser 400) y bodies mayores a 100kb (413).
3. Autorización plana: todas las rutas usan `authorize("ADMIN","USER_OWNER")` sin filtro por dueño. Cada login de Google crea `USER_OWNER` sin allowlist.
4. `authLimiter` (10/min por IP) se aplica también a `/auth/refresh` y `/auth/me`.
5. `refreshToken` verifica sin `issuer`/`audience`, aunque se firman con ellos.
6. `validate.ts` hace `Object.assign` sobre `req.query` (getter en Express 5). Impacto probablemente bajo; no verificado en ejecución.
7. Lecturas que escriben: `ensureServiceStatesCatalog` hace upserts en GET.
8. `getVehicleSchema` no se usa; `GET /vehicles/get` no valida query.
9. Swagger desalineado: `engineCapacity` y `kilometers` documentados como number (son string en validador y Prisma); el enum de `service-states/update` no se valida; faltan docs de auth y de `DELETE /vehicles/delete`.
10. `.agents/skills/auth-skill/SKILL.md` dice refresh solo por cookie, pero el código acepta y devuelve `refreshToken` en body/JSON.
11. `cookie-parser` está en devDependencies pero se usa en runtime.
12. Dos lockfiles (`package-lock.json`, `yarn.lock`) sin `packageManager` declarado.
