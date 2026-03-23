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
import serviceStatesRoutes from "./routes/service-states";
import materialsRoutes from "./routes/materials";
import laborsRoutes from "./routes/labors";

const port = process.env.PORT || 3001;

dotenv.config();

const app: Express = express();
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
