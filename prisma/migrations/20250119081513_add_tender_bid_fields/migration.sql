/*
  Warnings:

  - Changed the type of `category` on the `Tender` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "approvalDate" TIMESTAMP(3),
ADD COLUMN     "statusUpdatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Tender" ADD COLUMN     "awardedBidId" TEXT,
ADD COLUMN     "departmentId" INTEGER,
ADD COLUMN     "procurementOfficerId" INTEGER,
DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_procurementOfficerId_fkey" FOREIGN KEY ("procurementOfficerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
