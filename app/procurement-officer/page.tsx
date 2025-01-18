'use client'

import Image from "next/image"
import { LayoutDashboard, FileText, History, BookOpen, Bell, Settings, HelpCircle, MessageSquare } from 'lucide-react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardCard } from "@/components/dashboard-card"
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [tenders, setTenders] = useState([]);

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const response = await fetch('/api/tenders');
        const data = await response.json();
        setTenders(data);
      } catch (error) {
        console.error('Error fetching tenders:', error);
      }
    };

    fetchTenders();
  }, []);

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome John, access your app insights here</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-medium text-gray-900">John Mwangi</p>
            <p className="text-sm text-gray-600">Procurement Officer, Ministry of Finance</p>
          </div>
          <div className="relative h-12 w-12">
            <Image
              src="/placeholder.svg"
              alt="Profile picture"
              fill
              className="rounded-full object-cover"
            />
            <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="grid grid-cols-3 gap-6 p-8">
        <DashboardCard
          title="Dashboard"
          description="See relevant insights about available tenders"
          href="/procurement-officer"
          icon={LayoutDashboard}
        />
        <DashboardCard
          title="Tenders"
          description="See relevant insights about available tenders"
          href="/procurement-officer/tenders"
          icon={FileText}
        />
        <DashboardCard
          title="Tender History"
          description="See relevant insights about available tenders"
          href="/procurement-officer/tenders-history"
          icon={History}
        />
        <DashboardCard
          title="Resource Center"
          description="See relevant insights about available tenders"
          href="/procurement-officer/resource-center"
          icon={BookOpen}
        />
        <DashboardCard
          title="Notifications"
          description="See relevant insights about available tenders"
          href="/procurement-officer/notifications"
          icon={Bell}
        />
        <DashboardCard
          title="Settings"
          description="See relevant insights about available tenders"
          href="/procurement-officer/settings"
          icon={Settings}
        />
        <DashboardCard
          title="Help"
          description="See relevant insights about available tenders"
          href="/procurement-officer/help"
          icon={HelpCircle}
        />
        <DashboardCard
          title="Give Feedback"
          description="See relevant insights about available tenders"
          href="/procurement-officer/feedback"
          icon={MessageSquare}
        />
      </main>
    </DashboardLayout>
  )
}