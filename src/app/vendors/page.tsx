import React, { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import VendorsClient from "@/components/vendor/VendorsClient";

export default async function VendorsPage() {
  const session = await auth();

  // Fetch real vendors from DB
  const vendors = await prisma.vendor.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { menus: { where: { isAvailable: true } } } },
    },
    orderBy: { rating: "desc" },
  });

  const vendorData = vendors.map((v) => ({
    id: v.id,
    name: v.name,
    category: v.category,
    rating: v.rating,
    menuCount: v._count.menus,
    logo: v.logo,
    description: v.description,
    latitude: v.latitude,
    longitude: v.longitude,
  }));

  // Fetch current user's coords and existing reviews so we can show "Sudah dinilai"
  let userReviews: Record<string, { rating: number; comment: string | null }> = {};
  let userCoords = { latitude: null as number | null, longitude: null as number | null };

  if (session?.user?.id) {
    const [user, reviews] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { latitude: true, longitude: true },
      }),
      prisma.review.findMany({
        where: { userId: session.user.id },
        select: { vendorId: true, rating: true, comment: true },
      }),
    ]);

    if (user) {
      userCoords = {
        latitude: user.latitude,
        longitude: user.longitude,
      };
    }

    userReviews = Object.fromEntries(
      reviews.map((r) => [r.vendorId, { rating: r.rating, comment: r.comment }])
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Vendor Terpercaya</h1>
      </header>

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F5238]"></div>
          <p className="text-sm text-gray-500">Memuat vendor...</p>
        </div>
      }>
        <VendorsClient
          vendors={vendorData}
          userId={session?.user?.id ?? ""}
          userReviews={userReviews}
          userCoords={userCoords}
        />
      </Suspense>

      <div className="bg-primary/5 p-4 rounded-xl border border-dashed border-primary/30 text-center">
        <p className="text-xs text-text-secondary font-medium italic">
          &ldquo;Semua vendor telah dikurasi oleh tim MEALIT untuk menjamin kualitas standar gizi harianmu.&rdquo;
        </p>
      </div>
    </div>
  );
}
