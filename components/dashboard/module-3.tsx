"use client"

import { Play } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function Module3() {
  const videoItems = [
    { title: "Welcome to Your Journey", duration: "5:20" },
    { title: "Understanding Spiritual Growth", duration: "12:45" },
    { title: "Healing Techniques", duration: "18:30" },
    { title: "Community Stories", duration: "22:15" },
    { title: "Expert Insights", duration: "15:00" },
    { title: "Your Next Steps", duration: "8:50" },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Module 3: Video Sessions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoItems.map((item, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 aspect-video flex items-center justify-center group">
              <Button
                size="icon"
                className="bg-white hover:bg-gray-100 text-blue-600 w-16 h-16 rounded-full group-hover:scale-110 transition-transform"
              >
                <Play className="w-6 h-6 ml-1" />
              </Button>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.duration}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
