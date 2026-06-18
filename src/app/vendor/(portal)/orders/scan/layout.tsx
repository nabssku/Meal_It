import React from "react";
import VendorTopBar from "@/components/vendor/VendorTopBar";

export default function VendorScanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VendorTopBar title="Scan QR Pengambilan" />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </>
  );
}
