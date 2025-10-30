"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, StopCircle, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export function Prayers() {
  const audioItems = [
    {
      title: "Mass Prayer",
      url: "https://res.cloudinary.com/dwmrhd0xl/video/upload/v1761744278/mass_prayer_audio_oadml0.mp3",
    },
  ];

  const [playbackStates, setPlaybackStates] = useState<
    ("idle" | "playing" | "paused")[]
  >(audioItems.map(() => "idle"));
  const [durations, setDurations] = useState<number[]>(audioItems.map(() => 0));
  const [currentTimes, setCurrentTimes] = useState<number[]>(
    audioItems.map(() => 0)
  );
  const [showModal, setShowModal] = useState(false);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  // Cleanup on unmount - stop all audio
  useEffect(() => {
    return () => {
      audioRefs.current.forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);

  // Listen for audio metadata and time updates
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    audioRefs.current.forEach((audio, idx) => {
      if (audio) {
        const handleLoadedMetadata = () => {
          setDurations((prev) => {
            const next = [...prev];
            next[idx] = audio.duration;
            return next;
          });
        };
        const handleTimeUpdate = () => {
          setCurrentTimes((prev) => {
            const next = [...prev];
            next[idx] = audio.currentTime;
            return next;
          });
        };
        const handleEnded = () => {
          setPlaybackStates((prev) =>
            prev.map((s, i) => (i === idx ? "idle" : s))
          );
          setShowModal(false);
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
        }

        // Store cleanup function
        cleanupFunctions.push(() => {
          audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
          audio.removeEventListener("timeupdate", handleTimeUpdate);
          audio.removeEventListener("ended", handleEnded);
        });
      }
    });

    // Cleanup all event listeners
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, []);

  const handlePlay = (idx: number) => {
    const audio = audioRefs.current[idx];
    if (audio) {
      audio.play();
      setPlaybackStates((prev) =>
        prev.map((s, i) => (i === idx ? "playing" : s))
      );
      setShowModal(true);
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
      setShowModal(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="relative">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Prayer Session</h1>

      {/* Header Message */}
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg">
        <p className="text-base md:text-lg text-gray-800 leading-relaxed mb-3">
          <span className="font-semibold text-blue-900">
            Open up your heart in faith
          </span>{" "}
          as you receive these powerful declarations from the prophet of God.
        </p>
        <p className="text-base md:text-lg text-gray-800 leading-relaxed">
          As you engage these words of prayer,{" "}
          <span className="font-semibold text-blue-900">
            receive your healing, breakthrough, and deliverance
          </span>{" "}
          in the name of Jesus!
        </p>
      </div>

      <div className="space-y-4">
        {audioItems.map((item, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
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
                    <h3 className="font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDuration(currentTimes[idx])} /{" "}
                      {formatDuration(durations[idx])}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handlePlay(idx)}
                    disabled={playbackStates[idx] === "playing"}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handlePause(idx)}
                    disabled={playbackStates[idx] !== "playing"}
                  >
                    <Pause className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleStop(idx)}
                  >
                    <StopCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      durations[idx] > 0
                        ? (currentTimes[idx] / durations[idx]) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>

              {/* Hidden audio element */}
              <audio
                ref={(el) => {
                  audioRefs.current[idx] = el;
                }}
                src={item.url}
                preload="metadata"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Prayer Image Modal - Only renders when showModal is true */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>

            {/* Prayer Image - Desktop */}
            <img
              src="/Prayer Image.jpg"
              alt="Prayer"
              className="hidden md:block w-full h-auto"
            />

            {/* Prayer Image - Mobile */}
            <img
              src="/prayer-mobile.jpg"
              alt="Prayer"
              className="block md:hidden w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
