import { Router } from "express";
import { validate } from "../middlewares/validate";
import {
  getServiceStatusSchema,
  updateServiceStatusSchema,
} from "../validators/service-state.validator";
import {
  getServiceStatesCatalog,
  getServiceStatus,
  updateServiceStatus,
} from "../controllers/service-state.controller";

const router = Router();

/**
 * @swagger
 * /service-states/catalog:
 *   get:
 *     summary: Obtener catalogo de estados de servicio
 *     tags: [ServiceStates]
 *     responses:
 *       200:
 *         description: Catalogo de estados disponible para frontend
 *       500:
 *         description: Error al obtener catalogo
 */
router.get("/catalog", getServiceStatesCatalog);

/**
 * @swagger
 * /service-states/get:
 *   get:
 *     summary: Obtener estado actual e historial de un servicio
 *     tags: [ServiceStates]
 *     parameters:
 *       - in: query
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID del servicio
 *     responses:
 *       200:
 *         description: Estado actual e historial del servicio
 *       400:
 *         description: Error de validacion
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error al consultar el estado del servicio
 */
router.get("/get", validate(getServiceStatusSchema, "query"), getServiceStatus);

/**
 * @swagger
 * /service-states/update:
 *   post:
 *     summary: Actualizar estado de un servicio (append-only)
 *     tags: [ServiceStates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *             properties:
 *               serviceId:
 *                 type: number
 *               serviceStateId:
 *                 type: number
 *               code:
 *                 type: string
 *                 enum: [CREADO, EN_PROCESO, FINALIZADO, ENTREGADO]
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *       400:
 *         description: Error de validacion
 *       404:
 *         description: Servicio o estado no encontrado
 *       500:
 *         description: Error al actualizar el estado
 */
router.post("/update", validate(updateServiceStatusSchema), updateServiceStatus);

export default router;
