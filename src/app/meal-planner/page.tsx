"use client";

import React, { useState, useEffect, useTransition } from "react";
import Button from "@/components/ui/Button";
import {
  Sparkles, Wallet, Target, Zap, Brain,
  Flame, Dumbbell, ChevronRight, CheckCircle2,
  AlertCircle, RotateCcw, BookmarkCheck, Loader2,
  MapPin, Truck, CreditCard, Banknote, QrCode,
} from "lucide-react";
import MealPlanCard from "@/components/cards/MealPlanCard";
import {
  generateMealPlanAction,
  saveMealPlanAction,
  getUserSettingsAction,
  type GeneratedMealPlan,
  type MealItemConfig,
} from "@/app/actions/meal-actions";
import { useRouter } from "next/navigation";

const DIET_GOALS = [
  { key: "weight_loss", label: "Turunkan Berat", icon: "🔥" },
  { key: "muscle_gain", label: "Tambah Otot", icon: "💪" },
  { key: "healthy_life", label: "Hidup Sehat", icon: "🌿" },
  { key: "budget_healthy", label: "Hemat & Bergizi", icon: "💰" },
];

const FALLBACK_IMAGES: Record<string, string> = {
  sarapan: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&q=80&w=400",
  "makan-siang": "https://images.unsplash.com/photo-1593001007050-48429445f171?auto=format&fit=crop&q=80&w=400",
  "makan-malam": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=400",
  default: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400",
};

type MealKey = "breakfast" | "lunch" | "dinner";

interface MealConfig {
  deliveryMethod: "PICKUP" | "DELIVERY";
  paymentMethod: "WALLET" | "CASH";
}

const MEAL_LABELS: Record<MealKey, string> = {
  breakfast: "Sarapan",
  lunch: "Makan Siang",
  dinner: "Makan Malam",
};

const MEAL_ICONS: Record<MealKey, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
};

