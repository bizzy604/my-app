'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma';
import { uploadDocument as s3UploadDocument } from '@/lib/s3-upload';

export async function uploadDocument(formData: FormData) {
  // Extract data from FormData
  const file = formData.get('file') as File
  const tenderId = formData.get('tenderId') as string
  const userId = formData.get('userId') as string
  
  if (!file || !tenderId || !userId) {
    throw new Error('Missing required upload parameters')
  }
  
  // Use the existing S3 upload functionality
  const document = await s3UploadDocument(file, {
    userId,
    tenderId
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