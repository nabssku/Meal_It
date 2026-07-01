"use client";

import React, { useState, useEffect } from "react";
import { Clock, Plus, Check, Bell } from "lucide-react";
import Link from "next/link";
import MealPlanCardWithStatus from "@/components/cards/MealPlanCardWithStatus";

interface MealScheduleReminderProps {
  todayMeals: any[];
}

const MEAL_SLOTS = [
  {
    key: "BREAKFAST",
    label: "Sarapan",
    time: "07:00",
    activeStart: 6,   // 06:00
    activeEnd: 10,   // 10:00
  },
  {
    key: "LUNCH",
    label: "Makan Siang",
    time: "12:00",
    activeStart: 11,  // 11:00
    activeEnd: 15,  // 15:00
  },
  {
    key: "DINNER",
    label: "Makan Malam",
    time: "20:00",
    activeStart: 18,  // 18:00
    activeEnd: 22,  // 22:00
  },
];

export default function MealScheduleReminder({ todayMeals }: MealScheduleReminderProps) {
  const [currentHour, setCurrentHour] = useState<number | null>(null);

  useEffect(() => {
    // Get local hours on client-side mount
    const now = new Date();
    setCurrentHour(now.getHours());

    // Update hourly if the user stays on the page
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000 * 5); // check every 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Helper to determine status of slot: 'past', 'active', 'future'
  const getSlotStatus = (slot: typeof MEAL_SLOTS[0]) => {
    if (currentHour === null) return "future"; // Default during SSR / before mount

    if (currentHour >= slot.activeStart && currentHour < slot.activeEnd) {
      return "active";
    }
    if (currentHour >= slot.activeEnd) {
      return "past";
    }
    return "future";
  };

  // Find active slot name to display in the header banner
  const activeSlot = MEAL_SLOTS.find(s => {
    if (currentHour === null) return false;
    return currentHour >= s.activeStart && currentHour < s.activeEnd;
  });

  const getBannerContent = () => {
    if (currentHour === null) return null;

    if (activeSlot) {
      return (
        <div className="p-3 bg-primary/5 border border-primary/10 rounded-2xl text-xs text-primary font-medium flex items-center gap-2.5 animate-in fade-in duration-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff9f1c] animate-ping flex-shrink-0" />
          <span>
            Saat ini: Waktu <strong>{activeSlot.label}</strong> ({activeSlot.time}). Jangan lupa konsumsi makanan bernutrisi sesuai rencana Anda!
          </span>
        </div>
      );
    }

    // Determine the next upcoming meal
    if (currentHour < 6) {
      const nextSlot = MEAL_SLOTS[0]; // BREAKFAST
      return (
        <div className="p-3 bg-[#F3F4F5]/60 border border-[#E8EAF0] rounded-2xl text-xs text-muted-foreground font-medium flex items-center gap-2.5 animate-in fade-in duration-300">
          <span className="w-2 h-2 rounded-full bg-[#9CA3AF] flex-shrink-0" />
          <span>
            Persiapkan menu Anda! Jadwal makan berikutnya adalah <strong>{nextSlot.label}</strong> pada jam <strong>{nextSlot.time}</strong>.
          </span>
        </div>
      );
    }
    if (currentHour >= 10 && currentHour < 11) {
      const nextSlot = MEAL_SLOTS[1]; // LUNCH
      return (
        <div className="p-3 bg-[#F3F4F5]/60 border border-[#E8EAF0] rounded-2xl text-xs text-muted-foreground font-medium flex items-center gap-2.5 animate-in fade-in duration-300">
          <span className="w-2 h-2 rounded-full bg-[#9CA3AF] flex-shrink-0" />
          <span>
            Bersiaplah! Jadwal makan berikutnya adalah <strong>{nextSlot.label}</strong> pada jam <strong>{nextSlot.time}</strong>.
          </span>
        </div>
      );
    }
    if (currentHour >= 15 && currentHour < 18) {
      const nextSlot = MEAL_SLOTS[2]; // DINNER
      return (
        <div className="p-3 bg-[#F3F4F5]/60 border border-[#E8EAF0] rounded-2xl text-xs text-muted-foreground font-medium flex items-center gap-2.5 animate-in fade-in duration-300">
          <span className="w-2 h-2 rounded-full bg-[#9CA3AF] flex-shrink-0" />
          <span>
            Bersiaplah! Jadwal makan berikutnya adalah <strong>{nextSlot.label}</strong> pada jam <strong>{nextSlot.time}</strong>.
          </span>
        </div>
      );
    }
    return (
      <div className="p-3 bg-[#F3F4F5]/60 border border-[#E8EAF0] rounded-2xl text-xs text-muted-foreground font-medium flex items-center gap-2.5 animate-in fade-in duration-300">
        <span className="w-2 h-2 rounded-full bg-[#9CA3AF] flex-shrink-0" />
        <span>Semua jadwal makan hari ini telah selesai. Istirahat yang cukup dan bersiap untuk menu esok hari!</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 px-4">
      {/* Banner / Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-foreground text-lg flex items-center gap-2">
            <Bell size={18} className="text-primary" />
            Jadwal Makan Hari Ini
          </h2>
          <Link href="/history" className="text-xs font-bold text-primary hover:underline">
            Riwayat
          </Link>
        </div>
        
        {getBannerContent()}
      </div>

      {/* Timeline List */}
      <div className="flex flex-col">
        {MEAL_SLOTS.map((slot, index) => {
          const meal = todayMeals.find((m) => m.time === slot.key);
          const status = getSlotStatus(slot);
          const isLast = index === MEAL_SLOTS.length - 1;

          // Define styling based on status
          let dotColor = "border-[#C8CAD0] bg-white";
          let textColor = "text-muted-foreground";
          let timeColor = "text-[#6B7280]";
          let lineColor = "bg-border/40";
          let highlightRing = "";

          if (status === "past") {
            dotColor = "bg-primary border-primary text-white";
            lineColor = "bg-primary"; // Completed timeline path is green
            textColor = "text-muted-foreground";
            timeColor = "text-[#6B7280]";
          } else if (status === "active") {
            dotColor = "bg-white border-[#ff9f1c]";
            textColor = "text-foreground font-black";
            timeColor = "text-primary font-black";
            highlightRing = "ring-4 ring-primary/15 shadow-[0_0_15px_rgba(15,82,56,0.15)]";
          }

          return (
            <div key={slot.key} className="flex gap-4 items-stretch">
              {/* Left Column: Time & Meal Label */}
              <div className="w-16 flex-shrink-0 flex flex-col pt-3 items-end text-right">
                <span className={`text-sm font-black tracking-tight leading-none ${timeColor}`}>
                  {slot.time}
                </span>
                <span className={`text-[10px] mt-1 font-bold tracking-wide uppercase ${textColor}`}>
                  {slot.label}
                </span>
              </div>

              {/* Middle Column: Timeline Dot and Line */}
              <div className="flex flex-col items-center flex-shrink-0 pt-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10 ${dotColor} ${highlightRing}`}
                >
                  {status === "past" && <Check size={10} className="stroke-[3]" />}
                  {status === "active" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff9f1c] animate-pulse" />
                  )}
                </div>
                {/* Connecting Line */}
                {!isLast && (
                  <div className={`w-0.5 flex-grow my-1 transition-colors duration-500 ${lineColor}`} />
                )}
              </div>

              {/* Right Column: Meal Card or Placeholder */}
              <div className="flex-1 pb-6">
                <div className={`transition-all duration-300 ${status === "active" ? "scale-[1.01]" : ""}`}>
                  {meal ? (
                    <MealPlanCardWithStatus {...meal} />
                  ) : (
                    <div
                      className={`flex items-center justify-between p-4 bg-white border border-dashed border-[#C8CAD0] rounded-3xl hover:border-primary/50 transition-all duration-300 group ${
                        status === "active" ? "border-primary/40 bg-primary/[0.01]" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-muted/40 text-muted-foreground rounded-2xl group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                          <Clock size={16} />
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-foreground">Belum Ada Menu</h4>
                          <p className="text-[10px] text-muted-foreground">Rencanakan {slot.label.toLowerCase()} Anda</p>
                        </div>
                      </div>
                      <Link
                        href="/meal-planner"
                        className="flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-all active:scale-95"
                      >
                        <Plus size={10} />
                        Tambah
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
