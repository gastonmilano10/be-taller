## 1. Schema y migración

- [x] 1.1 Ampliar `NextService` en `prisma/schema.prisma` con `dueInterval`, `dueDate`, `dueKilometers`, `realizedOn`, `originServiceId`, `realizedServiceId`, las relaciones nombradas a `Service`, las relaciones inversas en `Service` y `@@index([vehicleId])`.
- [x] 1.2 Migración `20261113120000_add_next_service_due_and_tracking` generada **sin tocar la base** con `prisma migrate diff --from-schema-datamodel <schema de HEAD> --to-schema-datamodel prisma/schema.prisma --script`: solo columnas nullable, índice `NextService_vehicleId_idx` y FKs `ON DELETE SET NULL`. **Aplicarla queda pendiente de confirmación explícita.**
- [x] 1.3 Ejecutar `yarn prisma:generate` y confirmar que el cliente tipa los campos nuevos.

## 2. Validadores zod

- [x] 2.1 Crear `src/validators/next-service.validator.ts` con `dueIntervalSchema`, `createNextServiceSchema`, `editNextServiceSchema`, `realizeNextServiceSchema`, `deleteNextServiceSchema` y `getNextServicesSchema`.
- [x] 2.2 Implementar la regla de coherencia `dueInterval`/`dueDate` (`superRefine`) y la validación de fecha `YYYY-MM-DD` real en create y edit.

## 3. Controller

- [x] 3.1 Crear `src/controllers/next-service.controller.ts` con `getNextServicesByVehicle` (verificación de vehículo, filtro `isRealized`, orden definido e include de `originService`/`realizedService`).
- [x] 3.2 Implementar `createNextService` (verificación de vehículo y de `originServiceId` del mismo vehículo, defaults y auditoría).
- [x] 3.3 Implementar `editNextService` (solo campos editables, semántica PUT completa, 404 si no existe o está inactivo).
- [x] 3.4 Implementar `realizeNextService` (`realizedOn`, `realizedServiceId`, validación del servicio del mismo vehículo, limpieza al desmarcar).
- [x] 3.5 Implementar `deleteNextService` (baja lógica, 404 si no existe o está inactivo).
- [x] 3.6 Extraer un helper local para el `select`/`include` común de la respuesta y un tipo de respuesta explícito, sin `any`.

## 4. Rutas y Swagger

- [x] 4.1 Crear `src/routes/next-services.ts` con las cinco rutas, `authenticate`, `authorize("ADMIN","USER_OWNER")` y `validate()`.
- [x] 4.2 Documentar cada ruta con JSDoc `@swagger` bajo el tag `NextServices`, con todos los códigos de respuesta.
- [x] 4.3 Montar el router en `src/index.ts` como `app.use("/next-services", nextServicesRoutes)`.

## 5. Verificación

- [x] 5.1 Ejecutar `yarn type-check` y corregir errores. Revisar que no haya `any` en los archivos nuevos.
- [x] 5.2 Ejecutar `yarn build`.
- [x] 5.3 Migración aplicada en la base local con `prisma migrate deploy`. Escenarios verificados con curl contra el servidor local (env de auth ficticio): 401 sin token o con token inválido, 403 con rol no permitido, 200/201/400/404 en las cinco rutas, orden del listado, filtro `isRealized`, vínculos a servicio del mismo vehículo y 400 con servicio de otro vehículo, edición que ignora campos no editables, baja lógica y rutas en `/api-docs`. Datos de prueba eliminados.
- [x] 5.4 Ejecutar `openspec validate vehicles-todo-list` y resolver observaciones antes de cerrar el change.
- [x] 5.5 Avisar al frontend (`fe-taller/openspec/changes/vehicles-todo-list`) que el contrato está disponible.
