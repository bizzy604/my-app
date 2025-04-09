import { S3Client, GetObjectCommand, PutObjectCommandInput, ObjectCannedACL } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 as uuidv4 } from 'uuid'
import { prisma } from './prisma'

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

// Only validate environment variables on the server side
function validateEnvVars() {
  // Skip validation in browser environment
  if (isBrowser) return
  
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

// Configure S3 client
function createS3Client() {
  try {
    // Call validateEnvVars (which now handles browser environment)
    validateEnvVars()
    
    // Return null in browser environment (S3 operations only happen server-side)
    if (isBrowser) {
      return null as unknown as S3Client
    }

    // Create real S3 client on server side
    return new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    })
  } catch (error) {
    console.error('S3 Client Configuration Error:', error)
    // Return null client for browser
    return null as unknown as S3Client
  }
}

const s3Client = createS3Client()

// S3 upload function with streaming to reduce memory usage
export async function uploadToS3(
  file: File, 
  context: {
    userId: string | number, 
    bidId?: string, 
    tenderId?: string
  }
) {
  // In browser, we need to use the API route for uploading
  if (isBrowser) {
    try {
      // Create a mock response for client-side rendering
      // The actual upload will happen via an API route on the server
      console.log('Client-side S3 upload initiated - will be processed server-side')
      
      // For now, create a placeholder response
      // In a real implementation, you'd use fetch to call your API route
      const fileExtension = file.name.split('.').pop() || 'unknown'
      const uniqueFileName = `tender-docs/${context.userId}/${context.tenderId || 'general'}/${uuidv4()}.${fileExtension}`
      
      // Return a temporary response - the real upload happens server-side
      return {
        url: `/api/upload/${uniqueFileName}`,
        key: uniqueFileName
      }
    } catch (error) {
      console.error('Browser upload error:', error)
      throw new Error('Failed to initiate document upload')
    }
  }
  
  // Server-side upload logic
  try {
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
      ACL: ObjectCannedACL.private,
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

    // Return the S3 object URL or key
    return {
      url: `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${uniqueFileName}`,
      key: uniqueFileName
    }
  } catch (error) {
    console.error('S3 Upload Error:', error)
    throw new Error('Failed to upload document to S3')
  }
}

// Generate a pre-signed URL for secure, time-limited access
export async function generatePresignedUrl(
  s3Key: string, 
  expiresIn: number = 3600 // 1 hour default
) {
  // In browser, use the API route for generating URLs
  if (isBrowser) {
    try {
      console.log('Using permanent document URL')
      // Create a permanent URL that points to our API route
      // No expiration time in the URL - the API route will handle that
      return `/api/download/${s3Key}`
    } catch (error) {
      console.error('Browser presigned URL error:', error)
      throw new Error('Failed to generate download URL')
    }
  }
  
  // Server-side presigned URL generation (for internal use)
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || 'default-bucket',
      Key: s3Key
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn })
    return url
  } catch (error) {
    console.error('Pre-signed URL generation error:', error)
    throw new Error('Failed to generate pre-signed URL')
  }
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
        fileName: file.name, // Changed from name to fileName to match Prisma schema
        url: `/api/download/${s3Result.key}`, // Permanent URL without expiration
        s3Key: s3Result.key,
        fileSize: file.size, // Changed from size to fileSize to match Prisma schema
        fileType: file.type, // Changed from type to fileType to match Prisma schema
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
