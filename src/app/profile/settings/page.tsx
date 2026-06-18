"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Database,
  HelpCircle,
  ChevronRight,
  FileText,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SETTING_GROUPS = [
  {
    title: "Keamanan",
    items: [
      {
        icon: ShieldCheck,
        label: "Keamanan Akun",
        sub: "Password & autentikasi dua faktor",
        href: null,
        color: "bg-blue-100 text-blue-600",
      },
      {
        icon: Database,
        label: "Data & Privasi",
        sub: "Atur penggunaan data pribadimu",
        href: null,
        color: "bg-purple-100 text-purple-600",
      },
    ],
  },
  {
    title: "Bantuan",
    items: [
      {
        icon: HelpCircle,
        label: "Pusat Bantuan",
        sub: "FAQ dan pertanyaan umum",
        href: "/help",
        color: "bg-green-100 text-green-600",
      },
      {
        icon: Phone,
        label: "Hubungi Kami",
        sub: "Laporkan masalah atau beri saran",
        href: "/contact",
        color: "bg-orange-100 text-orange-600",
      },
      {
        icon: FileText,
        label: "Tentang Mealit",
        sub: "Versi aplikasi dan lisensi",
        href: "/about",
        color: "bg-primary/10 text-primary",
      },
    ],
  },
];

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border/50">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-primary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Pengaturan</h1>
      </header>

      <main className="flex-1 p-4 space-y-8 pb-24">
        {SETTING_GROUPS.map((group) => (
          <section key={group.title} className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
              {group.title}
            </label>
            <div className="flex flex-col gap-2">
              {group.items.map((item, i) => {
                const content = (
                  <>
                    <div className={cn("p-2.5 rounded-xl flex-shrink-0", item.color)}>
                      <item.icon size={20} />
                    </div>
                    <div className="flex-1 text-left flex flex-col">
                      <span className="text-sm font-bold text-foreground">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        {item.sub}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground/40 flex-shrink-0" />
                  </>
                );

                if (item.href) {
                  return (
                    <Link
                      key={i}
                      href={item.href}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-border/50 shadow-sm hover:shadow-md transition-all"
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={i}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-border/50 shadow-sm hover:shadow-md transition-all text-left"
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        {/* Version */}
        <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold opacity-30 pt-4">
          MEALIT v1.0.0 (Alpha)
        </p>
      </main>
    </div>
  );
}
