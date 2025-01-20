'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { ReportStatus, ReportType } from '@prisma/client'
import { z } from "zod"
import { auth } from "@/lib/auth"

type CreateReportInput = {
  tenderId: string
  reporterId: number
  type: ReportType
  description: string
  evidence?: string
}

type GetReportsFilters = {
  tenderId?: string
  reporterId?: number
  status?: ReportStatus
}

// Validation schema for the irregularity report
const ReportSchema = z.object({
  tenderId: z.string().min(1, "Tender ID is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  evidence: z.string().optional(),
  reportType: z.nativeEnum(ReportType).default(ReportType.IRREGULARITY)
})

export async function getReports(filters?: GetReportsFilters) {
  try {
    const where: Prisma.ReportWhereInput = {}

    // Filter by status if provided
    if (filters?.status) {
      where.status = filters.status
    }

    // Fetch reports with associated tender information
    const reports = await prisma.report.findMany({
      where,
      include: {
        tender: {
          select: {
            title: true
          }
        },
        reporter: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the reports to match the expected client-side type
    return reports.map(report => ({
      id: report.id,
      tenderId: report.tenderId,
      tenderTitle: report.tender.title,
      type: report.type,
      description: report.description,
      reporterName: report.reporter.name,
      status: report.status,
      createdAt: report.createdAt
    }))
  } catch (error) {
    console.error('Failed to fetch reports:', error)
    throw new Error('Unable to retrieve reports')
  }
}

export async function createReport(data: CreateReportInput) {
  try {
    const report = await prisma.report.create({
      data: {
        tenderId: data.tenderId,
        reporterId: data.reporterId,
        type: data.type,
        description: data.description,
        evidence: data.evidence,
        status: ReportStatus.PENDING,
      },
      include: {
        tender: {
          select: {
            title: true,
          },
        },
        reporter: {
          select: {
            name: true,
            company: true,
          },
        },
      },
    })

    revalidatePath('/procurement-officer/reports')
    revalidatePath('/vendor/reports')
    return report
  } catch (error) {
    console.error('Error creating report:', error)
    throw new Error('Failed to create report')
  }
}

export async function updateReportStatus(reportId: string, newStatus: ReportStatus) {
  try {
    // Validate the new status
    const validStatuses: ReportStatus[] = [
      ReportStatus.PENDING, 
      ReportStatus.INVESTIGATING, 
      ReportStatus.RESOLVED, 
      ReportStatus.DISMISSED
    ]
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid report status')
    }

    // Update the report status
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: { 
        status: newStatus,
        updatedAt: new Date() // Optional: track when the status was last updated
      }
    })

    return updatedReport
  } catch (error) {
    console.error('Failed to update report status:', error)
    throw new Error('Unable to update report status')
  }
}

export async function submitIrregularityReport(formData: z.infer<typeof ReportSchema>) {
  // Get the current authenticated session
  const session = await auth()
  
  if (!session || !session.user) {
    throw new Error("You must be logged in to submit a report")
  }

  // Ensure the user is a valid reporter (e.g., citizen or vendor)
  const allowedRoles = ['VENDOR', 'CITIZEN']
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error("You are not authorized to submit a report")
  }

  try {
    // Validate the input
    const validatedData = ReportSchema.parse(formData)

    // Create the report in the database
    const report = await prisma.report.create({
      data: {
        tenderId: validatedData.tenderId,
        type: validatedData.reportType,
        description: validatedData.description,
        evidence: validatedData.evidence,
        status: ReportStatus.PENDING,
        reporterId: session.user.id, // Use the authenticated user's ID
        createdAt: new Date()
      }
    })

    // Optionally, you could add a notification mechanism here
    // For example, sending an email to procurement officers

    return {
      success: true,
      message: "Report submitted successfully",
      reportId: report.id
    }
  } catch (error) {
    console.error("Error submitting irregularity report:", error)

    if (error instanceof z.ZodError) {
      // Handle validation errors
      return {
        success: false,
        message: error.errors[0].message
      }
    }

    return {
      success: false,
      message: "Failed to submit report. Please try again."
    }
  }
}
