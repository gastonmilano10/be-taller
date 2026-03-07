import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

//SWAGGER
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

//ROUTES
import clientsRoutes from "./routes/clients";
import vehiclesRoutes from "./routes/vehicles";
import servicesRoutes from "./routes/services";

const rateLimit = require("express-rate-limit");

const port = process.env.PORT || 3001;

dotenv.config();

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

//CLIENTS
app.use("/clients", clientsRoutes);

//VEHICLES
app.use("/vehicles", vehiclesRoutes);

//SERVICES
app.use("/services", servicesRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

//SWAGER
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
