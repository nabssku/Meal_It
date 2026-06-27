import React from "react";
import { HelpCircle, ChevronRight, MessageCircle, Phone, Mail, Search } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pusat Bantuan & FAQ - Meal It",
  description: "Temukan jawaban atas pertanyaan seputar fitur Meal It, standar nutrisi makanan sehat, katering kemitraan, dan manajemen budget.",
};

const faqs = [
  "Bagaimana cara AI menentukan menu?",
  "Apakah budget di MEALIT sudah termasuk ongkir?",
  "Bagaimana cara jadi vendor MEALIT?",
  "Apa standar 'Sehat' di aplikasi ini?",
  "Cara top up saldo Nutri-Wallet",
  "Bisakah saya berlangganan mingguan?",
];

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-6 pb-10">
      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Pusat Bantuan</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Ada yang bisa kami bantu?" 
            className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm shadow-sm"
          />
        </div>
      </header>

      <section className="flex flex-col gap-2">
         <h3 className="font-bold text-text-primary px-1 mb-2">FAQ Populer</h3>
         {faqs.map((faq, i) => (
           <button key={i} className="flex items-center justify-between p-4 card-premium hover:bg-muted/30 transition-colors border-none shadow-none bg-white">
              <span className="text-sm font-medium text-text-secondary text-left">{faq}</span>
              <ChevronRight size={18} className="text-text-muted" />
           </button>
         ))}
      </section>

      <section className="mt-6 flex flex-col gap-4">
         <h3 className="font-bold text-text-primary px-1">Hubungi Kami</h3>
         <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center gap-3 p-6 card-premium border-none shadow-sm bg-white">
                <div className="p-3 bg-success/10 text-success rounded-full">
                   <MessageCircle size={24} />
                </div>
                <span className="text-xs font-bold text-text-primary">WhatsApp</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-6 card-premium border-none shadow-sm bg-white">
                <div className="p-3 bg-primary/10 text-primary rounded-full">
                   <Mail size={24} />
                </div>
                <span className="text-xs font-bold text-text-primary">Email Support</span>
            </button>
         </div>
      </section>

      <div className="mt-8 p-6 bg-primary rounded-2xl text-white text-center flex flex-col items-center gap-3">
          <HelpCircle size={32} />
          <div className="flex flex-col gap-1">
             <h3 className="font-bold">Masih bingung?</h3>
             <p className="text-[10px] text-white/80">Tim kami siap membantu 24/7 untuk menjawab pertanyaanmu seputar nutrisi dan aplikasi.</p>
          </div>
          <Link href="/contact" className="w-full">
              <button className="w-full py-3 bg-white text-primary font-bold rounded-xl text-sm">Hubungi Customer Service</button>
          </Link>
      </div>
    </div>
  );
}
