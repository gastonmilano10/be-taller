import { Router } from "express";
import {
  createVehicle,
  getAllVehicles,
} from "../controllers/vehicle.controller";
import { validate } from "../middlewares/validate";
import { createVehicleSchema } from "../validators/vehicle.validator";

const router = Router();

//GET OBTENER TODOS LOS VEHICULOS
router.get("/getAll", getAllVehicles);

router.post("/create", validate(createVehicleSchema), createVehicle);

export default router;
