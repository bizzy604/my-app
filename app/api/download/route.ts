import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPermanentDocumentUrl } from '@/lib/document-url'

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

    // Generate a permanent URL for the S3 object
    const permanentUrl = getPermanentDocumentUrl(document.s3Key || '')

    // Redirect to the permanent URL
    return NextResponse.redirect(permanentUrl)
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    )
  }
}
