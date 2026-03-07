import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../@types/user.types";

type AuthenticationRequest = Request & { user: User };

export const authorize = (...roles: string[]) => {
  return (req: AuthenticationRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role ?? "")) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    next();
  };
};
