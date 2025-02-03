import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadDocument } from '@/lib/document-upload'
import { parseMultipartFormData } from '@/lib/multipart-parser'

export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
  },
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
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

    // Upload document using our document upload utility
    const document = await uploadDocument(file, {
      userId: parseInt(session.user.id),
      tenderId,
      bidId
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