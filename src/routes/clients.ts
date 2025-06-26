import { Router } from "express";
import { createClient, getAllClients } from "../controllers/client.controller";
import { createClientSchema } from "../validators/client.validator";
import { validate } from "../middlewares/validate";

const router = Router();

//GET OBTENER TODOS LOS CLIENTES
router.get("/getAll", getAllClients);

//POST CREAR NUEVO CLIENTE
router.post("/create", validate(createClientSchema), createClient);

export default router;
