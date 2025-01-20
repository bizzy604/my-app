'use server'

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache'
import { Prisma, BidStatus, TenderStatus } from '@prisma/client'
import { uploadToS3 } from '@/lib/s3-upload'

export async function getTenders(filters?: {
  status?: TenderStatus
  sector?: string
  category?: string
}) {
  try {
    const where: Prisma.TenderWhereInput = {}
    
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

    console.log('Tenders found:', tenders.length)

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

    console.log('Fetching tenders for vendor ID:', parsedVendorId)

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

    console.log('Tenders found:', tenders.length)

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

export async function createTender(data: {
  title: string
  description: string
  sector: string
  location: string
  budget: number
  closingDate: string
  requirements: string[]
  category: string
  issuerId: number
  documents?: {
    fileName: string
    fileSize: number
    fileType: string
    url: string
  }[]
}) {
  console.log('Creating tender with data:', data)
  try {
    const tender = await prisma.tender.create({
      data: {
        title: data.title,
        description: data.description,
        sector: data.sector,
        location: data.location,
        budget: data.budget,
        closingDate: new Date(data.closingDate),
        requirements: data.requirements,
        category: data.category,
        issuerId: data.issuerId,
        status: TenderStatus.OPEN,
        documents: data.documents ? {
          create: data.documents.map(doc => ({
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            fileType: doc.fileType,
            url: doc.url,
            user: {
              connect: { id: data.issuerId, email: '' }
            }
          }))
        } : undefined,
      },
      include: {
        issuer: {
          select: {
            name: true,
            company: true,
          },
        },
        documents: true,
      },
    })
    console.log('Created tender:', tender)
    revalidatePath('/procurement-officer/tenders')
    revalidatePath('/procurement-officer/tenders-history')
    revalidatePath('/vendor/tenders')
    return tender
  } catch (error) {
    console.error('Failed to create tender:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    console.error('Tender data:', data)
    throw new Error(error instanceof Error ? error.message : 'Failed to create tender. Please check your input and try again.')
  }
}

export async function getTenderById(id: string) {
  try {
    console.log('Fetching tender details for ID:', id)

    const tender = await prisma.tender.findUnique({
      where: { id },
      include: {
        issuer: {
          select: {
            name: true,
            company: true,
          },
        },
        bids: {
          include: {
            bidder: {
              select: {
                name: true,
                company: true,
                id: true, // Include bidder ID for more detailed logging
              }
            }
          }
        },
        documents: true,
      },
    })
    
    if (!tender) {
      console.error(`Tender not found with ID: ${id}`)
      throw new Error('Tender not found')
    }

    // Log detailed tender information for debugging
    console.log('Fetched Tender Details:', {
      id: tender.id,
      title: tender.title,
      status: tender.status,
      closingDate: tender.closingDate,
      bidsCount: tender.bids.length,
      bidderIds: tender.bids.map(bid => bid.bidder.id)
    })
    
    return tender
  } catch (error) {
    console.error('Failed to fetch tender:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    console.error('Tender ID:', id)
    throw new Error('Failed to fetch tender details')
  }
}

export async function updateTender(id: string, data: {
  title?: string
  description?: string
  sector?: string
  location?: string
  budget?: number
  closingDate?: string
  requirements?: string[]
  category?: string
  status?: string
  documents?: {
    fileName: string
    fileSize: number
    fileType: string
    url: string
  }[]
}) {
  try {
    const tender = await prisma.tender.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.sector && { sector: data.sector }),
        ...(data.location && { location: data.location }),
        ...(data.budget && { budget: data.budget }),
        ...(data.closingDate && { closingDate: new Date(data.closingDate) }),
        ...(data.requirements && { requirements: data.requirements }),
        ...(data.status && { status: data.status as TenderStatus }),
        ...(data.documents && {
          documents: {
            deleteMany: {},
            create: data.documents.map(doc => ({
              fileName: doc.fileName,
              fileSize: doc.fileSize,
              fileType: doc.fileType,
              url: doc.url,
              user: {
                connect: { id: Number(id), email: '' }
              }
            }))
          },
        }),
      },
      include: {
        issuer: {
          select: {
            name: true,
            company: true,
          },
        },
        documents: true,
      },
    })
    if (data.status === 'CANCELLED') {
      const bids = await prisma.bid.findMany({
        where: { tenderId: id }
      })

      // Update all bids to rejected status
      await prisma.bid.updateMany({
        where: { tenderId: id },
        data: { status: BidStatus.REJECTED }
      })
    }
    revalidatePath('/procurement-officer/tenders')
    revalidatePath('/procurement-officer/tenders-history')
    revalidatePath('/vendor/tenders')
    return tender
  } catch (error) {
    console.error('Failed to update tender:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    console.error('Tender ID:', id)
    console.error('Tender data:', data)
    throw new Error('Failed to update tender')
  }
}

export async function updateTenderClosingDate(id: string, newClosingDate?: Date) {
  try {
    // If no date provided, set to 30 days from now
    const closingDate = newClosingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    console.log('Updating tender closing date:', {
      tenderId: id,
      newClosingDate: closingDate.toISOString()
    })

    const updatedTender = await prisma.tender.update({
      where: { id },
      data: { 
        closingDate: closingDate 
      }
    })

    console.log('Tender closing date updated successfully:', {
      id: updatedTender.id,
      newClosingDate: updatedTender.closingDate.toISOString()
    })

    return updatedTender
  } catch (error) {
    console.error('Failed to update tender closing date:', error)
    throw new Error(`Failed to update tender closing date: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function deleteTender(id: string) {
  try {
    await prisma.tender.delete({
      where: { id },
    })
    revalidatePath('/procurement-officer/tenders')
    revalidatePath('/procurement-officer/tenders-history')
    revalidatePath('/vendor/tenders')
  } catch (error) {
    console.error('Failed to delete tender:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    console.error('Tender ID:', id)
    throw new Error('Failed to delete tender')
  }
}

export async function submitBid(bidData: {
  tenderId: string;
  bidderId: number;
  amount: number;
  completionTime: string;
  technicalProposal: string;
  experience?: string;
  documents?: File[];
}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) throw new Error('Unauthorized')

    const uploadResults: (string | null)[] = []

    // Handle document uploads only if documents exist
    if (bidData.documents && bidData.documents.length > 0) {
      const uploadPromises = bidData.documents.map(async (doc) => {
        try {
          // Ensure the document is not null and is a valid File object
          if (!doc) return null
          
          const uploadResult = await uploadToS3(doc, {
            userId: bidData.bidderId,
            tenderId: bidData.tenderId
          })
          
          return uploadResult ? {
            url: uploadResult.url,
            fileName: doc.name,
            fileType: doc.type,
            fileSize: doc.size
          } : null
        } catch (uploadError) {
          console.error('Document upload error:', uploadError)
          return null
        }
      })

      uploadResults.push(...(await Promise.all(uploadPromises)))
    }

    const successfulUploads = uploadResults.filter(doc => doc !== null)

    // Log upload statistics
    console.log(`Document Upload Summary: Total Attempted: ${uploadResults.length}, Successful: ${successfulUploads.length}`)

    // Optional: Throw an error if no documents were uploaded when some were expected
    if (bidData.documents && bidData.documents.length > 0 && successfulUploads.length === 0) {
      throw new Error('Failed to upload any documents')
    }

    // Log detailed bid submission information
    console.log('Bid Submission Data:', JSON.stringify({
      tenderId: bidData.tenderId,
      bidderId: bidData.bidderId,
      amount: bidData.amount,
      completionTime: bidData.completionTime,
      technicalProposal: bidData.technicalProposal,
      vendorExperience: bidData.experience,
      documentUrls: successfulUploads
    }, null, 2))

    // Create bid with document URLs
    const bid = await prisma.bid.create({
      data: {
        tenderId: bidData.tenderId,
        bidderId: bidData.bidderId,
        amount: bidData.amount,
        completionTime: bidData.completionTime,
        technicalProposal: bidData.technicalProposal,
        vendorExperience: bidData.experience,
        documents: {
          create: successfulUploads.length > 0 
            ? successfulUploads.map(doc => ({
                url: doc.url,
                fileName: doc.fileName,
                fileType: doc.fileType,
                fileSize: doc.fileSize,
                userId: bidData.bidderId
              })) 
            : undefined
        }
      }
    })

    // Revalidate paths to refresh data
    revalidatePath(`/vendor/tenders/${bidData.tenderId}`)
    revalidatePath('/vendor/tenders-history')

    return bid
  } catch (error) {
    console.error('Bid submission error:', error)
    throw error instanceof Error ? error : new Error('Failed to submit bid. Please try again.')
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

    // Update the bid
    const bid = await prisma.bid.update({
      where: { id: data.bidId },
      data: {
        amount: data.amount,
        technicalProposal: data.technicalProposal,
        documents: data.documents ? {
          deleteMany: {},
          create: data.documents.map(doc => ({
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            fileType: doc.fileType,
            url: doc.url,
            user: {
              connect: { id: existingBid.bidderId }
            }
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

export async function checkVendorBidStatus(tenderId: string, vendorId: string | number) {
  try {
    // Ensure vendorId is a number
    const parsedVendorId = typeof vendorId === 'string' 
      ? parseInt(vendorId, 10) 
      : vendorId

    console.log('Checking bid status:', { 
      tenderId, 
      vendorId: parsedVendorId 
    })

    const bid = await prisma.bid.findFirst({
      where: {
        tenderId: tenderId,
        bidderId: parsedVendorId
      },
      select: {
        id: true,
        status: true,
        amount: true,
        submissionDate: true,
        documents: true,
        technicalProposal: true,
        evaluationScore: true
      }
    })

    console.log('Bid found:', bid ? 'Yes' : 'No')

    return bid ? {
      status: bid.status,
      amount: bid.amount,
      submissionDate: bid.submissionDate,
      documents: bid.documents,
      technicalProposal: bid.technicalProposal,
      evaluationScore: bid.evaluationScore,
      bidId: bid.id
    } : null
  } catch (error) {
    console.error('Failed to check vendor bid status:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    console.error('Tender ID:', tenderId)
    console.error('Vendor ID:', vendorId)
    
    // If it's a Prisma error, log additional details
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    throw new Error(`Failed to check vendor bid status: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getTenderBids(tenderId: string) {
  try {
    console.log('Fetching bids for tender:', tenderId)

    // Validate input
    if (!tenderId) {
      console.error('getTenderBids called with undefined or null tender ID')
      return []
    }

    // First, verify the tender exists
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      select: { id: true }
    })

    if (!tender) {
      console.error(`Tender not found with ID: ${tenderId}`)
      return []
    }

    // Fetch bids for the tender, sorted by submission date (most recent first)
    const bids = await prisma.bid.findMany({
      where: { 
        tenderId: tenderId,
        // Optionally filter for specific statuses if needed
        // status: { in: [BidStatus.PENDING, BidStatus.SUBMITTED] }
      },
      orderBy: { 
        submissionDate: 'desc' 
      },
      include: {
        bidder: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        }
      }
    })

    console.log(`Found ${bids.length} bids for tender ${tenderId}`)

    return bids
  } catch (error) {
    console.error('Error in getTenderBids:', error)
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    // Always return an empty array to prevent breaking the application
    return []
  }
}

export async function updateBidStatus(bidId: string, status: BidStatus) {
  try {
    const updatedBid = await prisma.bid.update({
      where: { id: bidId },
      data: { status },
      include: {
        bidder: true,
        tender: true
      }
    })

    // Optionally, update tender status based on bid status
    if (status === 'ACCEPTED') {
      await prisma.tender.update({
        where: { id: updatedBid.tenderId },
        data: { status: 'AWARDED' }
      })
    }

    revalidatePath(`/procurement-officer/tenders/${updatedBid.tenderId}`)
    return updatedBid
  } catch (error) {
    console.error('Error updating bid status:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    console.error('Bid ID:', bidId)
    console.error('Status:', status)
    throw error
  }
}

export async function getBidById(bidOrTenderId: string | undefined) {
  try {
    // Validate input
    if (!bidOrTenderId) {
      console.error('getBidById called with undefined or null ID')
      throw new Error('Invalid bid or tender ID provided')
    }

    console.log('Fetching bid details for ID:', bidOrTenderId)

    // First, try to find the bid directly by ID
    let bid = await prisma.bid.findUnique({
      where: { id: bidOrTenderId },
      include: {
        tender: true,
        bidder: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          }
        },
        documents: true
      }
    })

    // If no bid found, try to find a bid by tender ID
    if (!bid) {
      const bids = await prisma.bid.findMany({
        where: { tenderId: bidOrTenderId },
        include: {
          tender: true,
          bidder: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
            }
          },
          documents: true
        },
        orderBy: {
          submissionDate: 'desc'
        },
        take: 1  // Take the most recent bid
      })

      bid = bids[0]
    }

    console.log('Bid details fetched:', bid ? 'Found' : 'Not Found')

    if (!bid) {
      console.error(`No bid found with ID or Tender ID: ${bidOrTenderId}`)
      throw new Error(`No bid found with ID or Tender ID: ${bidOrTenderId}`)
    }

    return bid
  } catch (error) {
    console.error('Failed to fetch bid details:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    
    // If it's a Prisma error, log additional details
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    throw new Error(`Failed to fetch bid details: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function sendAwardNotification({
  bidId, 
  message, 
  recipientEmail, 
  recipientName
}: {
  bidId: string, 
  message: string, 
  recipientEmail: string, 
  recipientName: string
}) {
  try {
    // Validate inputs
    if (!bidId || !message || !recipientEmail || !recipientName) {
      throw new Error('Missing required parameters for award notification')
    }

    // First, check if bid exists
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { tender: true }
    })

    if (!bid) {
      throw new Error(`Bid with ID ${bidId} not found`)
    }

    // Prepare email data
    const emailData = {
      to: recipientEmail,
      subject: `Tender Award Notification: ${bid.tender.title}`,
      body: message,
      recipientName: recipientName
    }

    // TODO: Implement actual email sending logic
    // This could be a call to an email service like SendGrid, Mailgun, etc.
    // For now, we'll log the email details
    console.log('Sending award notification email:', emailData)

    // Update bid status to AWARDED
    await prisma.bid.update({
      where: { id: bidId },
      data: { 
        status: BidStatus.ACCEPTED,
        approvalDate: new Date()
      }
    })

    // Update tender status to AWARDED if not already
    await prisma.tender.update({
      where: { id: bid.tenderId },
      data: { 
        status: TenderStatus.AWARDED,
        awardedBidId: bidId
      }
    })

    return { 
      success: true, 
      message: 'Award notification sent successfully' 
    }
  } catch (error) {
    console.error('Failed to send award notification:', error)
    
    // If it's a Prisma error, log additional details
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    throw new Error(`Failed to send award notification: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
