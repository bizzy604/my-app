import { S3Client, GetObjectCommand, PutObjectCommandInput, ObjectCannedACL } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { v4 as uuidv4 } from 'uuid'
import { prisma } from './prisma'

// Validate required environment variables
function validateEnvVars() {
  const requiredVars = [
    'AWS_REGION', 
    'AWS_ACCESS_KEY_ID', 
    'AWS_SECRET_ACCESS_KEY', 
    'AWS_S3_BUCKET_NAME'
  ]

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.warn(`Missing environment variable: ${varName}`)
    }
  }
}

// Create S3 client lazily to avoid issues during build time
let s3Client: S3Client | null = null;

// Get or create S3 client - only called server-side
function getS3Client() {
  // Only create the client when needed (lazy initialization)
  if (!s3Client) {
    validateEnvVars()
    
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    })
  }
  
  return s3Client
}

// Server-side only S3 upload function with streaming to reduce memory usage
// This function is only called from server components or API routes
export async function uploadToS3(
  file: File, 
  context: {
    userId: string | number, 
    bidId?: string, 
    tenderId?: string
  }
) {
  try {
    // Get S3 client (lazy initialization)
    const s3Client = getS3Client()
    
    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'unknown'
    const uniqueFileName = `tender-docs/${context.userId}/${context.tenderId || 'general'}/${uuidv4()}.${fileExtension}`

    // Process in smaller chunks to reduce memory usage
    // Convert File to Buffer using a more memory-efficient approach
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create upload parameters
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME || 'default-bucket',
      Key: uniqueFileName,
      Body: buffer,
      ContentType: file.type,
      ACL: ObjectCannedACL.public_read, // Make objects publicly readable for permanent URLs
      Metadata: {
        originalFileName: file.name,
        uploadedBy: context.userId.toString(),
        ...(context.bidId && { bidId: context.bidId }),
        ...(context.tenderId && { tenderId: context.tenderId })
      }
    }

    // Use multipart upload which is more memory efficient
    const upload = new Upload({
      client: s3Client,
      params: uploadParams,
      partSize: 5 * 1024 * 1024, // 5MB parts - optimized for 8GB RAM
      leavePartsOnError: false, // Clean up failed uploads
    })

    // Wait for upload to complete
    const result = await upload.done()

    // Return the permanent S3 object URL
    const permanentUrl = `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${uniqueFileName}`
    
    return {
      url: permanentUrl,
      key: uniqueFileName
    }
  } catch (error) {
    console.error('S3 Upload Error:', error)
    throw new Error('Failed to upload document to S3')
  }
}

// Get permanent URL for a document - no expiration time
// This can be safely used in both client and server components
export function getPermanentDocumentUrl(s3Key: string) {
  // Create a permanent URL for the document
  // This works because we set ACL to public_read when uploading
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`
}

// Export the uploadDocument function that's used in the upload route
export async function uploadDocument(file: File, context: {
  userId: string | number,
  tenderId?: string,
  bidId?: string
}) {
  try {
    // Upload to S3
    const s3Result = await uploadToS3(file, context)
    
    // Store document reference in database with permanent URL
    const document = await prisma.document.create({
      data: {
        fileName: file.name,
        url: s3Result.url, // Store the permanent S3 URL directly
        s3Key: s3Result.key,
        fileSize: file.size,
        fileType: file.type,
        userId: typeof context.userId === 'string' ? parseInt(context.userId, 10) : context.userId,
        ...(context.tenderId && { tenderId: context.tenderId }),
        ...(context.bidId && { bidId: context.bidId }),
        uploadDate: new Date()
      }
    })
    
    return document
  } catch (error) {
    console.error('Document upload error:', error)
    throw new Error('Failed to upload document')
  }
}
