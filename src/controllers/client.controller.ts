import { Request, Response } from "express";
import prisma from "../prisma";

export const createClient = async (req: Request, res: Response) => {
  try {
    const existingClient = await prisma.client.findFirst({
      where: { name: req.body.name, surname: req.body.surname, isActive: true },
    });

    if (existingClient) {
      res.status(400).json({
        isError: true,
        error: "Ya existe un cliente con ese nombre y apellido",
      });
      return;
    }

    const now = new Date().toISOString();
    const newClient = await prisma.client.create({
      data: {
        ...req.body,
        createdOn: now,
        modifiedOn: now,
      },
    });

    res.status(201).json({ isError: false, data: newClient });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({ isError: true, error: "Error al crear cliente" });
  }
};

export const getClients = async (req: Request, res: Response) => {
  try {
    const { id, name, surname } = req.query;

    const clients = await prisma.client.findMany({
      where: {
        isActive: true,
        ...(id && { id: Number(id) }),
        ...(name && { name: String(name) }),
        ...(surname && { surname: String(surname) }),
      },
      include: {
        vehicles: {
          where: { isActive: true },
        },
      },
    });

    res.status(200).json({ isError: false, data: clients });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ isError: true, error: "Error al obtener clientes" });
  }
};

export const editClient = async (req: Request, res: Response) => {
  try {
    const { id, ...data } = req.body;

    const existingClient = await prisma.client.findFirst({
      where: { id, isActive: true },
    });

    if (!existingClient) {
      res.status(404).json({ isError: true, error: "Cliente no encontrado" });
      return;
    }

    if (data.name && data.surname) {
      const duplicatedClient = await prisma.client.findFirst({
        where: {
          id: { not: id },
          name: data.name,
          surname: data.surname,
          isActive: true,
        },
      });

      if (duplicatedClient) {
        res.status(400).json({
          isError: true,
          error: "Ya existe un cliente con ese nombre y apellido",
        });
        return;
      }
    }

    const now = new Date().toISOString();

    const clientUpdated = await prisma.client.update({
      where: { id },
      data: {
        ...data,
        modifiedOn: now,
      },
    });

    res.status(200).json({ isError: false, data: clientUpdated });
  } catch (error) {
    console.error("Error al editar cliente:", error);
    res.status(500).json({ isError: true, error: "Error al editar cliente" });
  }
};
