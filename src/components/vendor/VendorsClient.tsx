"use client";

import React, { useState } from "react";
import { ShieldCheck, Utensils, Star, Search, MapPin } from "lucide-react";
import RatingModal from "@/components/vendor/RatingModal";

interface Vendor {
  id: string;
  name: string;
  category: string | null;
  rating: number;
  menuCount: number;
  logo: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface VendorsClientProps {
  vendors: Vendor[];
  userId: string;
  userReviews: Record<string, { rating: number; comment: string | null }>;
  userCoords: { latitude: number | null; longitude: number | null };
}

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function VendorsClient({
  vendors,
  userId,
  userReviews,
  userCoords,
}: VendorsClientProps) {
  const [search, setSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [sortBy, setSortBy] = useState<"rating" | "distance">("rating");

  // Calculate distance for all vendors
  const vendorsWithDistance = vendors.map((v) => {
    let distance: number | null = null;
    if (
      userCoords.latitude !== null &&
      userCoords.longitude !== null &&
      v.latitude !== null &&
      v.longitude !== null
    ) {
      distance = calculateDistance(
        userCoords.latitude,
        userCoords.longitude,
        v.latitude,
        v.longitude
      );
    }
    return { ...v, distance };
  });

  // Filter vendors based on search input
  const filtered = vendorsWithDistance.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      (v.category?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  // Sort filtered vendors based on active filter tab
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "distance") {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    }
    return b.rating - a.rating; // Default rating sorting
  });

  const hasCoords = userCoords.latitude !== null && userCoords.longitude !== null;

  return (
    <>
      {/* Search & Filter Tags */}
      <div className="flex flex-col gap-3">
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

        {/* Filter Selection Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("rating")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              sortBy === "rating"
                ? "bg-[#0F5238] text-white border-[#0F5238] shadow-sm"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            ⭐ Rating Tertinggi
          </button>
          <button
            onClick={() => {
              if (hasCoords) setSortBy("distance");
              else alert("Silakan atur lokasi Anda di Profil terlebih dahulu untuk menggunakan filter ini.");
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-1 ${
              !hasCoords
                ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                : sortBy === "distance"
                ? "bg-[#0F5238] text-white border-[#0F5238] shadow-sm"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            <MapPin size={12} />
            Vendor Dekat Saya
          </button>
        </div>
      </div>

      {/* Vendor Cards */}
      <section className="flex flex-col gap-4">
        {sorted.length === 0 ? (
          <div className="py-12 text-center text-text-muted text-sm font-medium">
            Tidak ada vendor yang cocok dengan kriteria.
          </div>
        ) : (
          sorted.map((vendor) => {
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
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-bold text-text-primary truncate">
                      {vendor.name}
                    </h3>
                    <ShieldCheck size={14} className="text-success flex-shrink-0" />
                    {vendor.distance !== null && (
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-[#0F5238]/5 text-[#0F5238] rounded-full">
                        {vendor.distance < 1
                          ? `${Math.round(vendor.distance * 1000)} m`
                          : `${vendor.distance.toFixed(1)} km`}
                      </span>
                    )}
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
