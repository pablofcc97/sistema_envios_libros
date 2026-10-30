-- CreateTable
CREATE TABLE "Almacen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Courier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#2563EB',
    "referenciaPredeterminada" TEXT,
    "almacenPredeterminadoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Courier_almacenPredeterminadoId_fkey" FOREIGN KEY ("almacenPredeterminadoId") REFERENCES "Almacen" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Courier" ("color", "createdAt", "id", "nombre", "referenciaPredeterminada", "updatedAt") SELECT "color", "createdAt", "id", "nombre", "referenciaPredeterminada", "updatedAt" FROM "Courier";
DROP TABLE "Courier";
ALTER TABLE "new_Courier" RENAME TO "Courier";
CREATE UNIQUE INDEX "Courier_nombre_key" ON "Courier"("nombre");
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
    "almacenId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Envio_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Envio_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Envio_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Envio" ("claveEnvio", "clienteId", "courierId", "createdAt", "departamento", "direccion", "estado", "id", "observaciones", "referencia", "updatedAt") SELECT "claveEnvio", "clienteId", "courierId", "createdAt", "departamento", "direccion", "estado", "id", "observaciones", "referencia", "updatedAt" FROM "Envio";
DROP TABLE "Envio";
ALTER TABLE "new_Envio" RENAME TO "Envio";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Almacen_nombre_key" ON "Almacen"("nombre");
