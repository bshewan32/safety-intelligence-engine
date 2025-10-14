/*
  Warnings:

  - A unique constraint covering the columns `[workerId,controlId]` on the table `RequiredControl` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Evidence" ADD COLUMN "checksum" TEXT;
ALTER TABLE "Evidence" ADD COLUMN "fileSize" INTEGER;
ALTER TABLE "Evidence" ADD COLUMN "originalName" TEXT;

-- AlterTable
ALTER TABLE "RequiredControl" ADD COLUMN "tempEvidenceId" TEXT;
ALTER TABLE "RequiredControl" ADD COLUMN "tempNotes" TEXT;
ALTER TABLE "RequiredControl" ADD COLUMN "tempValidUntil" DATETIME;

-- CreateIndex
CREATE UNIQUE INDEX "RequiredControl_workerId_controlId_key" ON "RequiredControl"("workerId", "controlId");
