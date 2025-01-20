'use client'

import { useState, useEffect } from 'react'
import { getReports, updateReportStatus } from "@/app/actions/report-actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Search 
} from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ProcurementLayout } from "@/components/procurement-layout"
import { ReportStatus } from '@prisma/client'

interface IrregularityReport {
  id: string
  tenderId: string
  tenderTitle: string
  type: string
  description: string
  reporterName?: string
  contactInfo?: string
  status: ReportStatus
  createdAt: Date
}

export default function ProcurementReportsPage() {
  const [reports, setReports] = useState<IrregularityReport[]>([])
  const [filteredReports, setFilteredReports] = useState<IrregularityReport[]>([])
  const [selectedReport, setSelectedReport] = useState<IrregularityReport | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<ReportStatus | 'ALL'>('ALL')

  // Fetch reports on component mount
  useEffect(() => {
    fetchReports()
  }, [])

  // Fetch reports from the server
  const fetchReports = async () => {
    try {
      setIsLoading(true)
      const fetchedReports = await getReports()
      setReports(fetchedReports)
      setFilteredReports(fetchedReports)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter reports based on search and status
  useEffect(() => {
    let result = reports

    // Filter by status
    if (filter !== 'ALL') {
      result = result.filter(report => report.status === filter)
    }

    // Filter by search term
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase()
      result = result.filter(report => 
        report.tenderTitle.toLowerCase().includes(lowercasedTerm) ||
        report.type.toLowerCase().includes(lowercasedTerm) ||
        report.description.toLowerCase().includes(lowercasedTerm)
      )
    }

    setFilteredReports(result)
  }, [searchTerm, filter, reports])

  // Update report status
  const handleUpdateStatus = async (reportId: string, newStatus: ReportStatus) => {
    try {
      await updateReportStatus(reportId, newStatus)
      fetchReports() // Refresh the list
      setSelectedReport(null)
    } catch (error) {
      console.error('Failed to update report status:', error)
    }
  }

  // Render status badge
  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return <Badge variant="outline" className="flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Pending</Badge>
      case ReportStatus.INVESTIGATING:
        return <Badge variant="secondary" className="flex items-center gap-1"><Search className="h-4 w-4" /> Under Investigation</Badge>
      case ReportStatus.RESOLVED:
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Resolved</Badge>
      case ReportStatus.DISMISSED:
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-4 w-4" /> Dismissed</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <ProcurementLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#4B0082] flex items-center gap-3">
            <AlertTriangle className="h-7 w-7" /> Irregularity Reports
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input 
                placeholder="Search reports..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as ReportStatus | 'ALL')}
              aria-label="Filter reports by status"
              className="border rounded px-2 py-2"
            >
              <option value="ALL">All Reports</option>
              <option value={ReportStatus.PENDING}>Pending</option>
              <option value={ReportStatus.INVESTIGATING}>Under Investigation</option>
              <option value={ReportStatus.RESOLVED}>Resolved</option>
              <option value={ReportStatus.DISMISSED}>Dismissed</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reports found
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredReports.map(report => (
              <div 
                key={report.id} 
                className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-[#4B0082] flex items-center gap-2">
                      <FileText className="h-5 w-5" /> {report.tenderTitle}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">{report.type}</p>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
                <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                  {report.description}
                </p>
                <div className="mt-4 text-xs text-gray-500">
                  Reported on: {new Date(report.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Report Details Dialog */}
        {selectedReport && (
          <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-[#4B0082]" />
                  Report Details
                </DialogTitle>
                <DialogDescription>
                  Detailed information about the reported irregularity
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="font-semibold">Tender Title:</label>
                  <p>{selectedReport.tenderTitle}</p>
                </div>
                <div>
                  <label className="font-semibold">Irregularity Type:</label>
                  <p>{selectedReport.type}</p>
                </div>
                <div>
                  <label className="font-semibold">Description:</label>
                  <p>{selectedReport.description}</p>
                </div>
                {selectedReport.reporterName && (
                  <div>
                    <label className="font-semibold">Reporter Name:</label>
                    <p>{selectedReport.reporterName}</p>
                  </div>
                )}
                {selectedReport.contactInfo && (
                  <div>
                    <label className="font-semibold">Contact Information:</label>
                    <p>{selectedReport.contactInfo}</p>
                  </div>
                )}
                <div>
                  <label className="font-semibold">Current Status:</label>
                  {getStatusBadge(selectedReport.status)}
                </div>
                <div>
                  <label className="font-semibold">Reported On:</label>
                  <p>{new Date(selectedReport.createdAt).toLocaleString()}</p>
                </div>

                <div className="flex gap-4 mt-6">
                  {selectedReport.status !== ReportStatus.INVESTIGATING && (
                    <Button 
                      variant="secondary" 
                      onClick={() => handleUpdateStatus(selectedReport.id, ReportStatus.INVESTIGATING)}
                    >
                      Start Investigation
                    </Button>
                  )}
                  {selectedReport.status !== ReportStatus.RESOLVED && (
                    <Button 
                      variant="default" 
                      onClick={() => handleUpdateStatus(selectedReport.id, ReportStatus.RESOLVED)}
                    >
                      Mark as Resolved
                    </Button>
                  )}
                  {selectedReport.status !== ReportStatus.DISMISSED && (
                    <Button 
                      variant="destructive" 
                      onClick={() => handleUpdateStatus(selectedReport.id, ReportStatus.DISMISSED)}
                    >
                      Dismiss Report
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ProcurementLayout>
  )
}
