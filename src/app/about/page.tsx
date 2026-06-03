import React from "react";
import { Info, ShieldCheck, Heart, Sparkles, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex items-center gap-4">
        <Link href="/" className="p-2 -ml-2 text-text-secondary">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-text-primary">Tentang MEALIT</h1>
      </header>

      <section className="flex flex-col gap-6">
        <div className="aspect-video relative rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center">
             <img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=400" alt="About" className="w-full h-full object-cover opacity-50" />
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-black text-primary drop-shadow-md">MEALIT</span>
             </div>
        </div>

        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-text-primary">Misi Kami</h2>
            <p className="text-sm text-text-secondary leading-relaxed text-justify">
                MEALIT lahir dari kegelisahan bahwa makan sehat seringkali dianggap mahal dan rumit. Kami di sini untuk mendemokratisasi akses ke nutrisi berkualitas bagi semua orang, apapun budgetnya.
            </p>
        </div>

        <div className="grid gap-4 mt-4">
            <div className="flex gap-4 p-4 card-premium border-none bg-primary/5">
                <ShieldCheck className="text-primary flex-shrink-0" size={24} />
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm text-text-primary">Terstandarisasi</span>
                    <span className="text-xs text-text-muted">Setiap menu dihitung nutrisinya oleh AI yang mengacu pada standar kesehatan global.</span>
                </div>
            </div>
            <div className="flex gap-4 p-4 card-premium border-none bg-primary/5">
                <Heart className="text-primary flex-shrink-0" size={24} />
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm text-text-primary">Berdayakan Vendor Lokal</span>
                    <span className="text-xs text-text-muted">Kami bekerja sama dengan UMKM katering lokal untuk menyediakan hidangan rumah yang sehat.</span>
                </div>
            </div>
            <div className="flex gap-4 p-4 card-premium border-none bg-primary/5">
                <Sparkles className="text-primary flex-shrink-0" size={24} />
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm text-text-primary">Personalisasi AI</span>
                    <span className="text-xs text-text-muted">Rekomendasi yang unik untuk setiap profil kesehatan dan kantong user.</span>
                </div>
            </div>
        </div>
      </section>

      <footer className="mt-8 text-center border-t border-border pt-8">
         <p className="text-xs text-text-muted">© 2026 MEALIT Indonesia. Semua Hak Dilindungi.</p>
      </footer>
    </div>
  );
}
