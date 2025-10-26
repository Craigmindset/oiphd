"use client";

import { Bell, User, LogOut, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useModuleProgress } from "@/hooks/use-module-progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Sidebar } from "@/components/dashboard/sidebar";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const { getProgress } = useModuleProgress();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFirstName() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setFirstName(null);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("user_profiles")
        .select("first_name")
        .eq("id", user.id)
        .single();
      if (!error && data && data.first_name) {
        setFirstName(data.first_name);
      } else {
        setFirstName(null);
      }
      setLoading(false);
    }
    fetchFirstName();
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Mobile Burger Menu */}
      <div className="md:hidden flex items-center">
        <Drawer direction="left">
          <DrawerTrigger asChild>
            <button className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Menu className="w-7 h-7 text-gray-900" />
            </button>
          </DrawerTrigger>
          <DrawerContent className="w-[70vw] max-w-xs p-0">
            <DrawerClose id="drawer-close-button" className="hidden" />
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              inDrawer
              onNavigate={() => {
                // Find and click the hidden close button
                document.getElementById("drawer-close-button")?.click();
              }}
            />
          </DrawerContent>
        </Drawer>
      </div>

      <h2 className="text-xs md:text-2xl font-semibold text-gray-900">
        {loading ? "Hello..." : `Hello, ${firstName ? firstName : "User"}`}
      </h2>

      <div className="flex items-center gap-4">
        {/* Progress Indicator */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">Progress</p>
            <p className="text-xs text-gray-500">{getProgress()}% Complete</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-bold text-blue-600">
              {getProgress()}%
            </span>
          </div>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

        {/* Invite */}
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex gap-2 bg-transparent"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Invite
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
