"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Check, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { getUserProfileAction, updateUserLocationAction } from "@/app/actions/user-actions";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("@/components/ui/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-64 border border-[#E8EAF0] rounded-3xl bg-white gap-2">
      <Loader2 className="animate-spin text-[#0F5238] w-7 h-7" />
      <span className="text-xs text-[#9CA3AF]">Memuat peta...</span>
    </div>
  ),
});

export default function ProfileLocationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);

  useEffect(() => {
    setLoading(true);
    getUserProfileAction()
      .then((data) => {
        setAddress(data.address || "");
        if (data.latitude) setLatitude(data.latitude);
        if (data.longitude) setLongitude(data.longitude);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Gagal memuat detail lokasi.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!address.trim()) {
      setError("Alamat lengkap wajib diisi.");
      return;
    }
    if (latitude === undefined || longitude === undefined) {
      setError("Harap tentukan lokasi Anda pada peta terlebih dahulu.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await updateUserLocationAction({
        address,
        latitude,
        longitude,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal memperbarui lokasi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] font-sans">
      <header className="p-4 bg-white border-b border-[#E8EAF0] sticky top-0 z-40 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-[#F3F4F5] transition-colors text-[#0F5238]"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-bold text-[#1A1D23]">Lokasi Rumah/Kost</h1>
      </header>

      {loading ? (
        <main className="flex-grow flex flex-col items-center justify-center gap-2 p-6">
          <Loader2 size={32} className="animate-spin text-[#0F5238]" />
          <p className="text-xs text-[#9CA3AF]">Memuat detail lokasi...</p>
        </main>
      ) : (
        <main className="flex-grow p-6 pb-36 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#1A1D23]">Atur Lokasi Pengantaran</h2>
            <p className="text-xs text-[#6B7280]">
              Silakan cari alamat Anda atau geser penanda ke titik kos/rumah Anda pada peta.
            </p>
          </div>

          <LocationPicker
            initialAddress={address}
            initialLatitude={latitude}
            initialLongitude={longitude}
            onChange={(data) => {
              setError("");
              setAddress(data.address);
              setLatitude(data.latitude);
              setLongitude(data.longitude);
            }}
          />
        </main>
      )}

      {!loading && (
        <footer className="p-5 bg-white border-t border-[#E8EAF0] fixed bottom-0 left-0 right-0 z-40 flex flex-col gap-2.5 shadow-2xl">
          {error && (
            <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-2xl font-medium text-center flex items-center justify-center gap-2 animate-in fade-in">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || success}
            className={`w-full py-4 rounded-full shadow-lg font-bold transition-all ${
              success
                ? "bg-green-500 hover:bg-green-600 shadow-green-500/20"
                : "bg-[#0F5238] text-white hover:bg-[#0c422c] shadow-[#0F5238]/20"
            }`}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Menyimpan...
              </span>
            ) : success ? (
              <span className="flex items-center justify-center gap-2">
                <Check size={16} />
                Lokasi Berhasil Disimpan
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Save size={16} />
                Simpan Lokasi ✓
              </span>
            )}
          </Button>
        </footer>
      )}
    </div>
  );
}
