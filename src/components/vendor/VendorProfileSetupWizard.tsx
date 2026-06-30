"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Clock,
  Utensils,
  Truck,
  CreditCard,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  X,
  Loader2,
  CheckCircle2,
  Sparkles,
  Store,
  Phone,
  Eye,
  EyeOff,
  Copy,
  Check,
  Link2,
  ChefHat,
  ShoppingBag,
  BarChart3,
  Plus,
  Trash2,
  Tag,
  Flame,
  DollarSign,
  Package,
  Settings,
  Star,
  Zap,
  ArrowRight,
  Image as ImageIcon,
} from "lucide-react";
import { updateVendorProfile, addMenuItem } from "@/app/actions/vendor-actions";

const LocationPicker = dynamic(() => import("@/components/ui/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-64 border border-[#E1E3E4] rounded-3xl bg-[#F3F4F5] gap-2">
      <Loader2 className="animate-spin text-[#0F5238] w-7 h-7" />
      <span className="text-xs text-[#707973]">Memuat peta...</span>
    </div>
  ),
});

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

interface MenuItem {
  name: string;
  description: string;
  price: number | string;
  calories: number | string;
  protein: number | string;
  fat: number | string;
  carbs: number | string;
  category: string;
  stock: number | string;
  tags: string[];
}

interface VendorProfileSetupWizardProps {
  vendor: VendorData;
  onComplete: () => void;
}

const STEPS = [
  { id: 1, title: "Lokasi Warung", icon: MapPin },
  { id: 2, title: "Jam Buka", icon: Clock },
  { id: 3, title: "Kategori & Info", icon: Utensils },
  { id: 4, title: "Delivery", icon: Truck },
  { id: 5, title: "Payment", icon: CreditCard },
  { id: 6, title: "Tambah Menu", icon: ChefHat },
  { id: 7, title: "Tutorial", icon: BookOpen },
];

const VENDOR_CATEGORIES = [
  { value: "nasi", label: "🍚 Nasi" },
  { value: "mie", label: "🍜 Mie" },
  { value: "sehat", label: "🥗 Sehat" },
  { value: "vegetarian", label: "🌿 Vegetarian" },
  { value: "snack", label: "🍿 Snack" },
  { value: "minuman", label: "☕ Minuman" },
  { value: "ayam", label: "🍗 Ayam" },
  { value: "seafood", label: "🦐 Seafood" },
  { value: "western", label: "🍔 Western" },
  { value: "dessert", label: "🍰 Dessert" },
];

const MENU_CATEGORIES = [
  "diet", "bulking", "hemat", "vegetarian", "tinggi protein",
  "rendah kalori", "nasi", "mie", "snack", "minuman",
];

const HOURS_PRESETS = [
  { label: "☀️ Pagi", value: "07:00 - 12:00" },
  { label: "🌤️ Siang", value: "11:00 - 15:00" },
  { label: "🌅 Sore", value: "15:00 - 21:00" },
  { label: "🌙 Malam", value: "17:00 - 23:00" },
  { label: "⏰ Full Day", value: "08:00 - 22:00" },
  { label: "🔄 24 Jam", value: "00:00 - 23:59" },
];

const POPULAR_TAGS = [
  "Pedas", "Manis", "Gurih", "Hemat", "HighProtein",
  "LowCalorie", "Vegetarian", "Halal", "Segar", "Populer",
];

