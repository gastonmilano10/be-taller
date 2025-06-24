/*
  Warnings:

  - You are about to drop the `Servicio` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Servicio";

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "fechaCreacion" TEXT NOT NULL,
    "fechaAtencion" TEXT,
    "motivo" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "observaciones" TEXT,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);
