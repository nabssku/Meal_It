"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const PROJECT_SLUG = process.env.PAKASIR_PROJECT_SLUG || "mealit";
const API_KEY = process.env.PAKASIR_API_KEY || "S2QRzaQPVDPAmDVdLw6oII9RsDnFtYsb";
const BASE_URL = process.env.AUTH_URL || "http://localhost:3000";

/**
 * Fetches the active subscription pricing from DB.
 * Falls back to default if none configured.
 */
async function getActivePricing() {
  const pricing = await prisma.subscriptionPricing.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
  });
  return pricing ?? { price: 99000, durationDays: 30, name: "Premium Partner" };
}

/**
 * Creates a new vendor subscription transaction and generates Pakasir checkout URL.
 * Price is read from the SubscriptionPricing table (managed by admin).
 */
export async function createPakasirBilling(vendorId: string) {
  try {
    const pricing = await getActivePricing();
    const amount = pricing.price;
    const orderId = `SUB_${vendorId}_${Date.now()}`;

    // Create pending subscription record in DB
    const subscription = await prisma.vendorSubscription.create({
      data: {
        vendorId,
        amount,
        orderId,
        status: "PENDING",
        paymentStatus: "PENDING",
      },
    });

    // Generate Pakasir redirect payment link
    const redirectUrl = `${BASE_URL}/vendor/subscription?order_id=${orderId}`;
    const paymentUrl = `https://app.pakasir.com/pay/${PROJECT_SLUG}/${amount}?order_id=${orderId}&redirect=${encodeURIComponent(redirectUrl)}`;

    return {
      success: true,
      orderId,
      paymentUrl,
      amount,
      subscription,
    };
  } catch (error: any) {
    console.error("[createPakasirBilling] Error:", error);
    throw new Error(error.message || "Gagal membuat transaksi pembayaran.");
  }
}

/**
 * Verifies a transaction status directly via Pakasir API and upgrades vendor plan on success.
 */
export async function checkPakasirPaymentStatus(orderId: string) {
  try {
    const sub = await prisma.vendorSubscription.findUnique({
      where: { orderId },
      include: { vendor: true },
    });

    if (!sub) {
      return { success: false, message: "Transaksi tidak ditemukan." };
    }

    if (sub.status === "ACTIVE") {
      return { success: true, status: "ACTIVE", message: "Pembayaran sudah diverifikasi." };
    }

    // Call Pakasir API to get transaction details
    const checkUrl = `https://app.pakasir.com/api/transactiondetail?project=${PROJECT_SLUG}&amount=${sub.amount}&order_id=${orderId}&api_key=${API_KEY}`;

    const response = await fetch(checkUrl);
    const data = await response.json();

    if (data?.status === "completed" || data?.transaction?.status === "completed") {
      const pricing = await getActivePricing();

      // Upgrade vendor to premium
      await prisma.vendor.update({
        where: { id: sub.vendorId },
        data: {
          plan: "PREMIUM",
          subscriptionStatus: "ACTIVE",
          subscriptionExpiresAt: new Date(Date.now() + pricing.durationDays * 24 * 60 * 60 * 1000),
          subscriptionOrderId: orderId,
        },
      });

      // Update subscription record
      await prisma.vendorSubscription.update({
        where: { orderId },
        data: {
          status: "ACTIVE",
          paymentStatus: "PAID",
          paymentMethod: data.payment_method || "qris",
        },
      });

      revalidatePath("/vendor/dashboard");
      revalidatePath("/vendor/subscription");
      return { success: true, status: "ACTIVE", message: "Upgrade Premium berhasil!" };
    }

    return { success: false, status: sub.status, message: "Pembayaran masih diproses." };
  } catch (error: any) {
    console.error("[checkPakasirPaymentStatus] Error:", error);
    return { success: false, message: error.message || "Gagal melakukan verifikasi." };
  }
}

/**
 * Simulates a webhook request from Pakasir Sandbox.
 * For local development, this updates the subscription and vendor plan directly,
 * bypassing public tunnel requirement.
 * Amount is read from the VendorSubscription record (stored at creation time).
 */
export async function simulateSandboxPayment(orderId: string) {
  try {
    const sub = await prisma.vendorSubscription.findUnique({
      where: { orderId },
    });

    if (!sub) {
      return { success: false, message: "Transaksi tidak ditemukan." };
    }

    const amount = sub.amount; // Use actual amount stored at order creation time
    const pricing = await getActivePricing();

    // 1. Try triggering Pakasir's sandbox simulation API
    try {
      await fetch("https://app.pakasir.com/api/paymentsimulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: PROJECT_SLUG,
          order_id: orderId,
          amount,
          api_key: API_KEY,
        }),
      });
    } catch (_) {
      // Fail silently for local network errors
    }

    // 2. Perform direct local upgrade so that the user gets upgraded instantly on localhost
    await prisma.vendor.update({
      where: { id: sub.vendorId },
      data: {
        plan: "PREMIUM",
        subscriptionStatus: "ACTIVE",
        subscriptionExpiresAt: new Date(Date.now() + pricing.durationDays * 24 * 60 * 60 * 1000),
        subscriptionOrderId: orderId,
      },
    });

    // Update subscription record
    await prisma.vendorSubscription.update({
      where: { orderId },
      data: {
        status: "ACTIVE",
        paymentStatus: "PAID",
        paymentMethod: "sandbox_qris",
      },
    });

    revalidatePath("/vendor/dashboard");
    revalidatePath("/vendor/subscription");
    return { success: true, message: "Simulasi pembayaran berhasil! Vendor ditingkatkan ke PREMIUM." };
  } catch (error: any) {
    console.error("[simulateSandboxPayment] Error:", error);
    return { success: false, message: error.message || "Gagal melakukan simulasi." };
  }
}
