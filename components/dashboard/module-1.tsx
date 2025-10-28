"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabaseClient";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function Module1({
  moduleId = "module1",
  onAllCardsOpened,
}: {
  moduleId?: string;
  onAllCardsOpened?: (allOpened: boolean) => void;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  // Fetch expandedItems from Supabase on mount
  useEffect(() => {
    if (!user || !moduleId) return;
    const fetchProgress = async () => {
      const { data, error } = await supabase
        .from("module_progress")
        .select("expanded_items")
        .eq("user_id", user.id)
        .eq("module_id", moduleId)
        .single();
      if (data && Array.isArray(data.expanded_items)) {
        setExpandedItems(data.expanded_items);
      }
    };
    fetchProgress();
  }, [user, moduleId]);

  // Save expandedItems to Supabase when changed
  useEffect(() => {
    if (!user || !moduleId) return;
    const saveProgress = async () => {
      await supabase.from("module_progress").upsert({
        user_id: user.id,
        module_id: moduleId,
        expanded_items: expandedItems,
      });
    };
    if (expandedItems.length > 0) saveProgress();
  }, [expandedItems, user, moduleId]);
  const [items, setItems] = useState<
    { title: string; content: string; item_number: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => {
      const next = prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index];
      return next;
    });
  };

  // Notify parent if all cards are opened
  useEffect(() => {
    if (onAllCardsOpened && items.length > 0) {
      onAllCardsOpened(items.every((_, idx) => expandedItems.includes(idx)));
    }
  }, [expandedItems, items, onAllCardsOpened]);

  useEffect(() => {
    async function fetchModuleContent() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("module_content")
        .select("title, content, item_number")
        .eq("module_number", 1)
        .eq("content_type", "text")
        .order("item_number", { ascending: true });
      if (error) {
        setError("Failed to load module content.");
        setItems([]);
      } else {
        setItems((data || []).sort((a, b) => a.item_number - b.item_number));
      }
      setLoading(false);
    }
    fetchModuleContent();
  }, []);

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
      {loading ? (
        <p className="text-gray-500">Loading module content...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item, index) => (
              <Card
                key={item.item_number}
                className="hover:shadow-md transition-shadow"
              >
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
                      <p
                        key={idx}
                        className="text-gray-600 leading-relaxed mb-3"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
          {/* Next button outside the cards, only show if all cards are expanded */}
          {/* Next button outside the cards, only show if all cards are expanded */}
          {items.length > 0 &&
            items.every((_, idx) => expandedItems.includes(idx)) && (
              <div className="flex justify-end mt-6">
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                  onClick={async () => {
                    if (!user) return;
                    // Mark module1 as completed in Supabase
                    await supabase.from("module_progress").upsert({
                      user_id: user.id,
                      module_id: "module1",
                      completed: true,
                    });
                    router.push("/dashboard/module2");
                  }}
                >
                  Next
                </button>
              </div>
            )}
        </>
      )}
    </div>
  );
}
