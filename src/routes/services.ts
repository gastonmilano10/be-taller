import { Router } from "express";
import prisma from "../prisma";

const router = Router();

router.get("/getAll", async (req, res) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (error) {
    console.error("Error al obtener services:", error);
    res.status(500).json({ error: "Error al obtener services" });
  }
});

router.post("/create", async (req, res) => {
  const { fechaCreacion, motivo, clienteId, matricula, observaciones } =
    req.body;

  try {
    const nuevoService = await prisma.service.create({
      data: {
        fechaCreacion,
        motivo,
        clienteId,
        matricula,
        observaciones,
      },
    });

    res.status(201).json(nuevoService);
  } catch (error) {
    console.error("Error al crear service:", error);
    res.status(500).json({ error: "Error al crear service" });
  }
});

export default router;
