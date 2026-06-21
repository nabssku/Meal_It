"use client";

import React, { useState, useMemo } from "react";
import {
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  Clock,
  Search,
  X,
  ChevronRight,
  User,
  CreditCard,
  Banknote,
  Package,
  Calendar,
  Filter,
  ArrowUpRight,
  Receipt,
  Utensils,
} from "lucide-react";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  menuName: string;
  menuImage: string | null;
  menuCategory: string | null;
};

type Order = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
  totalAmount: number;
  status: string;
  paymentMethod: string | null;
  paymentStatus: string;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
};

type Stats = {
  total: number;
  completed: number;
  pending: number;
  totalRevenue: number;
};

type Props = {
  orders: Order[];
  stats: Stats;
  filterStatus: string;
  searchQuery: string;
  preOpenOrderId?: string;
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  COMPLETED:  { label: "Selesai",     bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  PENDING:    { label: "Menunggu",    bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500"   },
  PROCESSING: { label: "Diproses",   bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500"    },
  CANCELLED:  { label: "Dibatalkan", bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500"     },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const date = new Date(order.createdAt);
  const initials = order.userName?.substring(0, 2).toUpperCase() ?? "??";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-black/20 overflow-hidden animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-[#0F5238] to-[#2D6A4F] p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">
                  Detail Pesanan
                </p>
                <h3 className="text-xl font-black">#{order.id.substring(0, 8).toUpperCase()}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-black text-lg">
                {initials}
              </div>
              <div>
                <p className="font-bold text-lg">{order.userName ?? "Unknown"}</p>
                <p className="text-sm text-white/70">{order.userEmail}</p>
              </div>
              <div className="ml-auto">
                <StatusBadge status={order.status} />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Items */}
            <div>
              <p className="text-[10px] font-black text-[#707973] uppercase tracking-widest mb-3 flex items-center gap-1">
                <Utensils size={10} /> Item Pesanan
              </p>
              <div className="space-y-2">
                {order.items.length === 0 ? (
                  <p className="text-sm text-[#707973] italic">Tidak ada item.</p>
                ) : (
                  order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-2xl border border-[#EDEEEF]"
                    >
                      {item.menuImage ? (
                        <img
                          src={item.menuImage}
                          alt={item.menuName}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#E1E3E4] flex items-center justify-center flex-shrink-0">
                          <Package size={20} className="text-[#707973]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#191C1D] truncate">{item.menuName}</p>
                        {item.menuCategory && (
                          <p className="text-[10px] text-[#707973] capitalize">{item.menuCategory}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] text-[#707973]">×{item.quantity}</p>
                        <p className="text-sm font-black text-[#191C1D]">
                          Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-[#F3F4F5] rounded-2xl">
                <p className="text-[10px] font-black text-[#707973] uppercase tracking-wider mb-1 flex items-center gap-1">
                  {order.paymentMethod === "WALLET" ? <CreditCard size={10} /> : <Banknote size={10} />}
                  Pembayaran
                </p>
                <p className="text-sm font-bold text-[#191C1D]">
                  {order.paymentMethod === "WALLET" ? "Nutri-Wallet" : order.paymentMethod ?? "—"}
                </p>
                <p className={`text-[10px] font-bold mt-0.5 ${order.paymentStatus === "PAID" ? "text-emerald-600" : "text-amber-600"}`}>
                  {order.paymentStatus === "PAID" ? "✓ Lunas" : "Belum Bayar"}
                </p>
              </div>
              <div className="p-4 bg-[#F3F4F5] rounded-2xl">
                <p className="text-[10px] font-black text-[#707973] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar size={10} /> Tanggal
                </p>
                <p className="text-sm font-bold text-[#191C1D]">
                  {date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="text-[10px] text-[#707973] mt-0.5">
                  {date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider mb-1">Catatan</p>
                <p className="text-sm text-amber-800">{order.notes}</p>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between p-4 bg-[#0F5238]/5 border border-[#0F5238]/20 rounded-2xl">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-[#0F5238]" />
                <p className="font-bold text-[#191C1D]">Total Pembayaran</p>
              </div>
              <p className="text-2xl font-black text-[#0F5238]">
                Rp {order.totalAmount.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out }
        .animate-slideUp { animation: slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) }
      `}</style>
    </>
  );
}

const FILTER_TABS = [
  { value: "ALL", label: "Semua" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "PENDING", label: "Menunggu" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

export default function OrdersReportClient({
  orders,
  stats,
  filterStatus: initialFilter,
  searchQuery: initialSearch,
  preOpenOrderId,
}: Props) {
  const [search, setSearch] = useState(initialSearch);
  const [filter, setFilter] = useState(initialFilter);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(
    preOpenOrderId ? (orders.find((o) => o.id === preOpenOrderId) ?? null) : null
  );

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = filter === "ALL" || o.status === filter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        (o.userName ?? "").toLowerCase().includes(q) ||
        (o.userEmail ?? "").toLowerCase().includes(q) ||
        o.items.some((i) => i.menuName.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [orders, filter, search]);

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 hide-scrollbar">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[#191C1D]">Laporan Pesanan</h2>
        <p className="text-[#707973] font-medium mt-1">
          Riwayat lengkap semua transaksi dari pelanggan Anda.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Pesanan",
            value: stats.total,
            icon: ShoppingBag,
            color: "bg-[#B0F1CC] text-[#002113]",
            format: (v: number) => v.toString(),
          },
          {
            label: "Selesai",
            value: stats.completed,
            icon: CheckCircle2,
            color: "bg-emerald-100 text-emerald-700",
            format: (v: number) => v.toString(),
          },
          {
            label: "Menunggu",
            value: stats.pending,
            icon: Clock,
            color: "bg-amber-100 text-amber-700",
            format: (v: number) => v.toString(),
          },
          {
            label: "Total Revenue",
            value: stats.totalRevenue,
            icon: TrendingUp,
            color: "bg-[#0F5238] text-white",
            format: (v: number) => `Rp ${v.toLocaleString("id-ID")}`,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-3xl border border-[#E1E3E4] p-5 flex flex-col gap-3 hover:shadow-md transition-all"
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#707973]">{s.label}</p>
              <p className="text-xl font-black text-[#191C1D] mt-0.5">{s.format(s.value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Search */}
        <div className="relative flex-1 group w-full md:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707973] w-4 h-4 transition-colors group-focus-within:text-[#0F5238]" />
          <input
            type="text"
            placeholder="Cari nama pelanggan, menu, atau ID pesanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-white border border-[#E1E3E4] rounded-2xl focus:ring-2 focus:ring-[#0F5238] focus:border-transparent text-sm font-medium transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707973] hover:text-[#191C1D]"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#E1E3E4] flex-wrap">
          <Filter size={14} className="text-[#707973] ml-2 flex-shrink-0" />
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === tab.value
                  ? "bg-[#0F5238] text-white shadow-sm"
                  : "text-[#707973] hover:text-[#0F5238]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#E1E3E4] overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-4 bg-[#F3F4F5] border-b border-[#E1E3E4] text-[10px] font-black text-[#707973] uppercase tracking-widest">
          <span className="w-8">#</span>
          <span>Pelanggan &amp; Menu</span>
          <span className="hidden md:block">Pembayaran</span>
          <span>Total</span>
          <span>Status</span>
          <span>Tanggal</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-[#F3F4F5] rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} className="text-[#707973]" />
            </div>
            <p className="font-bold text-[#191C1D]">Tidak ada pesanan ditemukan</p>
            <p className="text-sm text-[#707973] mt-1">Coba ubah filter atau kata kunci pencarian.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#EDEEEF]">
            {filtered.map((order, idx) => {
              const date = new Date(order.createdAt);
              const firstItem = order.items[0];
              const initials = order.userName?.substring(0, 2).toUpperCase() ?? "??";

              return (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="w-full text-left grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-6 py-4 hover:bg-[#F8F9FA] transition-colors group"
                >
                  {/* Index */}
                  <span className="w-8 text-xs font-bold text-[#707973]">{idx + 1}</span>

                  {/* Customer + Menu */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0F5238] to-[#2D6A4F] flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#191C1D] truncate group-hover:text-[#0F5238] transition-colors">
                        {order.userName ?? "Unknown"}
                      </p>
                      <p className="text-[10px] text-[#707973] truncate">
                        {firstItem
                          ? `${firstItem.menuName}${order.items.length > 1 ? ` +${order.items.length - 1} lainnya` : ""}`
                          : order.userEmail}
                      </p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="hidden md:flex items-center gap-1.5 text-xs font-bold text-[#404943]">
                    {order.paymentMethod === "WALLET" ? (
                      <CreditCard size={14} className="text-[#0F5238]" />
                    ) : (
                      <Banknote size={14} className="text-[#0F5238]" />
                    )}
                    {order.paymentMethod === "WALLET" ? "Wallet" : order.paymentMethod ?? "—"}
                  </div>

                  {/* Amount */}
                  <p className="text-sm font-black text-[#191C1D] whitespace-nowrap">
                    Rp {order.totalAmount.toLocaleString("id-ID")}
                  </p>

                  {/* Status */}
                  <StatusBadge status={order.status} />

                  {/* Date + Arrow */}
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-[#707973] font-medium whitespace-nowrap">
                      {date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </p>
                    <ChevronRight
                      size={16}
                      className="text-[#E1E3E4] group-hover:text-[#0F5238] transition-colors flex-shrink-0"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Footer count */}
        {filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-[#EDEEEF] bg-[#F8F9FA] flex items-center justify-between">
            <p className="text-xs text-[#707973] font-medium">
              Menampilkan <span className="font-bold text-[#191C1D]">{filtered.length}</span> dari{" "}
              <span className="font-bold text-[#191C1D]">{orders.length}</span> pesanan
            </p>
            <div className="flex items-center gap-1 text-[10px] font-black text-[#0F5238]">
              <ArrowUpRight size={12} />
              Revenue: Rp {filtered.reduce((s, o) => s + (o.status === "COMPLETED" ? o.totalAmount : 0), 0).toLocaleString("id-ID")}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </main>
  );
}
