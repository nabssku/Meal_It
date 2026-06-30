"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import Button from "@/components/ui/Button";
import {
  Sparkles, Wallet, Target, Zap, Brain,
  Flame, Dumbbell, ChevronRight, CheckCircle2,
  AlertCircle, RotateCcw, BookmarkCheck, Loader2,
  MapPin, Truck, QrCode, Calendar, CalendarDays,
  CalendarRange, Check, RefreshCw, ChevronUp,
  ChevronDown, Coffee, Sun, Moon
} from "lucide-react";
import MealPlanCard from "@/components/cards/MealPlanCard";
import {
  generateMealPlanAction,
  saveMealPlanAction,
  getUserSettingsAction,
  getAvailableMenusForPlanAction,
  saveMultiDayMealPlanAction,
  type GeneratedMealPlan,
  type MealItemConfig,
  type PlanMenuItem,
  type CategorizedMenus,
  type DayPlanToSave,
} from "@/app/actions/meal-actions";
import { updatePlannerPeriodAction } from "@/app/actions/user-actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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

interface DayPlan {
  date: Date;
  breakfast: PlanMenuItem;
  lunch: PlanMenuItem;
  dinner: PlanMenuItem;
}

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function buildDayPlans(
  menus: CategorizedMenus,
  days: number,
  budget: number
): DayPlan[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bfs = menus.breakfast.filter((m) => m.price <= budget * 0.3);
  const lns = menus.lunch.filter((m) => m.price <= budget * 0.4);
  const dns = menus.dinner.filter((m) => m.price <= budget * 0.35);

  // Fallback if filtered lists are empty
  const bfList = bfs.length > 0 ? bfs : menus.breakfast;
  const lnList = lns.length > 0 ? lns : menus.lunch;
  const dnList = dns.length > 0 ? dns : menus.dinner;

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      date,
      breakfast: bfList[i % bfList.length],
      lunch: lnList[i % lnList.length],
      dinner: dnList[i % dnList.length],
    };
  });
}

function getDayTotal(day: DayPlan): number {
  return day.breakfast.price + day.lunch.price + day.dinner.price;
}

