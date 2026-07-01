"use client";

import React, { useState, useEffect } from "react";
import VendorTopBar from "@/components/vendor/VendorTopBar";
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Edit, 
  Loader2, 
  AlertCircle,
  ArrowRight,
  Calendar,
  Users,
  Check,
  CheckCircle2,
  X
} from "lucide-react";
import { 
  getPromotionsAction, 
  createPromotionAction, 
  updatePromotionAction, 
  deletePromotionAction 
} from "@/app/actions/promotion-actions";
import Link from "next/link";

const DAYS_OF_WEEK = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const DAYS_MAP_ENG: Record<string, string> = {
  "Senin": "Monday",
  "Selasa": "Tuesday",
  "Rabu": "Wednesday",
  "Kamis": "Thursday",
  "Jumat": "Friday",
  "Sabtu": "Saturday",
  "Minggu": "Sunday"
};

export default function VendorPromotionsPage() {
  const [loading, setLoading] = useState(true);
  const [vendorData, setVendorData] = useState<any>(null);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: "",
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountRate: "",
    discountAmount: "",
    maxUsageTotal: "",
    maxUsagePerUser: "",
    startDate: "",
    endDate: "",
    targetUserType: "ALL",
    isActive: true
  });
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const fetchVendorAndPromotions = async () => {
    try {
      // Get vendor profile details
      const profileRes = await fetch("/api/vendor/profile");
      const profile = await profileRes.json();
      setVendorData(profile);

      if (profile?.id) {
        const promoList = await getPromotionsAction(profile.id);
        setPromotions(promoList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorAndPromotions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, isActive: e.target.checked }));
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const resetForm = () => {
    setForm({
      title: "",
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountRate: "",
      discountAmount: "",
      maxUsageTotal: "",
      maxUsagePerUser: "",
      startDate: "",
      endDate: "",
      targetUserType: "ALL",
      isActive: true
    });
    setSelectedDays([]);
    setEditingId(null);
  };

  const handleEditInit = (promo: any) => {
    setEditingId(promo.id);
    setForm({
      title: promo.title,
      code: promo.code,
      description: promo.description || "",
      discountType: promo.discountType,
      discountRate: promo.discountRate !== null ? String(promo.discountRate) : "",
      discountAmount: promo.discountAmount !== null ? String(promo.discountAmount) : "",
      maxUsageTotal: promo.maxUsageTotal !== null ? String(promo.maxUsageTotal) : "",
      maxUsagePerUser: promo.maxUsagePerUser !== null ? String(promo.maxUsagePerUser) : "",
      startDate: promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : "",
      endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : "",
      targetUserType: promo.targetUserType,
      isActive: promo.isActive
    });
    setSelectedDays(promo.applicableDays || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorData || vendorData.plan !== "PREMIUM") return;

    setSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const data = {
        vendorId: vendorData.id,
        title: form.title,
        code: form.code,
        description: form.description,
        discountType: form.discountType,
        discountRate: form.discountType === "PERCENTAGE" ? Number(form.discountRate) : undefined,
        discountAmount: form.discountType === "FLAT" ? Number(form.discountAmount) : undefined,
        maxUsageTotal: form.maxUsageTotal ? Number(form.maxUsageTotal) : undefined,
        maxUsagePerUser: form.maxUsagePerUser ? Number(form.maxUsagePerUser) : undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        applicableDays: selectedDays,
        targetUserType: form.targetUserType,
        isActive: form.isActive
      };

      if (editingId) {
        await updatePromotionAction(editingId, data);
        setMessage({ text: "Promo berhasil diperbarui!", type: "success" });
      } else {
        await createPromotionAction(data);
        setMessage({ text: "Promo baru berhasil dibuat!", type: "success" });
      }

      resetForm();
      const updatedPromos = await getPromotionsAction(vendorData.id);
      setPromotions(updatedPromos);
    } catch (err: any) {
      setMessage({ text: err.message || "Gagal menyimpan promo", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus promo ini?")) return;
    try {
      await deletePromotionAction(id);
      setMessage({ text: "Promo berhasil dihapus", type: "success" });
      const updatedPromos = await getPromotionsAction(vendorData.id);
      setPromotions(updatedPromos);
    } catch (err: any) {
      alert("Gagal menghapus promo: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0F5238] w-10 h-10" />
      </div>
    );
  }

  const isPremium = vendorData?.plan === "PREMIUM";

  if (!isPremium) {
    return (
      <>
        <VendorTopBar title="Promotions" />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-white p-8 rounded-[32px] border border-[#E1E3E4] shadow-lg text-center space-y-6">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Ticket size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">Fitur Khusus Premium</h3>
              <p className="text-sm text-muted-foreground">
                Pembuatan promo toko katering hanya tersedia untuk mitra **Premium Partner**. Tingkatkan paket Anda sekarang untuk membuat kupon promo menarik untuk pelanggan Anda!
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
      <VendorTopBar title="Promosi Toko" />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 hide-scrollbar">
        <div className="max-w-[1200px] mx-auto space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#191C1D]">Kupon & Promo Restoran</h2>
            <p className="text-[#707973] font-medium mt-1">Buat kode promo custom untuk menarik minat pesanan pelanggan katering Anda.</p>
          </div>

          {message.text && (
            <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 border ${
              message.type === "success" 
                ? "bg-green-50 text-green-700 border-green-100" 
                : "bg-red-50 text-red-700 border-red-100"
            }`}>
              <div className="flex items-center gap-3">
                <AlertCircle size={18} />
                <span className="text-sm font-bold">{message.text}</span>
              </div>
              <button onClick={() => setMessage({ text: "", type: "" })} className="text-current opacity-70 hover:opacity-100">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Create/Edit Promo Form */}
            <div className="lg:col-span-5">
              <div className="bg-white p-6 rounded-[32px] border border-[#E1E3E4] shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-[#191C1D] flex items-center gap-2">
                  <Ticket size={18} className="text-[#0F5238]" />
                  {editingId ? "Edit Promo" : "Buat Promo Baru"}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#404943]">Judul Promosi</label>
                    <input 
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Diskon Launching Toko"
                      className="w-full px-4 py-3 bg-[#F3F4F5] border-none rounded-xl text-sm font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#404943]">Kode Promo (Otomatis Kapital)</label>
                    <input 
                      name="code"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      required
                      placeholder="e.g. MAKANSEHAT10"
                      className="w-full px-4 py-3 bg-[#F3F4F5] border-none rounded-xl text-sm font-bold tracking-wider text-[#0F5238]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#404943]">Deskripsi</label>
                    <textarea 
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={2}
                      placeholder="e.g. Potongan khusus peluncuran katering sehat kami."
                      className="w-full px-4 py-3 bg-[#F3F4F5] border-none rounded-xl text-sm"
                    />
                  </div>

                  {/* Discount Type */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, discountType: "PERCENTAGE" })}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                        form.discountType === "PERCENTAGE"
                          ? "border-[#0F5238] bg-[#0F5238]/5 text-[#0F5238]"
                          : "border-gray-100 hover:border-gray-200 text-gray-600 bg-white"
                      }`}
                    >
                      Persentase (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, discountType: "FLAT" })}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                        form.discountType === "FLAT"
                          ? "border-[#0F5238] bg-[#0F5238]/5 text-[#0F5238]"
                          : "border-gray-100 hover:border-gray-200 text-gray-600 bg-white"
                      }`}
                    >
                      Potong Harga (Rp)
                    </button>
                  </div>

                  {form.discountType === "PERCENTAGE" ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#404943]">Persentase Diskon (%)</label>
                      <input 
                        type="number"
                        name="discountRate"
                        value={form.discountRate}
                        onChange={handleChange}
                        required={form.discountType === "PERCENTAGE"}
                        min={1}
                        max={100}
                        placeholder="e.g. 10"
                        className="w-full px-4 py-3 bg-[#F3F4F5] border-none rounded-xl text-sm font-semibold"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#404943]">Nominal Potongan Langsung (Rp)</label>
                      <input 
                        type="number"
                        name="discountAmount"
                        value={form.discountAmount}
                        onChange={handleChange}
                        required={form.discountType === "FLAT"}
                        min={1}
                        placeholder="e.g. 5000"
                        className="w-full px-4 py-3 bg-[#F3F4F5] border-none rounded-xl text-sm font-semibold"
                      />
                    </div>
                  )}

                  {/* Target User Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#404943]">Target Pengguna</label>
                    <select
                      name="targetUserType"
                      value={form.targetUserType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#F3F4F5] border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#0F5238]"
                    >
                      <option value="ALL">Semua Pengguna</option>
                      <option value="NEW">Khusus Pengguna Baru (0 Transaksi)</option>
                      <option value="OLD">Khusus Pengguna Lama (Minimal 1 Transaksi)</option>
                    </select>
                  </div>

                  {/* Usage Quotas */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#404943] block truncate">Total Kuota Penggunaan</label>
                      <input 
                        type="number"
                        name="maxUsageTotal"
                        value={form.maxUsageTotal}
                        onChange={handleChange}
                        placeholder="Unlimited"
                        className="w-full px-4 py-3 bg-[#F3F4F5] border-none rounded-xl text-sm font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#404943] block truncate">Batas per User</label>
                      <input 
                        type="number"
                        name="maxUsagePerUser"
                        value={form.maxUsagePerUser}
                        onChange={handleChange}
                        placeholder="Unlimited"
                        className="w-full px-4 py-3 bg-[#F3F4F5] border-none rounded-xl text-sm font-semibold"
                      />
                    </div>
                  </div>

                  {/* Date range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#404943]">Tanggal Mulai</label>
                      <input 
                        type="date"
                        name="startDate"
                        value={form.startDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#F3F4F5] border-none rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#404943]">Tanggal Selesai</label>
                      <input 
                        type="date"
                        name="endDate"
                        value={form.endDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#F3F4F5] border-none rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {/* Days Restriction */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#404943] flex items-center gap-1">
                      <Calendar size={13} />
                      Hari Berlaku (Kosongkan jika tiap hari)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map(day => {
                        const isSelected = selectedDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isSelected
                                ? "bg-[#0F5238] text-white"
                                : "bg-[#F3F4F5] hover:bg-gray-200 text-gray-600"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <input 
                      type="checkbox"
                      id="isActive"
                      checked={form.isActive}
                      onChange={handleCheckboxChange}
                      className="rounded border-gray-300 text-[#0F5238] focus:ring-[#0F5238] w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="isActive" className="text-xs font-bold text-[#404943] select-none cursor-pointer">
                      Aktifkan promo ini langsung setelah dibuat
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3.5 bg-[#0F5238] text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                      {editingId ? "Simpan Perubahan" : "Buat Promo"}
                    </button>
                    {editingId && (
                      <button 
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-sm transition-all"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Right: Active Promos list */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-lg font-bold text-[#191C1D]">
                Daftar Promo Restoran ({promotions.length})
              </h3>

              {promotions.length === 0 ? (
                <div className="bg-white border border-[#E1E3E4] p-12 rounded-[32px] text-center space-y-4 shadow-sm">
                  <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto">
                    <Ticket size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#191C1D]">Belum Ada Promo</h4>
                    <p className="text-xs text-[#707973] mt-1">Anda belum membuat promo apa pun untuk saat ini.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {promotions.map((promo) => (
                    <div 
                      key={promo.id} 
                      className={`bg-white border rounded-[28px] p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all ${
                        promo.isActive ? "border-[#E1E3E4]" : "border-gray-200 opacity-75"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm px-3 py-1 bg-[#0F5238]/10 text-[#0F5238] rounded-full tracking-wider select-all uppercase">
                            {promo.code}
                          </span>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            promo.isActive 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            {promo.isActive ? "AKTIF" : "NONAKTIF"}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-foreground text-sm leading-snug">{promo.title}</h4>
                          {promo.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{promo.description}</p>
                          )}
                        </div>

                        {/* Potongan Diskon Badge */}
                        <div className="text-lg font-black text-[#0F5238]">
                          {promo.discountType === "PERCENTAGE" 
                            ? `Diskon ${promo.discountRate}%` 
                            : `Diskon Rp ${promo.discountAmount?.toLocaleString("id-ID")}`
                          }
                        </div>

                        {/* Constraints/Limits list */}
                        <div className="space-y-1 bg-gray-50 p-3 rounded-2xl text-[10px] font-semibold text-gray-500">
                          <div className="flex justify-between">
                            <span>Target:</span>
                            <span className="text-gray-700 font-bold">
                              {promo.targetUserType === "ALL" && "Semua Pengguna"}
                              {promo.targetUserType === "NEW" && "Khusus Pengguna Baru"}
                              {promo.targetUserType === "OLD" && "Khusus Pengguna Lama"}
                            </span>
                          </div>
                          
                          {(promo.maxUsageTotal !== null || promo.maxUsagePerUser !== null) && (
                            <div className="flex justify-between">
                              <span>Batas Kuota / User:</span>
                              <span className="text-gray-700 font-bold">
                                {promo.maxUsageTotal !== null ? `${promo.maxUsageTotal}x` : "∞"} / {promo.maxUsagePerUser !== null ? `${promo.maxUsagePerUser}x` : "∞"}
                              </span>
                            </div>
                          )}

                          {(promo.startDate || promo.endDate) && (
                            <div className="flex justify-between">
                              <span>Masa Berlaku:</span>
                              <span className="text-gray-700 font-bold truncate max-w-[120px]">
                                {promo.startDate ? new Date(promo.startDate).toLocaleDateString("id-ID", {day: "numeric", month: "short"}) : ""}
                                {promo.startDate || promo.endDate ? " - " : ""}
                                {promo.endDate ? new Date(promo.endDate).toLocaleDateString("id-ID", {day: "numeric", month: "short"}) : ""}
                              </span>
                            </div>
                          )}

                          {promo.applicableDays?.length > 0 && (
                            <div className="flex flex-col gap-0.5 pt-1 border-t border-gray-200/50 mt-1">
                              <span>Hari Khusus:</span>
                              <span className="text-gray-700 font-bold">{promo.applicableDays.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => handleEditInit(promo)}
                          className="p-2 text-gray-500 hover:text-[#0F5238] hover:bg-gray-50 rounded-xl transition-all"
                          title="Edit promo"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(promo.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Hapus promo"
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
