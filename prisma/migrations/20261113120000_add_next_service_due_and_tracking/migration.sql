-- AlterTable
ALTER TABLE "NextService" ADD COLUMN     "dueDate" TEXT,
ADD COLUMN     "dueInterval" TEXT,
ADD COLUMN     "dueKilometers" INTEGER,
ADD COLUMN     "originServiceId" INTEGER,
ADD COLUMN     "realizedOn" TEXT,
ADD COLUMN     "realizedServiceId" INTEGER;

-- CreateIndex
CREATE INDEX "NextService_vehicleId_idx" ON "NextService"("vehicleId");

-- AddForeignKey
ALTER TABLE "NextService" ADD CONSTRAINT "NextService_originServiceId_fkey" FOREIGN KEY ("originServiceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NextService" ADD CONSTRAINT "NextService_realizedServiceId_fkey" FOREIGN KEY ("realizedServiceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

