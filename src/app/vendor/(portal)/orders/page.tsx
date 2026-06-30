"use client";

import React, { useState, useEffect } from "react";
import VendorTopBar from "@/components/vendor/VendorTopBar";
import {
  ClipboardList,
  Search,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Truck,
  PackageCheck,
  ChevronRight,
  XCircle,
  Calendar,
  Loader2,
  Navigation,
  Package,
  AlertTriangle,
} from "lucide-react";
import {
  getVendorOrdersAction,
  acceptOrderAction,
  rejectOrderAction,
  markOrderReadyAction,
  updateOrderTrackingAction,
  completeDeliveryAction,
} from "@/app/actions/vendor-order-actions";

type VendorOrder = Awaited<ReturnType<typeof getVendorOrdersAction>>[number];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "MENUNGGU", color: "text-amber-700", bg: "bg-amber-100 border-amber-200" },
  CONFIRMED: { label: "DIBAYAR", color: "text-blue-700", bg: "bg-blue-100 border-blue-200" },
  PROCESSING: { label: "DIMASAK", color: "text-indigo-700", bg: "bg-indigo-100 border-indigo-200" },
  READY: { label: "SIAP", color: "text-emerald-700", bg: "bg-emerald-100 border-emerald-200" },
  ON_DELIVERY: { label: "DIANTAR", color: "text-[#0F5238]", bg: "bg-[#0F5238]/10 border-[#0F5238]/20" },
  COMPLETED: { label: "SELESAI", color: "text-green-700", bg: "bg-green-100 border-green-200" },
  REJECTED: { label: "DITOLAK", color: "text-red-700", bg: "bg-red-100 border-red-200" },
  CANCELLED: { label: "DIBATALKAN", color: "text-gray-700", bg: "bg-gray-100 border-gray-200" },
};

