-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "checksum" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "clientId" TEXT,
    "version" TEXT,
    "author" TEXT,
    "approver" TEXT,
    "issuedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" DATETIME,
    "reviewDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "uploadedBy" TEXT,
    CONSTRAINT "Document_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentEvidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "workerId" TEXT,
    "issuedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Valid',
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    "rejectionReason" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DocumentEvidence_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DocumentEvidence_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DocumentEvidence_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentName" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 100,
    "source" TEXT NOT NULL DEFAULT 'algorithm',
    "matchMethod" TEXT,
    "matchScore" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DocumentMapping_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentControlMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "relevance" TEXT DEFAULT 'Primary',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "mappedBy" TEXT,
    CONSTRAINT "DocumentControlMapping_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DocumentControlMapping_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Document_clientId_idx" ON "Document"("clientId");

-- CreateIndex
CREATE INDEX "Document_type_idx" ON "Document"("type");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "Document_issuedDate_idx" ON "Document"("issuedDate");

-- CreateIndex
CREATE INDEX "Document_expiryDate_idx" ON "Document"("expiryDate");

-- CreateIndex
CREATE INDEX "DocumentEvidence_documentId_idx" ON "DocumentEvidence"("documentId");

-- CreateIndex
CREATE INDEX "DocumentEvidence_controlId_idx" ON "DocumentEvidence"("controlId");

-- CreateIndex
CREATE INDEX "DocumentEvidence_workerId_idx" ON "DocumentEvidence"("workerId");

-- CreateIndex
CREATE INDEX "DocumentEvidence_status_idx" ON "DocumentEvidence"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentEvidence_documentId_controlId_workerId_key" ON "DocumentEvidence"("documentId", "controlId", "workerId");

-- CreateIndex
CREATE INDEX "DocumentMapping_documentName_idx" ON "DocumentMapping"("documentName");

-- CreateIndex
CREATE INDEX "DocumentMapping_documentType_idx" ON "DocumentMapping"("documentType");

-- CreateIndex
CREATE INDEX "DocumentMapping_controlId_idx" ON "DocumentMapping"("controlId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentMapping_documentName_documentType_controlId_key" ON "DocumentMapping"("documentName", "documentType", "controlId");

-- CreateIndex
CREATE INDEX "DocumentControlMapping_documentId_idx" ON "DocumentControlMapping"("documentId");

-- CreateIndex
CREATE INDEX "DocumentControlMapping_controlId_idx" ON "DocumentControlMapping"("controlId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentControlMapping_documentId_controlId_key" ON "DocumentControlMapping"("documentId", "controlId");
