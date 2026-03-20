import { z } from "zod";

export const createServiceSchema = z.object({
  vehicleId: z.number().min(1, "El vehículo es obligatorio"),
  reason: z.string().min(1, "El motivo es obligatorio"),
  vehicleKilometers: z
    .string()
    .min(0, "Los kilómetros del vehículo son requeridos"),
  attentionDate: z.string().min(1, "La fecha de atención es obligatoria"),

  cost: z.string().optional(),
  observations: z.string().optional(),
});

export const getServicesSchema = z.object({
  id: z.coerce.number().optional(),
  vehicleId: z.coerce.number().optional(),
  attentionDate: z.string().optional(),
});
