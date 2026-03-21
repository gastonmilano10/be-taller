import { Router } from "express";
import { validate } from "../middlewares/validate";
import {
  createLaborSchema,
  editLaborSchema,
  deleteLaborSchema,
  getLaborsSchema,
} from "../validators/labor.validator";
import {
  createLabor,
  deleteLabor,
  editLabor,
  getLaborsByService,
} from "../controllers/labor.controller";

const router = Router();

/**
 * @swagger
 * /labors/get:
 *   get:
 *     summary: Obtener labores por servicio
 *     tags: [Labors]
 *     parameters:
 *       - in: query
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID del servicio
 *     responses:
 *       200:
 *         description: Lista de labores del servicio
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error al obtener labores
 */
router.get("/get", validate(getLaborsSchema, "query"), getLaborsByService);

/**
 * @swagger
 * /labors/create:
 *   post:
 *     summary: Crear una nueva labor
 *     tags: [Labors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - description
 *             properties:
 *               serviceId:
 *                 type: number
 *               description:
 *                 type: string
 *               cost:
 *                 type: string
 *               quantity:
 *                 type: string
 *     responses:
 *       201:
 *         description: Labor creada exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error al crear labor
 */
router.post("/create", validate(createLaborSchema), createLabor);

/**
 * @swagger
 * /labors/edit:
 *   put:
 *     summary: Editar una labor existente
 *     tags: [Labors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - serviceId
 *               - description
 *             properties:
 *               id:
 *                 type: number
 *               serviceId:
 *                 type: number
 *               description:
 *                 type: string
 *               cost:
 *                 type: string
 *               quantity:
 *                 type: string
 *     responses:
 *       200:
 *         description: Labor editada exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Labor no encontrada
 *       500:
 *         description: Error al editar labor
 */
router.put("/edit", validate(editLaborSchema), editLabor);

/**
 * @swagger
 * /labors/delete:
 *   delete:
 *     summary: Eliminar una labor (baja lógica)
 *     tags: [Labors]
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
 *                 type: number
 *     responses:
 *       200:
 *         description: Labor eliminada exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Labor no encontrada
 *       500:
 *         description: Error al eliminar labor
 */
router.delete("/delete", validate(deleteLaborSchema), deleteLabor);

export default router;
