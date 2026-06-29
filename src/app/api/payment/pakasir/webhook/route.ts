import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Platform-level Pakasir credentials (for subscription billing)
const PLATFORM_SLUG = process.env.PAKASIR_PROJECT_SLUG || "mealit";
const PLATFORM_API_KEY = process.env.PAKASIR_API_KEY || "S2QRzaQPVDPAmDVdLw6oII9RsDnFtYsb";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("[Pakasir Webhook] Received payload:", payload);

    const { amount, order_id, project, status, payment_method } = payload;

    if (status !== "completed") {
      return NextResponse.json({ message: "Transaction not completed" }, { status: 200 });
    }

    // ─── Route 1: Subscription Payment (prefix SUB_) ───
    if (order_id.startsWith("SUB_")) {
      return handleSubscriptionWebhook({ amount, order_id, project, payment_method });
    }

    // ─── Route 2: Order Payment (prefix ORD_) ───
    if (order_id.startsWith("ORD_")) {
      return handleOrderWebhook({ amount, order_id, project, payment_method });
    }

    console.warn("[Pakasir Webhook] Unknown order_id prefix:", order_id);
    return NextResponse.json({ error: "Unknown order type" }, { status: 400 });
  } catch (error: any) {
    console.error("[Pakasir Webhook] Error processing webhook:", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────
// Handle Subscription Payment Webhook
// ─────────────────────────────────────────────
async function handleSubscriptionWebhook({
  amount,
  order_id,
  project,
  payment_method,
}: {
  amount: number;
  order_id: string;
  project: string;
  payment_method?: string;
}) {
  if (project !== PLATFORM_SLUG) {
    return NextResponse.json({ error: "Invalid project slug for subscription" }, { status: 400 });
  }

  // Verify via Pakasir API
  const verifyUrl = `https://app.pakasir.com/api/transactiondetail?project=${PLATFORM_SLUG}&amount=${amount}&order_id=${order_id}&api_key=${PLATFORM_API_KEY}`;
  const verifyRes = await fetch(verifyUrl);
  const verifyData = await verifyRes.json();

  if (verifyData?.transaction?.status !== "completed" && verifyData?.status !== "completed") {
    console.warn("[Pakasir Webhook] Subscription verification failed for order", order_id);
    return NextResponse.json({ error: "Verification check failed" }, { status: 400 });
  }

  const sub = await prisma.vendorSubscription.findUnique({
    where: { orderId: order_id },
  });

  if (!sub) {
    console.warn("[Pakasir Webhook] Subscription not found for order", order_id);
    return NextResponse.json({ error: "Transaction record not found" }, { status: 404 });
  }

  if (sub.status === "ACTIVE") {
    return NextResponse.json({ success: true, message: "Already processed" }, { status: 200 });
  }

  await prisma.$transaction([
    prisma.vendor.update({
      where: { id: sub.vendorId },
      data: {
        plan: "PREMIUM",
        subscriptionStatus: "ACTIVE",
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subscriptionOrderId: order_id,
      },
    }),
    prisma.vendorSubscription.update({
      where: { orderId: order_id },
      data: {
        status: "ACTIVE",
        paymentStatus: "PAID",
        paymentMethod: payment_method || "qris",
      },
    }),
  ]);

  console.log("[Pakasir Webhook] Subscription success: order", order_id);
  return NextResponse.json({ success: true, message: "Subscription activated." });
}

// ─────────────────────────────────────────────
// Handle Order Payment Webhook (Multi-Vendor)
// ─────────────────────────────────────────────
async function handleOrderWebhook({
  amount,
  order_id,
  project,
  payment_method,
}: {
  amount: number;
  order_id: string;
  project: string;
  payment_method?: string;
}) {
  // Find the order by paymentOrderId
  const order = await prisma.order.findUnique({
    where: { paymentOrderId: order_id },
    include: {
      vendor: { select: { pakasirSlug: true, pakasirApiKey: true } },
    },
  });

  if (!order) {
    console.warn("[Pakasir Webhook] Order not found for payment order_id:", order_id);
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Verify project slug matches the vendor's
  if (project !== order.vendor.pakasirSlug) {
    console.warn("[Pakasir Webhook] Project mismatch. Expected:", order.vendor.pakasirSlug, "Got:", project);
    return NextResponse.json({ error: "Project slug mismatch" }, { status: 400 });
  }

  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ success: true, message: "Already processed" }, { status: 200 });
  }

  // Verify via Pakasir API using vendor's API key
  if (order.vendor.pakasirApiKey) {
    const verifyUrl = `https://app.pakasir.com/api/transactiondetail?project=${project}&amount=${amount}&order_id=${order_id}&api_key=${order.vendor.pakasirApiKey}`;
    const verifyRes = await fetch(verifyUrl);
    const verifyData = await verifyRes.json();

    if (verifyData?.transaction?.status !== "completed" && verifyData?.status !== "completed") {
      console.warn("[Pakasir Webhook] Order verification failed for:", order_id);
      return NextResponse.json({ error: "Verification check failed" }, { status: 400 });
    }
  }

  // Verify amount matches
  if (order.totalAmount !== amount) {
    console.warn("[Pakasir Webhook] Amount mismatch. Expected:", order.totalAmount, "Got:", amount);
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  // Update order: payment confirmed
  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "PAID",
      status: "CONFIRMED",
      statusLogs: {
        create: {
          status: "CONFIRMED",
          message: `Pembayaran berhasil via ${payment_method || "online"}. Pesanan dikonfirmasi.`,
        },
      },
    },
  });

  console.log("[Pakasir Webhook] Order payment success:", order_id, "→ Order", order.id);
  return NextResponse.json({ success: true, message: "Order payment confirmed." });
}
