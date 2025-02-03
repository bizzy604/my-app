'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  AlertTriangle, 
  FileCheck, 
  Clock, 
  FileWarning,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useHydrationSafeClient } from "@/components/hydration-safe-client-component"
import { getDashboardStats } from "@/app/actions/dashboard-actions"

interface DashboardStats {
  openTenders: number
  ongoingEvaluations: number
  contractsAwarded: number
  pendingApprovals: number
  flaggedAnomalies: number
  vendorQueries: number
  recentActivities: Array<{
    id: string
    type: string
    description: string
    date: string
  }>
  anomalyData: {
    labels: string[]
    values: number[]
  }
}

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('month')
  
  const { data: stats, isLoading } = useHydrationSafeClient<DashboardStats>(
    () => getDashboardStats(timeRange)
  )

  const dashboardStats = stats || {
    openTenders: 0,
    ongoingEvaluations: 0,
    contractsAwarded: 0,
    pendingApprovals: 0,
    flaggedAnomalies: 0,
    vendorQueries: 0,
    recentActivities: [],
    anomalyData: { labels: [], values: [] }
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-[#4B0082]">Dashboard Overview</h1>
            <p className="text-sm md:text-base text-gray-600">Monitor procurement processes and insights</p>
          </div>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Open Tenders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Open Tenders
              </CardTitle>
              <FileCheck className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : dashboardStats.openTenders}
                </div>
                <Badge variant="outline" className="bg-green-50">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Ongoing Evaluations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Ongoing Evaluations
              </CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : dashboardStats.ongoingEvaluations}
                </div>
                <Badge variant="outline" className="bg-blue-50">
                  In Progress
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contracts Awarded */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Contracts Awarded
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : dashboardStats.contractsAwarded}
                </div>
                <Badge variant="outline" className="bg-purple-50">
                  Completed
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Pending Approvals
              </CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : dashboardStats.pendingApprovals}
                </div>
                <Badge variant="outline" className="bg-yellow-50">
                  Awaiting
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Flagged Anomalies */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Flagged Anomalies
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : dashboardStats.flaggedAnomalies}
                </div>
                <Badge variant="outline" className="bg-red-50">
                  Alert
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Queries */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Vendor Queries
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : dashboardStats.vendorQueries}
                </div>
                <Badge variant="outline" className="bg-orange-50">
                  Pending
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities & Anomaly Detection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                  ))
                ) : dashboardStats.recentActivities.length > 0 ? (
                  dashboardStats.recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{activity.type}</Badge>
                        <p className="text-sm">{activity.description}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No recent activities</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Anomaly Detection Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Anomaly Detection</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add Chart.js or any other charting library implementation here */}
              <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Anomaly Detection Chart</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 