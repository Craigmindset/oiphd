"use client";

import {
  Users,
  BarChart3,
  Settings,
  LogOut,
  BookOpen,
  Cross,
  Target,
  BookOpenCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const { logout } = useAuth();
  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };
  const menuItems = [
    { id: "overview", label: "Overview", icon: Target },
    { id: "users", label: "Users", icon: Users },
    { id: "create_content", label: "Create Content", icon: BookOpen },
    { id: "module1", label: "Module-Text", icon: BookOpenCheck },
    { id: "module2", label: "Module-Audio", icon: BookOpenCheck },
    { id: "module3", label: "Module-Video", icon: BookOpenCheck },
    { id: "prayers", label: "Prayers", icon: Cross },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex md:w-64 h-[700px] bg-white border-r border-gray-200 flex-col">
      {/* Logo */}
      <div
        className="border-b border-blue-900 bg-white sticky top-0 left-0 z-50"
        style={{ height: 72 }}
      >
        <div className="flex flex-col justify-center h-full p-6">
          <h1 className="text-xl font-bold text-blue-600">OIPHD</h1>
          <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 mb-10 ">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-red-600 hover:text-red-700 bg-transparent"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
