'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma, BidStatus, TenderStatus, TenderSector, TenderCategory, NotificationType } from '@prisma/client'
import { sendTenderAwardEmail, sendBidStatusEmail } from '@/lib/email-utils'
import { Tender } from '@prisma/client'
import { formatCurrency } from "@/lib/utils"
import { uploadToS3 } from '@/lib/s3-upload'
import { getServerAuthSession } from '@/lib/auth'

type BidSubmissionData = {
  tenderId: string;
  bidderId: string | number;
  amount: number;
  completionTime: string;
  technicalProposal: string;
  vendorExperience?: string;
  documents?: {
    fileName: string;
    fileType: string;
    fileSize: number;
    fileData: string | number[];
  }[];
}

export interface Bid {
  id: string
  amount: number
  status: BidStatus
  submittedAt: string
  completionTime: string
  technicalProposal: string
  vendor: {
    id: string
    name: string
    company: string
  }
  documents: {
    id: string
    name: string
    url: string
  }[]
}

interface CreateTenderData {
  title: string
  description: string
  sector: TenderSector
  location: string
  budget: number
  closingDate: string
  category: TenderCategory
  requirements: string[]
  issuerId: number
  status: string
}

interface EvaluationData {
  bidId: string
  stage: string
  score: number
  comments?: string
  evaluatedBy: number
  technicalScore?: number
  financialScore?: number
  experienceScore?: number
  documentReviews?: Array<{
    documentId: string
    comments: string
    status: 'ACCEPTED' | 'REJECTED' | 'NEEDS_CLARIFICATION'
  }>
}

