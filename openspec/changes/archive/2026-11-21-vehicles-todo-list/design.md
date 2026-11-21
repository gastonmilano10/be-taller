# Design: vehicles-todo-list (backend)

## Contexto

El modelo `NextService` existe en `prisma/schema.prisma` desde migraciones anteriores (`vehicleId`, `reason`, `isUrgent`, `isRealized`, `observations` + auditoría), pero no tiene rutas, controller ni validador. El frontend necesita gestionar una lista de pendientes por vehículo desde dos pantallas: vehicle-history y crear/editar servicio. En esta última, el mecánico cierra pendientes que atendió en ese servicio o registra nuevos que detectó.

## Límites de responsabilidad

- **Backend:** persistencia, validación de entrada, integridad entre pendiente, vehículo y servicio, orden del listado, timestamps de auditoría y `realizedOn`.
- **Frontend:** selector de vencimiento (presets → `dueDate`), cálculo de estado visual (vencido / próximo / al día / realizado) comparando con la fecha actual y con `Vehicle.kilometers`, filtros de vista y UX.
- El backend **no** calcula `dueDate` a partir de `dueInterval` ni estados derivados de vencimiento.

## Decisiones

### 1. Reutilizar `NextService` y no crear un modelo nuevo
- **Decisión:** ampliar `NextService`.
- **Motivo:** el modelo ya representa exactamente el concepto y ya está relacionado con `Vehicle`.
- **Descartado:** un modelo `VehicleTodo` nuevo, porque duplicaría un concepto existente y dejaría una tabla huérfana.
- Se mantiene el nombre técnico `NextService` / `/next-services`; "to-do list" es el nombre de la feature.

### 2. Vencimiento: guardar `dueInterval` y `dueDate`
- **Decisión:** se persisten ambos. `dueInterval` es la etiqueta del preset elegido (para mostrar "en 3 meses"); `dueDate` es la fecha efectiva usada para ordenar y calcular vencimiento.
- El frontend calcula `dueDate` al elegir un preset (sobre la fecha local del usuario) y puede ajustarla; `CUSTOM` indica una fecha elegida a mano.
- **Regla de coherencia (zod):** `dueInterval` y `dueDate` son ambos nulos/ausentes o ambos presentes.
- **Descartado:** guardar solo un enum y calcular la fecha desde `createdOn`, porque no permite fechas personalizadas y cambia de significado si se edita. Tampoco se calcula en el servidor, porque el día que ve el usuario depende de su zona horaria y el valor ya se le mostró antes de guardar.
- **Tipo:** `String?` validado con `z.enum`, siguiendo el patrón de `User.role` (string validado). Se descarta un `enum` de Prisma para no introducir un patrón nuevo (el `enum Role` existente no se usa en columnas).
- `dueDate` es `String?` con formato `YYYY-MM-DD`, coherente con `Service.attentionDate` (string).

### 3. `dueKilometers` como `Int?`
- **Decisión:** entero opcional ≥ 0.
- **Motivo:** se usa para comparar con el kilometraje actual; un entero evita parseos ambiguos.
- **Trade-off:** `Vehicle.kilometers` y `Service.vehicleKilometers` son `String`; el frontend debe parsear el kilometraje del vehículo para comparar. Se documenta y no se cambia el tipo de `Vehicle`.

### 4. Trazabilidad con servicios
- `originServiceId Int?` y `realizedServiceId Int?`, ambos con relación opcional a `Service` y nombres de relación explícitos (`NextServiceOrigin`, `NextServiceRealized`).
- `realizedOn String?` (ISO 8601), coherente con los campos de auditoría.
- Ambos servicios deben pertenecer al mismo `vehicleId` que el pendiente y estar activos; si no, 400.
- `originServiceId` solo se define al crear; no es editable.

### 5. Endpoint dedicado `/realize`
- **Decisión:** `PUT /next-services/realize` con `{ id, isRealized, serviceId? }`.
- **Motivo:** marcar como realizado es la acción más frecuente desde la pantalla de servicio, tiene efectos propios (`realizedOn`, `realizedServiceId`) y no debe obligar a reenviar todo el pendiente.
- `isRealized = true`: `realizedOn = now`, `realizedServiceId = serviceId ?? null`.
- `isRealized = false`: `realizedOn = null`, `realizedServiceId = null`. Si se envía `serviceId`, se ignora.
- Es idempotente: marcar como realizado un pendiente ya realizado actualiza `realizedOn` y `realizedServiceId` con los nuevos valores.
- **Descartado:** incluir `isRealized` en `/edit`, porque mezcla edición de datos con un cambio de estado que tiene efectos propios.

### 6. Listado
- `GET /next-services/get?vehicleId=<id>&isRealized=<true|false>` (el filtro es opcional).
- Solo `isActive = true`.
- Orden: `isRealized` asc, `isUrgent` desc, `dueDate` asc con nulos al final, `createdOn` desc. Prisma soporta `orderBy: { dueDate: { sort: "asc", nulls: "last" } }`.
- Incluye `originService` y `realizedService` con `select: { id, attentionDate }`.
- Si el vehículo no existe o está inactivo, 404.
- `isRealized` en query se valida como `z.enum(["true","false"])` y se transforma a boolean. Ojo con el bug conocido #6 de `validate()` sobre `req.query`: como en Express 5 `req.query` es un getter, el controller vuelve a parsear `req.query` con el mismo schema para obtener los valores tipados.

