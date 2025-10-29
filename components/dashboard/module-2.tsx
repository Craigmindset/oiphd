"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { Play, Pause, StopCircle } from "lucide-react";

import Lottie from "lottie-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

function formatDuration(seconds: number) {
  if (isNaN(seconds) || seconds === Infinity) return "--:--";
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}
export function Module2({ moduleId = "module2" }: { moduleId?: string }) {
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  // Sequential audio unlocking: last completed index
  const [lastCompletedIndex, setLastCompletedIndex] = useState<number>(-1);
  // Fetch expandedItems and lastCompletedIndex from Supabase on mount
  useEffect(() => {
    if (!user || !moduleId) return;
    const fetchProgress = async () => {
      const { data } = await supabase
        .from("module_progress")
        .select("expanded_items, last_completed_index")
        .eq("user_id", user.id)
        .eq("module_id", moduleId)
        .single();
      if (data) {
        if (Array.isArray(data.expanded_items)) {
          setExpandedItems(data.expanded_items);
        }
        if (typeof data.last_completed_index === "number") {
          setLastCompletedIndex(data.last_completed_index);
        }
      }
    };
    fetchProgress();
  }, [user, moduleId]);

  // Save expandedItems and lastCompletedIndex to Supabase when changed
  useEffect(() => {
    if (!user || !moduleId) return;
    const saveProgress = async () => {
      await supabase.from("module_progress").upsert({
        user_id: user.id,
        module_id: moduleId,
        expanded_items: expandedItems,
        last_completed_index: lastCompletedIndex,
      });
    };
    if (expandedItems.length > 0 || lastCompletedIndex >= 0) saveProgress();
  }, [expandedItems, lastCompletedIndex, user, moduleId]);
  const [lottieData, setLottieData] = useState<any>(null);
  useEffect(() => {
    fetch("/Sound%20voice%20waves.json")
      .then((res) => res.json())
      .then(setLottieData);
  }, []);
  const [audioItems, setAudioItems] = useState<
    {
      item_number: number;
      title: string;
      content: string;
      duration?: string;
      thumbnail?: string;
    }[]
  >([]);

  // Random thumbnail images
  const thumbnailImages = ["/img3.jpg", "/img1%20(4).jpg", "/img2.jpg"];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // playbackStates: 'idle' | 'playing' | 'paused'
  const [playbackStates, setPlaybackStates] = useState<string[]>([]);
  const [durations, setDurations] = useState<number[]>([]);
  const [currentTimes, setCurrentTimes] = useState<number[]>([]);

  useEffect(() => {
    async function fetchAudioItems() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("module_content")
        .select("item_number, title, content")
        .eq("module_number", 2)
        .eq("content_type", "audio")
        .order("item_number", { ascending: true });
      if (error) {
        setError("Failed to load audio items.");
        setAudioItems([]);
        setPlaybackStates([]);
        setDurations([]);
        setCurrentTimes([]);
      } else {
        // Assign random thumbnails to each audio item
        const itemsWithThumbnails = (data || []).map((item) => ({
          ...item,
          thumbnail:
            thumbnailImages[Math.floor(Math.random() * thumbnailImages.length)],
        }));
        setAudioItems(itemsWithThumbnails);
        setPlaybackStates((data || []).map(() => "idle"));
        setDurations((data || []).map(() => 0));
        setCurrentTimes((data || []).map(() => 0));
      }
      setLoading(false);
    }
    fetchAudioItems();
  }, []);

  // Helper: get and set playback position in localStorage
  function getAudioProgress(moduleId: string, idx: number) {
    try {
      const key = `audio-progress-${moduleId}-${idx}`;
      const value = localStorage.getItem(key);
      return value ? parseFloat(value) : 0;
    } catch {
      return 0;
    }
  }
  function setAudioProgress(moduleId: string, idx: number, time: number) {
    try {
      const key = `audio-progress-${moduleId}-${idx}`;
      localStorage.setItem(key, time.toString());
    } catch {}
  }

  // Listen for loadedmetadata to get duration and timeupdate for countdown
  useEffect(() => {
    audioRefs.current.forEach((audio, idx) => {
      if (audio) {
        const handleLoadedMetadata = () => {
          setDurations((prev) => {
            const next = [...prev];
            next[idx] = audio.duration;
            return next;
          });
          // Restore progress from localStorage
          const savedTime = getAudioProgress(moduleId, idx);
          if (savedTime > 0 && savedTime < audio.duration) {
            audio.currentTime = savedTime;
          }
        };
        const handleTimeUpdate = () => {
          setCurrentTimes((prev) => {
            const next = [...prev];
            next[idx] = audio.currentTime;
            return next;
          });
          // Save progress to localStorage
          setAudioProgress(moduleId, idx, audio.currentTime);
        };
        const handleEnded = () => {
          setPlaybackStates((prev) =>
            prev.map((s, i) => (i === idx ? "idle" : s))
          );
          // Sequential unlock: update lastCompletedIndex if this is the next in sequence
          setLastCompletedIndex((prev) => (idx === prev + 1 ? idx : prev));
          // Optionally clear progress on end
          setAudioProgress(moduleId, idx, 0);
        };
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);
        // If already loaded
        if (!isNaN(audio.duration) && audio.duration > 0) {
          setDurations((prev) => {
            const next = [...prev];
            next[idx] = audio.duration;
            return next;
          });
          // Restore progress from localStorage
          const savedTime = getAudioProgress(moduleId, idx);
          if (savedTime > 0 && savedTime < audio.duration) {
            audio.currentTime = savedTime;
          }
        }
        // Cleanup
        return () => {
          audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
          audio.removeEventListener("timeupdate", handleTimeUpdate);
          audio.removeEventListener("ended", handleEnded);
        };
      }
    });
  }, [audioItems]);

  // Create refs for each audio element
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  const handlePlay = (idx: number) => {
    if (idx > lastCompletedIndex + 1) return; // Prevent playing locked audios
    const audio = audioRefs.current[idx];
    if (audio) {
      audio.play();
      setPlaybackStates((prev) =>
        prev.map((s, i) => (i === idx ? "playing" : "idle"))
      );
      setExpandedItems((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
    }
  };

  const handlePause = (idx: number) => {
    const audio = audioRefs.current[idx];
    if (audio) {
      audio.pause();
      setPlaybackStates((prev) =>
        prev.map((s, i) => (i === idx ? "paused" : s))
      );
    }
  };

  const handleStop = (idx: number) => {
    const audio = audioRefs.current[idx];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setPlaybackStates((prev) => prev.map((s, i) => (i === idx ? "idle" : s)));
    }
  };

  // Remove duplicate audio items by title
  const uniqueAudioItems = audioItems.filter(
    (item, idx, arr) => arr.findIndex((i) => i.title === item.title) === idx
  );

  return (
    <div>
      <h1 className="text-2xl  md:text-3xl font-bold text-gray-900 mb-8">
        Module 2: Audio Sessions
      </h1>
      {loading ? (
        <p className="text-gray-500">Loading audio items...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <div className="space-y-3">
            {uniqueAudioItems.map((item, idx) => (
              <Card
                key={`${item.item_number}-${idx}`}
                className="hover:shadow-md transition-shadow rounded-lg"
              >
                <CardContent className="py-1 px-2 md:p-4 flex flex-col md:flex-row md:items-center md:justify-between min-h-0">
                  <div className="flex items-center gap-2 md:gap-4 w-full min-h-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-h-0">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                        {item.title}
                      </h3>
                      {item.duration && (
                        <p className="text-xs text-gray-500">{item.duration}</p>
                      )}
                      {/* Mobile controls under title, smaller and tighter */}
                      <div className="flex gap-1 mt-1 md:hidden">
                        <Button
                          size="icon"
                          className={
                            `h-7 w-7 p-0 hover:bg-blue-700 ` +
                            (playbackStates[idx] === "playing"
                              ? "bg-green-600"
                              : "bg-blue-600")
                          }
                          onClick={() => handlePlay(idx)}
                          disabled={idx > lastCompletedIndex + 1}
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className={
                            `h-7 w-7 p-0 ` +
                            (playbackStates[idx] === "paused"
                              ? "bg-green-600"
                              : "")
                          }
                          onClick={() => handlePause(idx)}
                          disabled={idx > lastCompletedIndex + 1}
                        >
                          <Pause className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() => handleStop(idx)}
                          disabled={idx > lastCompletedIndex + 1}
                        >
                          <StopCircle className="w-3 h-3" />
                        </Button>
                      </div>
                      <audio
                        ref={(el) => {
                          audioRefs.current[idx] = el;
                        }}
                        src={item.content}
                        className="mt-1 w-44 md:w-64"
                        controls
                        style={{ display: "none" }}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Duration: {formatDuration(durations[idx])}
                        {durations[idx] > 0 && (
                          <>
                            {" | "}
                            Remaining:{" "}
                            {formatDuration(
                              Math.max(0, durations[idx] - currentTimes[idx])
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Desktop controls on the right */}
                  <div className="hidden md:flex gap-2 items-center">
                    {playbackStates[idx] === "playing" && lottieData && (
                      <div className="flex items-center justify-center">
                        <Lottie
                          animationData={lottieData}
                          loop
                          autoplay
                          style={{ width: 60, height: 60 }}
                          className="md:w-[320px]! md:h-[50px]!"
                        />
                      </div>
                    )}
                    <Button
                      size="icon"
                      className={
                        `hover:bg-blue-700 ` +
                        (playbackStates[idx] === "playing"
                          ? "bg-green-600"
                          : "bg-blue-600")
                      }
                      onClick={() => handlePlay(idx)}
                      disabled={idx > lastCompletedIndex + 1}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className={
                        playbackStates[idx] === "paused" ? "bg-green-600" : ""
                      }
                      onClick={() => handlePause(idx)}
                      disabled={idx > lastCompletedIndex + 1}
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleStop(idx)}
                      disabled={idx > lastCompletedIndex + 1}
                    >
                      <StopCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Next button outside the cards, only show if all audio cards are played (opened) */}
          <div className="flex justify-end mt-6 gap-4">
            <button
              className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50"
              disabled={
                !(
                  audioItems.length > 0 &&
                  audioItems.every((_, idx) => expandedItems.includes(idx))
                )
              }
              onClick={async () => {
                if (!user) return;
                // Mark module2 as completed in Supabase
                await supabase.from("module_progress").upsert({
                  user_id: user.id,
                  module_id: "module2",
                  completed: true,
                });
              }}
            >
              Mark as Complete
            </button>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
              disabled={
                !(
                  audioItems.length > 0 &&
                  audioItems.every((_, idx) => expandedItems.includes(idx))
                )
              }
              onClick={async () => {
                if (!user) return;
                // Mark module2 as completed in Supabase
                await supabase.from("module_progress").upsert({
                  user_id: user.id,
                  module_id: "module2",
                  completed: true,
                });
                if (typeof window !== "undefined") {
                  window.location.href = "/dashboard/module3";
                }
              }}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
