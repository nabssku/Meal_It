"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Utensils, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Calendar, label: "Planner", href: "/meal-planner" },
  { icon: Utensils, label: "Menu", href: "/menus" },
  { icon: User, label: "Profil", href: "/profile" },
];

const SidebarNavigation = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed left-4 md:left-[calc(50vw-224px-100px)] top-1/2 -translate-y-1/2 bg-white border border-black/5 rounded-[24px] p-3 flex flex-col items-center gap-6 shadow-soft z-50 hidden md:flex w-20">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1.5 w-14 h-14 justify-center rounded-2xl transition-all duration-200 group",
              isActive 
                ? "bg-[#0f5238]/10 text-[#0f5238]" 
                : "text-muted-foreground hover:bg-black/[0.03] hover:text-[#0f5238]/80"
            )}
          >
            <item.icon
              size={22}
              strokeWidth={isActive ? 2.5 : 2}
              className="transition-transform duration-200 group-hover:scale-110"
            />
            <span className="text-[9px] font-bold tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default SidebarNavigation;
