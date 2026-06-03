"use client";

import React from "react";
import BottomNavigation from "../navigation/BottomNavigation";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  
  // Pages where bottom navigation should be hidden
  const isFullScreen = [
    "/",
    "/onboarding",
    "/profile-setup"
  ].includes(pathname) || pathname.startsWith("/profile/") || pathname.startsWith("/vendor");

  const hideBottomNav = [
    "/",
    "/login",
    "/onboarding",
    "/profile-setup"
  ].includes(pathname) || pathname.startsWith("/vendor");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className={cn(
        "flex-1 w-full relative",
        !isFullScreen && "max-w-md mx-auto px-4 pt-6 pb-20 md:pb-0"
      )}>
        {children}
      </main>
      
      {!hideBottomNav && <BottomNavigation />}
    </div>
  );
};

export default AppShell;
