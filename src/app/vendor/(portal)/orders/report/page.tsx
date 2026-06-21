import React from "react";
import VendorTopBar from "@/components/vendor/VendorTopBar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrdersReportClient from "@/components/vendor/OrdersReportClient";

export default async function VendorOrdersReportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; orderId?: string }>;
}) {
  const params = await searchParams;
  const filterStatus = params.status || "ALL";
  const search = params.search || "";

  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { vendor: true },
  });

  const vendor = user?.vendor;
  if (!vendor) {
    return <p className="p-8">Vendor profile not found.</p>;
  }

  // Fetch all orders from the Order table (created by confirmMealPickupAction)
  const allOrders = await prisma.order.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, image: true } },
      items: {
        include: {
          menu: { select: { name: true, image: true, category: true } },
        },
      },
    },
  });

  // Stats
  const totalRevenue = allOrders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const completedCount = allOrders.filter((o) => o.status === "COMPLETED").length;
  const pendingCount = allOrders.filter((o) => o.status === "PENDING").length;

  // Serialize for client component (Date → string)
  const serializedOrders = allOrders.map((o) => ({
    id: o.id,
    userId: o.userId,
    userName: o.user.name,
    userEmail: o.user.email,
    userImage: o.user.image,
    totalAmount: o.totalAmount,
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    notes: o.notes,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      menuName: item.menu.name,
      menuImage: item.menu.image,
      menuCategory: item.menu.category,
    })),
  }));

  return (
    <>
      <VendorTopBar title="Laporan Pesanan" />
      <OrdersReportClient
        orders={serializedOrders}
        stats={{
          total: allOrders.length,
          completed: completedCount,
          pending: pendingCount,
          totalRevenue,
        }}
        filterStatus={filterStatus}
        searchQuery={search}
        preOpenOrderId={params.orderId}
      />
    </>
  );
}
