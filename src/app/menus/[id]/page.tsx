"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Share2, Heart, ShieldCheck, MapPin,
  Star, Flame, Target, Utensils, Banknote,
  X, Loader2, AlertCircle, Truck, Package,
  CreditCard, ChevronRight, Navigation, StickyNote,
} from "lucide-react";
import { getMenuByIdAction } from "@/app/actions/meal-actions";
import { createOrderAction } from "@/app/actions/order-actions";
import { getUserProfileAction } from "@/app/actions/user-actions";

type Menu = NonNullable<Awaited<ReturnType<typeof getMenuByIdAction>>>;

const CATEGORY_LABELS: Record<string, string> = {
  sarapan: "Sarapan",
  "makan-siang": "Makan Siang",
  "makan-malam": "Makan Malam",
};

export default function MenuDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);

  // Order modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "PAKASIR">("CASH");
  const [notes, setNotes] = useState("");
  const [userAddress, setUserAddress] = useState<string>("");
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderResult, setOrderResult] = useState<{ orderId?: string; pickupCode?: string; paymentUrl?: string; error?: string } | null>(null);
  const [liked, setLiked] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [prevId, setPrevId] = useState(id);

  if (id !== prevId) {
    setPrevId(id);
    setImgFailed(false);
  }

  useEffect(() => {
    Promise.all([
      getMenuByIdAction(id),
      getUserProfileAction(),
    ]).then(([menuData, profileData]) => {
      setMenu(menuData);
      setUserAddress(profileData?.address || "");
      setLoading(false);
    });
  }, [id]);

  const handleOrder = async () => {
    if (!menu) return;
    setIsOrdering(true);

    const result = await createOrderAction({
      menuId: menu.id,
      quantity: 1,
      deliveryMethod,
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    setIsOrdering(false);

    if (result.success) {
      if (result.paymentUrl) {
        // Redirect to Pakasir payment page
        window.location.href = result.paymentUrl;
        return;
      }
      setOrderResult({ orderId: result.orderId, pickupCode: result.pickupCode });
    } else {
      setOrderResult({ error: result.error });
    }
  };

  const fallbackImage = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600";
  const heroImage = menu?.image || fallbackImage;

  const subtotal = menu?.price || 0;
  const deliveryFee = deliveryMethod === "DELIVERY" ? (menu?.vendorDeliveryFee || 0) : 0;
  const total = subtotal + deliveryFee;

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
            <Link
              href={`/vendors?rate=${menu.vendorId}`}
              className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
            >
              <MapPin size={14} />
              <span>{menu.vendorName}</span>
            </Link>
            {menu.vendorDeliveryEnabled && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1 text-[#0F5238]">
                  <Truck size={14} />
                  <span>Delivery Available</span>
                </div>
              </>
            )}
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
                <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
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
        <Link href={`/vendors?rate=${menu.vendorId}`} className="block">
          <section className="bg-muted/20 p-4 rounded-2xl flex items-center justify-between border border-border/50 hover:bg-muted/30 transition-all cursor-pointer">
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
                {menu.vendorAddress && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {menu.vendorAddress}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-border shadow-sm">
              <Star size={12} className="text-warning fill-warning" />
              <span className="text-xs font-bold">{menu.vendorRating.toFixed(1)}</span>
            </div>
          </section>
        </Link>
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
            <Truck size={16} className="mr-2" />
            Pesan Sekarang
          </Button>
        </div>
      </div>

      {/* ───── Order Modal (Gojek-style) ───── */}
      {showOrderModal && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => { if (!isOrdering) setShowOrderModal(false); }}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-[28px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Success State ── */}
            {orderResult?.orderId && !orderResult?.error ? (
              <div className="p-6 pb-10 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground text-lg">Pesanan Berhasil! 🎉</h3>
                  <button onClick={() => setShowOrderModal(false)} className="p-2 rounded-full bg-muted text-muted-foreground">
                    <X size={18} />
                  </button>
                </div>

                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="w-20 h-20 bg-[#0F5238]/10 rounded-full flex items-center justify-center">
                    <Package size={36} className="text-[#0F5238]" />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    Pesananmu sedang menunggu konfirmasi dari vendor. Kamu bisa memantau statusnya secara real-time.
                  </p>
                </div>

                <Link href={`/orders/${orderResult.orderId}`}>
                  <Button className="w-full" size="lg" onClick={() => setShowOrderModal(false)}>
                    <Navigation size={16} className="mr-2" />
                    Lacak Pesanan
                  </Button>
                </Link>
              </div>

            ) : orderResult?.error ? (
              /* ── Error State ── */
              <div className="p-6 pb-10 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground text-lg">Pesanan Gagal</h3>
                  <button onClick={() => setShowOrderModal(false)} className="p-2 rounded-full bg-muted text-muted-foreground">
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
              </div>

            ) : (
              /* ── Confirmation State (Gojek-style) ── */
              <div className="flex flex-col">
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 bg-gray-200 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-6 pt-3 pb-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-foreground text-lg">Konfirmasi Pesanan</h3>
                    <button onClick={() => setShowOrderModal(false)} className="p-2 rounded-full bg-muted text-muted-foreground">
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Menu preview */}
                <div className="px-6 py-4 flex gap-3 items-center border-b border-gray-50">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                    {!imgFailed && heroImage ? (
                      <img src={heroImage} alt={menu.name} className="w-full h-full object-cover" onError={() => setImgFailed(true)} />
                    ) : (
                      <Utensils size={20} className="text-primary/30" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-sm">{menu.name}</p>
                    <p className="text-xs text-muted-foreground">{menu.vendorName}</p>
                  </div>
                  <p className="text-base font-black text-[#0F5238]">Rp {menu.price.toLocaleString("id-ID")}</p>
                </div>

                {/* ── Delivery Method ── */}
                <div className="px-6 py-4 border-b border-gray-50">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Metode Pengambilan</p>
                  <div className="flex gap-3">
                    {/* Pickup Option */}
                    <button
                      onClick={() => setDeliveryMethod("PICKUP")}
                      className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        deliveryMethod === "PICKUP"
                          ? "border-[#0F5238] bg-[#0F5238]/5"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <Package size={24} className={deliveryMethod === "PICKUP" ? "text-[#0F5238]" : "text-gray-400"} />
                      <span className={`text-xs font-bold ${deliveryMethod === "PICKUP" ? "text-[#0F5238]" : "text-gray-500"}`}>
                        Ambil Sendiri
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">Gratis</span>
                    </button>

                    {/* Delivery Option */}
                    <button
                      onClick={() => {
                        if (menu.vendorDeliveryEnabled) setDeliveryMethod("DELIVERY");
                      }}
                      disabled={!menu.vendorDeliveryEnabled}
                      className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        !menu.vendorDeliveryEnabled
                          ? "border-gray-100 opacity-50 cursor-not-allowed"
                          : deliveryMethod === "DELIVERY"
                          ? "border-[#0F5238] bg-[#0F5238]/5"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <Truck size={24} className={deliveryMethod === "DELIVERY" ? "text-[#0F5238]" : "text-gray-400"} />
                      <span className={`text-xs font-bold ${deliveryMethod === "DELIVERY" ? "text-[#0F5238]" : "text-gray-500"}`}>
                        Pesan Antar
                      </span>
                      {menu.vendorDeliveryEnabled ? (
                        <span className="text-[10px] font-bold text-gray-400">
                          Rp {menu.vendorDeliveryFee.toLocaleString("id-ID")}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-400">Tidak tersedia</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* ── Delivery Address ── */}
                {deliveryMethod === "DELIVERY" && (
                  <div className="px-6 py-4 border-b border-gray-50 animate-in fade-in">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alamat Pengantaran</p>
                      <Link
                        href="/profile/location"
                        className="text-[10px] font-bold text-[#0F5238] px-3 py-1 border border-[#0F5238] rounded-full hover:bg-[#0F5238]/5 transition-colors"
                      >
                        Ganti Alamat
                      </Link>
                    </div>
                    {userAddress ? (
                      <div className="bg-gray-50 p-3 rounded-xl flex items-start gap-2">
                        <MapPin size={14} className="text-[#0F5238] flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-700 font-medium">{userAddress}</p>
                      </div>
                    ) : (
                      <Link
                        href="/profile/location"
                        className="bg-red-50 p-3 rounded-xl flex items-center gap-2 border border-red-200"
                      >
                        <AlertCircle size={14} className="text-red-500" />
                        <p className="text-xs text-red-600 font-bold">Atur alamat pengantaran terlebih dahulu</p>
                      </Link>
                    )}
                  </div>
                )}

                {/* ── Notes ── */}
                <div className="px-6 py-4 border-b border-gray-50">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <StickyNote size={12} />
                    Catatan (Opsional)
                  </p>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Tanpa sambal, ekstra sayur..."
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#0F5238] font-medium"
                  />
                </div>

                {/* ── Payment Method ── */}
                <div className="px-6 py-4 border-b border-gray-50">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Metode Pembayaran</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => setPaymentMethod("CASH")}
                      className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                        paymentMethod === "CASH"
                          ? "border-[#0F5238] bg-[#0F5238]/5"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <Banknote size={22} className={paymentMethod === "CASH" ? "text-[#0F5238]" : "text-gray-400"} />
                      <div className="flex-1 text-left">
                        <p className={`text-sm font-bold ${paymentMethod === "CASH" ? "text-[#0F5238]" : "text-gray-700"}`}>
                          Bayar Tunai
                        </p>
                        <p className="text-[10px] text-gray-400">Bayar saat makanan diantar/diambil</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "CASH" ? "border-[#0F5238] bg-[#0F5238]" : "border-gray-300"
                      }`}>
                        {paymentMethod === "CASH" && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>

                    <button
                      onClick={() => { if (menu.vendorHasPakasir) setPaymentMethod("PAKASIR"); }}
                      disabled={!menu.vendorHasPakasir}
                      className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                        !menu.vendorHasPakasir
                          ? "border-gray-100 opacity-50 cursor-not-allowed"
                          : paymentMethod === "PAKASIR"
                          ? "border-[#0F5238] bg-[#0F5238]/5"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <CreditCard size={22} className={paymentMethod === "PAKASIR" ? "text-[#0F5238]" : "text-gray-400"} />
                      <div className="flex-1 text-left">
                        <p className={`text-sm font-bold ${paymentMethod === "PAKASIR" ? "text-[#0F5238]" : "text-gray-700"}`}>
                          Bayar Online (Pakasir)
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {menu.vendorHasPakasir ? "QRIS, Virtual Account, dll." : "Vendor belum mengonfigurasi"}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "PAKASIR" ? "border-[#0F5238] bg-[#0F5238]" : "border-gray-300"
                      }`}>
                        {paymentMethod === "PAKASIR" && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  </div>
                </div>

                {/* ── Price Summary ── */}
                <div className="px-6 py-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold text-gray-700">Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Ongkos Kirim</span>
                      <span className="font-bold text-gray-700">Rp {deliveryFee.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base pt-2 border-t border-gray-100">
                    <span className="font-bold text-gray-900">Total Pembayaran</span>
                    <span className="font-black text-[#0F5238] text-lg">Rp {total.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* ── Order Button ── */}
                <div className="px-6 pb-8 pt-2">
                  <Button
                    size="lg"
                    className="w-full shadow-lg shadow-primary/20 py-4"
                    onClick={handleOrder}
                    disabled={isOrdering || (deliveryMethod === "DELIVERY" && !userAddress)}
                  >
                    {isOrdering ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Memproses Pesanan...
                      </>
                    ) : paymentMethod === "PAKASIR" ? (
                      <>
                        <CreditCard size={16} className="mr-2" />
                        Bayar Rp {total.toLocaleString("id-ID")}
                      </>
                    ) : (
                      <>
                        <Package size={16} className="mr-2" />
                        Pesan Sekarang
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
