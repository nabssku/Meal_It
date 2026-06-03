"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Heart, Ban, Search, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { updatePreferences } from "@/app/actions/user-actions";

const commonAllergies = ["Kacang", "Telur", "Susu", "Seafood", "Gandum", "Kedelai"];
const commonPreferences = ["Pedas", "Tanpa MSG", "Rendah Garam", "Vegetarian", "Manis"];

export default function PreferencesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [allergies, setAllergies] = useState<string[]>(["Kacang"]);
  const [prefs, setPrefs] = useState<string[]>(["Pedas"]);

  const toggleAllergy = (item: string) => {
    setAllergies(prev => prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]);
  };

  const togglePref = (item: string) => {
    setPrefs(prev => prev.includes(item) ? prev.filter(p => p !== item) : [...prev, item]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updatePreferences({ allergies, preferences: prefs });
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
        <h1 className="text-lg font-bold">Preferensi & Alergi</h1>
      </header>

      <main className="flex-1 p-6 space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-3 ml-1">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <Ban size={18} />
            </div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Alergi & Pantangan</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {commonAllergies.map((item) => (
              <button 
                key={item}
                onClick={() => toggleAllergy(item)}
                className={cn(
                  "px-4 py-2.5 rounded-xl border text-sm font-bold transition-all",
                  allergies.includes(item)
                    ? "bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20"
                    : "bg-muted/30 border-border/50 text-foreground hover:bg-muted/50"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 ml-1">
            <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
              <Heart size={18} />
            </div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Preferensi Rasa</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {commonPreferences.map((item) => (
              <button 
                key={item}
                onClick={() => togglePref(item)}
                className={cn(
                  "px-4 py-2.5 rounded-xl border text-sm font-bold transition-all",
                  prefs.includes(item)
                    ? "bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-500/20"
                    : "bg-muted/30 border-border/50 text-foreground hover:bg-muted/50"
                )}
              >
                {item}
              </button>
            ))}
          </div>
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
              Simpan Preferensi
            </>
          )}
        </Button>
      </footer>
    </div>
  );
}
