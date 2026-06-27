"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Zap, Flame, Target, User, Ruler, Weight, Check, Leaf, PiggyBank } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { updateDiet, updatePhysicalStatsAction } from "@/app/actions/user-actions";
import { getUserSettingsAction } from "@/app/actions/meal-actions";

export default function DietPreferencePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [goal, setGoal] = useState("weight_loss");
  const [showBmiForm, setShowBmiForm] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState<{
    gender: string;
    age: number;
    height: number;
    weight: number;
  }>({
    gender: "male",
    age: 25,
    height: 165,
    weight: 60,
  });

  useEffect(() => {
    getUserSettingsAction().then((settings) => {
      setGoal(settings.bodyGoal === "maintaining" ? "healthy_life" : settings.bodyGoal);
      setProfile({
        gender: settings.gender || "male",
        age: settings.age || 25,
        height: settings.height || 165,
        weight: settings.weight || 60,
      });
    });
  }, []);

  const handleSave = async () => {
    setError("");
    if (profile.age <= 0 || profile.height <= 0 || profile.weight <= 0) {
      setError("Pastikan umur, tinggi, dan berat badan diisi dengan benar.");
      return;
    }
    setLoading(true);
    try {
      // Save both body goal and physical stats
      await Promise.all([
        updateDiet({ bodyGoal: goal }),
        updatePhysicalStatsAction({
          gender: profile.gender,
          age: profile.age,
          height: profile.height,
          weight: profile.weight,
        }),
      ]);
      setSuccess(true);
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      setError((err as Error)?.message || "Gagal menyimpan konfigurasi.");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Calorie & Protein Target Calculation for preview
  const weight = profile.weight;
  const height = profile.height;
  const age = profile.age;
  const gender = profile.gender;

  // Mifflin-St Jeor Formula
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === "male") {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // Active multiplier (Lightly active: 1.375)
  const tdee = Math.round(bmr * 1.375);

  let targetCalories = tdee;
  let targetProtein = Math.round(weight * 1.5);

  if (goal === "weight_loss") {
    targetCalories = Math.max(tdee - 500, 1200);
    targetProtein = Math.round(weight * 1.8);
  } else if (goal === "muscle_gain") {
    targetCalories = tdee + 300;
    targetProtein = Math.round(weight * 2.0);
  } else if (goal === "budget_healthy") {
    targetCalories = tdee;
    targetProtein = Math.round(weight * 1.3);
  } else if (goal === "maintaining" || goal === "healthy_life") {
    targetCalories = tdee;
    targetProtein = Math.round(weight * 1.5);
  }

  // Calculate BMI dynamically
  const heightInMeters = height / 100;
  const bmi = height > 0 ? (weight / (heightInMeters * heightInMeters)).toFixed(1) : "0.0";

  // Calculate BMI category dynamically
  let bmiCategory = "Unknown";
  let bmiColor = "text-muted-foreground bg-muted/10";
  const bmiNum = parseFloat(bmi);
  if (!isNaN(bmiNum) && bmiNum > 0) {
    if (bmiNum < 18.5) {
      bmiCategory = "Kurang";
      bmiColor = "text-yellow-600 bg-yellow-50 border border-yellow-200";
    } else if (bmiNum >= 18.5 && bmiNum < 25) {
      bmiCategory = "Ideal";
      bmiColor = "text-green-600 bg-green-50 border border-green-200";
    } else if (bmiNum >= 25 && bmiNum < 30) {
      bmiCategory = "Berlebih";
      bmiColor = "text-orange-500 bg-orange-50 border border-orange-200";
    } else {
      bmiCategory = "Obesitas";
      bmiColor = "text-red-600 bg-red-50 border border-red-200";
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-md mx-auto w-full relative">
      <header className="p-4 flex items-center gap-4 relative bg-background z-10 border-b border-border/50">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-primary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Preferensi Diet</h1>
      </header>

      <main className="flex-1 p-6 space-y-8 pb-60">
        {/* Main Goal Section */}
        <section className="space-y-4">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Goal Utama</label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: "weight_loss", label: "Turun Berat Badan", icon: Target, sub: "Defisit kalori terkontrol" },
              { id: "muscle_gain", label: "Tambah Massa Otot", icon: Zap, sub: "Surplus kalori & tinggi protein" },
              { id: "healthy_life", label: "Hidup Lebih Sehat", icon: Leaf, sub: "Seimbang & nutrisi lengkap" },
              { id: "budget_healthy", label: "Hemat Makan Sehat", icon: PiggyBank, sub: "Nutrisi maksimal budget minimal" },
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

        {/* Dynamic Targets Summary */}
        <section className="space-y-4">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Target Nutrisi Harian</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 p-5 rounded-[24px] border border-border/50 space-y-2">
              <div className="p-2 bg-orange-100 text-orange-600 w-fit rounded-lg">
                <Flame size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Target Energi</div>
                <div className="text-xl font-black text-foreground">
                  {targetCalories.toLocaleString("id-ID")}{" "}
                  <span className="text-xs font-bold opacity-40">kcal</span>
                </div>
              </div>
            </div>
            <div className="bg-muted/30 p-5 rounded-[24px] border border-border/50 space-y-2">
              <div className="p-2 bg-blue-100 text-blue-600 w-fit rounded-lg">
                <Zap size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Target Protein</div>
                <div className="text-xl font-black text-foreground">
                  {targetProtein}{" "}
                  <span className="text-xs font-bold opacity-40">g</span>
                </div>
              </div>
            </div>
          </div>

          {/* BMI Info Badges */}
          <div className="bg-muted/20 border border-border/50 rounded-2xl p-4 flex items-center justify-between text-xs">
            <span className="font-bold text-muted-foreground uppercase tracking-wider">BMI Anda Saat Ini:</span>
            <span className={cn("font-black px-3 py-1.5 rounded-xl", bmiColor)}>
              {bmi} {bmiCategory !== "Unknown" ? `(${bmiCategory})` : ""}
            </span>
          </div>

          {/* Toggle BMI / Physical form */}
          {!showBmiForm ? (
            <button 
              onClick={() => setShowBmiForm(true)}
              className="w-full py-4 text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 rounded-xl border border-primary/20 transition-all hover:bg-primary/10 active:scale-95"
            >
              Kalkulasi Ulang Berdasarkan BMI
            </button>
          ) : (
            <div className="card-premium p-5 space-y-4 border-dashed border-primary/30 bg-primary/5 rounded-2xl animate-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-primary uppercase tracking-widest">Atur Parameter Tubuh</span>
                <button 
                  onClick={() => setShowBmiForm(false)}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground underline"
                >
                  Sembunyikan
                </button>
              </div>

              {/* Gender selection */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Jenis Kelamin</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProfile(prev => ({ ...prev, gender: "male" }))}
                    className={cn(
                      "flex-1 py-2 rounded-lg border text-xs font-bold transition-all",
                      profile.gender === "male" ? "bg-primary border-primary text-white" : "bg-white border-border text-foreground"
                    )}
                  >
                    Laki-laki
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile(prev => ({ ...prev, gender: "female" }))}
                    className={cn(
                      "flex-1 py-2 rounded-lg border text-xs font-bold transition-all",
                      profile.gender === "female" ? "bg-primary border-primary text-white" : "bg-white border-border text-foreground"
                    )}
                  >
                    Perempuan
                  </button>
                </div>
              </div>

              {/* Age, Height, Weight inputs */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <User size={10} /> Umur
                  </span>
                  <input
                    type="number"
                    value={profile.age || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                    className="w-full p-2.5 bg-white border border-border rounded-xl text-center text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Umur"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Ruler size={10} /> Tinggi (cm)
                  </span>
                  <input
                    type="number"
                    value={profile.height || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                    className="w-full p-2.5 bg-white border border-border rounded-xl text-center text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Tinggi"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Weight size={10} /> Berat (kg)
                  </span>
                  <input
                    type="number"
                    value={profile.weight || ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                    className="w-full p-2.5 bg-white border border-border rounded-xl text-center text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Berat"
                  />
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground italic">
                💡 Target kalori dan protein Anda akan langsung disesuaikan secara real-time di atas begitu parameter diubah.
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="p-6 bg-white/95 backdrop-blur-md border-t border-border/50 fixed bottom-[72px] left-0 right-0 max-w-md mx-auto z-40 flex flex-col gap-3">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl font-medium text-center animate-in fade-in">
            {error}
          </div>
        )}
        <Button 
          onClick={handleSave} 
          disabled={loading || success}
          className={cn(
            "w-full h-14 rounded-2xl shadow-lg flex gap-2 font-bold transition-all duration-500",
            success ? "bg-green-500 shadow-green-500/20" : "shadow-primary/20"
          )}
        >
          {loading ? "Menyimpan..." : success ? (
            <>
              <Check size={20} />
              Konfigurasi Berhasil Disimpan
            </>
          ) : (
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