export default function MealPlannerPage() {
  const router = useRouter();
  const [budget, setBudget] = useState(50000);
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState("healthy_life");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [plannerPeriod, setPlannerPeriod] = useState("daily");

  // Daily Mode States
  const [step, setStep] = useState<"input" | "config">("input");
  const [mealPlan, setMealPlan] = useState<GeneratedMealPlan | null>(null);
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [mealConfigs, setMealConfigs] = useState<Record<MealKey, MealConfig>>({
    breakfast: { deliveryMethod: "PICKUP", paymentMethod: "CASH" },
    lunch: { deliveryMethod: "PICKUP", paymentMethod: "CASH" },
    dinner: { deliveryMethod: "PICKUP", paymentMethod: "CASH" },
  });

  // Weekly/Monthly Mode States
  const [menus, setMenus] = useState<CategorizedMenus | null>(null);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [swapTarget, setSwapTarget] = useState<{
    dayIdx: number;
    meal: "breakfast" | "lunch" | "dinner";
  } | null>(null);
  const [loadingMenus, setLoadingMenus] = useState(false);

  // Pre-fill budget, goal, wallet, and planner range from settings
  useEffect(() => {
    getUserSettingsAction().then((settings) => {
      setBudget(settings.budget);
      setSelectedGoal(settings.bodyGoal);
      setWalletBalance(settings.walletBalance);
      setPlannerPeriod(settings.plannerPeriod || "daily");
    });
  }, []);

  // Handle Tab Switch (Harian, Mingguan, Bulanan)
  const handlePeriodChange = (newPeriod: string) => {
    setPlannerPeriod(newPeriod);
    setError(null);
    setSaved(false);
    // Reset state
    setMealPlan(null);
    setDayPlans([]);
    setStep("input");
    
    // Call server action to save setting in DB dynamically
    updatePlannerPeriodAction(newPeriod).catch((err) => {
      console.error("Gagal menyimpan periode planner:", err);
    });
  };

  // ─── DAILY LOGIC ─────────────────────────────────
  const handleGenerateDaily = () => {
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

  const walletCost = mealPlan
    ? (["breakfast", "lunch", "dinner"] as MealKey[]).reduce((sum, key) => {
        if (mealConfigs[key].paymentMethod === "WALLET") {
          return sum + (key === "breakfast" ? mealPlan.breakfast.price : key === "lunch" ? mealPlan.lunch.price : mealPlan.dinner.price);
        }
        return sum;
      }, 0)
    : 0;

  const walletInsufficient = walletCost > walletBalance;
  const isOverBudget = mealPlan ? mealPlan.totalPrice > budget : false;

  const handleSaveDaily = () => {
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

  const handleResetDaily = () => {
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

  const getMealFromKey = (key: MealKey) =>
    key === "breakfast" ? mealPlan!.breakfast : key === "lunch" ? mealPlan!.lunch : mealPlan!.dinner;

  // ─── WEEKLY / MONTHLY LOGIC ──────────────────────
  const handleGenerateMultiDay = async () => {
    setLoadingMenus(true);
    setError(null);
    setSaved(false);
    try {
      const res = await getAvailableMenusForPlanAction();
      if (!res.success) throw new Error(res.error);
      setMenus(res.data);
      const days = plannerPeriod === "weekly" ? 7 : 30;
      const plans = buildDayPlans(res.data, days, budget);
      setDayPlans(plans);
      setSelectedDayIdx(0);
    } catch (err: any) {
      setError(err.message || "Gagal memuat menu.");
    } finally {
      setLoadingMenus(false);
    }
  };

  const swapMeal = (dayIdx: number, meal: "breakfast" | "lunch" | "dinner", newItem: PlanMenuItem) => {
    setDayPlans((prev) => {
      const updated = [...prev];
      updated[dayIdx] = { ...updated[dayIdx], [meal]: newItem };
      return updated;
    });
    setSwapTarget(null);
  };

  const handleSaveMultiDay = async () => {
    setLoadingMenus(true);
    setError(null);
    try {
      const toSave: DayPlanToSave[] = dayPlans.map((d) => ({
        date: d.date.toISOString(),
        breakfastMenuId: d.breakfast.id,
        lunchMenuId: d.lunch.id,
        dinnerMenuId: d.dinner.id,
      }));

      const res = await saveMultiDayMealPlanAction(toSave);
      if (!res.success) throw new Error(res.error);

      setSaved(true);
      setTimeout(() => router.push("/dashboard"), 1800);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan rencana makan.");
    } finally {
      setLoadingMenus(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Brain size={22} className="text-primary" />
          <h1 className="text-2xl font-bold text-text-primary">AI Meal Planner</h1>
        </div>
        <p className="text-sm text-text-muted">
          Optimalkan nutrisi harian, mingguan, atau bulanan sesuai profil kesehatan Anda.
        </p>
      </header>

      {/* Modern Glassmorphic Period Switcher */}
      <section className="bg-muted p-1 rounded-full flex w-full relative z-10 select-none shadow-inner border border-black/5">
        {[
          { key: "daily", label: "Harian", icon: Calendar },
          { key: "weekly", label: "Mingguan", icon: CalendarDays },
          { key: "monthly", label: "Bulanan", icon: CalendarRange },
        ].map((tab) => {
          const isActive = plannerPeriod === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handlePeriodChange(tab.key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold transition-all active:scale-[0.98]",
                isActive
                  ? "bg-primary text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </section>

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Gagal</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* ─── 1. HARIAN FLOW ─────────────────────────── */}
      {plannerPeriod === "daily" && (
        <>
          {step === "input" && (
            <section className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
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
                    className="w-full accent-primary h-2 rounded-full appearance-none cursor-pointer bg-muted"
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
                        className="p-3 rounded-xl border-2 text-xs font-bold transition-all duration-200 flex items-center gap-2 justify-center active:scale-95 shadow-sm"
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

              {/* AI Note */}
              <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-2xl p-4">
                <Sparkles size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-text-muted leading-relaxed">
                  AI kami menganalisa menu yang tersedia di database, menyesuaikan kalori, protein, dan harga agar sesuai budget dan tujuan kesehatanmu.
                </p>
              </div>

              {/* Action Button */}
              <Button
                size="lg"
                className="w-full shadow-lg shadow-primary/20 relative overflow-hidden"
                onClick={handleGenerateDaily}
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

          {step === "config" && mealPlan && (
            <section className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Reset Banner */}
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
                <button onClick={handleResetDaily} className="text-[10px] font-bold underline flex items-center gap-1">
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
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Alasan AI</p>
                    <p className="text-xs text-text-muted leading-relaxed">{mealPlan.reasoning}</p>
                  </div>
                </div>
              )}

              {/* Delivery Settings */}
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
                      <div className="flex items-center gap-2">
                        <span className="text-base">{MEAL_ICONS[key]}</span>
                        <div>
                          <p className="text-xs font-bold text-primary uppercase tracking-wider">{MEAL_LABELS[key]}</p>
                          <p className="text-sm font-semibold text-text-primary line-clamp-1">{meal.name}</p>
                        </div>
                        <span className="ml-auto text-sm font-black text-budget">Rp {meal.price.toLocaleString("id-ID")}</span>
                      </div>

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
                          {cfg.deliveryMethod === "PICKUP" && <CheckCircle2 size={12} className="ml-1 opacity-80" />}
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
                          {cfg.deliveryMethod === "DELIVERY" && <CheckCircle2 size={12} className="ml-1 opacity-80" />}
                        </button>
                      </div>

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
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Ringkasan Nutrisi &amp; Budget</p>
                <div className="flex justify-between items-end">
                  <div className="flex gap-5">
                    <div className="flex flex-col items-center">
                      <Flame size={16} className="text-warning mb-1" />
                      <span className="text-lg font-black text-text-primary">{mealPlan.totalCalories.toLocaleString("id-ID")}</span>
                      <span className="text-[8px] font-bold text-text-muted uppercase">Kalori</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Dumbbell size={16} className="text-primary mb-1" />
                      <span className="text-lg font-black text-text-primary">{mealPlan.totalProtein}g</span>
                      <span className="text-[8px] font-bold text-text-muted uppercase">Protein</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-text-muted uppercase font-bold block">Total Harga</span>
                    <span className={`text-xl font-black ${isOverBudget ? "text-red-500" : "text-budget"}`}>
                      Rp {mealPlan.totalPrice.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[9px] text-text-muted block">dari Rp {budget.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isOverBudget ? "bg-red-400" : "bg-success"}`}
                    style={{ width: `${Math.min((mealPlan.totalPrice / budget) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[9px] text-text-muted text-right">
                  {isOverBudget
                    ? `Melebihi Rp ${(mealPlan.totalPrice - budget).toLocaleString("id-ID")}`
                    : `Sisa Rp ${(budget - mealPlan.totalPrice).toLocaleString("id-ID")}`}
                </p>
              </div>

              {/* Wallet Info Summary */}
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

              {/* Save Daily Button */}
              {saved ? (
                <div className="flex items-center justify-center gap-2 p-4 bg-success/10 border border-success/20 rounded-2xl text-success animate-in zoom-in-95">
                  <CheckCircle2 size={20} />
                  <span className="font-bold text-sm">Tersimpan! Kembali ke dashboard...</span>
                </div>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleSaveDaily}
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
                  <Button variant="outline" size="lg" className="w-full" onClick={handleResetDaily}>
                    <RotateCcw size={16} className="mr-2" />
                    Generate Ulang
                  </Button>
                </>
              )}
            </section>
          )}
        </>
      )}

      {/* ─── 2. WEEKLY / MONTHLY FLOW ───────────────── */}
      {(plannerPeriod === "weekly" || plannerPeriod === "monthly") && (
        <section className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {dayPlans.length === 0 ? (
            /* PREVIEW SCREEN */
            <div className="card-premium p-6 flex flex-col gap-5 text-center">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                {plannerPeriod === "weekly" ? <CalendarDays size={32} /> : <CalendarRange size={32} />}
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-black text-text-primary">
                  Planner {plannerPeriod === "weekly" ? "Mingguan" : "Bulanan"} Otomatis
                </h2>
                <p className="text-xs text-text-muted leading-relaxed">
                  Mealit akan menyusun paket menu lengkap untuk {plannerPeriod === "weekly" ? "7 hari" : "30 hari"} yang paling hemat, sehat, dan sesuai dengan target diet Anda.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-2xl text-left space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-muted font-semibold">Budget Harian</span>
                  <span className="font-bold text-text-primary">Rp {budget.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-black/5 pt-3">
                  <span className="text-text-muted font-semibold">Total Periode ({plannerPeriod === "weekly" ? "7 Hari" : "30 Hari"})</span>
                  <span className="font-extrabold text-primary text-sm">
                    Rp {(budget * (plannerPeriod === "weekly" ? 7 : 30)).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold shadow-lg shadow-primary/15"
                onClick={handleGenerateMultiDay}
                disabled={loadingMenus}
              >
                {loadingMenus ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Menyusun Rencana...
                  </>
                ) : (
                  <>
                    Buat Rencana {plannerPeriod === "weekly" ? "Mingguan" : "Bulanan"}
                    <Sparkles size={18} />
                  </>
                )}
              </Button>
            </div>
          ) : (
            /* CALENDAR INTERFACE */
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">
                    Jadwal {plannerPeriod === "weekly" ? "7 Hari" : "30 Hari"}
                  </h3>
                  <p className="text-[10px] text-text-muted">Ketuk hari untuk melihat atau mengganti menu</p>
                </div>
                <button
                  onClick={() => { setDayPlans([]); setSaved(false); }}
                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <RotateCcw size={10} /> Reset
                </button>
              </div>

              {/* Weekly: Horizontal Day Strip */}
              {plannerPeriod === "weekly" && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {dayPlans.map((day, idx) => {
                    const isSelected = idx === selectedDayIdx;
                    const isToday = new Date().toDateString() === day.date.toDateString();
                    const dayTotal = getDayTotal(day);
                    const overBudget = dayTotal > budget;

                    return (
                      <button
                        key={idx}
                        onClick={() => { setSelectedDayIdx(idx); setSwapTarget(null); setExpandedMeal(null); }}
                        className={cn(
                          "flex-shrink-0 w-12 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-200 border-2",
                          isSelected
                            ? "bg-primary border-primary text-white shadow-md"
                            : "bg-white border-border hover:border-primary/20"
                        )}
                      >
                        <span className={cn("text-[9px] font-bold", isSelected ? "text-white/70" : "text-text-muted")}>
                          {DAY_NAMES[day.date.getDay()]}
                        </span>
                        <span className="text-sm font-black">{day.date.getDate()}</span>
                        <div className={cn("w-1.5 h-1.5 rounded-full", overBudget ? "bg-red-400" : isSelected ? "bg-white/50" : "bg-primary/30")} />
                        {isToday && <span className={cn("text-[8px] font-black scale-90", isSelected ? "text-white" : "text-primary")}>Kini</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Monthly: Calendar Grid */}
              {plannerPeriod === "monthly" && (
                <div className="bg-white rounded-3xl p-4 border border-border shadow-sm">
                  <div className="text-center text-xs font-bold text-text-primary mb-3 uppercase tracking-wider">
                    {MONTH_NAMES[dayPlans[0]?.date.getMonth()]} {dayPlans[0]?.date.getFullYear()}
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[9px] font-bold text-text-muted uppercase">
                    {DAY_NAMES.map((d) => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: dayPlans[0]?.date.getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {dayPlans.map((day, idx) => {
                      const isSelected = idx === selectedDayIdx;
                      const dayTotal = getDayTotal(day);
                      const overBudget = dayTotal > budget;

                      return (
                        <button
                          key={idx}
                          onClick={() => { setSelectedDayIdx(idx); setSwapTarget(null); setExpandedMeal(null); }}
                          className={cn(
                            "aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all relative",
                            isSelected
                              ? "bg-primary text-white shadow-md"
                              : "bg-white hover:bg-primary/5 text-text-primary border border-border/40"
                          )}
                        >
                          {day.date.getDate()}
                          {overBudget && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-400 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected Day Details */}
              {dayPlans[selectedDayIdx] && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-black text-text-primary">
                      {dayPlans[selectedDayIdx].date.toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-text-muted font-bold">Total Hari Ini:</span>
                      <span className={cn(
                        "text-xs font-black",
                        getDayTotal(dayPlans[selectedDayIdx]) > budget ? "text-red-500" : "text-primary"
                      )}>
                        Rp {getDayTotal(dayPlans[selectedDayIdx]).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Meals */}
                  {(
                    [
                      { key: "breakfast" as const, label: "Sarapan", icon: Coffee, time: "07:00" },
                      { key: "lunch" as const, label: "Makan Siang", icon: Sun, time: "12:00" },
                      { key: "dinner" as const, label: "Makan Malam", icon: Moon, time: "19:00" },
                    ] as const
                  ).map(({ key, label, icon: Icon, time }) => {
                    const meal = dayPlans[selectedDayIdx][key];
                    const isExpanded = expandedMeal === key;
                    const isSwapping = swapTarget?.dayIdx === selectedDayIdx && swapTarget?.meal === key;
                    const swapList = menus ? menus[key] : [];

                    return (
                      <div key={key} className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                        <div className="flex items-center gap-3 p-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
                              <span className="text-[9px] text-text-muted font-medium">{time}</span>
                            </div>
                            <h4 className="text-sm font-bold text-text-primary truncate mt-0.5">{meal.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-primary font-bold">Rp {meal.price.toLocaleString("id-ID")}</span>
                              <span className="text-[10px] text-text-muted font-semibold">{meal.calories} kkal</span>
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => {
                                if (isSwapping) {
                                  setSwapTarget(null);
                                } else {
                                  setSwapTarget({ dayIdx: selectedDayIdx, meal: key });
                                  setExpandedMeal(null);
                                }
                              }}
                              className={cn(
                                "p-2 rounded-xl transition-all text-xs font-semibold flex items-center justify-center border",
                                isSwapping
                                  ? "bg-primary border-primary text-white"
                                  : "bg-muted border-border text-text-muted hover:bg-primary/5 hover:text-primary"
                              )}
                            >
                              <RefreshCw size={14} className={cn(isSwapping && "animate-spin-slow")} />
                            </button>
                            <button
                              onClick={() => {
                                setExpandedMeal(isExpanded ? null : key);
                                setSwapTarget(null);
                              }}
                              className="p-2 rounded-xl bg-muted border border-border text-text-muted hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center"
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="border-t border-border/50 px-4 pb-4 pt-3 space-y-3 bg-muted/20 animate-in slide-in-from-top-1">
                            {meal.image && (
                              <img
                                src={meal.image}
                                alt={meal.name}
                                className="w-full h-32 object-cover rounded-xl shadow-inner border border-black/5"
                              />
                            )}
                            <div className="grid grid-cols-3 gap-2 text-center">
                              {[
                                { label: "Protein", val: `${meal.protein}g` },
                                { label: "Karbohidrat", val: meal.carbs ? `${meal.carbs}g` : "-" },
                                { label: "Penyedia", val: meal.vendor },
                              ].map(({ label, val }) => (
                                <div key={label} className="bg-white border border-border/50 rounded-xl p-2">
                                  <div className="text-[9px] text-text-muted font-bold uppercase tracking-wider">{label}</div>
                                  <div className="text-xs font-bold text-text-primary truncate mt-0.5">{val}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Swapping UI list */}
                        {isSwapping && (
                          <div className="border-t border-border/50 p-4 bg-muted/30 space-y-3 animate-in slide-in-from-top-1">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                              Ganti Menu (Budget: Rp {budget.toLocaleString("id-ID")}/Hari)
                            </p>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              {swapList.map((item) => {
                                const isCurrent = item.id === meal.id;
                                return (
                                  <button
                                    key={item.id}
                                    disabled={isCurrent}
                                    onClick={() => swapMeal(selectedDayIdx, key, item)}
                                    className={cn(
                                      "w-full flex items-center gap-3 p-2 rounded-xl border text-left transition-all",
                                      isCurrent
                                        ? "bg-primary/5 border-primary/20"
                                        : "bg-white border-border hover:border-primary/30 active:scale-[0.99]"
                                    )}
                                  >
                                    <img
                                      src={item.image || FALLBACK_IMAGES.default}
                                      alt={item.name}
                                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-bold text-text-primary truncate">{item.name}</div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-primary font-bold">Rp {item.price.toLocaleString("id-ID")}</span>
                                        <span className="text-[9px] text-text-muted font-medium">{item.calories} kkal</span>
                                      </div>
                                    </div>
                                    {isCurrent && <Check size={14} className="text-primary flex-shrink-0 stroke-[3]" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Budget Sum totals */}
              <div className="card-premium p-4 flex flex-col gap-3">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Ringkasan Budget Paket</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-muted font-semibold">Total {dayPlans.length} Hari</span>
                  <span className="text-base font-black text-primary">
                    Rp {dayPlans.reduce((sum, d) => sum + getDayTotal(d), 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-text-muted">
                  <span>Maksimal Target Budget</span>
                  <span>Rp {(budget * dayPlans.length).toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Action save multi-day */}
              {saved ? (
                <div className="flex items-center justify-center gap-2 p-4 bg-success/10 border border-success/20 rounded-2xl text-success font-bold text-sm">
                  <CheckCircle2 size={18} />
                  Jadwal Tersimpan! Kembali ke dashboard...
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold shadow-lg shadow-primary/15"
                  onClick={handleSaveMultiDay}
                  disabled={loadingMenus}
                >
                  {loadingMenus ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Menyimpan Jadwal...
                    </>
                  ) : (
                    <>
                      <BookmarkCheck size={18} />
                      Simpan Seluruh Rencana Jadwal
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </section>
      )}

      {/* Footer Note */}
      <footer className="p-4 bg-muted rounded-2xl flex items-start gap-3">
        <div className="text-primary mt-0.5">
          <Brain size={14} />
        </div>
        <p className="text-[10px] text-text-muted leading-relaxed">
          AI Meal Planner didukung database menu Katering sehat Mealit, disesuaikan dengan budget dan preferensi nutrisi Anda.
        </p>
      </footer>
    </div>
  );
}
