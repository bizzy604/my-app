import { prisma } from '@/lib/prisma'
import { uploadToS3 } from '@/lib/s3-upload'

export async function uploadDocument(
  file: File, 
  context: {
    userId: number, 
    bidId?: string, 
    tenderId?: string | null
  }
) {
  // Validate input parameters
  if (!context.userId) {
    throw new Error('User ID is required for document upload')
  }

  // Validate file
  if (!file || file.size === 0) {
    throw new Error('Invalid file: File is empty or undefined')
  }

  try {
    // Upload file to S3
    const s3Upload = await uploadToS3(file, {
      userId: context.userId,
      bidId: context.bidId,
      tenderId: context.tenderId || undefined
    })
    
    // Prepare document data with conditional fields
    const documentData: any = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      url: s3Upload.url,
      s3Key: s3Upload.key,
      userId: context.userId
    }

    // Always add bidId if provided
    if (context.bidId) {
      documentData.bidId = context.bidId
    }

    // Conditionally add tenderId
    if (context.tenderId) {
      documentData.tenderId = context.tenderId
    }
    
    // Create document record in database
    const document = await prisma.document.create({
      data: documentData
    })
    
    return document
  } catch (error) {
    console.error('Document upload error:', error)
    
    // Log detailed error information
    console.error('Upload Context:', {
      userId: context.userId,
      bidId: context.bidId,
      tenderId: context.tenderId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

    // Rethrow or throw a more specific error
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('Failed to upload document: Unknown error occurred')
    }
  }
}
