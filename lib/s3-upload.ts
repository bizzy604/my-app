'use server';

import { v4 as uuidv4 } from 'uuid'
import { prisma } from './prisma'
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// Define the result type without AWS SDK imports
type S3UploadResult = {
  url: string;
  key: string;
}

// Server-side function to validate environment variables
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

// Server-side S3 upload function using AWS SDK
export async function uploadToS3(
  file: File, 
  context: {
    userId: string | number, 
    bidId?: string, 
    tenderId?: string
  }
): Promise<S3UploadResult> {
  try {
    validateEnvVars();
    
    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const uniqueFileName = context.bidId 
      ? `bid-docs/${context.userId}/${context.bidId}/${timestamp}-${uuidv4()}.${fileExtension}`
      : context.tenderId 
        ? `tender-docs/${context.userId}/${context.tenderId}/${timestamp}-${uuidv4()}.${fileExtension}`
        : `user-docs/${context.userId}/${timestamp}-${uuidv4()}.${fileExtension}`;
    
    // Convert File to Buffer for S3 upload
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Upload file to S3
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: file.type || 'application/octet-stream',
      ACL: 'public-read' // This is critical for permanent URLs to work
    };
    
    await s3Client.send(new PutObjectCommand(uploadParams));
    
    // Generate permanent URL
    const permanentUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${uniqueFileName}`;
  
    
    return {
      url: permanentUrl,
      key: uniqueFileName
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Failed to upload document to S3');
  }
}

// Get permanent URL for a document - no expiration time
// This can be safely used in both client and server components
// This is consistent with the document-url.ts implementation
export async function getPermanentDocumentUrl(s3Key: string) {
  // Create a permanent URL for the document
  // This provides a permanent URL with no expiration time as required
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
}

// Export the uploadDocument function that's used in the upload route
export async function uploadDocument(file: File, context: {
  userId: string | number,
  tenderId?: string,
  bidId?: string
}) {
  try {
    // Upload to S3 (using our temporary implementation)
    const s3Result = await uploadToS3(file, context);
    
    // Store document reference in database with permanent URL
    // This is critical: we store permanent URLs that don't expire
    // This ensures documents can be referenced in the future
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
    });
    
    return document;
  } catch (error) {
    console.error('Document upload error:', error);
    throw new Error('Failed to upload document');
  }
}
