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
  AlertTriangle,
  Zap,
  Sparkles,
  RefreshCw,
  Play
} from "lucide-react";
import { 
  createPakasirBilling, 
  checkPakasirPaymentStatus, 
  simulateSandboxPayment 
} from "@/app/actions/payment-actions";

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
            orderBy: { createdAt: "desc" }
          }
        }
      } 
    }
  });

  const vendor = user?.vendor;
  if (!vendor) redirect("/login");

  const orderIdQuery = searchParams.order_id;

  // Handles: initiating a new billing request
  const handleUpgrade = async () => {
    "use server";
    const res = await createPakasirBilling(vendor.id, 99000);
    if (res.success && res.paymentUrl) {
      redirect(res.paymentUrl);
    }
  };

  // Handles: manual check of status
  const handleCheckStatus = async () => {
    "use server";
    if (orderIdQuery) {
      await checkPakasirPaymentStatus(orderIdQuery);
      redirect(`/vendor/subscription?order_id=${orderIdQuery}&checked=1`);
    }
  };

  // Handles: sandbox webhook simulation
  const handleSimulatePayment = async () => {
    "use server";
    if (orderIdQuery) {
      await simulateSandboxPayment(orderIdQuery, 99000);
      redirect("/vendor/subscription?status=success");
    }
  };

  const isPremium = vendor.plan === "PREMIUM";
  const statusColor = isPremium ? "text-green-600 bg-green-50" : "text-amber-600 bg-amber-50";

  return (
    <>
      <VendorTopBar title="Premium Plans" />

      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 hide-scrollbar">
        <div className="max-w-[1000px] mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-[#191C1D]">Vendor Subscription</h2>
            <p className="text-[#707973] font-medium mt-1">Kelola paket langganan Anda dan dapatkan fitur premium.</p>
          </div>

          {/* Current Status Card */}
          <div className="bg-white p-8 rounded-[32px] border border-[#E1E3E4] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${isPremium ? "bg-[#B0F1CC] text-[#002113]" : "bg-orange-100 text-orange-800"}`}>
                <CreditCard size={28} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#707973] uppercase tracking-widest">Status Paket</span>
                <h3 className="text-xl font-bold text-[#191C1D] mt-0.5">
                  {isPremium ? "Premium Partner Plan" : "Free Trial Plan"}
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

          {/* Sandbox Testing Sync Section */}
          {orderIdQuery && (
            <div className="p-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-[32px] space-y-6">
              <div className="flex items-center gap-3 text-slate-800">
                <AlertTriangle className="text-amber-500" size={24} />
                <h3 className="text-lg font-bold">Verifikasi Pembayaran Pakasir</h3>
              </div>
              <p className="text-sm text-slate-600">
                Transaksi dengan Order ID <code className="bg-slate-200 px-2 py-0.5 rounded font-mono font-bold text-xs">{orderIdQuery}</code> telah berhasil dibuat. Silakan pilih aksi di bawah untuk melanjutkan pengujian.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <form action={handleCheckStatus} className="flex-1">
                  <button 
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2 bg-[#0F5238] hover:opacity-90 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-all"
                  >
                    <RefreshCw size={16} />
                    Cek Status Pembayaran (Sync API)
                  </button>
                </form>

                <form action={handleSimulatePayment} className="flex-1">
                  <button 
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-all"
                  >
                    <Play size={16} />
                    Simulasi Pembayaran (Sandbox)
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-[32px] border border-[#E1E3E4] shadow-sm flex flex-col justify-between h-[450px]">
              <div>
                <h4 className="text-lg font-bold text-[#707973] uppercase tracking-wide">Free Plan</h4>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-black text-[#191C1D]">Rp 0</span>
                  <span className="text-[#707973] text-sm ml-2">/ selamanya</span>
                </div>
                <p className="text-sm text-[#707973] mt-2">Batas dasar untuk memulai katering Anda.</p>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-3 text-sm font-semibold text-[#404943]">
                    <Check size={18} className="text-green-600" />
                    <span>Maksimal 5 item menu aktif</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-[#404943]">
                    <Check size={18} className="text-green-600" />
                    <span>Dashboard standar katering</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-gray-400">
                    <X size={18} className="text-red-500" />
                    <span>Tidak bisa membuat iklan promosi</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-gray-400">
                    <X size={18} className="text-red-500" />
                    <span>Tanpa badge Premium Partner</span>
                  </li>
                </ul>
              </div>

              <button 
                disabled 
                className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold text-sm cursor-not-allowed"
              >
                {isPremium ? "Paket Saat Ini (Downgrade tidak diizinkan)" : "Paket Anda Saat Ini"}
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-[#FFFFFF] p-8 rounded-[32px] border-2 border-[#0F5238] shadow-lg flex flex-col justify-between h-[450px] relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-[#B0F1CC] text-[#002113] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles size={10} /> Recommended
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-[#0F5238] uppercase tracking-wide flex items-center gap-2">
                  <Zap size={18} /> Premium Partner
                </h4>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-black text-[#191C1D]">Rp 99.000</span>
                  <span className="text-[#707973] text-sm ml-2">/ bulan</span>
                </div>
                <p className="text-sm text-[#707973] mt-2">Dapatkan eksposur maksimal dan fitur tanpa batas.</p>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-3 text-sm font-semibold text-[#404943]">
                    <Check size={18} className="text-green-600" />
                    <span>Tambah menu tanpa batas</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-[#404943]">
                    <Check size={18} className="text-green-600" />
                    <span>Buat iklan sponsor di dashboard user</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-[#404943]">
                    <Check size={18} className="text-green-600" />
                    <span>Badge "Premium Partner" pada menu & toko</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-[#404943]">
                    <Check size={18} className="text-green-600" />
                    <span>Statistik & Insight penjualan lanjutan</span>
                  </li>
                </ul>
              </div>

              {isPremium ? (
                <button 
                  disabled 
                  className="w-full py-4 bg-[#B0F1CC] text-[#002113] rounded-2xl font-bold text-sm"
                >
                  Premium Aktif
                </button>
              ) : (
                <form action={handleUpgrade}>
                  <button 
                    type="submit" 
                    className="w-full py-4 bg-[#0F5238] hover:opacity-90 text-white rounded-2xl font-black text-sm shadow-md transition-all active:scale-[0.98]"
                  >
                    Upgrade via Pakasir
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Billing History Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#191C1D]">Riwayat Tagihan</h3>
            <div className="bg-white rounded-3xl border border-[#E1E3E4] overflow-hidden shadow-sm">
              <table className="w-full text-left">
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
                        <td className="px-6 py-4 text-sm font-mono font-bold text-slate-800">{sub.orderId}</td>
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
      </main>
    </>
  );
}
