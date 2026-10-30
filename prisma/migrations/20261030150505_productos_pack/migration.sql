-- CreateTable
CREATE TABLE "ComponentePack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "packId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "ComponentePack_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Producto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ComponentePack_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EnvioProductoComponente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "envioProductoId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "nombreCorto" TEXT,
    "cantidad" INTEGER NOT NULL,
    CONSTRAINT "EnvioProductoComponente_envioProductoId_fkey" FOREIGN KEY ("envioProductoId") REFERENCES "EnvioProducto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EnvioProductoComponente_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Producto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "nombreCorto" TEXT,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "esPack" BOOLEAN NOT NULL DEFAULT false,
    "precio" REAL DEFAULT 0.0,
    "anio" INTEGER DEFAULT 2026,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Producto" ("anio", "createdAt", "destacado", "id", "nombre", "nombreCorto", "precio", "updatedAt") SELECT "anio", "createdAt", "destacado", "id", "nombre", "nombreCorto", "precio", "updatedAt" FROM "Producto";
DROP TABLE "Producto";
ALTER TABLE "new_Producto" RENAME TO "Producto";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ComponentePack_productoId_idx" ON "ComponentePack"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "ComponentePack_packId_productoId_key" ON "ComponentePack"("packId", "productoId");

-- CreateIndex
CREATE INDEX "EnvioProductoComponente_productoId_idx" ON "EnvioProductoComponente"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "EnvioProductoComponente_envioProductoId_productoId_key" ON "EnvioProductoComponente"("envioProductoId", "productoId");

UPDATE "Producto"
SET "esPack" = true, "nombreCorto" = 'Pack 15', "precio" = 270
WHERE "nombre" = 'Pack 15 libros';

UPDATE "Producto"
SET "precio" = 25
WHERE "nombre" IN (
    'Cómo asesorar una tesis',
    'Cómo elegir tu línea de investigación',
    'Cómo elegir una muestra',
    'Cómo empezar una tesis',
    'Cómo escribir una tesis',
    'Cómo evaluar una tesis',
    'Cómo probar una hipótesis',
    'Cómo ser un tutor de tesis',
    'Cómo sustentar una tesis',
    'El propósito de la investigación',
    'Las variables analíticas',
    'Los objetivos del estudio',
    'Taxonomía de la investigación',
    'Técnicas de recolección de datos',
    'Validación de pruebas diagnósticas'
);

INSERT INTO "ComponentePack" ("id", "packId", "productoId", "cantidad")
SELECT lower(hex(randomblob(16))), "pack"."id", "componente"."id", 1
FROM "Producto" AS "pack"
CROSS JOIN "Producto" AS "componente"
WHERE "pack"."nombre" = 'Pack 15 libros'
  AND "componente"."nombre" IN (
    'Cómo asesorar una tesis',
    'Cómo elegir tu línea de investigación',
    'Cómo elegir una muestra',
    'Cómo empezar una tesis',
    'Cómo escribir una tesis',
    'Cómo evaluar una tesis',
    'Cómo probar una hipótesis',
    'Cómo ser un tutor de tesis',
    'Cómo sustentar una tesis',
    'El propósito de la investigación',
    'Las variables analíticas',
    'Los objetivos del estudio',
    'Taxonomía de la investigación',
    'Técnicas de recolección de datos',
    'Validación de pruebas diagnósticas'
  );

INSERT INTO "EnvioProductoComponente" (
    "id", "envioProductoId", "productoId", "nombreProducto", "nombreCorto", "cantidad"
)
SELECT
    lower(hex(randomblob(16))),
    "envioProducto"."id",
    "componente"."id",
    "componente"."nombre",
    "componente"."nombreCorto",
    "envioProducto"."cantidad" * "componentePack"."cantidad"
FROM "EnvioProducto" AS "envioProducto"
JOIN "Producto" AS "pack" ON "pack"."id" = "envioProducto"."productoId"
JOIN "ComponentePack" AS "componentePack" ON "componentePack"."packId" = "pack"."id"
JOIN "Producto" AS "componente" ON "componente"."id" = "componentePack"."productoId"
WHERE "pack"."nombre" = 'Pack 15 libros';
