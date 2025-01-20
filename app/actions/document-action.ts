'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma';
import { Document } from '@prisma/client'

export async function uploadDocument(data: Omit<Document, 'id' | 'uploadDate'>) {
  const document = await prisma.document.create({
    data: {
      ...data,
      uploadDate: new Date(),
    },
  })
  revalidatePath(`/vendor/tenders/${data.tenderId}`)
  return document
}

export async function getDocumentsByTender(tenderId: string) {
  return prisma.document.findMany({
    where: { tenderId },
  })
}

export async function deleteDocument(id: string) {
  const document = await prisma.document.delete({
    where: { id },
  })
  revalidatePath(`/procurement-officer/tenders/${document.tenderId}`)
}