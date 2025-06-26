import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  surname: z.string().min(1, "El apellido es obligatorio"),
  phone: z.string().min(1, "El teléfono es obligatorio"),
  email: z.string().email("El correo electrónico no es válido").optional(),
});
