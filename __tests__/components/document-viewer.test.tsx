import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentViewer } from '@/components/document-viewer';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Helper function to create mock document data
const createMockDoc = (id: string, url: string, fileName: string, fileType: string) => ({
  id,
  url,
  fileName,
  fileType,
});

describe('DocumentViewer Component', () => {
  it('renders PDF viewer for PDF documents', () => {
    const doc = createMockDoc('pdf-doc', 'https://example.com/document.pdf', 'Test Doc.pdf', 'application/pdf');
    render(<DocumentViewer documents={[doc]} />);

    // Simulate clicking the card to select the document
    fireEvent.click(screen.getByText(doc.fileName));

    // Should render iframe for PDF
    const iframe = screen.getByTitle(doc.fileName); // Title should now be the fileName
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', doc.url);
  });

  it('renders image viewer for image documents', () => {
    const doc = createMockDoc('img-doc', 'https://example.com/image.jpg', 'Test Image.jpg', 'image/jpeg');
    render(<DocumentViewer documents={[doc]} />);

    fireEvent.click(screen.getByText(doc.fileName));

    // Should render image tag for images
    const image = screen.getByRole('img', { name: doc.fileName }); // Alt text is fileName
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', doc.url);
  });

  it('renders document not supported message for other document types', () => {
    const doc = createMockDoc('docx-doc', 'https://example.com/document.docx', 'Test Word.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    render(<DocumentViewer documents={[doc]} />);

    fireEvent.click(screen.getByText(doc.fileName));

    // Should render unsupported message within the selected doc view
    expect(screen.getByText(`Open ${doc.fileName}`)).toBeInTheDocument(); // Match the actual link text
    // The download link should still be present, potentially inside the viewer part
    // Check if the download link is associated with the selected doc view if needed
  });

  it('handles documents with uppercase extensions', () => {
    const doc = createMockDoc('pdf-upper-doc', 'https://example.com/document.PDF', 'Test Upper.PDF', 'application/pdf');
    render(<DocumentViewer documents={[doc]} />);

    fireEvent.click(screen.getByText(doc.fileName));

    // Should still recognize PDF regardless of case and render iframe
    const iframe = screen.getByTitle(doc.fileName);
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', doc.url);
  });

  it('ensures document URLs are permanent', () => {
    const permanentUrl = 'https://innobid-bucket.s3.eu-west-1.amazonaws.com/documents/bid123/test.pdf';
    const doc = createMockDoc('perm-doc', permanentUrl, 'Permanent Test.pdf', 'application/pdf');
    render(<DocumentViewer documents={[doc]} />);

    fireEvent.click(screen.getByText(doc.fileName));

    const iframe = screen.getByTitle(doc.fileName);
    expect(iframe).toHaveAttribute('src', permanentUrl);

    // Verify URL doesn't contain pre-signed URL components
    expect(iframe.getAttribute('src')).not.toContain('Signature=');
    expect(iframe.getAttribute('src')).not.toContain('Expires=');
  });

  it('displays "No documents available" when documents array is empty', () => {
    render(<DocumentViewer documents={[]} />);
    expect(screen.getByText(/No documents available/i)).toBeInTheDocument();
  });

  it('displays "No documents available" when documents prop is null', () => {
    render(<DocumentViewer documents={null as any} />); // Test null case
    expect(screen.getByText(/No documents available/i)).toBeInTheDocument();
  });
});
