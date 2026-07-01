import React from "react";
import { notFound } from "next/navigation";
import { getVendorWithMenusAction } from "@/app/actions/meal-actions";
import VendorDetailClient from "@/components/vendor/VendorDetailClient";

interface VendorDetailPageProps {
  params: Promise<{ vendorId: string }>;
}

export async function generateMetadata({ params }: VendorDetailPageProps) {
  const { vendorId } = await params;
  const data = await getVendorWithMenusAction(vendorId);

  if (!data) {
    return { title: "Vendor tidak ditemukan – MEALIT" };
  }

  return {
    title: `${data.vendor.name} – MEALIT`,
    description:
      data.vendor.description ??
      `Lihat semua menu sehat dari ${data.vendor.name} di MEALIT`,
  };
}

export default async function VendorDetailPage({ params }: VendorDetailPageProps) {
  const { vendorId } = await params;
  const data = await getVendorWithMenusAction(vendorId);

  if (!data) {
    notFound();
  }

  return (
    <VendorDetailClient vendor={data.vendor} menus={data.menus} />
  );
}
