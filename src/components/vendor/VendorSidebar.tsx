"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ClipboardList, 
  Settings, 
  LogOut,
  ChevronRight,
  TrendingUp,
  Store
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { name: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
  { name: "Menu Management", href: "/vendor/menu", icon: UtensilsCrossed },
  { name: "Orders", href: "/vendor/orders", icon: ClipboardList },
  { name: "Settings", href: "/vendor/settings", icon: Settings },
];

export default function VendorSidebar({ vendorName, userEmail }: { vendorName: string, userEmail: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col h-screen w-72 bg-white border-r border-[#E1E3E4] z-40">
      {/* Header */}
      <div className="p-6">
        <div className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#0F5238] flex items-center justify-center text-white shadow-lg shadow-[#0F5238]/20">
            <Store size={24} />
          </div>
          <div>
            <h2 className="font-bold text-xl text-[#0F5238]">Vendor Portal</h2>
            <p className="text-xs font-semibold text-[#404943] uppercase tracking-wider">{vendorName}</p>
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#B0F1CC] text-[#002113]">
              PREMIUM PARTNER
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-[#0F5238] text-white shadow-md shadow-[#0F5238]/20" 
                  : "text-[#404943] hover:bg-[#F3F4F5]"
              }`}
            >
              <Icon size={20} className={isActive ? "text-white" : "text-[#707973] group-hover:text-[#0F5238]"} />
              <span className="font-semibold">{item.name}</span>
              {isActive && <ChevronRight size={16} className="ml-auto text-white/50" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Account */}
      <div className="p-4 border-t border-[#EDEEEF]">
        <button 
          onClick={() => signOut({ callbackUrl: "/vendor/login" })}
          className="w-full flex items-center gap-3 px-4 py-3 text-[#404943] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group"
        >
          <LogOut size={20} className="text-[#707973] group-hover:text-red-600" />
          <span className="font-semibold">Sign Out</span>
        </button>
        
        <div className="mt-4 flex items-center gap-3 p-2 rounded-xl bg-[#F3F4F5]">
          <div className="w-10 h-10 rounded-full bg-[#0F5238] flex items-center justify-center text-white text-sm font-bold uppercase">
            {vendorName.substring(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#191C1D] truncate">{vendorName}</p>
            <p className="text-[10px] font-medium text-[#707973] truncate uppercase tracking-tighter">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
