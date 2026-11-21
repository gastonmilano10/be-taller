## ADDED Requirements

### Requirement: Las rutas de pendientes requieren autenticación y rol
El sistema SHALL proteger todas las rutas bajo `/next-services` con un access JWT válido y con rol `ADMIN` o `USER_OWNER`.

#### Scenario: Request sin token
- **WHEN** un cliente llama a cualquier ruta de `/next-services` sin header `Authorization`
- **THEN** el sistema SHALL responder 401 con `{ message }`

#### Scenario: Token válido con rol permitido
- **WHEN** un usuario con rol `ADMIN` o `USER_OWNER` llama a una ruta de `/next-services` con datos válidos
- **THEN** el sistema SHALL procesar la solicitud

#### Scenario: Rol no permitido
- **WHEN** un usuario autenticado con un rol distinto de `ADMIN` o `USER_OWNER` llama a una ruta de `/next-services`
- **THEN** el sistema SHALL responder 403 con `{ message }`

### Requirement: Listar pendientes de un vehículo
El sistema SHALL exponer `GET /next-services/get?vehicleId=<id>` que devuelve los pendientes activos del vehículo, con un filtro opcional `isRealized`.

#### Scenario: Vehículo con pendientes
- **WHEN** se llama a `GET /next-services/get?vehicleId=5` y el vehículo 5 existe y está activo
- **THEN** el sistema SHALL responder 200 con `{ isError: false, data: NextService[] }`
- **AND** cada elemento SHALL incluir `id`, `vehicleId`, `reason`, `isUrgent`, `isRealized`, `observations`, `dueInterval`, `dueDate`, `dueKilometers`, `realizedOn`, `realizedServiceId`, `originServiceId`, `realizedService`, `originService`, `isActive`, `createdOn` y `modifiedOn`
- **AND** `realizedService` y `originService` SHALL ser `{ id, attentionDate }` o `null`

#### Scenario: Orden del listado
- **WHEN** el vehículo tiene pendientes realizados y no realizados, urgentes y no urgentes, con y sin `dueDate`
- **THEN** el sistema SHALL devolver primero los no realizados, dentro de cada grupo primero los urgentes, luego por `dueDate` ascendente con los nulos al final, y por último por `createdOn` descendente

#### Scenario: Pendientes eliminados
- **WHEN** un pendiente del vehículo tiene `isActive = false`
- **THEN** el sistema SHALL excluirlo del listado

#### Scenario: Filtro por estado
- **WHEN** se llama con `isRealized=false`
- **THEN** el sistema SHALL devolver solo los pendientes no realizados

#### Scenario: Vehículo sin pendientes
- **WHEN** el vehículo existe y no tiene pendientes activos
- **THEN** el sistema SHALL responder 200 con `data: []`

#### Scenario: Vehículo inexistente o inactivo
- **WHEN** `vehicleId` no corresponde a un vehículo activo
- **THEN** el sistema SHALL responder 404 con `{ isError: true, error }`

#### Scenario: Query inválida
- **WHEN** falta `vehicleId`, no es numérico, o `isRealized` no es `true` ni `false`
- **THEN** el sistema SHALL responder 400 con `{ message, errors }`

### Requirement: Crear un pendiente
El sistema SHALL exponer `POST /next-services/create` para crear un pendiente asociado a un vehículo.

#### Scenario: Creación mínima
- **WHEN** se envía `{ vehicleId: 5, reason: "Cambiar pastillas de freno" }` y el vehículo existe
- **THEN** el sistema SHALL responder 201 con el pendiente creado
- **AND** el pendiente SHALL tener `isUrgent = false`, `isRealized = false`, `isActive = true` y `createdOn`/`modifiedOn` con la fecha/hora actual en ISO 8601
- **AND** los campos opcionales no enviados SHALL ser `null`

#### Scenario: Creación con vencimiento por preset
- **WHEN** se envía `dueInterval: "THREE_MONTHS"` y `dueDate: "2027-02-13"`
- **THEN** el sistema SHALL persistir ambos valores tal como se enviaron

#### Scenario: Creación con kilometraje objetivo
- **WHEN** se envía `dueKilometers: 90000`
- **THEN** el sistema SHALL persistir `dueKilometers = 90000`

#### Scenario: Creación desde un servicio
- **WHEN** se envía `originServiceId` de un servicio activo del mismo vehículo
- **THEN** el sistema SHALL persistir `originServiceId` y devolver `originService` con `{ id, attentionDate }`

#### Scenario: Servicio de origen de otro vehículo
- **WHEN** `originServiceId` corresponde a un servicio de otro vehículo, o a un servicio inactivo o inexistente
- **THEN** el sistema SHALL responder 400 con `{ isError: true, error }` y no crear el pendiente

