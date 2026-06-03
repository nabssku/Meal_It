"use client";

import React, { useState } from "react";
import FoodCard from "@/components/cards/FoodCard";
import { Search, Filter } from "lucide-react";

const categories = ["Semua", "Protein Tinggi", "Serat Tinggi", "Rendah Kalori", "Sarapan", "Vegetarian"];

const dummyMenus = [
  {
    id: "1",
    name: "Ayam Penyet Sehat",
    vendor: "Katering Mama Lita",
    price: 22000,
    calories: 420,
    protein: 32,
    image: "https://images.unsplash.com/photo-1593001007050-48429445f171?auto=format&fit=crop&q=80&w=300",
  },
  {
    id: "2",
    name: "Poke Bowl Lokal",
    vendor: "FreshBowl ID",
    price: 35000,
    calories: 380,
    protein: 24,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300",
  },
  {
    id: "3",
    name: "Salad Buah Yogurt",
    vendor: "Healthy Corner",
    price: 15000,
    calories: 210,
    protein: 6,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=300",
  },
  {
    id: "4",
    name: "Sup Ayam Jahe",
    vendor: "Warung Berkah",
    price: 18000,
    calories: 280,
    protein: 22,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=300",
  },
];

export default function MenusPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");

  return (
    <div className="flex flex-col gap-6 pb-10">
      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Menu Sehat</h1>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Cari makanan sehat..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm shadow-sm"
            />
          </div>
          <button className="p-3 bg-white border border-border rounded-xl text-text-primary shadow-sm active:scale-95 transition-all">
            <Filter size={18} />
          </button>
        </div>
      </header>

      <section className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeCategory === category
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-white border border-border text-text-muted"
            }`}
          >
            {category}
          </button>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-4">
        {dummyMenus.map((menu) => (
          <FoodCard key={menu.id} {...menu} />
        ))}
      </section>
    </div>
  );
}
