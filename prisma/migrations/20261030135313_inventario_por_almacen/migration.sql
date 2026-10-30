-- CreateTable
CREATE TABLE "ExistenciaAlmacen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "almacenId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExistenciaAlmacen_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ExistenciaAlmacen_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MovimientoInventario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" TEXT,
    "operacionId" TEXT,
    "productoId" TEXT NOT NULL,
    "almacenId" TEXT NOT NULL,
    "envioId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MovimientoInventario_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MovimientoInventario_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MovimientoInventario_envioId_fkey" FOREIGN KEY ("envioId") REFERENCES "Envio" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
    "descuentaInventario" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Courier_almacenPredeterminadoId_fkey" FOREIGN KEY ("almacenPredeterminadoId") REFERENCES "Almacen" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Courier" ("almacenPredeterminadoId", "color", "createdAt", "id", "nombre", "referenciaPredeterminada", "updatedAt") SELECT "almacenPredeterminadoId", "color", "createdAt", "id", "nombre", "referenciaPredeterminada", "updatedAt" FROM "Courier";
DROP TABLE "Courier";
ALTER TABLE "new_Courier" RENAME TO "Courier";
CREATE UNIQUE INDEX "Courier_nombre_key" ON "Courier"("nombre");
UPDATE "Courier" SET "descuentaInventario" = false WHERE UPPER(TRIM("nombre")) = 'RENATO';
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
    "inventarioProcesado" BOOLEAN NOT NULL DEFAULT false,
    "stockDescontado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Envio_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Envio_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Envio_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Envio" ("almacenId", "claveEnvio", "clienteId", "courierId", "createdAt", "departamento", "direccion", "estado", "id", "observaciones", "referencia", "updatedAt") SELECT "almacenId", "claveEnvio", "clienteId", "courierId", "createdAt", "departamento", "direccion", "estado", "id", "observaciones", "referencia", "updatedAt" FROM "Envio";
DROP TABLE "Envio";
ALTER TABLE "new_Envio" RENAME TO "Envio";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ExistenciaAlmacen_productoId_idx" ON "ExistenciaAlmacen"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "ExistenciaAlmacen_almacenId_productoId_key" ON "ExistenciaAlmacen"("almacenId", "productoId");

-- CreateIndex
CREATE INDEX "MovimientoInventario_almacenId_createdAt_idx" ON "MovimientoInventario"("almacenId", "createdAt");

-- CreateIndex
CREATE INDEX "MovimientoInventario_productoId_createdAt_idx" ON "MovimientoInventario"("productoId", "createdAt");

-- CreateIndex
CREATE INDEX "MovimientoInventario_envioId_idx" ON "MovimientoInventario"("envioId");

-- CreateIndex
CREATE INDEX "MovimientoInventario_operacionId_idx" ON "MovimientoInventario"("operacionId");
