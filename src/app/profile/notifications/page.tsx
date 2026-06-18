"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Utensils,
  Calendar,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NOTIF_SETTINGS = [
  {
    icon: Utensils,
    label: "Pengingat Makan",
    sub: "Notifikasi saat waktu makan tiba",
    key: "meal_reminder",
    defaultOn: true,
  },
  {
    icon: Calendar,
    label: "Meal Plan Siap",
    sub: "Notifikasi saat AI selesai membuat rencana",
    key: "plan_ready",
    defaultOn: true,
  },
  {
    icon: ShoppingBag,
    label: "Pesanan Siap Diambil",
    sub: "Notifikasi saat pesananmu sudah siap",
    key: "order_ready",
    defaultOn: true,
  },
  {
    icon: Sparkles,
    label: "Tips Nutrisi Harian",
    sub: "Tips dan rekomendasi kesehatan tiap hari",
    key: "nutrition_tips",
    defaultOn: false,
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_SETTINGS.map((s) => [s.key, s.defaultOn]))
  );

  const toggle = (key: string) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const anyOn = Object.values(toggles).some(Boolean);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border/50">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-primary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Notifikasi</h1>
      </header>

      <main className="flex-1 p-6 space-y-8 pb-24">
        {/* Status Banner */}
        <section
          className={cn(
            "p-5 rounded-2xl flex items-center gap-4 transition-all",
            anyOn
              ? "bg-primary/5 border border-primary/20"
              : "bg-muted/30 border border-border/50"
          )}
        >
          <div
            className={cn(
              "p-3 rounded-2xl",
              anyOn ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}
          >
            {anyOn ? <Bell size={24} /> : <BellOff size={24} />}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              {anyOn ? "Notifikasi Aktif" : "Semua Notifikasi Dimatikan"}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mt-0.5">
              {anyOn
                ? `${Object.values(toggles).filter(Boolean).length} dari ${NOTIF_SETTINGS.length} notifikasi aktif`
                : "Aktifkan minimal satu notifikasi agar tidak ketinggalan info penting"}
            </p>
          </div>
        </section>

        {/* Notification Toggles */}
        <section className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
            Kelola Notifikasi
          </label>
          <div className="flex flex-col gap-2">
            {NOTIF_SETTINGS.map((item) => {
              const isOn = toggles[item.key];
              return (
                <button
                  key={item.key}
                  onClick={() => toggle(item.key)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                    isOn
                      ? "bg-white border-border/50 shadow-sm"
                      : "bg-muted/20 border-border/30"
                  )}
                >
                  <div
                    className={cn(
                      "p-2.5 rounded-xl transition-colors flex-shrink-0",
                      isOn
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-sm font-bold", isOn ? "text-foreground" : "text-muted-foreground")}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mt-0.5">
                      {item.sub}
                    </p>
                  </div>
                  {/* Toggle Switch */}
                  <div
                    className={cn(
                      "w-11 h-6 rounded-full relative transition-all duration-300 flex-shrink-0",
                      isOn ? "bg-primary" : "bg-border"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300",
                        isOn ? "left-[22px]" : "left-0.5"
                      )}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Empty state */}
        <section className="bg-muted/20 rounded-2xl p-6 text-center border border-dashed border-border/50">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Belum Ada Riwayat Notifikasi
          </p>
          <p className="text-[10px] text-muted-foreground mt-2">
            Notifikasi terbaru akan muncul di sini setelah aktivitas pertamamu.
          </p>
        </section>
      </main>
    </div>
  );
}
