import { Router } from "express";
import {
  googleLogin,
  refreshToken,
  logout,
  getMe,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// POST /auth/google - Login inicial con token de Google
router.post("/google", googleLogin);

// POST /auth/refresh - Renovar access token usando refresh token
router.post("/refresh", refreshToken);

// POST /auth/logout - Cerrar sesión
router.post("/logout", logout);

// GET /auth/me - Obtener usuario autenticado actual
router.get("/me", authenticate, getMe);

export default router;
