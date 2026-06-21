import React from "react";
import VendorTopBar from "@/components/vendor/VendorTopBar";
import Link from "next/link";
import { 
  ShoppingBag, 
  Utensils, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Package,
  Star,
  Users
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import VendorReviewsSection from "@/components/vendor/VendorReviewsSection";

export default async function VendorDashboardPage() {
  const session = await auth();
  
  // Fetch real data from DB
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { vendor: {
      include: {
        menus: true,
        orders: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: true }
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { id: true, name: true, image: true } } }
        }
      }
    } }
  });

  const vendor = user?.vendor;
  if (!vendor) {
    return <p className="p-8">Vendor profile not found.</p>;
  }

  // Fetch orders count and completed orders sum in parallel for optimal database response times
  const [totalOrdersCount, revenueAggregate] = await Promise.all([
    prisma.order.count({
      where: { vendorId: vendor.id }
    }),
    prisma.order.aggregate({
      where: { 
        vendorId: vendor.id,
        status: "COMPLETED"
      },
      _sum: {
        totalAmount: true
      }
    })
  ]);

  const activeMenusCount = vendor.menus.filter(m => m.isAvailable).length;
  const totalRevenue = revenueAggregate._sum.totalAmount || 0;

  const stats = [
    { 
      name: "Total Orders", 
      value: totalOrdersCount.toString(), 
      change: "+12%", 
      changeType: "increase", 
      icon: ShoppingBag,
      bgColor: "bg-[#B0F1CC]",
      textColor: "text-[#002113]"
    },
    { 
      name: "Active Menus", 
      value: activeMenusCount.toString(), 
      change: "Items", 
      changeType: "neutral", 
      icon: Utensils,
      bgColor: "bg-[#2D6A4F]/20",
      textColor: "text-[#0F5238]"
    },
    { 
      name: "Total Revenue", 
      value: `Rp ${totalRevenue.toLocaleString()}`, 
      change: "Monthly", 
      changeType: "neutral", 
      icon: DollarSign,
      bgColor: "bg-[#0F5238]",
      textColor: "text-white"
    },
  ];

  return (
    <>
      <VendorTopBar title="Dashboard Overview" />
      
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 hide-scrollbar">
        {/* Upgrade Banner for FREE plan */}
        {vendor?.plan === "FREE" && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 rounded-3xl text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-lg">Tingkatkan Bisnis Anda dengan Paket Premium!</h3>
              <p className="text-sm text-white/80 mt-1">
                Dapatkan akses tanpa batas untuk menambah menu (maksimal 5 di paket Free) dan buat iklan untuk dipromosikan langsung di dashboard user!
              </p>
            </div>
            <a 
              href="/vendor/subscription" 
              className="bg-white text-orange-700 hover:bg-orange-50 font-bold px-6 py-3 rounded-2xl text-sm transition-all whitespace-nowrap shadow-md active:scale-95"
            >
              Upgrade Sekarang
            </a>
          </div>
        )}

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#191C1D]">Hello, {vendor?.name}!</h2>
            <p className="text-[#707973] font-medium mt-1">Here's what's happening with your kitchen today.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-1.5 px-4 rounded-2xl border border-[#E1E3E4] shadow-sm">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-[#EDEEEF] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#404943]">
                  U{i}
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-[#404943]">24 Active Users</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((item) => (
            <div 
              key={item.name}
              className={`p-6 rounded-3xl border border-[#E1E3E4] flex flex-col justify-between h-48 transition-all hover:shadow-lg active:scale-[0.98] cursor-default bg-white group hover:border-[#0F5238]/30 overflow-hidden relative`}
            >
              <div className="flex justify-between items-start z-10">
                <div className={`p-3 rounded-2xl ${item.bgColor} ${item.textColor}`}>
                  <item.icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${item.changeType === "increase" ? "text-green-600" : "text-[#707973]"}`}>
                  {item.change}
                  {item.changeType === "increase" && <TrendingUp size={14} />}
                </div>
              </div>
              
              <div className="z-10">
                <p className="text-sm font-semibold text-[#707973] mb-1">{item.name}</p>
                <h3 className="text-3xl font-bold text-[#191C1D]">{item.value}</h3>
              </div>

              {/* Decorative background circle */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#F3F4F5] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>

        {/* Recent Orders & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#191C1D]">Recent Orders</h3>
              <Link href="/vendor/orders/report" className="text-sm font-bold text-[#0F5238] hover:underline flex items-center gap-1">View All →</Link>
            </div>
            
            <div className="bg-white rounded-3xl border border-[#E1E3E4] overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-[#F3F4F5] border-b border-[#E1E3E4]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDEEEF]">
                  {vendor?.orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-[#707973] font-medium italic">
                        No orders yet.
                      </td>
                    </tr>
                  ) : (
                    vendor?.orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-[#F8F9FA] transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4">
                          <Link href={`/vendor/orders/report?orderId=${order.id}`} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0F5238] to-[#2D6A4F] flex items-center justify-center text-[10px] font-bold text-white">
                              {order.user.name?.substring(0, 2).toUpperCase() || "UN"}
                            </div>
                            <p className="text-sm font-bold text-[#191C1D] group-hover:text-[#0F5238] transition-colors">{order.user.name || "Unknown"}</p>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-[#191C1D]">Rp {order.totalAmount.toLocaleString("id-ID")}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.status === "COMPLETED" 
                              ? "bg-emerald-100 text-emerald-700" 
                              : order.status === "PENDING"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {order.status === "COMPLETED" ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                            {order.status === "COMPLETED" ? "Selesai" : order.status === "PENDING" ? "Menunggu" : order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-[#707973]">
                          {order.createdAt.toLocaleDateString("id-ID")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar / Recommendations / Top Items */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#191C1D]">Quick Insights</h3>
            
            {/* Rating Card */}
            <div className="bg-[#2D6A4F] p-6 rounded-3xl text-white shadow-lg shadow-[#2D6A4F]/20">
              <div className="flex justify-between items-start mb-6">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Star size={20} className="fill-white" />
                </div>
                <p className="text-xs font-bold border border-white/30 px-2 py-0.5 rounded-full uppercase">Overall Rating</p>
              </div>
              <div className="mb-2">
                <h4 className="text-4xl font-bold">
                  {(vendor?.rating ?? 0) > 0 ? vendor.rating.toFixed(1) : "—"}
                </h4>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={14} className={i <= Math.round(vendor?.rating || 0) ? "fill-white" : "text-white/30"} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Users size={14} className="text-white/60" />
                <p className="text-sm font-medium text-white/70">
                  {vendor?.reviews?.length ?? 0} ulasan dari pelanggan
                </p>
              </div>
            </div>

            {/* Most Sold Item */}
            <div className="p-6 rounded-3xl border border-[#E1E3E4] bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#F3F4F5] rounded-xl text-[#0F5238]">
                  <Package size={20} />
                </div>
                <h4 className="font-bold text-[#191C1D]">Best Seller</h4>
              </div>
              {vendor?.menus.length ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F3F4F5] overflow-hidden flex-shrink-0">
                    <img src={vendor.menus[0].image || ""} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#191C1D]">{vendor.menus[0].name}</p>
                    <p className="text-xs font-semibold text-[#707973] uppercase tracking-wide">Rp {vendor.menus[0].price.toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-medium text-[#707973] italic">No items yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <VendorReviewsSection
          reviews={(vendor?.reviews ?? []).map((r) => ({
            ...r,
            createdAt: r.createdAt,
          }))}
          avgRating={vendor?.rating ?? 0}
          totalReviews={vendor?.reviews?.length ?? 0}
        />
      </main>
    </>
  );
}
