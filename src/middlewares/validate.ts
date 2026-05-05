import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

export const validate =
  (schema: ZodTypeAny, source: "body" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    const data = source === "query" ? req.query : req.body;
    const result = schema.safeParse(data);

    if (!result.success) {
      res.status(400).json({
        message: "Validación fallida",
        errors: result.error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });

      return;
    }

    if (source === "query") {
      Object.assign(req.query, result.data);
    } else {
      req.body = result.data;
    }
    next();
  };
