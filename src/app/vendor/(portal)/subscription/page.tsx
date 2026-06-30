import React from "react";
import VendorTopBar from "@/components/vendor/VendorTopBar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  CreditCard,
  Check,
  X,
  Clock,
  Zap,
  Sparkles,
  Shield,
} from "lucide-react";
import { createPakasirBilling } from "@/app/actions/payment-actions";

export default async function VendorSubscriptionPage(props: {
  searchParams: Promise<{ order_id?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user) redirect("/vendor/login");

  // Fetch vendor details
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      vendor: {
        include: {
          subscriptions: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  const vendor = user?.vendor;
  if (!vendor) redirect("/login");

  // Fetch active pricing from DB (set by admin)
  const pricing = await prisma.subscriptionPricing.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
  });
  const activePrice = pricing?.price ?? 99000;
  const activeDuration = pricing?.durationDays ?? 30;
  const activePlanName = pricing?.name ?? "Premium Partner";
  const activePlanDescription = pricing?.description ?? "Dapatkan eksposur maksimal dan fitur tanpa batas.";

  const orderIdQuery = searchParams.order_id;

  // Handles: initiating a new billing request (reads price from DB internally)
  const handleUpgrade = async () => {
    "use server";
    const res = await createPakasirBilling(vendor.id);
    if (res.success && res.paymentUrl) {
      redirect(res.paymentUrl);
    }
  };

  const isPremium = vendor.plan === "PREMIUM";
  const statusColor = isPremium ? "text-green-600 bg-green-50" : "text-amber-600 bg-amber-50";

  // Check if the subscription for the current order_id is already activated
  const currentOrderSub = orderIdQuery
    ? vendor.subscriptions.find((s: any) => s.orderId === orderIdQuery)
    : null;
  const isOrderActivated = currentOrderSub?.status === "ACTIVE";

  return (
    <>
      <VendorTopBar title="Premium Plans" />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 hide-scrollbar">
        <div className="max-w-[1000px] mx-auto space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#191C1D]">Vendor Subscription</h2>
            <p className="text-[#707973] font-medium mt-1">Kelola paket langganan Anda dan dapatkan fitur premium.</p>
          </div>

          {/* Current Status Card */}
          <div className="bg-white p-6 md:p-8 rounded-[32px] border border-[#E1E3E4] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${isPremium ? "bg-[#B0F1CC] text-[#002113]" : "bg-orange-100 text-orange-800"}`}>
                <CreditCard size={28} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#707973] uppercase tracking-widest">Status Paket</span>
                <h3 className="text-xl font-bold text-[#191C1D] mt-0.5">
                  {isPremium ? activePlanName : "Free Trial Plan"}
                </h3>
                {isPremium && vendor.subscriptionExpiresAt && (
                  <p className="text-xs font-medium text-[#707973] mt-1">
                    Aktif sampai: {new Date(vendor.subscriptionExpiresAt).toLocaleDateString("id-ID")}
                  </p>
                )}
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${statusColor}`}>
              {isPremium ? "Active Premium" : "Free Plan"}
            </div>
          </div>

          {/* Banner berdasarkan status order saat redirect balik dari Pakasir */}
          {orderIdQuery && isOrderActivated && (
            <div className="p-5 md:p-6 bg-green-50 border border-green-200 rounded-[32px] flex items-center gap-4">
              <div className="p-2.5 bg-green-100 rounded-2xl flex-shrink-0">
                <Check className="text-green-600" size={20} />
              </div>
              <div>
                <p className="font-bold text-green-800 text-sm">Pembayaran berhasil dikonfirmasi via Webhook!</p>
                <p className="text-xs text-green-700 mt-0.5">Plan Anda telah diupgrade ke {activePlanName}. Selamat menikmati fitur lengkap Mealit.</p>
              </div>
            </div>
          )}

          {orderIdQuery && !isOrderActivated && (
            <div className="p-5 md:p-6 bg-amber-50 border border-amber-200 rounded-[32px] flex items-start gap-4">
              <div className="p-2.5 bg-amber-100 rounded-2xl flex-shrink-0">
                <Clock className="text-amber-600" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Menunggu Konfirmasi Pembayaran</h4>
                <p className="text-xs text-amber-700 mt-1">
                  Pembayaran Anda sedang diproses. Setelah berhasil, sistem kami akan otomatis menerima notifikasi dari Pakasir dan mengaktifkan plan Premium Anda — cukup refresh halaman ini untuk melihat statusnya.
                </p>
              </div>
            </div>
          )}

          {/* Success Banner (dari redirect ?status=success) */}
          {searchParams.status === "success" && !orderIdQuery && (
            <div className="p-5 bg-green-50 border border-green-200 rounded-[32px] flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <Check className="text-green-600" size={20} />
              </div>
              <div>
                <p className="font-bold text-green-800">Pembayaran berhasil dikonfirmasi!</p>
                <p className="text-xs text-green-700 mt-0.5">Plan Anda telah diupgrade ke Premium. Selamat menikmati fitur lengkap Mealit.</p>
              </div>
            </div>
          )}

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Free Plan */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-[#E1E3E4] shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-[#707973] uppercase tracking-wide">Free Plan</h4>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-black text-[#191C1D]">Rp 0</span>
                  <span className="text-[#707973] text-sm ml-2">/ selamanya</span>
                </div>
                <p className="text-sm text-[#707973] mt-2">Batas dasar untuk memulai katering Anda.</p>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-3 text-sm font-semibold text-[#404943]">
                    <Check size={18} className="text-green-600 flex-shrink-0" />
                    <span>Maksimal 5 item menu aktif</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-[#404943]">
                    <Check size={18} className="text-green-600 flex-shrink-0" />
                    <span>Dashboard standar katering</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-gray-400">
                    <X size={18} className="text-red-500 flex-shrink-0" />
                    <span>Tidak bisa membuat iklan promosi</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-gray-400">
                    <X size={18} className="text-red-500 flex-shrink-0" />
                    <span>Tanpa badge Premium Partner</span>
                  </li>
                </ul>
              </div>

              <button
                disabled
                className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold text-sm cursor-not-allowed mt-8"
              >
                {isPremium ? "Downgrade tidak diizinkan" : "Paket Anda Saat Ini"}
              </button>
            </div>

            {/* Premium Plan — price from DB */}
            <div className="bg-[#FFFFFF] p-6 md:p-8 rounded-[32px] border-2 border-[#0F5238] shadow-lg flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-[#B0F1CC] text-[#002113] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles size={10} /> Recommended
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#0F5238] uppercase tracking-wide flex items-center gap-2">
                  <Zap size={18} /> {activePlanName}
                </h4>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-black text-[#191C1D]">Rp {activePrice.toLocaleString()}</span>
                  <span className="text-[#707973] text-sm ml-2">/ {activeDuration} hari</span>
                </div>
                <p className="text-sm text-[#707973] mt-2">{activePlanDescription}</p>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-3 text-sm font-semibold text-[#404943]">
                    <Check size={18} className="text-green-600 flex-shrink-0" />
                    <span>Tambah menu tanpa batas</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-[#404943]">
                    <Check size={18} className="text-green-600 flex-shrink-0" />
                    <span>Buat iklan sponsor di dashboard user</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-[#404943]">
                    <Check size={18} className="text-green-600 flex-shrink-0" />
                    <span>Badge "Premium Partner" pada menu & toko</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-[#404943]">
                    <Check size={18} className="text-green-600 flex-shrink-0" />
                    <span>Statistik & Insight penjualan lanjutan</span>
                  </li>
                </ul>

                {/* Webhook Security Badge */}
                <div className="mt-6 flex items-center gap-2 p-3 bg-green-50 rounded-2xl">
                  <Shield size={14} className="text-green-600 flex-shrink-0" />
                  <p className="text-xs font-semibold text-green-700">Pembayaran diverifikasi via Pakasir Webhook</p>
                </div>
              </div>

              {isPremium ? (
                <button disabled className="w-full py-4 bg-[#B0F1CC] text-[#002113] rounded-2xl font-bold text-sm mt-8">
                  Premium Aktif ✓
                </button>
              ) : (
                <form action={handleUpgrade} className="mt-8">
                  <button
                    type="submit"
                    className="w-full py-4 bg-[#0F5238] hover:opacity-90 text-white rounded-2xl font-black text-sm shadow-md transition-all active:scale-[0.98]"
                  >
                    Upgrade via Pakasir — Rp {activePrice.toLocaleString()}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Billing History Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#191C1D]">Riwayat Tagihan</h3>
            <div className="bg-white rounded-3xl border border-[#E1E3E4] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[550px]">
                  <thead className="bg-[#F3F4F5] border-b border-[#E1E3E4]">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Nominal</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Metode</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDEEEF]">
                    {!vendor.subscriptions || vendor.subscriptions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-[#707973] font-medium italic">
                          Belum ada riwayat transaksi pembayaran.
                        </td>
                      </tr>
                    ) : (
                      vendor.subscriptions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-[#F8F9FA] transition-colors">
                          <td className="px-6 py-4 text-sm font-mono font-bold text-slate-800 max-w-[200px] truncate">{sub.orderId}</td>
                          <td className="px-6 py-4 text-sm font-bold text-[#191C1D]">Rp {sub.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm font-medium text-[#707973] uppercase">{sub.paymentMethod || "-"}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              sub.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : sub.status === "PENDING"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {sub.status === "ACTIVE" ? <Check size={10} /> : <Clock size={10} />}
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-[#707973]">
                            {new Date(sub.createdAt).toLocaleDateString("id-ID")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
