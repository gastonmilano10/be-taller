import { Router } from "express";
import { validate } from "../middlewares/validate";
import {
  createMaterialSchema,
  editMaterialSchema,
  deleteMaterialSchema,
  getMaterialsSchema,
} from "../validators/material.validator";
import {
  createMaterial,
  editMaterial,
  deleteMaterial,
  getMaterialsByService,
} from "../controllers/material.controller";

const router = Router();

/**
 * @swagger
 * /materials/get:
 *   get:
 *     summary: Obtener materiales por servicio
 *     tags: [Materials]
 *     parameters:
 *       - in: query
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID del servicio
 *     responses:
 *       200:
 *         description: Lista de materiales del servicio
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error al obtener materiales
 */
router.get("/get", validate(getMaterialsSchema, "query"), getMaterialsByService);

/**
 * @swagger
 * /materials/create:
 *   post:
 *     summary: Crear un nuevo material
 *     tags: [Materials]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - description
 *               - cost
 *               - quantity
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
 *         description: Material creado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error al crear material
 */
router.post("/create", validate(createMaterialSchema), createMaterial);

/**
 * @swagger
 * /materials/edit:
 *   put:
 *     summary: Editar un material existente
 *     tags: [Materials]
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
 *               - cost
 *               - quantity
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
 *         description: Material editado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Material no encontrado
 *       500:
 *         description: Error al editar material
 */
router.put("/edit", validate(editMaterialSchema), editMaterial);

/**
 * @swagger
 * /materials/delete:
 *   delete:
 *     summary: Eliminar un material (baja lógica)
 *     tags: [Materials]
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
 *         description: Material eliminado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Material no encontrado
 *       500:
 *         description: Error al eliminar material
 */
router.delete("/delete", validate(deleteMaterialSchema), deleteMaterial);

export default router;