const TUTORIAL_STEPS = [
  {
    step: 1,
    icon: ChefHat,
    title: "Tambah & Kelola Menu",
    color: "#0F5238",
    bg: "#B0F1CC",
    path: "/vendor/menu",
    desc: "Buka sidebar → klik Menu → tambahkan menu dengan foto, harga, kalori, dan protein. Paket FREE: maks 5 menu.",
    tips: [
      "Upload foto menu yang menarik",
      "Cantumkan info nutrisi lengkap",
      "Set stok agar pesanan terbatas",
    ],
  },
  {
    step: 2,
    icon: ShoppingBag,
    title: "Terima & Kelola Pesanan",
    color: "#1D4ED8",
    bg: "#DBEAFE",
    path: "/vendor/orders",
    desc: "Pesanan masuk otomatis tampil di halaman Orders. Konfirmasi, proses, lalu tandai siap diambil.",
    tips: [
      "Konfirmasi pesanan dalam 5 menit",
      "Update status secara real-time",
      "Tolak dengan alasan jika stok habis",
    ],
  },
  {
    step: 3,
    icon: Settings,
    title: "Kelola Jadwal & Hari Libur",
    color: "#D97706",
    bg: "#FEF3C7",
    path: "/vendor/schedule",
    desc: "Atur jadwal harian dan tandai hari tutup supaya pelanggan tahu ketersediaan Anda.",
    tips: [
      "Set jam buka per hari",
      "Tandai hari libur khusus",
      "Kelola stok menu per hari",
    ],
  },
  {
    step: 4,
    icon: BarChart3,
    title: "Pantau Dashboard & Laporan",
    color: "#9333EA",
    bg: "#F3E8FF",
    path: "/vendor/dashboard",
    desc: "Dashboard menampilkan total pendapatan, pesanan, rating, dan statistik bisnis secara real-time.",
    tips: [
      "Cek pendapatan harian & bulanan",
      "Pantau rating dari pelanggan",
      "Analisis menu paling laris",
    ],
  },
  {
    step: 5,
    icon: Star,
    title: "Upgrade ke Premium",
    color: "#EA580C",
    bg: "#FFEDD5",
    path: "/vendor/subscription",
    desc: "Paket Premium membuka menu tanpa batas, iklan di dashboard pelanggan, dan fitur unggulan lainnya.",
    tips: [
      "Menu unlimited (FREE: maks 5)",
      "Pasang iklan promosi",
      "Prioritas tampil di pencarian",
    ],
  },
];

const emptyMenu = (): MenuItem => ({
  name: "",
  description: "",
  price: "",
  calories: "",
  protein: "",
  fat: "",
  carbs: "",
  category: "",
  stock: "",
  tags: [],
});

