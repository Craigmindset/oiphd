"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle, Zap } from "lucide-react";
import { useModuleProgress } from "@/hooks/use-module-progress";
import Link from "next/link";

export function Overview() {
  const MODULES = ["module1", "module2", "module3"];
  const { completedModules } = useModuleProgress();

  // Completed Modules: count of completed in module1/module2/module3
  const completedCount = MODULES.filter((m) =>
    completedModules.includes(m)
  ).length;

  // Current Module: 1, 2, or 3 depending on which is not completed, or 3 if all are complete
  let currentModule = 1;
  for (let i = 0; i < MODULES.length; i++) {
    if (!completedModules.includes(MODULES[i])) {
      currentModule = i + 1;
      break;
    }
    if (i === MODULES.length - 1) {
      currentModule = 3;
    }
  }

  // Active Module: 3 if none completed, 2 if one completed, 1 if two completed, 0 if all completed
  let activeModule = 3 - completedCount;
  if (activeModule < 0) activeModule = 0;

  const stats = [
    {
      title: "Active Module",
      value: activeModule.toString(),
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Current Modules",
      value: currentModule.toString(),
      icon: Zap,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Completed Modules",
      value: completedCount.toString(),
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-900 mb-5">Overview</h1>
      <h2 className="text-lg md:text-2xl font-bold text-gray-950 md-6">
        Welcome to the OIPHD Faith Class.
      </h2>
      <p className="text-sm md:text-lg font-normal text-gray-600 italic mb-6">
        {" "}
        This dashboard contains your course materials which will prepare you to
        receive your miracle.
        <br />
        Kindly begin with{" "}
        <Link
          href="/dashboard/module1"
          className="text-blue-600 hover:text-blue-800 underline font-semibold"
        >
          MODULE 1
        </Link>
        , and you can return anytime to continue your course.
      </p>

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
