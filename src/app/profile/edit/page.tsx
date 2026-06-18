"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User as UserIcon, Mail, Phone, MapPin, Loader2, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { getUserProfileAction, updateUserProfileAction } from "@/app/actions/user-actions";

export default function ProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+62 812 3456 7890");
  const [location, setLocation] = useState("Jakarta, Indonesia");
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getUserProfileAction()
      .then((data) => {
        setName(data.name || "");
        setEmail(data.email || "");
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Gagal memuat profil.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Nama dan email wajib diisi.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await updateUserProfileAction({ name, email });
      setSuccess(true);
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal memperbarui profil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border/50">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-primary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Detail Profil</h1>
      </header>

      {loading ? (
        <main className="flex-1 p-6 flex flex-col items-center justify-center gap-2">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat data...</p>
        </main>
      ) : (
        <main className="flex-1 p-6 space-y-8 pb-36 animate-in fade-in">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-muted overflow-hidden border-4 border-white shadow-md">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&size=128&background=0F5238&color=fff`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform">
                <UserIcon size={14} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Foto Profil dari Akun Anda</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Nama Lengkap</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => { setError(""); setName(e.target.value); }}
                  className="w-full pl-12 pr-4 py-4 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => { setError(""); setEmail(e.target.value); }}
                  className="w-full pl-12 pr-4 py-4 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Nomor Telepon</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Lokasi</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-muted/30 border border-border/50 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                />
              </div>
            </div>
          </div>
        </main>
      )}

      {!loading && (
        <footer className="p-6 bg-white/95 backdrop-blur-md border-t border-border/50 fixed bottom-[72px] left-0 right-0 z-40 flex flex-col gap-3">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl font-medium text-center animate-in fade-in">
              {error}
            </div>
          )}
          <Button 
            onClick={handleSave} 
            disabled={saving || success}
            className={`w-full h-14 rounded-2xl shadow-lg flex gap-2 font-bold transition-all ${
              success ? "bg-green-500 hover:bg-green-600 shadow-green-500/20" : "shadow-primary/20"
            }`}
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Menyimpan...
              </>
            ) : success ? (
              <>
                <Check size={20} />
                Profil Berhasil Disimpan
              </>
            ) : (
              <>
                <Save size={20} />
                Simpan Perubahan
              </>
            )}
          </Button>
        </footer>
      )}
    </div>
  );
}
