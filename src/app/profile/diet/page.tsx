"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Zap, Flame, Target } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { updateDiet } from "@/app/actions/user-actions";

export default function DietPreferencePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState("weight_loss");

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateDiet({ bodyGoal: goal });
      router.back();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border/50">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-primary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Preferensi Diet</h1>
      </header>

      <main className="flex-1 p-6 space-y-8">
        <section className="space-y-4">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Goal Utama</label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: "weight_loss", label: "Turun Berat Badan", icon: Target, sub: "Defisit kalori terkontrol" },
              { id: "muscle_gain", label: "Tambah Massa Otot", icon: Zap, sub: "Surplus kalori & tinggi protein" },
              { id: "maintaining", label: "Menjaga Berat Badan", icon: Flame, sub: "Kalori harian seimbang" },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setGoal(item.id)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                  goal === item.id 
                    ? "bg-primary border-primary shadow-lg shadow-primary/20" 
                    : "bg-muted/30 border-border/50 hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-xl transition-colors",
                  goal === item.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                )}>
                  <item.icon size={20} />
                </div>
                <div className="flex-1">
                  <div className={cn("text-sm font-bold", goal === item.id ? "text-white" : "text-foreground")}>
                    {item.label}
                  </div>
                  <div className={cn("text-[10px] uppercase font-bold tracking-wider opacity-60", goal === item.id ? "text-white" : "text-muted-foreground")}>
                    {item.sub}
                  </div>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  goal === item.id ? "border-white bg-white" : "border-muted-foreground/30"
                )}>
                  {goal === item.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Target Nutrisi Harian</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 p-5 rounded-[24px] border border-border/50 space-y-2">
              <div className="p-2 bg-orange-100 text-orange-600 w-fit rounded-lg">
                <Flame size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Target Energi</div>
                <div className="text-xl font-black text-foreground">1,800 <span className="text-xs font-bold opacity-40">kcal</span></div>
              </div>
            </div>
            <div className="bg-muted/30 p-5 rounded-[24px] border border-border/50 space-y-2">
              <div className="p-2 bg-blue-100 text-blue-600 w-fit rounded-lg">
                <Zap size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Target Protein</div>
                <div className="text-xl font-black text-foreground">120 <span className="text-xs font-bold opacity-40">g</span></div>
              </div>
            </div>
          </div>
          <button className="w-full py-4 text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 rounded-xl border border-primary/20">
            Kalkulasi Ulang Berdasarkan BMI
          </button>
        </section>
      </main>

      <footer className="p-6 bg-background/80 backdrop-blur-md border-t border-border/50 sticky bottom-0">
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full h-14 rounded-2xl shadow-lg shadow-primary/20 flex gap-2 font-bold"
        >
          {loading ? "Menyimpan..." : (
            <>
              <Save size={20} />
              Simpan Konfigurasi
            </>
          )}
        </Button>
      </footer>
    </div>
  );
}
