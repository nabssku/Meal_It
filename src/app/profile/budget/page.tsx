"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Wallet, TrendingDown, History, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { updateBudget } from "@/app/actions/user-actions";

export default function BudgetSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState("30000");
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateBudget(parseInt(budget));
      setSuccess(true);
      setTimeout(() => {
        router.back();
      }, 1500);
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
        <h1 className="text-lg font-bold">Budget & Dompet</h1>
      </header>

      <main className="flex-1 p-6 space-y-8">
        <section className="bg-primary p-6 rounded-[32px] shadow-xl shadow-primary/20 relative overflow-hidden text-white">
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Sisa Budget Hari Ini</span>
                <span className="text-3xl font-black">Rp12,500</span>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <Wallet size={24} />
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
              <div>
                <span className="text-[10px] uppercase font-bold opacity-60 tracking-wider">Limit Harian Aktif</span>
                <div className="text-xl font-bold">Rp{parseInt(budget).toLocaleString('id-ID')}</div>
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Resep Terjangkau Aktif
              </div>
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        </section>

        <section className="space-y-4">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Ubah Limit Harian</label>
          <div className="grid grid-cols-3 gap-3">
            {["20000", "30000", "50000"].map((val) => (
              <button 
                key={val}
                onClick={() => setBudget(val)}
                className={cn(
                  "py-4 rounded-xl border transition-all font-black text-sm",
                  budget === val 
                    ? "bg-primary border-primary text-white shadow-md" 
                    : "bg-muted/30 border-border/50 text-foreground hover:bg-muted/50"
                )}
              >
                Rp{parseInt(val)/1000}k
              </button>
            ))}
          </div>

          <div className="relative group pt-2">
            <span className="absolute left-4 top-[calc(50%+10px)] -translate-y-1/2 font-bold text-primary">Rp</span>
            <input 
              type="number" 
              placeholder="Custom Budget..."
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-lg"
            />
          </div>
          <p className="text-[10px] text-muted-foreground italic px-2">
            * Mengubah budget akan memperbarui rekomendasi menu di Dashboard secara otomatis.
          </p>
        </section>

        <section className="space-y-4">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Statistik Pengeluaran</label>
          <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <TrendingDown size={18} />
              </div>
              <span className="text-sm font-bold text-foreground">Hemat Minggu Ini</span>
            </div>
            <span className="text-sm font-black text-green-600">Rp45.000</span>
          </div>
          <button className="w-full py-4 flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">
            <History size={16} />
            Lihat Riwayat Dompet
          </button>
        </section>
      </main>

      <footer className="p-6 bg-background/80 backdrop-blur-md border-t border-border/50 sticky bottom-0">
        <Button 
          onClick={handleSave} 
          disabled={loading || success}
          className={cn(
            "w-full h-14 rounded-2xl shadow-lg flex gap-2 font-bold transition-all duration-500",
            success ? "bg-green-500 shadow-green-500/20" : "shadow-primary/20"
          )}
        >
          {loading ? "Memproses..." : success ? (
            <>
              <Check size={20} />
              Berhasil Diperbarui
            </>
          ) : (
            <>
              <Save size={20} />
              Simpan Budget Baru
            </>
          )}
        </Button>
      </footer>
    </div>
  );
}
