"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import {
  ChevronLeft, Share2, Heart, ShieldCheck, MapPin,
  Star, Flame, Target, Utensils, Banknote,
  QrCode, X, Loader2, AlertCircle,
} from "lucide-react";
import { getMenuByIdAction, orderMenuDirectlyAction } from "@/app/actions/meal-actions";

type Menu = {
  id: string;
  name: string;
  description: string | null;
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
  vendorRating: number;
  isAvailable: boolean;
};

const CATEGORY_LABELS: Record<string, string> = {
  sarapan: "Sarapan",
  "makan-siang": "Makan Siang",
  "makan-malam": "Makan Malam",
};

export default function MenuDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;

  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);

  // Order modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"WALLET" | "CASH">("CASH");
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderResult, setOrderResult] = useState<{ pickupCode?: string; error?: string } | null>(null);
  const [liked, setLiked] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [prevId, setPrevId] = useState(id);

  if (id !== prevId) {
    setPrevId(id);
    setImgFailed(false);
  }

  useEffect(() => {
    getMenuByIdAction(id).then((data) => {
      setMenu(data);
      setLoading(false);
    });
  }, [id]);

  const handleOrder = async () => {
    if (!menu) return;
    setIsOrdering(true);
    const result = await orderMenuDirectlyAction(menu.id, paymentMethod);
    setIsOrdering(false);
    if (result.success) {
      setOrderResult({ pickupCode: result.pickupCode });
    } else {
      setOrderResult({ error: result.error });
    }
  };

  const fallbackImage = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600";
  const heroImage = menu?.image || fallbackImage;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 size={36} className="animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat detail menu...</p>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
        <span className="text-5xl">🍽️</span>
        <h2 className="text-lg font-bold text-foreground">Menu tidak ditemukan</h2>
        <Link href="/menus">
          <Button>Kembali ke Daftar Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 pb-44 -mt-6">
        {/* Hero Image */}
        <div className="relative h-72 -mx-4 overflow-hidden bg-muted flex items-center justify-center">
          {!imgFailed && heroImage ? (
            <img
              src={heroImage}
              alt={menu.name}
              className="w-full h-full object-cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col items-center justify-center text-primary/30 p-4">
              <Utensils size={48} className="stroke-[1.5] mb-2" />
              <span className="text-[10px] font-extrabold tracking-widest text-primary/40 uppercase">Meal-It</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
          <div className="absolute top-10 left-4 right-4 flex justify-between">
            <Link href="/menus" className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
              <ChevronLeft size={24} />
            </Link>
            <div className="flex gap-2">
              <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                <Share2 size={20} />
              </button>
              <button
                className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white"
                onClick={() => setLiked(!liked)}
              >
                <Heart size={20} fill={liked ? "#ff6b6b" : "none"} />
              </button>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <div className="bg-primary text-white text-[10px] font-bold py-1 px-3 rounded-full flex items-center gap-1">
              <ShieldCheck size={12} />
              DIKONTROL OLEH AI
            </div>
            {menu.category && (
              <div className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold py-1 px-3 rounded-full">
                {CATEGORY_LABELS[menu.category] ?? menu.category}
              </div>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <section className="flex flex-col gap-3">
          <div className="flex justify-between items-start gap-2">
            <h1 className="text-xl font-bold text-foreground leading-tight flex-1">{menu.name}</h1>
            <div className="text-xl font-black text-budget flex-shrink-0">
              Rp {menu.price.toLocaleString("id-ID")}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-warning fill-warning" />
              <span>{menu.vendorRating.toFixed(1)} Rating</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{menu.vendorName}</span>
            </div>
            {!menu.isAvailable && (
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                Tidak Tersedia
              </span>
            )}
          </div>

          {/* Tags */}
          {menu.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {menu.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Nutrition Grid */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-orange-50 p-3 rounded-2xl flex flex-col items-center gap-1 border border-orange-100">
            <Flame size={18} className="text-warning" />
            <span className="text-sm font-bold text-foreground">{menu.calories}</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase">Kalori</span>
          </div>
          <div className="bg-primary/5 p-3 rounded-2xl flex flex-col items-center gap-1 border border-primary/10">
            <Target size={18} className="text-primary" />
            <span className="text-sm font-bold text-foreground">{menu.protein}g</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase">Protein</span>
          </div>
          <div className="bg-green-50 p-3 rounded-2xl flex flex-col items-center gap-1 border border-green-100">
            <Utensils size={18} className="text-success" />
            <span className="text-sm font-bold text-foreground">{menu.fat ?? "—"}g</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase">Lemak</span>
          </div>
        </section>

        {/* Carbs info */}
        {menu.carbs !== null && (
          <div className="flex items-center gap-2 bg-muted/20 rounded-xl px-4 py-2 border border-border/50">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Karbohidrat:</span>
            <span className="text-xs font-bold text-foreground">{menu.carbs}g</span>
          </div>
        )}

        {/* Description */}
        {menu.description && (
          <section className="flex flex-col gap-2">
            <h3 className="font-bold text-foreground">Deskripsi</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{menu.description}</p>
          </section>
        )}

        {/* Vendor Info */}
        <section className="bg-muted/20 p-4 rounded-2xl flex items-center justify-between border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-sm">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(menu.vendorName)}&background=0F5238&color=fff`}
                alt={menu.vendorName}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">{menu.vendorName}</span>
              <span className="text-[10px] text-success font-bold flex items-center gap-1">
                <ShieldCheck size={10} /> Terverifikasi Sehat
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-border shadow-sm">
            <Star size={12} className="text-warning fill-warning" />
            <span className="text-xs font-bold">{menu.vendorRating.toFixed(1)}</span>
          </div>
        </section>

        {/* Payment method info (Tunai di Tempat) */}
        <section className="card-premium p-4 flex flex-col gap-2 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 text-primary font-bold text-xs">
            <Banknote size={16} />
            Metode Pembayaran: Tunai di Tempat
          </div>
          <p className="text-[10px] text-muted-foreground">
            📍 Barcode pengambilan akan dibuat. Silakan siapkan uang tunai pas dan lakukan pembayaran saat mengambil makanan sehat kamu di catering.
          </p>
        </section>
      </div>

      {/* Fixed Action Button */}
      <div className="fixed bottom-[72px] left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-border z-40 flex items-center justify-center gap-3">
        <div className="w-full max-w-md flex gap-3">
          <Link href="/meal-planner" className="flex-1">
            <Button variant="outline" size="lg" className="w-full text-primary border-primary">
              + Meal Plan
            </Button>
          </Link>
          <Button
            size="lg"
            className="flex-1 shadow-lg shadow-primary/20"
            onClick={() => {
              setOrderResult(null);
              setShowOrderModal(true);
            }}
            disabled={!menu.isAvailable}
          >
            <QrCode size={16} className="mr-2" />
            Pesan Sekarang
          </Button>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {showOrderModal && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => { if (!isOrdering) setShowOrderModal(false); }}
        >
          <div
            className="w-full max-w-sm bg-white rounded-t-3xl p-6 pb-10 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success state */}
            {orderResult?.pickupCode ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground text-lg">Pesanan Berhasil! 🎉</h3>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="p-2 rounded-full bg-muted text-muted-foreground"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="p-4 bg-white rounded-2xl shadow-lg border-2 border-primary/20">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(orderResult.pickupCode)}&bgcolor=ffffff&color=0F5238&margin=10`}
                      alt="QR Code Pickup"
                      width={180}
                      height={180}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Kode Pengambilan</p>
                    <p className="font-mono text-xl font-black text-primary tracking-widest">
                      {orderResult.pickupCode}
                    </p>
                  </div>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
                  <MapPin size={18} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-primary">Ambil di: {menu.vendorName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {paymentMethod === "CASH"
                        ? `Siapkan Rp ${menu.price.toLocaleString("id-ID")} tunai saat ambil.`
                        : "Sudah lunas via Nutri-Wallet. Tunjukkan QR code ini ke vendor."}
                    </p>
                  </div>
                </div>
                <Link href="/dashboard">
                  <Button className="w-full" onClick={() => setShowOrderModal(false)}>
                    Lihat di Dashboard
                  </Button>
                </Link>
              </>
            ) : orderResult?.error ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground text-lg">Pesanan Gagal</h3>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="p-2 rounded-full bg-muted text-muted-foreground"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{orderResult.error}</p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setOrderResult(null)}>
                  Coba Lagi
                </Button>
              </>
            ) : (
              <>
                {/* Confirmation state */}
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground text-lg">Konfirmasi Pesanan</h3>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="p-2 rounded-full bg-muted text-muted-foreground"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                    {!imgFailed && heroImage ? (
                      <img 
                        src={heroImage} 
                        alt={menu.name} 
                        className="w-full h-full object-cover" 
                        onError={() => setImgFailed(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-primary/30">
                        <Utensils size={20} className="stroke-[1.5]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{menu.name}</p>
                    <p className="text-xs text-muted-foreground">{menu.vendorName}</p>
                    <p className="text-base font-black text-budget mt-1">
                      Rp {menu.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="bg-muted/20 border border-border/50 rounded-xl p-3 text-[10px] text-muted-foreground">
                  📍 QR Code pengambilan akan dibuat. Silakan siapkan uang tunai sebesar Rp {menu.price.toLocaleString("id-ID")} saat mengambil pesanan di catering.
                </div>

                <Button
                  size="lg"
                  className="w-full shadow-lg shadow-primary/20"
                  onClick={handleOrder}
                  disabled={isOrdering}
                >
                  {isOrdering ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <QrCode size={16} className="mr-2" />
                      Konfirmasi & Dapatkan Barcode
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
