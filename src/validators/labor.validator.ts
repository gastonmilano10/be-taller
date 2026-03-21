import z from "zod";

export const createLaborSchema = z.object({
  serviceId: z.coerce.number().min(1, "El ID del servicio es requerido"),
  description: z.string().min(1, "La descripcion es obligatoria"),
  cost: z
    .string()
    .transform((value) => value.trim())
    .optional(),
  quantity: z
    .string()
    .transform((value) => value.trim())
    .optional(),
});

export const editLaborSchema = createLaborSchema.extend({
  id: z.number().min(1, "El ID de la labor es requerido"),
});

export const deleteLaborSchema = z.object({
  id: z.number().min(1, "El ID de la labor es requerido"),
});

export const getLaborsSchema = z.object({
  serviceId: z.coerce.number().min(1, "El ID del servicio es requerido"),
});
