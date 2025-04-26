import { getPermanentDocumentUrl } from '@/lib/s3-upload';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn().mockResolvedValue({})
      };
    }),
    PutObjectCommand: jest.fn()
  };
});

describe('S3 Document Upload Functions', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    // Setup environment variables for tests
    process.env = {
      ...originalEnv,
      AWS_S3_BUCKET_NAME: 'test-innobid-bucket',
      AWS_REGION: 'eu-west-1'
    };
  });
  
  afterEach(() => {
    process.env = originalEnv;
  });
  
  describe('getPermanentDocumentUrl', () => {
    it('generates permanent URLs with the correct format', async () => {
      const key = 'bid-docs/123/456/test-document.pdf';
      const url = await getPermanentDocumentUrl(key);
      
      // Verify the URL format matches the expected permanent URL pattern
      expect(url).toBe('https://test-innobid-bucket.s3.eu-west-1.amazonaws.com/bid-docs/123/456/test-document.pdf');
    });
    
    it('uses the correct bucket name from environment', async () => {
      // Override bucket name for this test
      process.env.AWS_S3_BUCKET_NAME = 'custom-bucket';
      
      const key = 'test.pdf';
      const url = await getPermanentDocumentUrl(key);
      
      expect(url).toContain('custom-bucket');
    });
    
    it('defaults to us-east-1 if region is not specified', async () => {
      // Remove region from environment
      const { AWS_REGION, ...envWithoutRegion } = process.env;
      process.env = envWithoutRegion;
      
      const key = 'test.pdf';
      const url = await getPermanentDocumentUrl(key);
      
      expect(url).toContain('us-east-1');
    });
    
    it('works with different document path formats', async () => {
      const testCases = [
        {
          key: 'bid-docs/user123/bid456/document.pdf',
          expected: 'https://test-innobid-bucket.s3.eu-west-1.amazonaws.com/bid-docs/user123/bid456/document.pdf'
        },
        {
          key: 'tender-docs/proc123/tender789/specs.docx',
          expected: 'https://test-innobid-bucket.s3.eu-west-1.amazonaws.com/tender-docs/proc123/tender789/specs.docx'
        },
        {
          key: 'user-docs/vendor456/profile-image.jpg',
          expected: 'https://test-innobid-bucket.s3.eu-west-1.amazonaws.com/user-docs/vendor456/profile-image.jpg'
        }
      ];
      
      for (const { key, expected } of testCases) {
        const url = await getPermanentDocumentUrl(key);
        expect(url).toBe(expected);
      }
    });
  });
});
