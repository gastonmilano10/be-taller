import { Prisma, PrismaClient } from "@prisma/client";

export const DEFAULT_SERVICE_STATES = [
  { code: "CREADO", description: "Creado" },
  { code: "EN_PROCESO", description: "En proceso" },
  { code: "FINALIZADO", description: "Finalizado" },
  { code: "ENTREGADO", description: "Entregado" },
] as const;

export type ServiceStateCode = (typeof DEFAULT_SERVICE_STATES)[number]["code"];

export const ensureServiceStatesCatalog = async (
  db: Prisma.TransactionClient | PrismaClient,
) => {
  const now = new Date().toISOString();

  await Promise.all(
    DEFAULT_SERVICE_STATES.map((state) =>
      db.serviceState.upsert({
        where: { code: state.code },
        update: {
          description: state.description,
          isActive: true,
          modifiedOn: now,
        },
        create: {
          code: state.code,
          description: state.description,
          isActive: true,
          createdOn: now,
          modifiedOn: now,
        },
      }),
    ),
  );
};

export const formatServiceStateHistory = (
  history: Array<{
    id: number;
    assignedOn: string;
    serviceState: {
      id: number;
      code: string;
      description: string;
    };
  }>,
) =>
  history.map((item) => ({
    relationId: item.id,
    assignedOn: item.assignedOn,
    state: {
      id: item.serviceState.id,
      code: item.serviceState.code,
      description: item.serviceState.description,
    },
  }));

export const getCurrentServiceState = (
  history: ReturnType<typeof formatServiceStateHistory>,
) => {
  if (history.length === 0) {
    return null;
  }

  return history[0];
};
