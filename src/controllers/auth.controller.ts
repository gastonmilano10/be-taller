import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import prisma from "../prisma";
import {
  createAccessToken,
  createRefreshToken,
} from "../services/auth.servide";
import { UserRole } from "../@types/user.types";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
  const { tokenId } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email)
      return res.status(400).json({ message: "Token invalido" });

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

    const accessToken = createAccessToken({
      ...user,
      role: UserRole[user.role as keyof typeof UserRole],
    });
    const refreshToken = createRefreshToken({
      ...user,
      role: UserRole[user.role as keyof typeof UserRole],
    });

    res.json({ accessToken, refreshToken, user });
  } catch (error) {
    res.status(401).json({ message: "Error en la autenticación con google", error });
  }
};
