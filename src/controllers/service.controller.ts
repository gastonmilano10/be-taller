import { Request, Response } from "express";
import prisma from "../prisma";

export const createService = async (req: Request, res: Response) => {
  try {
    const now = new Date().toISOString();

    const newService = await prisma.service.create({
      data: {
        ...req.body,
        createdOn: now,
        modifiedOn: now,
      },
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

    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        ...(id && { id: Number(id) }),
        ...(vehicleId && { vehicleId: Number(vehicleId) }),
        ...(attentionDate && { attentionDate: String(attentionDate) }),
      },
      include: {
        vehicle: true,
      },
      orderBy: { attentionDate: "desc" },
    });

    res.status(200).json({ isError: false, data: services });
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res
      .status(500)
      .json({ isError: true, error: "Error al obtener servicios" });
  }
};
