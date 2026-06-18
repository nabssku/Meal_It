"use client";

import React, { useState, useEffect, useRef } from "react";
import VendorTopBar from "@/components/vendor/VendorTopBar";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  FileText, 
  Store,
  Save,
  Loader2,
  CheckCircle2,
  Camera
} from "lucide-react";
import { updateVendorProfile } from "@/app/actions/vendor-actions";

export default function VendorSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [vendorData, setVendorData] = useState<any>(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchVendor() {
      try {
        const res = await fetch("/api/vendor/profile");
        const data = await res.json();
        setVendorData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    }
    fetchVendor();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setVendorData({ ...vendorData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVendorData((prev: any) => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      await updateVendorProfile({
        vendorId: vendorData.id,
        name: vendorData.name,
        description: vendorData.description,
        logo: vendorData.logo,
        address: vendorData.address,
        city: vendorData.city,
        openingHours: vendorData.openingHours,
        contact: vendorData.contact,
        category: vendorData.category,
        isActive: vendorData.isActive
      });
      setMessage({ text: "Profile updated successfully!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update profile", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="animate-spin text-[#0F5238] w-10 h-10" />
    </div>
  );

  return (
    <>
      <VendorTopBar title="Account Settings" />
      
      <main className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar">
        <div className="max-w-[1000px] mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-[#191C1D]">Store Profile</h2>
            <p className="text-[#707973] font-medium mt-1">Manage your brand presence and operational details on the Meal-it platform.</p>
          </div>

          {message.text && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
              message.type === "success" 
                ? "bg-green-50 text-green-700 border-green-100" 
                : "bg-red-50 text-red-700 border-red-100"
            }`}>
              {message.type === "success" ? <CheckCircle2 size={18} /> : null}
              <span className="text-sm font-bold">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            {/* Left: Store Basics */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-[32px] border border-[#E1E3E4] shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-[#191C1D] flex items-center gap-2">
                  <Building2 size={20} className="text-[#0F5238]" />
                  Store Identity
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#404943]">Store Name</label>
                    <input 
                      name="name"
                      value={vendorData?.name || ""}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-[#F3F4F5] border-none rounded-2xl focus:ring-2 focus:ring-[#0F5238] font-bold text-[#191C1D]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#404943]">Bio / Description</label>
                    <textarea 
                      name="description"
                      value={vendorData?.description || ""}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-5 py-3.5 bg-[#F3F4F5] border-none rounded-2xl focus:ring-2 focus:ring-[#0F5238] font-medium text-[#404943]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#404943]">Category</label>
                      <select 
                        name="category"
                        value={vendorData?.category || "Regular"}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-[#F3F4F5] border-none rounded-2xl focus:ring-2 focus:ring-[#0F5238] font-bold text-sm"
                      >
                        <option>Healthy Kitchen</option>
                        <option>Eco-Friendly</option>
                        <option>Budget Friendly</option>
                        <option>Premium Nutrition</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#404943]">Contact Phone</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#707973]" />
                        <input 
                          name="contact"
                          value={vendorData?.contact || ""}
                          onChange={handleChange}
                          className="w-full pl-12 pr-5 py-3.5 bg-[#F3F4F5] border-none rounded-2xl focus:ring-2 focus:ring-[#0F5238] font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location & Hours */}
              <div className="bg-white p-8 rounded-[32px] border border-[#E1E3E4] shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-[#191C1D] flex items-center gap-2">
                  <MapPin size={20} className="text-[#0F5238]" />
                  Logistics & Hours
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#404943]">Physical Address</label>
                    <input 
                      name="address"
                      value={vendorData?.address || ""}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-[#F3F4F5] border-none rounded-2xl focus:ring-2 focus:ring-[#0F5238] font-medium"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#404943]">City</label>
                      <input 
                        name="city"
                        value={vendorData?.city || ""}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-[#F3F4F5] border-none rounded-2xl focus:ring-2 focus:ring-[#0F5238] font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#404943]">Opening Hours</label>
                      <div className="relative">
                        <Clock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#707973]" />
                        <input 
                          name="openingHours"
                          value={vendorData?.openingHours || ""}
                          onChange={handleChange}
                          placeholder="e.g. 08:00 - 20:00"
                          className="w-full pl-12 pr-5 py-3.5 bg-[#F3F4F5] border-none rounded-2xl focus:ring-2 focus:ring-[#0F5238] font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Media & Actions */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[32px] border border-[#E1E3E4] shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-[#191C1D] flex items-center gap-2">
                  <Store size={18} className="text-[#0F5238]" />
                  Store Branding
                </h3>

                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoChange}
                  accept="image/*"
                  className="hidden"
                />

                <div 
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-full aspect-square rounded-[32px] bg-[#F3F4F5] border-2 border-dashed border-[#E1E3E4] overflow-hidden flex items-center justify-center text-[#707973]">
                    {vendorData?.logo ? (
                      <img src={vendorData.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Camera size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Logo Not Uploaded</p>
                      </div>
                    )}
                  </div>
                  <button 
                    type="button"
                    className="absolute bottom-4 right-4 p-4 bg-[#0F5238] text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <Camera size={20} />
                  </button>
                </div>
                
                <div className="pt-4 space-y-2">
                  <label className="text-xs font-bold text-[#707973] uppercase tracking-wider">Store Status</label>
                  <div className="flex items-center gap-3 bg-[#F3F4F5] p-2 rounded-2xl">
                    <button 
                      type="button"
                      onClick={() => setVendorData({...vendorData, isActive: true})}
                      className={`flex-1 py-3.5 rounded-xl font-bold text-xs transition-all ${vendorData?.isActive ? "bg-white text-[#0F5238] shadow-sm" : "text-[#707973]"}`}
                    >
                      OPEN
                    </button>
                    <button 
                      type="button"
                      onClick={() => setVendorData({...vendorData, isActive: false})}
                      className={`flex-1 py-3.5 rounded-xl font-bold text-xs transition-all ${!vendorData?.isActive ? "bg-white text-red-600 shadow-sm" : "text-[#707973]"}`}
                    >
                      CLOSED
                    </button>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#0F5238] text-white rounded-2xl font-black text-lg shadow-xl shadow-[#0F5238]/20 flex items-center justify-center gap-3 transition-all hover:opacity-90 active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                {loading ? "Saving Changes..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
