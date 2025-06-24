import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import testRoutes from "./routes/services";

dotenv.config();

const app: Express = express();
app.use(express.json());
const port = process.env.PORT || 3001;

app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Serversssss");
});

app.use("/services", testRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
