/*
  Warnings:

  - You are about to drop the column `customNotes` on the `ClientControl` table. All the data in the column will be lost.
  - You are about to drop the column `isRequired` on the `ClientControl` table. All the data in the column will be lost.
  - You are about to drop the column `customNotes` on the `ClientHazard` table. All the data in the column will be lost.
  - You are about to drop the column `isCritical` on the `ClientHazardControl` table. All the data in the column will be lost.
  - Added the required column `originalRiskLevel` to the `ClientHazard` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClientControl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "reference" TEXT,
    "validityDays" INTEGER,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "customEvidence" TEXT,
    "clientNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientControl_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClientControl_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ClientControl" ("clientId", "code", "controlId", "createdAt", "customEvidence", "description", "id", "reference", "title", "type", "updatedAt", "validityDays") SELECT "clientId", "code", "controlId", "createdAt", "customEvidence", "description", "id", "reference", "title", "type", "updatedAt", "validityDays" FROM "ClientControl";
DROP TABLE "ClientControl";
ALTER TABLE "new_ClientControl" RENAME TO "ClientControl";
CREATE INDEX "ClientControl_clientId_isActive_idx" ON "ClientControl"("clientId", "isActive");
CREATE INDEX "ClientControl_clientId_type_idx" ON "ClientControl"("clientId", "type");
CREATE UNIQUE INDEX "ClientControl_clientId_controlId_key" ON "ClientControl"("clientId", "controlId");
CREATE UNIQUE INDEX "ClientControl_clientId_code_key" ON "ClientControl"("clientId", "code");
CREATE TABLE "new_ClientHazard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "hazardId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "originalRiskLevel" TEXT NOT NULL,
    "adjustedRiskLevel" TEXT,
    "preControlRisk" INTEGER NOT NULL DEFAULT 0,
    "postControlRisk" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isNotApplicable" BOOLEAN NOT NULL DEFAULT false,
    "clientNotes" TEXT,
    "lastReviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientHazard_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClientHazard_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "Hazard" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ClientHazard" ("category", "clientId", "code", "createdAt", "description", "hazardId", "id", "isActive", "name", "postControlRisk", "preControlRisk", "updatedAt") SELECT "category", "clientId", "code", "createdAt", "description", "hazardId", "id", "isActive", "name", "postControlRisk", "preControlRisk", "updatedAt" FROM "ClientHazard";
DROP TABLE "ClientHazard";
ALTER TABLE "new_ClientHazard" RENAME TO "ClientHazard";
CREATE INDEX "ClientHazard_clientId_isActive_idx" ON "ClientHazard"("clientId", "isActive");
CREATE INDEX "ClientHazard_clientId_category_idx" ON "ClientHazard"("clientId", "category");
CREATE UNIQUE INDEX "ClientHazard_clientId_hazardId_key" ON "ClientHazard"("clientId", "hazardId");
CREATE UNIQUE INDEX "ClientHazard_clientId_code_key" ON "ClientHazard"("clientId", "code");
CREATE TABLE "new_ClientHazardControl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientHazardId" TEXT NOT NULL,
    "clientControlId" TEXT NOT NULL,
    "isCriticalControl" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "effectivenessRating" TEXT,
    "implementationNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientHazardControl_clientHazardId_fkey" FOREIGN KEY ("clientHazardId") REFERENCES "ClientHazard" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClientHazardControl_clientControlId_fkey" FOREIGN KEY ("clientControlId") REFERENCES "ClientControl" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ClientHazardControl" ("clientControlId", "clientHazardId", "createdAt", "effectivenessRating", "id", "implementationNotes", "priority", "updatedAt") SELECT "clientControlId", "clientHazardId", "createdAt", "effectivenessRating", "id", "implementationNotes", "priority", "updatedAt" FROM "ClientHazardControl";
DROP TABLE "ClientHazardControl";
ALTER TABLE "new_ClientHazardControl" RENAME TO "ClientHazardControl";
CREATE INDEX "ClientHazardControl_clientHazardId_idx" ON "ClientHazardControl"("clientHazardId");
CREATE INDEX "ClientHazardControl_clientControlId_idx" ON "ClientHazardControl"("clientControlId");
CREATE UNIQUE INDEX "ClientHazardControl_clientHazardId_clientControlId_key" ON "ClientHazardControl"("clientHazardId", "clientControlId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
