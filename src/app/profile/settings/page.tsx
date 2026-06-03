"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, ShieldCheck, Database, HelpCircle } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 flex items-center gap-4 border-b border-border/50">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-primary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Pengaturan</h1>
      </header>
      <main className="flex-1 p-4 space-y-2">
        {[
          { icon: ShieldCheck, label: "Keamanan Akun", sub: "Password & autentikasi dua faktor" },
          { icon: Database, label: "Data & Privasi", sub: "Atur penggunaan data pribadimu" },
          { icon: HelpCircle, label: "Pusat Bantuan", sub: "FAQ dan kontak dukungan" },
        ].map((item, i) => (
          <button key={i} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-all text-left">
            <div className="p-2.5 bg-muted rounded-xl text-muted-foreground">
              <item.icon size={20} />
            </div>
            <div className="flex-1 flex flex-col">
              <span className="text-sm font-bold text-foreground">{item.label}</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{item.sub}</span>
            </div>
          </button>
        ))}
      </main>
    </div>
  );
}
