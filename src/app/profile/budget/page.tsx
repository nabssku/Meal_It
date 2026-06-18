"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Wallet, TrendingDown, Check, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { updateBudget, getUserBudgetAction } from "@/app/actions/user-actions";

export default function BudgetSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [budget, setBudget] = useState("50000");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getUserBudgetAction()
      .then((val) => {
        setBudget(String(val));
      })
      .catch((err) => {
        console.error(err);
        setError("Gagal memuat data budget.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setError("");
    const parsedBudget = parseInt(budget);
    if (isNaN(parsedBudget) || parsedBudget < 40000) {
      setError("Jumlah budget tidak boleh kurang dari Rp 40.000.");
      return;
    }
    setSaving(true);
    try {
      await updateBudget(parsedBudget);
      setSuccess(true);
      setTimeout(() => router.back(), 1500);
    } catch (err: unknown) {
      const e = err as Error;
      console.error(e);
      setError(e?.message || "Terjadi kesalahan saat menyimpan budget.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border/50">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-primary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Budget Harian</h1>
      </header>

      {loading ? (
        <main className="flex-1 p-6 flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat data budget...</p>
        </main>
      ) : (
        <main className="flex-1 p-6 space-y-8 pb-40">
          {/* Card */}
          <section className="bg-primary p-6 rounded-[32px] shadow-xl shadow-primary/20 relative overflow-hidden text-white">
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-60">Budget Harian Aktif</span>
                  <span className="text-3xl font-black">
                    Rp{parseInt(budget || "0").toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                  <Wallet size={24} />
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <div>
                  <span className="text-[10px] uppercase font-bold opacity-60 tracking-wider">Status</span>
                  <div className="text-sm font-bold">Aktif & Terkonfigurasi ✓</div>
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Resep Terjangkau Aktif
                </div>
              </div>
            </div>
            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          </section>

          {/* Quick Pick */}
          <section className="space-y-4">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
              Pilih Limit Harian
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["40000", "50000", "75000"].map((val) => (
                <button
                  key={val}
                  onClick={() => { setError(""); setBudget(val); }}
                  className={cn(
                    "py-4 rounded-xl border transition-all font-black text-sm",
                    budget === val
                      ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                      : "bg-muted/30 border-border/50 text-foreground hover:bg-muted/50"
                  )}
                >
                  Rp{parseInt(val) / 1000}k
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="relative group pt-2">
              <span className="absolute left-4 top-[calc(50%+10px)] -translate-y-1/2 font-bold text-primary">Rp</span>
              <input
                type="number"
                placeholder="Custom Budget..."
                value={budget}
                onChange={(e) => { setError(""); setBudget(e.target.value); }}
                min="40000"
                className="w-full pl-12 pr-4 py-4 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-lg"
              />
            </div>
            <p className="text-[10px] text-muted-foreground italic px-2">
              * Mengubah budget akan memperbarui rekomendasi menu di Dashboard secara otomatis.
            </p>
          </section>

          {/* Info */}
          <section className="space-y-4">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Info</label>
            <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <TrendingDown size={18} />
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-foreground block">Hemat Lebih Banyak</span>
                <span className="text-[10px] text-muted-foreground">
                  AI kami menyesuaikan menu berdasarkan budget harian yang kamu tetapkan.
                </span>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Fixed footer above bottom nav */}
      {!loading && (
        <footer className="fixed bottom-[64px] left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-border/50 z-40 flex flex-col gap-3">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl font-medium text-center">
              {error}
            </div>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || success}
            className={cn(
              "w-full h-14 rounded-2xl shadow-lg flex gap-2 font-bold transition-all duration-500",
              success ? "bg-green-500 shadow-green-500/20" : "shadow-primary/20"
            )}
          >
            {saving ? (
              <><Loader2 size={20} className="animate-spin" />Menyimpan...</>
            ) : success ? (
              <><Check size={20} />Berhasil Diperbarui</>
            ) : (
              <><Save size={20} />Simpan Budget Baru</>
            )}
          </Button>
        </footer>
      )}
    </div>
  );
}
