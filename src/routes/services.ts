import { Router } from "express";
import { validate } from "../middlewares/validate";
import {
  createServiceSchema,
  getServicesSchema,
} from "../validators/service.validator";
import { createService, getServices } from "../controllers/service.controller";

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
 *         name: attentionDate
 *         schema:
 *           type: string
 *         description: Fecha de atención
 *     responses:
 *       200:
 *         description: Lista de servicios activos con currentState y stateHistory
 *       400:
 *         description: Error de validación
 */
router.get("/get", validate(getServicesSchema, "query"), getServices);

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
router.post("/create", validate(createServiceSchema), createService);

export default router;
