import { getPermanentDocumentUrl } from '@/lib/document-url';

describe('document-url utility', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    // Setup test environment variables
    process.env = { 
      ...originalEnv,
      AWS_S3_BUCKET_NAME: 'test-bucket',
      AWS_REGION: 'test-region' 
    };
  });
  
  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });
  
  describe('getPermanentDocumentUrl', () => {
    it('generates a permanent URL with the correct structure', () => {
      const s3Key = 'documents/test-file.pdf';
      const url = getPermanentDocumentUrl(s3Key);
      
      expect(url).toBe('https://test-bucket.s3.test-region.amazonaws.com/documents/test-file.pdf');
    });
    
    it('handles different S3 keys correctly', () => {
      const s3Keys = [
        'images/profile.jpg',
        'docs/contract.pdf',
        'bids/technical-proposal.docx'
      ];
      
      s3Keys.forEach(key => {
        const url = getPermanentDocumentUrl(key);
        expect(url).toBe(`https://test-bucket.s3.test-region.amazonaws.com/${key}`);
      });
    });
    
    it('uses us-east-1 as default region when AWS_REGION is not set', () => {
      // Remove region from environment
      const { AWS_REGION, ...envWithoutRegion } = process.env;
      process.env = envWithoutRegion;
      
      const s3Key = 'test-document.pdf';
      const url = getPermanentDocumentUrl(s3Key);
      
      expect(url).toBe('https://test-bucket.s3.us-east-1.amazonaws.com/test-document.pdf');
    });
  });
});
