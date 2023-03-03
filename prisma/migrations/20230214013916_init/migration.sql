/*
  Warnings:

  - You are about to alter the column `userId` on the `Token` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Token" (
    "accessToken" TEXT NOT NULL,
    "accessTokenExpiresAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "refreshTokenExpiresAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Token" ("accessToken", "accessTokenExpiresAt", "clientId", "refreshToken", "refreshTokenExpiresAt", "userId") SELECT "accessToken", "accessTokenExpiresAt", "clientId", "refreshToken", "refreshTokenExpiresAt", "userId" FROM "Token";
DROP TABLE "Token";
ALTER TABLE "new_Token" RENAME TO "Token";
CREATE UNIQUE INDEX "Token_accessToken_key" ON "Token"("accessToken");
CREATE UNIQUE INDEX "Token_clientId_key" ON "Token"("clientId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
