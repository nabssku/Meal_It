import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import { prisma } from "@/lib/prisma";

export default async function VendorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/vendor/login");
  }

  // Check if user is a vendor
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { vendor: true },
  });

  if (user?.role !== "vendor" || !user.vendor) {
    if (user?.role !== "admin") {
      redirect("/login");
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA]">
      <VendorSidebar 
        vendorName={user?.vendor?.name || "My Kitchen"} 
        userEmail={user?.email || ""} 
        plan={user?.vendor?.plan || "FREE"}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative w-full">
        {children}
      </div>
    </div>
  );
}
