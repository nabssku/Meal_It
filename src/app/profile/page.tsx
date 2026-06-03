"use client";

import React from "react";
import Link from "next/link";
import { 
  User, 
  Shield, 
  ChevronRight, 
  Bell, 
  Settings, 
  LogOut, 
  Heart, 
  Wallet 
} from "lucide-react";
import Button from "@/components/ui/Button";

const menuItems = [
  { icon: User, label: "Detail Profil", sub: "Atur informasi pribadimu", href: "/profile/edit" },
  { icon: Shield, label: "Preferensi Diet", sub: "Target kalori, protein, dan goal", href: "/profile/diet" },
  { icon: Wallet, label: "Budget & Dompet", sub: "Atur batas pengeluaran harian", href: "/profile/budget" },
  { icon: Heart, label: "Preferensi & Alergi", sub: "Pantangan dan makanan favorit", href: "/profile/preferences" },
  { icon: Bell, label: "Notifikasi", sub: "Atur pengingat makan", href: "/profile/notifications" },
  { icon: Settings, label: "Pengaturan", sub: "Keamanan dan data", href: "/profile/settings" },
];

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex flex-col items-center gap-4 pt-10 text-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary/20 border-4 border-white shadow-lg overflow-hidden">
            <img 
              src="https://ui-avatars.com/api/?name=Bagus+Sajiwo&size=128&background=0F5238&color=fff" 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 right-0 p-1.5 bg-green-500 text-white rounded-full border-2 border-white">
             <Shield size={12} strokeWidth={3} />
          </div>
        </div>
        <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold text-foreground">Bagus Sajiwo</h1>
            <p className="text-sm text-muted-foreground italic">"Hidup sehat, dompet selamat"</p>
        </div>
      </header>

      {/* Health Badge Section */}
      <section className="bg-primary/5 rounded-2xl p-4 flex justify-around items-center border border-primary/10 mx-4">
         <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Target</span>
            <span className="text-sm font-bold text-primary">Weight Loss</span>
         </div>
         <div className="w-px h-8 bg-border/50" />
         <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">BMI</span>
            <span className="text-sm font-bold text-green-600">22.5 (Ideal)</span>
         </div>
         <div className="w-px h-8 bg-border/50" />
         <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Streak</span>
            <span className="text-sm font-bold text-orange-500">12 Hari</span>
         </div>
      </section>

      {/* Profile Menu */}
      <section className="flex flex-col gap-1 px-4">
        {menuItems.map((item, i) => (
          <Link 
            key={i} 
            href={item.href}
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-all group"
          >
             <div className="p-2.5 bg-muted rounded-xl text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <item.icon size={20} />
             </div>
             <div className="flex-1 text-left flex flex-col">
                <span className="text-sm font-bold text-foreground">{item.label}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{item.sub}</span>
             </div>
             <ChevronRight size={18} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </section>

      <section className="mt-4 px-6">
        <Button 
          variant="outline" 
          size="full" 
          className="border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 font-bold flex gap-2 rounded-xl h-14"
        >
            <LogOut size={18} />
            Keluar Aplikasi
        </Button>
        <p className="text-[10px] text-center text-muted-foreground mt-8 uppercase tracking-widest font-bold opacity-30">
          MEALIT v1.0.0 (Alpha)
        </p>
      </section>
    </div>
  );
}
