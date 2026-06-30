"use client";

import React from "react";
import { Download, Sparkles, X } from "lucide-react";
import { usePwa } from "@/components/providers/PwaProvider";
import Button from "@/components/ui/Button";

export default function PwaInstallButton() {
  const { isInstallable, installApp } = usePwa();
  const [dismissed, setDismissed] = React.useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <div className="mx-4 p-5 bg-gradient-to-br from-[#0F5238] to-[#0A3522] rounded-3xl text-white relative overflow-hidden shadow-lg shadow-[#0F5238]/15 border border-[#0F5238]/20 animate-fade-in group">
      {/* Abstract circles design */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full blur-lg group-hover:scale-115 transition-transform duration-500" />

      {/* Dismiss Button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/80 hover:text-white"
        aria-label="Dismiss banner"
      >
        <X size={14} />
      </button>

      <div className="flex gap-4">
        {/* Visual indicator */}
        <div className="p-3 bg-white/10 rounded-2xl self-start flex-shrink-0 backdrop-blur-md">
          <Sparkles size={20} className="text-amber-300 animate-pulse" />
        </div>

        <div className="flex-1 pr-6 text-left">
          <h4 className="text-sm font-black tracking-tight">Pasang MEALIT App</h4>
          <p className="text-[11px] text-white/80 mt-1 leading-relaxed">
            Pasang MEALIT di layar utama HP atau komputer Anda untuk akses lebih cepat, fitur offline, dan notifikasi jadwal makan secara langsung!
          </p>

          <div className="mt-4 flex gap-2">
            <Button
              onClick={installApp}
              size="sm"
              className="bg-white hover:bg-white/95 text-[#0F5238] font-bold py-1.5 px-4 rounded-xl flex items-center gap-1.5 transition-all text-[11px] shadow-md shadow-black/5"
            >
              <Download size={12} strokeWidth={3} />
              Install Sekarang
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
