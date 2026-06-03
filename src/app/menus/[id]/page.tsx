"use client";

import React from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { ChevronLeft, Share2, Heart, ShieldCheck, MapPin, Star, Flame, Target, Utensils } from "lucide-react";

export default function MenuDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-6 pb-24 -mt-6">
      {/* Hero Image */}
      <div className="relative h-72 -mx-4 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1593001007050-48429445f171?auto=format&fit=crop&q=80&w=600" 
          alt="Menu"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-10 left-4 right-4 flex justify-between">
           <Link href="/menus" className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
              <ChevronLeft size={24} />
           </Link>
           <div className="flex gap-2">
              <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                 <Share2 size={20} />
              </button>
              <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                 <Heart size={20} />
              </button>
           </div>
        </div>
        <div className="absolute bottom-4 left-4 bg-primary text-white text-[10px] font-bold py-1 px-3 rounded-full flex items-center gap-1">
            <ShieldCheck size={12} />
            DIKONTROL OLEH AI
        </div>
      </div>

      {/* Basic Info */}
      <section className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
           <h1 className="text-2xl font-bold text-text-primary uppercase letter tracking-tight">Ayam Penyet Sehat</h1>
           <div className="text-xl font-black text-budget">Rp 22.000</div>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-text-muted">
           <div className="flex items-center gap-1">
              <Star size={14} className="text-warning fill-warning" />
              <span>4.9 (120+ Review)</span>
           </div>
           <span>•</span>
           <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>Katering Mama Lita</span>
           </div>
        </div>
      </section>

      {/* Nutrition Grid */}
      <section className="grid grid-cols-3 gap-3">
         <div className="bg-primary/5 p-3 rounded-2xl flex flex-col items-center gap-1">
            <Flame size={18} className="text-warning" />
            <span className="text-sm font-bold text-text-primary">420</span>
            <span className="text-[8px] font-bold text-text-muted uppercase">Kalori</span>
         </div>
         <div className="bg-primary/5 p-3 rounded-2xl flex flex-col items-center gap-1">
            <Target size={18} className="text-primary" />
            <span className="text-sm font-bold text-text-primary">32g</span>
            <span className="text-[8px] font-bold text-text-muted uppercase">Protein</span>
         </div>
         <div className="bg-primary/5 p-3 rounded-2xl flex flex-col items-center gap-1">
            <Utensils size={18} className="text-success" />
            <span className="text-sm font-bold text-text-primary">15g</span>
            <span className="text-[8px] font-bold text-text-muted uppercase">Lemak</span>
         </div>
      </section>

      {/* Description */}
      <section className="flex flex-col gap-3">
         <h3 className="font-bold text-text-primary">Deskripsi</h3>
         <p className="text-sm text-text-secondary leading-relaxed">
            Dada ayam bakar tanpa kulit dengan bumbu rempah tradisional pilihan. Disajikan dengan nasi merah, tempe rebus, dan salad sayur segar. Sangat cocok untuk program diet tinggi protein.
         </p>
      </section>

      {/* Vendor Info */}
      <section className="card-premium p-4 flex items-center justify-between border-none bg-muted/30">
         <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white">
               <img src="https://ui-avatars.com/api/?name=Mama+Lita&background=0F5238&color=fff" alt="Vendor" />
            </div>
            <div className="flex flex-col">
               <span className="text-sm font-bold text-text-primary">Katering Mama Lita</span>
               <span className="text-[10px] text-success font-bold flex items-center gap-1">
                  <ShieldCheck size={10} /> Terverifikasi Sehat
               </span>
            </div>
         </div>
         <Button variant="outline" size="sm" className="rounded-xl px-4 py-2 border-primary text-primary">Profil</Button>
      </section>

      {/* Fixed Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border z-50 flex items-center justify-center">
         <div className="w-full max-w-md">
            <Button size="lg" className="w-full shadow-lg shadow-primary/20">Tambah ke Meal Plan</Button>
         </div>
      </div>
    </div>
  );
}
