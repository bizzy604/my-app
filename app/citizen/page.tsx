'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { CitizenLayout } from "@/components/citizen-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Award, AlertTriangle, BarChart } from 'lucide-react'
import { getTenders } from "@/app/actions/tender-actions"
import { getReports } from "@/app/actions/report-actions"

export default function CitizenDashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    activeTenders: 0,
    recentlyAwarded: 0,
    reportedIrregularities: 0,
  })
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active tenders
        const activeTenders = await getTenders({ status: 'OPEN' })
        
        // Fetch awarded tenders
        const awardedTenders = await getTenders({ status: 'AWARDED' })
        
        // Fetch reports
        const reports = await getReports()
        
        setDashboardData({
          activeTenders: activeTenders.length,
          recentlyAwarded: awardedTenders.length,
          reportedIrregularities: reports.length,
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }
    fetchData()
  }, [])

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
              <div className="text-2xl font-bold">{dashboardData.activeTenders}</div>
              <p className="text-xs text-muted-foreground">Open for bidding</p>
              <Button asChild className="mt-4 w-full bg-[#4B0082] hover:bg-[#3B0062]">
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
              <div className="text-2xl font-bold">{dashboardData.recentlyAwarded}</div>
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
              <div className="text-2xl font-bold">{dashboardData.reportedIrregularities}</div>
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
              <ul className="divide-y divide-gray-200">
                <li className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center">
                    <FileText className="mr-3 h-5 w-5 text-[#4B0082]" />
                    <span>New tender posted: "Supply of Medical Equipment"</span>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </li>
                <li className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center">
                    <Award className="mr-3 h-5 w-5 text-[#4B0082]" />
                    <span>Tender awarded: "City Park Renovation Project"</span>
                  </div>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </li>
                <li className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center">
                    <AlertTriangle className="mr-3 h-5 w-5 text-[#4B0082]" />
                    <span>Irregularity reported: "Suspicious bid pattern"</span>
                  </div>
                  <span className="text-sm text-gray-500">3 days ago</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </CitizenLayout>
  )
}