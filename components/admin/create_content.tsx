"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// Accept an optional setActiveTab prop for dashboard tab switching
interface CreateContentProps {
  setActiveTab?: (tab: string) => void;
}

export default function CreateContent({ setActiveTab }: CreateContentProps) {
  // Removed moduleNumber state
  const [itemNumber, setItemNumber] = useState(1);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [contentType, setContentType] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedCard, setPublishedCard] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);
    // Map contentType to module_number
    let module_number = null;
    if (contentType === "text") module_number = 1;
    else if (contentType === "audio") module_number = 2;
    else if (contentType === "video") module_number = 3;
    else if (contentType === "prayer") module_number = 4;

    const { data, error } = await supabase
      .from("module_content")
      .insert([
        {
          module_number,
          item_number: itemNumber,
          title,
          content_type: contentType,
          content,
        },
      ])
      .select()
      .single();
    setIsPublishing(false);
    if (error) {
      setError(error.message);
    } else {
      setPublishedCard(data);
      // Switch to the appropriate dashboard tab after successful publish
      if (contentType === "text") {
        if (setActiveTab) {
          setActiveTab("module1");
        } else if (typeof window !== "undefined") {
          localStorage.setItem("adminActiveTab", "module1");
          window.location.href = "/admin";
        }
      } else if (contentType === "audio") {
        if (setActiveTab) {
          setActiveTab("module2");
        } else if (typeof window !== "undefined") {
          localStorage.setItem("adminActiveTab", "module2");
          window.location.href = "/admin";
        }
      } else if (contentType === "video") {
        if (setActiveTab) {
          setActiveTab("module3");
        } else if (typeof window !== "undefined") {
          localStorage.setItem("adminActiveTab", "module3");
          window.location.href = "/admin";
        }
      } else if (contentType === "prayer") {
        if (setActiveTab) {
          setActiveTab("prayers");
        } else if (typeof window !== "undefined") {
          localStorage.setItem("adminActiveTab", "prayers");
          window.location.href = "/admin";
        }
      }
    }
    // On mount, check if a tab is set in localStorage and set it, then clear
    useEffect(() => {
      if (typeof window !== "undefined") {
        const tab = localStorage.getItem("adminActiveTab");
        if (tab) {
          const event = new CustomEvent("setAdminTab", { detail: tab });
          window.dispatchEvent(event);
          localStorage.removeItem("adminActiveTab");
        }
      }
    }, []);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 px-2 md:px-8">
      <h1 className="text-2xl font-bold mb-6">Create Module 1 Content</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>New Content Card</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Module Number removed */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Item Number
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 rounded border border-gray-300 hover:bg-gray-100"
                onClick={() => setItemNumber((prev) => Math.max(1, prev - 1))}
                aria-label="Decrease"
              >
                <Minus size={16} />
              </button>
              <Input
                type="number"
                min={1}
                value={itemNumber}
                onChange={(e) => setItemNumber(Number(e.target.value))}
                className="w-20 text-center"
              />
              <button
                type="button"
                className="p-2 rounded border border-gray-300 hover:bg-gray-100"
                onClick={() => setItemNumber((prev) => prev + 1)}
                aria-label="Increase"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Content Type
            </label>
            <select
              className="w-full border rounded px-3 py-2 text-sm md:text-sm font-light"
              value={contentType}
              onChange={(e) => {
                setContentType(e.target.value);
                setContent("");
              }}
            >
              <option value="">Select type...</option>
              <option value="text">Text</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
              <option value="prayer">Prayer</option>
            </select>
          </div>
          {/* Content input, shown only if contentType is selected */}
          {(contentType === "text" || contentType === "prayer") && (
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter content"
                rows={8}
              />
            </div>
          )}
          {contentType === "audio" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Audio File
              </label>
              <input
                type="file"
                accept="audio/*"
                ref={fileInputRef}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  setError(null);
                  // Upload to Supabase Storage (bucket: 'audio')
                  const fileExt = file.name.split(".").pop();
                  const filePath = `audio/${Date.now()}_${Math.random()
                    .toString(36)
                    .substring(2)}.${fileExt}`;
                  const { data, error } = await supabase.storage
                    .from("audio")
                    .upload(filePath, file);
                  if (error) {
                    setError("Audio upload failed: " + error.message);
                    setUploading(false);
                    return;
                  }
                  // Get public URL
                  const { data: urlData } = supabase.storage
                    .from("audio")
                    .getPublicUrl(filePath);
                  setContent(urlData?.publicUrl || "");
                  setUploading(false);
                }}
                disabled={uploading}
              />
              {uploading && (
                <span className="text-xs text-blue-600 ml-2">Uploading...</span>
              )}
              {content && (
                <div className="mt-2">
                  <label className="block text-xs font-medium mb-1">
                    Audio URL
                  </label>
                  <Input type="url" value={content} readOnly />
                  <div className="flex items-center gap-2 mt-2">
                    <audio
                      controls
                      src={content}
                      className="w-64"
                      ref={fileInputRef as any}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const audio =
                          fileInputRef.current as unknown as HTMLAudioElement | null;
                        if (audio) audio.pause();
                      }}
                    >
                      Pause
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const audio =
                          fileInputRef.current as unknown as HTMLAudioElement | null;
                        if (audio) {
                          audio.pause();
                          audio.currentTime = 0;
                        }
                      }}
                    >
                      Stop
                    </Button>
                  </div>
                </div>
              )}
              <span className="text-xs text-gray-500 block mt-1">
                Accepted: mp3, wav, ogg, aac, flac, m4a
              </span>
            </div>
          )}
          {contentType === "video" && (
            <div>
              <label className="block text-sm font-normal mb-1">
                Video URL
              </label>
              <Input
                type="url"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter video link (YouTube, Vimeo, mp4, etc.)"
              />
            </div>
          )}
          <Button
            onClick={handlePublish}
            disabled={
              isPublishing ||
              !title.trim() ||
              !contentType ||
              !content.trim() ||
              (contentType === "audio" &&
                !/\.(mp3|wav|ogg|aac|flac|m4a)$/i.test(content))
            }
            className="w-full"
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </Button>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </CardContent>
      </Card>

      {publishedCard && (
        <Card className="border-green-500 border-2">
          <CardHeader>
            <CardTitle>Saved Content Card</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 font-semibold">
              {publishedCard.item_number}
            </div>
            <div className="mb-2 text-lg font-bold">{publishedCard.title}</div>
            <div className="whitespace-pre-line">{publishedCard.content}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
