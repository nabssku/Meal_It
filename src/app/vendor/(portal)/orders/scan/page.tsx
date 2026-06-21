"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import {
  QrCode, Search, CheckCircle2, XCircle,
  Loader2, ScanLine, MapPin, User,
  Banknote, CreditCard, Utensils, AlertCircle,
  Clock, Package, RotateCcw
} from "lucide-react";
import { getMealPlanItemByPickupCode, confirmMealPickupAction } from "@/app/actions/meal-actions";

type PickupItemData = {
  id: string;
  mealType: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryMethod: string;
  pickupCode: string;
  menuName: string;
  menuPrice: number;
  menuImage: string | null;
  userName: string | null;
  userEmail: string | null;
  vendorName: string;
  mealPlanDate: Date;
};

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: "🌅 Sarapan",
  LUNCH: "☀️ Makan Siang",
  DINNER: "🌙 Makan Malam",
  SNACK: "🍪 Snack",
};

const scanLineStyle = `
  @keyframes scanLine {
    0%   { top: 8px;  opacity: 1; }
    50%  { top: calc(100% - 8px); opacity: 0.8; }
    100% { top: 8px;  opacity: 1; }
  }
  .scan-line {
    position: absolute;
    left: 8px;
    right: 8px;
    height: 2px;
    background: linear-gradient(to right, transparent, #0F5238, transparent);
    border-radius: 9999px;
    animation: scanLine 1.5s ease-in-out infinite;
  }
  #reader video {
    object-fit: cover !important;
    width: 100% !important;
    height: 100% !important;
  }
`;

