"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Calendar, CalendarDays, CalendarRange, Check, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { updatePlannerPeriodAction } from "@/app/actions/user-actions";
import { getUserSettingsAction } from "@/app/actions/meal-actions";

export default function PlannerPeriodPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("daily");

  useEffect(() => {
    getUserSettingsAction().then((settings) => {
      setPeriod(settings.plannerPeriod || "daily");
    });
  }, []);

  const handleSave = async () => {
    setError("");
    setLoading(true);
    try {
      await updatePlannerPeriodAction(period);
      setSuccess(true);
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal menyimpan konfigurasi.");
    } finally {
      setLoading(false);
    }
  };

  const OPTIONS = [
    {
      id: "daily",
      label: "Harian",
      sub: "Rencana makan satu hari",
      desc: "Cocok untuk Anda yang menyukai fleksibilitas tinggi dan suka mengganti menu makanan setiap hari dengan rekomendasi AI.",
      icon: Calendar,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "weekly",
      label: "Mingguan",
      sub: "Rencana makan 7 hari",
      desc: "Menyusun jadwal makanan otomatis untuk satu minggu ke depan. Hemat waktu dan pengeluaran makan lebih terencana.",
      icon: CalendarDays,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "monthly",
      label: "Bulanan",
      sub: "Rencana makan 30 hari",
      desc: "Solusi otomatisasi menu lengkap untuk 30 hari. Sangat praktis, bebas stres memikirkan makanan, dan hemat maksimal.",
      icon: CalendarRange,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-md mx-auto w-full relative">
      <header className="p-4 flex items-center gap-4 relative bg-background z-10 border-b border-border/50">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-primary active:scale-95 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Periode Planner</h1>
      </header>

      <main className="flex-1 p-6 space-y-6 pb-32">
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-foreground">Pilih Mode Perencanaan</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Atur bagaimana Mealit menyusun rekomendasi dan rencana makan harian Anda. Mode ini dapat diganti kapan saja.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-xs">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Gagal Menyimpan</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <section className="space-y-4">
          {OPTIONS.map((opt) => {
            const isActive = period === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setPeriod(opt.id)}
                className={cn(
                  "w-full flex flex-col gap-3 p-4 rounded-2xl border text-left transition-all active:scale-[0.98] group",
                  isActive
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/10"
                    : "bg-white border-border hover:border-primary/30 shadow-sm"
                )}
              >
                <div className="flex items-center gap-3 w-full">
                  <div
                    className={cn(
                      "p-2.5 rounded-xl transition-colors",
                      isActive ? "bg-white/20 text-white" : opt.color
                    )}
                  >
                    <opt.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{opt.label}</div>
                    <div
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        isActive ? "text-white/70" : "text-muted-foreground"
                      )}
                    >
                      {opt.sub}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      isActive ? "border-white bg-white" : "border-muted-foreground/30"
                    )}
                  >
                    {isActive && <Check size={12} className="text-primary stroke-[3]" />}
                  </div>
                </div>
                <p
                  className={cn(
                    "text-xs leading-relaxed font-normal",
                    isActive ? "text-white/90" : "text-muted-foreground"
                  )}
                >
                  {opt.desc}
                </p>
              </button>
            );
          })}
        </section>
      </main>

      {/* Floating Save Button */}
      <div className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto p-4 bg-gradient-to-t from-background via-background/95 to-transparent z-40">
        {success ? (
          <div className="flex items-center justify-center gap-2 p-4 bg-success/10 border border-success/20 rounded-2xl text-success font-bold text-sm">
            <Check size={18} className="stroke-[3]" />
            Berhasil Diubah!
          </div>
        ) : (
          <Button
            size="lg"
            className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold shadow-lg shadow-primary/15"
            onClick={handleSave}
            disabled={loading}
          >
            <Save size={18} />
            {loading ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        )}
      </div>
    </div>
  );
}
