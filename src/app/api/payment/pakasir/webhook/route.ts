import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PROJECT_SLUG = process.env.PAKASIR_PROJECT_SLUG || "mealit";
const API_KEY = process.env.PAKASIR_API_KEY || "S2QRzaQPVDPAmDVdLw6oII9RsDnFtYsb";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("[Pakasir Webhook] Received payload:", payload);

    const { amount, order_id, project, status, payment_method } = payload;

    if (project !== PROJECT_SLUG) {
      return NextResponse.json({ error: "Invalid project slug" }, { status: 400 });
    }

    if (status !== "completed") {
      return NextResponse.json({ message: "Transaction not completed" }, { status: 200 });
    }

    // Double check transaction detail via Pakasir API for security validation
    const verifyUrl = `https://app.pakasir.com/api/transactiondetail?project=${PROJECT_SLUG}&amount=${amount}&order_id=${order_id}&api_key=${API_KEY}`;
    
    const verifyRes = await fetch(verifyUrl);
    const verifyData = await verifyRes.json();

    if (verifyData?.status !== "completed") {
      console.warn("[Pakasir Webhook] Security alert: verification failed on Pakasir API for order", order_id);
      return NextResponse.json({ error: "Verification check failed" }, { status: 400 });
    }

    // Locate the subscription record
    const sub = await prisma.vendorSubscription.findUnique({
      where: { orderId: order_id },
    });

    if (!sub) {
      console.warn("[Pakasir Webhook] Warning: subscription transaction not found for order", order_id);
      return NextResponse.json({ error: "Transaction record not found" }, { status: 404 });
    }

    if (sub.status === "ACTIVE") {
      return NextResponse.json({ success: true, message: "Already processed" }, { status: 200 });
    }

    // Upgrade the vendor plan and update the subscription
    await prisma.$transaction([
      prisma.vendor.update({
        where: { id: sub.vendorId },
        data: {
          plan: "PREMIUM",
          subscriptionStatus: "ACTIVE",
          subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
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

    console.log("[Pakasir Webhook] Success: order", order_id, "upgraded vendor to PREMIUM.");
    return NextResponse.json({ success: true, message: "Webhook processed and vendor upgraded." });
  } catch (error: any) {
    console.error("[Pakasir Webhook] Error processing webhook:", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}
