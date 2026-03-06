import { Request, Response } from "express";
import prisma from "../prisma";

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const newVehicle = await prisma.vehicle.create({ data: req.body });

    res.status(201).json({ isError: false, data: newVehicle });
  } catch (error) {
    console.error("Error al crear vehiculo:", error);
    res.status(500).json({ isError: true, error: "Error al crear vehiculo" });
  }
};

export const getAllVehicles = async (
  req: Request,
  res: Response
) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { isActive: true },
    });

    res.status(200).json({ isError: false, data: vehicles });
  } catch (error) {
    console.error("Error al obtener vehiculos:", error);
    res
      .status(500)
      .json({ isError: true, error: "Error al obtener vehiculos" });
  }
};
