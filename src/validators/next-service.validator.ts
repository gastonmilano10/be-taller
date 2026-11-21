import z from "zod";

export const DUE_INTERVALS = [
  "ONE_WEEK",
  "ONE_MONTH",
  "THREE_MONTHS",
  "SIX_MONTHS",
  "ONE_YEAR",
  "CUSTOM",
] as const;

export const dueIntervalSchema = z.enum(DUE_INTERVALS);

const isValidCalendarDate = (value: string): boolean => {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const dueDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD")
  .refine(isValidCalendarDate, "La fecha no es válida");

const editableFieldsSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "La razón es obligatoria")
    .max(200, "La razón no puede superar 200 caracteres"),
  isUrgent: z.boolean().default(false),
  observations: z
    .string()
    .trim()
    .max(1000, "Las observaciones no pueden superar 1000 caracteres")
    .nullable()
    .optional(),
  dueInterval: dueIntervalSchema.nullable().optional(),
  dueDate: dueDateSchema.nullable().optional(),
  dueKilometers: z
    .number()
    .int("El kilometraje debe ser un número entero")
    .min(0, "El kilometraje no puede ser negativo")
    .nullable()
    .optional(),
});

type DueFields = {
  dueInterval?: z.infer<typeof dueIntervalSchema> | null;
  dueDate?: string | null;
};

const refineDueCoherence = (data: DueFields, ctx: z.RefinementCtx): void => {
  const hasInterval = data.dueInterval !== null && data.dueInterval !== undefined;
  const hasDate = data.dueDate !== null && data.dueDate !== undefined;

  if (hasInterval && !hasDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["dueDate"],
      message: "La fecha de vencimiento es obligatoria si se indica el intervalo",
    });
  }

  if (hasDate && !hasInterval) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["dueInterval"],
      message: "El intervalo es obligatorio si se indica la fecha de vencimiento",
    });
  }
};

export const createNextServiceSchema = editableFieldsSchema
  .extend({
    vehicleId: z.coerce.number().int().min(1, "El ID del vehículo es requerido"),
    originServiceId: z
      .number()
      .int()
      .min(1, "El ID del servicio de origen no es válido")
      .optional(),
  })
  .superRefine(refineDueCoherence);

export const editNextServiceSchema = editableFieldsSchema
  .extend({
    id: z.number().int().min(1, "El ID del pendiente es requerido"),
  })
  .superRefine(refineDueCoherence);

export const realizeNextServiceSchema = z.object({
  id: z.number().int().min(1, "El ID del pendiente es requerido"),
  isRealized: z.boolean({ required_error: "isRealized es obligatorio" }),
  serviceId: z
    .number()
    .int()
    .min(1, "El ID del servicio no es válido")
    .optional(),
});

export const deleteNextServiceSchema = z.object({
  id: z.number().int().min(1, "El ID del pendiente es requerido"),
});

export const getNextServicesSchema = z.object({
  vehicleId: z.coerce.number().int().min(1, "El ID del vehículo es requerido"),
  isRealized: z.enum(["true", "false"]).optional(),
});

export type CreateNextServiceInput = z.infer<typeof createNextServiceSchema>;
export type EditNextServiceInput = z.infer<typeof editNextServiceSchema>;
export type RealizeNextServiceInput = z.infer<typeof realizeNextServiceSchema>;
export type DeleteNextServiceInput = z.infer<typeof deleteNextServiceSchema>;
export type GetNextServicesInput = z.infer<typeof getNextServicesSchema>;
