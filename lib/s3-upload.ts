import { S3Client, GetObjectCommand, PutObjectCommandInput, ObjectCannedACL } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 as uuidv4 } from 'uuid'

// Validate environment variables
function validateEnvVars() {
  const requiredVars = [
    'AWS_REGION', 
    'AWS_ACCESS_KEY_ID', 
    'AWS_SECRET_ACCESS_KEY', 
    'AWS_S3_BUCKET_NAME'
  ]

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`)
    }
  }
}

// Configure S3 client
function createS3Client() {
  try {
    validateEnvVars()

    return new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    })
  } catch (error) {
    console.error('S3 Client Configuration Error:', error)
    throw error
  }
}

const s3Client = createS3Client()

// S3 upload function
export async function uploadToS3(
  file: File, 
  context: {
    userId: number, 
    bidId?: string, 
    tenderId?: string
  }
) {
  try {
    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'unknown'
    const uniqueFileName = `tender-docs/${context.userId}/${context.tenderId || 'general'}/${uuidv4()}.${fileExtension}`

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create upload parameters
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: uniqueFileName,
      Body: buffer,
      ContentType: file.type,
      ACL: ObjectCannedACL.private, // or ObjectCannedACL.publicRead depending on your requirements
      Metadata: {
        originalFileName: file.name,
        uploadedBy: context.userId.toString(),
        ...(context.bidId && { bidId: context.bidId }),
        ...(context.tenderId && { tenderId: context.tenderId })
      }
    }

    // Perform the upload
    const upload = new Upload({
      client: s3Client,
      params: uploadParams
    })

    // Track upload progress (optional)
    upload.on('httpUploadProgress', (progress) => {
      console.log(`Upload progress: ${progress.loaded} / ${progress.total}`)
    })

    // Wait for upload to complete
    const result = await upload.done()

    // Return the S3 object URL or key
    return {
      url: `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`,
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
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: s3Key
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn })
    return url
  } catch (error) {
    console.error('Pre-signed URL generation error:', error)
    throw new Error('Failed to generate pre-signed URL')
  }
}
