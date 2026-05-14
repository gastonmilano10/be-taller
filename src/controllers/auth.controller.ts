import { RequestHandler } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../prisma";
import {
  createAccessToken,
  createRefreshToken,
} from "../services/auth.servide";
import { User, UserRole } from "../types/user.types";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    const accessToken = createAccessToken(toUserWithRole(user));
    const refreshToken = createRefreshToken(toUserWithRole(user));

    res.json({ accessToken, refreshToken, user });
  } catch (error) {
    console.error("[auth] googleLogin error:", error);
    res.status(401).json({ message: "Error en la autenticación con google" });
  }
};

export const refreshToken: RequestHandler = async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    res.status(400).json({ message: "Refresh token requerido" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string,
    ) as JwtPayload & { userId: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ message: "Usuario no válido" });
      return;
    }

    const accessToken = createAccessToken(toUserWithRole(user));
    const newRefreshToken = createRefreshToken(toUserWithRole(user));

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("[auth] refreshToken error:", error);
    res.status(401).json({ message: "Refresh token inválido" });
  }
};

export const logout: RequestHandler = async (_req, res) => {
  // TODO (Fase 3): revocar refresh token persistido en BD.
  res.status(204).send();
};
