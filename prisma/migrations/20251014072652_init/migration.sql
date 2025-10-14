-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "companyId" TEXT NOT NULL,
    "roleId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Worker_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "activityPackage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Hazard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "preControlRisk" INTEGER NOT NULL DEFAULT 0,
    "postControlRisk" INTEGER NOT NULL DEFAULT 0,
    "industryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Control" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "reference" TEXT,
    "validityDays" INTEGER,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "HazardControl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hazardId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "HazardControl_hazardId_fkey" FOREIGN KEY ("hazardId") REFERENCES "Hazard" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HazardControl_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RequiredControl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workerId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dueDate" DATETIME,
    CONSTRAINT "RequiredControl_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RequiredControl_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requiredControlId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "issuedDate" DATETIME,
    "expiryDate" DATETIME,
    "filePath" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Evidence_requiredControlId_fkey" FOREIGN KEY ("requiredControlId") REFERENCES "RequiredControl" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KPI" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period" TEXT NOT NULL,
    "hoursWorked" INTEGER NOT NULL,
    "incidents" INTEGER NOT NULL,
    "nearMiss" INTEGER NOT NULL,
    "crvRate" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Worker_employeeId_key" ON "Worker"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Hazard_code_key" ON "Hazard"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Control_code_key" ON "Control"("code");

-- CreateIndex
CREATE UNIQUE INDEX "HazardControl_hazardId_controlId_key" ON "HazardControl"("hazardId", "controlId");
