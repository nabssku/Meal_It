"use client";

import React, { useState } from "react";
import VendorTopBar from "@/components/vendor/VendorTopBar";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Minus, 
  Utensils, 
  Image as ImageIcon,
  Zap,
  Leaf,
  Beef,
  Scale,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addMenuItem } from "@/app/actions/vendor-actions";
import { useSession } from "next-auth/react";

export default function NewMenuItemPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    calories: "",
    protein: "",
    fat: "",
    carbs: "",
    category: "Hemat",
    stock: "50",
    image: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Find the user's vendorId first? Or we should have a session with vendorId.
      // For now, let's assume we can get it from the user session. 
      // Actually, I'll need a specialized action to get the vendorId based on userId.
      
      const res = await fetch("/api/vendor/id");
      const { vendorId } = await res.json();

      if (!vendorId) throw new Error("Vendor not found");

      await addMenuItem({
        vendorId,
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price),
        calories: parseInt(formData.calories),
        protein: parseInt(formData.protein),
        fat: parseInt(formData.fat || "0"),
        carbs: parseInt(formData.carbs || "0"),
        category: formData.category,
        stock: parseInt(formData.stock),
        image: formData.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
      });

      router.push("/vendor/menu");
    } catch (err: any) {
      setError(err.message || "Failed to add menu item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <VendorTopBar title="Add New Dish" />
      
      <main className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar">
        <div className="max-w-[1000px] mx-auto">
          {/* Back Button */}
          <Link href="/vendor/menu" className="inline-flex items-center gap-2 text-sm font-bold text-[#707973] hover:text-[#0F5238] transition-colors mb-8">
            <ArrowLeft size={18} />
            Back to Menu
          </Link>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-[32px] border border-[#E1E3E4] shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-[#191C1D] flex items-center gap-2">
                  <Utensils size={20} className="text-[#0F5238]" />
                  Basic Information
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#404943]">Dish Name</label>
                    <input 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Grilled Salmon Salad"
                      className="w-full px-5 py-3.5 bg-[#F3F4F5] border-none rounded-2xl focus:ring-2 focus:ring-[#0F5238] font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#404943]">Short Description</label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Describe the ingredients and taste..."
                      className="w-full px-5 py-3.5 bg-[#F3F4F5] border-none rounded-2xl focus:ring-2 focus:ring-[#0F5238] font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#404943]">Price (IDR)</label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#707973]">Rp</span>
                        <input 
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleChange}
                          required
                          placeholder="25000"
                          className="w-full pl-12 pr-5 py-3.5 bg-[#F3F4F5] border-none rounded-2xl focus:ring-2 focus:ring-[#0F5238] font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#404943]">Stock Available</label>
                      <input 
                        name="stock"
                        type="number"
                        value={formData.stock}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-[#F3F4F5] border-none rounded-2xl focus:ring-2 focus:ring-[#0F5238] font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Nutritional Info */}
              <div className="bg-white p-8 rounded-[32px] border border-[#E1E3E4] shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-[#191C1D] flex items-center gap-2">
                  <Zap size={20} className="text-[#0F5238]" />
                  Nutritional Breakdown
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2 text-center">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mx-auto mb-1">
                      <Zap size={20} />
                    </div>
                    <label className="text-[10px] font-black uppercase text-[#707973] tracking-widest block">Calories</label>
                    <input 
                      name="calories"
                      type="number"
                      value={formData.calories}
                      onChange={handleChange}
                      required
                      placeholder="0"
                      className="w-full px-2 py-2.5 bg-[#F3F4F5] border-none rounded-xl focus:ring-2 focus:ring-[#0F5238] font-black text-center"
                    />
                    <span className="text-[10px] font-bold text-[#707973]">kcal</span>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mx-auto mb-1">
                      <Beef size={20} />
                    </div>
                    <label className="text-[10px] font-black uppercase text-[#707973] tracking-widest block">Protein</label>
                    <input 
                      name="protein"
                      type="number"
                      value={formData.protein}
                      onChange={handleChange}
                      required
                      placeholder="0"
                      className="w-full px-2 py-2.5 bg-[#F3F4F5] border-none rounded-xl focus:ring-2 focus:ring-[#0F5238] font-black text-center"
                    />
                    <span className="text-[10px] font-bold text-[#707973]">grams</span>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mx-auto mb-1">
                      <Leaf size={20} />
                    </div>
                    <label className="text-[10px] font-black uppercase text-[#707973] tracking-widest block">Carbs</label>
                    <input 
                      name="carbs"
                      type="number"
                      value={formData.carbs}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full px-2 py-2.5 bg-[#F3F4F5] border-none rounded-xl focus:ring-2 focus:ring-[#0F5238] font-black text-center"
                    />
                    <span className="text-[10px] font-bold text-[#707973]">grams</span>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-1">
                      <Scale size={20} />
                    </div>
                    <label className="text-[10px] font-black uppercase text-[#707973] tracking-widest block">Fat</label>
                    <input 
                      name="fat"
                      type="number"
                      value={formData.fat}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full px-2 py-2.5 bg-[#F3F4F5] border-none rounded-xl focus:ring-2 focus:ring-[#0F5238] font-black text-center"
                    />
                    <span className="text-[10px] font-bold text-[#707973]">grams</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Media & Meta */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[32px] border border-[#E1E3E4] shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-[#191C1D] flex items-center gap-2">
                  <ImageIcon size={20} className="text-[#0F5238]" />
                  Food Photo
                </h3>

                <div 
                  className="w-full aspect-square rounded-3xl bg-[#F3F4F5] border-2 border-dashed border-[#E1E3E4] hover:bg-[#F8F9FA] hover:border-[#0F5238]/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 text-[#707973]"
                  onClick={() => {/* Mock upload */}}
                >
                  <div className="p-4 bg-white rounded-full shadow-sm">
                    <Plus className="text-[#0F5238]" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest">Click to upload</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#404943]">Image URL (Mockup)</label>
                  <input 
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-5 py-3 bg-[#F3F4F5] border-none rounded-xl focus:ring-2 focus:ring-[#0F5238] font-medium text-xs text-[#707973]"
                  />
                </div>
              </div>

              <div className="bg-white p-8 rounded-[32px] border border-[#E1E3E4] shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-[#191C1D]">Meta Settings</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#404943]">Category Tag</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-[#F3F4F5] border-none rounded-xl focus:ring-2 focus:ring-[#0F5238] font-bold text-sm"
                    >
                      <option>Hemat</option>
                      <option>Diet</option>
                      <option>Bulking</option>
                      <option>High Protein</option>
                      <option>Vegetarian</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-[#0F5238] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#0F5238]/20 flex items-center justify-center gap-3 transition-all hover:opacity-90 active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Save size={22} />
                      Save Dish
                    </>
                  )}
                </button>
                
                {error && <p className="text-xs font-bold text-red-600 text-center mt-2">{error}</p>}
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
