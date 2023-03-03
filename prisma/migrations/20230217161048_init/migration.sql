-- DropIndex
DROP INDEX "Client_clientId_idx";

-- CreateIndex
CREATE INDEX "Client_clientId_id_idx" ON "Client"("clientId", "id");
