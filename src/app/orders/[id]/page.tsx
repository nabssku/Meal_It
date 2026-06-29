"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  ChefHat,
  Navigation,
  Loader2,
  MessageSquare,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import { getOrderDetailAction, cancelOrderAction } from "@/app/actions/order-actions";
import dynamic from "next/dynamic";

const TrackingMap = dynamic(() => import("@/components/orders/TrackingMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-gray-100 rounded-3xl flex items-center justify-center">
      <Loader2 className="animate-spin text-[#0F5238] w-8 h-8" />
    </div>
  ),
});

type OrderDetail = NonNullable<Awaited<ReturnType<typeof getOrderDetailAction>>>;

const TRACKING_STEPS = [
  { key: "PENDING", label: "Menunggu", icon: Clock, color: "text-amber-500" },
  { key: "PROCESSING", label: "Disiapkan", icon: ChefHat, color: "text-indigo-500" },
  { key: "ON_DELIVERY", label: "Diantar", icon: Truck, color: "text-[#0F5238]" },
  { key: "COMPLETED", label: "Selesai", icon: CheckCircle2, color: "text-emerald-500" },
];

const PICKUP_STEPS = [
  { key: "PENDING", label: "Menunggu", icon: Clock, color: "text-amber-500" },
  { key: "PROCESSING", label: "Disiapkan", icon: ChefHat, color: "text-indigo-500" },
  { key: "READY", label: "Siap Ambil", icon: Package, color: "text-emerald-500" },
  { key: "COMPLETED", label: "Selesai", icon: CheckCircle2, color: "text-emerald-500" },
];

