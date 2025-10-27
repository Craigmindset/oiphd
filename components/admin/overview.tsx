"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Hand, Zap, Book, BookOpen } from "lucide-react";

export function Overview() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTotalUsers = async () => {
      setLoading(true);
      setError(null);
      const { count, error } = await supabase
        .from("user_profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "user");
      if (error) {
        setError(error.message);
        setTotalUsers(null);
      } else {
        setTotalUsers(count ?? 0);
      }
      setLoading(false);
    };
    fetchTotalUsers();
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: loading ? "..." : error ? "-" : totalUsers?.toString() ?? "0",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Module Completed",
      value: "0",
      icon: BookOpen,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Prayer Line",
      value: "0",
      icon: Hand,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          // Add onClick to Total Users card
          const isUsersCard = stat.title === "Total Users";
          return (
            <Card
              key={index}
              className={`hover:shadow-lg transition-shadow ${
                isUsersCard ? "cursor-pointer" : ""
              }`}
              onClick={
                isUsersCard
                  ? () => {
                      window.dispatchEvent(
                        new CustomEvent("setAdminTab", { detail: "users" })
                      );
                    }
                  : undefined
              }
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