#### Scenario: Vehículo inexistente
- **WHEN** `vehicleId` no corresponde a un vehículo activo
- **THEN** el sistema SHALL responder 404 con `{ isError: true, error }`

#### Scenario: Vencimiento incoherente
- **WHEN** se envía `dueInterval` sin `dueDate`, o `dueDate` sin `dueInterval`
- **THEN** el sistema SHALL responder 400 con `{ message, errors }`

#### Scenario: Datos inválidos
- **WHEN** `reason` está vacío o supera 200 caracteres, `dueInterval` no es un valor permitido, `dueDate` no tiene formato `YYYY-MM-DD` válido, o `dueKilometers` es negativo o no entero
- **THEN** el sistema SHALL responder 400 con `{ message, errors }`

### Requirement: Editar un pendiente
El sistema SHALL exponer `PUT /next-services/edit` para reemplazar los datos editables de un pendiente: `reason`, `isUrgent`, `observations`, `dueInterval`, `dueDate` y `dueKilometers`.

#### Scenario: Edición válida
- **WHEN** se envía `{ id, reason, isUrgent, dueInterval: "ONE_MONTH", dueDate: "2026-12-13" }` para un pendiente activo
- **THEN** el sistema SHALL responder 200 con el pendiente actualizado y `modifiedOn` actualizado
- **AND** los campos editables opcionales no enviados SHALL quedar en `null`

#### Scenario: Campos no editables
- **WHEN** el body incluye `vehicleId`, `originServiceId`, `isRealized` o `realizedServiceId`
- **THEN** el sistema SHALL ignorar esos campos y no modificarlos

#### Scenario: Pendiente inexistente o eliminado
- **WHEN** `id` no corresponde a un pendiente activo
- **THEN** el sistema SHALL responder 404 con `{ isError: true, error }`

#### Scenario: Vencimiento incoherente en edición
- **WHEN** se envía solo uno de `dueInterval` o `dueDate`
- **THEN** el sistema SHALL responder 400 con `{ message, errors }`

### Requirement: Marcar o desmarcar un pendiente como realizado
El sistema SHALL exponer `PUT /next-services/realize` con `{ id, isRealized, serviceId? }`.

#### Scenario: Marcar como realizado sin servicio
- **WHEN** se envía `{ id, isRealized: true }`
- **THEN** el sistema SHALL responder 200 con `isRealized = true`, `realizedOn` con la fecha/hora actual y `realizedServiceId = null`

#### Scenario: Marcar como realizado en un servicio
- **WHEN** se envía `{ id, isRealized: true, serviceId }` y el servicio está activo y pertenece al mismo vehículo
- **THEN** el sistema SHALL responder 200 con `realizedServiceId = serviceId` y `realizedService` con `{ id, attentionDate }`

#### Scenario: Servicio de otro vehículo
- **WHEN** `serviceId` corresponde a otro vehículo, a un servicio inactivo o a uno inexistente
- **THEN** el sistema SHALL responder 400 con `{ isError: true, error }` y no modificar el pendiente

#### Scenario: Desmarcar
- **WHEN** se envía `{ id, isRealized: false }`
- **THEN** el sistema SHALL responder 200 con `isRealized = false`, `realizedOn = null` y `realizedServiceId = null`

#### Scenario: Pendiente inexistente o eliminado
- **WHEN** `id` no corresponde a un pendiente activo
- **THEN** el sistema SHALL responder 404 con `{ isError: true, error }`

### Requirement: Eliminar un pendiente
El sistema SHALL exponer `DELETE /next-services/delete` con `{ id }`, que aplica baja lógica.

#### Scenario: Eliminación válida
- **WHEN** se envía el `id` de un pendiente activo
- **THEN** el sistema SHALL responder 200 con el pendiente con `isActive = false` y `modifiedOn` actualizado
- **AND** el pendiente SHALL dejar de aparecer en `GET /next-services/get`

#### Scenario: Pendiente inexistente o ya eliminado
- **WHEN** `id` no corresponde a un pendiente activo
- **THEN** el sistema SHALL responder 404 con `{ isError: true, error }`

### Requirement: Documentación Swagger de pendientes
El sistema SHALL documentar en `/api-docs`, bajo el tag `NextServices`, las cinco rutas con sus parámetros, bodies y respuestas.

#### Scenario: Consulta de la documentación
- **WHEN** un desarrollador abre `/api-docs`
- **THEN** SHALL ver `GET /next-services/get`, `POST /next-services/create`, `PUT /next-services/edit`, `PUT /next-services/realize` y `DELETE /next-services/delete` con tipos que coinciden con la validación (`dueKilometers` integer, `dueDate` string `YYYY-MM-DD`)
