import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import {
  CreateNextServiceInput,
  DeleteNextServiceInput,
  EditNextServiceInput,
  getNextServicesSchema,
  RealizeNextServiceInput,
} from "../validators/next-service.validator";

const serviceRefSelect = {
  select: { id: true, attentionDate: true },
} satisfies Prisma.ServiceDefaultArgs;

const nextServiceInclude = {
  originService: serviceRefSelect,
  realizedService: serviceRefSelect,
} satisfies Prisma.NextServiceInclude;

const nextServiceOrderBy = [
  { isRealized: "asc" },
  { isUrgent: "desc" },
  { dueDate: { sort: "asc", nulls: "last" } },
  { createdOn: "desc" },
] satisfies Prisma.NextServiceOrderByWithRelationInput[];

const findActiveVehicle = (vehicleId: number) =>
  prisma.vehicle.findFirst({ where: { id: vehicleId, isActive: true } });

const findActiveNextService = (id: number) =>
  prisma.nextService.findFirst({ where: { id, isActive: true } });

/**
 * Indica si el servicio existe, está activo y pertenece al vehículo indicado.
 */
const isServiceOfVehicle = async (
  serviceId: number,
  vehicleId: number,
): Promise<boolean> => {
  const service = await prisma.service.findFirst({
    where: { id: serviceId, vehicleId, isActive: true },
    select: { id: true },
  });
  return service !== null;
};

export const getNextServicesByVehicle = async (req: Request, res: Response) => {
  try {
    // Se re-parsea req.query: en Express 5 es un getter y validate() no puede
    // reemplazarlo con los valores transformados.
    const { vehicleId, isRealized } = getNextServicesSchema.parse(req.query);

    const vehicle = await findActiveVehicle(vehicleId);

    if (!vehicle) {
      res.status(404).json({ isError: true, error: "Vehículo no encontrado" });
      return;
    }

    const nextServices = await prisma.nextService.findMany({
      where: {
        vehicleId,
        isActive: true,
        ...(isRealized !== undefined && { isRealized: isRealized === "true" }),
      },
      include: nextServiceInclude,
      orderBy: nextServiceOrderBy,
    });

    res.status(200).json({ isError: false, data: nextServices });
  } catch (error) {
    console.error("Error al obtener pendientes:", error);
    res
      .status(500)
      .json({ isError: true, error: "Error al obtener pendientes" });
  }
};

export const createNextService = async (req: Request, res: Response) => {
  try {
    const {
      vehicleId,
      reason,
      isUrgent,
      observations,
      dueInterval,
      dueDate,
      dueKilometers,
      originServiceId,
    } = req.body as CreateNextServiceInput;

    const vehicle = await findActiveVehicle(vehicleId);

    if (!vehicle) {
      res.status(404).json({ isError: true, error: "Vehículo no encontrado" });
      return;
    }

    if (
      originServiceId !== undefined &&
      !(await isServiceOfVehicle(originServiceId, vehicleId))
    ) {
      res.status(400).json({
        isError: true,
        error: "El servicio de origen no pertenece al vehículo",
      });
      return;
    }

    const now = new Date().toISOString();

    const newNextService = await prisma.nextService.create({
      data: {
        vehicleId,
        reason,
        isUrgent,
        isRealized: false,
        observations: observations ?? null,
        dueInterval: dueInterval ?? null,
        dueDate: dueDate ?? null,
        dueKilometers: dueKilometers ?? null,
        originServiceId: originServiceId ?? null,
        isActive: true,
        createdOn: now,
        modifiedOn: now,
      },
      include: nextServiceInclude,
    });

    res.status(201).json({ isError: false, data: newNextService });
  } catch (error) {
    console.error("Error al crear pendiente:", error);
    res.status(500).json({ isError: true, error: "Error al crear pendiente" });
  }
};

export const editNextService = async (req: Request, res: Response) => {
  try {
    const {
      id,
      reason,
      isUrgent,
      observations,
      dueInterval,
      dueDate,
      dueKilometers,
    } = req.body as EditNextServiceInput;

    const existing = await findActiveNextService(id);

    if (!existing) {
      res.status(404).json({ isError: true, error: "Pendiente no encontrado" });
      return;
    }

    const updated = await prisma.nextService.update({
      where: { id },
      data: {
        reason,
        isUrgent,
        observations: observations ?? null,
        dueInterval: dueInterval ?? null,
        dueDate: dueDate ?? null,
        dueKilometers: dueKilometers ?? null,
        modifiedOn: new Date().toISOString(),
      },
      include: nextServiceInclude,
    });

    res.status(200).json({ isError: false, data: updated });
  } catch (error) {
    console.error("Error al editar pendiente:", error);
    res.status(500).json({ isError: true, error: "Error al editar pendiente" });
  }
};

export const realizeNextService = async (req: Request, res: Response) => {
  try {
    const { id, isRealized, serviceId } = req.body as RealizeNextServiceInput;

    const existing = await findActiveNextService(id);

    if (!existing) {
      res.status(404).json({ isError: true, error: "Pendiente no encontrado" });
      return;
    }

    if (
      isRealized &&
      serviceId !== undefined &&
      !(await isServiceOfVehicle(serviceId, existing.vehicleId))
    ) {
      res.status(400).json({
        isError: true,
        error: "El servicio no pertenece al vehículo del pendiente",
      });
      return;
    }

    const now = new Date().toISOString();

    const updated = await prisma.nextService.update({
      where: { id },
      data: isRealized
        ? {
            isRealized: true,
            realizedOn: now,
            realizedServiceId: serviceId ?? null,
            modifiedOn: now,
          }
        : {
            isRealized: false,
            realizedOn: null,
            realizedServiceId: null,
            modifiedOn: now,
          },
      include: nextServiceInclude,
    });

    res.status(200).json({ isError: false, data: updated });
  } catch (error) {
    console.error("Error al actualizar estado del pendiente:", error);
    res.status(500).json({
      isError: true,
      error: "Error al actualizar estado del pendiente",
    });
  }
};

export const deleteNextService = async (req: Request, res: Response) => {
  try {
    const { id } = req.body as DeleteNextServiceInput;

    const existing = await findActiveNextService(id);

    if (!existing) {
      res.status(404).json({ isError: true, error: "Pendiente no encontrado" });
      return;
    }

    const deleted = await prisma.nextService.update({
      where: { id },
      data: { isActive: false, modifiedOn: new Date().toISOString() },
      include: nextServiceInclude,
    });

    res.status(200).json({ isError: false, data: deleted });
  } catch (error) {
    console.error("Error al eliminar pendiente:", error);
    res
      .status(500)
      .json({ isError: true, error: "Error al eliminar pendiente" });
  }
};
