"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ClipboardList, 
  Settings, 
  LogOut,
  ChevronRight,
  Store,
  ScanLine,
  Megaphone,
  CreditCard,
  ChefHat,
  X,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/vendor/orders", icon: ClipboardList },
  { name: "Menu Management", href: "/vendor/menu", icon: UtensilsCrossed },
  { name: "Jadwal Dapur", href: "/vendor/schedule", icon: ChefHat },
  { name: "Advertisements", href: "/vendor/advertisements", icon: Megaphone },
  { name: "Subscription", href: "/vendor/subscription", icon: CreditCard },
  { name: "Scan QR Pickup", href: "/vendor/orders/scan", icon: ScanLine },
  { name: "Settings", href: "/vendor/settings", icon: Settings },
];

export default function VendorSidebar({ vendorName, userEmail, plan = "FREE" }: { vendorName: string, userEmail: string, plan?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Expose toggle via custom event from TopBar
  useEffect(() => {
    const handler = () => setMobileOpen(prev => !prev);
    window.addEventListener("vendor-sidebar-toggle", handler);
    return () => window.removeEventListener("vendor-sidebar-toggle", handler);
  }, []);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 flex items-start justify-between">
        <div className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#0F5238] flex items-center justify-center text-white shadow-lg shadow-[#0F5238]/20">
            <Store size={24} />
          </div>
          <div>
            <h2 className="font-bold text-xl text-[#0F5238]">Vendor Portal</h2>
            <p className="text-xs font-semibold text-[#404943] uppercase tracking-wider">{vendorName}</p>
            {plan === "PREMIUM" ? (
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#B0F1CC] text-[#002113]">
                PREMIUM PARTNER
              </div>
            ) : (
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                FREE PLAN
              </div>
            )}
          </div>
        </div>
        {/* Close button (mobile only) */}
        <button
          className="md:hidden p-2 rounded-xl text-[#707973] hover:bg-[#F3F4F5] transition-colors"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
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
        <Link 
          href="/logout?callbackUrl=/vendor/login"
          className="w-full flex items-center gap-3 px-4 py-3 text-[#404943] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group"
        >
          <LogOut size={20} className="text-[#707973] group-hover:text-red-600" />
          <span className="font-semibold">Sign Out</span>
        </Link>
        
        <div className="mt-4 flex items-center gap-3 p-2 rounded-xl bg-[#F3F4F5]">
          <div className="w-10 h-10 rounded-full bg-[#0F5238] flex items-center justify-center text-white text-sm font-bold uppercase flex-shrink-0">
            {vendorName.substring(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#191C1D] truncate">{vendorName}</p>
            <p className="text-[10px] font-medium text-[#707973] truncate uppercase tracking-tighter">{userEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-72 bg-white border-r border-[#E1E3E4] z-40 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-[#E1E3E4] z-50 md:hidden flex flex-col transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
