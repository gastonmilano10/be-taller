# Proposal: vehicles-todo-list (backend)

> Change compartido con `fe-taller/openspec/changes/vehicles-todo-list/`. Este documento cubre el schema de datos y la API; el frontend consume el contrato aquí definido.

## Objective

Exponer una API REST para gestionar la lista de pendientes ("to-do") de cada vehículo, basada en el modelo existente `NextService`. Un pendiente es un trabajo que el mecánico detectó y que debería realizarse en el futuro (por ejemplo, "cambiar pastillas de freno"), con urgencia, vencimiento por fecha y/o kilometraje, y trazabilidad del servicio en el que se detectó y en el que se resolvió.

## Scope

- Ampliar el modelo `NextService` con campos de vencimiento y trazabilidad:
  - `dueInterval` (opcional): preset elegido por el usuario (`ONE_WEEK`, `ONE_MONTH`, `THREE_MONTHS`, `SIX_MONTHS`, `ONE_YEAR`, `CUSTOM`).
  - `dueDate` (opcional): fecha límite (`YYYY-MM-DD`).
  - `dueKilometers` (opcional): kilometraje objetivo.
  - `realizedOn` (opcional): fecha/hora en que se marcó como realizado.
  - `realizedServiceId` (opcional): servicio en el que se realizó.
  - `originServiceId` (opcional): servicio en el que se detectó/creó.
- La fecha de creación se cubre con el campo de auditoría existente `createdOn`; se expone en las respuestas.
- Nuevo recurso `/next-services` con endpoints:

| Método | Path | Descripción |
|---|---|---|
| GET | `/next-services/get?vehicleId=<id>[&isRealized=true\|false]` | Lista los pendientes activos del vehículo. |
| POST | `/next-services/create` | Crea un pendiente. |
| PUT | `/next-services/edit` | Edita datos de un pendiente. |
| PUT | `/next-services/realize` | Marca o desmarca un pendiente como realizado, opcionalmente vinculado a un servicio. |
| DELETE | `/next-services/delete` | Baja lógica (`isActive = false`). |

- Validadores zod, documentación Swagger y registro del router en `src/index.ts`.

### Contrato (request / response)

Entidad devuelta (`NextServiceResponse`):

```ts
{
  id: number;
  vehicleId: number;
  reason: string;
  isUrgent: boolean;
  isRealized: boolean;
  observations: string | null;
  dueInterval: "ONE_WEEK" | "ONE_MONTH" | "THREE_MONTHS" | "SIX_MONTHS" | "ONE_YEAR" | "CUSTOM" | null;
  dueDate: string | null;          // YYYY-MM-DD
  dueKilometers: number | null;
  realizedOn: string | null;       // ISO 8601
  realizedServiceId: number | null;
  originServiceId: number | null;
  realizedService: { id: number; attentionDate: string } | null;
  originService: { id: number; attentionDate: string } | null;
  isActive: boolean;
  createdOn: string;               // ISO 8601
  modifiedOn: string;              // ISO 8601
}
```

- `POST /next-services/create` body: `{ vehicleId, reason, isUrgent?, observations?, dueInterval?, dueDate?, dueKilometers?, originServiceId? }` → `201 { isError: false, data: NextServiceResponse }`.
- `PUT /next-services/edit` body: `{ id, reason, isUrgent, observations?, dueInterval?, dueDate?, dueKilometers? }` → `200 { isError: false, data: NextServiceResponse }`.
- `PUT /next-services/realize` body: `{ id, isRealized, serviceId? }` → `200 { isError: false, data: NextServiceResponse }`.
- `DELETE /next-services/delete` body: `{ id }` → `200 { isError: false, data: NextServiceResponse }`.
- `GET /next-services/get` → `200 { isError: false, data: NextServiceResponse[] }`.

## Out of Scope

- Notificaciones o recordatorios automáticos (email, push) por vencimiento.
- Recálculo automático de `dueDate` en el servidor a partir de `dueInterval`.
- Listado global de pendientes de todos los vehículos.
- Filtrado de datos por dueño (problema conocido de autorización; no se resuelve en este change).
- Endpoints para restaurar pendientes eliminados.

## Functional Flow

1. El frontend pide `GET /next-services/get?vehicleId=<id>`; el backend verifica que el vehículo exista y esté activo y devuelve los pendientes activos ordenados: no realizados primero, urgentes primero, `dueDate` ascendente (nulos al final) y `createdOn` descendente.
2. El usuario crea un pendiente desde vehicle-history (sin servicio) o desde la pantalla de servicio (con `originServiceId` si el servicio ya existe). El backend valida que el vehículo exista y que el servicio de origen, si se envía, pertenezca al mismo vehículo.
3. El usuario edita razón, urgencia, observaciones y vencimiento. `vehicleId` y `originServiceId` no son editables.
4. El usuario marca un pendiente como realizado. Si se envía `serviceId`, se valida que pertenezca al mismo vehículo y se guarda en `realizedServiceId`; se registra `realizedOn`. Al desmarcar, se limpian ambos campos.
5. El usuario elimina un pendiente; se aplica baja lógica.

## Acceptance Criteria

- Los cinco endpoints existen, están protegidos con `authenticate` y `authorize("ADMIN", "USER_OWNER")` y documentados en Swagger.
- Las respuestas siguen `{ isError: false, data }` y los errores `{ isError: true, error }` con los códigos 201/200/400/401/403/404/500 de la convención.
- `dueInterval` y `dueDate` son coherentes: o ambos nulos, o ambos presentes; caso contrario 400.
- Un servicio de origen o de realización que no pertenezca al vehículo del pendiente devuelve 400.
- Un pendiente o vehículo inexistente o inactivo devuelve 404.
- `yarn type-check` y `yarn build` pasan sin `any`.

## Impacto

- **Capas:** ambos. Backend (este documento) define schema y API; frontend consume los endpoints nuevos.
- **Autenticación y autorización:** rutas nuevas protegidas con `authenticate` + `authorize("ADMIN", "USER_OWNER")`, igual que el resto de recursos. Sin cambios en JWT ni en roles.
- **Prisma:** sí requiere cambio de schema y una migración nueva (columnas nullable en `NextService` y dos relaciones opcionales a `Service`). La migración se genera pero su ejecución queda pendiente de confirmación explícita.

## Non-goals

- No se resuelve el filtrado por dueño de los datos.
- No se agregan tests ni lint (no existen en el repo).
- No se modifican los endpoints existentes de `/services`, `/vehicles` ni `/labors`.
