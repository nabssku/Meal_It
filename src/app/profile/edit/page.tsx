"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User as UserIcon, Mail, Phone, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border/50">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-primary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Detail Profil</h1>
      </header>

      <main className="flex-1 p-6 space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-muted overflow-hidden border-4 border-white shadow-md">
              <img 
                src="https://ui-avatars.com/api/?name=Bagus+Sajiwo&size=128&background=0F5238&color=fff" 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform">
              <UserIcon size={14} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Ketuk untuk ubah foto</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Nama Lengkap</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input 
                type="text" 
                defaultValue="Bagus Sajiwo"
                className="w-full pl-12 pr-4 py-4 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input 
                type="email" 
                defaultValue="bagus@example.com"
                className="w-full pl-12 pr-4 py-4 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Nomor Telepon</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input 
                type="tel" 
                defaultValue="+62 812 3456 7890"
                className="w-full pl-12 pr-4 py-4 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Lokasi</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input 
                type="text" 
                defaultValue="Jakarta, Indonesia"
                className="w-full pl-12 pr-4 py-4 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="p-6 bg-background/80 backdrop-blur-md border-t border-border/50 sticky bottom-0">
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full h-14 rounded-2xl shadow-lg shadow-primary/20 flex gap-2 font-bold"
        >
          {loading ? "Menyimpan..." : (
            <>
              <Save size={20} />
              Simpan Perubahan
            </>
          )}
        </Button>
      </footer>
    </div>
  );
}
