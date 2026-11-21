import { Router } from "express";
import { validate } from "../middlewares/validate";
import {
  createNextServiceSchema,
  deleteNextServiceSchema,
  editNextServiceSchema,
  getNextServicesSchema,
  realizeNextServiceSchema,
} from "../validators/next-service.validator";
import {
  createNextService,
  deleteNextService,
  editNextService,
  getNextServicesByVehicle,
  realizeNextService,
} from "../controllers/next-service.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

/**
 * @swagger
 * /next-services/get:
 *   get:
 *     summary: Obtener los pendientes activos de un vehículo
 *     description: >
 *       Devuelve los pendientes ordenados por no realizados primero, urgentes primero,
 *       fecha de vencimiento ascendente (sin fecha al final) y fecha de creación descendente.
 *     tags: [NextServices]
 *     parameters:
 *       - in: query
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del vehículo
 *       - in: query
 *         name: isRealized
 *         required: false
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filtra por estado realizado
 *     responses:
 *       200:
 *         description: Lista de pendientes del vehículo (incluye originService y realizedService como { id, attentionDate } o null)
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Rol no permitido
 *       404:
 *         description: Vehículo no encontrado
 *       500:
 *         description: Error al obtener pendientes
 */
router.get(
  "/get",
  authenticate,
  authorize("ADMIN", "USER_OWNER"),
  validate(getNextServicesSchema, "query"),
  getNextServicesByVehicle,
);

/**
 * @swagger
 * /next-services/create:
 *   post:
 *     summary: Crear un pendiente para un vehículo
 *     tags: [NextServices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleId
 *               - reason
 *             properties:
 *               vehicleId:
 *                 type: integer
 *               reason:
 *                 type: string
 *                 maxLength: 200
 *               isUrgent:
 *                 type: boolean
 *                 default: false
 *               observations:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 1000
 *               dueInterval:
 *                 type: string
 *                 nullable: true
 *                 enum: [ONE_WEEK, ONE_MONTH, THREE_MONTHS, SIX_MONTHS, ONE_YEAR, CUSTOM]
 *                 description: Obligatorio si se envía dueDate
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: YYYY-MM-DD. Obligatorio si se envía dueInterval
 *               dueKilometers:
 *                 type: integer
 *                 minimum: 0
 *                 nullable: true
 *               originServiceId:
 *                 type: integer
 *                 description: Servicio del mismo vehículo en el que se detectó el pendiente
 *     responses:
 *       201:
 *         description: Pendiente creado exitosamente
 *       400:
 *         description: Error de validación o servicio de origen de otro vehículo
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Rol no permitido
 *       404:
 *         description: Vehículo no encontrado
 *       500:
 *         description: Error al crear pendiente
 */
router.post(
  "/create",
  authenticate,
  authorize("ADMIN", "USER_OWNER"),
  validate(createNextServiceSchema),
  createNextService,
);

/**
 * @swagger
 * /next-services/edit:
 *   put:
 *     summary: Editar los datos de un pendiente
 *     description: >
 *       Reemplaza los campos editables. Los opcionales no enviados quedan en null.
 *       vehicleId, originServiceId, isRealized y realizedServiceId no se modifican.
 *     tags: [NextServices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - reason
 *             properties:
 *               id:
 *                 type: integer
 *               reason:
 *                 type: string
 *                 maxLength: 200
 *               isUrgent:
 *                 type: boolean
 *                 default: false
 *               observations:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 1000
 *               dueInterval:
 *                 type: string
 *                 nullable: true
 *                 enum: [ONE_WEEK, ONE_MONTH, THREE_MONTHS, SIX_MONTHS, ONE_YEAR, CUSTOM]
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               dueKilometers:
 *                 type: integer
 *                 minimum: 0
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Pendiente editado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Rol no permitido
 *       404:
 *         description: Pendiente no encontrado
 *       500:
 *         description: Error al editar pendiente
 */
router.put(
  "/edit",
  authenticate,
  authorize("ADMIN", "USER_OWNER"),
  validate(editNextServiceSchema),
  editNextService,
);

/**
 * @swagger
 * /next-services/realize:
 *   put:
 *     summary: Marcar o desmarcar un pendiente como realizado
 *     description: >
 *       Con isRealized true registra realizedOn y, si se envía serviceId, lo vincula
 *       como servicio de realización. Con isRealized false limpia realizedOn y realizedServiceId.
 *     tags: [NextServices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - isRealized
 *             properties:
 *               id:
 *                 type: integer
 *               isRealized:
 *                 type: boolean
 *               serviceId:
 *                 type: integer
 *                 description: Servicio del mismo vehículo en el que se realizó
 *     responses:
 *       200:
 *         description: Estado del pendiente actualizado
 *       400:
 *         description: Error de validación o servicio de otro vehículo
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Rol no permitido
 *       404:
 *         description: Pendiente no encontrado
 *       500:
 *         description: Error al actualizar estado del pendiente
 */
router.put(
  "/realize",
  authenticate,
  authorize("ADMIN", "USER_OWNER"),
  validate(realizeNextServiceSchema),
  realizeNextService,
);

/**
 * @swagger
 * /next-services/delete:
 *   delete:
 *     summary: Eliminar un pendiente (baja lógica)
 *     tags: [NextServices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Pendiente eliminado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Rol no permitido
 *       404:
 *         description: Pendiente no encontrado
 *       500:
 *         description: Error al eliminar pendiente
 */
router.delete(
  "/delete",
  authenticate,
  authorize("ADMIN", "USER_OWNER"),
  validate(deleteNextServiceSchema),
  deleteNextService,
);

export default router;
