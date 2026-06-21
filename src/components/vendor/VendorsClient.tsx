"use client";

import React, { useState } from "react";
import { ShieldCheck, Utensils, Star, Search, MessageSquarePlus } from "lucide-react";
import RatingModal from "@/components/vendor/RatingModal";

interface Vendor {
  id: string;
  name: string;
  category: string | null;
  rating: number;
  menuCount: number;
  logo: string | null;
  description: string | null;
}

interface VendorsClientProps {
  vendors: Vendor[];
  userId: string;
  userReviews: Record<string, { rating: number; comment: string | null }>;
}

export default function VendorsClient({
  vendors,
  userId,
  userReviews,
}: VendorsClientProps) {
  const [search, setSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const filtered = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      (v.category?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <>
      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          size={18}
        />
        <input
          id="vendor-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari vendor sehat..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm shadow-sm transition-all"
        />
      </div>

      {/* Vendor Cards */}
      <section className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-text-muted text-sm font-medium">
            Tidak ada vendor yang cocok dengan pencarian.
          </div>
        ) : (
          filtered.map((vendor) => {
            const myReview = userReviews[vendor.id];
            const displayRating =
              vendor.rating > 0
                ? vendor.rating.toFixed(1)
                : myReview
                ? myReview.rating.toFixed(1)
                : "—";

            return (
              <div
                key={vendor.id}
                className="card-premium p-4 flex gap-4 hover:shadow-md transition-shadow"
              >
                {/* Logo / Avatar */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 bg-gradient-to-br from-[#0F5238]/10 to-[#2D6A4F]/10 flex items-center justify-center">
                  {vendor.logo ? (
                    <img
                      src={vendor.logo}
                      alt={vendor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-black text-[#0F5238]">
                      {vendor.name.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="text-sm font-bold text-text-primary truncate">
                      {vendor.name}
                    </h3>
                    <ShieldCheck size={14} className="text-success flex-shrink-0" />
                  </div>
                  <p className="text-[10px] text-text-muted font-medium">
                    {vendor.category || "Makanan Sehat"}
                  </p>

                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-[10px] text-text-muted">
                      <Star
                        size={10}
                        className={`${vendor.rating > 0 ? "text-warning fill-warning" : "text-gray-300"}`}
                      />
                      <span className="font-bold">{displayRating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-text-muted">
                      <Utensils size={10} />
                      <span>{vendor.menuCount} Menu</span>
                    </div>
                    {myReview && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        ✓ Sudah dinilai
                      </span>
                    )}
                  </div>

                  {vendor.description && (
                    <p className="text-[10px] text-text-muted line-clamp-1 mt-0.5">
                      {vendor.description}
                    </p>
                  )}
                </div>

                {/* Rate Button */}
                <div className="flex items-center flex-shrink-0">
                  <button
                    id={`rate-vendor-${vendor.id}`}
                    onClick={() => setSelectedVendor(vendor)}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-[#0F5238]/30 hover:bg-[#0F5238] hover:text-white text-[#0F5238] transition-all active:scale-95 group"
                  >
                    <Star
                      size={18}
                      className="group-hover:fill-white fill-transparent"
                    />
                    <span className="text-[9px] font-bold">
                      {myReview ? "Ubah" : "Rating"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Rating Modal */}
      {selectedVendor && (
        <RatingModal
          vendor={selectedVendor}
          userId={userId}
          onClose={() => setSelectedVendor(null)}
          existingRating={userReviews[selectedVendor.id]?.rating ?? 0}
          existingComment={userReviews[selectedVendor.id]?.comment ?? ""}
        />
      )}
    </>
  );
}
