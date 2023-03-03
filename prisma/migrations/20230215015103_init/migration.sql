-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Token" (
    "accessToken" TEXT NOT NULL,
    "accessTokenExpiresAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "refreshTokenExpiresAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Token" ("accessToken", "accessTokenExpiresAt", "clientId", "refreshToken", "refreshTokenExpiresAt", "userId") SELECT "accessToken", "accessTokenExpiresAt", "clientId", "refreshToken", "refreshTokenExpiresAt", "userId" FROM "Token";
DROP TABLE "Token";
ALTER TABLE "new_Token" RENAME TO "Token";
CREATE UNIQUE INDEX "Token_accessToken_key" ON "Token"("accessToken");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
