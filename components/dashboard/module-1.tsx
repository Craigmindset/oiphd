"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function Module1() {
  const [expandedItems, setExpandedItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const items = [
    {
      title: "Introduction to Healing",
      content: "Learn the fundamentals of spiritual healing and its benefits for your wellbeing.",
    },
    {
      title: "Understanding Your Journey",
      content: "Explore your personal path to transformation and spiritual growth.",
    },
    {
      title: "Meditation Basics",
      content: "Master essential meditation techniques to calm your mind and spirit.",
    },
    {
      title: "Building Inner Strength",
      content: "Develop resilience and inner peace through guided practices.",
    },
    {
      title: "Connecting with Purpose",
      content: "Discover your life purpose and align with your spiritual goals.",
    },
    {
      title: "Daily Practices",
      content: "Implement daily routines to maintain your spiritual progress.",
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Module 1: Foundations</h1>
      <div className="space-y-4">
        {items.map((item, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900 text-left">{item.title}</h3>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  expandedItems.includes(index) ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedItems.includes(index) && (
              <CardContent className="pt-0 pb-6 px-6 border-t border-gray-200">
                <p className="text-gray-600 leading-relaxed">{item.content}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
