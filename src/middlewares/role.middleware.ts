import { RequestHandler } from "express";

export const authorize = (...roles: string[]) => {
  const findRole: RequestHandler = (req, res, next) => {
    if (!roles.includes(req.user?.role ?? "")) {
      res.status(403).json({ message: "Acceso denegado" });
      return;
    }
    next();
  };

  return findRole;
};
