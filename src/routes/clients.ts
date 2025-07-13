import { Router } from "express";
import { createClient, getAllClients } from "../controllers/client.controller";
import { createClientSchema } from "../validators/client.validator";
import { validate } from "../middlewares/validate";

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

//POST CREAR NUEVO CLIENTE
router.post("/create", validate(createClientSchema), createClient);

export default router;
