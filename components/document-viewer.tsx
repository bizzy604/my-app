'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { FileIcon, ExternalLinkIcon } from 'lucide-react'

interface Document {
  id: string
  fileName: string
  fileType: string
  url: string
}

interface DocumentViewerProps {
  documents: Document[]
}

export function DocumentViewer({ documents }: DocumentViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)

  if (!documents?.length) {
    return (
      <div className="text-center p-4 text-gray-500">
        No documents available
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <Card
            key={doc.id}
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setSelectedDoc(doc)}
          >
            <div className="flex items-center space-x-3">
              <FileIcon className="h-8 w-8 text-blue-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {doc.fileName}
                </p>
                <p className="text-sm text-gray-500">
                  {doc.fileType}
                </p>
              </div>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <ExternalLinkIcon className="h-5 w-5" />
              </a>
            </div>
          </Card>
        ))}
      </div>

      {selectedDoc && (
        <div className="mt-6">
          <Card className="p-4">
            <div className="aspect-video">
              {selectedDoc.fileType.includes('pdf') ? (
                <iframe
                  src={selectedDoc.url}
                  className="w-full h-full"
                  title={selectedDoc.fileName}
                />
              ) : selectedDoc.fileType.includes('image') ? (
                <img
                  src={selectedDoc.url}
                  alt={selectedDoc.fileName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <a
                    href={selectedDoc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 flex items-center"
                  >
                    <FileIcon className="h-8 w-8 mr-2" />
                    Open {selectedDoc.fileName}
                  </a>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}