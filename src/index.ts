import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import servicesRoutes from "./routes/services";
import clientsRoutes from "./routes/clients";

const port = process.env.PORT || 3001;

dotenv.config();

const app: Express = express();
app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("SERVIDOR CORRIENDO OK");
});

//SERVICEs
app.use("/services", servicesRoutes);

//CLIENTs
app.use("/clients", clientsRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
