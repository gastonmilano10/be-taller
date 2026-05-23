import dotenv from "dotenv";
// Carga .env.local primero (override) y luego .env como fallback
dotenv.config({ path: ".env.local" });
dotenv.config({ override: false });

import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import prisma from "./prisma";

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

// Validación temprana de variables críticas — falla al inicio si falta algo
const requiredEnv = ["JWT_SECRET", "JWT_REFRESH_SECRET", "GOOGLE_CLIENT_ID", "DATABASE_URL"];
const missingEnv = requiredEnv.filter((v) => !process.env[v]);
if (missingEnv.length) {
  console.error(`[server] Faltan variables de entorno: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const port = process.env.PORT || 3001;

const app: Express = express();

// Headers de seguridad HTTP (XSS, clickjacking, MIME sniffing, etc.)
app.use(helmet());

// Parsear cookies (necesario para leer refreshToken HttpOnly)
app.use(cookieParser());

// Rate limit global: 100 req cada 15 min por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Demasiadas peticiones, por favor intente nuevamente más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Rate limit estricto para auth: 10 intentos por minuto por IP (anti fuerza bruta)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Demasiados intentos de autenticación, intente nuevamente en un minuto.",
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS: solo orígenes en FRONTEND_URL, con soporte credentials (necesario para cookies en Fase 3)
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Sin origin: curl, Postman, health checks — permitir
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true,
  }),
);

// Limitar tamaño de payload para evitar DoS por body gigante
app.use(express.json({ limit: "100kb" }));

app.get("/", (req: Request, res: Response) => {
  res.send("SERVIDOR CORRIENDO OKKK");
});

//AUTH (rate limit estricto)
app.use("/auth", authLimiter, authRoutes);

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

// Limpieza periódica de refresh tokens expirados o revocados (cada 24h)
setInterval(async () => {
  try {
    const { count } = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } },
        ],
      },
    });
    if (count > 0) console.log(`[cleanup] ${count} refresh tokens eliminados`);
  } catch (err) {
    console.error("[cleanup] Error limpiando tokens:", err);
  }
}, 24 * 60 * 60 * 1000);

//SWAGGER
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware de error global
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server] Error no manejado:", err.message);
  res.status(500).json({ message: "Error interno del servidor" });
});
