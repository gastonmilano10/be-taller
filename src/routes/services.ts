import { Router } from "express";
import { validate } from "../middlewares/validate";
import { createServiceSchema } from "../validators/service.validator";
import {
  createService,
  getAllServices,
} from "../controllers/service.controller";

const router = Router();

/**
 * @swagger
 * /services/getAll:
 *   get:
 *     summary: Obtener todos los servicios activos
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Lista de servicios activos
 */
//GET OBTENER TODOS LOS SERVICES
router.get("/getAll", getAllServices);

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
 *               - cost
 *               - vehicleId
 *             properties:
 *               reason:
 *                 type: string
 *               cost:
 *                 type: float
 *               vehicleId:
 *                 type: number
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
//POST CREAR SERVICE
router.post("/create", validate(createServiceSchema), createService);

export default router;
