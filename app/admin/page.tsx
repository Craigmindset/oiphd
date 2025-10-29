"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { UserManagementTable } from "@/components/admin/user-management-table";
import Module1 from "@/components/admin/module1";
import Module2 from "@/components/admin/module2";
import Module3 from "@/components/admin/module3";
import Prayers from "@/components/admin/prayers";
import Testimonies from "@/components/admin/testimonies";
import { Overview } from "@/components/admin/overview";
import Module1Admin from "@/components/admin/create_content";
import { AdminFooter } from "@/components/admin/footer";
import { ProtectedRoute } from "@/components/protected-route";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Listen for setAdminTab event to switch tabs after publishing
  useEffect(() => {
    function handleSetTab(e: any) {
      if (e.detail) setActiveTab(e.detail);
    }
    window.addEventListener("setAdminTab", handleSetTab);
    return () => window.removeEventListener("setAdminTab", handleSetTab);
  }, []);

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <AdminHeader />

          {/* Content Area */}
          <main className="flex-1 min-h-0 overflow-auto">
            <div className="p-6 sm:p-8">
              {activeTab === "overview" && <Overview />}
              {activeTab === "users" && <UserManagementTable />}

              {activeTab === "create_content" && (
                <Module1Admin setActiveTab={setActiveTab} />
              )}
              {activeTab === "module1" && <Module1 />}
              {activeTab === "module2" && <Module2 />}
              {activeTab === "module3" && (
                <ProtectedRoute requiredModule="module2">
                  <Module3 />
                </ProtectedRoute>
              )}
              {activeTab === "prayers" && (
                <ProtectedRoute requiredModule="module2">
                  <Prayers />
                </ProtectedRoute>
              )}
              {activeTab === "testimonies" && (
                <ProtectedRoute requiredModule="module2">
                  <Testimonies />
                </ProtectedRoute>
              )}

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
    </ProtectedRoute>
  );
}
