"use client";

import { Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function Prayers() {
  const audioItems = [
    { title: "Guided Meditation", duration: "12:34" },
    { title: "Breathing Exercises", duration: "8:45" },
    { title: "Affirmations for Healing", duration: "10:20" },
    { title: "Sleep Relaxation", duration: "15:00" },
    { title: "Morning Motivation", duration: "7:30" },
    { title: "Evening Reflection", duration: "9:15" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Module 2: Audio Sessions
      </h1>
      <div className="space-y-4">
        {audioItems.map((item, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5h3V9h4v3h3l-5 5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.duration}</p>
                </div>
              </div>
              <Button size="icon" className="bg-blue-600 hover:bg-blue-700">
                <Play className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
