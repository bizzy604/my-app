'use client'

import { CitizenLayout } from "@/components/citizen-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Award, AlertTriangle, BarChart } from 'lucide-react'
import { useCitizenData } from "@/hooks/use-citizen-data"
import { LoadingSpinner } from "@/components/loading-spinner"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getRecentActivities } from "@/app/actions/activity-actions"
import { formatDistanceToNow } from 'date-fns'

export default function CitizenDashboardPage() {
  const router = useRouter()
  const { stats, isLoading: statsLoading } = useCitizenData()
  
  // Fetch recent activities
  const { 
    data: activities, 
    isLoading: activitiesLoading 
  } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: () => getRecentActivities(5)
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'NEW_TENDER':
        return <FileText className="h-5 w-5 text-[#4B0082]" />
      case 'AWARDED':
        return <Award className="h-5 w-5 text-[#4B0082]" />
      case 'REPORT':
        return <AlertTriangle className="h-5 w-5 text-[#4B0082]" />
      default:
        return null
    }
  }

  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case 'NEW_TENDER':
        return `New tender posted: "${activity.title}" by ${activity.department}`
      case 'AWARDED':
        return `Tender awarded: "${activity.title}" to ${activity.winner}`
      case 'REPORT':
        return `Irregularity reported for tender: "${activity.tenderTitle}"`
      default:
        return ''
    }
  }

  return (
    <CitizenLayout>
      <header className="border-b bg-white px-8 py-4">
        <h1 className="text-2xl font-semibold text-[#4B0082]">Citizen Dashboard</h1>
        <p className="text-sm text-gray-600">Welcome to your InnoBid Citizen Portal</p>
      </header>

      <main className="p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tenders</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : (
                  stats?.activeTenders || 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">Open for bidding</p>
              <Button 
                asChild 
                className="mt-4 w-full bg-[#4B0082] hover:bg-[#3B0062]"
                disabled={statsLoading}
              >
                <Link href="/citizen/tenders">View Tenders</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recently Awarded</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.recentlyAwarded}</div>
              <p className="text-xs text-muted-foreground">In the last 30 days</p>
              <Button asChild className="mt-4 w-full bg-[#4B0082] hover:bg-[#3B0062]">
                <Link href="/citizen/awarded-tenders">View Awarded</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reported Irregularities</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.reportedIrregularities}</div>
              <p className="text-xs text-muted-foreground">Submitted reports</p>
              <Button asChild className="mt-4 w-full bg-[#4B0082] hover:bg-[#3B0062]">
                <Link href="/citizen/report">Report Irregularity</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tender Statistics</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View Stats</div>
              <p className="text-xs text-muted-foreground">Analyze tender data</p>
              <Button 
                className="mt-4 w-full bg-[#4B0082] hover:bg-[#3B0062]"
                onClick={() => router.push('/citizen/statistics')}
              >
                View Statistics
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-[#4B0082]">Recent Activity</h2>
          <Card>
            <CardContent className="p-0">
              {activitiesLoading ? (
                <div className="flex justify-center p-6">
                  <LoadingSpinner className="h-6 w-6" />
                </div>
              ) : activities && activities.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {activities.map((activity, index) => (
                    <li 
                      key={index} 
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                      onClick={() => router.push(`/citizen/tenders/${activity.tenderId}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="flex items-center">
                        {getActivityIcon(activity.type)}
                        <span className="ml-3">{getActivityText(activity)}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </CitizenLayout>
  )
}