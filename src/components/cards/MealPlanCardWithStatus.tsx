"use client";

import React, { useState, useEffect } from "react";
import { Clock, Info, MapPin, Truck, CreditCard, Banknote, QrCode, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createPortal } from "react-dom";

interface MealPlanCardWithStatusProps {
  id?: string;
  itemId?: string;
  time: string;
  name: string;
  calories: number;
  protein: number;
  image: string;
  price: number;
  vendorName?: string;
  deliveryMethod?: string;  // "PICKUP" | "DELIVERY"
  status?: string;          // "PENDING" | "PREPARING" | "READY" | "PICKED_UP" | "DELIVERED"
  paymentMethod?: string;   // "WALLET" | "CASH"
  paymentStatus?: string;   // "PENDING" | "PAID"
  pickupCode?: string | null;
}

const MEAL_TIME_LABELS: Record<string, string> = {
  BREAKFAST: "Sarapan",
  LUNCH: "Makan Siang",
  DINNER: "Makan Malam",
  SNACK: "Snack",
};

const DELIVERY_LABELS: Record<string, string> = {
  PICKUP: "Ambil di Tempat",
  DELIVERY: "Diantar",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:    { label: "Menunggu", color: "text-amber-700",  bg: "bg-amber-100" },
  PREPARING:  { label: "Disiapkan", color: "text-blue-700",  bg: "bg-blue-100" },
  READY:      { label: "Siap Diambil", color: "text-green-700", bg: "bg-green-100" },
  PICKED_UP:  { label: "Sudah Diambil ✓", color: "text-emerald-700", bg: "bg-emerald-100" },
  DELIVERED:  { label: "Terkirim ✓", color: "text-emerald-700", bg: "bg-emerald-100" },
};

const PAYMENT_CONFIG: Record<string, { label: string; color: string }> = {
  PAID:    { label: "Lunas", color: "text-green-600" },
  PENDING: { label: "Belum Bayar", color: "text-orange-600" },
};

export default function MealPlanCardWithStatus({
  id,
  itemId,
  time,
  name,
  calories,
  protein,
  image,
  price,
  vendorName,
  deliveryMethod = "PICKUP",
  status = "PENDING",
  paymentMethod = "CASH",
  paymentStatus = "PENDING",
  pickupCode,
}: MealPlanCardWithStatusProps) {
  const [showQR, setShowQR] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const timeLabel = MEAL_TIME_LABELS[time] || time;
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const paymentCfg = PAYMENT_CONFIG[paymentStatus] || PAYMENT_CONFIG.PENDING;
  const isCompleted = status === "PICKED_UP" || status === "DELIVERED";
  const isPickup = deliveryMethod === "PICKUP";

  // QR Code image URL via free API
  const qrCodeUrl = pickupCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pickupCode)}&bgcolor=ffffff&color=0F5238&margin=10`
    : null;

  return (
    <>
      <div className={`card-premium flex flex-col p-3 gap-3 transition-all ${isCompleted ? "opacity-70" : ""}`}>
        {/* Main row */}
        <div className="flex gap-4 items-start">
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
            <img src={image} alt={name} className="w-full h-full object-cover" />
            {isCompleted && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <CheckCircle2 size={24} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
              <Clock size={10} />
              {timeLabel}
            </div>
            <h3 className="text-sm font-bold text-text-primary line-clamp-1">{name}</h3>
            {vendorName && (
              <p className="text-[10px] text-text-muted">{vendorName}</p>
            )}
            <div className="flex items-center gap-2 text-[10px] text-text-muted">
              <span>{calories} kkal</span>
              <span>•</span>
              <span>{protein}g protein</span>
            </div>
            <div className="text-sm font-bold text-budget">
              Rp {price.toLocaleString('id-ID')}
            </div>
          </div>

          {id ? (
            <Link
              href={`/menus/${id}`}
              className="p-2 text-text-muted bg-muted hover:bg-primary/10 hover:text-primary transition-colors rounded-full flex-shrink-0"
            >
              <Info size={16} />
            </Link>
          ) : (
            <button className="p-2 text-text-muted bg-muted rounded-full flex-shrink-0">
              <Info size={16} />
            </button>
          )}
        </div>

        {/* Status Row */}
        <div className="flex items-center justify-between border-t border-border/50 pt-2.5 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            {/* Delivery Badge */}
            <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">
              {isPickup ? <MapPin size={9} /> : <Truck size={9} />}
              {DELIVERY_LABELS[deliveryMethod] || deliveryMethod}
            </span>

            {/* Status Badge */}
            <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Payment Badge */}
            <span className={`text-[9px] font-bold flex items-center gap-1 ${paymentCfg.color}`}>
              {paymentMethod === "WALLET" ? <CreditCard size={9} /> : <Banknote size={9} />}
              {paymentMethod === "WALLET" ? "Wallet" : "Tunai"} · {paymentCfg.label}
            </span>

            {/* QR Button for Pickup items that haven't been picked up yet */}
            {isPickup && !isCompleted && pickupCode && (
              <button
                onClick={() => setShowQR(true)}
                className="flex items-center gap-1 text-[9px] font-bold px-2.5 py-1.5 bg-primary text-white rounded-full hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
              >
                <QrCode size={10} />
                Barcode
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {mounted && showQR && pickupCode && qrCodeUrl && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowQR(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-t-3xl p-6 pb-10 flex flex-col gap-5 animate-in slide-in-from-bottom-4 duration-300 shadow-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-grow min-w-0">
                <h3 className="font-bold text-text-primary text-lg leading-tight">Barcode Pengambilan</h3>
                <p className="text-xs text-text-muted mt-1 leading-snug">{timeLabel} — {name}</p>
              </div>
              <button
                onClick={() => setShowQR(false)}
                className="p-2 rounded-full bg-muted text-text-muted hover:bg-muted/80 transition-colors flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-2xl shadow-lg border-2 border-primary/20">
                <img
                  src={qrCodeUrl}
                  alt="QR Code Pengambilan"
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
              </div>
              <div className="text-center">
                <p className="text-xs text-text-muted mb-1">Kode Pengambilan</p>
                <p className="font-mono text-xl font-black text-primary tracking-widest">{pickupCode}</p>
              </div>
            </div>

            {/* Info Box */}
            <div className={`p-4 rounded-2xl ${paymentStatus === "PAID" ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"}`}>
              {paymentStatus === "PAID" ? (
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-green-700">✅ Sudah Dibayar (Nutri-Wallet)</p>
                    <p className="text-[10px] text-green-600 mt-0.5">Tunjukkan barcode ini ke vendor. Tidak perlu bayar tunai lagi.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <Banknote size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-orange-700">💵 Bayar Tunai di Tempat</p>
                    <p className="text-[10px] text-orange-600 mt-0.5">
                      Siapkan uang <strong>Rp {price.toLocaleString('id-ID')}</strong> untuk diserahkan ke vendor saat mengambil makanan.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Vendor Info */}
            {vendorName && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <MapPin size={16} className="text-primary flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Ambil di</p>
                  <p className="text-sm font-bold text-text-primary">{vendorName}</p>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
