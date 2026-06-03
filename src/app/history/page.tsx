import React from "react";
import { History, Calendar, ChevronRight, Share2, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

const dummyHistory = [
  {
    date: "25 Mei 2026",
    totalMenus: 3,
    totalPrice: 48000,
    calories: 1050,
    protein: 65,
    status: "Selesai",
  },
  {
    date: "24 Mei 2026",
    totalMenus: 2,
    totalPrice: 35000,
    calories: 820,
    protein: 48,
    status: "Selesai",
  },
  {
    date: "23 Mei 2026",
    totalMenus: 3,
    totalPrice: 52000,
    calories: 1150,
    protein: 72,
    status: "Selesai",
  },
];

export default function HistoryPage() {
  return (
    <div className="flex flex-col gap-6 pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary">Riwayat Makan</h1>
        <p className="text-sm text-text-muted">Lacak konsumsi dan budget harianmu.</p>
      </header>

      <section className="flex flex-col gap-4">
        {dummyHistory.map((item, i) => (
          <div key={i} className="card-premium p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-2 text-primary">
                  <Calendar size={18} />
                  <span className="text-sm font-bold">{item.date}</span>
               </div>
               <div className="bg-success/10 text-success text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                  {item.status}
               </div>
            </div>
            
            <div className="flex justify-between items-end border-t border-border pt-3 mt-1">
               <div className="flex gap-4">
                  <div className="flex flex-col">
                     <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">Nutrisi</span>
                     <span className="text-sm font-bold text-text-primary">{item.calories} kkal / {item.protein}g</span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">Menus</span>
                     <span className="text-sm font-bold text-text-primary">{item.totalMenus} Item</span>
                  </div>
               </div>
               <div className="text-right flex flex-col items-end">
                  <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">Total</span>
                  <span className="text-base font-bold text-budget">Rp {item.totalPrice.toLocaleString('id-ID')}</span>
               </div>
            </div>
            
            <div className="flex gap-2 mt-2">
               <Button variant="outline" size="sm" className="flex-1 flex gap-2 rounded-xl text-xs">
                  <RefreshCw size={14} /> Re-use Plan
               </Button>
               <button className="p-2 bg-muted rounded-xl text-text-muted">
                  <Share2 size={16} />
               </button>
            </div>
          </div>
        ))}
      </section>

      <div className="mt-8 flex flex-col items-center gap-4 py-8 px-4 text-center bg-muted/20 rounded-2xl border border-dashed border-border">
          <History size={48} className="text-text-muted opacity-30" />
          <div className="flex flex-col gap-1">
             <h3 className="font-bold text-text-primary">Penasaran dengan progresmu?</h3>
             <p className="text-xs text-text-muted leading-relaxed">
                Terus konsisten mencatat meal plan harianmu untuk mendapatkan statistik nutrisi bulanan yang akurat.
             </p>
          </div>
          <Button size="md" className="w-full">Lihat Statistik Lengkap</Button>
      </div>
    </div>
  );
}
