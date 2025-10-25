"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle, Zap } from "lucide-react";

export function Overview() {
  const stats = [
    {
      title: "Active Module",
      value: "0",
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Current Modules",
      value: "0",
      icon: Zap,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Completed Modules",
      value: "0",
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
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
