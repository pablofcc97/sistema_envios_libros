-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Envio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "direccion" TEXT,
    "referencia" TEXT,
    "departamento" TEXT NOT NULL,
    "claveEnvio" TEXT,
    "observaciones" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Envio_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Envio_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Envio" ("claveEnvio", "clienteId", "courierId", "createdAt", "departamento", "direccion", "estado", "id", "observaciones", "referencia", "updatedAt") SELECT "claveEnvio", "clienteId", "courierId", "createdAt", "departamento", "direccion", "estado", "id", "observaciones", "referencia", "updatedAt" FROM "Envio";
DROP TABLE "Envio";
ALTER TABLE "new_Envio" RENAME TO "Envio";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
