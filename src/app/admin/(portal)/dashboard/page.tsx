"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Store, 
  Utensils, 
  CreditCard, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  UserCheck, 
  Search, 
  Sliders, 
  Settings, 
  Sparkles,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { 
  getAdminMetrics, 
  getAdminVendors, 
  toggleVendorVerification, 
  updateVendorPlan, 
  deleteVendor, 
  getAdminUsers, 
  updateUserRole, 
  deleteUser, 
  getAdminMenus, 
  toggleMenuAvailability, 
  deleteMenu, 
  getAdminUserAiPreferences, 
  updateUserAiPreferences 
} from "@/app/actions/admin-actions";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "vendors" | "users" | "menus" | "ai">("overview");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Data States
  const [metrics, setMetrics] = useState<any>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [aiPrefs, setAiPrefs] = useState<any[]>([]);

  // AI Edit Modal State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [aiForm, setAiForm] = useState({
    dailyBudget: 50000,
    bodyGoal: "healthy_life",
    allergies: [] as string[],
    preferences: [] as string[]
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, v, u, mn, ai] = await Promise.all([
        getAdminMetrics(),
        getAdminVendors(),
        getAdminUsers(),
        getAdminMenus(),
        getAdminUserAiPreferences()
      ]);
      setMetrics(m);
      setVendors(v);
      setUsers(u);
      setMenus(mn);
      setAiPrefs(ai);
    } catch (err) {
      console.error("Gagal memuat data superadmin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Vendor Handlers
  const handleToggleVerify = async (vendorId: string, current: boolean) => {
    try {
      await toggleVendorVerification(vendorId, current);
      loadData();
    } catch (err: any) {
      alert("Gagal memperbarui verifikasi: " + err.message);
    }
  };

  const handleUpdatePlan = async (vendorId: string, plan: string) => {
    try {
      await updateVendorPlan(vendorId, plan);
      loadData();
    } catch (err: any) {
      alert("Gagal memperbarui plan: " + err.message);
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus vendor ini? Ini akan mematikan portal vendor mereka.")) return;
    try {
      await deleteVendor(vendorId);
      loadData();
    } catch (err: any) {
      alert("Gagal menghapus vendor: " + err.message);
    }
  };

  // User Handlers
  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await updateUserRole(userId, role);
      loadData();
    } catch (err: any) {
      alert("Gagal memperbarui role: " + err.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) return;
    try {
      await deleteUser(userId);
      loadData();
    } catch (err: any) {
      alert("Gagal menghapus user: " + err.message);
    }
  };

  // Menu Handlers
  const handleToggleMenu = async (menuId: string, current: boolean) => {
    try {
      await toggleMenuAvailability(menuId, current);
      loadData();
    } catch (err: any) {
      alert("Gagal memperbarui ketersediaan menu: " + err.message);
    }
  };

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus menu ini?")) return;
    try {
      await deleteMenu(menuId);
      loadData();
    } catch (err: any) {
      alert("Gagal menghapus menu: " + err.message);
    }
  };

  // AI preference handlers
  const handleEditAiClick = (user: any) => {
    setEditingUser(user);
    setAiForm({
      dailyBudget: user.dailyBudget || 50000,
      bodyGoal: user.bodyGoal || "healthy_life",
      allergies: user.allergies || [],
      preferences: user.preferences || []
    });
  };

  const handleUpdateAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateUserAiPreferences(editingUser.id, aiForm);
      setEditingUser(null);
      loadData();
    } catch (err: any) {
      alert("Gagal memperbarui preferensi AI: " + err.message);
    }
  };

  if (loading) return (
    <div className="flex-1 h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-[#0F5238] w-12 h-12" />
    </div>
  );

  // Search Filter Functions
  const filteredVendors = vendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase()));
  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
  const filteredMenus = menus.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.vendor.name.toLowerCase().includes(search.toLowerCase()));
  const filteredAi = aiPrefs.filter(a => a.name?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto pb-20">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#191C1D]">Superadmin Console</h2>
          <p className="text-[#707973] font-medium mt-1">Sistem manajemen ekosistem, verifikasi vendor, dan konfigurasi AI Mealit.</p>
        </div>
        
        {/* Tab Selection */}
        <div className="flex bg-white border border-[#E1E3E4] p-1.5 rounded-2xl shadow-sm self-start">
          <button 
            onClick={() => { setActiveTab("overview"); setSearch(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "overview" ? "bg-[#0F5238] text-white shadow-sm" : "text-[#707973] hover:text-[#0F5238]"}`}
          >
            Overview
          </button>
          <button 
            onClick={() => { setActiveTab("vendors"); setSearch(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "vendors" ? "bg-[#0F5238] text-white shadow-sm" : "text-[#707973] hover:text-[#0F5238]"}`}
          >
            Vendors
          </button>
          <button 
            onClick={() => { setActiveTab("users"); setSearch(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "users" ? "bg-[#0F5238] text-white shadow-sm" : "text-[#707973] hover:text-[#0F5238]"}`}
          >
            Users
          </button>
          <button 
            onClick={() => { setActiveTab("menus"); setSearch(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "menus" ? "bg-[#0F5238] text-white shadow-sm" : "text-[#707973] hover:text-[#0F5238]"}`}
          >
            Menus
          </button>
          <button 
            onClick={() => { setActiveTab("ai"); setSearch(""); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "ai" ? "bg-[#0F5238] text-white shadow-sm" : "text-[#707973] hover:text-[#0F5238]"}`}
          >
            AI Config
          </button>
        </div>
      </div>

      {/* Global Search Input */}
      {activeTab !== "overview" && (
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707973]" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Cari berdasarkan nama atau filter...`}
            className="w-full pl-11 pr-5 py-3 bg-white border border-[#E1E3E4] rounded-2xl text-sm font-semibold shadow-sm focus:ring-2 focus:ring-[#0F5238] focus:border-transparent outline-none"
          />
        </div>
      )}

      {/* Overview Dashboard Tab */}
      {activeTab === "overview" && metrics && (
        <div className="space-y-8">
          {/* Metrics cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E1E3E4] shadow-sm flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#707973] uppercase tracking-wider">Total User Terdaftar</span>
                <h3 className="text-3xl font-black text-[#191C1D]">{metrics.totalUsers}</h3>
              </div>
              <div className="p-4 bg-green-50 text-[#0F5238] rounded-2xl">
                <Users size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E1E3E4] shadow-sm flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#707973] uppercase tracking-wider">Vendor Aktif</span>
                <h3 className="text-3xl font-black text-[#191C1D]">{metrics.totalVendors}</h3>
              </div>
              <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
                <Store size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E1E3E4] shadow-sm flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#707973] uppercase tracking-wider">Total Menu</span>
                <h3 className="text-3xl font-black text-[#191C1D]">{metrics.totalMenus}</h3>
              </div>
              <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
                <Utensils size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E1E3E4] shadow-sm flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#707973] uppercase tracking-wider">Pendapatan Premium</span>
                <h3 className="text-3xl font-black text-[#191C1D]">Rp {metrics.totalRevenue.toLocaleString()}</h3>
                <p className="text-[10px] font-bold text-[#707973]">Dari {metrics.totalSubscriptions} Transaksi</p>
              </div>
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                <CreditCard size={24} />
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-6 bg-[#0F5238] text-white rounded-3xl flex items-center gap-4 shadow-md shadow-[#0F5238]/10">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Sparkles size={24} />
            </div>
            <div>
              <h4 className="font-bold text-base">Sistem AI Meal Planner Aktif</h4>
              <p className="text-xs text-white/80 mt-0.5">Semua data menu yang dikelola superadmin akan secara real-time masuk ke dalam prioritas prompt AI Gemini untuk menyusun rekomendasi sehat bagi user.</p>
            </div>
          </div>
        </div>
      )}

      {/* Vendors Management Tab */}
      {activeTab === "vendors" && (
        <div className="bg-white rounded-3xl border border-[#E1E3E4] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F3F4F5] border-b border-[#E1E3E4]">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Owner Email</th>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Verifikasi</th>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEEEF]">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#707973] font-medium italic">
                    Tidak ada data vendor ditemukan.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-[#0F5238]">
                          {v.logo ? (
                            <img src={v.logo} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            v.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#191C1D]">{v.name}</p>
                          <p className="text-[10px] font-bold text-[#707973]">Menus: {v._count.menus}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#404943]">{v.user.email}</td>
                    <td className="px-6 py-4 text-sm text-[#404943]">{v.category || "Regular"}</td>
                    <td className="px-6 py-4">
                      <select 
                        value={v.plan}
                        onChange={(e) => handleUpdatePlan(v.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:ring-1 focus:ring-[#0F5238] ${v.plan === "PREMIUM" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-700 border-gray-200"}`}
                      >
                        <option value="FREE">FREE</option>
                        <option value="PREMIUM">PREMIUM</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleVerify(v.id, v.isVerified)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          v.isVerified 
                            ? "bg-green-50 text-green-700 border border-green-200" 
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {v.isVerified ? (
                          <>
                            <CheckCircle2 size={12} />
                            Verified
                          </>
                        ) : (
                          <>
                            <XCircle size={12} />
                            Pending
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDeleteVendor(v.id)}
                        className="p-2 text-[#707973] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === "users" && (
        <div className="bg-white rounded-3xl border border-[#E1E3E4] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F3F4F5] border-b border-[#E1E3E4]">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEEEF]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#707973] font-medium italic">
                    Tidak ada data user ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-[#0F5238]">
                          {u.image ? (
                            <img src={u.image} alt="User Avatar" className="w-full h-full object-cover" />
                          ) : (
                            u.name?.substring(0, 2).toUpperCase() || "US"
                          )}
                        </div>
                        <span className="text-sm font-bold text-[#191C1D]">{u.name || "Sobat Mealit"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#404943]">{u.email}</td>
                    <td className="px-6 py-4">
                      <select 
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:ring-1 focus:ring-[#0F5238] ${
                          u.role === "admin" 
                            ? "bg-red-50 text-red-700 border-red-200" 
                            : u.role === "vendor"
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        <option value="user">USER</option>
                        <option value="vendor">VENDOR</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 text-[#707973] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Menus Management Tab */}
      {activeTab === "menus" && (
        <div className="bg-white rounded-3xl border border-[#E1E3E4] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F3F4F5] border-b border-[#E1E3E4]">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Menu</th>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Harga</th>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Kalori & Protein</th>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Ketersediaan</th>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEEEF]">
              {filteredMenus.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#707973] font-medium italic">
                    Tidak ada menu ditemukan.
                  </td>
                </tr>
              ) : (
                filteredMenus.map((m) => (
                  <tr key={m.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold">
                          {m.image ? (
                            <img src={m.image} alt="Menu" className="w-full h-full object-cover" />
                          ) : (
                            <Utensils size={18} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#191C1D]">{m.name}</p>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#0F5238] bg-green-50 px-2 py-0.5 rounded-full">{m.category || "General"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#404943]">{m.vendor.name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#191C1D]">Rp {m.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-[#191C1D]">{m.calories} kkal</p>
                      <p className="text-[10px] text-[#707973]">Protein: {m.protein}g</p>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleMenu(m.id, m.isAvailable)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          m.isAvailable 
                            ? "bg-green-50 text-green-700 border border-green-200" 
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {m.isAvailable ? "Tersedia" : "Kosong"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDeleteMenu(m.id)}
                        className="p-2 text-[#707973] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* User AI Preference Management Tab */}
      {activeTab === "ai" && (
        <div className="bg-white rounded-3xl border border-[#E1E3E4] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F3F4F5] border-b border-[#E1E3E4]">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Goal & Budget</th>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Alergi & Preferensi</th>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Fisik (G/A/H/W)</th>
                <th className="px-6 py-4 text-xs font-bold text-[#707973] uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEEEF]">
              {filteredAi.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#707973] font-medium italic">
                    Tidak ada data pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                filteredAi.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[#191C1D]">{user.name || "Sobat Mealit"}</p>
                      <p className="text-[10px] text-[#707973]">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-[#191C1D] uppercase">{user.bodyGoal?.replace("_", " ") || "Belum diset"}</p>
                      <p className="text-xs font-bold text-[#0F5238]">Rp {user.dailyBudget?.toLocaleString() || "50.000"} /hari</p>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Alergi:</span>
                        {user.allergies && user.allergies.length > 0 ? (
                          user.allergies.map((a: string) => (
                            <span key={a} className="bg-red-50 text-red-700 text-[8px] px-1.5 py-0.5 rounded font-bold">{a}</span>
                          ))
                        ) : (
                          <span className="text-[8px] text-gray-400 font-bold italic">Nihil</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Preferensi:</span>
                        {user.preferences && user.preferences.length > 0 ? (
                          user.preferences.map((p: string) => (
                            <span key={p} className="bg-[#B0F1CC] text-[#002113] text-[8px] px-1.5 py-0.5 rounded font-bold">{p}</span>
                          ))
                        ) : (
                          <span className="text-[8px] text-gray-400 font-bold italic">Nihil</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-[#404943]">
                      {user.gender === "male" ? "L" : user.gender === "female" ? "P" : "-"} / {user.age || "-"} th / {user.height || "-"} cm / {user.weight || "-"} kg
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleEditAiClick(user)}
                        className="flex items-center gap-1 text-xs font-bold text-[#0F5238] hover:underline"
                      >
                        <Settings size={12} />
                        Edit AI
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Edit Preference Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-8 space-y-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-[#191C1D] flex items-center gap-2">
              <Sparkles className="text-[#0F5238]" size={20} />
              Edit AI Prefs: {editingUser.name || "User"}
            </h3>

            <form onSubmit={handleUpdateAi} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#404943]">Budget Harian (IDR)</label>
                <input 
                  type="number"
                  value={aiForm.dailyBudget}
                  onChange={(e) => setAiForm({ ...aiForm, dailyBudget: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#F3F4F5] border-none rounded-xl text-sm font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#404943]">Target Tubuh (Goal)</label>
                <select 
                  value={aiForm.bodyGoal}
                  onChange={(e) => setAiForm({ ...aiForm, bodyGoal: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F3F4F5] border-none rounded-xl text-sm font-bold"
                >
                  <option value="healthy_life">Healthy Life</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="budget_healthy">Budget Healthy</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#404943]">Alergi Makanan (Koma terpisah)</label>
                <input 
                  type="text"
                  placeholder="e.g. Seafood, Kacang"
                  value={aiForm.allergies.join(", ")}
                  onChange={(e) => setAiForm({ ...aiForm, allergies: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  className="w-full px-4 py-3 bg-[#F3F4F5] border-none rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#404943]">Preferensi Diet (Koma terpisah)</label>
                <input 
                  type="text"
                  placeholder="e.g. Tinggi Protein, Rendah Karbo"
                  value={aiForm.preferences.join(", ")}
                  onChange={(e) => setAiForm({ ...aiForm, preferences: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  className="w-full px-4 py-3 bg-[#F3F4F5] border-none rounded-xl text-sm"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-[#0F5238] text-white font-bold rounded-xl text-sm transition-all"
                >
                  Simpan AI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
