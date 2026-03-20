import { Request, Response } from "express";
import prisma from "../prisma";

export const createMaterial = async (req: Request, res: Response) => {
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

    const newMaterial = await prisma.material.create({
      data: {
        serviceId,
        description,
        cost,
        quantity,
        createdOn: now,
        modifiedOn: now,
      },
    });

    res.status(201).json({ isError: false, data: newMaterial });
  } catch (error) {
    console.error("Error al crear material:", error);
    res.status(500).json({ isError: true, error: "Error al crear material" });
  }
};

export const editMaterial = async (req: Request, res: Response) => {
  try {
    const { id, serviceId, description, cost, quantity } = req.body;

    const existingMaterial = await prisma.material.findFirst({
      where: { id, isActive: true },
    });

    if (!existingMaterial) {
      res.status(404).json({ isError: true, error: "Material no encontrado" });
      return;
    }

    const now = new Date().toISOString();

    const updatedMaterial = await prisma.material.update({
      where: { id },
      data: {
        serviceId,
        description,
        cost,
        quantity,
        modifiedOn: now,
      },
    });

    res.status(200).json({ isError: false, data: updatedMaterial });
  } catch (error) {
    console.error("Error al editar material:", error);
    res.status(500).json({ isError: true, error: "Error al editar material" });
  }
};

export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    const existingMaterial = await prisma.material.findFirst({
      where: { id, isActive: true },
    });

    if (!existingMaterial) {
      res.status(404).json({ isError: true, error: "Material no encontrado" });
      return;
    }

    const now = new Date().toISOString();

    const deletedMaterial = await prisma.material.update({
      where: { id },
      data: {
        isActive: false,
        modifiedOn: now,
      },
    });

    res.status(200).json({ isError: false, data: deletedMaterial });
  } catch (error) {
    console.error("Error al eliminar material:", error);
    res
      .status(500)
      .json({ isError: true, error: "Error al eliminar material" });
  }
};

export const getMaterialsByService = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.query;

    const materials = await prisma.material.findMany({
      where: {
        isActive: true,
        serviceId: Number(serviceId),
      },
    });

    res.status(200).json({ isError: false, data: materials });
  } catch (error) {
    console.error("Error al obtener materiales:", error);
    res
      .status(500)
      .json({ isError: true, error: "Error al obtener materiales" });
  }
};
