"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { validatePromoAction } from "./promotion-actions";

// ─────────────────────────────────────────────
// Create Order (Delivery/Pickup + Cash/Pakasir)
// ─────────────────────────────────────────────

export async function createOrderAction(data: {
  menuId: string;
  quantity: number;
  deliveryMethod: "PICKUP" | "DELIVERY";
  paymentMethod: "CASH" | "PAKASIR";
  notes?: string;
  promoCode?: string;
}): Promise<{
  success: boolean;
  orderId?: string;
  pickupCode?: string;
  paymentUrl?: string;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Kamu harus login terlebih dahulu." };
    }

    const [user, menu] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          address: true,
          latitude: true,
          longitude: true,
        },
      }),
      prisma.menu.findUnique({
        where: { id: data.menuId },
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              isDeliveryEnabled: true,
              deliveryFee: true,
              pakasirSlug: true,
              pakasirApiKey: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      }),
    ]);

    if (!user) return { success: false, error: "User tidak ditemukan." };
    if (!menu) return { success: false, error: "Menu tidak ditemukan." };
    if (!menu.isAvailable) return { success: false, error: "Menu tidak tersedia saat ini." };

    // Validate delivery
    if (data.deliveryMethod === "DELIVERY") {
      if (!menu.vendor.isDeliveryEnabled) {
        return { success: false, error: "Vendor ini tidak menyediakan layanan delivery." };
      }
      if (!user.address || !user.latitude || !user.longitude) {
        return { success: false, error: "Atur alamat pengantaran di profil terlebih dahulu." };
      }
    }

    // Validate Pakasir payment
    if (data.paymentMethod === "PAKASIR") {
      if (!menu.vendor.pakasirSlug || !menu.vendor.pakasirApiKey) {
        return { success: false, error: "Vendor ini belum mengonfigurasi payment gateway." };
      }
    }

    // Calculate totals
    const subtotal = menu.price * data.quantity;
    const deliveryFee = data.deliveryMethod === "DELIVERY" ? (menu.vendor.deliveryFee || 0) : 0;
    
    // Apply promo if exists
    let promoAmount = 0;
    let promoId = null;
    let finalPromoCode = null;

    if (data.promoCode) {
      const validation = await validatePromoAction(data.promoCode, menu.vendor.id, subtotal + deliveryFee);
      if (!validation.success) {
        return { success: false, error: validation.error || "Promo tidak valid." };
      }
      promoAmount = validation.discountAmount || 0;
      promoId = validation.promoId || null;
      finalPromoCode = validation.code || null;
    }

    const totalAmount = Math.max(0, subtotal + deliveryFee - promoAmount);

    // Generate pickup/order code
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    const pickupCode = `ORD-${rand}`;

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        vendorId: menu.vendor.id,
        totalAmount,
        status: "PENDING",
        paymentMethod: data.paymentMethod,
        paymentStatus: "PENDING",
        deliveryMethod: data.deliveryMethod,
        deliveryFee,
        deliveryAddress: data.deliveryMethod === "DELIVERY" ? user.address : null,
        deliveryLat: data.deliveryMethod === "DELIVERY" ? user.latitude : null,
        deliveryLng: data.deliveryMethod === "DELIVERY" ? user.longitude : null,
        notes: data.notes || null,
        promoId,
        promoCode: finalPromoCode,
        promoAmount,
      },
    });

    // Create order item
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        menuId: data.menuId,
        quantity: data.quantity,
        price: menu.price,
      },
    });

    // Create order status log
    await prisma.orderStatusLog.create({
      data: {
        orderId: order.id,
        status: "PENDING",
        message: "Pesanan dibuat oleh pelanggan",
      },
    });

    // If payment via Pakasir → create payment URL
    if (data.paymentMethod === "PAKASIR") {
      const pakasirOrderId = `ORD_${order.id}_${Date.now()}`;
      const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
      const redirectUrl = `${baseUrl}/orders/${order.id}?payment=success`;
      const paymentUrl = `https://app.pakasir.com/pay/${menu.vendor.pakasirSlug}/${totalAmount}?order_id=${pakasirOrderId}&redirect=${encodeURIComponent(redirectUrl)}`;

      // Save payment reference on the order
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentOrderId: pakasirOrderId,
          paymentProject: menu.vendor.pakasirSlug,
        },
      });

      revalidatePath("/dashboard");
      revalidatePath("/orders");
      revalidatePath("/vendor/orders");

      return {
        success: true,
        orderId: order.id,
        paymentUrl,
      };
    }

    // Cash payment — order is immediately ready for vendor
    revalidatePath("/dashboard");
    revalidatePath("/orders");
    revalidatePath("/vendor/orders");

    return {
      success: true,
      orderId: order.id,
      pickupCode,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[OrderActions] createOrderAction error:", err.message);
    return { success: false, error: `Gagal membuat pesanan: ${err.message}` };
  }
}

// ─────────────────────────────────────────────
// Get User's Active Orders
// ─────────────────────────────────────────────

export async function getActiveOrdersAction() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.order.findMany({
    where: {
      userId: session.user.id,
      status: { notIn: ["COMPLETED", "CANCELLED", "REJECTED"] },
    },
    include: {
      vendor: { select: { id: true, name: true, logo: true, address: true, latitude: true, longitude: true, contact: true } },
      items: { include: { menu: { select: { name: true, image: true, price: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─────────────────────────────────────────────
// Get Order Detail with Tracking
// ─────────────────────────────────────────────

export async function getOrderDetailAction(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.id,
    },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          logo: true,
          address: true,
          latitude: true,
          longitude: true,
          contact: true,
        },
      },
      items: {
        include: {
          menu: { select: { id: true, name: true, image: true, price: true, calories: true } },
        },
      },
      user: { select: { name: true, address: true, latitude: true, longitude: true } },
      statusLogs: { orderBy: { createdAt: "asc" } },
    },
  });
}

// ─────────────────────────────────────────────
// Cancel Order (User-side, before vendor accepts)
// ─────────────────────────────────────────────

export async function cancelOrderAction(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.user.id },
    });

    if (!order) return { success: false, error: "Pesanan tidak ditemukan." };
    if (!["PENDING"].includes(order.status)) {
      return { success: false, error: "Pesanan tidak dapat dibatalkan karena sudah diproses vendor." };
    }

    // Cancel Pakasir transaction if exists
    if (order.paymentOrderId && order.paymentProject) {
      try {
        const vendor = await prisma.vendor.findFirst({
          where: { pakasirSlug: order.paymentProject },
          select: { pakasirApiKey: true },
        });

        if (vendor?.pakasirApiKey) {
          await fetch("https://app.pakasir.com/api/transactioncancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              project: order.paymentProject,
              order_id: order.paymentOrderId,
              amount: order.totalAmount,
              api_key: vendor.pakasirApiKey,
            }),
          });
        }
      } catch (_) {
        // Fail silently — cancellation on Pakasir is best-effort
      }
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        statusLogs: {
          create: { status: "CANCELLED", message: "Pesanan dibatalkan oleh pelanggan" },
        },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/orders");
    revalidatePath("/vendor/orders");

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}
