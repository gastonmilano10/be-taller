import { Router } from "express";
import {
  createVehicle,
  editVehicle,
  getVehicles,
  deleteVehicle,
} from "../controllers/vehicle.controller";
import { validate } from "../middlewares/validate";
import {
  createVehicleSchema,
  deleteVehicleSchema,
  editVehicleSchema,
} from "../validators/vehicle.validator";

const router = Router();

/**
 * @swagger
 * /vehicles/get:
 *   get:
 *     summary: Obtener todos los vehiculos activos
 *     tags: [Vehicles]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: number
 *         description: ID del vehículo
 *       - in: query
 *         name: number
 *         schema:
 *           type: string
 *         description: Número de matrícula del vehículo
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: number
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Lista de vehiculos activos
 */
router.get("/get", getVehicles);

/**
 * @swagger
 * /vehicles/create:
 *   post:
 *     summary: Crear un nuevo vehiculo
 *     tags: [Vehicles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *               - brand
 *               - model
 *               - year
 *               - engineCapacity
 *               - kilometers
 *               - clientId
 *             properties:
 *               number:
 *                 type: string
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: number
 *               engineCapacity:
 *                 type: number
 *               clientId:
 *                 type: number
 *               kilometers:
 *                 type: number
 *     responses:
 *       201:
 *         description: Vehiculo creado exitosamente
 *       400:
 *         description: Error de validacion
 *       500:
 *         description: Error al crear vehiculo
 */
router.post("/create", validate(createVehicleSchema), createVehicle);

/**
 * @swagger
 * /vehicles/edit:
 *   put:
 *     summary: Editar un vehiculo existente
 *     tags: [Vehicles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - number
 *               - brand
 *               - model
 *               - year
 *               - engineCapacity
 *               - kilometers
 *               - clientId
 *             properties:
 *               id:
 *                 type: number
 *               number:
 *                 type: string
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: number
 *               engineCapacity:
 *                 type: number
 *               kilometers:
 *                 type: number
 *               clientId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Vehiculo editado exitosamente
 *       400:
 *         description: Error de validacion
 *       404:
 *         description: Vehiculo no encontrado
 *       500:
 *         description: Error al editar vehiculo
 */
router.put("/edit", validate(editVehicleSchema), editVehicle);

router.delete("/delete", validate(deleteVehicleSchema), deleteVehicle);

export default router;
