'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import {  
  Clock, 
  Award,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle
} from 'lucide-react'
import { VendorLayout } from "@/components/vendor-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
            <h1 className="text-xl md:text-3xl font-bold text-primary">Vendor Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">Monitor your bidding activities and performance</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Active Bids */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Bids
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : dashboardStats.activeBids}
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
                  Pending
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Won Tenders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Won Tenders
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : dashboardStats.wonTenders}
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                  Awarded
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Success Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Success Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : `${dashboardStats.successRate.toFixed(1)}%`}
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  Performance
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Total Value */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Value Won
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : `$${dashboardStats.totalValue.toLocaleString()}`}
                </div>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                  Revenue
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pending Evaluations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Evaluations
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : dashboardStats.pendingEvaluations}
                </div>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-400">
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
                    <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                  ))
                ) : dashboardStats.recentActivities.length > 0 ? (
                  dashboardStats.recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{activity.type}</Badge>
                        <p className="text-sm">{activity.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">No recent activities</p>
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
                    <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                  ))
                ) : dashboardStats.upcomingDeadlines.length > 0 ? (
                  dashboardStats.upcomingDeadlines.map((deadline) => (
                    <div
                      key={deadline.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{deadline.title}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(deadline.closingDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">No upcoming deadlines</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </VendorLayout>
  )
}