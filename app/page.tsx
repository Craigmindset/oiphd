"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/slide1.jpg",
    header: " THE MASTER JESUS STILL HEALS TODAY.",
    subheader: "Experience His touch today",
    description: "",
  },
  {
    image: "/slide2.jpg",
    header: "YOU CAN BE FREE, HEALED AND DELIVERED",
    subheader: "Receive the touch of Master Jesus!",
    description: "",
  },
  {
    image: "/slide3.jpg",
    header: "THE TRUTH SHALL MAKE YOU FREE!",
    subheader: "Receive your Miracle today!",
    description: "",
  },
  {
    image: "/crusade-1.jpg",
    header: "AN EVENING WITH JESUS",
    subheader: "ONIKAN STADIUM | 8TH NOVEMBER 2025",
    description: "Healings | Miracles | Wonders",
  },
];

export default function HeroLanding() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentSlide(index);
  };

  return (
    <section className="relative flex items-center justify-center min-h-screen bg-center bg-cover overflow-hidden">
      {/* Video Background - Mobile Only */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0 md:hidden"
        src="https://res.cloudinary.com/dwmrhd0xl/video/upload/v1761778630/An_Evening_with_Jesus_AEJ_Onikan_Stadium___8th_Nov._2025____Prophet_Isaiah_Macwealth_b6kypf.mp4"
        autoPlay
        loop
        muted
        playsInline
        poster="/crusade-1.jpg"
      />

      {/* Slider Images - Desktop Only */}
      <div className="hidden md:block absolute inset-0 w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100 z-0" : "opacity-0 z-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.header}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/50 z-10" />

      {/* Content */}
      <div className="relative z-20 text-center px-6">
        {/* Mobile Content - Static for video */}
        <h1 className="text-white font-extrabold text-4xl sm:text-5xl leading-tight animate-fade-in md:hidden">
          AN EVENING WITH JESUS
        </h1>
        <h2 className="text-white font-extrabold text-2xl sm:text-3xl leading-tight mt-4 animate-fade-in md:hidden">
          ONIKAN STADIUM | 8TH NOVEMBER 2025
        </h2>
        <p className="mt-5 text-white/90 text-base sm:text-lg max-w-xl mx-auto animate-fade-in md:hidden">
          Healings | Miracles | Wonders
        </p>

        {/* Desktop Content - Dynamic from slider */}
        <h1 className="hidden md:block text-white font-extrabold text-4xl sm:text-5xl md:text-4xl leading-tight animate-fade-in">
          {slides[currentSlide].header}
        </h1>
        <h2 className="hidden md:block text-white font-extrabold text-3xl sm:text-3xl md:text-4xl leading-tight mt-4 animate-fade-in">
          {slides[currentSlide].subheader}
        </h2>
        <p className="hidden md:block mt-5 text-white/90 text-base sm:text-lg max-w-xl mx-auto animate-fade-in">
          {slides[currentSlide].description}
        </p>

        <div className="mt-8 flex justify-center animate-fade-in">
          <Button
            variant="outline"
            className="border-2 border-white text-white bg-transparent hover:bg-white/10 px-6 py-2 text-base rounded-md transition"
            onClick={() => router.push("/login")}
          >
            BEGIN HERE
          </Button>
        </div>
      </div>

      {/* Dots Indicator - Desktop Only */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-20 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
