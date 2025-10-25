"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Footer } from "@/components/dashboard/footer"
import { Overview } from "@/components/dashboard/overview"
import { Module1 } from "@/components/dashboard/module-1"
import { Module2 } from "@/components/dashboard/module-2"
import { Module3 } from "@/components/dashboard/module-3"
import { Transformation } from "@/components/dashboard/transformation"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 sm:p-8">
            {activeTab === "overview" && <Overview />}
            {activeTab === "module1" && <Module1 />}
            {activeTab === "module2" && <Module2 />}
            {activeTab === "module3" && <Module3 />}
            {activeTab === "transformation" && <Transformation />}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
