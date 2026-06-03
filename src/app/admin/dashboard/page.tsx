import React from "react";
import { Users, Store, Utensils, AlertCircle, TrendingUp, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import StatCard from "@/components/cards/StatCard";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary">Admin Control Panel</h1>
        <p className="text-sm text-text-muted">Manajemen ekosistem MEALIT.</p>
      </header>

      <section className="grid grid-cols-2 gap-4">
         <StatCard label="Total User" value="2.450" icon={Users} color="primary" />
         <StatCard label="Vendor Aktif" value="38" icon={Store} color="success" />
         <StatCard label="Total Menu" value="156" icon={Utensils} color="warning" />
         <StatCard label="Laporan" value="4" icon={AlertCircle} color="budget" />
      </section>

      <section className="flex flex-col gap-4">
         <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-text-primary">Pending Verifikasi</h3>
            <span className="text-[10px] font-bold text-budget bg-budget/10 px-2 py-1 rounded-full uppercase">8 Vendor Baru</span>
         </div>
         <div className="flex flex-col gap-3">
             {[1, 2, 3].map((v) => (
                <div key={v} className="card-premium p-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                         <img src={`https://ui-avatars.com/api/?name=V${v}&background=random`} alt="Vendor" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-sm font-bold text-text-primary">Vendor Katering {v}</span>
                         <span className="text-[10px] text-text-muted">Terdaftar 2 jam yang lalu</span>
                      </div>
                   </div>
                   <ChevronRight size={18} className="text-text-muted" />
                </div>
             ))}
         </div>
      </section>

      <section className="flex flex-col gap-4">
         <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-text-primary">Aktivitas Terbaru</h3>
            <span className="text-xs font-bold text-primary underline">Lihat Log</span>
         </div>
         <div className="flex flex-col gap-4">
             <div className="flex gap-4">
                <div className="p-2 bg-success/10 text-success rounded-lg self-start">
                   <CheckCircle2 size={16} />
                </div>
                <div className="flex flex-col gap-1">
                   <p className="text-xs text-text-primary font-medium">
                      <span className="font-bold">Bagus Sajiwo</span> baru saja top up Rp 100.000 via GoPay.
                   </p>
                   <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Clock size={10} /> 5 menit yang lalu
                   </span>
                </div>
             </div>
             <div className="flex gap-4">
                <div className="p-2 bg-primary/10 text-primary rounded-lg self-start">
                   <TrendingUp size={16} />
                </div>
                <div className="flex flex-col gap-1">
                   <p className="text-xs text-text-primary font-medium">
                      <span className="font-bold">AI Analyzer</span> berhasil mengoptimasi 12 menu katering.
                   </p>
                   <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Clock size={10} /> 15 menit yang lalu
                   </span>
                </div>
             </div>
         </div>
      </section>
    </div>
  );
}
