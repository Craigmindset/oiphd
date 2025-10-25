"use client";
import {
  BookOpen,
  Headphones,
  Video,
  Hand,
  Zap,
  Settings,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  inDrawer?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  inDrawer = false,
  onNavigate,
}: SidebarProps) {
  const router = useRouter();
  const menuItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "module1", label: "Module 1", icon: BookOpen },
    { id: "module2", label: "Module 2", icon: Headphones },
    { id: "module3", label: "Module 3", icon: Video },
    { id: "prayers", label: "Prayers", icon: Hand },
    { id: "transformation", label: "Transformation", icon: Zap },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={
        inDrawer
          ? "flex w-full h-full bg-black border-r border-gray-200 flex-col"
          : "hidden md:flex md:w-64 bg-white border-r border-gray-200 flex-col"
      }
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">OIPHD</h1>
        <p className="text-xs text-gray-500 mt-1">an evening with Jesus</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const handleClick = () => {
            setActiveTab(item.id);
            // Handle routing based on item.id for both mobile and desktop
            let path = "/dashboard";
            if (item.id !== "overview") {
              path += `/${item.id}`;
            }
            router.push(path);
            // Call onNavigate if provided (to close drawer on mobile)
            if (inDrawer && onNavigate) {
              onNavigate();
            }
          };

          return (
            <button
              key={item.id}
              onClick={handleClick}
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
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-red-600 hover:text-red-700 bg-transparent"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </Button>
      </div>
    </aside>
  );
}
