"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { Sparkles, Wallet, Target, ChevronRight, Zap } from "lucide-react";
import MealPlanCard from "@/components/cards/MealPlanCard";

export default function MealPlannerPage() {
  const [budget, setBudget] = useState(50000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasResult(true);
    }, 1500);
  };

  const dummyResult = [
    {
      time: "Sarapan",
      name: "Salad Buah Yogurt",
      calories: 280,
      protein: 8,
      price: 12000,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200",
    },
    {
      time: "Makan Siang",
      name: "Gado-gado Komplit",
      calories: 450,
      protein: 18,
      price: 18000,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=200",
    },
    {
      time: "Makan Malam",
      name: "Sup Ayam Jahe",
      calories: 320,
      protein: 28,
      price: 20000,
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=200",
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary">AI Meal Planner</h1>
        <p className="text-sm text-text-muted">Susun menu harian yang sehat & ekonomis.</p>
      </header>

      {!hasResult ? (
        <section className="flex flex-col gap-6">
          <div className="card-premium p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-primary">
              <Wallet size={20} />
              <span className="font-bold">Budget Harian</span>
            </div>
            <div className="flex flex-col gap-4">
              <input 
                type="range" 
                min="30000" 
                max="150000" 
                step="5000" 
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full accent-primary h-2 bg-muted rounded-full appearance-none"
              />
              <div className="text-2xl font-bold text-center text-text-primary">
                Rp {budget.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          <div className="card-premium p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-primary">
              <Target size={20} />
              <span className="font-bold">Target Diet</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 rounded-xl border-2 border-primary bg-primary/5 text-primary text-xs font-bold font-sans">Turunkan Berat</button>
              <button className="p-3 rounded-xl border-2 border-border text-text-muted text-xs font-sans">Tambah Otot</button>
            </div>
          </div>

          <Button 
            size="lg" 
            className="w-full shadow-lg shadow-primary/20" 
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? "Menganalisa..." : "Generate Meal Plan"}
            {!isGenerating && <Sparkles size={18} className="ml-2" />}
          </Button>
        </section>
      ) : (
        <section className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center bg-success/10 p-4 rounded-xl text-success border border-success/20">
            <div className="flex items-center gap-2">
                <Zap size={18} />
                <span className="text-sm font-bold">Rekomendasi Berhasil Dibuat!</span>
            </div>
            <button onClick={() => setHasResult(false)} className="text-[10px] font-bold underline">Ubah</button>
          </div>

          <div className="flex flex-col gap-3">
            {dummyResult.map((meal, index) => (
              <MealPlanCard key={index} {...meal} />
            ))}
          </div>

          <div className="card-premium p-4 flex flex-col gap-2 bg-budget/5 border-budget/20">
            <div className="flex justify-between items-center text-xs font-bold">
               <span className="text-text-muted">Total Nutrisi</span>
               <span className="text-budget">Detail Budget</span>
            </div>
            <div className="flex justify-between items-end">
                <div className="flex gap-4">
                     <div className="flex flex-col">
                        <span className="text-xs text-text-muted uppercase text-[8px] font-bold">Kalori</span>
                        <span className="text-lg font-bold text-text-primary">1.050</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-xs text-text-muted uppercase text-[8px] font-bold">Protein</span>
                        <span className="text-lg font-bold text-text-primary">54g</span>
                     </div>
                </div>
                <div className="text-right">
                    <span className="text-[8px] text-text-muted uppercase font-bold block">Total Harga</span>
                    <span className="text-xl font-bold text-budget">Rp 50.000</span>
                </div>
            </div>
          </div>

          <Button size="lg" className="w-full">Pesan Sekarang</Button>
          <Button variant="outline" size="lg" className="w-full">Simpan ke Jadwal</Button>
        </section>
      )}

      <footer className="mt-4 p-4 bg-muted rounded-xl flex items-start gap-3">
        <div className="text-primary mt-1">
          <Target size={16} />
        </div>
        <p className="text-[10px] text-text-muted leading-normal">
          AI akan menyesuaikan kalori berdasarkan profil kesehatanmu (Tinggi: 170cm, Berat: 65kg).
        </p>
      </footer>
    </div>
  );
}
