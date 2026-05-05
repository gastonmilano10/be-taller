import { z } from "zod";

export const getServiceStatusSchema = z.object({
  serviceId: z.coerce.number().min(1, "El ID del servicio es requerido"),
});

export const updateServiceStatusSchema = z
  .object({
    serviceId: z.number().min(1, "El ID del servicio es requerido"),
    serviceStateId: z.number().min(1).optional(),
    code: z
      .string()
      .trim()
      .transform((value) => value.toUpperCase())
      .optional(),
  })
  .refine((data) => data.serviceStateId || data.code, {
    message: "Debe enviar serviceStateId o code",
    path: ["serviceStateId"],
  });
