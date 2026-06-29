"use client";

import React, { useEffect, useRef, useState } from "react";

interface TrackingMapProps {
  vendorLat?: number | null;
  vendorLng?: number | null;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  currentLat?: number | null;
  currentLng?: number | null;
  vendorName: string;
  trackingStatus?: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  PREPARING: "🍳 Sedang disiapkan di dapur",
  ON_THE_WAY: "🛵 Makanan dalam perjalanan",
  NEAR_LOCATION: "📍 Hampir sampai!",
  ARRIVED: "✅ Sudah tiba di lokasi",
};

export default function TrackingMap({
  vendorLat,
  vendorLng,
  deliveryLat,
  deliveryLng,
  currentLat,
  currentLng,
  vendorName,
  trackingStatus,
}: TrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const currentMarkerRef = useRef<any>(null);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const leaflet = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!mounted || !mapRef.current) return;
      setL(leaflet);

      // Default center: vendor location or a fallback
      const centerLat = vendorLat || deliveryLat || -7.97;
      const centerLng = vendorLng || deliveryLng || 112.65;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = leaflet.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([centerLat, centerLng], 14);

      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Add zoom control to bottom-right
      leaflet.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;

      // Vendor marker (restaurant icon)
      if (vendorLat && vendorLng) {
        const vendorIcon = leaflet.divIcon({
          html: `<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#0F5238,#1A8A5A);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(15,82,56,0.4);border:3px solid white;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 2l4 4 4-4 4 4 4-4v6c0 3.314-2.686 6-6 6H9c-3.314 0-6-2.686-6-6V2z"/><path d="M3 14v3a5 5 0 005 5h8a5 5 0 005-5v-3"/></svg>
          </div>`,
          className: "",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        leaflet.marker([vendorLat, vendorLng], { icon: vendorIcon })
          .addTo(map)
          .bindPopup(`<strong>${vendorName}</strong><br>Lokasi Restoran`);
      }

      // Delivery destination marker (home icon)
      if (deliveryLat && deliveryLng) {
        const destIcon = leaflet.divIcon({
          html: `<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#E11D48,#F43F5E);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(225,29,72,0.4);border:3px solid white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
          </div>`,
          className: "",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        leaflet.marker([deliveryLat, deliveryLng], { icon: destIcon })
          .addTo(map)
          .bindPopup("<strong>Alamat Pengantaran</strong>");
      }

      // Current position marker (animated delivery)
      if (currentLat && currentLng) {
        const curIcon = leaflet.divIcon({
          html: `<div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#F59E0B,#EAB308);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(245,158,11,0.5);border:3px solid white;animation:pulse 2s infinite;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/><path d="M17 2h2l3 7h-4v-3h-1"/></svg>
          </div>`,
          className: "",
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        const marker = leaflet.marker([currentLat, currentLng], { icon: curIcon })
          .addTo(map)
          .bindPopup("<strong>Posisi Pengantar</strong>");
        currentMarkerRef.current = marker;
      }

      // Draw route line
      const points: [number, number][] = [];
      if (vendorLat && vendorLng) points.push([vendorLat, vendorLng]);
      if (currentLat && currentLng) points.push([currentLat, currentLng]);
      if (deliveryLat && deliveryLng) points.push([deliveryLat, deliveryLng]);

      if (points.length >= 2) {
        leaflet.polyline(points, {
          color: "#0F5238",
          weight: 4,
          opacity: 0.7,
          dashArray: "8, 12",
        }).addTo(map);

        map.fitBounds(leaflet.latLngBounds(points), { padding: [50, 50] });
      }
    })();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [vendorLat, vendorLng, deliveryLat, deliveryLng]);

  // Update current position marker when it changes
  useEffect(() => {
    if (!L || !mapInstanceRef.current || !currentLat || !currentLng) return;

    if (currentMarkerRef.current) {
      currentMarkerRef.current.setLatLng([currentLat, currentLng]);
    }
  }, [L, currentLat, currentLng]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="h-[300px] rounded-3xl overflow-hidden border border-gray-200 shadow-sm z-0"
      />

      {/* Status Overlay */}
      {trackingStatus && (
        <div className="absolute bottom-4 left-4 right-4 z-[500]">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-lg border border-gray-100 flex items-center gap-3">
            <div className="w-2 h-2 bg-[#0F5238] rounded-full animate-pulse" />
            <span className="text-sm font-bold text-gray-900">
              {STATUS_LABELS[trackingStatus] || trackingStatus}
            </span>
          </div>
        </div>
      )}

      {/* CSS for pulse animation */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