export async function getTenders(filters?: {
  status?: TenderStatus
  sector?: TenderSector
  category?: TenderCategory
}) {
  try {
    // Get the user session
    const session = await getServerAuthSession();
    
    // Set RLS context if we have a user ID
    if (session?.user?.id) {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${session.user.id.toString()}, true)`;
    }
    
    const where: Prisma.TenderWhereInput = {}
    
    // Only apply procurement officer isolation for users with PROCUREMENT role
    // Vendors and citizens should see all tenders
    if (session?.user?.role === 'PROCUREMENT') {
      // Only show tenders where this procurement officer is the issuer or assigned procurement officer
      where.OR = [
        { issuerId: session.user.id },
        { procurementOfficerId: session.user.id }
      ];
    }
    
    if (filters?.status) {
      where.status = filters.status
    }
    if (filters?.sector) {
      where.sector = filters.sector
    }
    if (filters?.category) {
      where.category = filters.category
    }

    const tenders = await prisma.tender.findMany({
      where,
      include: {
        issuer: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        bids: {
          include: {
            bidder: {
              select: {
                id: true,
                name: true,
                company: true,
                email: true,
              }
            },
            documents: true
          },
          orderBy: {
            submissionDate: 'desc'
          }
        },
        documents: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // console.log('Tenders found:', tenders.length)

    return tenders.map(tender => ({
      ...tender,
      bidCount: tender.bids.length,
      totalBidAmount: tender.bids.reduce((sum, bid) => sum + (bid.amount || 0), 0)
    }))
  } catch (error) {
    console.error('Failed to fetch tenders:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    
    // If it's a Prisma error, log additional details
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    throw new Error(`Failed to fetch tenders: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getVendorTenders(vendorId: number | string) {
  try {
    // Ensure vendorId is a number
    const parsedVendorId = typeof vendorId === 'string' 
      ? parseInt(vendorId, 10) 
      : vendorId

    // console.log('Fetching tenders for vendor ID:', parsedVendorId)

    const tenders = await prisma.tender.findMany({
      where: {
        bids: {
          some: {
            bidderId: parsedVendorId
          }
        }
      },
      include: {
        issuer: {
          select: {
            name: true,
            company: true,
          },
        },
        bids: {
          where: {
            bidderId: parsedVendorId
          },
          include: {
            bidder: {
              select: {
                name: true,
                company: true,
              }
            },
            documents: true
          }
        },
        documents: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // console.log('Tenders found:', tenders.length)

    return tenders
  } catch (error) {
    console.error('Failed to fetch vendor tenders:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    console.error('Vendor ID:', vendorId)
    
    // If it's a Prisma error, log additional details
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    throw new Error(`Failed to fetch vendor tenders: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function createTender(data: CreateTenderData) {
  try {
    const closingDate = new Date(data.closingDate).toISOString()
    const { issuerId, ...tenderData } = data

    // Set RLS context for the current user to fix circular dependency issue
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${issuerId.toString()}, true)`
    
    const tender = await prisma.tender.create({
      data: {
        ...tenderData,
        sector: tenderData.sector,
        closingDate,
        status: TenderStatus.OPEN,
        issuer: {
          connect: {
            id: issuerId
          }
        },
        title: tenderData.title,
        description: tenderData.description,
        location: tenderData.location,
        budget: tenderData.budget,
        category: tenderData.category,
        requirements: tenderData.requirements
      }
    })

    revalidatePath('/procurement-officer/tenders')
    return tender
  } catch (error) {
    console.error('Error creating tender:', error)
    throw new Error('Failed to create tender')
  }
}

export async function getTenderById(id: string) {
  try {
    // Get the user session
    const session = await getServerAuthSession();
    
    // Set RLS context if we have a user ID
    if (session?.user?.id) {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${session.user.id.toString()}, true)`;
    }
    
    // For procurement officers, verify they have access to this tender
    if (session?.user?.role === 'PROCUREMENT') {
      const userTender = await prisma.tender.findFirst({
        where: {
          id,
          OR: [
            { issuerId: session.user.id },
            { procurementOfficerId: session.user.id }
          ]
        },
        select: { id: true }
      });
      
      // If no tender found, this officer doesn't have access
      if (!userTender) {
        throw new Error('You do not have access to this tender');
      }
    }
    
    const tender = await prisma.tender.findUnique({
      where: { id },
      include: {
        department: true,
        procurementOfficer: {
          select: {
            name: true,
            email: true
          }
        },
        documents: true,
        bids: {
          include: {
            bidder: {
              select: {
                name: true,
                company: true
              }
            }
          }
        }
      }
    })
    return tender
  } catch (error) {
    console.error('Error fetching tender:', error)
    throw new Error('Failed to fetch tender')
  }
}

export async function updateTender(id: string, data: Partial<Tender>) {
  try {
    // Get the user session
    const session = await getServerAuthSession();
    
    // Set RLS context if we have a user ID
    if (session?.user?.id) {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${session.user.id.toString()}, true)`;
    }
    
    // For procurement officers, verify they have access to this tender
    if (session?.user?.role === 'PROCUREMENT') {
      const userTender = await prisma.tender.findFirst({
        where: {
          id,
          OR: [
            { issuerId: session.user.id },
            { procurementOfficerId: session.user.id }
          ]
        },
        select: { id: true }
      });
      
      // If no tender found, this officer doesn't have access
      if (!userTender) {
        throw new Error('You do not have access to update this tender');
      }
    }
    
    // Convert closingDate string to ISO format if it exists
    const closingDate = data.closingDate ? new Date(data.closingDate).toISOString() : undefined

    const tender = await prisma.tender.update({
      where: { id },
      data: {
        ...data,
        closingDate, // Use the converted date
        sector: data.sector,
      }
    })

    revalidatePath('/procurement-officer/tenders')
    return tender
  } catch (error) {
    console.error('Error updating tender:', error)
    throw new Error('Failed to update tender')
  }
}

export async function deleteTender(id: string) {
  try {
    // Get the user session
    const session = await getServerAuthSession();
    
    // Set RLS context if we have a user ID
    if (session?.user?.id) {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${session.user.id.toString()}, true)`;
    }
    
    // For procurement officers, verify they have access to this tender
    if (session?.user?.role === 'PROCUREMENT') {
      const userTender = await prisma.tender.findFirst({
        where: {
          id,
          OR: [
            { issuerId: session.user.id },
            { procurementOfficerId: session.user.id }
          ]
        },
        select: { id: true }
      });
      
      // If no tender found, this officer doesn't have access
      if (!userTender) {
        throw new Error('You do not have access to delete this tender');
      }
    }
    
    await prisma.tender.delete({
      where: { id }
    })
    revalidatePath('/procurement-officer/tenders')
  } catch (error) {
    console.error('Error deleting tender:', error)
    throw new Error('Failed to delete tender')
  }
}

export async function submitBid(data: BidSubmissionData) {
  try {
    // Check if vendor has already submitted a bid for this tender
    const existingBid = await prisma.bid.findFirst({
      where: {
        tenderId: data.tenderId,
        bidderId: typeof data.bidderId === 'string' ? parseInt(data.bidderId) : data.bidderId,
      }
    })

    if (existingBid) {
      throw new Error('You have already submitted a bid for this tender')
    }

    // Convert bidderId to number if it's a string
    const bidderId = typeof data.bidderId === 'string' ? parseInt(data.bidderId, 10) : data.bidderId;

    // Create the bid first
    const bid = await prisma.bid.create({
      data: {
        tenderId: data.tenderId,
        bidderId: bidderId,
        amount: data.amount,
        completionTime: data.completionTime,
        technicalProposal: data.technicalProposal,
        vendorExperience: data.vendorExperience,
        status: BidStatus.PENDING,
      },
    })

    // Handle document uploads if any
    if (data.documents && data.documents.length > 0) {
      try {
        // Upload documents to S3 first
        const uploadPromises = data.documents.map(async (doc) => {
          const blob = new Blob(
            [Buffer.from(doc.fileData as string, 'base64')], 
            { type: doc.fileType }
          )
          const file = new File([blob], doc.fileName, { type: doc.fileType })

          return uploadToS3(file, {
            userId: bidderId,
            bidId: bid.id,
            tenderId: data.tenderId
          })
        })

        const uploadedDocs = await Promise.all(uploadPromises)

        // Then create document records in database
        await prisma.$transaction(
          uploadedDocs.map((uploadedDoc, index) => 
            prisma.document.create({
      data: {
                fileName: data.documents![index].fileName,
                fileSize: data.documents![index].fileSize,
                fileType: data.documents![index].fileType,
                url: uploadedDoc.url,
                s3Key: uploadedDoc.key,
                bidId: bid.id,
                userId: bidderId,
              },
            })
          )
        )
      } catch (uploadError) {
        console.error('Document upload error:', uploadError)
        throw new Error(`Document upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`)
      }
    }

    // Create notification
    await prisma.notification.create({
      data: {
        type: NotificationType.TENDER_STATUS_UPDATE,
        message: `New bid submitted for tender ${data.tenderId}`,
        userId: bidderId,
      },
    })

    revalidatePath(`/vendor/tenders/${data.tenderId}`)
    return bid

  } catch (error) {
    console.error('Error submitting bid:', error)
    throw error
  }
}

export async function updateBid(data: {
  bidId: string
  amount: number
  technicalProposal: string
  documents?: {
    fileName: string
    fileSize: number
    fileType: string
    url: string
  }[]
}) {
  try {
    // Get the bid to update
    const existingBid = await prisma.bid.findUnique({
      where: { id: data.bidId },
      include: { tender: true }
    })

    if (!existingBid) {
      throw new Error('Bid not found')
    }

    if (existingBid.tender.closingDate < new Date()) {
      throw new Error('Cannot update bid after tender closing date')
    }

    if (existingBid.status !== BidStatus.PENDING) {
      throw new Error('Cannot update bid in current status')
    }

    // Upload documents to S3 if any
    const documentUrls = data.documents ? await Promise.all(
      data.documents.map(async (doc) => {
        // Create a proper File object
        const file = new File([new Blob([JSON.stringify(doc)])], doc.fileName, {
          type: doc.fileType,
          lastModified: Date.now()
        })

        // Upload document using uploadToS3
        const uploadedDoc = await uploadToS3(file, {
          userId: existingBid.bidderId,
          bidId: existingBid.id,
          tenderId: existingBid.tenderId
        })

        return {
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          fileType: doc.fileType,
          url: uploadedDoc.url,
          s3Key: uploadedDoc.key
        }
      })
    ) : []

    // Update the bid
    const bid = await prisma.bid.update({
      where: { id: data.bidId },
      data: {
        amount: data.amount,
        technicalProposal: data.technicalProposal,
        documents: existingBid ? {
          deleteMany: {},
          create: documentUrls.map(doc => ({
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            fileType: doc.fileType,
            url: doc.url,
            s3Key: doc.s3Key,
            userId: existingBid.bidderId
          }))
        } : undefined,
      },
      include: {
        documents: true,
        tender: true,
      },
    })

    revalidatePath('/vendor/tenders-history')
    return bid
  } catch (error) {
    console.error('Failed to update bid:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    console.error('Bid data:', data)
    throw error
  }
}

export async function cancelBid(bidId: string) {
  try {
    const bid = await prisma.bid.update({
      where: { id: bidId },
      data: { status: BidStatus.REJECTED },
      include: {
        tender: true,
        bidder: {
          select: {
            name: true,
            company: true,
          }
        }
      }
    })

    revalidatePath(`/procurement-officer/tenders/${bid.tenderId}`)
    revalidatePath(`/vendor/tenders/${bid.tenderId}`)
    return bid
  } catch (error) {
    console.error('Failed to cancel bid:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    console.error('Bid ID:', bidId)
    throw new Error('Failed to cancel bid')
  }
}

export async function checkVendorBidStatus(tenderId: string, vendorId: number): Promise<boolean> {
  try {
    const existingBid = await prisma.bid.findFirst({
      where: {
        tenderId: tenderId,
        bidderId: vendorId
      }
    })
    
    return !!existingBid // Returns true if a bid exists, false otherwise
  } catch (error) {
    console.error('Error checking bid status:', error)
    throw new Error('Failed to check bid status')
  }
}

export async function getTenderBids(tenderId: string) {
  try {
    // Get the user session
    const session = await getServerAuthSession();
    
    // Set RLS context if we have a user ID
    if (session?.user?.id) {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${session.user.id.toString()}, true)`;
    }
    
    // For procurement officers, verify they have access to this tender's bids
    if (session?.user?.role === 'PROCUREMENT') {
      const userTender = await prisma.tender.findFirst({
        where: {
          id: tenderId,
          OR: [
            { issuerId: session.user.id },
            { procurementOfficerId: session.user.id }
          ]
        },
        select: { id: true }
      });
      
      // If no tender found, this officer doesn't have access
      if (!userTender) {
        throw new Error('You do not have access to the bids for this tender');
      }
    }
    
    const bids = await prisma.bid.findMany({
      where: { tenderId },
      include: {
        bidder: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true
          }
        },
        documents: true,
        evaluationLogs: {
          include: {
            evaluator: {
              select: {
                name: true
              }
            },
            bid: true,
            tender: true
          }
        }
      },
      orderBy: {
        submissionDate: 'desc'
      }
    })

    return bids
  } catch (error) {
    console.error('Error fetching bids:', error)
    return []  // Return empty array instead of throwing
  }
}

export async function updateBidStatus(bidId: string, ACCEPTED: string, status: BidStatus): Promise<void> {
  try {
    await prisma.bid.update({
      where: {
        id: bidId
      },
      data: {
        status
      }
    })
    
    revalidatePath('/procurement-officer/tenders')
  } catch (error) {
    console.error('Error updating bid status:', error)
    throw new Error('Failed to update bid status')
  }
}

export async function getBidById(bidId: string) {
  try {
    // Get the user session
    const session = await getServerAuthSession();
    
    // Set RLS context if we have a user ID
    if (session?.user?.id) {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${session.user.id.toString()}, true)`;
    }
    
    // For procurement officers, verify they have access to the tender associated with this bid
    if (session?.user?.role === 'PROCUREMENT') {
      // First get the bid to find its tenderId
      const bidInfo = await prisma.bid.findUnique({
        where: { id: bidId },
        select: { tenderId: true }
      });
      
      if (!bidInfo) {
        throw new Error('Bid not found');
      }
      
      // Now check if the procurement officer has access to this tender
      const userTender = await prisma.tender.findFirst({
        where: {
          id: bidInfo.tenderId,
          OR: [
            { issuerId: session.user.id },
            { procurementOfficerId: session.user.id }
          ]
        },
        select: { id: true }
      });
      
      // If no tender found, this officer doesn't have access
      if (!userTender) {
        throw new Error('You do not have access to this bid');
      }
    }
    
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        tender: true,
        bidder: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
            address: true,
            businessType: true,
            registrationNumber: true,
            establishmentDate: true,
          }
        },
        documents: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            url: true,
            uploadDate: true,
          }
        },
        evaluationLogs: {
          include: {
            evaluator: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!bid) {
      throw new Error('Bid not found')
    }

    const evaluationLogs = await prisma.bidEvaluationLog.findMany({
      where: { bidId },
      include: {
        evaluator: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return {
      ...bid,
      evaluationLogs: evaluationLogs.map((log) => ({
        stage: log.stage || 'PENDING',
        totalScore: log.totalScore,
        comments: log.comments,
        evaluator: log.evaluator,
        createdAt: log.createdAt,
        technicalScore: log.technicalScore,
        financialScore: log.financialScore,
        experienceScore: log.experienceScore
      }))
    }
  } catch (error) {
    console.error('Error fetching bid:', error)
    throw new Error('Failed to fetch bid')
  }
}

export async function evaluateBid(
  bidId: string,
  data: {
    stage: string
    score: number
    comments?: string
    status: BidStatus
    evaluatedBy: number
  }
) {
  try {
    // First, check if the bid exists
    const existingBid = await prisma.bid.findUnique({
      where: { id: bidId }
    })

    if (!existingBid) {
      throw new Error('Bid not found')
    }

    // Create the evaluation stage first
    const evaluationStage = await prisma.evaluationStage.create({
      data: {
        bid: { 
          connect: { id: bidId } 
        },
        stage: data.stage,
        score: data.score,
        status: data.status,
        comments: data.comments,
        evaluator: {  // Only use the evaluator relation
          connect: { id: data.evaluatedBy }
        }
      }
    })

    // Then update the bid status
    const bid = await prisma.bid.update({
      where: { id: bidId },
      data: {
        status: data.status
      },
      include: {
        tender: true,
        bidder: true,
        evaluationStages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    // If bid is shortlisted, send notification
    if (data.status === BidStatus.SHORTLISTED) {
      await sendBidStatusEmail(
        bid.bidder.email,
        'shortlisted',
        {
          recipientName: bid.bidder.name,
          tenderTitle: bid.tender.title,
          message: 'Your bid has been shortlisted for further evaluation.',
          bidAmount: bid.amount,
          companyName: bid.bidder.company || 'N/A',
          tenderReference: bid.tender.id
        }
      )
    }

    return bid
  } catch (error) {
    console.error('Error evaluating bid:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    throw error
  }
}

export async function awardTender(
  tenderId: string,
  bidId: string, 
  userId: number
) {
  try {
    // Get bid and tender details
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        tender: true,
        bidder: true,
      }
    })

    if (!bid || !bid.bidder || !bid.tender) {
      throw new Error('Bid or related data not found')
    }

    // Update bid status to AWARDED
    await prisma.bid.update({
      where: { id: bidId },
      data: { status: BidStatus.ACCEPTED  }
    })

    // Update tender status to AWARDED
    await prisma.tender.update({
      where: { id: tenderId },
      data: { status: TenderStatus.AWARDED }
    })

    // Send email notification
    await sendTenderAwardEmail({
      to: bid.bidder.email,
      subject: 'Tender Award Notification',
      data: { 
        recipientName: bid.bidder.name,
        tenderTitle: bid.tender.title,
        message: 'Congratulations! Your bid has been accepted and you have been awarded the tender.',
        bidAmount: bid.amount,
        companyName: bid.bidder.company || 'N/A',
        tenderReference: bid.tender.id
      }
    })

    // Create notification
    await prisma.notification.create({
        data: {
        type: NotificationType.TENDER_STATUS_UPDATE,
        message: `Your bid for tender ${bid.tender.title} has been accepted`,
        userId: bid.bidderId,
      }
    })

    revalidatePath('/procurement-officer/tenders')
    revalidatePath(`/procurement-officer/tenders/${tenderId}`)
    return { success: true }

  } catch (error) {
    console.error('Error awarding tender:', error)
    throw new Error('Failed to award tender')
  }
}

export async function getTenderReports(timeRange: string) {
  try {
    const startDate = new Date()
    switch (timeRange) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        startDate.setMonth(startDate.getMonth() - 1) // default to last month
    }

    const tenders = await prisma.tender.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        bids: true,
      },
    })

    return tenders.map(tender => ({
      id: tender.id,
      title: tender.title,
      status: tender.status,
      budget: tender.budget,
      bidsCount: tender.bids.length,
      closingDate: tender.closingDate.toISOString(),
    }))
  } catch (error) {
    console.error('Error fetching tender reports:', error)
    throw new Error('Failed to fetch tender reports')
  }
}

export async function getTenderHistory(tenderId?: string) {
  try {
    // Get the user session
    const session = await getServerAuthSession();
    
    // Set RLS context if we have a user ID
    if (session?.user?.id) {
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${session.user.id.toString()}, true)`;
    }
    
    if (tenderId) {
      // For procurement officers, verify they have access to this tender
      if (session?.user?.role === 'PROCUREMENT') {
        const userTender = await prisma.tender.findFirst({
          where: {
            id: tenderId,
            OR: [
              { issuerId: session.user.id },
              { procurementOfficerId: session.user.id }
            ]
          },
          select: { id: true }
        });
        
        // If no tender found, this officer doesn't have access
        if (!userTender) {
          throw new Error('You do not have access to this tender history');
        }
      }
      
      const tenderExists = await prisma.tender.findUnique({
        where: { id: tenderId },
        select: { id: true }
      })

      if (!tenderExists) {
        throw new Error('Tender not found')
      }

      const history = await prisma.tenderHistory.findMany({
        where: { tenderId },
        include: {
          changedByUser: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          changeDate: 'desc'
        }
      })

      return history
    } else {
      // Build the where clause for the tender query
      const where: Prisma.TenderWhereInput = {};
      
      // Only apply procurement officer isolation for users with PROCUREMENT role
      if (session?.user?.role === 'PROCUREMENT') {
        // Only show tenders where this procurement officer is the issuer or assigned procurement officer
        where.OR = [
          { issuerId: session.user.id },
          { procurementOfficerId: session.user.id }
        ];
      }
      
      const tenders = await prisma.tender.findMany({
        where,
        include: {
          bids: {
            where: {
              status: BidStatus.ACCEPTED
            },
            include: {
              bidder: {
                select: {
                  name: true,
                  company: true
                }
              }
            }
          },
          history: {
            include: {
              changedByUser: {
                select: {
                  name: true
                }
              }
            },
            orderBy: {
              changeDate: 'desc'
            },
            take: 1
          }
        }
      })

      return tenders
    }
  } catch (error) {
    console.error('Error fetching tender history:', error)
    throw new Error('Failed to fetch tender history')
  }
}

export async function createTenderHistoryEntry({
  tenderId,
  status,
  changedBy,
  comments,
  previousValues,
  newValues
}: {
  tenderId: string
  status: TenderStatus
  changedBy: number
  comments?: string
  previousValues?: any
  newValues?: any
}) {
  try {
    const historyEntry = await prisma.tenderHistory.create({
      data: {
        tenderId,
        status,
        changedBy,
        comments,
        previousValues,
        newValues
      }
    })
    return historyEntry
  } catch (error) {
    console.error('Error creating tender history entry:', error)
    throw new Error('Failed to create tender history entry')
  }
}

export async function getBidsForTender(tenderId: string): Promise<Bid[]> {
  try {
      const bids = await prisma.bid.findMany({
      where: {
        tenderId
      },
        include: {
          bidder: {
            select: {
              id: true,
              name: true,
            company: true
          }
        },
        documents: {
          select: {
            id: true,
            fileName: true,
            url: true
          }
        }
      }
    })

    return bids.map(bid => ({
      id: bid.id,
      amount: bid.amount,
      status: bid.status,
      submittedAt: bid.submissionDate.toISOString(),
      completionTime: bid.completionTime || '',
      technicalProposal: bid.technicalProposal,
      vendor: {
        id: bid.bidder.id.toString(),
        name: bid.bidder.name,
        company: bid.bidder.company || 'No Company',
      },
      documents: bid.documents.map(doc => ({
        id: doc.id,
        name: doc.fileName,
        url: doc.url,
      }))
    }))
  } catch (error) {
    console.error('Error fetching bids:', error)
    throw new Error('Failed to fetch bids')
  }
}

export async function updateTenderStatus(
  tenderId: string, 
  newStatus: TenderStatus, 
  userId: number,
  comments?: string
) {
  try {
    // Get current tender state
    const currentTender = await prisma.tender.findUnique({
      where: { id: tenderId }
    })

    if (!currentTender) {
      throw new Error('Tender not found')
    }

    // Update tender status
    const updatedTender = await prisma.tender.update({
      where: { id: tenderId },
      data: { status: newStatus }
    })

    // Create history entry
    await createTenderHistoryEntry({
      tenderId,
      status: newStatus,
      changedBy: userId,
      comments,
      previousValues: { status: currentTender.status },
      newValues: { status: newStatus }
    })

    revalidatePath(`/procurement-officer/tenders-history/${tenderId}`)
    return updatedTender
  } catch (error) {
    console.error('Error updating tender status:', error)
    throw new Error('Failed to update tender status')
  }
}

export async function getBidHistory(userId: number) {
  try {
    const bids = await prisma.bid.findMany({
      where: {
        bidderId: userId
      },
      include: {
        tender: {
          select: {
            id: true,
            title: true,
            description: true,
            closingDate: true,
            budget: true,
            status: true
          }
        },
        documents: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            url: true,
            uploadDate: true
          }
        }
      },
      orderBy: {
        submissionDate: 'desc'
      }
    })

    return bids.map(bid => ({
      id: bid.id,
      amount: bid.amount,
      status: bid.status,
      submittedAt: bid.submissionDate,
      completionTime: bid.completionTime,
      technicalProposal: bid.technicalProposal,
      tender: bid.tender,
      documents: bid.documents
    }))
  } catch (error) {
    console.error('Error fetching bid history:', error)
    throw new Error('Failed to fetch bid history')
  }
}

