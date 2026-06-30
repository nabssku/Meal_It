"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, MapPin, Loader2, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface LocationPickerProps {
  initialAddress?: string;
  initialLatitude?: number;
  initialLongitude?: number;
  onChange: (data: { address: string; latitude: number; longitude: number }) => void;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function LocationPicker({
  initialAddress = "",
  initialLatitude,
  initialLongitude,
  onChange,
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const leafletMarker = useRef<any>(null);

  // Default coordinates: Jakarta
  const defaultLat = -6.2088;
  const defaultLon = 106.8456;

  const [address, setAddress] = useState(initialAddress);
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({
    lat: initialLatitude ?? defaultLat,
    lon: initialLongitude ?? defaultLon,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapRef.current) return;

      // Import leaflet dynamically
      const L = (await import("leaflet")).default;

      if (!isMounted) return;

      const currentLat = initialLatitude ?? coords.lat;
      const currentLon = initialLongitude ?? coords.lon;

      // Create map
      const map = L.map(mapRef.current, {
        center: [currentLat, currentLon],
        zoom: 13,
        zoomControl: true,
      });
      leafletMap.current = map;

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Create beautiful custom SVG pin icon
      const pinIcon = L.divIcon({
        className: "custom-pin-icon",
        html: `
          <div style="
            background-color: #0F5238;
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            position: absolute;
            transform: rotate(-45deg);
            left: -16px;
            top: -32px;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          ">
            <div style="
              width: 10px;
              height: 10px;
              background-color: white;
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      // Create draggable marker
      const marker = L.marker([currentLat, currentLon], {
        draggable: true,
        icon: pinIcon,
      }).addTo(map);
      leafletMarker.current = marker;

      // Marker dragend event
      marker.on("dragend", async () => {
        const position = marker.getLatLng();
        setCoords({ lat: position.lat, lon: position.lng });
        await reverseGeocode(position.lat, position.lng);
      });

      // Map click event (place marker at click position)
      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords({ lat, lon: lng });
        await reverseGeocode(lat, lng);
      });

      // Reverse geocode initially if we have coordinates but no address
      if (!initialAddress && (initialLatitude || initialLongitude)) {
        await reverseGeocode(currentLat, currentLon);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Reverse geocoding function
  const reverseGeocode = async (lat: number, lon: number) => {
    setGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "id",
            "User-Agent": "MealIt-App/1.0",
          },
        }
      );
      if (!response.ok) throw new Error("Gagal mengambil alamat");
      const data = await response.json();
      const newAddress = data.display_name || `Lokasi di koordinat: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      setAddress(newAddress);
      onChange({ address: newAddress, latitude: lat, longitude: lon });
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    } finally {
      setGeocoding(false);
    }
  };

  // Address search function
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResults([]);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5&countrycodes=id`,
        {
          headers: {
            "Accept-Language": "id",
            "User-Agent": "MealIt-App/1.0",
          },
        }
      );
      if (!response.ok) throw new Error("Gagal mencari lokasi");
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  // Select a search result
  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const selectedAddress = result.display_name;

    setCoords({ lat, lon });
    setAddress(selectedAddress);
    setSearchResults([]);
    setSearchQuery("");

    // Update map view & marker position
    if (leafletMap.current && leafletMarker.current) {
      leafletMap.current.setView([lat, lon], 16);
      leafletMarker.current.setLatLng([lat, lon]);
    }

    onChange({ address: selectedAddress, latitude: lat, longitude: lon });
  };

  // Detect location using GPS
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung deteksi lokasi otomatis.");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });

        // Update map & marker
        if (leafletMap.current && leafletMarker.current) {
          leafletMap.current.setView([latitude, longitude], 16);
          leafletMarker.current.setLatLng([latitude, longitude]);
        }

        await reverseGeocode(latitude, longitude);
        setGpsLoading(false);
      },
      (error) => {
        console.error("GPS error:", error);
        alert(
          "Gagal mengakses GPS Anda. Silakan cari alamat secara manual atau ketuk pada peta."
        );
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Input Box */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari jalan, komplek, kost, atau kota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E8EAF0] bg-white focus:ring-2 focus:ring-[#0F5238]/30 focus:border-[#0F5238] outline-none transition-all text-sm text-[#1A1D23] font-medium"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="px-4 py-3 bg-[#0F5238] text-white rounded-2xl text-sm font-semibold hover:bg-[#0c422c] transition-colors active:scale-95 flex items-center justify-center min-w-[70px]"
        >
          {searching ? <Loader2 className="animate-spin w-4 h-4" /> : "Cari"}
        </button>
      </div>

      {/* Search Results Dropdown */}
      {searchResults.length > 0 && (
        <div className="bg-white border border-[#E8EAF0] rounded-2xl shadow-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-[#F3F4F5]">
          {searchResults.map((result, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectResult(result)}
              className="w-full px-4 py-3 text-left hover:bg-[#0F5238]/5 transition-colors text-xs text-[#1A1D23] font-medium flex gap-2 items-start"
            >
              <MapPin className="text-[#0F5238] w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{result.display_name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Map Container and Actions */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-64 rounded-3xl overflow-hidden shadow-md border border-[#E8EAF0] z-0"
        />

        {/* GPS Locate Button on the Map */}
        <button
          type="button"
          onClick={handleLocateUser}
          disabled={gpsLoading}
          className="absolute bottom-4 right-4 bg-white hover:bg-[#F8F9FA] active:scale-95 text-[#0F5238] shadow-lg border border-[#E8EAF0] p-3 rounded-full flex items-center justify-center z-10 transition-all"
          title="Gunakan Lokasi Saya"
        >
          {gpsLoading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <Navigation className="w-5 h-5 fill-current" />
          )}
        </button>
      </div>

      {/* Address Details & Manual Edit */}
      <div className="bg-white rounded-2xl border border-[#E8EAF0] p-4 shadow-sm space-y-3">
        <div className="flex items-start gap-2.5">
          <MapPin className="text-[#0F5238] w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">
              Alamat Rumah/Kost Tempat Tinggal
            </span>
            {geocoding ? (
              <div className="flex items-center gap-2 mt-1">
                <Loader2 className="animate-spin w-3.5 h-3.5 text-[#0F5238]" />
                <span className="text-xs text-[#9CA3AF]">Mengambil alamat...</span>
              </div>
            ) : (
              <textarea
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  onChange({ address: e.target.value, latitude: coords.lat, longitude: coords.lon });
                }}
                placeholder="Ketuk peta atau cari lokasi di atas..."
                className="w-full mt-1 bg-transparent border-0 outline-none text-xs text-[#1A1D23] font-medium leading-relaxed resize-none p-0 focus:ring-0"
                rows={2}
              />
            )}
          </div>
        </div>

        {/* Coords indicator (read-only tiny text for reassurance) */}
        {!geocoding && coords.lat !== defaultLat && (
          <div className="text-[10px] text-[#9CA3AF] text-right font-mono">
            {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
          </div>
        )}
      </div>
    </div>
  );
}
