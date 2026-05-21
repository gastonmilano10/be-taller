import crypto from "crypto";
import jwt from "jsonwebtoken";

import { User } from "../types/user.types";

export const createAccessToken = (user: User) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "30m",
    },
  );
};

export const createRefreshToken = (user: User) => {
  return jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });
};

/** SHA-256 del token. Se guarda en BD, nunca el token plano. */
export const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

/** 7 días en ms — para cookie maxAge y expiresAt en BD. */
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
