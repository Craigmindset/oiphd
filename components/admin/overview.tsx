"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Hand, Zap, Book, BookOpen } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";

interface ModuleCompletion {
  module1: number;
  module2: number;
  module3: number;
}

export function Overview() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moduleCompletion, setModuleCompletion] = useState<ModuleCompletion>({
    module1: 0,
    module2: 0,
    module3: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Fetch total users
      const { count, error: userError } = await supabase
        .from("user_profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "user");

      if (userError) {
        setError(userError.message);
        setTotalUsers(null);
      } else {
        setTotalUsers(count ?? 0);
      }

      // Fetch module completion data from module_progress table
      const { data: progressData, error: progressError } = await supabase
        .from("module_progress")
        .select("user_id, module_id, completed")
        .eq("completed", true)
        .in("module_id", ["module1", "module2", "module3"]);

      if (progressError) {
        console.error("Error fetching module completion:", progressError);
      } else if (progressData) {
        // Count unique users who completed each module
        const module1Users = new Set(
          progressData
            .filter((p) => p.module_id === "module1")
            .map((p) => p.user_id)
        );
        const module2Users = new Set(
          progressData
            .filter((p) => p.module_id === "module2")
            .map((p) => p.user_id)
        );
        const module3Users = new Set(
          progressData
            .filter((p) => p.module_id === "module3")
            .map((p) => p.user_id)
        );

        const completion = {
          module1: module1Users.size,
          module2: module2Users.size,
          module3: module3Users.size,
        };
        setModuleCompletion(completion);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // Prepare chart data
  const chartData = [
    {
      module: "Module 1",
      completed: moduleCompletion.module1,
      fill: "hsl(var(--chart-1))",
    },
    {
      module: "Module 2",
      completed: moduleCompletion.module2,
      fill: "hsl(var(--chart-2))",
    },
    {
      module: "Module 3",
      completed: moduleCompletion.module3,
      fill: "hsl(var(--chart-3))",
    },
  ];

  const chartConfig = {
    completed: {
      label: "Users Completed",
    },
  };

  const totalCompleted =
    moduleCompletion.module1 +
    moduleCompletion.module2 +
    moduleCompletion.module3;

  const stats = [
    {
      title: "Total Users",
      value: loading ? "..." : error ? "-" : totalUsers?.toString() ?? "0",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Module Completed",
      value: loading ? "..." : totalCompleted.toString(),
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
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
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

      {/* Module Completion Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Module Completion Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-gray-500">Loading chart data...</div>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="module"
                  tickLine={false}
                  axisLine={false}
                  className="text-sm"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-sm"
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="completed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}

          {/* Legend */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {moduleCompletion.module1}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Module 1 Completed
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {moduleCompletion.module2}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Module 2 Completed
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {moduleCompletion.module3}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Module 3 Completed
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
