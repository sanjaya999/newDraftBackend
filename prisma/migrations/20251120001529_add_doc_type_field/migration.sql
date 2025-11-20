-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('YJS', 'CCRDT');

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "docType" "DocumentType" NOT NULL DEFAULT 'YJS';
