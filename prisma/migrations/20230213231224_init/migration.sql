/*
  Warnings:

  - You are about to drop the column `client_id` on the `AuthorizationCode` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `AuthorizationCode` table. All the data in the column will be lost.
  - You are about to drop the column `access_token` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `access_token_expires_at` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `client_id` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `client_id` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `client_secret` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `data_uris` on the `Client` table. All the data in the column will be lost.
  - Added the required column `clientId` to the `AuthorizationCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `AuthorizationCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accessToken` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientId` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientId` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientSecret` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataUris` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuthorizationCode" (
    "authorizationCode" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redirectUri" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);
INSERT INTO "new_AuthorizationCode" ("authorizationCode", "expiresAt", "redirectUri") SELECT "authorizationCode", "expiresAt", "redirectUri" FROM "AuthorizationCode";
DROP TABLE "AuthorizationCode";
ALTER TABLE "new_AuthorizationCode" RENAME TO "AuthorizationCode";
CREATE UNIQUE INDEX "AuthorizationCode_authorizationCode_key" ON "AuthorizationCode"("authorizationCode");
CREATE TABLE "new_Token" (
    "accessToken" TEXT NOT NULL,
    "accessTokenExpiresAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "refreshTokenExpiresAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Token" ("refreshToken", "refreshTokenExpiresAt") SELECT "refreshToken", "refreshTokenExpiresAt" FROM "Token";
DROP TABLE "Token";
ALTER TABLE "new_Token" RENAME TO "Token";
CREATE UNIQUE INDEX "Token_accessToken_key" ON "Token"("accessToken");
CREATE UNIQUE INDEX "Token_clientId_key" ON "Token"("clientId");
CREATE UNIQUE INDEX "Token_userId_key" ON "Token"("userId");
CREATE TABLE "new_Client" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "dataUris" TEXT NOT NULL,
    "grants" TEXT NOT NULL
);
INSERT INTO "new_Client" ("grants", "id") SELECT "grants", "id" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_clientId_key" ON "Client"("clientId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
