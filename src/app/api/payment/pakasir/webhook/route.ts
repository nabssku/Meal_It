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

    // ─── Route 3: Meal Plan Item Payment (prefix MP_) ───
    if (order_id.startsWith("MP_")) {
      return handleMealPlanItemWebhook({ amount, order_id, project, payment_method });
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

  // ── Idempotency: check if already processed ──
  const existingSub = await prisma.vendorSubscription.findUnique({
    where: { orderId: order_id },
  });

  if (!existingSub) {
    console.warn("[Pakasir Webhook] Subscription not found for order", order_id);
    return NextResponse.json({ error: "Transaction record not found" }, { status: 404 });
  }

  if (existingSub.status === "ACTIVE") {
    console.log("[Pakasir Webhook] Already processed, idempotent return:", order_id);
    return NextResponse.json({ success: true, message: "Already processed" }, { status: 200 });
  }

  // ── Validate amount against DB pricing ──
  const pricing = await prisma.subscriptionPricing.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
  });
  const expectedAmount = pricing?.price ?? 99000;

  if (amount !== expectedAmount && amount !== existingSub.amount) {
    console.warn("[Pakasir Webhook] Amount mismatch. Expected:", expectedAmount, "or stored:", existingSub.amount, "Got:", amount);
    // We allow if amount matches the stored sub amount (in case price was changed after order)
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  // ── Verify via Pakasir API ──
  const verifyUrl = `https://app.pakasir.com/api/transactiondetail?project=${PLATFORM_SLUG}&amount=${amount}&order_id=${order_id}&api_key=${PLATFORM_API_KEY}`;
  let verifyData: any = null;
  try {
    const verifyRes = await fetch(verifyUrl);
    verifyData = await verifyRes.json();
  } catch (e) {
    console.warn("[Pakasir Webhook] Pakasir verify API call failed, proceeding with payload status:", e);
  }

  // Accept if verify API confirms OR if Pakasir API is unreachable (payload already says completed)
  const isVerified =
    verifyData === null || // API unreachable → trust payload
    verifyData?.transaction?.status === "completed" ||
    verifyData?.status === "completed";

  if (!isVerified) {
    console.warn("[Pakasir Webhook] Subscription verification failed for order", order_id);
    return NextResponse.json({ error: "Verification check failed" }, { status: 400 });
  }

  // ── Activate vendor subscription ──
  const durationDays = pricing?.durationDays ?? 30;

  await prisma.vendor.update({
    where: { id: existingSub.vendorId },
    data: {
      plan: "PREMIUM",
      subscriptionStatus: "ACTIVE",
      subscriptionExpiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      subscriptionOrderId: order_id,
    },
  });

  await prisma.vendorSubscription.update({
    where: { orderId: order_id },
    data: {
      status: "ACTIVE",
      paymentStatus: "PAID",
      paymentMethod: payment_method || "qris",
    },
  });

  console.log("[Pakasir Webhook] ✅ Subscription activated: order", order_id, "vendor", existingSub.vendorId);
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

  // ── Idempotency check ──
  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ success: true, message: "Already processed" }, { status: 200 });
  }

  // ── Verify via Pakasir API using vendor's API key ──
  if (order.vendor.pakasirApiKey) {
    let verifyData: any = null;
    try {
      const verifyUrl = `https://app.pakasir.com/api/transactiondetail?project=${project}&amount=${amount}&order_id=${order_id}&api_key=${order.vendor.pakasirApiKey}`;
      const verifyRes = await fetch(verifyUrl);
      verifyData = await verifyRes.json();
    } catch (e) {
      console.warn("[Pakasir Webhook] Vendor Pakasir verify API failed, trusting payload:", e);
    }

    if (
      verifyData !== null &&
      verifyData?.transaction?.status !== "completed" &&
      verifyData?.status !== "completed"
    ) {
      console.warn("[Pakasir Webhook] Order verification failed for:", order_id);
      return NextResponse.json({ error: "Verification check failed" }, { status: 400 });
    }
  }

  // ── Verify amount matches stored order ──
  if (order.totalAmount !== amount) {
    console.warn("[Pakasir Webhook] Amount mismatch. Expected:", order.totalAmount, "Got:", amount);
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  // ── Update order: payment confirmed ──
  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "PAID",
      status: "CONFIRMED",
    },
  });

  // Create status log
  await prisma.orderStatusLog.create({
    data: {
      orderId: order.id,
      status: "CONFIRMED",
      message: `Pembayaran berhasil via ${payment_method || "online"}. Pesanan dikonfirmasi.`,
    },
  });

  console.log("[Pakasir Webhook] ✅ Order payment confirmed:", order_id, "→ Order", order.id);
  return NextResponse.json({ success: true, message: "Order payment confirmed." });
}

