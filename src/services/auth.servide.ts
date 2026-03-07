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
