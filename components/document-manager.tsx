'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Trash2, Upload } from 'lucide-react'
import { uploadDocument, getDocumentsByTender, deleteDocument } from "@/app/actions/document-action"

export function DocumentManager({ tenderId, userId }: { tenderId: string, userId: string }) {
  const [isUploading, setIsUploading] = useState(false)
  const [documents, setDocuments] = useState([])
  const router = useRouter()

  useEffect(() => {
    getDocumentsByTender(tenderId).then(setDocuments)
  }, [tenderId])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const newDocument = await uploadDocument(file, tenderId, userId)
      setDocuments([...documents, newDocument])
    } catch (error) {
      console.error('Error uploading document:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(documentId, tenderId)
        setDocuments(documents.filter(doc => doc.id !== documentId))
      } catch (error) {
        console.error('Error deleting document:', error)
        // You might want to show an error message to the user here
      }
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
            className="sr-only"
          />
          <Label
            htmlFor="document-upload"
            className="w-full sm:w-auto cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#4B0082] shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 flex items-center justify-center"
          >
            <Upload className="h-4 w-4 inline-block mr-2" />
            {isUploading ? 'Uploading...' : 'Choose file'}
          </Label>
        </div>
      </div>

      <div className="overflow-x-auto">
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
                  {new Date(doc.uploadDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

