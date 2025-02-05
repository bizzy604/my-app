-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PROCUREMENT', 'VENDOR', 'CITIZEN');

-- CreateEnum
CREATE TYPE "TenderStatus" AS ENUM ('OPEN', 'CLOSED', 'AWARDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'TECHNICAL_EVALUATION', 'SHORTLISTED', 'COMPARATIVE_ANALYSIS', 'FINAL_EVALUATION', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TENDER_AWARD', 'BID_STATUS_UPDATE', 'TENDER_STATUS_UPDATE', 'SYSTEM_ALERT', 'MESSAGE', 'REMINDER');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('IRREGULARITY', 'FRAUD', 'CONFLICT_OF_INTEREST', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "TenderCategory" AS ENUM ('GOODS', 'SERVICES', 'WORKS', 'CONSULTING');

-- CreateEnum
CREATE TYPE "TenderSector" AS ENUM ('CONSTRUCTION', 'MANUFACTURING', 'SERVICES', 'AGRICULTURE', 'TECHNOLOGY', 'HEALTHCARE', 'EDUCATION', 'ENERGY', 'TRANSPORTATION', 'FINANCE');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('PROFIT', 'NON_PROFIT', 'ACADEMIC_INSTITUTION', 'GOVERNMENT_MULTI_AGENCY', 'OTHERS');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VENDOR',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationTokenExpiry" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetTokenExpiry" TIMESTAMP(3),
    "company" TEXT,
    "phone" TEXT,
    "businessType" "BusinessType",
    "registrationNumber" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "website" TEXT,
    "establishmentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tender" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sector" "TenderSector" NOT NULL,
    "category" "TenderCategory" NOT NULL,
    "location" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "requirements" TEXT[],
    "closingDate" TIMESTAMP(3) NOT NULL,
    "issuerId" INTEGER NOT NULL,
    "status" "TenderStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "procurementOfficerId" INTEGER,
    "departmentId" INTEGER,
    "awardedBidId" TEXT,
    "awardedById" INTEGER,

    CONSTRAINT "Tender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "bidderId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "BidStatus" NOT NULL DEFAULT 'PENDING',
    "submissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completionTime" TEXT NOT NULL,
    "technicalProposal" TEXT NOT NULL,
    "vendorExperience" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "s3Key" TEXT,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenderId" TEXT,
    "bidId" TEXT,
    "userId" INTEGER NOT NULL,
    "reportId" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "reporterId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BidEvaluationLog" (
    "id" TEXT NOT NULL,
    "bidId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "comments" TEXT,
    "evaluatedBy" INTEGER NOT NULL,
    "evaluatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenderId" TEXT NOT NULL,
    "technicalScore" DOUBLE PRECISION NOT NULL,
    "financialScore" DOUBLE PRECISION NOT NULL,
    "experienceScore" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BidEvaluationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenderAwardLog" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "bidId" TEXT NOT NULL,
    "awardedBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenderAwardLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenderHistory" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "status" "TenderStatus" NOT NULL,
    "changedBy" INTEGER NOT NULL,
    "changeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comments" TEXT,
    "previousValues" JSONB,
    "newValues" JSONB,

    CONSTRAINT "TenderHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BidEvaluationCriteria" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "criteriaName" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "minScore" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BidEvaluationCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationCommittee" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "appointedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EvaluationCommittee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClarificationRequest" (
    "id" TEXT NOT NULL,
    "bidId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "response" TEXT,
    "requestedBy" INTEGER NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "ClarificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationStage" (
    "id" TEXT NOT NULL,
    "bidId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "status" "BidStatus" NOT NULL,
    "comments" TEXT,
    "evaluatedBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvaluationStage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerificationToken_key" ON "User"("emailVerificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "User"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "Bid_tenderId_bidderId_key" ON "Bid"("tenderId", "bidderId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE INDEX "BidEvaluationLog_bidId_idx" ON "BidEvaluationLog"("bidId");

-- CreateIndex
CREATE INDEX "BidEvaluationLog_tenderId_idx" ON "BidEvaluationLog"("tenderId");

-- CreateIndex
CREATE INDEX "BidEvaluationLog_evaluatedBy_idx" ON "BidEvaluationLog"("evaluatedBy");

-- CreateIndex
CREATE INDEX "TenderHistory_tenderId_idx" ON "TenderHistory"("tenderId");

-- CreateIndex
CREATE INDEX "TenderHistory_changedBy_idx" ON "TenderHistory"("changedBy");

-- CreateIndex
CREATE INDEX "BidEvaluationCriteria_tenderId_idx" ON "BidEvaluationCriteria"("tenderId");

-- CreateIndex
CREATE INDEX "EvaluationCommittee_tenderId_idx" ON "EvaluationCommittee"("tenderId");

-- CreateIndex
CREATE INDEX "EvaluationCommittee_userId_idx" ON "EvaluationCommittee"("userId");

-- CreateIndex
CREATE INDEX "ClarificationRequest_bidId_idx" ON "ClarificationRequest"("bidId");

-- CreateIndex
CREATE INDEX "EvaluationStage_bidId_idx" ON "EvaluationStage"("bidId");

-- CreateIndex
CREATE INDEX "EvaluationStage_evaluatedBy_idx" ON "EvaluationStage"("evaluatedBy");

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_awardedById_fkey" FOREIGN KEY ("awardedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_procurementOfficerId_fkey" FOREIGN KEY ("procurementOfficerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidEvaluationLog" ADD CONSTRAINT "BidEvaluationLog_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidEvaluationLog" ADD CONSTRAINT "BidEvaluationLog_evaluatedBy_fkey" FOREIGN KEY ("evaluatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidEvaluationLog" ADD CONSTRAINT "BidEvaluationLog_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderAwardLog" ADD CONSTRAINT "TenderAwardLog_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderAwardLog" ADD CONSTRAINT "TenderAwardLog_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderHistory" ADD CONSTRAINT "TenderHistory_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderHistory" ADD CONSTRAINT "TenderHistory_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidEvaluationCriteria" ADD CONSTRAINT "BidEvaluationCriteria_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationCommittee" ADD CONSTRAINT "EvaluationCommittee_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationCommittee" ADD CONSTRAINT "EvaluationCommittee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClarificationRequest" ADD CONSTRAINT "ClarificationRequest_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClarificationRequest" ADD CONSTRAINT "ClarificationRequest_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationStage" ADD CONSTRAINT "EvaluationStage_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationStage" ADD CONSTRAINT "EvaluationStage_evaluatedBy_fkey" FOREIGN KEY ("evaluatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
