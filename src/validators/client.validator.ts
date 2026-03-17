import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  surname: z.string().min(1, "El apellido es obligatorio"),
  phone: z.string().min(1, "El teléfono es obligatorio"),
  address: z.string().optional(),
  email: z
    .string()
    .email("Correo electrónico no válido")
    .optional()
    .or(z.literal("")),

  createdOn: z.string().min(1, "Fecha de creación es requerida"),
  modifiedOn: z.string().min(1, "Fecha de modificación es requerida"),
});

export const getClientsSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().optional(),
  surname: z.string().optional(),
});

export const editClientSchema = z
  .object({
    id: z.number().int().min(1, "El id es obligatorio"),
    name: z.string().min(1, "El nombre es obligatorio").optional(),
    surname: z.string().min(1, "El apellido es obligatorio").optional(),
    phone: z.string().min(1, "El teléfono es obligatorio").optional(),
    address: z.string().optional(),
    modifiedOn: z.string().min(1, "Fecha de modificación es requerida"),
    email: z
      .string()
      .email("Correo electrónico no válido")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    ({ name, surname, phone, address, email }) =>
      [name, surname, phone, address, email].some(
        (value) => value !== undefined,
      ),
    {
      message: "Debe enviar al menos un campo para editar",
      path: ["id"],
    },
  );
