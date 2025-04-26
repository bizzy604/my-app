export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { getServerAuthSession } from '@/lib/auth'
import { uploadToS3 } from '@/lib/s3-upload'
import { parseMultipartFormData } from '@/lib/multipart-parser'
import { prisma } from '@/lib/prisma'

export const bodyParser = false

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerAuthSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse the multipart form data with progress tracking
    const { fields, files } = await parseMultipartFormData(request, (progress) => {
      // Send upload progress through response headers
      // This will be picked up by the client
      return new Response(null, {
        headers: {
          'Upload-Progress': progress.toString(),
        },
      })
    })

    const file = files.get('file') as File
    const tenderId = fields.get('tenderId') as string
    const bidId = fields.get('bidId') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and DOC files are allowed' },
        { status: 400 }
      )
    }

    // Upload file to S3 using our optimized utility
    const s3Result = await uploadToS3(file, {
      userId: session.user.id,
      tenderId,
      bidId
    })
    
    // Store document reference in database
    const document = await prisma.document.create({
      data: {
        fileName: file.name,
        url: s3Result.url,
        s3Key: s3Result.key,
        fileSize: file.size,
        fileType: file.type,
        userId: session.user.id,
        tenderId,
        bidId,
        uploadDate: new Date()
      }
    })



    return NextResponse.json({ 
      url: document.url,
      documentId: document.id,
      success: true
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
} 
