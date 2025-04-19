'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma';
import { uploadToS3 } from '@/lib/s3-upload';

export async function uploadDocument(formData: FormData) {
  // Extract data from FormData
  const file = formData.get('file') as File
  const tenderId = formData.get('tenderId') as string
  const userId = formData.get('userId') as string
  
  if (!file || !tenderId || !userId) {
    throw new Error('Missing required upload parameters')
  }
  
  // Upload file to S3 using our optimized utility
  const s3Result = await uploadToS3(file, {
    userId,
    tenderId
  })
  
  // Store document reference in database with permanent URL
  const document = await prisma.document.create({
    data: {
      fileName: file.name,
      url: s3Result.url,
      s3Key: s3Result.key,
      fileSize: file.size,
      fileType: file.type,
      userId: typeof userId === 'string' ? parseInt(userId, 10) : userId,
      tenderId,
      uploadDate: new Date()
    }
  })
  
  // Revalidate paths for both procurement officer and vendor views
  revalidatePath(`/vendor/tenders/${tenderId}`)
  revalidatePath(`/procurement-officer/tenders/${tenderId}`)
  
  return document
}

export async function getDocumentsByTender(tenderId: string) {
  return prisma.document.findMany({
    where: { tenderId },
  })
}

export async function deleteDocument(id: string, tenderId?: string) {
  const document = await prisma.document.delete({
    where: { id },
  })
  
  // If tenderId is provided, use it (for new tenders), otherwise use document.tenderId
  const tenderIdToRevalidate = tenderId || document.tenderId
  revalidatePath(`/procurement-officer/tenders/${tenderIdToRevalidate}`)
  revalidatePath(`/vendor/tenders/${tenderIdToRevalidate}`)
  
  return document
}