import { Router } from "express";
import { validate } from "../middlewares/validate";
import {
  createServiceSchema,
  getServicesSchema,
  editServiceSchema,
} from "../validators/service.validator";
import { createService, getServices, editService } from "../controllers/service.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /services/get:
 *   get:
 *     summary: Obtener servicios (con filtros opcionales) con estado actual e historial
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: number
 *         description: ID del servicio
 *       - in: query
 *         name: vehicleId
 *         schema:
 *           type: number
 *         description: ID del vehículo
 *       - in: query
 *         name: attentionDateFrom
 *         schema:
 *           type: string
 *         description: Fecha/hora inicial del rango (inclusive, formato ISO datetime)
 *       - in: query
 *         name: attentionDateTo
 *         schema:
 *           type: string
 *         description: Fecha/hora final del rango (inclusive, formato ISO datetime)
 *     responses:
 *       200:
 *         description: Lista de servicios activos con currentState y stateHistory
 *       400:
 *         description: Error de validación
 */
router.get("/get", authenticate, validate(getServicesSchema, "query"), getServices);

/**
 * @swagger
 * /services/create:
 *   post:
 *     summary: Crear un nuevo servicio
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *               - vehicleId
 *               - vehicleKilometers
 *               - attentionDate
 *             properties:
 *               reason:
 *                 type: string
 *               vehicleId:
 *                 type: number
 *               vehicleKilometers:
 *                 type: string
 *               attentionDate:
 *                 type: string
 *               cost:
 *                 type: string
 *               observations:
 *                 type: string
 *     responses:
 *       201:
 *         description: Servicio creado
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 */
router.post("/create", authenticate, validate(createServiceSchema), createService);

/**
 * @swagger
 * /services/edit:
 *   put:
 *     summary: Editar un servicio existente
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - reason
 *               - vehicleId
 *               - vehicleKilometers
 *               - attentionDate
 *             properties:
 *               id:
 *                 type: number
 *               reason:
 *                 type: string
 *               vehicleId:
 *                 type: number
 *               vehicleKilometers:
 *                 type: string
 *               attentionDate:
 *                 type: string
 *               cost:
 *                 type: string
 *               observations:
 *                 type: string
 *     responses:
 *       200:
 *         description: Servicio editado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error al editar servicio
 */
router.put("/edit", authenticate, validate(editServiceSchema), editService);

export default router;
