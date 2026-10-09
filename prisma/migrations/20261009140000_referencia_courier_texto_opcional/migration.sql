CREATE TEMP TABLE "_CourierReferenceBackup" AS
SELECT "id", "referenciaPredeterminada"
FROM "Courier";

ALTER TABLE "Courier" DROP COLUMN "referenciaPredeterminada";
ALTER TABLE "Courier" ADD COLUMN "referenciaPredeterminada" TEXT;

UPDATE "Courier"
SET "referenciaPredeterminada" = (
  SELECT "referenciaPredeterminada"
  FROM "_CourierReferenceBackup"
  WHERE "_CourierReferenceBackup"."id" = "Courier"."id"
);

DROP TABLE "_CourierReferenceBackup";
