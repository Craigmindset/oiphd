"use client";

import {
  Users,
  BarChart3,
  Settings,
  LogOut,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Cross,
  UserRoundCheck,
  Target,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
}: AdminSidebarProps) {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
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
    { id: "testimonies", label: "Testimonies", icon: UserRoundCheck },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex h-[700px] bg-white border-r border-gray-200 flex-col transition-all duration-200 ${
        collapsed ? "md:w-16" : "md:w-64"
      }`}
    >
      {/* Logo */}
      <div
        className={`border-b border-blue-900 bg-white sticky top-0 left-0 z-40 transition-all duration-200 ${
          collapsed ? "px-0" : "px-6"
        }`}
        style={{ height: 72 }}
      >
        <div
          className={`flex flex-col justify-center h-full ${
            collapsed ? "items-center" : ""
          }`}
        >
          <h1
            className={`font-bold text-blue-600 transition-all duration-200 ${
              collapsed ? "text-lg" : "text-xl"
            }`}
          >
            OIPHD
          </h1>
          {!collapsed && (
            <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
          )}
        </div>
        {/* Collapse Toggle (moved here) */}
        <div className="flex items-center justify-end pt-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-600"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
      {/* Navigation */}
      <nav
        className={`flex-1 p-2 md:p-4 space-y-2 transition-all duration-200 ${
          collapsed ? "items-center mt-10" : "mt-6"
        }`}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center ${
                collapsed ? "justify-center" : "gap-3 px-4"
              } py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
      {/* Logout */}
      <div
        className={`p-2 md:p-4 border-t border-gray-200 mb-10 transition-all duration-200 ${
          collapsed ? "flex justify-center" : ""
        }`}
      >
        <Button
          variant="outline"
          className={`w-full ${
            collapsed ? "justify-center" : "justify-start gap-2"
          } text-red-600 hover:text-red-700 bg-transparent`}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </aside>
  );
}
