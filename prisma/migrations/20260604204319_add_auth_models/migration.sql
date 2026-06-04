/*
  Warnings:

  - The primary key for the `RelationServiceStateService` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Kilometer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ServiceToServiceState` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `ServiceState` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vehicleKilometers` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Made the column `attentionDate` on table `Service` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `kilometers` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER_OWNER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "Kilometer" DROP CONSTRAINT "Kilometer_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "_ServiceToServiceState" DROP CONSTRAINT "_ServiceToServiceState_A_fkey";

-- DropForeignKey
ALTER TABLE "_ServiceToServiceState" DROP CONSTRAINT "_ServiceToServiceState_B_fkey";

-- DropIndex
DROP INDEX "Labor_serviceId_key";

-- DropIndex
DROP INDEX "Material_serviceId_key";

-- DropIndex
DROP INDEX "NextService_vehicleId_key";

-- DropIndex
DROP INDEX "Service_vehicleId_key";

-- DropIndex
DROP INDEX "Vehicle_clientId_key";

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "address" TEXT;

-- AlterTable
ALTER TABLE "Labor" ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "quantity" SET DATA TYPE TEXT,
ALTER COLUMN "cost" DROP NOT NULL,
ALTER COLUMN "cost" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Material" ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "quantity" SET DATA TYPE TEXT,
ALTER COLUMN "cost" DROP NOT NULL,
ALTER COLUMN "cost" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "RelationServiceStateService" DROP CONSTRAINT "RelationServiceStateService_pkey",
ADD COLUMN     "assignedOn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "RelationServiceStateService_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "vehicleKilometers" TEXT NOT NULL,
ALTER COLUMN "attentionDate" SET NOT NULL,
ALTER COLUMN "cost" DROP NOT NULL,
ALTER COLUMN "cost" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "kilometers" TEXT NOT NULL,
ALTER COLUMN "engineCapacity" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "Kilometer";

-- DropTable
DROP TABLE "_ServiceToServiceState";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "picture" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER_OWNER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdOn" TEXT NOT NULL DEFAULT '',
    "modifiedOn" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedBy" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RelationServiceStateService_serviceId_idx" ON "RelationServiceStateService"("serviceId");

-- CreateIndex
CREATE INDEX "RelationServiceStateService_assignedOn_idx" ON "RelationServiceStateService"("assignedOn");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceState_code_key" ON "ServiceState"("code");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
