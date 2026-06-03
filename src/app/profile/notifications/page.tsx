"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, BellOff, Clock } from "lucide-react";

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 flex items-center gap-4 border-b border-border/50">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-primary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Notifikasi</h1>
      </header>
      <main className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
          <BellOff size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Belum ada notifikasi</h2>
          <p className="text-sm text-muted-foreground px-8">
            Kami akan memberitahumu saat rencana makan baru siap atau ada pengingat budget.
          </p>
        </div>
      </main>
    </div>
  );
}