export default function MealPlannerPage() {
  const router = useRouter();
  const [budget, setBudget] = useState(50000);
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState("healthy_life");
  const [mealPlan, setMealPlan] = useState<GeneratedMealPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Step: "input" | "config" | "saved"
  const [step, setStep] = useState<"input" | "config">("input");

  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();

  // Per-meal delivery/payment config
  const [mealConfigs, setMealConfigs] = useState<Record<MealKey, MealConfig>>({
    breakfast: { deliveryMethod: "PICKUP", paymentMethod: "CASH" },
    lunch: { deliveryMethod: "PICKUP", paymentMethod: "CASH" },
    dinner: { deliveryMethod: "PICKUP", paymentMethod: "CASH" },
  });

  // Pre-fill budget, goal, and wallet balance from user settings
  useEffect(() => {
    getUserSettingsAction().then((settings) => {
      setBudget(settings.budget);
      setSelectedGoal(settings.bodyGoal);
      setWalletBalance(settings.walletBalance);
    });
  }, []);

  const handleGenerate = () => {
    setError(null);
    setSaved(false);
    setMealPlan(null);
    setStep("input");

    startGenerating(async () => {
      const result = await generateMealPlanAction(budget, selectedGoal);
      if (result.success) {
        setMealPlan(result.data);
        setStep("config");
      } else {
        setError(result.error);
      }
    });
  };

  const updateMealConfig = (meal: MealKey, key: keyof MealConfig, value: string) => {
    setMealConfigs((prev) => ({
      ...prev,
      [meal]: { ...prev[meal], [key]: value },
    }));
  };

  // Calculate wallet cost based on current config
  const walletCost = mealPlan
    ? (["breakfast", "lunch", "dinner"] as MealKey[]).reduce((sum, key) => {
        if (mealConfigs[key].paymentMethod === "WALLET") {
          return sum + (key === "breakfast" ? mealPlan.breakfast.price : key === "lunch" ? mealPlan.lunch.price : mealPlan.dinner.price);
        }
        return sum;
      }, 0)
    : 0;

  const walletInsufficient = walletCost > walletBalance;

  const handleSave = () => {
    if (!mealPlan) return;

    startSaving(async () => {
      const config: { breakfast: MealItemConfig; lunch: MealItemConfig; dinner: MealItemConfig } = {
        breakfast: { menuId: mealPlan.breakfast.id, ...mealConfigs.breakfast },
        lunch: { menuId: mealPlan.lunch.id, ...mealConfigs.lunch },
        dinner: { menuId: mealPlan.dinner.id, ...mealConfigs.dinner },
      };

      const result = await saveMealPlanAction(config);

      if (result.success) {
        setSaved(true);
        setTimeout(() => router.push("/dashboard"), 1800);
      } else {
        setError(result.error ?? "Gagal menyimpan meal plan.");
      }
    });
  };

  const handleReset = () => {
    setMealPlan(null);
    setError(null);
    setSaved(false);
    setStep("input");
    setMealConfigs({
      breakfast: { deliveryMethod: "PICKUP", paymentMethod: "CASH" },
      lunch: { deliveryMethod: "PICKUP", paymentMethod: "CASH" },
      dinner: { deliveryMethod: "PICKUP", paymentMethod: "CASH" },
    });
  };

  // ─── Meal card helper ───────────────────────────────
  const getMealCard = (meal: GeneratedMealPlan["breakfast"], label: string) => ({
    id: meal.id,
    time: label,
    name: meal.name,
    calories: meal.calories,
    protein: meal.protein,
    price: meal.price,
    image:
      meal.image ??
      FALLBACK_IMAGES[meal.category ?? ""] ??
      FALLBACK_IMAGES.default,
  });

  // ─── Budget inside vs outside ───────────────────────
  const isOverBudget = mealPlan ? mealPlan.totalPrice > budget : false;

  const getMealFromKey = (key: MealKey) =>
    key === "breakfast" ? mealPlan!.breakfast : key === "lunch" ? mealPlan!.lunch : mealPlan!.dinner;

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Brain size={22} className="text-primary" />
          <h1 className="text-2xl font-bold text-text-primary">AI Meal Planner</h1>
        </div>
        <p className="text-sm text-text-muted">
          Powered by <span className="font-bold text-primary">Groq AI</span> — menu sehat sesuai budget &amp; profilmu.
        </p>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Gagal</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* ── INPUT FORM ─────────────────────────────── */}
      {step === "input" && (
        <section className="flex flex-col gap-6">
          {/* Budget Slider */}
          <div className="card-premium p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-primary">
              <Wallet size={20} />
              <span className="font-bold">Budget Harian</span>
            </div>
            <div className="flex flex-col gap-3">
              <input
                type="range"
                min="40000"
                max="200000"
                step="5000"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full accent-primary h-2 rounded-full appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-text-muted font-bold">
                <span>Rp 40.000</span>
                <div className="text-2xl font-black text-text-primary">
                  Rp {budget.toLocaleString("id-ID")}
                </div>
                <span>Rp 200.000</span>
              </div>
            </div>
          </div>

          {/* Goal Selection */}
          <div className="card-premium p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-primary">
              <Target size={20} />
              <span className="font-bold">Target Diet</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {DIET_GOALS.map((goal) => {
                const isSelected = selectedGoal === goal.key;
                return (
                  <button
                    key={goal.key}
                    type="button"
                    onClick={() => setSelectedGoal(goal.key)}
                    style={
                      isSelected
                        ? {
                            background: "#0F5238",
                            borderColor: "#0F5238",
                            color: "#ffffff",
                          }
                        : {
                            background: "#ffffff",
                            borderColor: "#d1d5db",
                            color: "#404943",
                          }
                    }
                    className="p-3 rounded-xl border-2 text-xs font-bold transition-all duration-200 flex items-center gap-2 justify-center active:scale-95"
                  >
                    <span className="text-base">{goal.icon}</span>
                    <span>{goal.label}</span>
                    {isSelected && (
                      <CheckCircle2 size={12} className="ml-auto flex-shrink-0 opacity-80" />
                    )}
                  </button>
                );
              })}
            </div>
            {/* Selected goal indicator */}
            <div
              style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}
              className="flex items-center gap-2 rounded-xl border px-3 py-2"
            >
              <span className="text-sm">🎯</span>
              <p className="text-xs font-semibold" style={{ color: "#166534" }}>
                Goal aktif:{" "}
                <strong>
                  {DIET_GOALS.find((g) => g.key === selectedGoal)?.label ?? "—"}
                </strong>
              </p>
            </div>
          </div>


          {/* Nutri-Wallet Balance Info */}
          <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <Wallet size={18} className="text-orange-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-orange-700">Saldo Nutri-Wallet</p>
              <p className="text-base font-black text-orange-800">Rp {walletBalance.toLocaleString("id-ID")}</p>
            </div>
          </div>

          {/* AI Info Note */}
          <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <Sparkles size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-text-muted leading-relaxed">
              AI kami menganalisa menu yang tersedia di database, menyesuaikan kalori, protein, dan harga agar sesuai budget dan tujuan kesehatanmu.
            </p>
          </div>

          {/* Generate Button */}
          <Button
            size="lg"
            className="w-full shadow-lg shadow-primary/20 relative overflow-hidden"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Groq AI sedang menganalisa...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Generate Meal Plan
                <Sparkles size={18} />
              </span>
            )}
          </Button>

          {isGenerating && (
            <div className="flex flex-col items-center gap-2 py-4 animate-pulse">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary"
                    style={{ animationDelay: `${i * 0.15}s`, animation: "bounce 0.6s infinite" }}
                  />
                ))}
              </div>
              <p className="text-xs text-text-muted font-medium">
                AI memilih menu terbaik dari database...
              </p>
            </div>
          )}
        </section>
      )}

      {/* ── CONFIG STEP ─────────────────────────────── */}
      {step === "config" && mealPlan && (
        <section className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Status Banner */}
          <div
            className={`flex justify-between items-center p-4 rounded-2xl border ${
              isOverBudget
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-success/10 text-success border-success/20"
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap size={18} />
              <span className="text-sm font-bold">
                {isOverBudget
                  ? "⚠️ Melebihi budget! Coba generate ulang."
                  : "✅ Rekomendasi AI Berhasil Dibuat!"}
              </span>
            </div>
            <button onClick={handleReset} className="text-[10px] font-bold underline flex items-center gap-1">
              <RotateCcw size={10} /> Ulang
            </button>
          </div>

          {/* Meal Cards */}
          <div className="flex flex-col gap-3">
            <MealPlanCard {...getMealCard(mealPlan.breakfast, "Sarapan")} />
            <MealPlanCard {...getMealCard(mealPlan.lunch, "Makan Siang")} />
            <MealPlanCard {...getMealCard(mealPlan.dinner, "Makan Malam")} />
          </div>

          {/* AI Reasoning */}
          {mealPlan.reasoning && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3">
              <Brain size={16} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                  Alasan AI
                </p>
                <p className="text-xs text-text-muted leading-relaxed">{mealPlan.reasoning}</p>
              </div>
            </div>
          )}

          {/* ─── Delivery & Payment Config Per Meal ─── */}
          <div className="card-premium p-5 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <QrCode size={18} className="text-primary" />
              <p className="font-bold text-text-primary">Atur Pengambilan & Pembayaran</p>
            </div>

            {(["breakfast", "lunch", "dinner"] as MealKey[]).map((key) => {
              const meal = getMealFromKey(key);
              const cfg = mealConfigs[key];
              return (
                <div key={key} className="flex flex-col gap-3 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                  {/* Meal Header */}
                  <div className="flex items-center gap-2">
                    <span className="text-base">{MEAL_ICONS[key]}</span>
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-wider">{MEAL_LABELS[key]}</p>
                      <p className="text-sm font-semibold text-text-primary line-clamp-1">{meal.name}</p>
                    </div>
                    <span className="ml-auto text-sm font-black text-budget">Rp {meal.price.toLocaleString("id-ID")}</span>
                  </div>

                  {/* Delivery Method */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateMealConfig(key, "deliveryMethod", "PICKUP")}
                      style={
                        cfg.deliveryMethod === "PICKUP"
                          ? { background: "#0F5238", borderColor: "#0F5238", color: "#ffffff" }
                          : { background: "#ffffff", borderColor: "#d1d5db", color: "#404943" }
                      }
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-xs font-bold transition-all duration-200 active:scale-95"
                    >
                      <MapPin size={14} />
                      Ambil di Tempat
                      {cfg.deliveryMethod === "PICKUP" && (
                        <CheckCircle2 size={12} className="ml-1 opacity-80" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateMealConfig(key, "deliveryMethod", "DELIVERY")}
                      style={
                        cfg.deliveryMethod === "DELIVERY"
                          ? { background: "#0F5238", borderColor: "#0F5238", color: "#ffffff" }
                          : { background: "#ffffff", borderColor: "#d1d5db", color: "#404943" }
                      }
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-xs font-bold transition-all duration-200 active:scale-95"
                    >
                      <Truck size={14} />
                      Kirim ke Saya
                      {cfg.deliveryMethod === "DELIVERY" && (
                        <CheckCircle2 size={12} className="ml-1 opacity-80" />
                      )}
                    </button>
                  </div>

                  {/* Info chip for pickup + cash */}
                  {cfg.deliveryMethod === "PICKUP" && (
                    <p className="text-[10px] text-text-muted bg-muted/30 rounded-lg px-3 py-1.5 leading-relaxed">
                      📍 Barcode pengambilan akan dibuat. Bayar <strong>Rp {meal.price.toLocaleString("id-ID")}</strong> tunai saat ambil di catering.
                    </p>
                  )}
                  {cfg.deliveryMethod === "DELIVERY" && (
                    <p className="text-[10px] text-text-muted bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 leading-relaxed">
                      🚚 Makanan akan diantarkan ke alamatmu. Bayar tunai saat diterima.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Nutrition Summary */}
          <div className="card-premium p-4 flex flex-col gap-3">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Ringkasan Nutrisi &amp; Budget
            </p>
            <div className="flex justify-between items-end">
              <div className="flex gap-5">
                <div className="flex flex-col items-center">
                  <Flame size={16} className="text-warning mb-1" />
                  <span className="text-lg font-black text-text-primary">
                    {mealPlan.totalCalories.toLocaleString("id-ID")}
                  </span>
                  <span className="text-[8px] font-bold text-text-muted uppercase">Kalori</span>
                </div>
                <div className="flex flex-col items-center">
                  <Dumbbell size={16} className="text-primary mb-1" />
                  <span className="text-lg font-black text-text-primary">{mealPlan.totalProtein}g</span>
                  <span className="text-[8px] font-bold text-text-muted uppercase">Protein</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-text-muted uppercase font-bold block">
                  Total Harga
                </span>
                <span
                  className={`text-xl font-black ${
                    isOverBudget ? "text-red-500" : "text-budget"
                  }`}
                >
                  Rp {mealPlan.totalPrice.toLocaleString("id-ID")}
                </span>
                <span className="text-[9px] text-text-muted block">
                  dari Rp {budget.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Budget Progress Bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isOverBudget ? "bg-red-400" : "bg-success"
                }`}
                style={{
                  width: `${Math.min((mealPlan.totalPrice / budget) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="text-[9px] text-text-muted text-right">
              {isOverBudget
                ? `Melebihi Rp ${(mealPlan.totalPrice - budget).toLocaleString("id-ID")}`
                : `Sisa Rp ${(budget - mealPlan.totalPrice).toLocaleString("id-ID")}`}
            </p>
          </div>

          {/* Wallet Summary */}
          {walletCost > 0 && (
            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${walletInsufficient ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"}`}>
              <Wallet size={18} className={walletInsufficient ? "text-red-500" : "text-orange-500"} />
              <div className="flex-1">
                <p className={`text-xs font-bold ${walletInsufficient ? "text-red-700" : "text-orange-700"}`}>
                  {walletInsufficient ? "⚠️ Saldo Nutri-Wallet Tidak Cukup!" : "💳 Pembayaran via Nutri-Wallet"}
                </p>
                <p className={`text-[10px] ${walletInsufficient ? "text-red-600" : "text-orange-600"}`}>
                  Saldo: Rp {walletBalance.toLocaleString("id-ID")} → Dipotong: Rp {walletCost.toLocaleString("id-ID")}
                  {!walletInsufficient && ` → Sisa: Rp ${(walletBalance - walletCost).toLocaleString("id-ID")}`}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {saved ? (
            <div className="flex items-center justify-center gap-2 p-4 bg-success/10 border border-success/20 rounded-2xl text-success">
              <CheckCircle2 size={20} />
              <span className="font-bold text-sm">Tersimpan! Kembali ke dashboard...</span>
            </div>
          ) : (
            <>
              <Button
                size="lg"
                className="w-full"
                onClick={handleSave}
                disabled={isSaving || isOverBudget || walletInsufficient}
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Menyimpan...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <BookmarkCheck size={18} />
                    Konfirmasi &amp; Simpan Jadwal
                    <ChevronRight size={16} />
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleReset}
              >
                <RotateCcw size={16} className="mr-2" />
                Generate Ulang
              </Button>
            </>
          )}
        </section>
      )}

      {/* Footer Note */}
      <footer className="mt-2 p-4 bg-muted rounded-2xl flex items-start gap-3">
        <div className="text-primary mt-0.5">
          <Brain size={14} />
        </div>
        <p className="text-[10px] text-text-muted leading-relaxed">
          Meal plan dihasilkan oleh <strong>Groq AI (Llama 3.3 70B)</strong> berdasarkan menu dari database, budget harian, dan profil kesehatanmu. AI tidak menyimpan data pribadimu.
        </p>
      </footer>
    </div>
  );
}