export default function VendorOrdersPage() {
  const [currentTab, setCurrentTab] = useState("incoming");
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ orderId: string; show: boolean }>({ orderId: "", show: false });
  const [rejectReason, setRejectReason] = useState("");

  const fetchOrders = async (tab: string) => {
    setLoading(true);
    const data = await getVendorOrdersAction(tab);
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders(currentTab);
  }, [currentTab]);

  const handleAccept = async (orderId: string) => {
    setActionLoading(orderId);
    const res = await acceptOrderAction(orderId);
    setActionLoading(null);
    if (res.success) fetchOrders(currentTab);
    else alert(res.error);
  };

  const handleReject = async () => {
    if (rejectReason.trim().length < 10) {
      alert("Alasan penolakan harus minimal 10 karakter.");
      return;
    }
    setActionLoading(rejectModal.orderId);
    const res = await rejectOrderAction(rejectModal.orderId, rejectReason);
    setActionLoading(null);
    setRejectModal({ orderId: "", show: false });
    setRejectReason("");
    if (res.success) fetchOrders(currentTab);
    else alert(res.error);
  };

  const handleMarkReady = async (orderId: string) => {
    setActionLoading(orderId);
    const res = await markOrderReadyAction(orderId);
    setActionLoading(null);
    if (res.success) fetchOrders(currentTab);
    else alert(res.error);
  };

  const handleStartDelivery = async (orderId: string, order: VendorOrder) => {
    setActionLoading(orderId);
    // Use vendor's approximate location as starting point
    const res = await updateOrderTrackingAction(
      orderId,
      order.deliveryLat || 0,
      order.deliveryLng || 0,
      "ON_THE_WAY"
    );
    setActionLoading(null);
    if (res.success) fetchOrders(currentTab);
    else alert(res.error);
  };

  const handleComplete = async (orderId: string) => {
    setActionLoading(orderId);
    const res = await completeDeliveryAction(orderId);
    setActionLoading(null);
    if (res.success) fetchOrders(currentTab);
    else alert(res.error);
  };

  const tabs = [
    { key: "incoming", label: "Masuk" },
    { key: "inprogress", label: "Diproses" },
    { key: "completed", label: "Selesai" },
  ];

  return (
    <>
      <VendorTopBar title="Order Management" />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-5 md:space-y-6 hide-scrollbar">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#191C1D]">Pesanan Pelanggan</h2>
            <p className="text-[#707973] font-medium mt-1">
              Kelola pesanan masuk dan perbarui status secara real-time.
            </p>
          </div>

          <div className="flex bg-white p-1 rounded-2xl border border-[#E1E3E4]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key)}
                className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                  currentTab === tab.key
                    ? "bg-[#0F5238] text-white shadow-sm"
                    : "text-[#707973] hover:text-[#0F5238]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#0F5238] w-8 h-8" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-[32px] border border-[#E1E3E4] shadow-sm">
            <div className="w-16 h-16 bg-[#F3F4F5] rounded-full flex items-center justify-center text-[#707973] mx-auto mb-4">
              <ClipboardList size={32} />
            </div>
            <h4 className="text-xl font-bold text-[#191C1D]">Belum ada pesanan</h4>
            <p className="text-[#707973] mt-2">
              {currentTab === "incoming" && "Pesanan baru dari pelanggan akan muncul di sini."}
              {currentTab === "inprogress" && "Pesanan yang sedang diproses akan muncul di sini."}
              {currentTab === "completed" && "Pesanan yang sudah selesai akan muncul di sini."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
              const isLoading = actionLoading === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-[#E1E3E4] shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-4 md:p-8 flex flex-col gap-4">
                    {/* Customer Info */}
                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-[#F3F4F5] flex items-center justify-center overflow-hidden border border-[#E1E3E4] flex-shrink-0">
                        {order.user.image ? (
                          <img src={order.user.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[#0F5238] font-bold text-xl">
                            {order.user.name?.substring(0, 2).toUpperCase() || "C"}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="text-lg font-bold text-[#191C1D]">{order.user.name || "Pelanggan"}</h4>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.bg} ${config.color}`}>
                            {config.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.deliveryMethod === "DELIVERY"
                              ? "bg-blue-50 text-blue-600 border border-blue-200"
                              : "bg-gray-50 text-gray-600 border border-gray-200"
                          }`}>
                            {order.deliveryMethod === "DELIVERY" ? "🛵 Delivery" : "📦 Pickup"}
                          </span>
                        </div>

                        <p className="text-sm text-[#707973] mt-1 flex items-center gap-1 flex-wrap">
                          <span className="text-[#0F5238] font-bold">#{order.id.substring(0, 8).toUpperCase()}</span>
                          <span>•</span>
                          <Clock size={14} className="ml-1" />
                          {new Date(order.createdAt).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                        {/* Order Items */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="bg-[#F3F4F5] px-3 py-1.5 rounded-xl border border-[#EDEEEF] flex items-center gap-2">
                              <span className="text-[10px] font-black text-[#0F5238]">{item.quantity}x</span>
                              <span className="text-xs font-bold text-[#404943]">{item.menu.name}</span>
                            </div>
                          ))}
                        </div>

                        {/* Delivery Address */}
                        {order.deliveryMethod === "DELIVERY" && order.deliveryAddress && (
                          <div className="mt-3 flex items-start gap-2 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                            <MapPin size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 font-medium">{order.deliveryAddress}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Price & Actions */}
                     <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#EDEEEF] pt-4 md:border-0 md:pt-0">
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#707973] uppercase tracking-wider">Total</p>
                        <p className="text-2xl font-black text-[#191C1D]">
                          Rp {order.totalAmount.toLocaleString("id-ID")}
                        </p>
                        <p className="text-[10px] text-[#707973] font-bold mt-0.5">
                          {order.paymentMethod === "CASH" ? "💵 Tunai" : "💳 Online"}
                          {order.deliveryFee > 0 && ` • Ongkir Rp ${order.deliveryFee.toLocaleString("id-ID")}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Incoming: Accept / Reject */}
                        {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                          <>
                            <button
                              onClick={() => handleAccept(order.id)}
                              disabled={isLoading}
                              className="h-12 px-4 flex items-center justify-center gap-1.5 rounded-2xl bg-[#0F5238] text-white hover:opacity-90 active:scale-95 transition-all shadow-md text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                            >
                              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />}
                              Terima
                            </button>
                            <button
                              onClick={() => setRejectModal({ orderId: order.id, show: true })}
                              disabled={isLoading}
                              className="h-12 px-4 flex items-center justify-center gap-1.5 rounded-2xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:scale-95 transition-all text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                            >
                              <XCircle size={18} />
                              Tolak
                            </button>
                          </>
                        )}

                        {/* Processing: Mark Ready */}
                        {order.status === "PROCESSING" && (
                          <button
                            onClick={() => handleMarkReady(order.id)}
                            disabled={isLoading}
                            className="h-12 px-4 flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 text-white hover:opacity-90 active:scale-95 transition-all shadow-md text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                          >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={18} />}
                            Siap
                          </button>
                        )}

                        {/* Ready: Start Delivery or Complete */}
                        {order.status === "READY" && (
                          <>
                            {order.deliveryMethod === "DELIVERY" ? (
                              <button
                                onClick={() => handleStartDelivery(order.id, order)}
                                disabled={isLoading}
                                className="h-12 px-4 flex items-center justify-center gap-1.5 rounded-2xl bg-blue-600 text-white hover:opacity-90 active:scale-95 transition-all shadow-md text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                              >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Truck size={18} />}
                                Kirim
                              </button>
                            ) : (
                              <button
                                onClick={() => handleComplete(order.id)}
                                disabled={isLoading}
                                className="h-12 px-4 flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 text-white hover:opacity-90 active:scale-95 transition-all shadow-md text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                              >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                Diambil
                              </button>
                            )}
                          </>
                        )}

                        {/* On Delivery: Complete */}
                        {order.status === "ON_DELIVERY" && (
                          <button
                            onClick={() => handleComplete(order.id)}
                            disabled={isLoading}
                            className="h-12 px-4 flex items-center justify-center gap-1.5 rounded-2xl bg-[#0F5238] text-white hover:opacity-90 active:scale-95 transition-all shadow-md text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                          >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />}
                            Selesai
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rejection Reason (for completed tab) */}
                  {order.status === "REJECTED" && order.rejectionReason && (
                    <div className="bg-red-50 px-8 py-3 border-t border-red-100 flex items-center gap-2">
                      <AlertTriangle size={14} className="text-red-500" />
                      <span className="text-xs font-bold text-red-600">Alasan: {order.rejectionReason}</span>
                    </div>
                  )}

                  {/* Bottom Info Bar */}
                  <div className="bg-[#F8F9FA] px-8 py-3 border-t border-[#EDEEEF] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#707973] uppercase tracking-wider">
                      <PackageCheck size={14} className="text-green-500" />
                      {order.paymentMethod === "CASH" ? "Tunai" : "Online"} • {order.paymentStatus}
                    </div>
                    {order.user.email && (
                      <span className="text-[10px] font-medium text-[#707973]">{order.user.email}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Reject Modal */}
      {rejectModal.show && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setRejectModal({ orderId: "", show: false })}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 rounded-2xl">
                <XCircle size={24} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#191C1D]">Tolak Pesanan</h3>
                <p className="text-xs text-[#707973]">Berikan alasan yang valid untuk penolakan</p>
              </div>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Stok bahan habis untuk menu ini hari ini..."
              rows={4}
              className="w-full px-5 py-3.5 bg-[#F3F4F5] border-none rounded-2xl focus:ring-2 focus:ring-red-500 font-medium text-sm resize-none"
            />

            <p className="text-[10px] text-[#707973]">
              ⚠️ Alasan penolakan akan ditampilkan kepada pelanggan. Minimal 10 karakter.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectModal({ orderId: "", show: false });
                  setRejectReason("");
                }}
                className="flex-1 py-3.5 bg-[#F3F4F5] text-[#404943] rounded-2xl font-bold text-sm hover:bg-[#E1E3E4] transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={rejectReason.trim().length < 10 || actionLoading === rejectModal.orderId}
                className="flex-1 py-3.5 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === rejectModal.orderId ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <XCircle size={16} />
                )}
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
