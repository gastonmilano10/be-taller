import { Router } from "express";
import {
  googleLogin,
  refreshToken,
  logout,
} from "../controllers/auth.controller";

const router = Router();

// POST /auth/google - Login inicial con token de Google
router.post("/google", googleLogin);

// POST /auth/refresh - Renovar access token usando refresh token
router.post("/refresh", refreshToken);

// POST /auth/logout - Cerrar sesión
router.post("/logout", logout);

export default router;
