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
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

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
  
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const hasJustSubscribed = searchParams.get('subscribed') === 'true';
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    const forceRefresh = getCookie('force-session-refresh');
    
    if (hasJustSubscribed || forceRefresh) {
      console.log('Refreshing session after subscription...');
      
      update();
      
      if (forceRefresh) {
        document.cookie = 'force-session-refresh=; Path=/; Max-Age=0';
      }
    }
    
    const redirectPath = getCookie('redirect-after-load');
    if (redirectPath) {
      document.cookie = 'redirect-after-load=; Path=/; Max-Age=0';
      
      setTimeout(() => {
        window.history.replaceState({}, '', redirectPath);
      }, 100);
    }
  }, [searchParams, update]);

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
            <h1 className="text-xl md:text-3xl font-bold text-primary">Dashboard Overview</h1>
            <p className="text-sm md:text-base text-muted-foreground">Monitor procurement processes and insights</p>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Open Tenders
              </CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : dashboardStats.openTenders}
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Ongoing Evaluations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ongoing Evaluations
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : dashboardStats.ongoingEvaluations}
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
                  In Progress
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contracts Awarded */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contracts Awarded
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : dashboardStats.contractsAwarded}
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  Completed
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Approvals
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : dashboardStats.pendingApprovals}
                </div>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                  Awaiting
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Flagged Anomalies */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Flagged Anomalies
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : dashboardStats.flaggedAnomalies}
                </div>
                <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400">
                  Alert
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Queries */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vendor Queries
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoading ? '-' : dashboardStats.vendorQueries}
                </div>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-400">
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
                        <p className="text-sm line-clamp-1">{activity.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2 shrink-0">
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

          {/* Anomaly Detection Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Anomaly Detection</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add Chart.js or any other charting library implementation here */}
              <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">Anomaly Detection Chart</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 