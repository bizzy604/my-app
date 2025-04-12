'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache'

type ReportData = {
  id: string
  tenderId: string
  reporterId: string
  type: string
  description: string
  status: string
  createdAt: Date
  updatedAt: Date
}

const ReportStatus = {
  PENDING: 'PENDING',
  INVESTIGATING: 'INVESTIGATING',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED'
} as const;

const ReportType = {
  IRREGULARITY: 'IRREGULARITY',
  BID_RIGGING: 'BID_RIGGING',
  CORRUPTION: 'CORRUPTION',
  FRAUD: 'FRAUD',
  OTHER: 'OTHER'
} as const;

type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus];
type ReportType = typeof ReportType[keyof typeof ReportType];
import { z } from "zod"
import { getServerAuthSession } from '@/lib/auth'
import { cookies } from 'next/headers'

type CreateReportInput = {
  tenderId: string
  reporterId: string
  type: ReportType
  description: string
  evidence?: string
}

type GetReportsFilters = {
  tenderId?: string
  reporterId?: string
  status?: ReportStatus
}

// Validation schema for the irregularity report
const ReportSchema = z.object({
  tenderId: z.string().min(1, "Tender ID is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  reportType: z.nativeEnum(ReportType).default(ReportType.IRREGULARITY),
  reportSubtype: z.string().optional(),
  reporterName: z.string().optional(),
  contactInfo: z.string().optional(),
  evidence: z.string().optional()
})

export async function getReports(filters?: GetReportsFilters) {
  try {
    // Authenticate the user
    const session = await getServerAuthSession()

    if (!session) {
      console.error('No active session found')
      throw new Error("Unauthorized")
    }

    const where: any = {}

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
    return reports.map((report: ReportData & {
      tender: { title: string },
      reporter: { name: string }
    }) => ({
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
    // Authenticate the user
    const session = await getServerAuthSession()

    if (!session) {
      console.error('No active session found')
      throw new Error("Unauthorized")
    }

    const report = await prisma.report.create({
      data: {
        tenderId: data.tenderId,
        reporterId: data.reporterId,
        type: data.type,
        description: data.description,
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
    console.error("Error creating report:", error)
    throw new Error('Failed to create report')
  }
}

export async function updateReportStatus(reportId: string, newStatus: ReportStatus) {
  try {
    // Authenticate the user
    const session = await getServerAuthSession()

    if (!session) {
      console.error('No active session found')
      throw new Error("Unauthorized")
    }

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
  try {
    // Authenticate the user
    const session = await getServerAuthSession()

    if (!session) {
      console.error('No active session found')
      return { 
        success: false, 
        message: "You must be logged in to submit a report" 
      }
    }

    // Validate the input
    const validatedData = ReportSchema.parse(formData)

    // Create the report
    const report = await prisma.report.create({
      data: {
        tenderId: validatedData.tenderId,
        reporterId: session.user.id,
        type: validatedData.reportType,
        description: `${validatedData.reportSubtype ? `[${validatedData.reportSubtype}] ` : ''}${validatedData.description}`,
        status: ReportStatus.PENDING
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

    // Revalidate the path to reflect the latest changes
    revalidatePath('/citizen/reports')

    return { 
      success: true, 
      message: "Report submitted successfully", 
      reportId: report.id 
    }
  } catch (error) {
    console.error('Error submitting report:', error)
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        message: "Invalid report details. Please check your input." 
      }
    }

    return { 
      success: false, 
      message: "An unexpected error occurred while submitting the report" 
    }
  }
}

export async function getAllReports() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        tender: {
          select: {
            title: true
          }
        },
        reporter: {
          select: {
            name: true,
            company: true
          }
        }
      }
    })

    return reports

  } catch (error) {
    console.error('Error fetching reports:', error)
    throw new Error('Failed to fetch reports')
  }
}