export async function sendAwardNotification({
  bidId, 
  message, 
  recipientEmail, 
  recipientName,
}: {
  bidId: string
  message: string
  recipientEmail: string
  recipientName: string
}) {
  try {
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { 
        tender: true,
        bidder: true 
      }
    })

    if (!bid) {
      throw new Error('Bid not found')
    }

    // Create notification in database
    await prisma.notification.create({
      data: {
        type: NotificationType.TENDER_AWARD,
        message: `Congratulations! Your bid for tender "${bid.tender.title}" has been accepted.`,
        userId: bid.bidderId,
      }
    })

    // Send email notification
    await sendTenderAwardEmail({
      to: recipientEmail,
      subject: `Tender Award Notification - ${bid.tender.title}`,
      data: {
        recipientName,
        tenderTitle: bid.tender.title,
        message,
        bidAmount: bid.amount,
        companyName: bid.bidder.company || '',
        tenderReference: bid.tender.id
      }
    })

    revalidatePath(`/procurement-officer/tenders/${bid.tenderId}`)
    revalidatePath(`/procurement-officer/tenders-history`)
    
    return {
      success: true,
      message: 'Award notification sent successfully'
    }
  } catch (error) {
    console.error('Error sending award notification:', error)
    throw new Error('Failed to send award notification')
  }
}

