"use client";

import { useState } from "react";
import { Brain, Save, Sliders, Target, Utensils, Wallet, AlertTriangle } from "lucide-react";

const defaultConfig = {
  model: "llama3-8b-8192",
  maxBudget: 150000,
  minCalories: 1200,
  maxCalories: 3000,
  mealTypes: ["Sarapan", "Makan Siang", "Makan Malam"],
  preferLocalFood: true,
  includeSnacks: false,
  systemPrompt: "Kamu adalah asisten perencanaan makanan sehat dan terjangkau. Rekomendasikan menu yang bergizi, sesuai budget, dan mudah didapat di Indonesia.",
};

export default function AdminAIPreferencesPage() {
  const [config, setConfig] = useState(defaultConfig);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#191C1D]">Preferensi AI</h2>
          <p className="text-[#707973] text-sm font-medium mt-1">Konfigurasi model AI untuk rekomendasi makanan pengguna</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#0F5238] text-white font-bold px-5 py-2.5 rounded-2xl hover:bg-[#0d4530] active:scale-95 transition-all text-sm"
        >
          <Save size={16} />
          {saved ? "Tersimpan!" : "Simpan"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Model Config */}
        <div className="bg-white rounded-3xl border border-[#E1E3E4] p-6 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <Brain size={18} />
            </div>
            <h3 className="font-bold text-[#191C1D]">Model AI</h3>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#404943]">Model</label>
            <select
              value={config.model}
              onChange={e => setConfig({...config, model: e.target.value})}
              className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E1E3E4] rounded-xl text-sm font-medium text-[#191C1D] focus:outline-none focus:ring-2 focus:ring-[#0F5238]/30"
            >
              <option value="llama3-8b-8192">Llama 3 8B (Cepat)</option>
              <option value="llama3-70b-8192">Llama 3 70B (Akurat)</option>
              <option value="mixtral-8x7b-32768">Mixtral 8x7B (Seimbang)</option>
              <option value="gemma-7b-it">Gemma 7B</option>
            </select>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-white rounded-3xl border border-[#E1E3E4] p-6 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <Wallet size={18} />
            </div>
            <h3 className="font-bold text-[#191C1D]">Batas Budget</h3>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#404943] mb-2">
              Maksimum Budget Harian: <span className="text-[#0F5238]">Rp {config.maxBudget.toLocaleString("id-ID")}</span>
            </label>
            <input
              type="range"
              min={30000}
              max={500000}
              step={10000}
              value={config.maxBudget}
              onChange={e => setConfig({...config, maxBudget: Number(e.target.value)})}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-full accent-[#0F5238]"
            />
            <div className="flex justify-between text-xs text-[#707973] mt-1">
              <span>Rp 30.000</span><span>Rp 500.000</span>
            </div>
          </div>
        </div>

        {/* Calories */}
        <div className="bg-white rounded-3xl border border-[#E1E3E4] p-6 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
              <Target size={18} />
            </div>
            <h3 className="font-bold text-[#191C1D]">Kalori Harian</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#707973] mb-1.5">Minimum (kcal)</label>
              <input
                type="number"
                value={config.minCalories}
                onChange={e => setConfig({...config, minCalories: Number(e.target.value)})}
                className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E1E3E4] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F5238]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#707973] mb-1.5">Maksimum (kcal)</label>
              <input
                type="number"
                value={config.maxCalories}
                onChange={e => setConfig({...config, maxCalories: Number(e.target.value)})}
                className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E1E3E4] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F5238]/30"
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="bg-white rounded-3xl border border-[#E1E3E4] p-6 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Sliders size={18} />
            </div>
            <h3 className="font-bold text-[#191C1D]">Opsi Lain</h3>
          </div>
          <div className="space-y-3">
            {[
              { key: "preferLocalFood", label: "Prioritaskan Makanan Lokal" },
              { key: "includeSnacks", label: "Sertakan Snack/Camilan" },
            ].map(opt => (
              <div 
                key={opt.key} 
                onClick={() => setConfig({...config, [opt.key]: !(config as any)[opt.key]})}
                className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-[#F8F9FA] transition-colors"
              >
                <span className="text-sm font-semibold text-[#191C1D]">{opt.label}</span>
                <div
                  className={`relative w-11 h-6 rounded-full transition-colors ${(config as any)[opt.key] ? "bg-[#0F5238]" : "bg-[#D0D5DD]"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${(config as any)[opt.key] ? "translate-x-6" : "translate-x-1"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Prompt */}
      <div className="bg-white rounded-3xl border border-[#E1E3E4] p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0F5238]/10 rounded-xl flex items-center justify-center text-[#0F5238]">
            <Brain size={18} />
          </div>
          <div>
            <h3 className="font-bold text-[#191C1D]">System Prompt</h3>
            <p className="text-xs text-[#707973]">Instruksi dasar untuk AI meal planner</p>
          </div>
        </div>
        <textarea
          rows={4}
          value={config.systemPrompt}
          onChange={e => setConfig({...config, systemPrompt: e.target.value})}
          className="w-full px-4 py-3 bg-[#F8F9FA] border border-[#E1E3E4] rounded-2xl text-sm font-medium text-[#191C1D] resize-none focus:outline-none focus:ring-2 focus:ring-[#0F5238]/30"
        />
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl">
          <AlertTriangle size={13} />
          <span className="font-medium">Perubahan system prompt akan berpengaruh pada semua rekomendasi AI baru.</span>
        </div>
      </div>
    </div>
  );
}
