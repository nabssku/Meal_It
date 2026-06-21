"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Utensils,
  Calendar,
  ShoppingBag,
  Sparkles,
  Trash2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getNotificationSettings,
  saveNotificationSettings,
  getNotificationHistory,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearNotificationHistory,
  NotificationItem,
} from "@/lib/notifications";

const NOTIF_SETTINGS = [
  {
    icon: Utensils,
    label: "Pengingat Makan",
    sub: "Notifikasi saat waktu makan tiba",
    key: "meal_reminder" as const,
  },
  {
    icon: Calendar,
    label: "Meal Plan Siap",
    sub: "Notifikasi saat AI selesai membuat rencana",
    key: "plan_ready" as const,
  },
  {
    icon: ShoppingBag,
    label: "Pesanan Siap Diambil",
    sub: "Notifikasi saat pesananmu sudah siap",
    key: "order_ready" as const,
  },
  {
    icon: Sparkles,
    label: "Tips Nutrisi Harian",
    sub: "Tips dan rekomendasi kesehatan tiap hari",
    key: "nutrition_tips" as const,
  },
];

function formatTimeAgo(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    if (diffHr < 24) return `${diffHr} jam yang lalu`;
    if (diffDays === 1) return "Kemarin";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "";
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [mounted, setMounted] = useState(false);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    meal_reminder: true,
    plan_ready: true,
    order_ready: true,
    nutrition_tips: false,
  });
  const [history, setHistory] = useState<NotificationItem[]>([]);

  // Load configuration and history on mount
  useEffect(() => {
    setMounted(true);
    if (userId) {
      setToggles(getNotificationSettings(userId));
      setHistory(getNotificationHistory(userId));
    }

    // Listen to real-time notification updates
    const handleUpdate = () => {
      if (userId) {
        setHistory(getNotificationHistory(userId));
      }
    };
    window.addEventListener("notifications_updated", handleUpdate);
    return () => {
      window.removeEventListener("notifications_updated", handleUpdate);
    };
  }, [userId]);

  const handleToggle = (key: string) => {
    const updated = { ...toggles, [key]: !toggles[key] };
    setToggles(updated);
    saveNotificationSettings(updated as any, userId);
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id, userId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(userId);
  };

  const handleDelete = (id: string) => {
    deleteNotification(id, userId);
  };

  const handleClearAll = () => {
    clearNotificationHistory(userId);
  };

  const anyOn = Object.values(toggles).some(Boolean);
  const activeCount = Object.values(toggles).filter(Boolean).length;
  const unreadCount = history.filter((item) => !item.read).length;

  if (!mounted || status === "loading") {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border/50">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-primary">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">Notifikasi</h1>
        </header>
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="animate-pulse text-sm text-muted-foreground font-semibold">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border/50">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-primary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Notifikasi</h1>
      </header>

      <main className="flex-1 p-6 space-y-8 pb-24 max-w-md mx-auto w-full">
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
                ? `${activeCount} dari ${NOTIF_SETTINGS.length} notifikasi aktif`
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
                  onClick={() => handleToggle(item.key)}
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

        {/* Notification History List */}
        <section className="space-y-3">
          {history.length > 0 ? (
            <>
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Riwayat Notifikasi
                </label>
                <div className="flex gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest flex items-center gap-1"
                    >
                      <Check size={10} strokeWidth={3} />
                      Tandai Dibaca
                    </button>
                  )}
                  <button
                    onClick={handleClearAll}
                    className="text-[10px] font-black text-red-500 hover:underline uppercase tracking-widest flex items-center gap-1"
                  >
                    <Trash2 size={10} strokeWidth={3} />
                    Hapus Semua
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {history.map((item) => {
                  const setting = NOTIF_SETTINGS.find((s) => s.key === item.type);
                  const Icon = setting ? setting.icon : Bell;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleMarkAsRead(item.id)}
                      className={cn(
                        "flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden group",
                        item.read
                          ? "bg-white border-border/50 shadow-sm"
                          : "bg-primary/5 border-primary/20 shadow-md shadow-primary/5"
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          "p-2.5 rounded-xl transition-colors flex-shrink-0 self-start",
                          item.read
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        <Icon size={20} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2">
                          <p
                            className={cn(
                              "text-sm font-bold truncate",
                              item.read ? "text-foreground/80" : "text-foreground"
                            )}
                          >
                            {item.title}
                          </p>
                          {!item.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 animate-pulse" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          {item.message}
                        </p>
                        <span className="text-[9px] text-muted-foreground/80 block mt-2 font-medium">
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground/30 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Hapus notifikasi"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                Riwayat Notifikasi
              </label>
              {/* Empty state */}
              <section className="bg-muted/20 rounded-2xl p-6 text-center border border-dashed border-border/50">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Belum Ada Riwayat Notifikasi
                </p>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Notifikasi terbaru akan muncul di sini setelah aktivitas pertamamu.
                </p>
              </section>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
