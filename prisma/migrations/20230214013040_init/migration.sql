/*
  Warnings:

  - You are about to alter the column `userId` on the `AuthorizationCode` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuthorizationCode" (
    "authorizationCode" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL
);
INSERT INTO "new_AuthorizationCode" ("authorizationCode", "clientId", "expiresAt", "userId") SELECT "authorizationCode", "clientId", "expiresAt", "userId" FROM "AuthorizationCode";
DROP TABLE "AuthorizationCode";
ALTER TABLE "new_AuthorizationCode" RENAME TO "AuthorizationCode";
CREATE UNIQUE INDEX "AuthorizationCode_authorizationCode_key" ON "AuthorizationCode"("authorizationCode");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
