import { Router } from "express";
import { validate } from "../middlewares/validate";
import { createServiceSchema } from "../validators/service.validator";
import {
  createService,
  getAllServices,
} from "../controllers/service.controller";

const router = Router();

//GET OBTENER TODOS LOS SERVICES
router.get("/getAll", getAllServices);

//POST CREAR SERVICE
router.post("/create", validate(createServiceSchema), createService);

export default router;
