import z from "zod";

export const createVehicleSchema = z.object({
  number: z.string().min(1, "La matricula es requerida"),
  brand: z.string().min(1, "La marca es requerida"),
  model: z.string().min(1, "El modelo es requerido"),
  year: z.number().min(1, "El año es requerido"),
  engineCapacity: z.number().min(1, "Las cilindradas son requeridas"),
  kilometers: z.number().min(0, "Los kilómetros son requeridos"),

  createdOn: z.string().min(1, "Fecha de creación es requerida"),
  modifiedOn: z.string().min(1, "Fecha de modificación es requerida"),

  clientId: z.number().int().min(1, "El cliente es requerido"),
});

export const editVehicleSchema = createVehicleSchema
  .omit({
    createdOn: true,
  })
  .extend({
    id: z.number().min(1, "El ID del vehículo es requerido"),
  });

export const deleteVehicleSchema = z.object({
  id: z.number().min(1, "El ID del vehículo es requerido"),
});
