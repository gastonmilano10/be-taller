import { Request, Response } from "express";
import prisma from "../prisma";

export const createLabor = async (req: Request, res: Response) => {
  try {
    const { serviceId, description, cost, quantity } = req.body;

    const existingService = await prisma.service.findFirst({
      where: { id: serviceId, isActive: true },
    });

    if (!existingService) {
      res.status(404).json({ isError: true, error: "Servicio no encontrado" });
      return;
    }

    const now = new Date().toISOString();

    const newLabor = await prisma.labor.create({
      data: {
        serviceId,
        description,
        cost,
        quantity,
        createdOn: now,
        modifiedOn: now,
      },
    });

    res.status(201).json({ isError: false, data: newLabor });
  } catch (error) {
    console.error("Error al crear labor:", error);
    res.status(500).json({ isError: true, error: "Error al crear labor" });
  }
};

export const editLabor = async (req: Request, res: Response) => {
  try {
    const { id, serviceId, description, cost, quantity } = req.body;

    const existingLabor = await prisma.labor.findFirst({
      where: { id, isActive: true },
    });

    if (!existingLabor) {
      res.status(404).json({ isError: true, error: "Labor no encontrada" });
      return;
    }

    const now = new Date().toISOString();

    const updatedLabor = await prisma.labor.update({
      where: { id },
      data: {
        serviceId,
        description,
        cost,
        quantity,
        modifiedOn: now,
      },
    });

    res.status(200).json({ isError: false, data: updatedLabor });
  } catch (error) {
    console.error("Error al editar labor:", error);
    res.status(500).json({ isError: true, error: "Error al editar labor" });
  }
};

export const deleteLabor = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    const existingLabor = await prisma.labor.findFirst({
      where: { id, isActive: true },
    });

    if (!existingLabor) {
      res.status(404).json({ isError: true, error: "Labor no encontrada" });
      return;
    }

    const now = new Date().toISOString();

    const deletedLabor = await prisma.labor.update({
      where: { id },
      data: {
        isActive: false,
        modifiedOn: now,
      },
    });

    res.status(200).json({ isError: false, data: deletedLabor });
  } catch (error) {
    console.error("Error al eliminar labor:", error);
    res.status(500).json({ isError: true, error: "Error al eliminar labor" });
  }
};

export const getLaborsByService = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.query;

    const labors = await prisma.labor.findMany({
      where: {
        isActive: true,
        serviceId: Number(serviceId),
      },
    });

    res.status(200).json({ isError: false, data: labors });
  } catch (error) {
    console.error("Error al obtener labores:", error);
    res.status(500).json({ isError: true, error: "Error al obtener labores" });
  }
};
