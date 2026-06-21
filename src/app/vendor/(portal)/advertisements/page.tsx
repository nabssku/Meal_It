"use client";

import React, { useState, useEffect } from "react";
import VendorTopBar from "@/components/vendor/VendorTopBar";
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Link as LinkIcon, 
  Eye, 
  Loader2, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { 
  createAdvertisementAction, 
  updateAdvertisementAction, 
  deleteAdvertisementAction 
} from "@/app/actions/vendor-actions";
import Link from "next/link";

export default function VendorAdvertisementsPage() {
  const [loading, setLoading] = useState(true);
  const [vendorData, setVendorData] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    targetUrl: ""
  });

  const fetchVendorAndAds = async () => {
    try {
      // Get vendor profile details
      const profileRes = await fetch("/api/vendor/profile");
      const profile = await profileRes.json();
      setVendorData(profile);

      if (profile?.id) {
        // Fetch ads from custom route or api
        const adsRes = await fetch(`/api/vendor/ads?vendorId=${profile.id}`);
        const adsList = await adsRes.json();
        setAds(adsList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorAndAds();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorData || vendorData.plan !== "PREMIUM") return;
    setSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      await createAdvertisementAction({
        vendorId: vendorData.id,
        title: form.title,
        description: form.description,
        imageUrl: form.imageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
        targetUrl: form.targetUrl
      });
      setMessage({ text: "Iklan berhasil dibuat!", type: "success" });
      setForm({ title: "", description: "", imageUrl: "", targetUrl: "" });
      fetchVendorAndAds();
    } catch (err: any) {
      setMessage({ text: err.message || "Gagal membuat iklan", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (adId: string, currentStatus: boolean) => {
    try {
      await updateAdvertisementAction(adId, { isActive: !currentStatus });
      fetchVendorAndAds();
    } catch (err: any) {
      alert("Gagal mengubah status: " + err.message);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus iklan ini?")) return;
    try {
      await deleteAdvertisementAction(adId);
      fetchVendorAndAds();
    } catch (err: any) {
      alert("Gagal menghapus iklan: " + err.message);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="animate-spin text-[#0F5238] w-10 h-10" />
    </div>
  );

  const isPremium = vendorData?.plan === "PREMIUM";

  if (!isPremium) {
    return (
      <>
        <VendorTopBar title="Advertisements" />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-white p-8 rounded-[32px] border border-[#E1E3E4] shadow-lg text-center space-y-6">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Megaphone size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">Fitur Khusus Premium</h3>
              <p className="text-sm text-text-muted">
                Pemasangan iklan promosi hanya tersedia untuk mitra **Premium Partner**. Tingkatkan paket Anda sekarang untuk mulai memasang iklan di dashboard user!
              </p>
            </div>
            <Link href="/vendor/subscription" className="block w-full">
              <button className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 active:scale-95">
                Upgrade ke Premium <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <VendorTopBar title="Promosi Iklan" />

      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 hide-scrollbar">
        <div className="max-w-[1000px] mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-[#191C1D]">Iklan Sponsor</h2>
            <p className="text-[#707973] font-medium mt-1">Buat banner promosi katering Anda untuk ditampilkan di dashboard pelanggan MEALIT.</p>
          </div>

          {message.text && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
              message.type === "success" 
                ? "bg-green-50 text-green-700 border-green-100" 
                : "bg-red-50 text-red-700 border-red-100"
            }`}>
              <AlertCircle size={18} />
              <span className="text-sm font-bold">{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Create Ad Form */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-[32px] border border-[#E1E3E4] shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-[#191C1D] flex items-center gap-2">
                  <Plus size={18} className="text-[#0F5238]" />
                  Pasang Iklan Baru
                </h3>

                <form onSubmit={handleCreateAd} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#404943]">Judul Promosi</label>
                    <input 
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Diskon 20% Katering Sehat"
                      className="w-full px-4 py-3 bg-[#F3F4F5] border-none rounded-xl text-sm font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#404943]">Deskripsi Ringkas</label>
                    <textarea 
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="e.g. Khusus menu diet bulking minggu ini saja."
                      className="w-full px-4 py-3 bg-[#F3F4F5] border-none rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#404943]">URL Gambar Banner</label>
                    <input 
                      name="imageUrl"
                      value={form.imageUrl}
                      onChange={handleChange}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-3 bg-[#F3F4F5] border-none rounded-xl text-xs text-[#707973]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#404943]">Link Tujuan (Optional)</label>
                    <input 
                      name="targetUrl"
                      value={form.targetUrl}
                      onChange={handleChange}
                      placeholder="/menus/ atau link menu katering"
                      className="w-full px-4 py-3 bg-[#F3F4F5] border-none rounded-xl text-xs text-[#707973]"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-[#0F5238] text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 hover:opacity-95 transition-all active:scale-[0.98]"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                    Buat Iklan
                  </button>
                </form>
              </div>
            </div>

            {/* Right: List of Ads */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold text-[#191C1D] flex items-center gap-2">
                <Eye size={20} className="text-[#0F5238]" />
                Daftar Iklan Aktif
              </h3>

              {ads.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-[32px] border border-[#E1E3E4] shadow-sm">
                  <p className="text-sm font-semibold text-[#707973]">Belum ada iklan promosi yang dibuat.</p>
                  <p className="text-xs text-[#707973] mt-1">Buat iklan di form sebelah kiri untuk memulainya.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ads.map((ad) => (
                    <div 
                      key={ad.id} 
                      className="bg-white rounded-[24px] border border-[#E1E3E4] overflow-hidden shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="h-40 bg-[#EDEEEF] overflow-hidden relative">
                          <img 
                            src={ad.imageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"} 
                            alt={ad.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#0F5238] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <Sparkles size={8} /> Sponsored
                          </div>
                        </div>

                        <div className="p-5 space-y-2">
                          <h4 className="font-bold text-[#191C1D] text-base line-clamp-1">{ad.title}</h4>
                          <p className="text-xs text-[#707973] font-medium line-clamp-2">{ad.description || "Tidak ada deskripsi."}</p>
                          {ad.targetUrl && (
                            <div className="flex items-center gap-1 text-[10px] text-[#0F5238] font-bold">
                              <LinkIcon size={10} />
                              <span className="truncate">{ad.targetUrl}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-5 bg-[#F8F9FA] border-t border-[#EDEEEF] flex justify-between items-center">
                        <button 
                          onClick={() => handleToggleActive(ad.id, ad.isActive)}
                          className="flex items-center gap-2 text-xs font-bold text-[#404943] hover:text-[#0F5238]"
                        >
                          {ad.isActive ? (
                            <>
                              <ToggleRight size={24} className="text-[#0F5238]" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft size={24} className="text-[#707973]" />
                              <span>Nonaktif</span>
                            </>
                          )}
                        </button>

                        <button 
                          onClick={() => handleDeleteAd(ad.id)}
                          className="p-2 text-[#707973] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
