"use client";

import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface AdSlide {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  targetUrl: string | null;
}

interface VendorStoryGroup {
  vendorId: string;
  vendorName: string;
  vendorLogo: string | null;
  slides: AdSlide[];
}

interface SponsorStoriesProps {
  ads: VendorStoryGroup[];
}

export default function SponsorStories({ ads }: SponsorStoriesProps) {
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [viewedVendorIds, setViewedVendorIds] = useState<string[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(10000); // 10 seconds per slide
  const touchStartY = useRef<number>(0);

  // Load viewed stories from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("mealit_viewed_stories");
      if (stored) {
        setViewedVendorIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load viewed stories from localStorage", e);
    }
  }, []);

  // Save viewed stories to localStorage
  const markAsViewed = (vendorId: string) => {
    if (!viewedVendorIds.includes(vendorId)) {
      const updated = [...viewedVendorIds, vendorId];
      setViewedVendorIds(updated);
      try {
        localStorage.setItem("mealit_viewed_stories", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save viewed stories to localStorage", e);
      }
    }
  };

  // Timer loop logic
  useEffect(() => {
    if (activeGroupIndex === null) {
      setProgress(0);
      return;
    }

    const currentGroup = ads[activeGroupIndex];
    if (currentGroup) {
      markAsViewed(currentGroup.vendorId);
    }

    if (isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Calculate remaining time
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
      return;
    }

    startTimeRef.current = Date.now();
    const intervalTime = 50; // Update progress bar every 50ms for smooth rendering
    const totalDuration = 10000; // 10 seconds

    timerRef.current = setInterval(() => {
      const elapsedSinceStart = Date.now() - startTimeRef.current;
      const totalElapsed = (totalDuration - remainingTimeRef.current) + elapsedSinceStart;
      const pct = Math.min(100, (totalElapsed / totalDuration) * 100);

      setProgress(pct);

      if (totalElapsed >= totalDuration) {
        handleNext();
      }
    }, intervalTime);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeGroupIndex, activeSlideIndex, isPaused]);

  // Reset timer values when slide or group changes
  useEffect(() => {
    setProgress(0);
    remainingTimeRef.current = 10000;
  }, [activeGroupIndex, activeSlideIndex]);

  const handleOpen = (index: number) => {
    setActiveGroupIndex(index);
    setActiveSlideIndex(0);
    setIsPaused(false);
    remainingTimeRef.current = 10000;
  };

  const handleClose = () => {
    setActiveGroupIndex(null);
    setActiveSlideIndex(0);
    setProgress(0);
  };

  const handleNext = () => {
    if (activeGroupIndex === null) return;
    const currentGroup = ads[activeGroupIndex];
    
    if (activeSlideIndex < currentGroup.slides.length - 1) {
      setActiveSlideIndex(activeSlideIndex + 1);
    } else {
      // Completed all slides for this vendor
      markAsViewed(currentGroup.vendorId);
      if (activeGroupIndex < ads.length - 1) {
        setActiveGroupIndex(activeGroupIndex + 1);
        setActiveSlideIndex(0);
      } else {
        // Last vendor story finished
        handleClose();
      }
    }
  };

  const handlePrev = () => {
    if (activeGroupIndex === null) return;
    
    if (activeSlideIndex > 0) {
      setActiveSlideIndex(activeSlideIndex - 1);
    } else {
      // At first slide of current vendor
      if (activeGroupIndex > 0) {
        const prevGroupIndex = activeGroupIndex - 1;
        const prevGroup = ads[prevGroupIndex];
        setActiveGroupIndex(prevGroupIndex);
        setActiveSlideIndex(prevGroup.slides.length - 1);
      } else {
        // Restart current slide if it's the very first slide of the first vendor
        setProgress(0);
        remainingTimeRef.current = 10000;
        startTimeRef.current = Date.now();
      }
    }
  };

  // Hold-to-pause controls
  const handlePressStart = () => {
    setIsPaused(true);
  };

  const handlePressEnd = () => {
    setIsPaused(false);
  };

  // Swipe-to-close handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartY.current;
    
    setIsPaused(false);
    
    // Swipe down threshold: 120px
    if (deltaY > 120) {
      handleClose();
    }
  };

  if (ads.length === 0) return null;

  const currentGroup = activeGroupIndex !== null ? ads[activeGroupIndex] : null;
  const currentSlide = currentGroup ? currentGroup.slides[activeSlideIndex] : null;

  return (
    <section className="px-4 flex flex-col gap-3">
      {/* Title / Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-black text-[#0F5238] bg-[#B0F1CC] px-2.5 py-1 rounded-full uppercase tracking-wider">
          Sponsor Rekomendasi
        </span>
      </div>

      {/* Stories Horizontal Circle List */}
      <div className="flex gap-4 overflow-x-auto scrollbar-none py-2 px-1">
        {ads.map((group, index) => {
          const isViewed = viewedVendorIds.includes(group.vendorId);
          const vendorInitials = group.vendorName
            ? group.vendorName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
            : "VD";

          return (
            <button
              key={group.vendorId}
              onClick={() => handleOpen(index)}
              className="flex flex-col items-center gap-1.5 focus:outline-none flex-shrink-0 active:scale-95 transition-transform"
            >
              {/* Outer ring */}
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center p-[2px] transition-all duration-300 ${
                  isViewed
                    ? "border border-neutral-300 bg-transparent"
                    : "bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600"
                }`}
              >
                {/* Inner white gap / ring */}
                <div className="w-full h-full rounded-full bg-white p-[2px] flex items-center justify-center overflow-hidden">
                  {group.vendorLogo ? (
                    <img
                      src={group.vendorLogo}
                      alt={group.vendorName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center text-primary font-black text-sm">
                      {vendorInitials}
                    </div>
                  )}
                </div>
              </div>
              {/* Label */}
              <span className="text-[11px] font-bold text-[#191C1D] max-w-[68px] truncate text-center">
                {group.vendorName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fullscreen Story Viewer Modal */}
      {activeGroupIndex !== null && currentGroup && currentSlide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 md:bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
          {/* Main Story Card (aspect ratio 9:16 optimized for mobile) */}
          <div
            className="relative w-full h-[100dvh] md:max-w-[420px] md:h-[90vh] md:rounded-3xl overflow-hidden flex flex-col justify-between bg-zinc-950 shadow-2xl"
          >
            {/* Background Ad Image (Blurred Behind, Cover in Center) */}
            <div className="absolute inset-0 z-0 bg-cover bg-center filter blur-md opacity-30 scale-105"
              style={{ backgroundImage: `url(${currentSlide.imageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"})` }}
            />
            
            {/* Front Ad Image */}
            <div className="absolute inset-0 z-0 flex items-center justify-center">
              <img
                src={currentSlide.imageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"}
                alt={currentSlide.title}
                className="w-full h-full object-contain"
                draggable={false}
              />
              {/* Soft Gradient Overlay for better readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85" />
            </div>

            {/* Stories Interactive Navigation Overlays (Invisible click areas) */}
            <div 
              className="absolute inset-0 z-10 flex"
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Left Side Navigation (30% width) */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="w-[30%] h-full cursor-w-resize focus:outline-none"
                aria-label="Previous slide"
              />
              
              {/* Middle Pause Indicator Overlay (displays only when paused) */}
              <div 
                className="flex-1 h-full"
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
              />
              
              {/* Right Side Navigation (30% width) */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="w-[30%] h-full cursor-e-resize focus:outline-none"
                aria-label="Next slide"
              />
            </div>

            {/* Top UI Overlay (Controls, Vendor & Progress indicators) */}
            <div className="relative z-20 p-4 pt-5 flex flex-col gap-3 pointer-events-none">
              {/* Segmented Progress Bars */}
              <div className="flex gap-1.5 pointer-events-auto">
                {currentGroup.slides.map((slide, idx) => {
                  let fillWidth = "0%";
                  if (idx < activeSlideIndex) fillWidth = "100%";
                  else if (idx === activeSlideIndex) fillWidth = `${progress}%`;

                  return (
                    <div
                      key={slide.id}
                      className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
                    >
                      <div
                        className="h-full bg-white transition-all ease-linear"
                        style={{
                          width: fillWidth,
                          transitionDuration: idx === activeSlideIndex ? "50ms" : "0ms",
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Story Header (Vendor Info & Close button) */}
              <div className="flex justify-between items-center pointer-events-auto">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full border border-white/20 bg-white p-[1px] overflow-hidden shadow-inner flex-shrink-0">
                    {currentGroup.vendorLogo ? (
                      <img
                        src={currentGroup.vendorLogo || ""}
                        alt={currentGroup.vendorName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center text-primary font-bold text-xs">
                        {currentGroup.vendorName
                          ? groupInitials(currentGroup.vendorName)
                          : "VD"}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white drop-shadow-md">
                      {currentGroup.vendorName}
                    </span>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest drop-shadow-sm">
                      Sponsor
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-black/40 text-white/90 flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all outline-none"
                  aria-label="Close stories"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Bottom UI Overlay (Ad Details & CTA) */}
            <div className="relative z-20 p-6 pb-12 pb-[calc(2rem+env(safe-area-inset-bottom))] flex flex-col gap-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-auto">
              <div className="flex flex-col gap-1.5 text-white">
                <h3 className="text-xl font-extrabold tracking-tight leading-tight drop-shadow">
                  {currentSlide.title}
                </h3>
                {currentSlide.description && (
                  <p className="text-sm font-medium text-white/80 leading-relaxed drop-shadow-sm line-clamp-3">
                    {currentSlide.description}
                  </p>
                )}
              </div>

              {/* Call to Action Button */}
              {currentSlide.targetUrl && (
                <a
                  href={currentSlide.targetUrl || "#"}
                  className="w-full bg-[#B0F1CC] hover:bg-[#97e9b7] text-[#0F5238] font-black py-4.5 rounded-2xl text-center shadow-xl active:scale-[0.98] transition-all text-sm uppercase tracking-wider"
                >
                  Kunjungi Vendor
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Helper to get initials
function groupInitials(name: string) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}
