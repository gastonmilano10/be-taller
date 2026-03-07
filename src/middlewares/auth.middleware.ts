import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type AuthenticationRequest = Request & { user: string | jwt.JwtPayload };

export const authenticate = (
  req: AuthenticationRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: "Token requerido" });

  //OBTENEMOS EL TOKEN
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? "");

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalido" });
  }
};
