'use client'

import { useState } from 'react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  FileText, 
  BookOpen, 
  Video, 
  HelpCircle,
  Download,
  ExternalLink 
} from 'lucide-react'

interface Resource {
  id: string
  title: string
  description: string
  type: 'document' | 'guide' | 'video' | 'faq'
  url: string
  downloadable?: boolean
}

const resources: Resource[] = [
  {
    id: '1',
    title: 'Tender Submission Guidelines',
    description: 'Step-by-step guide on how to submit a winning tender',
    type: 'document',
    url: '/documents/tender-guidelines.pdf',
    downloadable: true
  },
  {
    id: '2',
    title: 'Bid Preparation Best Practices',
    description: 'Learn how to prepare competitive bids',
    type: 'guide',
    url: '/guides/bid-preparation.pdf',
    downloadable: true
  },
  {
    id: '3',
    title: 'Video Tutorial: Using the Platform',
    description: 'A comprehensive guide to using the Innobid platform',
    type: 'video',
    url: 'https://youtube.com/watch?v=example'
  },
  {
    id: '4',
    title: 'Frequently Asked Questions',
    description: 'Common questions about the tender process',
    type: 'faq',
    url: '/help/faq'
  }
]

export default function ResourceCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDownload = async (resource: Resource) => {
    setIsLoading(true)
    try {
      // Implement download logic here
      const response = await fetch(resource.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = resource.title
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getIcon = (type: Resource['type']) => {
    switch (type) {
      case 'document': return FileText
      case 'guide': return BookOpen
      case 'video': return Video
      case 'faq': return HelpCircle
      default: return FileText
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-[#4B0082]">Resource Center</h1>
            <p className="text-sm md:text-base text-gray-600">Access guides, tutorials, and helpful resources</p>
          </div>

          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => {
            const Icon = getIcon(resource.type)
            
            return (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="h-5 w-5 text-[#4B0082]" />
                    {resource.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{resource.description}</p>
                  <Button
                    variant={resource.downloadable ? "default" : "outline"}
                    className="w-full"
                    onClick={() => resource.downloadable ? handleDownload(resource) : window.open(resource.url)}
                    disabled={isLoading}
                  >
                    {resource.downloadable ? (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}

