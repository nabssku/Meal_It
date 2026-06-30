"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, RotateCw, Heart, Info, DollarSign } from "lucide-react";
import Button from "@/components/ui/Button";

const OFFLINE_TIPS = [
  {
    icon: Heart,
    title: "Tetap Terhidrasi",
    desc: "Minum air putih minimal 2 liter sehari sangat penting untuk menjaga fokus dan energi Anda.",
  },
  {
    icon: DollarSign,
    title: "Hemat Sembari Sehat",
    desc: "Belanja bahan baku lokal seperti tempe, tahu, dan telur untuk sumber protein berkualitas tinggi yang terjangkau.",
  },
  {
    icon: Info,
    title: "Persiapan Makan (Meal Prep)",
    desc: "Mempersiapkan bahan masakan di akhir pekan membantu menghemat waktu dan menekan pengeluaran mingguan.",
  },
];

export default function OfflinePage() {
  const [checking, setChecking] = useState(false);
  const [randomTip, setRandomTip] = useState({ title: "", desc: "", icon: Heart });

  useEffect(() => {
    // Select a random offline tip on mount
    const tip = OFFLINE_TIPS[Math.floor(Math.random() * OFFLINE_TIPS.length)];
    setRandomTip(tip as any);
  }, []);

  const handleRetry = () => {
    setChecking(true);
    if (typeof window !== "undefined") {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        // Simulate checking delay
        setTimeout(() => {
          setChecking(false);
        }, 1000);
      }
    }
  };

  const IconComponent = randomTip.icon;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] justify-center items-center px-6 py-12 text-center">
      {/* Visual illustration wrapper */}
      <div className="flex flex-col items-center max-w-md w-full bg-white rounded-3xl border border-[#E1E3E4] p-8 shadow-sm">
        {/* Connection Off Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-6 animate-pulse">
          <WifiOff size={32} />
        </div>

        <h1 className="text-2xl font-black text-[#191C1D] tracking-tight">
          Koneksi Terputus
        </h1>
        
        <p className="text-sm text-[#707973] font-medium mt-2 leading-relaxed">
          MEALIT tidak dapat memuat halaman karena Anda sedang offline. Silakan periksa koneksi internet Anda dan coba lagi.
        </p>

        {/* Action Button */}
        <div className="mt-8 w-full">
          <Button
            onClick={handleRetry}
            disabled={checking}
            size="full"
            className="bg-[#0F5238] hover:bg-[#0A3522] text-white font-bold h-14 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md shadow-primary/10"
          >
            <RotateCw size={18} className={checking ? "animate-spin" : ""} />
            {checking ? "Memeriksa..." : "Coba Lagi"}
          </Button>
        </div>
      </div>

      {/* Dynamic Offline Tips (Keep user engaged) */}
      <div className="mt-8 max-w-md w-full text-left px-4">
        <p className="text-xs font-bold text-[#707973] uppercase tracking-widest ml-1 mb-3">
          Tahukah Anda?
        </p>
        <div className="bg-white border border-[#E1E3E4] rounded-2xl p-5 flex gap-4 shadow-sm">
          <div className="p-3 bg-[#0F5238]/5 text-[#0F5238] rounded-xl self-start">
            <IconComponent size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#191C1D]">
              {randomTip.title}
            </h4>
            <p className="text-xs text-[#707973] mt-1 leading-relaxed">
              {randomTip.desc}
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-16">
        <p className="text-[10px] text-center text-[#707973]/50 uppercase tracking-widest font-black">
          MEALIT Offline Mode
        </p>
      </footer>
    </div>
  );
}
