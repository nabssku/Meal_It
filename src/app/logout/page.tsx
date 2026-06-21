"use client";

import React, { useState, Suspense } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { performLogout } from "./actions";

function LogoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/login";

  const handleLogout = async () => {
    setLoading(true);
    // Use server action to reliably clear Auth.js cookies
    await performLogout(callbackUrl);
  };

  return (
    <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-border/50 text-center shadow-lg mx-auto">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <LogOut size={32} className="text-red-500" />
      </div>
      
      <h1 className="text-2xl font-bold text-foreground mb-2">Konfirmasi Keluar</h1>
      <p className="text-muted-foreground text-sm font-medium mb-8">
        Sesi Anda akan diakhiri dan cookie akan dihapus. Anda harus masuk kembali untuk mengakses Mealit.
      </p>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-red-500 hover:bg-red-600 active:scale-[0.98] transition-all text-white font-bold py-3.5 rounded-2xl disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <><LogOut size={18} /> Ya, Keluar</>}
        </button>
        
        <button
          onClick={() => router.back()}
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-muted hover:bg-muted/80 active:scale-[0.98] transition-all text-foreground font-bold py-3.5 rounded-2xl"
        >
          Batal
        </button>
      </div>
    </div>
  );
}

export default function LogoutPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 absolute inset-0 z-50">
      <Suspense fallback={<Loader2 className="animate-spin text-primary" />}>
        <LogoutContent />
      </Suspense>
    </div>
  );
}
