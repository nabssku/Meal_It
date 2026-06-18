"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Utensils, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Calendar, label: "Planner", href: "/meal-planner" },
  { icon: Utensils, label: "Menu", href: "/menus" },
  { icon: User, label: "Profil", href: "/profile" },
];

const BottomNavigation = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 px-2 pt-2 pb-6 flex justify-around items-center z-50 md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1 transition-all",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon
              size={24}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
