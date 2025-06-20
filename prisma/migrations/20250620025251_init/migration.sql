-- CreateTable
CREATE TABLE "Servicio" (
    "id" TEXT NOT NULL,
    "fechaCreacion" TEXT NOT NULL,
    "fechaAtencion" TEXT,
    "motivo" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "observaciones" TEXT,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);
