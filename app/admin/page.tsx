"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { UserManagementTable } from "@/components/admin/user-management-table"
import { AdminFooter } from "@/components/admin/footer"

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("users")

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader />

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 sm:p-8">
            {activeTab === "users" && <UserManagementTable />}
            {activeTab === "analytics" && (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <p>Analytics section coming soon</p>
              </div>
            )}
            {activeTab === "settings" && (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <p>Settings section coming soon</p>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <AdminFooter />
      </div>
    </div>
  )
}
