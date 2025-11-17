-- CreateTable
CREATE TABLE "ClientHazard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "hazardId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "preControlRisk" INTEGER NOT NULL DEFAULT 0,
    "postControlRisk" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "customNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientHazard_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClientControl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "reference" TEXT,
    "validityDays" INTEGER,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "customEvidence" TEXT,
    "customNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientControl_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClientHazardControl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientHazardId" TEXT NOT NULL,
    "clientControlId" TEXT NOT NULL,
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "effectivenessRating" TEXT,
    "implementationNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientHazardControl_clientHazardId_fkey" FOREIGN KEY ("clientHazardId") REFERENCES "ClientHazard" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClientHazardControl_clientControlId_fkey" FOREIGN KEY ("clientControlId") REFERENCES "ClientControl" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "jurisdiction" TEXT,
    "isoAlignment" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Client" ("createdAt", "id", "name") SELECT "createdAt", "id", "name" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_name_key" ON "Client"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ClientHazard_clientId_isActive_idx" ON "ClientHazard"("clientId", "isActive");

-- CreateIndex
CREATE INDEX "ClientHazard_clientId_category_idx" ON "ClientHazard"("clientId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "ClientHazard_clientId_hazardId_key" ON "ClientHazard"("clientId", "hazardId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientHazard_clientId_code_key" ON "ClientHazard"("clientId", "code");

-- CreateIndex
CREATE INDEX "ClientControl_clientId_isRequired_idx" ON "ClientControl"("clientId", "isRequired");

-- CreateIndex
CREATE INDEX "ClientControl_clientId_type_idx" ON "ClientControl"("clientId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ClientControl_clientId_controlId_key" ON "ClientControl"("clientId", "controlId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientControl_clientId_code_key" ON "ClientControl"("clientId", "code");

-- CreateIndex
CREATE INDEX "ClientHazardControl_clientHazardId_idx" ON "ClientHazardControl"("clientHazardId");

-- CreateIndex
CREATE INDEX "ClientHazardControl_clientControlId_idx" ON "ClientHazardControl"("clientControlId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientHazardControl_clientHazardId_clientControlId_key" ON "ClientHazardControl"("clientHazardId", "clientControlId");