// ─────────────────────────────────────────────
// Handle Meal Plan Item Payment Webhook
// ─────────────────────────────────────────────
async function handleMealPlanItemWebhook({
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
  const parts = order_id.split("_");
  const mealPlanItemIdsStr = parts[1];

  if (!mealPlanItemIdsStr) {
    return NextResponse.json({ error: "Invalid MealPlanItem order ID" }, { status: 400 });
  }

  const mealPlanItemIds = mealPlanItemIdsStr.split("-");

  const items = await prisma.mealPlanItem.findMany({
    where: { id: { in: mealPlanItemIds } },
    include: {
      menu: { include: { vendor: { select: { name: true, pakasirSlug: true, pakasirApiKey: true } } } },
    },
  });

  if (items.length === 0) {
    console.warn("[Pakasir Webhook] No MealPlanItems found for:", mealPlanItemIds);
    return NextResponse.json({ error: "MealPlanItems not found" }, { status: 404 });
  }

  const firstItem = items[0];

  // Verify project slug matches the vendor's
  if (project !== firstItem.menu.vendor.pakasirSlug) {
    console.warn("[Pakasir Webhook] Project mismatch for MealPlanItem. Expected:", firstItem.menu.vendor.pakasirSlug, "Got:", project);
    return NextResponse.json({ error: "Project slug mismatch" }, { status: 400 });
  }

  // Idempotency check (only process if at least one is pending)
  const allPaid = items.every(item => item.paymentStatus === "PAID");
  if (allPaid) {
    return NextResponse.json({ success: true, message: "Already processed" }, { status: 200 });
  }

  // Verify transaction status via Pakasir API using vendor's API key
  if (firstItem.menu.vendor.pakasirApiKey) {
    let verifyData: any = null;
    try {
      const verifyUrl = `https://app.pakasir.com/api/transactiondetail?project=${project}&amount=${amount}&order_id=${order_id}&api_key=${firstItem.menu.vendor.pakasirApiKey}`;
      const verifyRes = await fetch(verifyUrl);
      verifyData = await verifyRes.json();
    } catch (e) {
      console.warn("[Pakasir Webhook] Vendor Pakasir verify API failed for MealPlanItem, trusting payload:", e);
    }

    if (
      verifyData !== null &&
      verifyData?.transaction?.status !== "completed" &&
      verifyData?.status !== "completed"
    ) {
      console.warn("[Pakasir Webhook] MealPlanItem verification failed for:", order_id);
      return NextResponse.json({ error: "Verification check failed" }, { status: 400 });
    }
  }

  // Verify amount matches total sum of menu prices of the items
  const expectedAmount = items.reduce((sum, item) => sum + item.menu.price, 0);
  if (expectedAmount !== amount) {
    console.warn("[Pakasir Webhook] Amount mismatch for MealPlanItem. Expected:", expectedAmount, "Got:", amount);
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  // Update item payment status
  await prisma.mealPlanItem.updateMany({
    where: { id: { in: mealPlanItemIds } },
    data: {
      paymentStatus: "PAID",
      status: "CONFIRMED", // Set to confirmed so vendor knows it's paid and can be processed
    },
  });

  // Revalidate cache paths
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/meal-planner");

  console.log("[Pakasir Webhook] ✅ MealPlanItems payment confirmed:", order_id);
  return NextResponse.json({ success: true, message: "MealPlanItems payment confirmed." });
}