function getStepIndex(status: string, isDelivery: boolean): number {
  const steps = isDelivery ? TRACKING_STEPS : PICKUP_STEPS;
  const map: Record<string, number> = {};
  steps.forEach((s, i) => (map[s.key] = i));
  if (status === "CONFIRMED") return 0;
  if (status === "READY") return isDelivery ? 2 : 2;
  return map[status] ?? 0;
}

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const orderId = resolvedParams.id;
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = useCallback(async () => {
    const data = await getOrderDetailAction(orderId);
    if (data) setOrder(data as OrderDetail);
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Polling for tracking updates (every 5 seconds for active orders)
  useEffect(() => {
    if (!order) return;
    const isActive = !["COMPLETED", "CANCELLED", "REJECTED"].includes(order.status);
    if (!isActive) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/track`);
        const data = await res.json();
        if (data.tracking) {
          setOrder((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              status: data.tracking.status,
              trackingStatus: data.tracking.trackingStatus,
              currentLat: data.tracking.currentLat,
              currentLng: data.tracking.currentLng,
              estimatedArrival: data.tracking.estimatedArrival,
            };
          });
        }
      } catch (_) {}
    }, 5000);

    return () => clearInterval(interval);
  }, [order?.status, orderId]);

  const handleCancel = async () => {
    if (!confirm("Apakah kamu yakin ingin membatalkan pesanan ini?")) return;
    setCancelling(true);
    const result = await cancelOrderAction(orderId);
    setCancelling(false);
    if (result.success) {
      fetchOrder();
    } else {
      alert(result.error || "Gagal membatalkan pesanan.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <Loader2 size={32} className="animate-spin text-[#0F5238]" />
        <p className="text-sm text-gray-500">Memuat detail pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
        <XCircle size={48} className="text-gray-300" />
        <h2 className="text-lg font-bold">Pesanan tidak ditemukan</h2>
        <Link href="/orders" className="text-[#0F5238] font-bold text-sm underline">
          Kembali ke Pesanan
        </Link>
      </div>
    );
  }

  const isDelivery = order.deliveryMethod === "DELIVERY";
  const steps = isDelivery ? TRACKING_STEPS : PICKUP_STEPS;
  const currentStep = getStepIndex(order.status, isDelivery);
  const isActive = !["COMPLETED", "CANCELLED", "REJECTED"].includes(order.status);
  const canCancel = order.status === "PENDING";

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] -mx-4 -mt-6 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-800" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-gray-900">Detail Pesanan</h1>
          <p className="text-[10px] text-gray-400 font-mono">#{order.id.substring(0, 12).toUpperCase()}</p>
        </div>
        {isActive && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F5238]/5 rounded-full">
            <div className="w-2 h-2 bg-[#0F5238] rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-[#0F5238]">LIVE</span>
          </div>
        )}
      </header>

      {/* Map (for delivery orders) */}
      {isDelivery && (
        <div className="px-4 pt-4">
          <TrackingMap
            vendorLat={order.vendor.latitude}
            vendorLng={order.vendor.longitude}
            deliveryLat={order.deliveryLat}
            deliveryLng={order.deliveryLng}
            currentLat={order.currentLat}
            currentLng={order.currentLng}
            vendorName={order.vendor.name}
            trackingStatus={order.trackingStatus}
          />
        </div>
      )}

      {/* Rejected Banner */}
      {order.status === "REJECTED" && order.rejectionReason && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700">Pesanan Ditolak</p>
            <p className="text-xs text-red-600 mt-0.5">{order.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Progress Stepper */}
      {isActive && (
        <div className="px-4 pt-5">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-8 right-8 h-1 bg-gray-100 rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-[#0F5238] to-[#1A8A5A] rounded-full transition-all duration-700"
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 z-10 relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isCurrent
                          ? "bg-[#0F5238] text-white shadow-lg shadow-[#0F5238]/30 scale-110"
                          : isCompleted
                          ? "bg-[#0F5238] text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <StepIcon size={18} />
                    </div>
                    <span className={`text-[10px] font-bold ${isCompleted ? "text-[#0F5238]" : "text-gray-400"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Vendor Info */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0F5238]/5 flex items-center justify-center text-[#0F5238] font-bold">
                {order.vendor.logo ? (
                  <img src={order.vendor.logo} alt="" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  order.vendor.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{order.vendor.name}</p>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <MapPin size={10} />
                  {order.vendor.address || "Lokasi tidak tersedia"}
                </p>
              </div>
            </div>
            {order.vendor.contact && (
              <a
                href={`tel:${order.vendor.contact}`}
                className="p-3 bg-[#0F5238] text-white rounded-2xl shadow-lg hover:opacity-90 transition-all"
              >
                <Phone size={18} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Detail Pesanan</h3>

          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                {item.menu.image ? (
                  <img src={item.menu.image} alt={item.menu.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package size={20} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{item.menu.name}</p>
                <p className="text-[10px] text-gray-400">{item.quantity}x • {item.menu.calories} kal</p>
              </div>
              <p className="text-sm font-bold text-gray-900">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</p>
            </div>
          ))}

          <div className="border-t border-gray-100 pt-3 space-y-2">
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Ongkos Kirim</span>
                <span className="font-bold text-gray-700">Rp {order.deliveryFee.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm font-bold text-gray-700">Total</span>
              <span className="text-lg font-black text-[#0F5238]">Rp {order.totalAmount.toLocaleString("id-ID")}</span>
            </div>
          </div>

          {/* Payment & Delivery Info */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full">
              <CreditCard size={12} className="text-gray-400" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">
                {order.paymentMethod === "CASH" ? "Tunai" : "Online (Pakasir)"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full">
              {isDelivery ? <Truck size={12} className="text-gray-400" /> : <Package size={12} className="text-gray-400" />}
              <span className="text-[10px] font-bold text-gray-500 uppercase">
                {isDelivery ? "Diantar" : "Ambil Sendiri"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      {isDelivery && order.deliveryAddress && (
        <div className="px-4 pt-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Navigation size={14} className="text-[#0F5238]" />
              Alamat Pengantaran
            </h3>
            <p className="text-xs text-gray-600">{order.deliveryAddress}</p>
          </div>
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="px-4 pt-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <MessageSquare size={14} className="text-[#0F5238]" />
              Catatan
            </h3>
            <p className="text-xs text-gray-600">{order.notes}</p>
          </div>
        </div>
      )}

      {/* Status Timeline */}
      {order.statusLogs && order.statusLogs.length > 0 && (
        <div className="px-4 pt-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Riwayat Status</h3>
            <div className="space-y-4">
              {order.statusLogs.map((log, idx) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${idx === order.statusLogs.length - 1 ? "bg-[#0F5238]" : "bg-gray-200"}`} />
                    {idx < order.statusLogs.length - 1 && <div className="w-0.5 h-8 bg-gray-100" />}
                  </div>
                  <div className="flex-1 -mt-0.5">
                    <p className="text-xs font-bold text-gray-900">{log.message || log.status}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(log.createdAt).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Button */}
      {canCancel && (
        <div className="px-4 pt-4">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full py-4 bg-red-50 text-red-600 border border-red-200 rounded-2xl font-bold text-sm hover:bg-red-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {cancelling ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
            {cancelling ? "Membatalkan..." : "Batalkan Pesanan"}
          </button>
        </div>
      )}
    </div>
  );
}
