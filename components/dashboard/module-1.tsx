"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function Module1() {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setExpandedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const items = [
    {
      title: "1.1 What is Healing?",
      content: `Healing is the process of restoring health, balance, and wholeness to the body, mind, and spirit.\nIt’s what happens when something that was hurt, broken, or out of order begins to recover and function well again.\n\nIn simple terms:\n\nHealing means moving from hurt to health, from pain to peace, and from brokenness to wholeness.\n\n1.2 Healing vs. Cure\nA cure means removing a disease or problem completely.\nHealing means becoming whole — even if the disease is not gone.\n\nFor example:\n\nA person may not be cured of an illness but can still experience healing by finding peace, acceptance, and strength.\n\nHealing touches both the body and the heart.`,
    },
    {
      title: "Understanding Your Journey",
      content:
        "Explore your personal path to transformation and spiritual growth.",
    },
    {
      title: "Meditation Basics",
      content:
        "Master essential meditation techniques to calm your mind and spirit.",
    },
    {
      title: "Building Inner Strength",
      content: "Develop resilience and inner peace through guided practices.",
    },
    {
      title: "Connecting with Purpose",
      content:
        "Discover your life purpose and align with your spiritual goals.",
    },
    {
      title: "Daily Practices",
      content: "Implement daily routines to maintain your spiritual progress.",
    },
  ];

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
        Understanding Healing: The Journey of Restoration
      </h1>
      <p className="text-gray-600 mb-6 text-justify">
        This course introduces students to the concept of healing—what it means,
        how it happens, and why it’s an essential part of human life. It
        explores healing from physical, emotional, mental, and spiritual
        perspectives, helping students understand that healing is not just the
        absence of pain, but the process of becoming whole again.
      </p>
      <div className="space-y-4">
        {items.map((item, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900 text-left ml-5">
                {item.title}
              </h3>
              <Plus
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  expandedItems.includes(index) ? "rotate-45" : ""
                }`}
              />
            </button>
            {expandedItems.includes(index) && (
              <CardContent className="pt-0 pb-6 px-6 border-t border-gray-200">
                {item.content.split(/\n\n/).map((paragraph, idx) => (
                  <p key={idx} className="text-gray-600 leading-relaxed mb-3">
                    {paragraph}
                  </p>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
