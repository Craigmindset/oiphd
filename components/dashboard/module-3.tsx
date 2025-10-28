"use client";
// Helper to get YouTube thumbnail
function getYouTubeThumbnail(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]+)/
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

import { useEffect, useState } from "react";
import { useModuleProgress } from "@/hooks/use-module-progress";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabaseClient";

import { Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";

export function Module3({ moduleId = "module3" }: { moduleId?: string }) {
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [videoItems, setVideoItems] = useState<any[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const { markModuleComplete } = useModuleProgress();
  // Fetch completion status from Supabase on mount
  useEffect(() => {
    if (!user || !moduleId) return;
    const fetchCompletion = async () => {
      const { data } = await supabase
        .from("module_progress")
        .select("completed")
        .eq("user_id", user.id)
        .eq("module_id", moduleId)
        .single();
      if (data && data.completed) setIsCompleted(true);
    };
    fetchCompletion();
  }, [user, moduleId]);

  // Fetch expandedItems from Supabase on mount
  useEffect(() => {
    if (!user || !moduleId) return;
    const fetchProgress = async () => {
      const { data } = await supabase
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
  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from("module_content")
        .select("item_number, title, content, duration")
        .eq("module_number", 3)
        .eq("content_type", "video")
        .order("item_number", { ascending: true });
      if (data) {
        setVideoItems(data);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Module 3: Video Sessions
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoItems.map((item, index) => (
          <Dialog key={item.item_number || index}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video flex items-center justify-center group overflow-hidden bg-gray-200">
                {/* Thumbnail */}
                {item.content && item.content.includes("youtube.com") ? (
                  <img
                    src={getYouTubeThumbnail(item.content) || ""}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-300">
                    <Play className="w-12 h-12 text-gray-400 opacity-60" />
                  </div>
                )}
                {/* Play Button */}
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    className="bg-white hover:bg-gray-100 text-blue-600 w-16 h-16 rounded-full group-hover:scale-110 transition-transform z-10"
                    onClick={() =>
                      setExpandedItems((prev) =>
                        prev.includes(index) ? prev : [...prev, index]
                      )
                    }
                  >
                    <Play className="w-6 h-6 ml-1" />
                  </Button>
                </DialogTrigger>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500">{item.duration || ""}</p>
              </CardContent>
            </Card>
            <DialogContent className="max-w-full sm:max-w-2xl p-0">
              <div className="relative w-screen max-w-full sm:w-full aspect-video bg-black">
                {item.content && item.content.includes("youtube.com") ? (
                  <iframe
                    src={item.content
                      .replace("watch?v=", "embed/")
                      .replace("youtube.com/shorts/", "youtube.com/embed/")}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    className="w-full h-full object-contain rounded"
                    title={item.title}
                    style={{
                      minHeight: 200,
                      maxHeight: "80vh",
                      aspectRatio: "16/9",
                    }}
                  />
                ) : (
                  <video
                    src={item.content}
                    controls
                    // autoPlay removed for mobile compatibility
                    className="w-full h-full object-contain rounded"
                    style={{
                      minHeight: 200,
                      maxHeight: "80vh",
                      aspectRatio: "16/9",
                    }}
                  />
                )}
                <DialogClose asChild>
                  <Button
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  >
                    <span className="sr-only">Close</span>×
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
      {/* Mark as Complete and Next buttons, only show if all video cards are opened */}
      <div className="flex justify-end mt-6 gap-4">
        <button
          className={`px-6 py-2 text-white rounded-lg shadow transition disabled:opacity-50 ${
            isCompleted
              ? "bg-purple-200 text-purple-800 hover:bg-purple-300"
              : "bg-green-600 hover:bg-green-700"
          }`}
          disabled={
            !(
              videoItems.length > 0 &&
              videoItems.every((_, idx) => expandedItems.includes(idx))
            ) || isCompleted
          }
          onClick={async () => {
            if (!user) return;
            await markModuleComplete("module3");
            setIsCompleted(true);
          }}
        >
          Mark as Complete
        </button>
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
          disabled={
            !(
              videoItems.length > 0 &&
              videoItems.every((_, idx) => expandedItems.includes(idx))
            )
          }
          onClick={async () => {
            if (!user) return;
            await markModuleComplete("module3");
            if (typeof window !== "undefined") {
              window.location.href = "/dashboard/prayers";
            }
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
