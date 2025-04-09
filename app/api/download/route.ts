import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { prisma } from '@/lib/prisma'

// Create S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

export async function GET(
  request: NextRequest
) {
  try {
    // Get the document key from the URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/download/')
    if (pathParts.length < 2) {
      return NextResponse.json(
        { error: 'Invalid document path' },
        { status: 400 }
      )
    }
    
    const keyPart = pathParts[1]
    
    // Find the document in the database to verify it exists
    const document = await prisma.document.findFirst({
      where: { s3Key: { contains: keyPart } }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Generate a pre-signed URL for the S3 object (with 1 hour expiry)
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || 'default-bucket',
      Key: document.s3Key || ''
    })

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    // Redirect to the pre-signed URL
    return NextResponse.redirect(presignedUrl)
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    )
  }
}
