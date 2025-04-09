'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Trash2, Download } from 'lucide-react'
import { uploadDocument, getDocumentsByTender, deleteDocument } from "@/app/actions/document-action"
import { generatePresignedUrl } from "@/lib/s3-upload"
import { useToast } from "@/hooks/use-toast"

type DocumentType = {
  id: string
  fileName: string  // Changed from name to fileName to match Prisma schema
  s3Key: string
  fileSize: number  // Changed from size to fileSize to match Prisma schema
  fileType: string  // Changed from type to fileType to match Prisma schema
  uploadDate: Date | string
  url: string
}

export function DocumentManager({ tenderId, userId }: { tenderId: string, userId: string }) {
  const [isUploading, setIsUploading] = useState(false)
  const [documents, setDocuments] = useState<DocumentType[]>([])
  const [isGeneratingUrl, setIsGeneratingUrl] = useState<{[key: string]: boolean}>({})
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (tenderId !== "new") {
      getDocumentsByTender(tenderId).then(docs => {
        // Convert Prisma document type to our DocumentType
        setDocuments(docs.map(doc => ({
          id: doc.id,
          fileName: doc.fileName,
          s3Key: doc.s3Key || '',  // Handle potentially null s3Key
          fileSize: doc.fileSize,
          fileType: doc.fileType,
          uploadDate: doc.uploadDate,
          url: doc.url
        })))
      })
    }
  }, [tenderId])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Create FormData to handle file upload (this is serializable for server actions)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tenderId', tenderId)
      formData.append('userId', userId)
      
      // Call the server action with FormData
      const newDocument = await uploadDocument(formData)
      
      // Convert the returned document to match our DocumentType interface
      const docToAdd: DocumentType = {
        id: newDocument.id,
        fileName: newDocument.fileName,
        s3Key: newDocument.s3Key || '',  // Handle potentially null s3Key
        fileSize: newDocument.fileSize,
        fileType: newDocument.fileType,
        uploadDate: newDocument.uploadDate,
        url: newDocument.url
      }
      
      setDocuments(prev => [...prev, docToAdd])
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })
      // Reset file input
      event.target.value = ''
    } catch (error) {
      console.error('Error uploading document:', error)
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(documentId, tenderId)
        setDocuments(documents.filter(doc => doc.id !== documentId))
        toast({
          title: "Success",
          description: "Document deleted successfully",
        })
      } catch (error) {
        console.error('Error deleting document:', error)
        toast({
          title: "Error",
          description: "Failed to delete document. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  const handleDownload = async (document: DocumentType) => {
    try {
      setIsGeneratingUrl({...isGeneratingUrl, [document.id]: true})
      // Generate pre-signed URL for secure download
      const presignedUrl = await generatePresignedUrl(document.s3Key)
      
      // Create an invisible anchor and trigger download
      // Use window.document instead of document (which might refer to the DocumentType interface)
      const link = window.document.createElement('a')
      link.href = presignedUrl
      link.download = document.fileName  // Changed from name to fileName
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
      
      toast({
        title: "Success",
        description: "Download started",
      })
    } catch (error) {
      console.error('Error downloading document:', error)
      toast({
        title: "Error",
        description: "Failed to download document. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingUrl({...isGeneratingUrl, [document.id]: false})
    }
  }

  return (
    <div className="space-y-4">
      <div className="w-full">
        <Label htmlFor="document-upload" className="block text-sm font-medium text-gray-700 mb-2">
          Upload Document
        </Label>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Input
            id="document-upload"
            type="file"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-[#4B0082] file:text-white
              hover:file:bg-purple-700"
          />
          {isUploading && (
            <div className="text-sm text-purple-600 animate-pulse">Uploading...</div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        {documents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">File Name</TableHead>
                <TableHead className="hidden sm:table-cell">Size</TableHead>
                <TableHead className="hidden sm:table-cell">Upload Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{doc.fileName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {(doc.fileSize / 1024).toFixed(2)} KB
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {doc.uploadDate instanceof Date
                      ? doc.uploadDate.toLocaleDateString()
                      : new Date(doc.uploadDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        disabled={isGeneratingUrl[doc.id]}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No documents uploaded yet
          </div>
        )}
      </div>
    </div>
  )
}
