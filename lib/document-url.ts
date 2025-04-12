// This file provides URL utilities without the 'use server' directive
// This allows us to have regular non-async functions that can be used anywhere

/**
 * Generate a permanent URL for a document (no expiration)
 * This is a regular function, not a server action
 * @param s3Key The S3 key of the document
 * @returns A permanent URL that doesn't expire
 */
export function getPermanentDocumentUrl(s3Key: string): string {
  // This generates a permanent URL that doesn't expire
  // Important: This works because we set ACL to public-read when uploading
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
}
