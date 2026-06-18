import React from "react";
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
  MoreVertical,
  Calendar
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { updateMealPlanItemStatusAction } from "@/app/actions/vendor-actions";

export default async function VendorOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams.tab || "incoming";
  const session = await auth();
  
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { vendor: true }
  });

  const vendorId = user?.vendor?.id;

  const mealPlanItems = vendorId ? await prisma.mealPlanItem.findMany({
    where: {
      menu: {
        vendorId: vendorId
      }
    },
    orderBy: {
      mealPlan: {
        date: "desc"
      }
    },
    include: {
      menu: true,
      mealPlan: {
        include: {
          user: true
        }
      }
    }
  }) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200";
      case "PREPARING": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "READY": return "bg-green-100 text-green-700 border-green-200";
      case "PICKED_UP": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "DELIVERED": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getNextStatus = (status: string) => {
    switch (status) {
      case "PENDING": return "PREPARING";
      case "PREPARING": return "READY";
      case "READY": return "PICKED_UP";
      default: return null;
    }
  };

  const getNextStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "Mulai Masak";
      case "PREPARING": return "Siap Diambil";
      case "READY": return "Konfirmasi Selesai";
      default: return "";
    }
  };

  const filteredItems = mealPlanItems.filter((item) => {
    if (currentTab === "incoming") {
      return item.status === "PENDING";
    }
    if (currentTab === "inprogress") {
      return item.status === "PREPARING" || item.status === "READY";
    }
    if (currentTab === "completed") {
      return item.status === "PICKED_UP" || item.status === "DELIVERED";
    }
    return true;
  });

  return (
    <>
      <VendorTopBar title="Order Management" />
      
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 hide-scrollbar">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-[#191C1D]">Customer Orders</h2>
            <p className="text-[#707973] font-medium mt-1">Keep track of incoming requests and update order status in real-time.</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-2xl border border-[#E1E3E4]">
            <Link 
              href="/vendor/orders?tab=incoming" 
              className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                currentTab === "incoming" 
                  ? "bg-[#0F5238] text-white shadow-sm" 
                  : "text-[#707973] hover:text-[#0F5238]"
              }`}
            >
              Incoming
            </Link>
            <Link 
              href="/vendor/orders?tab=inprogress" 
              className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                currentTab === "inprogress" 
                  ? "bg-[#0F5238] text-white shadow-sm" 
                  : "text-[#707973] hover:text-[#0F5238]"
              }`}
            >
              In Progress
            </Link>
            <Link 
              href="/vendor/orders?tab=completed" 
              className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                currentTab === "completed" 
                  ? "bg-[#0F5238] text-white shadow-sm" 
                  : "text-[#707973] hover:text-[#0F5238]"
              }`}
            >
              Completed
            </Link>
          </div>
        </div>

        {/* Search and Date Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707973] w-5 h-5 transition-colors group-focus-within:text-[#0F5238]" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer name..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#E1E3E4] rounded-2xl focus:ring-2 focus:ring-[#0F5238] focus:border-transparent text-sm font-medium transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-[#E1E3E4] rounded-2xl text-[#404943] font-bold text-sm hover:bg-[#F3F4F5]">
            <Calendar size={18} />
            <span>Select Date</span>
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="bg-white p-20 text-center rounded-[32px] border border-[#E1E3E4] shadow-sm">
              <div className="w-16 h-16 bg-[#F3F4F5] rounded-full flex items-center justify-center text-[#707973] mx-auto mb-4">
                <ClipboardList size={32} />
              </div>
              <h4 className="text-xl font-bold text-[#191C1D]">No orders logged</h4>
              <p className="text-[#707973] mt-2">When customers order from you, they will appear here.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const nextStatus = getNextStatus(item.status);
              const nextStatusLabel = getNextStatusLabel(item.status);

              return (
                <div 
                  key={item.id}
                  className="group bg-white rounded-3xl border border-[#E1E3E4] shadow-sm hover:shadow-md hover:border-[#0F5238]/20 transition-all overflow-hidden"
                >
                  <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Left: Customer Info */}
                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-[#F3F4F5] flex items-center justify-center text-[#0F5238] font-bold text-xl border border-[#E1E3E4] flex-shrink-0">
                        {item.mealPlan.user.name?.substring(0, 2).toUpperCase() || "C"}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-xl font-bold text-[#191C1D]">{item.mealPlan.user.name || "Test Customer"}</h4>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-[#707973] mt-1 flex items-center gap-1">
                          <span className="text-[#0F5238]">#{item.pickupCode || item.id.substring(0, 8).toUpperCase()}</span> • 
                          <Clock size={14} className="ml-1" />
                          {new Date(item.mealPlan.date).toLocaleDateString("id-ID", {
                            weekday: "short", day: "numeric", month: "short"
                          })}
                        </p>
                        
                        {/* Order Items Preview */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <div className="bg-[#F3F4F5] px-3 py-1.5 rounded-xl border border-[#EDEEEF] flex items-center gap-2">
                            <span className="text-[10px] font-black text-[#0F5238]">1x</span>
                            <span className="text-xs font-bold text-[#404943]">{item.menu.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Details */}
                    <div className="hidden lg:flex flex-col gap-3 border-x border-[#EDEEEF] px-8">
                      <div className="flex items-center gap-2 text-[#404943]">
                        <MapPin size={16} className="text-[#707973]" />
                        <span className="text-sm font-semibold truncate max-w-[200px]">Delivery: {item.deliveryMethod}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#404943]">
                        <Phone size={16} className="text-[#707973]" />
                        <span className="text-sm font-semibold">{item.mealPlan.user.email}</span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-6 md:min-w-[240px]">
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#707973] uppercase tracking-wider">Total Price</p>
                        <p className="text-2xl font-black text-[#191C1D]">Rp {item.menu.price.toLocaleString()}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {nextStatus && (
                          <form action={async () => {
                            "use server";
                            await updateMealPlanItemStatusAction(item.id, nextStatus);
                          }}>
                            <button 
                              type="submit"
                              title={nextStatusLabel}
                              className="h-12 px-4 flex items-center justify-center gap-1.5 rounded-2xl bg-[#0F5238] text-white hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[#0F5238]/10 text-xs font-bold uppercase tracking-wider"
                            >
                              <CheckCircle2 size={18} />
                              <span>{nextStatusLabel}</span>
                            </button>
                          </form>
                        )}
                        <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white border border-[#E1E3E4] text-[#707973] hover:text-[#191C1D] hover:bg-[#F3F4F5] active:scale-95 transition-all">
                          <MoreVertical size={22} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Info Bar */}
                  <div className="bg-[#F8F9FA] px-8 py-3 border-t border-[#EDEEEF] flex items-center justify-between">
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2 text-[10px] font-black text-[#707973] uppercase tracking-wider">
                        <PackageCheck size={14} className="text-green-500" />
                        Paid via {item.paymentMethod} • Status: {item.paymentStatus}
                      </div>
                    </div>
                    {item.pickupCode && (
                      <span className="text-[10px] font-mono font-black text-[#0F5238] uppercase tracking-wider">
                        Code: {item.pickupCode}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </>
  );
}
