-- CreateTable
CREATE TABLE "AIAnalysis" (
    "id" TEXT NOT NULL,
    "bidId" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "initialScreeningScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "complianceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskAssessmentScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "comparativeScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recommendationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "initialScreeningReport" TEXT NOT NULL,
    "complianceReport" TEXT NOT NULL,
    "riskAssessmentReport" TEXT NOT NULL,
    "comparativeReport" TEXT NOT NULL,
    "recommendationReport" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "AIAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIAnalysis_bidId_idx" ON "AIAnalysis"("bidId");

-- CreateIndex
CREATE INDEX "AIAnalysis_tenderId_idx" ON "AIAnalysis"("tenderId");

-- CreateIndex
CREATE INDEX "AIAnalysis_createdBy_idx" ON "AIAnalysis"("createdBy");

-- AddForeignKey
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
