"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Helper: get vendor ID from session
async function getVendorId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { vendor: { select: { id: true } } },
  });
  return user?.vendor?.id || null;
}

// ─────────────────────────────────────────────
// Accept Order
// ─────────────────────────────────────────────

export async function acceptOrderAction(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const vendorId = await getVendorId();
    if (!vendorId) return { success: false, error: "Unauthorized" };

    const order = await prisma.order.findFirst({
      where: { id: orderId, vendorId },
    });

    if (!order) return { success: false, error: "Pesanan tidak ditemukan." };
    if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
      return { success: false, error: "Pesanan tidak dapat diterima karena statusnya bukan PENDING." };
    }

    // For cash orders, accept means moving to CONFIRMED → PROCESSING
    // For Pakasir orders, they should already be CONFIRMED after webhook
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PROCESSING",
        trackingStatus: "PREPARING",
        statusLogs: {
          create: {
            status: "PROCESSING",
            message: "Pesanan diterima oleh vendor. Makanan sedang disiapkan.",
          },
        },
      },
    });

    revalidatePath("/vendor/orders");
    revalidatePath("/orders");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────
// Reject Order (with valid reason)
// ─────────────────────────────────────────────

export async function rejectOrderAction(
  orderId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const vendorId = await getVendorId();
    if (!vendorId) return { success: false, error: "Unauthorized" };

    if (!reason || reason.trim().length < 10) {
      return { success: false, error: "Alasan penolakan harus minimal 10 karakter dan valid." };
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, vendorId },
    });

    if (!order) return { success: false, error: "Pesanan tidak ditemukan." };
    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      return { success: false, error: "Pesanan tidak dapat ditolak karena sudah diproses." };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "REJECTED",
        rejectionReason: reason.trim(),
        statusLogs: {
          create: {
            status: "REJECTED",
            message: `Pesanan ditolak oleh vendor. Alasan: ${reason.trim()}`,
          },
        },
      },
    });

    // TODO: If paid via Pakasir, initiate refund (future feature)

    revalidatePath("/vendor/orders");
    revalidatePath("/orders");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────
// Update Order Tracking (Vendor updates delivery position)
// ─────────────────────────────────────────────

export async function updateOrderTrackingAction(
  orderId: string,
  lat: number,
  lng: number,
  trackingStatus: "PREPARING" | "ON_THE_WAY" | "NEAR_LOCATION" | "ARRIVED"
): Promise<{ success: boolean; error?: string }> {
  try {
    const vendorId = await getVendorId();
    if (!vendorId) return { success: false, error: "Unauthorized" };

    const order = await prisma.order.findFirst({
      where: { id: orderId, vendorId },
    });

    if (!order) return { success: false, error: "Pesanan tidak ditemukan." };

    const statusMessages: Record<string, string> = {
      PREPARING: "Makanan sedang disiapkan di dapur vendor.",
      ON_THE_WAY: "Makanan sedang dalam perjalanan menuju lokasi Anda.",
      NEAR_LOCATION: "Pengantar sudah dekat dengan lokasi Anda!",
      ARRIVED: "Pengantar sudah tiba di lokasi Anda.",
    };

    await prisma.order.update({
      where: { id: orderId },
      data: {
        currentLat: lat,
        currentLng: lng,
        trackingStatus,
        status: trackingStatus === "ON_THE_WAY" ? "ON_DELIVERY" : order.status,
        statusLogs: {
          create: {
            status: trackingStatus,
            message: statusMessages[trackingStatus] || "Status diperbarui.",
            latitude: lat,
            longitude: lng,
          },
        },
      },
    });

    revalidatePath("/orders");
    revalidatePath("/vendor/orders");

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────
// Mark Order as Ready for Pickup
// ─────────────────────────────────────────────

export async function markOrderReadyAction(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const vendorId = await getVendorId();
    if (!vendorId) return { success: false, error: "Unauthorized" };

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "READY",
        trackingStatus: "PREPARING",
        statusLogs: {
          create: { status: "READY", message: "Makanan sudah siap. Menunggu pengambilan/pengiriman." },
        },
      },
    });

    revalidatePath("/vendor/orders");
    revalidatePath("/orders");

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────
// Complete Delivery / Pickup
// ─────────────────────────────────────────────

export async function completeDeliveryAction(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const vendorId = await getVendorId();
    if (!vendorId) return { success: false, error: "Unauthorized" };

    const order = await prisma.order.findFirst({
      where: { id: orderId, vendorId },
    });

    if (!order) return { success: false, error: "Pesanan tidak ditemukan." };

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        trackingStatus: "ARRIVED",
        paymentStatus: "PAID", // Cash orders marked as paid on completion
        statusLogs: {
          create: {
            status: "COMPLETED",
            message: order.deliveryMethod === "DELIVERY"
              ? "Makanan telah berhasil diantarkan."
              : "Makanan telah diambil oleh pelanggan.",
          },
        },
      },
    });

    revalidatePath("/vendor/orders");
    revalidatePath("/orders");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────
// Get Vendor Orders (for vendor portal)
// ─────────────────────────────────────────────

export async function getVendorOrdersAction(tab: string = "incoming") {
  const vendorId = await getVendorId();
  if (!vendorId) return [];

  const statusFilter: Record<string, string[]> = {
    incoming: ["PENDING", "CONFIRMED"],
    inprogress: ["PROCESSING", "READY", "ON_DELIVERY"],
    completed: ["COMPLETED", "REJECTED", "CANCELLED"],
  };

  return prisma.order.findMany({
    where: {
      vendorId,
      status: { in: statusFilter[tab] || statusFilter.incoming },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
          address: true,
          latitude: true,
          longitude: true,
        },
      },
      items: { include: { menu: { select: { name: true, image: true, price: true } } } },
      statusLogs: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
}