## Validaciones zod (`src/validators/next-service.validator.ts`)

- `dueIntervalSchema = z.enum(["ONE_WEEK","ONE_MONTH","THREE_MONTHS","SIX_MONTHS","ONE_YEAR","CUSTOM"])`.
- `dueDate`: `z.string().regex(/^\d{4}-\d{2}-\d{2}$/)` y fecha válida.
- `createNextServiceSchema`: `vehicleId` (coerce number ≥ 1), `reason` (string trim, 1..200), `isUrgent` (boolean, default false), `observations` (string trim ≤ 1000, opcional), `dueInterval` (nullable opcional), `dueDate` (nullable opcional), `dueKilometers` (int ≥ 0 nullable opcional), `originServiceId` (number ≥ 1 opcional). `superRefine` para la coherencia `dueInterval`/`dueDate`.
- `editNextServiceSchema`: `id` + los mismos campos editables, sin `vehicleId` ni `originServiceId`. Misma coherencia.
- `realizeNextServiceSchema`: `id`, `isRealized` (boolean), `serviceId` (opcional).
- `deleteNextServiceSchema`: `id`.
- `getNextServicesSchema`: `vehicleId` (coerce), `isRealized` (opcional).

En edición, los campos opcionales enviados como `null` limpian el valor y los ausentes también se guardan como `null`: `/edit` reemplaza todos los campos editables (semántica PUT completa, igual que `/labors/edit`).

## Middlewares y códigos

Todas las rutas: `authenticate` → `authorize("ADMIN","USER_OWNER")` → `validate(schema, "body"|"query")` → controller.

| Caso | Código | Body |
|---|---|---|
| Éxito create | 201 | `{ isError: false, data }` |
| Éxito get/edit/realize/delete | 200 | `{ isError: false, data }` |
| Validación zod | 400 | `{ message, errors }` (middleware) |
| Servicio de otro vehículo / inactivo | 400 | `{ isError: true, error }` |
| Sin token / token inválido | 401 | `{ message }` |
| Rol no permitido | 403 | `{ message }` |
| Vehículo o pendiente inexistente/inactivo | 404 | `{ isError: true, error }` |
| Error inesperado | 500 | `{ isError: true, error }` |

## Cambios de schema Prisma

```prisma
model NextService {
  id                Int      @id @default(autoincrement())
  reason            String
  isUrgent          Boolean
  isRealized        Boolean
  observations      String?
  dueInterval       String?
  dueDate           String?
  dueKilometers     Int?
  realizedOn        String?

  // Audit fields (sin cambios)
  ...

  vehicleId         Int
  Vehicle           Vehicle  @relation(fields: [vehicleId], references: [id])

  originServiceId   Int?
  originService     Service? @relation("NextServiceOrigin", fields: [originServiceId], references: [id])
  realizedServiceId Int?
  realizedService   Service? @relation("NextServiceRealized", fields: [realizedServiceId], references: [id])

  @@index([vehicleId])
}

model Service {
  ...
  originatedNextServices NextService[] @relation("NextServiceOrigin")
  realizedNextServices   NextService[] @relation("NextServiceRealized")
}
```

- **Migración:** `20261113120000_add_next_service_due_and_tracking`, generada con `prisma migrate diff` entre el schema de HEAD y el nuevo, sin conectarse a ninguna base. Se aplica después con `prisma migrate dev`/`deploy`. Todas las columnas nuevas son nullable, así que no hay backfill ni riesgo para filas existentes. Aplicarla requiere confirmación explícita.
- Se agrega `@@index([vehicleId])` porque el listado siempre filtra por vehículo.
- En el create se setean explícitamente `isRealized = false`, `isActive = true`, `createdOn` y `modifiedOn`, como en los otros controllers.

## Swagger

- Nuevo tag `NextServices` con JSDoc en cada ruta de `src/routes/next-services.ts`: parámetros, request body con tipos reales (`dueKilometers` integer, `dueDate` string date) y respuestas 200/201/400/401/403/404/500.
- Ningún otro JSDoc cambia.

## Riesgos / Trade-offs

- **[Riesgo]** Desmarcar un pendiente pierde el `realizedServiceId` previo. → Aceptado: no hay historial de estados; queda fuera de alcance.
- **[Riesgo]** El frontend puede enviar un `dueDate` inconsistente con `dueInterval`. → Aceptado: `dueInterval` es solo una etiqueta y `dueDate` es la fuente de verdad.
- **[Riesgo]** Bug #6 de `validate()` con query en Express 5. → Verificación manual del filtro `isRealized`.
- **[Trade-off]** Sin filtro por dueño, como el resto del sistema (bug conocido #3).
