import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = await prisma.order.findFirst({
    where: {
      id,
      OR: [
        { userId: session.user.id },
        { vendor: { userId: session.user.id } },
      ],
    },
    select: {
      id: true,
      status: true,
      trackingStatus: true,
      currentLat: true,
      currentLng: true,
      deliveryLat: true,
      deliveryLng: true,
      deliveryAddress: true,
      estimatedArrival: true,
      updatedAt: true,
      vendor: {
        select: {
          name: true,
          latitude: true,
          longitude: true,
          contact: true,
        },
      },
      statusLogs: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    tracking: {
      orderId: order.id,
      status: order.status,
      trackingStatus: order.trackingStatus,
      currentLat: order.currentLat,
      currentLng: order.currentLng,
      deliveryLat: order.deliveryLat,
      deliveryLng: order.deliveryLng,
      deliveryAddress: order.deliveryAddress,
      estimatedArrival: order.estimatedArrival,
      updatedAt: order.updatedAt,
      vendor: order.vendor,
      recentLogs: order.statusLogs,
    },
  });
}
