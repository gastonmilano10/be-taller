import { RequestHandler } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../prisma";
import {
  createAccessToken,
  createRefreshToken,
  hashToken,
  REFRESH_TOKEN_TTL_MS,
} from "../services/auth.servide";
import { User, UserRole } from "../types/user.types";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const IS_PROD = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: "strict" as const,
  maxAge: REFRESH_TOKEN_TTL_MS,
};

const toUserWithRole = (user: any): User => ({
  ...user,
  role: UserRole[user.role as keyof typeof UserRole],
});

export const googleLogin: RequestHandler = async (req, res) => {
  const { tokenId } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      res.status(400).json({ message: "Token invalido" });
      return;
    }

    if (!payload.email_verified) {
      res.status(400).json({ message: "Email de Google no verificado" });
      return;
    }

    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          role: "USER_OWNER",
        },
      });
    }

    const userWithRole = toUserWithRole(user);
    const accessToken = createAccessToken(userWithRole);
    const refreshToken = createRefreshToken(userWithRole);

    // Persistir hash del refresh token en BD (nunca el token plano)
    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] ?? null,
      },
    });

    // Refresh token viaja solo en cookie HttpOnly — FE nunca lo puede leer desde JS
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.json({ accessToken, user });
  } catch (error) {
    console.error("[auth] googleLogin error:", error);
    res.status(401).json({ message: "Error en la autenticación con google" });
  }
};

export const refreshToken: RequestHandler = async (req, res) => {
  const token = req.cookies?.refreshToken as string | undefined;

  if (!token) {
    res.status(400).json({ message: "Refresh token requerido" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string,
    ) as JwtPayload & { userId: number };

    const tokenHash = hashToken(token);
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    // Token no existe o ya fue revocado → posible robo, revocar toda la familia de sesiones
    if (!stored || stored.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { userId: decoded.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      res.clearCookie("refreshToken", COOKIE_OPTIONS);
      res
        .status(401)
        .json({ message: "Sesión inválida, iniciá sesión nuevamente" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ message: "Usuario no válido" });
      return;
    }

    const userWithRole = toUserWithRole(user);
    const newAccessToken = createAccessToken(userWithRole);
    const newRefreshToken = createRefreshToken(userWithRole);
    const newHash = hashToken(newRefreshToken);

    // Revocar token viejo y registrar el nuevo (rotación)
    await prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date(), replacedBy: newHash },
    });
    await prisma.refreshToken.create({
      data: {
        tokenHash: newHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] ?? null,
      },
    });

    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("[auth] refreshToken error:", error);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.status(401).json({ message: "Refresh token inválido" });
  }
};

export const logout: RequestHandler = async (req, res) => {
  const token = req.cookies?.refreshToken as string | undefined;

  if (token) {
    try {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(token), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Siempre limpiar la cookie aunque falle la BD
    }
  }

  res.clearCookie("refreshToken", COOKIE_OPTIONS);
  res.status(204).send();
};
