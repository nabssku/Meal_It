"use client";

import React from "react";
import BottomNavigation from "../navigation/BottomNavigation";
import SidebarNavigation from "../navigation/SidebarNavigation";
import FloatingChatButton from "../ai/FloatingChatButton";
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
  ].includes(pathname) 
    || pathname.startsWith("/profile/") 
    || pathname === "/vendor"
    || pathname.startsWith("/vendor/")
    || pathname === "/admin"
    || pathname.startsWith("/admin/");

  const hideBottomNav = [
    "/",
    "/login",
    "/onboarding",
    "/profile-setup"
  ].includes(pathname) 
    || pathname === "/vendor"
    || pathname.startsWith("/vendor/")
    || pathname === "/admin"
    || pathname.startsWith("/admin/");

  // Admin and vendor portals manage their own full-screen layout
  // /ai-chat also gets full-screen treatment (no bottom nav, no padding)
  const isPortalPage =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/vendor" ||
    pathname.startsWith("/vendor/") ||
    pathname === "/ai-chat";

  if (isPortalPage) {
    return <>{children}</>;
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      {!hideBottomNav && <SidebarNavigation />}
      <main className={cn(
        "flex-1 w-full relative",
        !isFullScreen && "max-w-md mx-auto px-4 pt-6 pb-20 md:pb-0"
      )}>
        {children}
      </main>
      
      {!hideBottomNav && <BottomNavigation />}
      <FloatingChatButton />
    </div>
  );
};

export default AppShell;
