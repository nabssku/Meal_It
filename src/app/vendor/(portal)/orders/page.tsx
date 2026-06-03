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

export default async function VendorOrdersPage() {
  const session = await auth();
  
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { vendor: { 
      include: { 
        orders: { 
          orderBy: { createdAt: "desc" },
          include: { 
            user: true,
            items: { include: { menu: true } }
          } 
        } 
      } 
    } }
  });

  const orders = user?.vendor?.orders || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200";
      case "CONFIRMED": return "bg-blue-100 text-blue-700 border-blue-200";
      case "PROCESSING": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "READY": return "bg-green-100 text-green-700 border-green-200";
      case "ON_DELIVERY": return "bg-purple-100 text-purple-700 border-purple-200";
      case "COMPLETED": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "CANCELLED": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

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
            <button className="px-5 py-2.5 bg-[#0F5238] text-white font-bold rounded-xl text-xs uppercase tracking-wider">Incoming</button>
            <button className="px-5 py-2.5 text-[#707973] font-bold text-xs uppercase tracking-wider hover:text-[#0F5238]">In Progress</button>
            <button className="px-5 py-2.5 text-[#707973] font-bold text-xs uppercase tracking-wider hover:text-[#0F5238]">Completed</button>
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
          {orders.length === 0 ? (
            <div className="bg-white p-20 text-center rounded-[32px] border border-[#E1E3E4] shadow-sm">
              <div className="w-16 h-16 bg-[#F3F4F5] rounded-full flex items-center justify-center text-[#707973] mx-auto mb-4">
                <ClipboardList size={32} />
              </div>
              <h4 className="text-xl font-bold text-[#191C1D]">No orders logged</h4>
              <p className="text-[#707973] mt-2">When customers order from you, they will appear here.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div 
                key={order.id}
                className="group bg-white rounded-3xl border border-[#E1E3E4] shadow-sm hover:shadow-md hover:border-[#0F5238]/20 transition-all overflow-hidden"
              >
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left: Customer Info */}
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-[#F3F4F5] flex items-center justify-center text-[#0F5238] font-bold text-xl border border-[#E1E3E4] flex-shrink-0">
                      {order.user.name?.substring(0, 2).toUpperCase() || "C"}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-xl font-bold text-[#191C1D]">{order.user.name || "Test Customer"}</h4>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-[#707973] mt-1 flex items-center gap-1">
                        <span className="text-[#0F5238]">#{order.id.substring(0, 8).toUpperCase()}</span> • 
                        <Clock size={14} className="ml-1" />
                        {order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      
                      {/* Order Items Preview */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="bg-[#F3F4F5] px-3 py-1.5 rounded-xl border border-[#EDEEEF] flex items-center gap-2">
                            <span className="text-[10px] font-black text-[#0F5238]">{item.quantity}x</span>
                            <span className="text-xs font-bold text-[#404943]">{item.menu.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Details */}
                  <div className="hidden lg:flex flex-col gap-3 border-x border-[#EDEEEF] px-8">
                    <div className="flex items-center gap-2 text-[#404943]">
                      <MapPin size={16} className="text-[#707973]" />
                      <span className="text-sm font-semibold truncate max-w-[200px]">{order.notes || "No address provided"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#404943]">
                      <Phone size={16} className="text-[#707973]" />
                      <span className="text-sm font-semibold">+62 812-3456-7890</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-6 md:min-w-[240px]">
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#707973] uppercase tracking-wider">Total Price</p>
                      <p className="text-2xl font-black text-[#191C1D]">Rp {order.totalAmount.toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[#0F5238] text-white hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[#0F5238]/10">
                        <CheckCircle2 size={22} />
                      </button>
                      <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white border border-[#E1E3E4] text-[#707973] hover:text-[#191C1D] hover:bg-[#F3F4F5] active:scale-95 transition-all">
                        <MoreVertical size={22} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Expandable/Interactive Bottom Bar */}
                <div className="bg-[#F8F9FA] px-8 py-3 border-t border-[#EDEEEF] flex items-center justify-between">
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#707973] uppercase tracking-wider">
                      <PackageCheck size={14} className="text-green-500" />
                      Paid via {order.paymentMethod || "Wallet"}
                    </div>
                  </div>
                  <button className="text-[10px] font-black text-[#0F5238] uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
                    Update Progress <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}
