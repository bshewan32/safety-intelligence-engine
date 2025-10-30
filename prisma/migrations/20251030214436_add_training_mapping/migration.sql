-- CreateTable
CREATE TABLE "TrainingMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trainingName" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 100,
    "source" TEXT NOT NULL DEFAULT 'algorithm',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrainingMapping_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TrainingMapping_trainingName_idx" ON "TrainingMapping"("trainingName");

-- CreateIndex
CREATE INDEX "TrainingMapping_controlId_idx" ON "TrainingMapping"("controlId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingMapping_trainingName_controlId_key" ON "TrainingMapping"("trainingName", "controlId");
