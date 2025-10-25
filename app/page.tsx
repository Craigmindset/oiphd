"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HeroLanding() {
  const router = useRouter();
  return (
    <section className="relative flex items-center justify-center min-h-screen bg-center bg-cover overflow-hidden">
      {/* Video background */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://8o3gf6lyvdahyrkc.public.blob.vercel-storage.com/An%20Evening%20with%20Jesus%20%28AEJ%29%20Onikan%20Stadium%20_%208th%20Nov.%202025%20__%20Prophet%20Isaiah%20Macwealth.mp4"
        autoPlay
        loop
        muted
        playsInline
        poster="/crusade-1.jpg"
      >
        <source
          src="https://8o3gf6lyvdahyrkc.public.blob.vercel-storage.com/An%20Evening%20with%20Jesus%20%28AEJ%29%20Onikan%20Stadium%20_%208th%20Nov.%202025%20__%20Prophet%20Isaiah%20Macwealth.mp4"
          type="video/mp4"
        />
        <img
          src="/crusade-1.jpg"
          alt="Crusade event"
          className="w-full h-full object-cover"
        />
      </video>
      {/* dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/50 z-10" />

      <div className="relative z-20 text-center px-6">
        <h1 className="text-white font-extrabold text-4xl sm:text-5xl md:text-6xl leading-tight">
          AN EVENING WITH JESUS
        </h1>
        <h2 className="text-white font-extrabold text-3xl sm:text-3xl md:text-4xl leading-tight">
          ONIKAN STADIUM | 8TH NOVEMBER 2025
        </h2>

        <p className="mt-5 text-white/90 text-base sm:text-lg max-w-xl mx-auto">
          Healings | Miracles | Wonders
        </p>

        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            className="border-2 border-white text-white bg-transparent hover:bg-white/10 px-6 py-2 text-base rounded-md transition"
            onClick={() => router.push("/login")}
          >
            BEGIN FAITH CLASS
          </Button>
        </div>
      </div>
    </section>
  );
}
