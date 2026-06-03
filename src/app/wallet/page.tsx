"use client";

import React from "react";
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Coffee, Utensils, ShoppingBag } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";

const data = [
  { day: "Sen", amount: 45000 },
  { day: "Sel", amount: 52000 },
  { day: "Rab", amount: 38000 },
  { day: "Kam", amount: 60000 },
  { day: "Jum", amount: 42000 },
  { day: "Sab", amount: 25000 },
  { day: "Min", amount: 30000 },
];

const transactions = [
  { icon: Utensils, name: "Makan Siang", date: "Hari ini, 12:30", amount: -25000, type: "expense" },
  { icon: Coffee, name: "Snack Sehat", date: "Hari ini, 10:15", amount: -15000, type: "expense" },
  { icon: ArrowUpRight, name: "Top Up Budget", date: "Kemarin, 18:00", amount: 100000, type: "income" },
  { icon: ShoppingBag, name: "Catering Mingguan", date: "24 Mei, 09:00", amount: -150000, type: "expense" },
];

export default function WalletPage() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary">Nutri-Wallet</h1>
        <p className="text-sm text-text-muted">Pantau pengeluaran dan nutrisimu.</p>
      </header>

      {/* Balance Card */}
      <section className="bg-gradient-to-br from-budget to-orange-600 rounded-2xl p-6 text-white shadow-xl shadow-budget/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex justify-between items-start">
             <div className="flex flex-col gap-1">
                <span className="text-xs text-white/80 font-medium uppercase tracking-wider">Total Saldo Budget</span>
                <div className="text-3xl font-bold">Rp 350.000</div>
             </div>
             <div className="bg-white/20 p-2 rounded-lg">
                <Wallet size={24} />
             </div>
          </div>
          <div className="flex gap-4">
             <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex items-center gap-1 text-[10px] text-white/70 uppercase font-bold">
                    <ArrowDownRight size={10} className="text-red-300" />
                    Keluar
                </div>
                <div className="text-sm font-bold">Rp 42.000</div>
             </div>
             <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex items-center gap-1 text-[10px] text-white/70 uppercase font-bold">
                    <ArrowUpRight size={10} className="text-green-300" />
                    Masuk
                </div>
                <div className="text-sm font-bold">Rp 100.000</div>
             </div>
          </div>
        </div>
      </section>

      {/* Spending Chart */}
      <section className="card-premium p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h3 className="font-bold text-text-primary">Statistik Mingguan</h3>
            <span className="text-[10px] text-text-muted">Rata-rata Rp 41.500 / hari</span>
          </div>
          <div className="text-success flex items-center gap-1 text-xs font-bold">
            <TrendingUp size={14} />
            -12%
          </div>
        </div>
        
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.amount > 50000 ? "#F97316" : "#2D6A4F"} 
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 600, fill: "#707973" }}
                dy={10}
              />
              <Tooltip 
                cursor={{ fill: "transparent" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 shadow-lg rounded-lg border border-border text-[10px] font-bold">
                        Rp {payload[0].value?.toLocaleString('id-ID')}
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Recent History */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-text-primary">Aktivitas Terakhir</h3>
          <button className="text-xs font-bold text-primary underline">Lihat Semua</button>
        </div>
        <div className="flex flex-col gap-4">
          {transactions.map((tx, i) => (
            <div key={i} className="flex items-center gap-4">
               <div className={`p-3 rounded-xl ${tx.amount > 0 ? "bg-success/10 text-success" : "bg-muted text-text-muted"}`}>
                  <tx.icon size={20} />
               </div>
               <div className="flex-1 flex flex-col">
                  <span className="text-sm font-bold text-text-primary">{tx.name}</span>
                  <span className="text-[10px] text-text-muted">{tx.date}</span>
               </div>
               <div className={`text-sm font-bold ${tx.amount > 0 ? "text-success" : "text-text-primary"}`}>
                  {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString('id-ID')}
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
