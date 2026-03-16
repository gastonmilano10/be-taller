import z from "zod";

export const createVehicleSchema = z.object({
  number: z.string().min(1, "La matricula es requerida"),
  brand: z.string().min(1, "La marca es requerida"),
  model: z.string().min(1, "El modelo es requerido"),
  year: z.number().min(1, "El año es requerido"),
  engineCapacity: z.number().min(1, "Las cilindradas son requeridas"),
  createdOn: z.string().min(1, "Fecha de creación es requerida"),
  modifiedOn: z.string().min(1, "Fecha de modificación es requerida"),

  clientId: z.number().int().min(1, "El cliente es requerido"),
});
