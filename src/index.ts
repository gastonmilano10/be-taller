import dotenv from "dotenv";
dotenv.config();

import express, { Express, Request, Response } from "express";
import cors from "cors";

//SWAGGER
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

//ROUTES
import authRoutes from "./routes/auth";
import clientsRoutes from "./routes/clients";
import vehiclesRoutes from "./routes/vehicles";
import servicesRoutes from "./routes/services";
import serviceStatesRoutes from "./routes/service-states";
import materialsRoutes from "./routes/materials";
import laborsRoutes from "./routes/labors";

const rateLimit = require("express-rate-limit");

// Validación temprana de variables críticas
const requiredEnv = ["JWT_SECRET", "JWT_REFRESH_SECRET", "GOOGLE_CLIENT_ID", "DATABASE_URL"];
const missingEnv = requiredEnv.filter((v) => !process.env[v]);
if (missingEnv.length) {
  console.error(`[server] Faltan variables de entorno: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const port = process.env.PORT || 3001;

const app: Express = express();

// SE DEFINE RATE LIMIT RUTE, PARA LIMITAR EL NUMERO DE PETICIONES QUE SE PUEDEN HACER DESDE UNA MISMA IP EN UN PERIODO DE TIEMPO DETERMINADO
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // lIMITA CADA IP A 100 PETICIONES POR CADA 15 MINUTOS
  message: "Demasiadas peticiones, por favor intente nuevamente más tarde.", // MENSAJE DE ERROR CUANDO SE SUPERA EL LIMITE
});

// SE APLICA RATE LIMIT A TODAS LAS RUTAS
app.use(limiter);

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("SERVIDOR CORRIENDO OKKK");
});

//AUTH
app.use("/auth", authRoutes);

//CLIENTS
app.use("/clients", clientsRoutes);

//VEHICLES
app.use("/vehicles", vehiclesRoutes);

//SERVICES
app.use("/services", servicesRoutes);

//SERVICE STATES
app.use("/service-states", serviceStatesRoutes);

//MATERIALS
app.use("/materials", materialsRoutes);

//LABORS
app.use("/labors", laborsRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

//SWAGER
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
