"use client";

import React, { useState, useEffect } from "react";
import VendorProfileSetupWizard from "@/components/vendor/VendorProfileSetupWizard";

interface VendorData {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  openingHours?: string | null;
  category?: string | null;
  description?: string | null;
  contact?: string | null;
  isDeliveryEnabled?: boolean;
  deliveryFee?: number;
  deliveryRadius?: number | null;
  pakasirSlug?: string | null;
  pakasirApiKey?: string | null;
}

interface DashboardClientProps {
  vendor: VendorData;
}

function isProfileIncomplete(vendor: VendorData): boolean {
  return !vendor.address || !vendor.category || !vendor.openingHours;
}

const DISMISSED_KEY = "vendor_setup_dismissed";

export default function DashboardClient({ vendor }: DashboardClientProps) {
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    // Only show wizard if profile is incomplete AND vendor hasn't dismissed it this session
    const dismissed = sessionStorage.getItem(DISMISSED_KEY);
    if (isProfileIncomplete(vendor) && !dismissed) {
      // Small delay to let dashboard paint first
      const timer = setTimeout(() => setShowWizard(true), 600);
      return () => clearTimeout(timer);
    }
  }, [vendor]);

  const handleComplete = () => {
    setShowWizard(false);
    // Mark as dismissed so it doesn't re-appear within this session
    sessionStorage.setItem(DISMISSED_KEY, "1");
    // Refresh the page to reflect updated data
    window.location.reload();
  };

  if (!showWizard) return null;

  return (
    <VendorProfileSetupWizard
      vendor={vendor}
      onComplete={handleComplete}
    />
  );
}
