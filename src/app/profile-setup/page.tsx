"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Mars, 
  Venus, 
  TrendingDown, 
  Dumbbell, 
  Leaf, 
  PiggyBank,
  Check,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { setupUserProfile } from "@/app/actions/user-actions";

type Step = 1 | 2 | 3;

export default function ProfileSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    gender: "male",
    age: "",
    height: "",
    weight: "",
    goal: "healthy_life",
    budget: "50000"
  });

  const nextStep = () => {
    if (step < 3) setStep((step + 1) as Step);
  };

  const prevStep = () => {
    if (step > 1) setStep((step - 1) as Step);
    else router.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await setupUserProfile({
        gender: formData.gender,
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        bodyGoal: formData.goal,
        dailyBudget: parseInt(formData.budget),
      });
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const setBudget = (val: string) => {
    setFormData({ ...formData, budget: val });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center font-sans">
      {/* Header Section */}
      <header className="w-full max-w-lg px-6 py-6 sticky top-0 bg-background/80 backdrop-blur-md z-40 flex items-center justify-between">
        <button 
          onClick={prevStep}
          className="p-2 rounded-full hover:bg-muted transition-colors active:scale-90"
        >
          <ArrowLeft className="text-primary w-6 h-6" />
        </button>
        
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                s === step ? "w-6 bg-primary" : "w-2 bg-border"
              )}
            />
          ))}
        </div>

        <button className="text-sm font-bold text-primary">Bantuan</button>
      </header>

      <main className="w-full max-w-lg px-6 pb-32 flex-grow overflow-y-auto fade-in">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            Buat Rencana Makanmu
          </h1>
          <p className="text-muted-foreground text-sm">
            Personalisasi langkah sehatmu hanya dalam 1 menit.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <section className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <label className="cursor-pointer group">
                  <input 
                    type="radio" 
                    name="gender" 
                    value="male" 
                    checked={formData.gender === "male"}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="hidden peer"
                  />
                  <div className="flex flex-col items-center justify-center p-6 rounded-[20px] bg-white border-2 border-transparent peer-checked:border-primary peer-checked:bg-primary/5 shadow-sm transition-all group-hover:border-primary/20">
                    <Mars className="w-10 h-10 mb-2 text-primary" />
                    <span className="text-sm font-semibold">Pria</span>
                  </div>
                </label>
                <label className="cursor-pointer group">
                  <input 
                    type="radio" 
                    name="gender" 
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="hidden peer"
                  />
                  <div className="flex flex-col items-center justify-center p-6 rounded-[20px] bg-white border-2 border-transparent peer-checked:border-primary peer-checked:bg-primary/5 shadow-sm transition-all group-hover:border-primary/20">
                    <Venus className="w-10 h-10 mb-2 text-primary" />
                    <span className="text-sm font-semibold">Wanita</span>
                  </div>
                </label>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground ml-1">Umur (Tahun)</label>
                  <input 
                    type="number"
                    placeholder="Contoh: 24"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-foreground ml-1">Tinggi (cm)</label>
                    <input 
                      type="number"
                      placeholder="170"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-foreground ml-1">Berat (kg)</label>
                    <input 
                      type="number"
                      placeholder="65"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30"
                      required
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* STEP 2: Goals */}
          {step === 2 && (
            <section className="space-y-6">
              <h3 className="text-xl font-bold text-primary">Pilih Target Tubuh</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: "weight_loss", title: "Turun berat badan", sub: "Fokus pada defisit kalori bergizi", icon: TrendingDown },
                  { id: "muscle_gain", title: "Menambah massa otot", sub: "Tinggi protein dan surplus terkontrol", icon: Dumbbell },
                  { id: "healthy_life", title: "Hidup lebih sehat", sub: "Seimbang, nutrisi mikro yang lengkap", icon: Leaf },
                  { id: "budget_healthy", title: "Hemat makan sehat", sub: "Maksimalkan nutrisi dengan budget minimal", icon: PiggyBank },
                ].map((goal) => (
                  <label key={goal.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-white hover:border-primary/50 transition-all cursor-pointer group">
                    <input 
                      type="radio" 
                      name="goal" 
                      value={goal.id}
                      checked={formData.goal === goal.id}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      className="w-5 h-5 text-primary border-border focus:ring-primary"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">{goal.title}</span>
                      <span className="text-xs text-muted-foreground">{goal.sub}</span>
                    </div>
                    <goal.icon className="ml-auto text-primary/40 group-hover:text-primary transition-colors" size={24} />
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* STEP 3: Budget */}
          {step === 3 && (
            <section className="space-y-6">
              <h3 className="text-xl font-bold text-primary">Budget Makan Harian</h3>
              <div className="relative w-full h-40 rounded-[24px] overflow-hidden shadow-md">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAL1E1-Mqgo3tw3OCBI9QQZaybbjX8jHwq--khZxufUf4vhwCgQB1bvF2m-oUJ3uYOC8FN1Cd3jIbtWs7A0yFBf9vgQcz3Qtwc5iex_J2gQSf72xJYAI4KcR-m7fSUlqdBLpi89EaOsItHY7rB1igi1Emf9JuwsFeV3ynfafIjiOi4Xi-lyjJeKs338vXtzDN88kwvjmDCdXnpZhH06vt5QHhLfvlJY69zNlbk1htg65DousFg5J8EHr0zNKAh8-bPc6SlofeFeoAA" 
                  alt="Budget Goal"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <span className="text-white text-sm font-medium">Kami akan menyesuaikan resep dengan budgetmu.</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 font-sans">
                {["20000", "30000", "50000"].map((val) => (
                  <button 
                    key={val}
                    type="button" 
                    onClick={() => setBudget(val)}
                    className={cn(
                      "py-4 px-2 rounded-xl border border-border font-bold transition-all active:scale-95",
                      formData.budget === val ? "bg-primary text-white border-primary" : "bg-white text-foreground hover:bg-primary/5"
                    )}
                  >
                    Rp{parseInt(val) / 1000}k
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground ml-1">Custom Budget</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary">Rp</span>
                  <input 
                    id="customBudget"
                    type="number"
                    placeholder="Masukkan angka..."
                    value={formData.budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
            </section>
          )}
        </form>
      </main>

      {/* Fixed Footer CTA */}
      <footer className="fixed bottom-0 w-full max-w-lg p-6 bg-background/80 backdrop-blur-xl z-50">
        {step < 3 ? (
          <Button 
            onClick={nextStep}
            className="w-full py-4 rounded-full shadow-lg shadow-primary/20"
          >
            Lanjutkan
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-full shadow-lg shadow-primary/20"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin w-5 h-5" />
                <span>Memproses...</span>
              </div>
            ) : "Simpan dan Buat Meal Plan"}
          </Button>
        )}
      </footer>
    </div>
  );
}
