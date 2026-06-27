import React from "react";
import { Send, MapPin, Phone, Mail, Globe, Share2, MessageSquare } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hubungi Kami - Meal It Support & Kerjasama",
  description: "Ada keluhan, saran, atau pertanyaan seputar katering sehat Meal It? Hubungi kami langsung di sini.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary">Kontak Kami</h1>
        <p className="text-sm text-text-muted">Kirimkan pesan atau kritik & saranmu.</p>
      </header>

      <section className="flex flex-col gap-4">
         <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Subjek</label>
            <input type="text" placeholder="Keluhan / Saran / Kerjasama" className="p-4 bg-white border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm shadow-sm" />
         </div>
         <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-2">Pesan</label>
            <textarea rows={5} placeholder="Tuliskan pesanmu di sini..." className="p-4 bg-white border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm shadow-sm resize-none"></textarea>
         </div>
         <Button size="lg" className="w-full flex gap-2">
            <Send size={18} /> Kirim Pesan
         </Button>
      </section>

      <section className="mt-8 flex flex-col gap-6">
         <div className="flex flex-col gap-4">
            <h3 className="font-bold text-text-primary">Kantor Pusat</h3>
            <div className="flex items-start gap-4">
               <div className="p-3 bg-muted rounded-xl text-text-secondary">
                  <MapPin size={24} />
               </div>
               <div className="flex flex-col">
                  <span className="text-sm font-bold text-text-primary">MEALIT HQ Indonesia</span>
                  <p className="text-xs text-text-muted leading-relaxed">
                     Jl. Sehat Walafiat No. 42, Jakarta Selatan, 12340
                  </p>
               </div>
            </div>
         </div>

         <div className="flex flex-col gap-4">
            <h3 className="font-bold text-text-primary">Media Sosial</h3>
            <div className="flex gap-4">
                 <button className="p-3 bg-muted rounded-xl text-text-secondary hover:text-primary transition-colors">
                    <Phone size={24} />
                 </button>
                 <button className="p-3 bg-muted rounded-xl text-text-secondary hover:text-primary transition-colors">
                    <Globe size={24} />
                 </button>
                 <button className="p-3 bg-muted rounded-xl text-text-secondary hover:text-primary transition-colors">
                    <MessageSquare size={24} />
                 </button>
                 <button className="p-3 bg-muted rounded-xl text-text-secondary hover:text-primary transition-colors">
                    <Share2 size={24} />
                 </button>
            </div>
         </div>
      </section>
    </div>
  );
}
