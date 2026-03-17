import { z } from "zod";

export const createServiceSchema = z.object({
  reason: z.string().min(1, "El motivo es obligatorio"),
  cost: z.number().optional(),
  attentionDate: z.string().optional(),
  observations: z.string().optional(),
  vehicleKilometers: z
    .number()
    .min(0, "Los kilómetros del vehículo son requeridos"),

  vehicleId: z.number().min(1, "El vehículo es obligatorio"),
});
