-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "corporatePrice" DECIMAL(12,2),
ADD COLUMN     "isAvailableForCorporate" BOOLEAN NOT NULL DEFAULT false;
