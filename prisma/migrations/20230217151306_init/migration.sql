/*
  Warnings:

  - The primary key for the `Client` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "dataUris" TEXT NOT NULL,
    "grants" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Client" ("clientId", "clientSecret", "dataUris", "grants", "id", "userId") SELECT "clientId", "clientSecret", "dataUris", "grants", "id", "userId" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_clientId_key" ON "Client"("clientId");
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");
CREATE INDEX "Client_clientId_idx" ON "Client"("clientId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
