import { Router } from "express";
import prisma from "../prisma";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const servicios = await prisma.servicio.findMany();
    res.json(servicios);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res.status(500).json({ error: "Error al obtener servicios" });
  }
});

router.post("/create", async (req, res) => {
  const { fechaCreacion, motivo, clienteId, matricula, observaciones } =
    req.body;

  try {
    const nuevoServicio = await prisma.servicio.create({
      data: {
        fechaCreacion,
        motivo,
        clienteId,
        matricula,
        observaciones,
      },
    });

    res.status(201).json(nuevoServicio);
  } catch (error) {
    console.error("Error al crear servicio:", error);
    res.status(500).json({ error: "Error al crear servicio" });
  }
});

export default router;