export async function awardTenderAndNotify(tenderId: string, bidId: string, userId: string) {
  try {
    // Validate that the user has permission to award this tender
    const userIdNumber = parseInt(userId);
    if (isNaN(userIdNumber)) {
      throw new Error('Invalid userId provided');
    }
    
    // Award the tender
    const result = await prisma.$transaction(async (tx) => {
      // Get the bid details
      const bid = await tx.bid.findUnique({
        where: { id: bidId },
        include: {
          tender: true,
          bidder: true
        }
      })

      if (!bid) {
        throw new Error('Bid not found')
      }

      // Update the tender status and set the awarded bid
      await tx.tender.update({
        where: { id: tenderId },
        data: {
          status: TenderStatus.AWARDED,
          awardedBidId: bidId,
          awardedById: userIdNumber,
        }
      })

      // Create award log
      const awardLog = await tx.tenderAwardLog.create({
        data: {
          tenderId,
          bidId,
          awardedBy: userIdNumber,
          createdAt: new Date()
        }
      })

      // Update winning bid status
      await tx.bid.update({
        where: { id: bidId },
        data: { status: BidStatus.ACCEPTED }
      })

      // Update other bids as rejected
      await tx.bid.updateMany({
        where: {
          tenderId,
          id: { not: bidId }
        },
        data: { status: BidStatus.REJECTED }
      })

      // Create notification
      await tx.notification.create({
        data: {
          type: NotificationType.TENDER_AWARD,
          message: `Congratulations! Your bid for tender "${bid.tender.title}" has been accepted.`,
          userId: bid.bidderId,
          tenderId: tenderId,
          bidId: bidId
        }
      })

      // Send email notification
      await sendTenderAwardEmail({
        to: bid.bidder.email,
        subject: `Tender Award Notification - ${bid.tender.title}`,
        data: {
          recipientName: bid.bidder.name,
          tenderTitle: bid.tender.title,
          message: 'Congratulations! Your bid has been accepted and you have been awarded the tender.',
          bidAmount: bid.amount,
          companyName: bid.bidder.company || '',
          tenderReference: bid.tender.id
        }
      })

      return { success: true }
    })

    revalidatePath(`/procurement-officer/tenders/${tenderId}`)
    revalidatePath('/procurement-officer/tenders')
    
    return result
  } catch (error) {
    console.error('Error in award process:', error)
    throw new Error('Failed to complete the award process')
  }
}

