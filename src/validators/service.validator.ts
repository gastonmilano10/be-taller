import { z } from "zod";

export const createServiceSchema = z.object({
  reason: z.string().min(1, "El motivo es obligatorio"),
  cost: z.number().optional(),
  attentionDate: z.string().optional(),
  observations: z.string().optional(),

  //Relations
  vehicleId: z.number().min(1, "El es obligatorio"),
});
