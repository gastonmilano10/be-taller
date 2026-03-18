import { Request, Response } from "express";
import prisma from "../prisma";

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const existingVehicle = await prisma.vehicle.findFirst({
      where: { number: req.body.number, isActive: true },
    });

    if (existingVehicle) {
      res.status(400).json({
        isError: true,
        error: "Ya existe un vehiculo con esta patente",
      });
      return;
    }

    const now = new Date().toISOString();

    const newVehicle = await prisma.vehicle.create({
      data: {
        ...req.body,
        createdOn: now,
        modifiedOn: now,
      },
    });

    res.status(201).json({ isError: false, data: newVehicle });
  } catch (error) {
    console.error("Error al crear vehiculo:", error);
    res.status(500).json({ isError: true, error: "Error al crear vehiculo" });
  }
};

export const getVehicles = async (req: Request, res: Response) => {
  try {
    const { id, number, clientId } = req.query;

    const vehicles = await prisma.vehicle.findMany({
      where: {
        isActive: true,
        ...(id && { id: Number(id) }),
        ...(number && { number: String(number) }),
        ...(clientId && { clientId: Number(clientId) }),
      },
    });

    res.status(200).json({ isError: false, data: vehicles });
  } catch (error) {
    console.error("Error al obtener vehiculos:", error);
    res
      .status(500)
      .json({ isError: true, error: "Error al obtener vehiculos" });
  }
};

export const editVehicle = async (req: Request, res: Response) => {
  try {
    const { id, ...data } = req.body;

    const existingVehicle = await prisma.vehicle.findFirst({
      where: { id, isActive: true },
    });

    if (!existingVehicle) {
      res.status(404).json({ isError: true, error: "Vehiculo no encontrado" });
      return;
    }

    if (data.number) {
      const duplicatedVehicle = await prisma.vehicle.findFirst({
        where: {
          id: { not: id },
          number: data.number,
          isActive: true,
        },
      });

      if (duplicatedVehicle) {
        res.status(400).json({
          isError: true,
          error: "Ya existe un vehiculo con esta patente",
        });
        return;
      }
    }

    const now = new Date().toISOString();

    const vehicleUpdated = await prisma.vehicle.update({
      where: { id },
      data: {
        ...data,
        modifiedOn: now,
      },
    });

    res.status(200).json({ isError: false, data: vehicleUpdated });
  } catch (error) {
    console.error("Error al editar vehiculo:", error);
    res.status(500).json({ isError: true, error: "Error al editar vehiculo" });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    const existingVehicle = await prisma.vehicle.findFirst({
      where: { id, isActive: true },
    });

    if (!existingVehicle) {
      res.status(404).json({ isError: true, error: "Vehiculo no encontrado" });
      return;
    }

    const now = new Date().toISOString();

    const deletedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        isActive: false,
        modifiedOn: now,
      },
    });

    res.status(200).json({ isError: false, data: deletedVehicle });
  } catch (error) {
    console.error("Error al eliminar vehiculo:", error);
    res
      .status(500)
      .json({ isError: true, error: "Error al eliminar vehiculo" });
  }
};