export default function VendorProfileSetupWizard({
  vendor,
  onComplete,
}: VendorProfileSetupWizardProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [webhookUrl] = useState(
    typeof window !== "undefined"
      ? `${window.location.origin}/api/payment/pakasir/webhook`
      : ""
  );
  const [menuSaved, setMenuSaved] = useState(false);
  const [menuError, setMenuError] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [activeMenuTab, setActiveMenuTab] = useState(0);

  // Vendor profile form state
  const [formData, setFormData] = useState({
    address: vendor.address || "",
    city: vendor.city || "",
    latitude: vendor.latitude || (null as number | null),
    longitude: vendor.longitude || (null as number | null),
    openingHours: vendor.openingHours || "",
    category: vendor.category || "",
    description: vendor.description || "",
    contact: vendor.contact || "",
    isDeliveryEnabled: vendor.isDeliveryEnabled ?? false,
    deliveryFee: vendor.deliveryFee ?? 0,
    deliveryRadius: vendor.deliveryRadius ?? 5,
    pakasirSlug: vendor.pakasirSlug || "",
    pakasirApiKey: vendor.pakasirApiKey || "",
  });

  // Menu list state (up to 3 menus during onboarding)
  const [menus, setMenus] = useState<MenuItem[]>([emptyMenu()]);

  const isStepValid = () => {
    if (step === 1) return formData.address.trim().length > 0;
    if (step === 2) return formData.openingHours.trim().length > 0;
    if (step === 3) return formData.category.trim().length > 0;
    if (step === 6) {
      const m = menus[activeMenuTab];
      return (
        m.name.trim().length > 0 &&
        Number(m.price) > 0 &&
        Number(m.calories) > 0 &&
        Number(m.protein) >= 0
      );
    }
    return true;
  };

  const handleSaveStep = async () => {
    if (!isStepValid()) return;
    setSaving(true);
    try {
      if (step <= 5) {
        // Save vendor profile on steps 1-5
        await updateVendorProfile({
          vendorId: vendor.id,
          address: formData.address,
          city: formData.city,
          latitude: formData.latitude ?? undefined,
          longitude: formData.longitude ?? undefined,
          openingHours: formData.openingHours,
          category: formData.category,
          description: formData.description,
          contact: formData.contact,
          isDeliveryEnabled: formData.isDeliveryEnabled,
          deliveryFee: formData.deliveryFee,
          deliveryRadius: formData.deliveryRadius,
          pakasirSlug: formData.pakasirSlug || undefined,
          pakasirApiKey: formData.pakasirApiKey || undefined,
        });
      }
      if (step < STEPS.length) setStep((s) => s + 1);
      else onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMenus = async () => {
    const validMenus = menus.filter(
      (m) => m.name.trim().length > 0 && Number(m.price) > 0 && Number(m.calories) > 0
    );
    if (validMenus.length === 0) {
      setMenuError("Isi minimal satu menu dengan nama, harga, dan kalori.");
      return;
    }
    setSaving(true);
    setMenuError("");
    try {
      for (const m of validMenus) {
        await addMenuItem({
          vendorId: vendor.id,
          name: m.name.trim(),
          description: m.description.trim() || undefined,
          price: Number(m.price),
          calories: Number(m.calories),
          protein: Number(m.protein) || 0,
          fat: Number(m.fat) || undefined,
          carbs: Number(m.carbs) || undefined,
          category: m.category || undefined,
          stock: Number(m.stock) || undefined,
          tags: m.tags,
        });
      }
      setMenuSaved(true);
      setTimeout(() => setStep((s) => s + 1), 900);
    } catch (err: any) {
      setMenuError(err.message || "Gagal menyimpan menu.");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => setStep((s) => s + 1);

  const handleCopyWebhook = useCallback(() => {
    navigator.clipboard.writeText(webhookUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [webhookUrl]);

  const addMenuTab = () => {
    if (menus.length < 3) setMenus((p) => [...p, emptyMenu()]);
    setActiveMenuTab(menus.length);
  };

  const removeMenuTab = (idx: number) => {
    const next = menus.filter((_, i) => i !== idx);
    setMenus(next.length > 0 ? next : [emptyMenu()]);
    setActiveMenuTab(Math.max(0, idx - 1));
  };

  const updateMenu = (field: keyof MenuItem, value: any) => {
    setMenus((p) => {
      const updated = [...p];
      updated[activeMenuTab] = { ...updated[activeMenuTab], [field]: value };
      return updated;
    });
  };

  const addTag = (tag: string) => {
    const m = menus[activeMenuTab];
    if (tag.trim() && !m.tags.includes(tag.trim()) && m.tags.length < 5) {
      updateMenu("tags", [...m.tags, tag.trim()]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    updateMenu("tags", menus[activeMenuTab].tags.filter((t) => t !== tag));
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;
  const currentMenu = menus[activeMenuTab];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[28px] overflow-hidden shadow-2xl"
        style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #F8FFF9 100%)" }}
      >
        {/* ─── Header ─── */}
        <div className="relative px-6 pt-6 pb-4 bg-[#0F5238] text-white overflow-hidden flex-shrink-0">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/5 rounded-full" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#B0F1CC]" />
                <span className="text-xs font-semibold text-[#B0F1CC] uppercase tracking-wider">
                  Setup Profil Vendor
                </span>
              </div>
              <h2 className="text-xl font-bold">{STEPS[step - 1].title}</h2>
              <p className="text-white/70 text-sm mt-0.5">
                Langkah {step} dari {STEPS.length}
              </p>
            </div>
            <button
              onClick={onComplete}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title="Selesaikan Nanti"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step pills */}
          <div className="relative flex gap-1.5 mt-4 overflow-x-auto pb-1 scrollbar-hide">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isActive = s.id === step;
              const isDone = s.id < step;
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? "bg-white text-[#0F5238]"
                      : isDone
                      ? "bg-white/30 text-white"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">{s.title}</span>
                  <span className="sm:hidden">{s.id}</span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="relative mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#B0F1CC] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ─── Body (scrollable) ─── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ═══ STEP 1: Lokasi ═══ */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#191C1D]">
                  Kota / Kabupaten <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707973] w-4 h-4" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                    placeholder="Contoh: Jakarta Selatan"
                    className="w-full pl-10 pr-4 py-3 bg-[#F3F4F5] rounded-xl border border-transparent focus:border-[#0F5238] focus:ring-2 focus:ring-[#0F5238]/20 outline-none text-sm text-[#191C1D] transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#191C1D]">
                  Lokasi Warung di Peta <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-[#707973]">
                  Cari atau klik pada peta untuk menentukan lokasi warung Anda
                </p>
                <LocationPicker
                  initialAddress={formData.address}
                  initialLatitude={formData.latitude ?? undefined}
                  initialLongitude={formData.longitude ?? undefined}
                  onChange={({ address, latitude, longitude }) =>
                    setFormData((p) => ({ ...p, address, latitude, longitude }))
                  }
                />
              </div>
              {formData.address && (
                <div className="flex items-start gap-2.5 p-3 bg-[#B0F1CC]/30 rounded-xl border border-[#B0F1CC]">
                  <CheckCircle2 className="w-4 h-4 text-[#0F5238] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#0F5238] font-medium">{formData.address}</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ STEP 2: Jam Buka ═══ */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#191C1D]">Pilih Preset Jam Buka</label>
                <div className="grid grid-cols-3 gap-2">
                  {HOURS_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, openingHours: preset.value }))}
                      className={`p-3 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                        formData.openingHours === preset.value
                          ? "bg-[#0F5238] text-white border-[#0F5238] shadow-md"
                          : "bg-white text-[#404943] border-[#E1E3E4] hover:border-[#0F5238] hover:text-[#0F5238]"
                      }`}
                    >
                      {preset.label}
                      <div className="font-mono mt-0.5 opacity-70">{preset.value}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E1E3E4]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-xs text-[#707973] font-medium">atau isi manual</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#191C1D]">
                  Jam Operasional <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707973] w-4 h-4" />
                  <input
                    type="text"
                    value={formData.openingHours}
                    onChange={(e) => setFormData((p) => ({ ...p, openingHours: e.target.value }))}
                    placeholder="Contoh: 08:00 - 21:00"
                    className="w-full pl-10 pr-4 py-3 bg-[#F3F4F5] rounded-xl border border-transparent focus:border-[#0F5238] focus:ring-2 focus:ring-[#0F5238]/20 outline-none text-sm text-[#191C1D] transition-all"
                  />
                </div>
                {formData.openingHours && (
                  <p className="text-xs text-[#707973]">
                    💡 Warung Anda akan buka:{" "}
                    <span className="font-semibold text-[#0F5238]">{formData.openingHours}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ═══ STEP 3: Kategori & Info ═══ */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#191C1D]">
                  Kategori Warung <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {VENDOR_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, category: cat.value }))}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 text-center ${
                        formData.category === cat.value
                          ? "bg-[#0F5238] text-white border-[#0F5238] shadow-md scale-105"
                          : "bg-white text-[#404943] border-[#E1E3E4] hover:border-[#0F5238]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#191C1D]">Deskripsi Warung</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Ceritakan keunggulan warung Anda... (opsional)"
                  rows={3}
                  className="w-full px-4 py-3 bg-[#F3F4F5] rounded-xl border border-transparent focus:border-[#0F5238] focus:ring-2 focus:ring-[#0F5238]/20 outline-none text-sm text-[#191C1D] transition-all resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#191C1D]">Nomor Kontak</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707973] w-4 h-4" />
                  <input
                    type="tel"
                    value={formData.contact}
                    onChange={(e) => setFormData((p) => ({ ...p, contact: e.target.value }))}
                    placeholder="Contoh: 0812-xxxx-xxxx"
                    className="w-full pl-10 pr-4 py-3 bg-[#F3F4F5] rounded-xl border border-transparent focus:border-[#0F5238] focus:ring-2 focus:ring-[#0F5238]/20 outline-none text-sm text-[#191C1D] transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 4: Delivery ═══ */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between p-4 bg-[#F3F4F5] rounded-2xl">
                <div>
                  <p className="font-semibold text-[#191C1D] text-sm">Aktifkan Layanan Antar</p>
                  <p className="text-xs text-[#707973] mt-0.5">
                    Terima pesanan dengan pengiriman ke lokasi pembeli
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, isDeliveryEnabled: !p.isDeliveryEnabled }))}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                    formData.isDeliveryEnabled ? "bg-[#0F5238]" : "bg-[#D1D5DB]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                      formData.isDeliveryEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              {formData.isDeliveryEnabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#191C1D]">Ongkos Kirim (Rp)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707973] text-sm font-semibold">Rp</span>
                      <input
                        type="number"
                        min={0}
                        value={formData.deliveryFee}
                        onChange={(e) => setFormData((p) => ({ ...p, deliveryFee: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        className="w-full pl-10 pr-4 py-3 bg-[#F3F4F5] rounded-xl border border-transparent focus:border-[#0F5238] focus:ring-2 focus:ring-[#0F5238]/20 outline-none text-sm text-[#191C1D] transition-all"
                      />
                    </div>
                    <p className="text-xs text-[#707973]">💡 Isi 0 jika gratis ongkir</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#191C1D]">Radius Pengiriman (km)</label>
                    <div className="space-y-2">
                      <input
                        type="range" min={1} max={20}
                        value={formData.deliveryRadius ?? 5}
                        onChange={(e) => setFormData((p) => ({ ...p, deliveryRadius: parseInt(e.target.value) }))}
                        className="w-full accent-[#0F5238]"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#707973]">1 km</span>
                        <span className="text-sm font-bold text-[#0F5238]">{formData.deliveryRadius} km</span>
                        <span className="text-xs text-[#707973]">20 km</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {!formData.isDeliveryEnabled && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                  <p className="text-sm text-amber-700 font-medium">🏪 Mode Pickup Only</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Pembeli harus mengambil pesanan langsung di warung. Anda bisa mengaktifkan layanan antar kapan saja di Settings.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ═══ STEP 5: Payment Gateway ═══ */}
          {step === 5 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-4 bg-[#0F5238]/5 border border-[#0F5238]/20 rounded-2xl">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-[#0F5238] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#191C1D]">Integrasi Pakasir</p>
                    <p className="text-xs text-[#707973] mt-1">
                      Hubungkan akun Pakasir untuk menerima pembayaran digital dari pelanggan. Langkah ini opsional — Anda bisa mengisinya nanti di Settings.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#191C1D]">Pakasir Project Slug</label>
                  <div className="relative">
                    <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707973] w-4 h-4" />
                    <input
                      type="text"
                      value={formData.pakasirSlug}
                      onChange={(e) => setFormData((p) => ({ ...p, pakasirSlug: e.target.value }))}
                      placeholder="contoh: warung-saya"
                      className="w-full pl-10 pr-4 py-3 bg-[#F3F4F5] rounded-xl border border-transparent focus:border-[#0F5238] focus:ring-2 focus:ring-[#0F5238]/20 outline-none text-sm font-mono text-[#191C1D] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#191C1D]">Pakasir API Key</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={formData.pakasirApiKey}
                      onChange={(e) => setFormData((p) => ({ ...p, pakasirApiKey: e.target.value }))}
                      placeholder="sk_live_xxxxxxxxxxxx"
                      className="w-full pl-4 pr-10 py-3 bg-[#F3F4F5] rounded-xl border border-transparent focus:border-[#0F5238] focus:ring-2 focus:ring-[#0F5238]/20 outline-none text-sm font-mono text-[#191C1D] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#707973] hover:text-[#0F5238] transition-colors"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#191C1D]">Webhook URL</label>
                  <p className="text-xs text-[#707973]">Daftarkan URL ini di dashboard Pakasir Anda</p>
                  <div className="flex gap-2">
                    <div className="flex-1 px-3 py-2.5 bg-[#F3F4F5] rounded-xl border border-[#E1E3E4] text-xs font-mono text-[#404943] truncate">
                      {webhookUrl}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyWebhook}
                      className="px-3 py-2.5 bg-[#0F5238] text-white rounded-xl text-xs font-semibold hover:bg-[#0c422c] transition-colors flex items-center gap-1.5 whitespace-nowrap"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Disalin!" : "Salin"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 6: Tambah Menu ═══ */}
          {step === 6 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Info banner */}
              <div className="flex items-start gap-3 p-3 bg-[#0F5238]/5 border border-[#0F5238]/20 rounded-2xl">
                <ChefHat className="w-5 h-5 text-[#0F5238] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#191C1D]">Tambah Menu Pertama</p>
                  <p className="text-xs text-[#707973] mt-0.5">
                    Tambahkan hingga 3 menu sekarang. Paket FREE max 5 menu — bisa tambah lagi di halaman Menu.
                  </p>
                </div>
              </div>

              {/* Menu tabs */}
              <div className="flex items-center gap-2">
                {menus.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveMenuTab(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        activeMenuTab === idx
                          ? "bg-[#0F5238] text-white shadow-md"
                          : "bg-[#F3F4F5] text-[#707973] hover:text-[#404943]"
                      }`}
                    >
                      {m.name.trim() || `Menu ${idx + 1}`}
                    </button>
                    {menus.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMenuTab(idx)}
                        className="p-1 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                {menus.length < 3 && (
                  <button
                    type="button"
                    onClick={addMenuTab}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-dashed border-[#0F5238]/40 text-[#0F5238] hover:bg-[#0F5238]/5 transition-all"
                  >
                    <Plus className="w-3 h-3" /> Tambah
                  </button>
                )}
              </div>

              {/* Menu form */}
              <div className="space-y-3 p-4 bg-[#F8F9FA] rounded-2xl border border-[#E1E3E4]">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#404943]">Nama Menu <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={currentMenu.name}
                    onChange={(e) => updateMenu("name", e.target.value)}
                    placeholder="Contoh: Nasi Ayam Geprek"
                    className="w-full px-3 py-2.5 bg-white rounded-xl border border-[#E1E3E4] focus:border-[#0F5238] focus:ring-2 focus:ring-[#0F5238]/20 outline-none text-sm text-[#191C1D] transition-all"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#404943]">Deskripsi</label>
                  <textarea
                    value={currentMenu.description}
                    onChange={(e) => updateMenu("description", e.target.value)}
                    placeholder="Deskripsi singkat menu..."
                    rows={2}
                    className="w-full px-3 py-2.5 bg-white rounded-xl border border-[#E1E3E4] focus:border-[#0F5238] focus:ring-2 focus:ring-[#0F5238]/20 outline-none text-xs text-[#191C1D] transition-all resize-none"
                  />
                </div>

                {/* Price + Stock */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#404943]">
                      <DollarSign className="inline w-3 h-3 mr-0.5" />
                      Harga (Rp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number" min={0}
                      value={currentMenu.price}
                      onChange={(e) => updateMenu("price", e.target.value)}
                      placeholder="15000"
                      className="w-full px-3 py-2.5 bg-white rounded-xl border border-[#E1E3E4] focus:border-[#0F5238] focus:ring-2 focus:ring-[#0F5238]/20 outline-none text-sm text-[#191C1D] transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#404943]">
                      <Package className="inline w-3 h-3 mr-0.5" />
                      Stok
                    </label>
                    <input
                      type="number" min={0}
                      value={currentMenu.stock}
                      onChange={(e) => updateMenu("stock", e.target.value)}
                      placeholder="Kosong = unlimited"
                      className="w-full px-3 py-2.5 bg-white rounded-xl border border-[#E1E3E4] focus:border-[#0F5238] focus:ring-2 focus:ring-[#0F5238]/20 outline-none text-sm text-[#191C1D] transition-all"
                    />
                  </div>
                </div>

                {/* Nutrition */}
                <div>
                  <label className="text-xs font-semibold text-[#404943] mb-2 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" /> Info Nutrisi
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: "calories", label: "Kalori (kkal)*", placeholder: "400" },
                      { key: "protein", label: "Protein (g)*", placeholder: "25" },
                      { key: "fat", label: "Lemak (g)", placeholder: "10" },
                      { key: "carbs", label: "Karbo (g)", placeholder: "50" },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key} className="space-y-1">
                        <label className="text-[10px] font-medium text-[#707973]">{label}</label>
                        <input
                          type="number" min={0}
                          value={currentMenu[key as keyof MenuItem] as string}
                          onChange={(e) => updateMenu(key as keyof MenuItem, e.target.value)}
                          placeholder={placeholder}
                          className="w-full px-2.5 py-2 bg-white rounded-lg border border-[#E1E3E4] focus:border-[#0F5238] focus:ring-1 focus:ring-[#0F5238]/20 outline-none text-xs text-[#191C1D] transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#404943]">Kategori Menu</label>
                  <select
                    value={currentMenu.category}
                    onChange={(e) => updateMenu("category", e.target.value)}
                    className="w-full px-3 py-2.5 bg-white rounded-xl border border-[#E1E3E4] focus:border-[#0F5238] outline-none text-sm text-[#191C1D] transition-all"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {MENU_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#404943]">
                    <Tag className="inline w-3 h-3 mr-0.5" /> Tags (maks. 5)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          currentMenu.tags.includes(tag) ? removeTag(tag) : addTag(tag)
                        }
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                          currentMenu.tags.includes(tag)
                            ? "bg-[#0F5238] text-white border-[#0F5238]"
                            : "bg-white text-[#707973] border-[#E1E3E4] hover:border-[#0F5238]/50"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); }
                      }}
                      placeholder="Tambah tag kustom..."
                      className="flex-1 px-3 py-2 bg-white rounded-xl border border-[#E1E3E4] focus:border-[#0F5238] focus:ring-1 focus:ring-[#0F5238]/20 outline-none text-xs text-[#191C1D] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => addTag(tagInput)}
                      className="px-3 py-2 bg-[#0F5238] text-white rounded-xl text-xs font-semibold hover:bg-[#0c422c] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {currentMenu.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {currentMenu.tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 px-2.5 py-1 bg-[#B0F1CC] text-[#0F5238] rounded-full text-[10px] font-semibold"
                        >
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600 transition-colors">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {menuError && (
                <p className="text-xs text-red-600 font-medium px-1">{menuError}</p>
              )}
              {menuSaved && (
                <div className="flex items-center gap-2 p-3 bg-[#B0F1CC]/40 border border-[#B0F1CC] rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-[#0F5238]" />
                  <p className="text-xs text-[#0F5238] font-semibold">Menu berhasil disimpan! Melanjutkan...</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ STEP 7: Tutorial ═══ */}
          {step === 7 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Celebration header */}
              <div className="text-center py-2">
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#B0F1CC] to-[#40916C] rounded-2xl flex items-center justify-center shadow-lg shadow-[#0F5238]/20">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px]">
                    🎉
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#191C1D]">Warung Siap Berjualan!</h3>
                <p className="text-sm text-[#707973] mt-1 max-w-xs mx-auto">
                  Profil <span className="font-semibold text-[#0F5238]">{vendor.name}</span> telah dikonfigurasi. Pelajari cara menggunakan dashboard Anda.
                </p>
              </div>

              {/* Tutorial cards */}
              <div className="space-y-3">
                {TUTORIAL_STEPS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.step}
                      href={item.path}
                      className="block p-4 rounded-2xl border border-[#E1E3E4] hover:border-[#0F5238]/30 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                          style={{ background: item.bg }}
                        >
                          <Icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-[#191C1D]">{item.title}</p>
                            <ArrowRight className="w-3.5 h-3.5 text-[#707973] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                          </div>
                          <p className="text-xs text-[#707973] mt-0.5 leading-relaxed">{item.desc}</p>
                          {/* Tips */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {item.tips.map((tip) => (
                              <span
                                key={tip}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                                style={{ background: item.bg, color: item.color }}
                              >
                                <Zap className="w-2.5 h-2.5" />
                                {tip}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* Quick tip */}
              <div className="p-4 bg-gradient-to-r from-[#0F5238] to-[#2D6A4F] rounded-2xl text-white">
                <p className="text-sm font-bold mb-1">💡 Tips Sukses Berjualan</p>
                <ul className="text-xs text-white/80 space-y-1">
                  <li>• Foto menu yang bagus meningkatkan pesanan hingga <strong className="text-white">40%</strong></li>
                  <li>• Respons pesanan cepat &lt; 5 menit meningkatkan <strong className="text-white">rating</strong></li>
                  <li>• Update stok rutin agar pelanggan tidak kecewa</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* ─── Footer ─── */}
        <div className="px-6 py-4 border-t border-[#E1E3E4] bg-white flex items-center justify-between gap-3 flex-shrink-0">
          {/* Left: Back / Later */}
          <div className="flex items-center gap-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E1E3E4] text-sm font-semibold text-[#404943] hover:bg-[#F3F4F5] transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Kembali
              </button>
            ) : (
              <button
                type="button"
                onClick={onComplete}
                className="text-xs text-[#707973] hover:text-[#404943] transition-colors underline underline-offset-2"
              >
                Selesaikan Nanti
              </button>
            )}
          </div>

          {/* Right: Skip / Next */}
          <div className="flex items-center gap-2">
            {/* Skip for payment step */}
            {step === 5 && (
              <button
                type="button"
                onClick={handleSkip}
                className="px-4 py-2.5 rounded-xl border border-[#E1E3E4] text-sm font-semibold text-[#404943] hover:bg-[#F3F4F5] transition-colors"
              >
                Lewati
              </button>
            )}

            {/* Skip menu step */}
            {step === 6 && !menuSaved && (
              <button
                type="button"
                onClick={handleSkip}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-[#E1E3E4] text-sm font-semibold text-[#404943] hover:bg-[#F3F4F5] transition-colors disabled:opacity-50"
              >
                Lewati
              </button>
            )}

            {/* Save menu button (step 6) */}
            {step === 6 ? (
              <button
                type="button"
                onClick={handleSaveMenus}
                disabled={saving || menuSaved}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0F5238] text-white rounded-xl text-sm font-bold hover:bg-[#0c422c] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#0F5238]/20"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : menuSaved ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <>
                    <ChefHat className="w-4 h-4" />
                    Simpan Menu
                  </>
                )}
              </button>
            ) : step < STEPS.length ? (
              <button
                type="button"
                onClick={handleSaveStep}
                disabled={saving || !isStepValid()}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0F5238] text-white rounded-xl text-sm font-bold hover:bg-[#0c422c] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#0F5238]/20"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Simpan & Lanjut
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onComplete}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0F5238] text-white rounded-xl text-sm font-bold hover:bg-[#0c422c] transition-all active:scale-95 shadow-md shadow-[#0F5238]/20"
              >
                <Sparkles className="w-4 h-4" />
                Mulai Berjualan!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
