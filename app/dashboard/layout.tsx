"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Footer } from "@/components/dashboard/footer";
import { ModuleProgressProvider } from "@/hooks/use-module-progress";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeTab = pathname.split("/").pop() || "overview";
  const setActiveTab = () => {};

  return (
    <ModuleProgressProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="p-6 sm:p-8">{children}</div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </ModuleProgressProvider>
  );
}
