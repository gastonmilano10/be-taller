import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

//ROUTES
import clientsRoutes from "./routes/clients";
import vehiclesRoutes from "./routes/vehicles";
import servicesRoutes from "./routes/services";

const port = process.env.PORT || 3001;

dotenv.config();

const app: Express = express();
app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("SERVIDOR CORRIENDO OK");
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
