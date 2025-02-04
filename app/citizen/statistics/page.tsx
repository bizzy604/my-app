'use client'

import { useState } from 'react'
import { CitizenLayout } from "@/components/citizen-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useCitizenData } from "@/hooks/use-citizen-data"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { LoadingSpinner } from "@/components/loading-spinner"

const COLORS = ['#4B0082', '#6B238E', '#9B4B9F', '#BB6BB3', '#DB8BC7']

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState('6months')
  const { stats, isLoading } = useCitizenData()

  if (isLoading) {
    return (
      <CitizenLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner className="h-8 w-8" />
        </div>
      </CitizenLayout>
    )
  }

  const sectorData = Object.entries(stats?.sectorDistribution ?? {}).map(([name, value]) => ({
    name,
    value
  }))

  const trendData = Object.entries(stats?.monthlyTrends ?? {}).map(([month, count]) => ({
    month,
    count
  }))

  return (
    <CitizenLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#4B0082]">Procurement Statistics</h1>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sector Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Tender Distribution by Sector</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Tender Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4B0082" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Additional statistics cards can be added here */}
        </div>
      </div>
    </CitizenLayout>
  )
}