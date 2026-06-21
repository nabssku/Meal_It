"use client";

import React, { useState, useMemo, useTransition, useOptimistic } from "react";
import {
  ChefHat,
  CalendarDays,
  User,
  Clock,
  CheckCircle2,
  Package,
  Utensils,
  Sunrise,
  Sun,
  Moon,
  Cookie,
  CreditCard,
  Banknote,
  QrCode,
  Search,
  X,
  Truck,
  MapPin,
  Filter,
  Loader2,
  FlameKindling,
  PackageCheck,
  HandCoins,
} from "lucide-react";
import { updateMealPlanItemStatusAction } from "@/app/actions/vendor-actions";

type ScheduleItem = {
  id: string;
  mealType: string;
  status: string;
  deliveryMethod: string;
  paymentMethod: string;
  paymentStatus: string;
  pickupCode: string | null;
  date: string;
  menuName: string;
  menuImage: string | null;
  menuPrice: number;
  menuCategory: string | null;
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
};

const MEAL_TYPE_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.FC<{ size?: number; className?: string }>;
    color: string;
    bg: string;
    order: number;
  }
> = {
  BREAKFAST: { label: "Sarapan",      icon: Sunrise, color: "text-orange-600", bg: "bg-orange-100", order: 1 },
  LUNCH:     { label: "Makan Siang",  icon: Sun,     color: "text-yellow-600", bg: "bg-yellow-100", order: 2 },
  DINNER:    { label: "Makan Malam",  icon: Moon,    color: "text-indigo-600", bg: "bg-indigo-100", order: 3 },
  SNACK:     { label: "Snack",        icon: Cookie,  color: "text-pink-600",   bg: "bg-pink-100",   order: 4 },
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  PENDING:   { label: "Belum Disiapkan", bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"   },
  PREPARING: { label: "Sedang Dimasak",  bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"    },
  READY:     { label: "Siap Diambil",   bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  PICKED_UP: { label: "Sudah Diambil",  bg: "bg-gray-50",    text: "text-gray-500",    border: "border-gray-200"    },
  DELIVERED: { label: "Dikirim",        bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200"  },
};

// What button to show for each status
const NEXT_ACTION: Record<string, { label: string; nextStatus: string; icon: React.FC<{ size?: number; className?: string }>; color: string } | null> = {
  PENDING:   { label: "Mulai Masak",   nextStatus: "PREPARING", icon: FlameKindling, color: "bg-blue-500 hover:bg-blue-600 text-white" },
  PREPARING: { label: "Sudah Siap",    nextStatus: "READY",     icon: PackageCheck,  color: "bg-emerald-500 hover:bg-emerald-600 text-white" },
  READY:     { label: "Tandai Diambil",nextStatus: "PICKED_UP", icon: HandCoins,     color: "bg-[#0F5238] hover:bg-[#0a3d28] text-white" },
  PICKED_UP: null,
  DELIVERED: null,
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["PENDING"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {status === "PICKED_UP" || status === "DELIVERED" ? (
        <CheckCircle2 size={10} />
      ) : status === "READY" ? (
        <Package size={10} />
      ) : status === "PREPARING" ? (
        <FlameKindling size={10} />
      ) : (
        <Clock size={10} />
      )}
      {cfg.label}
    </span>
  );
}

function isToday(dateStr: string) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}
function isTomorrow(dateStr: string) {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return new Date(dateStr).toDateString() === t.toDateString();
}
function isPast(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) < today;
}
function formatDate(dateStr: string) {
  if (isToday(dateStr)) return "Hari Ini";
  if (isTomorrow(dateStr)) return "Besok";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const STATUS_FILTERS = [
  { value: "ALL",    label: "Semua" },
  { value: "ACTIVE", label: "Perlu Disiapkan" },
  { value: "DONE",   label: "Selesai" },
];

// ─── Individual card with status buttons ────────────────────────────────────
function ScheduleCard({ item }: { item: ScheduleItem }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(item.status);

  const mealCfg   = MEAL_TYPE_CONFIG[item.mealType] ?? MEAL_TYPE_CONFIG["LUNCH"];
  const MealIcon  = mealCfg.icon;
  const isDone    = ["PICKED_UP", "DELIVERED"].includes(optimisticStatus);
  const initials  = item.userName?.substring(0, 2).toUpperCase() ?? "??";
  const nextAction = NEXT_ACTION[optimisticStatus];

  const handleStatusChange = () => {
    if (!nextAction) return;
    const { nextStatus } = nextAction;
    startTransition(async () => {
      setOptimisticStatus(nextStatus);
      await updateMealPlanItemStatusAction(item.id, nextStatus);
    });
  };

  return (
    <div
      className={`bg-white rounded-2xl border transition-all hover:shadow-md overflow-hidden ${
        isDone ? "border-[#E1E3E4] opacity-60" : "border-[#E1E3E4] hover:border-[#0F5238]/20"
      }`}
    >
      {/* Meal type bar */}
      <div className={`px-4 py-2.5 flex items-center justify-between ${mealCfg.bg}`}>
        <div className={`flex items-center gap-2 ${mealCfg.color}`}>
          <MealIcon size={14} />
          <span className="text-[11px] font-black uppercase tracking-widest">{mealCfg.label}</span>
        </div>
        <StatusBadge status={optimisticStatus} />
      </div>

      <div className="p-4 space-y-3">
        {/* Menu Info */}
        <div className="flex items-center gap-3">
          {item.menuImage ? (
            <img
              src={item.menuImage}
              alt={item.menuName}
              className={`w-14 h-14 rounded-xl object-cover flex-shrink-0 ${isDone ? "grayscale" : ""}`}
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-[#F3F4F5] flex items-center justify-center flex-shrink-0">
              <Utensils size={22} className="text-[#707973]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-black text-[#191C1D] text-sm leading-tight truncate">{item.menuName}</p>
            <p className="text-[10px] text-[#707973] capitalize mt-0.5">{item.menuCategory ?? "Menu"}</p>
            <p className="text-sm font-bold text-[#0F5238] mt-1">
              Rp {item.menuPrice.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#EDEEEF]" />

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0F5238] to-[#2D6A4F] flex items-center justify-center text-white font-black text-[11px] flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#191C1D] truncate flex items-center gap-1">
              <User size={11} className="text-[#707973]" />
              {item.userName ?? "Unknown"}
            </p>
            <p className="text-[10px] text-[#707973] truncate">{item.userEmail}</p>
          </div>
        </div>

        {/* Badges Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${
              item.deliveryMethod === "PICKUP" ? "bg-[#F3F4F5] text-[#404943]" : "bg-blue-50 text-blue-700"
            }`}>
              {item.deliveryMethod === "PICKUP" ? <><MapPin size={10} /> Ambil</> : <><Truck size={10} /> Kirim</>}
            </span>
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${
              item.paymentMethod === "WALLET" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
            }`}>
              {item.paymentMethod === "WALLET"
                ? <><CreditCard size={10} /> Wallet</>
                : <><Banknote size={10} /> Cash</>}
            </span>
          </div>
          {item.pickupCode && (
            <span className="flex items-center gap-1 text-[10px] font-mono font-black text-[#0F5238] bg-[#0F5238]/5 px-2 py-1 rounded-lg border border-[#0F5238]/20">
              <QrCode size={10} />
              {item.pickupCode}
            </span>
          )}
        </div>

        {/* ── Status Action Button ── */}
        {nextAction && (
          <button
            onClick={handleStatusChange}
            disabled={isPending}
            className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm ${nextAction.color}`}
          >
            {isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <nextAction.icon size={14} />
            )}
            {isPending ? "Menyimpan..." : nextAction.label}
          </button>
        )}

        {isDone && (
          <div className="flex items-center justify-center gap-1.5 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <CheckCircle2 size={12} />
            Selesai
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function KitchenScheduleClient({ items }: { items: ScheduleItem[] }) {
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const groupedByDate = useMemo(() => {
    const filtered = items.filter((item) => {
      const matchStatus =
        statusFilter === "ALL"    ? true
        : statusFilter === "ACTIVE" ? !["PICKED_UP", "DELIVERED"].includes(item.status)
        : ["PICKED_UP", "DELIVERED"].includes(item.status);

      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        item.menuName.toLowerCase().includes(q) ||
        (item.userName ?? "").toLowerCase().includes(q) ||
        (item.userEmail ?? "").toLowerCase().includes(q) ||
        (item.pickupCode ?? "").toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });

    const map = new Map<string, ScheduleItem[]>();
    for (const item of filtered) {
      const key = new Date(item.date).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    map.forEach((arr) =>
      arr.sort(
        (a, b) =>
          (MEAL_TYPE_CONFIG[a.mealType]?.order ?? 99) -
          (MEAL_TYPE_CONFIG[b.mealType]?.order ?? 99)
      )
    );
    return Array.from(map.entries()).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
    );
  }, [items, search, statusFilter]);

  const todayItems   = items.filter((i) => isToday(i.date));
  const pendingToday = todayItems.filter((i) => !["PICKED_UP", "DELIVERED"].includes(i.status)).length;
  const tomorrowItems = items.filter((i) => isTomorrow(i.date));
  const totalActive  = items.filter((i) => !["PICKED_UP", "DELIVERED"].includes(i.status)).length;

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 hide-scrollbar">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[#191C1D]">Jadwal Dapur</h2>
        <p className="text-[#707973] font-medium mt-1">
          Lihat pesanan meal plan pelanggan yang perlu disiapkan per hari.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Perlu Disiapkan Hari Ini", value: pendingToday,        sub: `dari ${todayItems.length} hari ini`,    icon: ChefHat,      highlight: pendingToday > 0, color: "bg-[#B0F1CC] text-[#002113]" },
          { label: "Pesanan Besok",            value: tomorrowItems.length, sub: "siap disiapkan besok",                 icon: CalendarDays, highlight: false,             color: "bg-amber-100 text-amber-700"  },
          { label: "Aktif (Belum Selesai)",    value: totalActive,          sub: "dari semua tanggal",                  icon: Clock,        highlight: false,             color: "bg-blue-100 text-blue-700"    },
          { label: "Total Pesanan",            value: items.length,         sub: "semua waktu",                         icon: Package,      highlight: false,             color: "bg-[#F3F4F5] text-[#191C1D]"  },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-3xl p-5 flex flex-col gap-2 border transition-all hover:shadow-md ${
              s.highlight ? "bg-[#0F5238] border-[#0F5238]" : "bg-white border-[#E1E3E4]"
            }`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${s.highlight ? "bg-white/20" : s.color}`}>
              <s.icon size={18} className={s.highlight ? "text-white" : ""} />
            </div>
            <div>
              <p className={`text-2xl font-black ${s.highlight ? "text-white" : "text-[#191C1D]"}`}>{s.value}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${s.highlight ? "text-white/70" : "text-[#707973]"}`}>{s.label}</p>
              <p className={`text-[10px] mt-0.5 ${s.highlight ? "text-white/50" : "text-[#707973]"}`}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 items-center">
        <p className="text-[10px] font-black text-[#707973] uppercase tracking-widest">Alur Status:</p>
        {[
          { label: "Belum Disiapkan", color: "bg-amber-100 text-amber-700 border-amber-200" },
          { label: "→ Mulai Masak →", color: "text-[#707973]" },
          { label: "Sedang Dimasak",  color: "bg-blue-100 text-blue-700 border-blue-200" },
          { label: "→ Sudah Siap →",  color: "text-[#707973]" },
          { label: "Siap Diambil",    color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
          { label: "→ Diambil →",     color: "text-[#707973]" },
          { label: "Selesai ✓",       color: "bg-gray-100 text-gray-500 border-gray-200" },
        ].map((l, i) => (
          <span
            key={i}
            className={`text-[10px] font-bold px-2 py-1 rounded-full border ${l.color.includes("border") ? `border ${l.color}` : l.color} ${!l.color.includes("border") ? "border-transparent" : ""}`}
          >
            {l.label}
          </span>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707973] w-4 h-4 group-focus-within:text-[#0F5238] transition-colors" />
          <input
            type="text"
            placeholder="Cari nama pelanggan, menu, atau kode pickup..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-white border border-[#E1E3E4] rounded-2xl focus:ring-2 focus:ring-[#0F5238] focus:border-transparent text-sm font-medium transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707973] hover:text-[#191C1D]">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#E1E3E4]">
          <Filter size={14} className="text-[#707973] ml-2 flex-shrink-0" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === f.value ? "bg-[#0F5238] text-white" : "text-[#707973] hover:text-[#0F5238]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {groupedByDate.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E1E3E4] p-20 text-center">
          <div className="w-20 h-20 bg-[#F3F4F5] rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat size={36} className="text-[#707973]" />
          </div>
          <h4 className="font-bold text-xl text-[#191C1D]">Belum Ada Jadwal</h4>
          <p className="text-[#707973] text-sm mt-2 max-w-xs mx-auto">
            Jadwal akan muncul saat pelanggan memesan menu Anda melalui meal planner.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {groupedByDate.map(([dateKey, dayItems]) => {
            const dateStr      = dayItems[0].date;
            const isDateToday  = isToday(dateStr);
            const isDateTmr    = isTomorrow(dateStr);
            const isDatePast   = isPast(dateStr);
            const doneCount    = dayItems.filter((i) => ["PICKED_UP", "DELIVERED"].includes(i.status)).length;
            const totalCount   = dayItems.length;
            const progress     = Math.round((doneCount / totalCount) * 100);

            return (
              <div key={dateKey} className={isDatePast && !isDateToday ? "opacity-70" : ""}>
                {/* Date Header */}
                <div className={`flex items-center justify-between mb-4 p-4 rounded-2xl border ${
                  isDateToday  ? "bg-[#0F5238] border-[#0F5238] text-white"
                  : isDateTmr  ? "bg-[#B0F1CC]/40 border-[#B0F1CC] text-[#002113]"
                  : "bg-white border-[#E1E3E4] text-[#191C1D]"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isDateToday ? "bg-white/20" : "bg-[#F3F4F5]"}`}>
                      <CalendarDays size={18} className={isDateToday ? "text-white" : "text-[#0F5238]"} />
                    </div>
                    <div>
                      <p className={`font-black text-lg leading-tight ${isDateToday ? "text-white" : ""}`}>
                        {formatDate(dateStr)}
                        {isDateToday && (
                          <span className="ml-2 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
                            AKTIF
                          </span>
                        )}
                      </p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isDateToday ? "text-white/60" : "text-[#707973]"}`}>
                        {new Date(dateStr).toLocaleDateString("id-ID", {
                          weekday: "long", day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:block text-right">
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${isDateToday ? "text-white/60" : "text-[#707973]"}`}>
                        Progress
                      </p>
                      <p className={`text-sm font-black ${isDateToday ? "text-white" : "text-[#191C1D]"}`}>
                        {doneCount}/{totalCount}
                      </p>
                    </div>
                    <div className={`hidden md:block w-24 h-2 rounded-full ${isDateToday ? "bg-white/20" : "bg-[#F3F4F5]"}`}>
                      <div
                        className={`h-2 rounded-full transition-all ${isDateToday ? "bg-white" : "bg-[#0F5238]"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className={`text-sm font-black ${isDateToday ? "text-white" : "text-[#707973]"}`}>
                      {totalCount} menu
                    </span>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {dayItems.map((item) => (
                    <ScheduleCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
