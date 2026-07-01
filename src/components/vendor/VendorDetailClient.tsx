"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Star,
  ShieldCheck,
  Utensils,
  MapPin,
  Truck,
  Clock,
  UtensilsCrossed,
  Flame,
  Target,
} from "lucide-react";

interface VendorMenu {
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
  rating: number;
  isAvailable: boolean;
}

interface Vendor {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  category: string | null;
  rating: number;
  address: string | null;
  city: string | null;
  isDeliveryEnabled: boolean;
  deliveryFee: number;
  latitude: number | null;
  longitude: number | null;
}

interface VendorDetailClientProps {
  vendor: Vendor;
  menus: VendorMenu[];
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  sarapan: { label: "Sarapan", emoji: "🍳" },
  "makan-siang": { label: "Makan Siang", emoji: "☀️" },
  "makan-malam": { label: "Makan Malam", emoji: "🌙" },
};

const FALLBACK_IMAGE: Record<string, string> = {
  sarapan:
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=400",
  "makan-siang":
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=400",
  "makan-malam":
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=400",
  default:
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400",
};

function MenuItemCard({ menu }: { menu: VendorMenu }) {
  const [imgFailed, setImgFailed] = useState(false);
  const image =
    menu.image ||
    FALLBACK_IMAGE[menu.category ?? "default"] ||
    FALLBACK_IMAGE.default;

  return (
    <Link
      href={`/menus/${menu.id}`}
      className="group flex gap-3 p-3 bg-white rounded-2xl border border-black/5 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 active:scale-[0.98]"
    >
      {/* Food Image */}
      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted relative">
        {!imgFailed ? (
          <img
            src={image}
            alt={menu.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
            <Utensils size={24} className="text-primary/30" />
          </div>
        )}
        {!menu.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
            <span className="text-[9px] font-black text-white uppercase tracking-wider">
              Habis
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div>
          {/* Category & Tags */}
          <div className="flex items-center gap-1 flex-wrap mb-1">
            {menu.category && CATEGORY_LABELS[menu.category] && (
              <span className="text-[9px] font-bold text-primary/70 bg-primary/8 px-1.5 py-0.5 rounded-full">
                {CATEGORY_LABELS[menu.category].emoji}{" "}
                {CATEGORY_LABELS[menu.category].label}
              </span>
            )}
            {menu.tags.slice(0, 1).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-bold text-success/80 bg-success/8 px-1.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {menu.name}
          </h3>
        </div>

        {/* Nutrition + Price */}
        <div className="flex items-end justify-between mt-2">
          <div className="flex gap-1.5">
            <span className="flex items-center gap-0.5 text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded">
              <Flame size={9} />
              {menu.calories}
            </span>
            <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
              <Target size={9} />
              {menu.protein}g
            </span>
          </div>
          <div className="text-sm font-extrabold text-primary">
            Rp {menu.price.toLocaleString("id-ID")}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function VendorDetailClient({
  vendor,
  menus,
}: VendorDetailClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Group menus by category
  const categories = Array.from(
    new Set(menus.map((m) => m.category).filter(Boolean))
  ) as string[];

  const filteredMenus = activeCategory
    ? menus.filter((m) => m.category === activeCategory)
    : menus;

  const initials = vendor.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-0 pb-24 -mt-6">
      {/* ── Hero Banner ── */}
      <div className="relative h-44 -mx-4 bg-gradient-to-br from-primary to-emerald-700 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white" />
          <div className="absolute bottom-0 left-8 w-24 h-24 rounded-full bg-white" />
          <div className="absolute top-12 left-1/2 w-16 h-16 rounded-full bg-white" />
        </div>

        {/* Back button */}
        <div className="absolute top-10 left-4">
          <Link
            href="/menus"
            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={22} />
          </Link>
        </div>

        {/* Verified badge */}
        <div className="absolute top-10 right-4 bg-white/20 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <ShieldCheck size={10} />
          Terverifikasi MEALIT
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      {/* ── Vendor Info Card ── */}
      <div className="bg-white -mx-4 px-4 pb-4 shadow-sm border-b border-black/5">
        <div className="flex items-start gap-4 -mt-8">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-white shadow-lg border-2 border-white">
            {vendor.logo ? (
              <img
                src={vendor.logo}
                alt={vendor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
                <span className="text-lg font-black text-white">{initials}</span>
              </div>
            )}
          </div>

          {/* Name + Rating */}
          <div className="flex-1 pt-2">
            <h1 className="text-lg font-black text-foreground leading-tight">
              {vendor.name}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <div className="flex items-center gap-1">
                <Star size={12} className="text-warning fill-warning" />
                <span className="text-xs font-bold text-foreground">
                  {vendor.rating > 0 ? vendor.rating.toFixed(1) : "Baru"}
                </span>
              </div>
              {vendor.category && (
                <span className="text-[9px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                  {vendor.category}
                </span>
              )}
              <span className="flex items-center gap-1 text-[10px] font-bold text-success">
                <ShieldCheck size={10} />
                Dikontrol AI
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {vendor.description && (
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            {vendor.description}
          </p>
        )}

        {/* Meta info chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {vendor.address && (
            <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full">
              <MapPin size={10} />
              {vendor.city || vendor.address}
            </div>
          )}
          <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full">
            <Utensils size={10} />
            {menus.length} menu tersedia
          </div>
          {vendor.isDeliveryEnabled ? (
            <div className="flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 px-2.5 py-1 rounded-full">
              <Truck size={10} />
              Delivery Rp {vendor.deliveryFee.toLocaleString("id-ID")}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full">
              <Clock size={10} />
              Pickup only
            </div>
          )}
        </div>
      </div>

      {/* ── Category Filter ── */}
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto py-4 -mx-4 px-4 scrollbar-hide bg-white border-b border-black/5">
          <button
            onClick={() => setActiveCategory(null)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95 flex-shrink-0 ${
              activeCategory === null
                ? "bg-primary text-white shadow-sm shadow-primary/25"
                : "bg-muted/40 text-muted-foreground hover:bg-primary/8 hover:text-primary"
            }`}
          >
            🍽️ Semua
          </button>
          {categories.map((cat) => {
            const info = CATEGORY_LABELS[cat] ?? { label: cat, emoji: "🍴" };
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95 flex-shrink-0 ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-sm shadow-primary/25"
                    : "bg-muted/40 text-muted-foreground hover:bg-primary/8 hover:text-primary"
                }`}
              >
                {info.emoji} {info.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Section header ── */}
      <div className="px-0 pt-5 pb-2">
        <h2 className="text-sm font-black text-foreground">
          {activeCategory
            ? `${CATEGORY_LABELS[activeCategory]?.emoji ?? "🍴"} ${
                CATEGORY_LABELS[activeCategory]?.label ?? activeCategory
              }`
            : "🔥 Menu Pilihan"}
        </h2>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Klik menu untuk pesan atau tambahkan ke Meal Plan
        </p>
      </div>

      {/* ── Menu List ── */}
      {filteredMenus.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <UtensilsCrossed size={32} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground font-medium">
            Belum ada menu di kategori ini
          </p>
        </div>
      ) : (
        <section className="flex flex-col gap-3">
          {filteredMenus.map((menu) => (
            <MenuItemCard key={menu.id} menu={menu} />
          ))}
        </section>
      )}

      {/* ── Bottom CTA ── */}
      <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-dashed border-primary/20 text-center">
        <p className="text-[10px] text-muted-foreground font-medium italic">
          &ldquo;Semua menu {vendor.name} telah dikurasi oleh tim MEALIT untuk
          menjamin standar gizi harianmu.&rdquo;
        </p>
      </div>
    </div>
  );
}
