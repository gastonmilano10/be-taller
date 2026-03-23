import { Request, Response } from "express";
import prisma from "../prisma";
import {
  ensureServiceStatesCatalog,
  formatServiceStateHistory,
  getCurrentServiceState,
} from "./service-state.helpers";

export const getServiceStatesCatalog = async (req: Request, res: Response) => {
  try {
    await ensureServiceStatesCatalog(prisma);

    const states = await prisma.serviceState.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        description: true,
      },
      orderBy: [{ id: "asc" }],
    });

    res.status(200).json({ isError: false, data: states });
  } catch (error) {
    console.error("Error al obtener catalogo de estados:", error);
    res
      .status(500)
      .json({ isError: true, error: "Error al obtener catalogo de estados" });
  }
};

export const getServiceStatus = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.query;

    const existingService = await prisma.service.findFirst({
      where: { id: Number(serviceId), isActive: true },
      select: { id: true },
    });

    if (!existingService) {
      res.status(404).json({ isError: true, error: "Servicio no encontrado" });
      return;
    }

    const historyRows = await prisma.relationServiceStateService.findMany({
      where: {
        serviceId: Number(serviceId),
        serviceState: {
          isActive: true,
        },
      },
      include: {
        serviceState: {
          select: {
            id: true,
            code: true,
            description: true,
          },
        },
      },
      orderBy: [{ assignedOn: "desc" }, { id: "desc" }],
    });

    const stateHistory = formatServiceStateHistory(historyRows);
    const currentState = getCurrentServiceState(stateHistory);

    res.status(200).json({
      isError: false,
      data: {
        serviceId: Number(serviceId),
        currentState,
        stateHistory,
      },
    });
  } catch (error) {
    console.error("Error al obtener estado del servicio:", error);
    res
      .status(500)
      .json({ isError: true, error: "Error al obtener estado del servicio" });
  }
};

export const updateServiceStatus = async (req: Request, res: Response) => {
  try {
    const { serviceId, serviceStateId, code } = req.body;
    const now = new Date().toISOString();

    const result = await prisma.$transaction(async (tx) => {
      await ensureServiceStatesCatalog(tx);

      const existingService = await tx.service.findFirst({
        where: { id: serviceId, isActive: true },
      });

      if (!existingService) {
        return { type: "NOT_FOUND_SERVICE" as const };
      }

      const selectedState = await tx.serviceState.findFirst({
        where: {
          isActive: true,
          ...(serviceStateId ? { id: serviceStateId } : {}),
          ...(code ? { code } : {}),
        },
        select: {
          id: true,
          code: true,
          description: true,
        },
      });

      if (!selectedState) {
        return { type: "NOT_FOUND_STATE" as const };
      }

      const historyRow = await tx.relationServiceStateService.create({
        data: {
          serviceId,
          serviceStateId: selectedState.id,
          assignedOn: now,
        },
      });

      await tx.service.update({
        where: { id: serviceId },
        data: {
          modifiedOn: now,
        },
      });

      const historyRows = await tx.relationServiceStateService.findMany({
        where: {
          serviceId,
          serviceState: {
            isActive: true,
          },
        },
        include: {
          serviceState: {
            select: {
              id: true,
              code: true,
              description: true,
            },
          },
        },
        orderBy: [{ assignedOn: "desc" }, { id: "desc" }],
      });

      return {
        type: "OK" as const,
        historyRowId: historyRow.id,
        historyRows,
      };
    });

    if (result.type === "NOT_FOUND_SERVICE") {
      res.status(404).json({ isError: true, error: "Servicio no encontrado" });
      return;
    }

    if (result.type === "NOT_FOUND_STATE") {
      res.status(404).json({ isError: true, error: "Estado no encontrado" });
      return;
    }

    const stateHistory = formatServiceStateHistory(result.historyRows);
    const currentState = getCurrentServiceState(stateHistory);

    res.status(200).json({
      isError: false,
      data: currentState,
    });
  } catch (error) {
    console.error("Error al actualizar estado del servicio:", error);
    res.status(500).json({
      isError: true,
      error: "Error al actualizar estado del servicio",
    });
  }
};
