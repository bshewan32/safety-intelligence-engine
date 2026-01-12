/*
  Warnings:

  - Added the required column `updatedAt` to the `RequiredControl` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RequiredControl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workerId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dueDate" DATETIME,
    "sources" TEXT,
    "severity" TEXT,
    "tempNotes" TEXT,
    "tempValidUntil" DATETIME,
    "tempCreatedAt" DATETIME,
    "tempEvidenceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RequiredControl_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RequiredControl_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RequiredControl" ("controlId", "dueDate", "id", "status", "tempEvidenceId", "tempNotes", "tempValidUntil", "workerId") SELECT "controlId", "dueDate", "id", "status", "tempEvidenceId", "tempNotes", "tempValidUntil", "workerId" FROM "RequiredControl";
DROP TABLE "RequiredControl";
ALTER TABLE "new_RequiredControl" RENAME TO "RequiredControl";
CREATE INDEX "RequiredControl_workerId_idx" ON "RequiredControl"("workerId");
CREATE INDEX "RequiredControl_controlId_idx" ON "RequiredControl"("controlId");
CREATE INDEX "RequiredControl_severity_idx" ON "RequiredControl"("severity");
CREATE UNIQUE INDEX "RequiredControl_workerId_controlId_key" ON "RequiredControl"("workerId", "controlId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