export default function VendorScanPage() {
  const [inputCode, setInputCode] = useState("");
  const [scannedData, setScannedData] = useState<PickupItemData | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [isScanning, startScanning] = useTransition();
  const [isConfirming, startConfirming] = useTransition();

  const [scanner, setScanner] = useState<any>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    let html5QrcodeScanner: any = null;
    
    import("html5-qrcode").then((pkg) => {
      const Html5QrcodeClass = pkg.Html5Qrcode;
      const scannerInstance = new Html5QrcodeClass("reader");
      setScanner(scannerInstance);
      html5QrcodeScanner = scannerInstance;
    }).catch(err => console.error("Error loading html5-qrcode package:", err));

    return () => {
      if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
        html5QrcodeScanner.stop().catch((err: any) => console.error(err));
      }
    };
  }, []);

  const startCamera = async () => {
    if (!scanner) return;
    try {
      setCameraActive(true);
      setScanError(null);
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText: string) => {
          handleScan(decodedText);
          stopCamera();
        },
        () => {
          // ignore frame errors
        }
      );
    } catch (err) {
      console.error("Failed to start camera scanner:", err);
      setCameraActive(false);
      setScanError("Gagal mengakses kamera. Silakan periksa izin kamera perangkat Anda.");
    }
  };

  const stopCamera = async () => {
    if (scanner && scanner.isScanning) {
      try {
        await scanner.stop();
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
    setCameraActive(false);
  };

  const handleScan = (code?: string) => {
    const codeToScan = (code || inputCode).trim().toUpperCase();
    if (!codeToScan) return;

    setScanError(null);
    setScannedData(null);
    setConfirmSuccess(false);
    setAnimating(true);

    startScanning(async () => {
      await new Promise((r) => setTimeout(r, 900));
      setAnimating(false);

      const result = await getMealPlanItemByPickupCode(codeToScan);
      if (result.success && result.data) {
        setScannedData(result.data as PickupItemData);
      } else {
        setScanError(result.error || "Kode tidak ditemukan.");
      }
    });
  };

  const handleConfirm = () => {
    if (!scannedData) return;
    startConfirming(async () => {
      const result = await confirmMealPickupAction(scannedData.id, scannedData.pickupCode);
      if (result.success) {
        setConfirmSuccess(true);
      } else {
        setScanError(result.error || "Gagal konfirmasi.");
        setScannedData(null);
      }
    });
  };

  const handleReset = () => {
    stopCamera();
    setInputCode("");
    setScannedData(null);
    setScanError(null);
    setConfirmSuccess(false);
    setAnimating(false);
  };

  const isProcessing = isScanning || animating;

  return (
    <>
      {/* Inject scan line animation */}
      <style dangerouslySetInnerHTML={{ __html: scanLineStyle }} />

      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 hide-scrollbar">
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold text-[#191C1D]">Scan QR Pengambilan</h2>
          <p className="text-[#707973] font-medium mt-1">
            Scan barcode pelanggan untuk mengonfirmasi pengambilan makanan secara otomatis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ─── Left: Scanner Panel ─── */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#E1E3E4] p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#0F5238]/10 rounded-xl">
                  <QrCode size={20} className="text-[#0F5238]" />
                </div>
                <h3 className="font-bold text-[#191C1D] text-lg">Scanner Barcode</h3>
              </div>

              {/* Animated Viewfinder */}
              <div className="relative mx-auto w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden bg-[#0F5238]/5 border-2 border-[#0F5238]/20 flex items-center justify-center">
                {/* HTML5 QR Code element */}
                <div id="reader" className="absolute inset-0 w-full h-full z-0 overflow-hidden"></div>

                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#0F5238] rounded-tl-xl z-10" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#0F5238] rounded-tr-xl z-10" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#0F5238] rounded-bl-xl z-10" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#0F5238] rounded-br-xl z-10" />

                {/* Scan line */}
                {(isProcessing || cameraActive) && <div className="scan-line z-20" />}

                {/* Center content overlay when not active/scanning */}
                {!cameraActive && (
                  <div className="flex flex-col items-center gap-2 z-10 px-4 text-center bg-white/90 p-4 rounded-xl shadow-sm">
                    {isProcessing ? (
                      <>
                        <Loader2 size={32} className="text-[#0F5238] animate-spin" />
                        <p className="text-[10px] font-bold text-[#0F5238] uppercase tracking-wider">Memverifikasi...</p>
                      </>
                    ) : confirmSuccess ? (
                      <>
                        <CheckCircle2 size={36} className="text-green-500" />
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Berhasil!</p>
                      </>
                    ) : scannedData ? (
                      <>
                        <Package size={32} className="text-[#0F5238]" />
                        <p className="text-[10px] font-bold text-[#0F5238] uppercase tracking-wider">Data Ditemukan</p>
                      </>
                    ) : scanError ? (
                      <>
                        <XCircle size={32} className="text-red-500" />
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Gagal</p>
                      </>
                    ) : (
                      <>
                        <ScanLine size={32} className="text-[#707973]" />
                        <p className="text-[10px] font-bold text-[#707973] uppercase tracking-wider">Siap Scan</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Camera Activation Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={cameraActive ? stopCamera : startCamera}
                  className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
                    cameraActive 
                      ? "bg-red-50 text-red-600 hover:bg-red-100/80" 
                      : "bg-[#B0F1CC] text-[#002113] hover:bg-[#B0F1CC]/80"
                  }`}
                >
                  <QrCode size={18} />
                  <span>{cameraActive ? "Matikan Kamera" : "Aktifkan Kamera Scan"}</span>
                </button>
              </div>

              {/* Manual Input */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#404943] uppercase tracking-wider">
                  Masukkan Kode Pickup Manual
                </label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707973] w-4 h-4 transition-colors group-focus-within:text-[#0F5238]" />
                  <input
                    type="text"
                    placeholder="MP-BF-XXXXXX"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleScan()}
                    className="w-full pl-11 pr-4 py-3 font-mono bg-[#F8F9FA] border border-[#E1E3E4] rounded-2xl focus:ring-2 focus:ring-[#0F5238] focus:border-transparent text-sm font-bold tracking-widest uppercase transition-all"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleScan()}
                    disabled={isProcessing || !inputCode.trim()}
                    className="flex-1 py-3 bg-[#0F5238] text-white font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-[#0F5238]/20"
                  >
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <QrCode size={18} />}
                    {isProcessing ? "Mengecek..." : "Verifikasi"}
                  </button>
                  {(scannedData || scanError || confirmSuccess) && (
                    <button
                      onClick={handleReset}
                      className="px-4 py-3 bg-[#F3F4F5] text-[#404943] font-bold rounded-2xl hover:bg-[#E1E3E4] transition-all flex items-center gap-1"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-[#F3F4F5] rounded-2xl border border-[#E1E3E4] p-4 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#707973] flex items-center gap-1">
                <MapPin size={10} /> Panduan Penggunaan
              </p>
              <ul className="text-[10px] text-[#707973] space-y-1 leading-relaxed">
                <li>1. Minta pelanggan membuka <strong>Dashboard</strong> dan tap tombol <strong>"Barcode"</strong></li>
                <li>2. Ketuk kode yang tertera, atau scan QR menggunakan kamera</li>
                <li>3. Verifikasi detail pesanan yang muncul</li>
                <li>4. Tekan <strong>Konfirmasi Pengambilan</strong> — status otomatis terupdate</li>
              </ul>
            </div>
          </div>

          {/* ─── Right: Result Panel ─── */}
          <div className="space-y-5">
            {/* Error State */}
            {scanError && (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-6 flex items-start gap-4">
                <div className="p-2.5 bg-red-100 rounded-xl flex-shrink-0">
                  <XCircle size={22} className="text-red-600" />
                </div>
                <div>
                  <h4 className="font-bold text-red-700 text-lg">Verifikasi Gagal</h4>
                  <p className="text-sm text-red-600 mt-1">{scanError}</p>
                  <button
                    onClick={handleReset}
                    className="mt-3 text-xs font-bold text-red-600 underline flex items-center gap-1"
                  >
                    <RotateCcw size={12} /> Coba Lagi
                  </button>
                </div>
              </div>
            )}

            {/* Success State */}
            {confirmSuccess && scannedData && (
              <div className="bg-white rounded-3xl border border-[#E1E3E4] overflow-hidden shadow-sm">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 size={36} className="text-white" />
                    <div>
                      <h4 className="font-bold text-xl">Pengambilan Dikonfirmasi!</h4>
                      <p className="text-sm text-white/80">{MEAL_LABELS[scannedData.mealType]} oleh {scannedData.userName}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {scannedData.paymentMethod === "CASH" && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Banknote size={22} className="text-orange-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-orange-700">Terima Pembayaran Tunai</p>
                          <p className="text-[10px] text-orange-600">Konfirmasi bahwa uang sudah diterima</p>
                        </div>
                      </div>
                      <p className="text-xl font-black text-orange-800">
                        Rp {scannedData.menuPrice.toLocaleString("id-ID")}
                      </p>
                    </div>
                  )}
                  {scannedData.paymentMethod === "WALLET" && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
                      <p className="text-sm font-bold text-green-700">Pembayaran sudah lunas via Nutri-Wallet — tidak perlu tagihan tunai.</p>
                    </div>
                  )}
                  <button
                    onClick={handleReset}
                    className="w-full py-3.5 bg-[#0F5238] text-white font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <QrCode size={18} />
                    Scan Pesanan Berikutnya
                  </button>
                </div>
              </div>
            )}

            {/* Scanned Item Detail */}
            {scannedData && !confirmSuccess && (
              <div className="bg-white rounded-3xl border border-[#E1E3E4] overflow-hidden shadow-sm">
                {/* Header */}
                <div className="p-6 bg-gradient-to-br from-[#0F5238] to-[#2D6A4F] text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Pesanan Terverifikasi</p>
                      <h4 className="font-bold text-2xl mt-0.5">{MEAL_LABELS[scannedData.mealType] || scannedData.mealType}</h4>
                    </div>
                    <div className="p-2.5 bg-white/20 rounded-xl">
                      <Package size={22} className="text-white" />
                    </div>
                  </div>
                  <div className="font-mono text-sm bg-white/20 rounded-xl px-4 py-2 inline-block tracking-widest font-bold">
                    {scannedData.pickupCode}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Menu Info */}
                  <div className="flex items-center gap-4 p-3 bg-[#F8F9FA] rounded-2xl">
                    {scannedData.menuImage && (
                      <img
                        src={scannedData.menuImage}
                        alt={scannedData.menuName}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#191C1D] truncate">{scannedData.menuName}</p>
                      <p className="text-xs text-[#707973]">{scannedData.vendorName}</p>
                      <p className="text-lg font-black text-[#191C1D] mt-1">
                        Rp {scannedData.menuPrice.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#F3F4F5] rounded-xl">
                      <p className="text-[10px] font-bold text-[#707973] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <User size={10} /> Pelanggan
                      </p>
                      <p className="text-sm font-bold text-[#191C1D] truncate">{scannedData.userName || "User"}</p>
                      <p className="text-[10px] text-[#707973] truncate">{scannedData.userEmail}</p>
                    </div>
                    <div className="p-3 bg-[#F3F4F5] rounded-xl">
                      <p className="text-[10px] font-bold text-[#707973] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Clock size={10} /> Tanggal
                      </p>
                      <p className="text-sm font-bold text-[#191C1D]">
                        {new Date(scannedData.mealPlanDate).toLocaleDateString("id-ID", {
                          weekday: "short", day: "numeric", month: "short"
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                    scannedData.paymentMethod === "WALLET"
                      ? "bg-orange-50 border-orange-200"
                      : "bg-emerald-50 border-emerald-200"
                  }`}>
                    <div className="flex items-center gap-3">
                      {scannedData.paymentMethod === "WALLET" ? (
                        <CreditCard size={20} className="text-orange-600 flex-shrink-0" />
                      ) : (
                        <Banknote size={20} className="text-emerald-600 flex-shrink-0" />
                      )}
                      <div>
                        <p className={`text-xs font-bold ${scannedData.paymentMethod === "WALLET" ? "text-orange-700" : "text-emerald-700"}`}>
                          {scannedData.paymentMethod === "WALLET" ? "💳 Sudah Lunas (Nutri-Wallet)" : "💵 Bayar Tunai di Sini"}
                        </p>
                        <p className={`text-[10px] ${scannedData.paymentMethod === "WALLET" ? "text-orange-600" : "text-emerald-600"}`}>
                          {scannedData.paymentMethod === "WALLET"
                            ? "Tidak perlu terima uang tunai"
                            : "Terima pembayaran dari pelanggan"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-[#191C1D]">
                        Rp {scannedData.menuPrice.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* Alert if already picked up */}
                  {(scannedData.status === "PICKED_UP" || scannedData.status === "DELIVERED") && (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                      <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-amber-700">
                        Pesanan ini sudah dikonfirmasi sebelumnya. Pastikan ini bukan duplikasi.
                      </p>
                    </div>
                  )}

                  {/* Confirm CTA */}
                  <button
                    onClick={handleConfirm}
                    disabled={isConfirming || scannedData.status === "PICKED_UP"}
                    className="w-full py-4 bg-[#0F5238] text-white font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0F5238]/20 text-base"
                  >
                    {isConfirming ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Mengonfirmasi...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={20} />
                        {scannedData.paymentMethod === "CASH"
                          ? `Konfirmasi & Terima Rp ${scannedData.menuPrice.toLocaleString("id-ID")}`
                          : "Konfirmasi Pengambilan"}
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleReset}
                    className="w-full py-2.5 text-[#707973] font-bold text-sm rounded-2xl hover:bg-[#F3F4F5] transition-all"
                  >
                    Batalkan
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!scannedData && !scanError && !confirmSuccess && !isProcessing && (
              <div className="bg-white rounded-3xl border border-[#E1E3E4] p-16 text-center shadow-sm">
                <div className="w-20 h-20 bg-[#F3F4F5] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils size={36} className="text-[#707973]" />
                </div>
                <h4 className="font-bold text-[#191C1D] text-lg mb-2">Belum Ada Scan</h4>
                <p className="text-sm text-[#707973] leading-relaxed max-w-xs mx-auto">
                  Masukkan kode pickup pelanggan di kiri untuk menampilkan detail pesanan dan mengonfirmasi pengambilan.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
