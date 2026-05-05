import z from "zod";

export const createMaterialSchema = z.object({
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

export const editMaterialSchema = createMaterialSchema.extend({
  id: z.number().min(1, "El ID del material es requerido"),
});

export const deleteMaterialSchema = z.object({
  id: z.number().min(1, "El ID del material es requerido"),
});

export const getMaterialsSchema = z.object({
  serviceId: z.coerce.number().min(1, "El ID del servicio es requerido"),
});
