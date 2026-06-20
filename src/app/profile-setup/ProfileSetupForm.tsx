"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mars,
  Venus,
  TrendingDown,
  Dumbbell,
  Leaf,
  PiggyBank,
  Loader2,
  CalendarDays,
  CalendarRange,
  Utensils,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sun,
  Coffee,
  Moon,
  Check,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import {
  getAvailableMenusForPlanAction,
  completeProfileSetupAction,
  type PlanMenuItem,
  type CategorizedMenus,
} from "@/app/actions/meal-actions";

// ─── Types ───────────────────────────────────────
type Step = 1 | 2 | 3 | 4 | 5;
type PlanType = "daily" | "weekly" | "monthly";

interface DayPlan {
  date: Date;
  breakfast: PlanMenuItem;
  lunch: PlanMenuItem;
  dinner: PlanMenuItem;
}

interface ProfileSetupFormProps {
  initialData?: {
    gender?: string;
    age?: number;
    height?: number;
    weight?: number;
    bodyGoal?: string;
    dailyBudget?: number;
  };
}

// ─── Helpers ─────────────────────────────────────
const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTH_NAMES = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

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

// ─── Main Component ───────────────────────────────
export default function ProfileSetupForm({ initialData }: ProfileSetupFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    gender: initialData?.gender || "male",
    age: initialData?.age ? String(initialData.age) : "",
    height: initialData?.height ? String(initialData.height) : "",
    weight: initialData?.weight ? String(initialData.weight) : "",
    goal: initialData?.bodyGoal || "healthy_life",
    budget: initialData?.dailyBudget ? String(initialData.dailyBudget) : "50000",
  });

  // Plan Setup State
  const [planType, setPlanType] = useState<PlanType>("daily");
  const [menus, setMenus] = useState<CategorizedMenus | null>(null);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [swapTarget, setSwapTarget] = useState<{
    dayIdx: number;
    meal: "breakfast" | "lunch" | "dinner";
  } | null>(null);
  const [loadingMenus, setLoadingMenus] = useState(false);

  // ─── Navigation ───────────────────────────────
  const nextStep = () => {
    setError("");
    if (step === 1) {
      if (!formData.age || !formData.height || !formData.weight) {
        setError("Harap isi semua kolom umur, tinggi, dan berat.");
        return;
      }
      const ageVal = parseInt(formData.age);
      const heightVal = parseFloat(formData.height);
      const weightVal = parseFloat(formData.weight);
      if (
        isNaN(ageVal) || ageVal <= 0 ||
        isNaN(heightVal) || heightVal <= 0 ||
        isNaN(weightVal) || weightVal <= 0
      ) {
        setError("Harap masukkan angka yang valid dan lebih besar dari 0.");
        return;
      }
    }
    if (step === 3) {
      const budgetVal = parseInt(formData.budget);
      if (isNaN(budgetVal) || budgetVal < 40000) {
        setError("Budget harian minimal adalah Rp 40.000.");
        return;
      }
    }
    if (step < 5) setStep((step + 1) as Step);
  };

  const prevStep = () => {
    setError("");
    if (step > 1) setStep((step - 1) as Step);
    else router.back();
  };

  // ─── Submit profile (step 3→4 transition) ──────
  const handleProfileSubmit = () => {
    setError("");
    const age = parseInt(formData.age);
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    const dailyBudget = parseInt(formData.budget);

    if (isNaN(age) || isNaN(height) || isNaN(weight) || isNaN(dailyBudget)) {
      setError("Harap pastikan semua isian data berupa angka yang valid.");
      return;
    }
    if (dailyBudget < 40000) {
      setError("Budget harian minimal adalah Rp 40.000.");
      return;
    }

    setStep(4);
  };

  // ─── Load menus + build calendar when entering step 5 ──
  const enterCalendarStep = useCallback(async () => {
    setLoadingMenus(true);
    setError("");
    try {
      const res = await getAvailableMenusForPlanAction();
      if (!res.success) throw new Error(res.error);
      setMenus(res.data);
      const days = planType === "weekly" ? 7 : 30;
      const plans = buildDayPlans(res.data, days, parseInt(formData.budget));
      setDayPlans(plans);
      setSelectedDayIdx(0);
      setStep(5);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Gagal memuat menu.");
    } finally {
      setLoadingMenus(false);
    }
  }, [planType, formData.budget]);

  const handlePlanTypeNext = async () => {
    if (planType === "daily") {
      setLoading(true);
      setError("");
      try {
        const age = parseInt(formData.age);
        const height = parseFloat(formData.height);
        const weight = parseFloat(formData.weight);
        const dailyBudget = parseInt(formData.budget);

        const res = await completeProfileSetupAction({
          gender: formData.gender,
          age,
          height,
          weight,
          bodyGoal: formData.goal,
          dailyBudget,
        });

        if (!res.success) throw new Error(res.error);

        router.push("/dashboard");
        router.refresh();
      } catch (err: unknown) {
        const e = err as Error;
        setError(e.message || "Gagal menyimpan profil.");
      } finally {
        setLoading(false);
      }
    } else {
      await enterCalendarStep();
    }
  };

  // ─── Swap meal ─────────────────────────────────
  const swapMeal = (dayIdx: number, meal: "breakfast" | "lunch" | "dinner", newItem: PlanMenuItem) => {
    setDayPlans((prev) => {
      const updated = [...prev];
      updated[dayIdx] = { ...updated[dayIdx], [meal]: newItem };
      return updated;
    });
    setSwapTarget(null);
  };

  // ─── Save final multi-day plan ─────────────────
  const handleSavePlan = async () => {
    setLoading(true);
    setError("");
    try {
      const age = parseInt(formData.age);
      const height = parseFloat(formData.height);
      const weight = parseFloat(formData.weight);
      const dailyBudget = parseInt(formData.budget);

      const toSave = dayPlans.map((d) => ({
        date: d.date.toISOString(),
        breakfastMenuId: d.breakfast.id,
        lunchMenuId: d.lunch.id,
        dinnerMenuId: d.dinner.id,
      }));

      const res = await completeProfileSetupAction({
        gender: formData.gender,
        age,
        height,
        weight,
        bodyGoal: formData.goal,
        dailyBudget,
        mealPlans: toSave,
      });

      if (!res.success) throw new Error(res.error);
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Gagal menyimpan rencana makan.");
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = planType === "daily" ? 4 : 5;
  const isMaleSelected = formData.gender === "male";
  const isFemaleSelected = formData.gender === "female";

  // Budget totals
  const budgetNum = parseInt(formData.budget) || 50000;
  const weeklyTotal = budgetNum * 7;
  const monthlyTotal = budgetNum * 30;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center font-sans w-full">
      {/* ── Header ── */}
      <header className="w-full max-w-lg px-6 py-5 sticky top-0 bg-white/80 backdrop-blur-md z-40 flex items-center justify-between border-b border-[#E8EAF0]">
        <button
          onClick={prevStep}
          className="p-2 rounded-full hover:bg-[#F3F4F5] transition-colors active:scale-90"
          type="button"
        >
          <ArrowLeft className="text-[#0F5238] w-5 h-5" />
        </button>

        <div className="flex gap-2 items-center">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={cn(
                "h-[6px] rounded-full transition-all duration-500",
                s === step
                  ? "w-7 bg-[#0F5238]"
                  : s < step
                  ? "w-[6px] bg-[#0F5238]/40"
                  : "w-[6px] bg-[#E1E3E4]"
              )}
            />
          ))}
        </div>

        <span className="text-xs font-semibold text-[#0F5238] bg-[#0F5238]/8 px-3 py-1 rounded-full">
          {step}/{totalSteps}
        </span>
      </header>

      {/* ── Content ── */}
      <main className="w-full max-w-lg px-6 pb-36 flex-grow overflow-y-auto">

        {/* ═══ STEP 1: Data Diri ═══ */}
        {step === 1 && (
          <div className="pt-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1D23] mb-1">Data Dirimu</h1>
              <p className="text-sm text-[#6B7280]">Ini membantu kami menghitung kebutuhan kalorimu.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "male", label: "Pria", Icon: Mars },
                { id: "female", label: "Wanita", Icon: Venus },
              ].map(({ id, label, Icon }) => {
                const active = formData.gender === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: id })}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 active:scale-95",
                      active
                        ? "border-[#0F5238] bg-[#0F5238]/5 shadow-lg shadow-[#0F5238]/10"
                        : "border-[#E8EAF0] bg-white hover:border-[#0F5238]/30"
                    )}
                  >
                    <Icon
                      className={cn("w-10 h-10 mb-2", active ? "text-[#0F5238]" : "text-[#9CA3AF]")}
                    />
                    <span className={cn("text-sm font-semibold", active ? "text-[#0F5238]" : "text-[#6B7280]")}>
                      {label}
                    </span>
                    {active && (
                      <div className="mt-2 w-5 h-5 rounded-full bg-[#0F5238] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide ml-1">Umur</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="24"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-2xl border border-[#E8EAF0] bg-white focus:ring-2 focus:ring-[#0F5238]/30 focus:border-[#0F5238] outline-none transition-all text-[#1A1D23] font-medium"
                    min="1" max="120"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF]">tahun</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "height", label: "Tinggi", unit: "cm", placeholder: "170" },
                  { key: "weight", label: "Berat", unit: "kg", placeholder: "65" },
                ].map(({ key, label, unit, placeholder }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide ml-1">{label}</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder={placeholder}
                        value={formData[key as "height" | "weight"]}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        className="w-full px-4 py-3.5 pr-14 rounded-2xl border border-[#E8EAF0] bg-white focus:ring-2 focus:ring-[#0F5238]/30 focus:border-[#0F5238] outline-none transition-all text-[#1A1D23] font-medium"
                        min="1"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF]">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 2: Target ═══ */}
        {step === 2 && (
          <div className="pt-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1D23] mb-1">Target Tubuhmu</h1>
              <p className="text-sm text-[#6B7280]">Pilih satu yang paling sesuai tujuanmu.</p>
            </div>

            <div className="space-y-3">
              {[
                { id: "weight_loss", title: "Turun Berat Badan", sub: "Fokus pada defisit kalori bergizi", Icon: TrendingDown, color: "#FF6B6B" },
                { id: "muscle_gain", title: "Tambah Massa Otot", sub: "Tinggi protein dan surplus terkontrol", Icon: Dumbbell, color: "#FF9F1C" },
                { id: "healthy_life", title: "Hidup Lebih Sehat", sub: "Seimbang & nutrisi mikro lengkap", Icon: Leaf, color: "#0F5238" },
                { id: "budget_healthy", title: "Hemat Makan Sehat", sub: "Nutrisi maksimal budget minimal", Icon: PiggyBank, color: "#7C3AED" },
              ].map(({ id, title, sub, Icon, color }) => {
                const active = formData.goal === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFormData({ ...formData, goal: id })}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] text-left",
                      active
                        ? "border-[#0F5238] bg-[#0F5238]/5 shadow-md shadow-[#0F5238]/10"
                        : "border-[#E8EAF0] bg-white hover:border-[#0F5238]/30"
                    )}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}18` }}
                    >
                      <Icon style={{ color }} size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-[#1A1D23]">{title}</div>
                      <div className="text-xs text-[#6B7280] mt-0.5">{sub}</div>
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                        active ? "border-[#0F5238] bg-[#0F5238]" : "border-[#D1D5DB]"
                      )}
                    >
                      {active && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ STEP 3: Budget ═══ */}
        {step === 3 && (
          <div className="pt-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1D23] mb-1">Budget Harian</h1>
              <p className="text-sm text-[#6B7280]">Kami akan menyesuaikan menu dengannya.</p>
            </div>

            {/* Visual banner */}
            <div className="w-full h-36 rounded-3xl overflow-hidden relative shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0F5238] via-[#1A7A54] to-[#2ECC71]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <Utensils size={32} className="mb-2 opacity-80" />
                <span className="text-3xl font-black">{formatRp(parseInt(formData.budget) || 50000)}</span>
                <span className="text-sm opacity-70 mt-1">per hari</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { val: "40000", label: "Rp40k", note: "Hemat" },
                { val: "50000", label: "Rp50k", note: "Standar" },
                { val: "75000", label: "Rp75k", note: "Fleksibel" },
              ].map(({ val, label, note }) => {
                const active = formData.budget === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFormData({ ...formData, budget: val })}
                    className={cn(
                      "py-4 px-2 rounded-2xl border-2 font-bold transition-all active:scale-95 flex flex-col items-center gap-0.5",
                      active
                        ? "bg-[#0F5238] text-white border-[#0F5238] shadow-lg shadow-[#0F5238]/25"
                        : "bg-white text-[#1A1D23] border-[#E8EAF0] hover:border-[#0F5238]/40"
                    )}
                  >
                    <span className="text-base">{label}</span>
                    <span className={cn("text-[10px] font-normal", active ? "text-white/70" : "text-[#9CA3AF]")}>{note}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide ml-1">Custom Budget</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#0F5238] text-sm">Rp</span>
                <input
                  type="number"
                  placeholder="Masukkan nominal..."
                  value={formData.budget}
                  onChange={(e) => {
                    setError("");
                    setFormData({ ...formData, budget: e.target.value });
                  }}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[#E8EAF0] bg-white focus:ring-2 focus:ring-[#0F5238]/30 focus:border-[#0F5238] outline-none transition-all text-[#1A1D23] font-medium"
                  min="40000"
                />
              </div>
              <p className="text-[11px] text-[#9CA3AF] ml-1">Minimal Rp 40.000 per hari</p>
            </div>
          </div>
        )}

        {/* ═══ STEP 4: Plan Type Selector ═══ */}
        {step === 4 && (
          <div className="pt-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1D23] mb-1">Pilih Tipe Rencana</h1>
              <p className="text-sm text-[#6B7280]">Seberapa jauh kamu ingin merencanakan makan?</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: "daily" as PlanType,
                  Icon: Utensils,
                  label: "Harian",
                  desc: "Pilih menu hari ini saja. Cocok jika kamu ingin fleksibel.",
                  budgetInfo: formatRp(budgetNum) + "/hari",
                  gradient: "from-[#FF6B6B] to-[#FF8E53]",
                  badge: "Fleksibel",
                },
                {
                  id: "weekly" as PlanType,
                  Icon: CalendarDays,
                  label: "Mingguan",
                  desc: "Atur menu 7 hari ke depan. Lihat & ubah setiap harinya.",
                  budgetInfo: formatRp(weeklyTotal) + "/minggu",
                  gradient: "from-[#0F5238] to-[#1A8A5A]",
                  badge: "Populer",
                },
                {
                  id: "monthly" as PlanType,
                  Icon: CalendarRange,
                  label: "Bulanan",
                  desc: "Rencanakan 30 hari sekaligus. Hemat waktu & pikiran.",
                  budgetInfo: formatRp(monthlyTotal) + "/bulan",
                  gradient: "from-[#7C3AED] to-[#A855F7]",
                  badge: "Komplit",
                },
              ].map(({ id, Icon, label, desc, budgetInfo, gradient, badge }) => {
                const active = planType === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPlanType(id)}
                    className={cn(
                      "w-full rounded-3xl border-2 p-5 transition-all duration-300 active:scale-[0.98] text-left relative overflow-hidden",
                      active
                        ? "border-transparent shadow-2xl shadow-black/15 scale-[1.02]"
                        : "border-[#E8EAF0] bg-white hover:border-[#0F5238]/30 hover:shadow-lg"
                    )}
                  >
                    {active && (
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-100", gradient)} />
                    )}
                    <div className="relative flex items-start gap-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
                          active ? "bg-white/20" : "bg-[#F3F4F5]"
                        )}
                      >
                        <Icon className={active ? "text-white" : "text-[#6B7280]"} size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("text-base font-bold", active ? "text-white" : "text-[#1A1D23]")}>{label}</span>
                          <span className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                            active ? "bg-white/25 text-white" : "bg-[#0F5238]/10 text-[#0F5238]"
                          )}>
                            {badge}
                          </span>
                        </div>
                        <p className={cn("text-xs leading-relaxed mb-2", active ? "text-white/80" : "text-[#6B7280]")}>
                          {desc}
                        </p>
                        <span className={cn(
                          "text-sm font-bold",
                          active ? "text-white" : "text-[#0F5238]"
                        )}>
                          {budgetInfo}
                        </span>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all",
                        active ? "border-white bg-white/30" : "border-[#D1D5DB]"
                      )}>
                        {active && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ STEP 5: Calendar ═══ */}
        {step === 5 && (
          <div className="pt-6 animate-in fade-in slide-in-from-bottom-3 duration-300 space-y-0">
            <div className="mb-4">
              <h1 className="text-xl font-bold text-[#1A1D23] mb-0.5">
                Rencana {planType === "weekly" ? "Mingguan" : "Bulanan"}
              </h1>
              <p className="text-xs text-[#6B7280]">
                Ketuk hari untuk melihat detail · Tekan 🔄 untuk mengganti menu
              </p>
            </div>

            {/* ── Weekly: Horizontal Day Strip ── */}
            {planType === "weekly" && (
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
                {dayPlans.map((day, idx) => {
                  const dayTotal = getDayTotal(day);
                  const overBudget = dayTotal > budgetNum;
                  const isSelected = idx === selectedDayIdx;
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const isToday = day.date.getTime() === today.getTime();
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setSelectedDayIdx(idx); setExpandedMeal(null); }}
                      className={cn(
                        "flex-shrink-0 w-14 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-200 border-2",
                        isSelected
                          ? "bg-[#0F5238] border-[#0F5238] shadow-lg shadow-[#0F5238]/30"
                          : "bg-white border-[#E8EAF0] hover:border-[#0F5238]/30"
                      )}
                    >
                      <span className={cn("text-[10px] font-semibold", isSelected ? "text-white/70" : "text-[#9CA3AF]")}>
                        {DAY_NAMES[day.date.getDay()]}
                      </span>
                      <span className={cn("text-base font-black", isSelected ? "text-white" : "text-[#1A1D23]")}>
                        {day.date.getDate()}
                      </span>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        overBudget ? "bg-red-400" : isSelected ? "bg-white/50" : "bg-[#0F5238]/30"
                      )} />
                      {isToday && (
                        <span className={cn("text-[9px] font-bold", isSelected ? "text-white" : "text-[#0F5238]")}>
                          Hari ini
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Monthly: Calendar Grid ── */}
            {planType === "monthly" && (
              <div className="bg-white rounded-3xl p-4 border border-[#E8EAF0] shadow-sm mb-4">
                <div className="text-center text-sm font-bold text-[#1A1D23] mb-3">
                  {MONTH_NAMES[dayPlans[0]?.date.getMonth() ?? new Date().getMonth()]} {dayPlans[0]?.date.getFullYear() ?? new Date().getFullYear()}
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAY_NAMES.map((d) => (
                    <div key={d} className="text-center text-[9px] font-semibold text-[#9CA3AF]">{d}</div>
                  ))}
                </div>
                {/* offset for first day */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: dayPlans[0]?.date.getDay() ?? 0 }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {dayPlans.map((day, idx) => {
                    const isSelected = idx === selectedDayIdx;
                    const overBudget = getDayTotal(day) > budgetNum;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => { setSelectedDayIdx(idx); setExpandedMeal(null); }}
                        className={cn(
                          "aspect-square rounded-xl flex items-center justify-center text-[11px] font-semibold transition-all duration-150 relative",
                          isSelected
                            ? "bg-[#0F5238] text-white shadow-md"
                            : "hover:bg-[#0F5238]/10 text-[#1A1D23]"
                        )}
                      >
                        {day.date.getDate()}
                        {overBudget && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-400 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Day Detail Panel ── */}
            {dayPlans[selectedDayIdx] && (
              <div className="mt-3 space-y-3">
                {/* Day header */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-[#1A1D23]">
                      {dayPlans[selectedDayIdx].date.toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[#6B7280]">Total:</span>
                      <span className={cn(
                        "text-xs font-bold",
                        getDayTotal(dayPlans[selectedDayIdx]) > budgetNum ? "text-red-500" : "text-[#0F5238]"
                      )}>
                        {formatRp(getDayTotal(dayPlans[selectedDayIdx]))}
                      </span>
                      {getDayTotal(dayPlans[selectedDayIdx]) > budgetNum && (
                        <span className="text-[10px] text-red-500 flex items-center gap-0.5">
                          <AlertCircle size={10} /> Lewat budget
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Meal slots */}
                {(
                  [
                    { key: "breakfast" as const, label: "Sarapan", Icon: Coffee, time: "07:00" },
                    { key: "lunch" as const, label: "Makan Siang", Icon: Sun, time: "12:00" },
                    { key: "dinner" as const, label: "Makan Malam", Icon: Moon, time: "19:00" },
                  ] as const
                ).map(({ key, label, Icon, time }) => {
                  const meal = dayPlans[selectedDayIdx][key];
                  const isExpanded = expandedMeal === key;
                  const isSwapping = swapTarget?.dayIdx === selectedDayIdx && swapTarget?.meal === key;
                  const swapList = menus ? menus[key] : [];

                  return (
                    <div key={key} className="bg-white rounded-2xl border border-[#E8EAF0] overflow-hidden shadow-sm">
                      {/* Meal header */}
                      <div className="flex items-center gap-3 p-4">
                        <div className="w-10 h-10 rounded-xl bg-[#0F5238]/8 flex items-center justify-center flex-shrink-0">
                          <Icon size={18} className="text-[#0F5238]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#6B7280]">{label}</span>
                            <span className="text-[10px] text-[#9CA3AF]">· {time}</span>
                          </div>
                          <div className="text-sm font-bold text-[#1A1D23] truncate">{meal.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-[#0F5238] font-semibold">{formatRp(meal.price)}</span>
                            <span className="text-[10px] text-[#9CA3AF]">{meal.calories} kkal</span>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (isSwapping) {
                                setSwapTarget(null);
                              } else {
                                setSwapTarget({ dayIdx: selectedDayIdx, meal: key });
                                setExpandedMeal(null);
                              }
                            }}
                            className={cn(
                              "p-2 rounded-xl transition-all text-xs font-semibold flex items-center gap-1",
                              isSwapping
                                ? "bg-[#0F5238] text-white"
                                : "bg-[#F3F4F5] text-[#6B7280] hover:bg-[#0F5238]/10 hover:text-[#0F5238]"
                            )}
                          >
                            <RefreshCw size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedMeal(isExpanded ? null : key);
                              setSwapTarget(null);
                            }}
                            className="p-2 rounded-xl bg-[#F3F4F5] text-[#6B7280] hover:bg-[#0F5238]/10 hover:text-[#0F5238] transition-all"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded: meal detail + image */}
                      {isExpanded && (
                        <div className="border-t border-[#F3F4F5] px-4 pb-4 pt-3 animate-in fade-in duration-200">
                          {meal.image && (
                            <img
                              src={meal.image}
                              alt={meal.name}
                              className="w-full h-32 object-cover rounded-xl mb-3"
                            />
                          )}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            {[
                              { label: "Kalori", val: `${meal.calories} kkal` },
                              { label: "Protein", val: `${meal.protein}g` },
                              { label: "Vendor", val: meal.vendor },
                            ].map(({ label, val }) => (
                              <div key={label} className="bg-[#F8F9FA] rounded-xl p-2">
                                <div className="text-[10px] text-[#9CA3AF]">{label}</div>
                                <div className="text-xs font-bold text-[#1A1D23] truncate">{val}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Swap sheet */}
                      {isSwapping && (
                        <div className="border-t border-[#E8EAF0] bg-[#F8F9FA] px-3 pb-3 pt-2 animate-in fade-in duration-200">
                          <p className="text-[10px] font-semibold text-[#9CA3AF] mb-2 uppercase tracking-wide">
                            Pilih pengganti (budget {formatRp(budgetNum)}/hari)
                          </p>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {swapList.map((item) => {
                              const isCurrent = item.id === meal.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  disabled={isCurrent}
                                  onClick={() => swapMeal(selectedDayIdx, key, item)}
                                  className={cn(
                                    "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left",
                                    isCurrent
                                      ? "bg-[#0F5238]/10 border border-[#0F5238]/20"
                                      : "bg-white border border-[#E8EAF0] hover:border-[#0F5238]/40 active:scale-[0.98]"
                                  )}
                                >
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-[#E8EAF0] flex-shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-bold text-[#1A1D23] truncate">{item.name}</div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-[#0F5238] font-semibold">{formatRp(item.price)}</span>
                                      <span className="text-[10px] text-[#9CA3AF]">{item.calories} kkal</span>
                                    </div>
                                  </div>
                                  {isCurrent && <Check size={14} className="text-[#0F5238] flex-shrink-0" />}
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

            {/* Budget Summary */}
            <div className="mt-4 bg-white rounded-2xl p-4 border border-[#E8EAF0] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#6B7280]">
                  Total {planType === "weekly" ? "7 Hari" : "30 Hari"}
                </span>
                <span className="text-base font-black text-[#0F5238]">
                  {formatRp(dayPlans.reduce((sum, d) => sum + getDayTotal(d), 0))}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-[#9CA3AF]">Budget target</span>
                <span className="text-sm font-bold text-[#9CA3AF]">
                  {formatRp(budgetNum * dayPlans.length)}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Fixed Footer ── */}
      <footer className="fixed bottom-0 w-full max-w-lg p-5 bg-white/90 backdrop-blur-xl z-50 border-t border-[#E8EAF0] flex flex-col gap-2.5 shadow-2xl shadow-black/5">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl font-medium animate-in fade-in slide-in-from-bottom-1 text-center flex items-center justify-center gap-2">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {/* Step 1–2: next */}
        {(step === 1 || step === 2) && (
          <Button onClick={nextStep} type="button" className="w-full py-4 rounded-full shadow-lg shadow-[#0F5238]/20">
            Lanjutkan
          </Button>
        )}

        {/* Step 3: save profile then go to step 4 */}
        {step === 3 && (
          <Button onClick={handleProfileSubmit} type="button" disabled={loading} className="w-full py-4 rounded-full shadow-lg shadow-[#0F5238]/20">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin w-5 h-5" />
                Menyimpan...
              </span>
            ) : "Lanjutkan"}
          </Button>
        )}

        {/* Step 4: choose plan type */}
        {step === 4 && (
          <Button
            onClick={handlePlanTypeNext}
            type="button"
            disabled={loadingMenus || loading}
            className="w-full py-4 rounded-full shadow-lg shadow-[#0F5238]/20"
          >
            {loadingMenus ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin w-5 h-5" />
                Memuat menu...
              </span>
            ) : loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin w-5 h-5" />
                Menyimpan profil...
              </span>
            ) : planType === "daily" ? "Mulai Hari Ini →" : "Lihat Kalender →"}
          </Button>
        )}

        {/* Step 5: save multi-day plan */}
        {step === 5 && (
          <Button onClick={handleSavePlan} type="button" disabled={loading} className="w-full py-4 rounded-full shadow-lg shadow-[#0F5238]/20">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin w-5 h-5" />
                Menyimpan rencana...
              </span>
            ) : `Simpan Rencana ${planType === "weekly" ? "Mingguan" : "Bulanan"} ✓`}
          </Button>
        )}
      </footer>
    </div>
  );
}
