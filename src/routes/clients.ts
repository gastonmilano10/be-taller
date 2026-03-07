import { Router } from "express";
import { createClient, getAllClients } from "../controllers/client.controller";
import { createClientSchema } from "../validators/client.validator";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

/**
 * @swagger
 * /clients/getAll:
 *   get:
 *     summary: Obtener todos los clientes activos
 *     tags: [Clients]
 *     responses:
 *       200:
 *         description: Lista de clientes activos
 */
router.get("/getAll", getAllClients);

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
router.post(
  "/create",
  authenticate,
  authorize("ADMIN"),
  validate(createClientSchema),
  createClient,
);

export default router;
