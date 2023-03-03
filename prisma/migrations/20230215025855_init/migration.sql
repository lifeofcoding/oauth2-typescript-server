/*
  Warnings:

  - Added the required column `userId` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "dataUris" TEXT NOT NULL,
    "grants" TEXT NOT NULL,
    "userId" INTEGER NOT NULL
);
INSERT INTO "new_Client" ("clientId", "clientSecret", "dataUris", "grants", "id") SELECT "clientId", "clientSecret", "dataUris", "grants", "id" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_clientId_key" ON "Client"("clientId");
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");
CREATE INDEX "Client_clientId_idx" ON "Client"("clientId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
