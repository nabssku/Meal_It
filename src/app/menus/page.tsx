"use client";

import React, { useState, useEffect } from "react";
import FoodCard from "@/components/cards/FoodCard";
import { Search, SlidersHorizontal, Loader2, UtensilsCrossed } from "lucide-react";
import { getMenusAction } from "@/app/actions/meal-actions";

const CATEGORIES = ["Semua", "sarapan", "makan-siang", "makan-malam"];
const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  "Semua": { label: "Semua", emoji: "🍽️" },
  "sarapan": { label: "Sarapan", emoji: "🍳" },
  "makan-siang": { label: "Makan Siang", emoji: "☀️" },
  "makan-malam": { label: "Makan Malam", emoji: "🌙" },
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
  const [showFilters, setShowFilters] = useState(false);

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

  const hasActiveFilters = activeTag !== null || activeCategory !== "Semua" || search !== "";

  return (
    <div className="flex flex-col gap-0 pb-24">
      {/* ── Hero Header ── */}
      <header className="flex flex-col gap-1 pt-2 pb-5">
        <span className="text-[10px] text-primary font-bold uppercase tracking-[0.15em]">
          Catering Rekomendasi
        </span>
        <h1 className="text-2xl font-black text-foreground leading-tight">
          Menu Sehat <span className="text-primary">Untukmu</span>
        </h1>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">
          Pilih menu, lihat semua pilihan dari vendor favoritmu
        </p>
      </header>

      {/* ── Search Bar ── */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60"
            size={17}
          />
          <input
            id="menu-search"
            type="text"
            placeholder="Cari makanan atau vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-black/6 rounded-2xl focus:border-primary/40 focus:ring-4 focus:ring-primary/8 outline-none text-sm shadow-sm transition-all duration-300 font-medium placeholder:font-normal placeholder:text-muted-foreground/60"
          />
        </div>
        <button
          id="menu-filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-2xl border transition-all duration-300 active:scale-95 cursor-pointer shadow-sm ${
            hasActiveFilters
              ? "bg-primary text-white border-primary shadow-primary/20"
              : "bg-white border-black/6 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5"
          }`}
          title="Filter"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* ── Category Tabs ── */}
      <section className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const { label, emoji } = CATEGORY_LABELS[cat];
          return (
            <button
              key={cat}
              id={`category-${cat}`}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300 active:scale-95 cursor-pointer flex-shrink-0 ${
                activeCategory === cat
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "bg-white border border-black/6 text-muted-foreground hover:text-foreground hover:bg-primary/5 hover:border-primary/20 shadow-sm"
              }`}
            >
              <span>{emoji}</span>
              {label}
            </button>
          );
        })}
      </section>

      {/* ── Tag Filters (collapsible) ── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showFilters ? "max-h-20 opacity-100 mb-3" : "max-h-0 opacity-0"
        }`}
      >
        <section className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {TAG_FILTERS.map((tag) => (
            <button
              key={tag}
              id={`tag-${tag.replace(/\s+/g, "-").toLowerCase()}`}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[10px] font-extrabold transition-all duration-300 active:scale-95 cursor-pointer flex-shrink-0 ${
                activeTag === tag
                  ? "bg-success text-white shadow-sm shadow-success/30"
                  : "bg-white border border-black/6 text-muted-foreground hover:bg-success/8 hover:text-success hover:border-success/25 shadow-sm"
              }`}
            >
              {tag}
            </button>
          ))}
        </section>
      </div>

      {/* ── Active filter summary ── */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground font-medium">
            <span className="text-foreground font-bold">{filtered.length}</span>{" "}
            menu ditemukan
          </p>
          <button
            onClick={() => {
              setSearch("");
              setActiveTag(null);
              setActiveCategory("Semua");
            }}
            className="text-[10px] font-bold text-primary underline underline-offset-2 cursor-pointer"
          >
            Reset semua filter
          </button>
        </div>
      )}

      {/* ── Menu Grid ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="relative">
            <Loader2 size={36} className="animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Memuat menu...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center">
            <UtensilsCrossed size={28} className="text-muted-foreground/50" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">
              {search ? `Tidak ada hasil untuk "${search}"` : "Belum ada menu tersedia"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {search ? "Coba kata kunci lain atau reset filter" : "Vendor belum menambahkan menu"}
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch("");
                setActiveTag(null);
                setActiveCategory("Semua");
              }}
              className="text-xs text-primary font-bold px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/5 transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <section className="grid grid-cols-2 gap-3 mt-1">
          {filtered.map((menu) => (
            <FoodCard
              key={menu.id}
              id={menu.id}
              name={menu.name}
              vendor={menu.vendorName}
              price={menu.price}
              calories={menu.calories}
              protein={menu.protein}
              image={
                menu.image ||
                FALLBACK_IMAGE[menu.category ?? "default"] ||
                FALLBACK_IMAGE.default
              }
              rating={menu.rating || 4.8}
              isHealthyBadge={true}
              vendorId={menu.vendorId}
              linkToVendor={true}
            />
          ))}
        </section>
      )}
    </div>
  );
}
