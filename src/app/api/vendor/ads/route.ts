import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json({ error: "Missing vendorId query param" }, { status: 400 });
    }

    const ads = await prisma.advertisement.findMany({
      where: { vendorId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(ads);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch ads" }, { status: 500 });
  }
}
