import React from "react";
import VendorTopBar from "@/components/vendor/VendorTopBar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import KitchenScheduleClient from "@/components/vendor/KitchenScheduleClient";

export default async function KitchenSchedulePage() {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { vendor: true },
  });

  const vendor = user?.vendor;
  if (!vendor) {
    return <p className="p-8">Vendor profile not found.</p>;
  }

  // Fetch all MealPlanItems for this vendor's menus (all dates)
  const items = await prisma.mealPlanItem.findMany({
    where: {
      menu: { vendorId: vendor.id },
    },
    orderBy: {
      mealPlan: { date: "asc" },
    },
    include: {
      menu: { select: { name: true, image: true, price: true, category: true } },
      mealPlan: {
        include: {
          user: { select: { name: true, email: true, image: true } },
        },
      },
    },
  });

  // Serialize for client (Date → string)
  const serialized = items.map((item) => ({
    id: item.id,
    mealType: item.mealType,
    status: item.status,
    deliveryMethod: item.deliveryMethod,
    paymentMethod: item.paymentMethod,
    paymentStatus: item.paymentStatus,
    pickupCode: item.pickupCode,
    date: item.mealPlan.date.toISOString(),
    menuName: item.menu.name,
    menuImage: item.menu.image,
    menuPrice: item.menu.price,
    menuCategory: item.menu.category,
    userName: item.mealPlan.user.name,
    userEmail: item.mealPlan.user.email,
    userImage: item.mealPlan.user.image,
  }));

  return (
    <>
      <VendorTopBar title="Jadwal Dapur" />
      <KitchenScheduleClient items={serialized} />
    </>
  );
}
