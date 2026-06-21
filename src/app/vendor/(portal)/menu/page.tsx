import React from "react";
import VendorTopBar from "@/components/vendor/VendorTopBar";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Zap,
  Leaf,
  Beef,
  Scale,
  Utensils,
  Sun,
  Sunset,
  Moon
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteMenuButton from "@/components/vendor/DeleteMenuButton";

export default async function VendorMenuPage() {
  const session = await auth();
  
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { vendor: { include: { menus: true } } }
  });

  const menus = user?.vendor?.menus || [];

  return (
    <>
      <VendorTopBar title="Menu Management" />
      
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 hide-scrollbar">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-[500px]">
            <h2 className="text-3xl font-bold text-[#191C1D]">Your Kitchen Menu</h2>
            <p className="text-[#707973] font-medium mt-1">Add, edit, or remove dishes from your catalogue. Ensure nutritional info is accurate for our users.</p>
          </div>
          <Link 
            href="/vendor/menu/new" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0F5238] text-white rounded-2xl font-bold transition-all hover:shadow-lg active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} />
            <span>Add New Item</span>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex bg-white p-1 rounded-2xl border border-[#E1E3E4] w-full md:w-auto">
            <button className="px-5 py-2 bg-[#F3F4F5] text-[#0F5238] font-bold rounded-xl text-sm">All Dishes</button>
            <button className="px-5 py-2 text-[#707973] font-bold text-sm hover:text-[#0F5238]">Active</button>
            <button className="px-5 py-2 text-[#707973] font-bold text-sm hover:text-[#0F5238]">Drafts</button>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707973] w-5 h-5 transition-colors group-focus-within:text-[#0F5238]" />
            <input 
              type="text" 
              placeholder="Search in menu..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#E1E3E4] rounded-2xl focus:ring-2 focus:ring-[#0F5238] focus:border-transparent text-sm font-medium transition-all"
            />
          </div>
        </div>

        {/* Menu Items Table/List */}
        <div className="bg-white rounded-[32px] border border-[#E1E3E4] overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-[#F8F9FA] border-b border-[#E1E3E4]">
              <tr>
                <th className="px-8 py-5 text-xs font-bold text-[#707973] uppercase tracking-wider">Food Dish</th>
                <th className="px-8 py-5 text-xs font-bold text-[#707973] uppercase tracking-wider">Waktu Makan</th>
                <th className="px-8 py-5 text-xs font-bold text-[#707973] uppercase tracking-wider">Nutrition Info</th>
                <th className="px-8 py-5 text-xs font-bold text-[#707973] uppercase tracking-wider">Price</th>
                <th className="px-8 py-5 text-xs font-bold text-[#707973] uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-[#707973] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEEEF]">
              {menus.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-[#F3F4F5] rounded-full flex items-center justify-center text-[#707973] mb-4">
                        <Utensils size={32} />
                      </div>
                      <h4 className="text-lg font-bold text-[#191C1D]">No items found</h4>
                      <p className="text-[#707973] mt-1 mb-6">Start building your menu to reach customers.</p>
                      <Link href="/vendor/menu/new" className="text-[#0F5238] font-bold hover:underline">Add your first dish</Link>
                    </div>
                  </td>
                </tr>
              ) : (
                menus.map((dish) => (
                  <tr key={dish.id} className="hover:bg-[#F8F9FA] transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#F3F4F5] overflow-hidden flex-shrink-0 border border-[#E1E3E4]">
                          {dish.image ? (
                            <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#707973]">
                              <Utensils size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#191C1D] text-lg">{dish.name}</p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {dish.tags.map((tag) => (
                              <span key={tag} className="bg-[#B0F1CC] text-[#002113] text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">{tag}</span>
                            ))}
                            {dish.stock !== null && (
                              <span className="bg-[#F3F4F5] text-[#404943] text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                                {dish.stock} left
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {dish.category === "sarapan" && (
                        <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-xs font-bold">
                          <Sun size={13} />
                          Sarapan
                        </div>
                      )}
                      {dish.category === "makan-siang" && (
                        <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-xs font-bold">
                          <Sunset size={13} />
                          Makan Siang
                        </div>
                      )}
                      {dish.category === "makan-malam" && (
                        <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full text-xs font-bold">
                          <Moon size={13} />
                          Makan Malam
                        </div>
                      )}
                      {!dish.category || !["sarapan","makan-siang","makan-malam"].includes(dish.category) ? (
                        <span className="text-xs text-[#707973] font-medium">—</span>
                      ) : null}
                    </td>
                    <td className="px-8 py-6">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        <div className="flex items-center gap-1.5">
                          <Zap size={14} className="text-orange-500" />
                          <span className="text-xs font-bold text-[#404943]">{dish.calories} kcal</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Beef size={14} className="text-red-500" />
                          <span className="text-xs font-bold text-[#404943]">{dish.protein}g protein</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Leaf size={14} className="text-green-500" />
                          <span className="text-xs font-bold text-[#404943]">{dish.carbs || 0}g carbs</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Scale size={14} className="text-blue-500" />
                          <span className="text-xs font-bold text-[#404943]">{dish.fat || 0}g fat</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-lg font-black text-[#191C1D]">Rp {dish.price.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {dish.isAvailable ? (
                          <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs uppercase tracking-wider">
                            <CheckCircle2 size={16} />
                            <span>Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-500 font-bold text-xs uppercase tracking-wider">
                            <XCircle size={16} />
                            <span>Disabled</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/vendor/menu/edit/${dish.id}`} className="p-2 text-[#707973] hover:text-[#0F5238] hover:bg-[#B0F1CC]/20 rounded-xl transition-all">
                          <Edit3 size={20} />
                        </Link>
                        <DeleteMenuButton menuId={dish.id} menuName={dish.name} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