export async function getShortlistedBids(tenderId: string) {
  try {
    console.log(`Fetching shortlisted bids for tender: ${tenderId}`)
    
    const shortlistedBids = await prisma.bid.findMany({
      where: {
        tenderId,
        status: {
          in: [BidStatus.SHORTLISTED, BidStatus.FINAL_EVALUATION, BidStatus.ACCEPTED]
        }
      },
      include: {
        bidder: {
          select: {
            name: true,
            company: true,
            email: true
          }
        },
        evaluationLogs: {
          select: {
            stage: true,
            technicalScore: true,
            financialScore: true,
            experienceScore: true,
            totalScore: true,
            comments: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        evaluationStages: {
          select: {
            stage: true,
            score: true,
            comments: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 3
        }
      }
    })
    
    console.log(`Found ${shortlistedBids.length} shortlisted bids`)
    
    // Log the first bid to debug
    if (shortlistedBids.length > 0) {
      console.log('First bid data:', JSON.stringify({
        id: shortlistedBids[0].id,
        evaluationLogs: shortlistedBids[0].evaluationLogs,
        evaluationStages: shortlistedBids[0].evaluationStages
      }, null, 2))
    }

    // Transform the data to match the expected format
    const transformedBids = shortlistedBids.map(bid => {
      // Try to get scores from evaluationLogs first
      let technicalScore = bid.evaluationLogs[0]?.technicalScore;
      let financialScore = bid.evaluationLogs[0]?.financialScore;
      let experienceScore = bid.evaluationLogs[0]?.experienceScore;
      let totalScore = bid.evaluationLogs[0]?.totalScore;
      
      // Calculate a score if we have evaluation stages but no logs
      if ((!technicalScore || !financialScore || !experienceScore) && bid.evaluationStages.length > 0) {
        // Get the score from the most recent evaluation stage
        const totalFromStages = bid.evaluationStages[0]?.score || 0;
        
        // If we have at least one stage with a score, distribute it proportionally
        if (totalFromStages > 0) {
          if (!technicalScore) technicalScore = Math.round(totalFromStages * 0.4 * 100) / 100;
          if (!financialScore) financialScore = Math.round(totalFromStages * 0.4 * 100) / 100;
          if (!experienceScore) experienceScore = Math.round(totalFromStages * 0.2 * 100) / 100;
          if (!totalScore) totalScore = totalFromStages;
        }
      }
      
      // Create a comprehensive bid object
      return {
        id: bid.id,
        amount: bid.amount,
        status: bid.status,
        score: totalScore || 0,
        technicalScore: technicalScore || 0,
        financialScore: financialScore || 0,
        experienceScore: experienceScore || 0,
        bidder: {
          name: bid.bidder.name,
          company: bid.bidder.company
        },
        evaluationStages: bid.evaluationStages.map(stage => ({
          stage: stage.stage || '',
          score: stage.score || 0,
          comments: stage.comments || ''
        }))
      };
    });
    
    // Sort by score in descending order
    return transformedBids.sort((a, b) => b.score - a.score);

  } catch (error) {
    console.error('Error fetching shortlisted bids:', error)
    throw new Error('Failed to fetch shortlisted bids')
  }
}
