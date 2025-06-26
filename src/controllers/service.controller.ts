import { Request, Response } from "express";
import prisma from "../prisma";

export const createService = async (req: Request, res: Response) => {
  try {
    const newService = await prisma.service.create({ data: req.body });

    res.status(201).json({ isError: false, data: newService });
  } catch (error) {
    console.error("Error al crer servicio:", error);
    res.status(500).json({ isError: true, error: "Error al crear servicio" });
  }
};

export const getAllServices = async (res: Response) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdOn: "desc" },
    });

    res.status(200).json({ isError: false, data: services });
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res
      .status(500)
      .json({ isError: true, error: "Error al obtener servicios" });
  }
};
