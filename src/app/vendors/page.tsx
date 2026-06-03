import React from "react";
import { ShieldCheck, MapPin, Utensils, Star, Search } from "lucide-react";
import Button from "@/components/ui/Button";

const dummyVendors = [
  {
    name: "Katering Mama Lita",
    category: "Menu Diet Indonesian",
    rating: 4.9,
    menus: 12,
    priceRange: "15k - 30k",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "FreshBowl ID",
    category: "Salad & Healthy Bowls",
    rating: 4.8,
    menus: 8,
    priceRange: "25k - 50k",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Healthy Corner",
    category: "Snacks & Smoothies",
    rating: 4.7,
    menus: 15,
    priceRange: "10k - 25k",
    image: "https://images.unsplash.com/photo-1466632311177-7d5b474050a2?auto=format&fit=crop&q=80&w=200",
  },
];

export default function VendorsPage() {
  return (
    <div className="flex flex-col gap-6 pb-10">
      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Vendor Terpercaya</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Cari vendor sehat..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm shadow-sm"
          />
        </div>
      </header>

      <section className="flex flex-col gap-4">
        {dummyVendors.map((vendor, i) => (
          <div key={i} className="card-premium p-4 flex gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted">
              <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <h3 className="text-sm font-bold text-text-primary">{vendor.name}</h3>
                <ShieldCheck size={14} className="text-success" />
              </div>
              <p className="text-[10px] text-text-muted font-medium">{vendor.category}</p>
              
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-[10px] text-text-muted">
                  <Star size={10} className="text-warning fill-warning" />
                  <span className="font-bold">{vendor.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-text-muted">
                  <Utensils size={10} />
                  <span>{vendor.menus} Menu</span>
                </div>
              </div>
              
              <div className="text-xs font-bold text-primary mt-1">
                {vendor.priceRange}
              </div>
            </div>
            
            <div className="flex items-center">
              <Button variant="outline" size="sm" className="rounded-xl">Lihat</Button>
            </div>
          </div>
        ))}
      </section>

      <div className="bg-primary/5 p-4 rounded-xl border border-dashed border-primary/30 text-center">
         <p className="text-xs text-text-secondary font-medium italic">
            "Semua vendor telah dikurasi oleh tim MEALIT untuk menjamin kualitas standar gizi harianmu."
         </p>
      </div>
    </div>
  );
}
