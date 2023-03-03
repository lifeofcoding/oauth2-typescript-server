/*
  Warnings:

  - A unique constraint covering the columns `[clientId]` on the table `AuthorizationCode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AuthorizationCode_clientId_key" ON "AuthorizationCode"("clientId");
