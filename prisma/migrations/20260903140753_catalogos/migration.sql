/*
  Warnings:

  - You are about to drop the column `celular` on the `Envio` table. All the data in the column will be lost.
  - You are about to drop the column `cliente` on the `Envio` table. All the data in the column will be lost.
  - You are about to drop the column `dni` on the `Envio` table. All the data in the column will be lost.
  - You are about to drop the column `libros` on the `Envio` table. All the data in the column will be lost.
  - Added the required column `clienteId` to the `Envio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courierId` to the `Envio` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Courier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EnvioProducto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "envioId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "EnvioProducto_envioId_fkey" FOREIGN KEY ("envioId") REFERENCES "Envio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EnvioProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Envio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "agencia" TEXT NOT NULL,
    "claveEnvio" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Envio_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Envio_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Envio" ("agencia", "claveEnvio", "createdAt", "estado", "id", "updatedAt") SELECT "agencia", "claveEnvio", "createdAt", "estado", "id", "updatedAt" FROM "Envio";
DROP TABLE "Envio";
ALTER TABLE "new_Envio" RENAME TO "Envio";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_dni_key" ON "Cliente"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Courier_nombre_key" ON "Courier"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "EnvioProducto_envioId_productoId_key" ON "EnvioProducto"("envioId", "productoId");
