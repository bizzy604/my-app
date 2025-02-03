'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  BarChart3, 
  Clock, 
  Award,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { VendorLayout } from "@/components/vendor-layout"
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
import { getVendorDashboardStats } from "@/app/actions/vendor-dashboard-actions"

type TimeRange = 'week' | 'month' | 'quarter' | 'year'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [timeRange, setTimeRange] = useState<TimeRange>('month')
  const { data: stats, isLoading } = useHydrationSafeClient(
    () => session?.user?.id 
      ? getVendorDashboardStats(session.user.id.toString(), timeRange) 
      : Promise.resolve(null),
    [session?.user?.id, timeRange]
  )

  const dashboardStats = stats ?? {
    activeBids: 0,
    wonTenders: 0,
    pendingEvaluations: 0,
    successRate: 0,
    totalValue: 0,
    recentActivities: [],
    upcomingDeadlines: [],
    bidDistribution: {}
  }

  return (
    <VendorLayout>
      <div className="p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-[#4B0082]">Vendor Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600">Monitor your bidding activities and performance</p>
          </div>

          <Select 
            value={timeRange} 
            onValueChange={(value: TimeRange) => setTimeRange(value)}
          >
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
          {/* Active Bids */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Active Bids
              </CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : dashboardStats.activeBids}
                </div>
                <Badge variant="outline" className="bg-blue-50">
                  Pending
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Won Tenders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Won Tenders
              </CardTitle>
              <Award className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : dashboardStats.wonTenders}
                </div>
                <Badge variant="outline" className="bg-green-50">
                  Awarded
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Success Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Success Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : `${dashboardStats.successRate.toFixed(1)}%`}
                </div>
                <Badge variant="outline" className="bg-purple-50">
                  Performance
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Total Value */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Value Won
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : `$${dashboardStats.totalValue.toLocaleString()}`}
                </div>
                <Badge variant="outline" className="bg-yellow-50">
                  Revenue
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pending Evaluations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Pending Evaluations
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : dashboardStats.pendingEvaluations}
                </div>
                <Badge variant="outline" className="bg-orange-50">
                  In Review
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities & Upcoming Deadlines */}
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

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                  ))
                ) : dashboardStats.upcomingDeadlines.length > 0 ? (
                  dashboardStats.upcomingDeadlines.map((deadline) => (
                    <div
                      key={deadline.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <p className="text-sm">{deadline.title}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(deadline.closingDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No upcoming deadlines</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </VendorLayout>
  )
}