import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { User } from "../types/user.types";

export const authenticate: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: "Token requerido" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string, {
      issuer: "be-taller",
      audience: "fe-taller",
    }) as User;

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalido" });
    return;
  }
};
