import { Request, Response } from "express";
import prisma from "../prisma";

export const createClient = async (req: Request, res: Response) => {
  try {
    const newClient = await prisma.client.create({ data: req.body });

    res.status(201).json({ isError: false, data: newClient });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({ isError: true, error: "Error al crear cliente" });
  }
};

export const getAllClients = async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany({ where: { isActive: true } });

    res.status(200).json({ isError: false, data: clients });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ isError: true, error: "Error al obtener clientes" });
  }
};
