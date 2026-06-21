import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { headers } from "next/headers";
import {
  ShieldAlert,
  LogOut,
  LayoutGrid,
  Users,
  Store,
  Utensils,
  Megaphone,
  Brain,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard",       label: "Dashboard",     icon: LayoutGrid  },
  { href: "/admin/users",           label: "Users",         icon: Users        },
  { href: "/admin/vendors",         label: "Vendors",       icon: Store        },
  { href: "/admin/menus",           label: "Menus",         icon: Utensils     },
  { href: "/admin/advertisements",  label: "Iklan",         icon: Megaphone    },
  { href: "/admin/ai-preferences",  label: "Preferensi AI", icon: Brain        },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, email: true },
  });

  if (user?.role !== "admin") {
    redirect("/dashboard");
  }

  // Read current pathname from headers for active state
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || headersList.get("referer") || "";

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 bg-[#0A3522] text-white z-40 flex-shrink-0">
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
            // We'll highlight via a client wrapper — for now show all as default style
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all group font-semibold text-sm"
              >
                <Icon size={18} className="flex-shrink-0 text-white/50 group-hover:text-white transition-colors" />
                <span>{item.label}</span>
                <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 mb-2">
            <div className="w-9 h-9 rounded-full bg-white text-[#0F5238] flex items-center justify-center text-sm font-bold uppercase flex-shrink-0">
              {user.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.name || "Administrator"}</p>
              <p className="text-[10px] font-medium text-white/50 truncate">{user.email}</p>
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
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#E1E3E4] flex items-center justify-between px-6 z-30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-[#0F5238]" size={18} />
            <h1 className="text-base font-bold text-[#191C1D]">Mealit Management System</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-[#191C1D]">{user.name}</p>
              <p className="text-[10px] text-[#707973]">Superadmin</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0F5238] text-white flex items-center justify-center text-sm font-bold">
              {user.name?.charAt(0) || "A"}
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
