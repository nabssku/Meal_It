"use client";

import React, { useState, useEffect } from "react";
import FoodCard from "@/components/cards/FoodCard";
import { Search, Filter, Loader2 } from "lucide-react";
import { getMenusAction } from "@/app/actions/meal-actions";

const CATEGORIES = ["Semua", "sarapan", "makan-siang", "makan-malam"];
const CATEGORY_LABELS: Record<string, string> = {
  "Semua": "🍽️ Semua",
  "sarapan": "🍳 Sarapan",
  "makan-siang": "☀️ Makan Siang",
  "makan-malam": "🌙 Makan Malam",
};

const TAG_FILTERS = ["Protein Tinggi", "Serat Tinggi", "Rendah Kalori", "Vegetarian", "Hemat"];

type Menu = {
  id: string;
  name: string;
  price: number;
  calories: number;
  protein: number;
  fat: number | null;
  carbs: number | null;
  image: string | null;
  category: string | null;
  tags: string[];
  vendorName: string;
  vendorId: string;
  rating: number;
};

const FALLBACK_IMAGE: Record<string, string> = {
  sarapan: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=300",
  "makan-siang": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=300",
  "makan-malam": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=300",
  default: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=300",
};

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getMenusAction().then((data) => {
      setMenus(data);
      setLoading(false);
    });
  }, []);

  const filtered = menus.filter((menu) => {
    const matchCategory =
      activeCategory === "Semua" || menu.category === activeCategory;
    const matchTag = !activeTag || menu.tags.includes(activeTag);
    const matchSearch =
      !search ||
      menu.name.toLowerCase().includes(search.toLowerCase()) ||
      menu.vendorName.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchTag && matchSearch;
  });

  return (
    <div className="flex flex-col gap-6 pb-20 pt-2">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Catering Rekomendasi</span>
          <h1 className="text-2xl font-bold text-foreground">Menu Sehat</h1>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/75" size={18} />
            <input
              type="text"
              placeholder="Cari makanan sehat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-black/5 rounded-2xl focus:border-primary/45 focus:ring-4 focus:ring-primary/10 outline-none text-sm shadow-2xs transition-all duration-300"
            />
          </div>
          <button
            className="p-3 bg-white border border-black/5 rounded-2xl text-foreground shadow-2xs active:scale-95 hover:bg-primary/5 hover:text-primary transition-all duration-300 cursor-pointer"
            onClick={() => { setActiveTag(null); setActiveCategory("Semua"); setSearch(""); }}
            title="Reset Filters"
          >
            <Filter size={18} />
          </button>
        </div>
      </header>

      {/* Category Filter */}
      <section className="flex gap-2 overflow-x-auto pb-2 pt-1 -mx-1 px-1 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 active:scale-95 cursor-pointer ${
              activeCategory === cat
                ? "bg-gradient-to-r from-primary to-primary-hover text-white shadow-md shadow-primary/20 scale-102"
                : "bg-white border border-black/5 text-muted-foreground hover:text-foreground hover:bg-primary/5 hover:border-primary/20"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </section>

      {/* Tag Filter */}
      <section className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {TAG_FILTERS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[10px] font-extrabold transition-all duration-300 active:scale-95 cursor-pointer ${
              activeTag === tag
                ? "bg-success text-white shadow-sm"
                : "bg-white border border-black/5 text-muted-foreground hover:bg-success/5 hover:text-success hover:border-success/20"
            }`}
          >
            {tag}
          </button>
        ))}
      </section>

      {/* Menu Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat menu...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="text-4xl">🍽️</span>
          <p className="text-sm text-muted-foreground font-medium">
            {search ? `Tidak ada menu untuk "${search}"` : "Belum ada menu tersedia."}
          </p>
          {(search || activeTag || activeCategory !== "Semua") && (
            <button
              onClick={() => { setSearch(""); setActiveTag(null); setActiveCategory("Semua"); }}
              className="text-xs text-primary font-bold underline"
            >
              Reset filter
            </button>
          )}
        </div>
      ) : (
        <section className="grid grid-cols-2 gap-4">
          {filtered.map((menu) => (
            <FoodCard
              key={menu.id}
              id={menu.id}
              name={menu.name}
              vendor={menu.vendorName}
              price={menu.price}
              calories={menu.calories}
              protein={menu.protein}
              image={menu.image || FALLBACK_IMAGE[menu.category ?? "default"] || FALLBACK_IMAGE.default}
              rating={menu.rating || 4.8}
              isHealthyBadge={true}
            />
          ))}
        </section>
      )}
    </div>
  );
}
