import { Router } from "express";
import { createClient, getClients } from "../controllers/client.controller";
import {
  createClientSchema,
  getClientsSchema,
} from "../validators/client.validator";
import { validate } from "../middlewares/validate";

const router = Router();

/**
 * @swagger
 * /clients/get:
 *   get:
 *     summary: Obtener clientes (con filtros opcionales)
 *     tags: [Clients]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: number
 *         description: ID del cliente
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Nombre del cliente
 *       - in: query
 *         name: surname
 *         schema:
 *           type: string
 *         description: Apellido del cliente
 *     responses:
 *       200:
 *         description: Lista de clientes
 *       400:
 *         description: Error de validación
 */
router.get("/get", validate(getClientsSchema, "query"), getClients);

/**
 * @swagger
 * /clients/create:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - surname
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error al crear cliente
 */
router.post("/create", validate(createClientSchema), createClient);

export default router;
