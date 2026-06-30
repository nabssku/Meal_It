"use client";

import React, { useState } from "react";
import { 
  broadcastPushNotificationAction, 
  sendPushNotificationAction 
} from "@/app/actions/push-actions";
import Button from "@/components/ui/Button";

interface UserOption {
  id: string;
  name: string | null;
  email: string | null;
}

interface NotificationFormClientProps {
  users: UserOption[];
}

export default function NotificationFormClient({ users }: NotificationFormClientProps) {
  const [target, setTarget] = useState<"broadcast" | "user">("broadcast");
  const [targetUserId, setTargetUserId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("promo");
  
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setStatusMsg({ type: "error", text: "Judul dan pesan tidak boleh kosong!" });
      return;
    }

    if (target === "user" && !targetUserId) {
      setStatusMsg({ type: "error", text: "Silakan pilih target user!" });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        url: url.trim() || undefined,
        type,
      };

      let result;
      if (target === "broadcast") {
        result = await broadcastPushNotificationAction(payload);
      } else {
        result = await sendPushNotificationAction(targetUserId, payload);
      }

      if (result.success) {
        const successes = (result as any).successCount || 0;
        const failures = (result as any).failCount || 0;
        setStatusMsg({
          type: "success",
          text: `Notifikasi berhasil dikirim! Sukses: ${successes} perangkat, Gagal/Kedaluwarsa: ${failures} perangkat.`,
        });
        
        // Reset form except target
        setTitle("");
        setBody("");
        setUrl("");
      } else {
        setStatusMsg({
          type: "error",
          text: result.error || "Gagal mengirim push notifikasi.",
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: "error", text: err.message || "Terjadi kesalahan sistem." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium border ${
            statusMsg.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Target Type */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-[#191C1D] block">Target Penerima</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-[#404943]">
            <input
              type="radio"
              name="target"
              checked={target === "broadcast"}
              onChange={() => {
                setTarget("broadcast");
                setStatusMsg(null);
              }}
              className="w-4 h-4 text-[#0F5238] focus:ring-[#0F5238]"
            />
            Broadcast Semua User
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-[#404943]">
            <input
              type="radio"
              name="target"
              checked={target === "user"}
              onChange={() => {
                setTarget("user");
                setStatusMsg(null);
              }}
              className="w-4 h-4 text-[#0F5238] focus:ring-[#0F5238]"
            />
            Target User Spesifik
          </label>
        </div>
      </div>

      {/* User Selection (if target is user) */}
      {target === "user" && (
        <div className="space-y-2 animate-fade-in">
          <label htmlFor="targetUser" className="text-sm font-bold text-[#191C1D] block">
            Pilih User
          </label>
          <select
            id="targetUser"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="w-full border border-[#E1E3E4] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5238]/20 focus:border-[#0F5238] bg-white font-medium text-[#191C1D]"
          >
            <option value="">-- Pilih User --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || "No Name"} ({u.email || "No Email"})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Category / Type */}
      <div className="space-y-2">
        <label htmlFor="notifType" className="text-sm font-bold text-[#191C1D] block">
          Kategori Notifikasi
        </label>
        <select
          id="notifType"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-[#E1E3E4] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5238]/20 focus:border-[#0F5238] bg-white font-medium text-[#191C1D]"
        >
          <option value="promo">Promo & Informasi MEALIT</option>
          <option value="nutrition_tips">Tips Nutrisi Harian</option>
          <option value="meal_reminder">Pengingat Waktu Makan</option>
          <option value="order_ready">Update Status Pesanan / Delivery</option>
        </select>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-bold text-[#191C1D] block">
          Judul Notifikasi
        </label>
        <input
          type="text"
          id="title"
          placeholder="Masukkan judul notifikasi..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-[#E1E3E4] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5238]/20 focus:border-[#0F5238] font-medium text-[#191C1D]"
        />
      </div>

      {/* Message Body */}
      <div className="space-y-2">
        <label htmlFor="body" className="text-sm font-bold text-[#191C1D] block">
          Isi Pesan
        </label>
        <textarea
          id="body"
          rows={4}
          placeholder="Tulis pesan push notification di sini..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full border border-[#E1E3E4] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5238]/20 focus:border-[#0F5238] font-medium text-[#191C1D] resize-none"
        />
      </div>

      {/* Redirect URL */}
      <div className="space-y-2">
        <label htmlFor="url" className="text-sm font-bold text-[#191C1D] block">
          Link Redirect Opsional (URL Path)
        </label>
        <input
          type="text"
          id="url"
          placeholder="Contoh: /orders atau /menus/hemat"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border border-[#E1E3E4] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5238]/20 focus:border-[#0F5238] font-medium text-[#191C1D]"
        />
        <p className="text-[10px] text-[#707973] font-medium">
          Saat user mengetuk notifikasi ini, browser akan otomatis mengarahkan ke halaman ini.
        </p>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-8 bg-[#0F5238] hover:bg-[#0A3522] text-white font-bold h-12 rounded-2xl flex items-center justify-center gap-2"
        >
          {loading ? "Mengirim..." : "Kirim Push Notifikasi"}
        </Button>
      </div>
    </form>
  );
}
