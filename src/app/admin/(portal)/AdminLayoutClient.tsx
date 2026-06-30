"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  LogOut,
  LayoutGrid,
  Users,
  Store,
  Utensils,
  Megaphone,
  Brain,
  Menu,
  X,
  ChevronRight,
  Bell,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard",     icon: LayoutGrid  },
  { href: "/admin/users",     label: "Users",         icon: Users        },
  { href: "/admin/vendors",   label: "Vendors",       icon: Store        },
  { href: "/admin/menus",     label: "Menus",         icon: Utensils     },
  { href: "/admin/advertisements", label: "Iklan",   icon: Megaphone    },
  { href: "/admin/ai-preferences", label: "Preferensi AI", icon: Brain  },
  { href: "/admin/notifications", label: "Notifikasi",   icon: Bell     },
];

interface AdminLayoutClientProps {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}

export function AdminLayoutClient({ userName, userEmail, children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-[#0F5238] flex items-center justify-center shadow-lg flex-shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 className="font-bold text-base text-white leading-tight">Superadmin</h2>
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">Control Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 pb-2">Navigasi</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group font-semibold text-sm ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon
                size={18}
                className={`flex-shrink-0 transition-colors ${isActive ? "text-white" : "text-white/50 group-hover:text-white"}`}
              />
              <span>{item.label}</span>
              {isActive && (
                <ChevronRight size={14} className="ml-auto opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 mb-2">
          <div className="w-9 h-9 rounded-full bg-white text-[#0F5238] flex items-center justify-center text-sm font-bold uppercase flex-shrink-0">
            {userName?.charAt(0) || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{userName || "Administrator"}</p>
            <p className="text-[10px] font-medium text-white/50 truncate">{userEmail}</p>
          </div>
        </div>
        <Link
          href="/logout?callbackUrl=/admin/login"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-semibold w-full"
        >
          <LogOut size={15} />
          Keluar
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 bg-[#0A3522] text-white z-40 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[#0A3522] text-white z-50 flex flex-col md:hidden transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#E1E3E4] flex items-center justify-between px-4 md:px-6 z-30 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-xl text-[#404943] hover:bg-[#F3F4F5] transition-all"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-[#0F5238]" size={18} />
              <h1 className="text-sm md:text-base font-bold text-[#191C1D]">Mealit Management System</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-[#191C1D]">{userName}</p>
              <p className="text-[10px] text-[#707973]">Superadmin</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0F5238] text-white flex items-center justify-center text-sm font-bold">
              {userName?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-[#F8F9FA]">
          {children}
        </div>
      </div>
    </div>
  );
}
