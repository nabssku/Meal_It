"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  MapPin,
  Clock,
  ChevronRight,
  Loader2,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShoppingBag,
} from "lucide-react";
import { getActiveOrdersAction } from "@/app/actions/order-actions";

type ActiveOrder = Awaited<ReturnType<typeof getActiveOrdersAction>>[number];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  PENDING: { label: "Menunggu Konfirmasi", color: "text-amber-700", icon: <Clock size={14} />, bg: "bg-amber-50 border-amber-200" },
  CONFIRMED: { label: "Pembayaran Dikonfirmasi", color: "text-blue-700", icon: <CheckCircle2 size={14} />, bg: "bg-blue-50 border-blue-200" },
  PROCESSING: { label: "Sedang Disiapkan", color: "text-indigo-700", icon: <Package size={14} />, bg: "bg-indigo-50 border-indigo-200" },
  READY: { label: "Siap Diambil/Dikirim", color: "text-emerald-700", icon: <CheckCircle2 size={14} />, bg: "bg-emerald-50 border-emerald-200" },
  ON_DELIVERY: { label: "Dalam Pengantaran", color: "text-[#0F5238]", icon: <Truck size={14} />, bg: "bg-[#0F5238]/5 border-[#0F5238]/20" },
  REJECTED: { label: "Ditolak Vendor", color: "text-red-700", icon: <XCircle size={14} />, bg: "bg-red-50 border-red-200" },
  CANCELLED: { label: "Dibatalkan", color: "text-gray-700", icon: <XCircle size={14} />, bg: "bg-gray-50 border-gray-200" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveOrdersAction()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={32} className="animate-spin text-[#0F5238]" />
        <p className="text-sm text-gray-500">Memuat pesanan...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <div className="w-20 h-20 bg-[#0F5238]/5 rounded-full flex items-center justify-center">
          <ShoppingBag size={36} className="text-[#0F5238]/40" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Belum Ada Pesanan</h2>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          Pesanan aktif kamu akan muncul di sini. Mulai pesan dari halaman menu!
        </p>
        <Link
          href="/menus"
          className="px-6 py-3 bg-[#0F5238] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#0F5238]/20 hover:opacity-90 transition-all"
        >
          Jelajahi Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-28">
      <header>
        <h1 className="text-xl font-bold text-gray-900">Pesanan Aktif</h1>
        <p className="text-xs text-gray-500 mt-0.5">{orders.length} pesanan sedang berlangsung</p>
      </header>

      <div className="flex flex-col gap-4">
        {orders.map((order) => {
          const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
          const firstItem = order.items[0];

          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0F5238]/20 transition-all overflow-hidden"
            >
              {/* Status Bar */}
              {order.status === "ON_DELIVERY" && (
                <div className="bg-gradient-to-r from-[#0F5238] to-[#1A8A5A] px-5 py-2.5 flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-xs font-bold">Makanan sedang dalam perjalanan</span>
                </div>
              )}

              {order.status === "REJECTED" && order.rejectionReason && (
                <div className="bg-red-50 px-5 py-2.5 flex items-center gap-2 border-b border-red-100">
                  <AlertTriangle size={14} className="text-red-500" />
                  <span className="text-red-600 text-xs font-bold truncate">{order.rejectionReason}</span>
                </div>
              )}

              <div className="p-5 flex items-center gap-4">
                {/* Vendor Avatar */}
                <div className="w-14 h-14 rounded-2xl bg-[#F3F4F5] flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                  {order.vendor.logo ? (
                    <img src={order.vendor.logo} alt={order.vendor.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-black text-[#0F5238]">
                      {order.vendor.name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Order Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{order.vendor.name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.bg} ${config.color}`}>
                      {config.icon}
                      {config.label}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 truncate">
                    {order.items.map((item) => `${item.quantity}x ${item.menu.name}`).join(", ")}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm font-black text-gray-900">
                      Rp {order.totalAmount.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] text-gray-400">•</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {order.deliveryMethod === "DELIVERY" ? "Diantar" : "Ambil Sendiri"}
                    </span>
                    <span className="text-[10px] text-gray-400">•</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {order.paymentMethod === "CASH" ? "Tunai" : "Online"}
                    </span>
                  </div>
                </div>

                <ChevronRight size={20} className="text-gray-300 group-hover:text-[#0F5238] transition-colors flex-shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
