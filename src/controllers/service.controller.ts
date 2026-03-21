import { Request, Response } from "express";
import prisma from "../prisma";
import {
  ensureServiceStatesCatalog,
  formatServiceStateHistory,
  getCurrentServiceState,
} from "./service-state.helpers";

export const createService = async (req: Request, res: Response) => {
  try {
    const now = new Date().toISOString();

    const newService = await prisma.$transaction(async (tx) => {
      await ensureServiceStatesCatalog(tx);

      const createdState = await tx.serviceState.findFirst({
        where: {
          code: "CREADO",
          isActive: true,
        },
      });

      if (!createdState) {
        throw new Error("No se encontro el estado inicial CREADO");
      }

      const createdService = await tx.service.create({
        data: {
          ...req.body,
          createdOn: now,
          modifiedOn: now,
        },
      });

      await tx.relationServiceStateService.create({
        data: {
          serviceId: createdService.id,
          serviceStateId: createdState.id,
          assignedOn: now,
        },
      });

      return createdService;
    });

    res.status(201).json({ isError: false, data: newService });
  } catch (error) {
    console.error("Error al crer servicio:", error);
    res.status(500).json({ isError: true, error: "Error al crear servicio" });
  }
};

export const getServices = async (req: Request, res: Response) => {
  try {
    const { id, vehicleId, attentionDate } = req.query;

    await ensureServiceStatesCatalog(prisma);

    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        ...(id && { id: Number(id) }),
        ...(vehicleId && { vehicleId: Number(vehicleId) }),
        ...(attentionDate && { attentionDate: String(attentionDate) }),
      },
      include: {
        vehicle: true,
        materials: {
          where: { isActive: true },
        },
        labors: {
          where: { isActive: true },
        },
        RelationServiceStateService: {
          where: {
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
          orderBy: [
            { assignedOn: "desc" },
            { id: "desc" },
          ],
        },
      },

      orderBy: { attentionDate: "desc" },
    });

    const servicesWithStates = services.map(
      ({ RelationServiceStateService, ...service }) => {
        const stateHistory = formatServiceStateHistory(RelationServiceStateService);
        const currentState = getCurrentServiceState(stateHistory);

        return {
          ...service,
          currentState,
          stateHistory,
        };
      },
    );

    res.status(200).json({ isError: false, data: servicesWithStates });
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res
      .status(500)
      .json({ isError: true, error: "Error al obtener servicios" });
  }
};
